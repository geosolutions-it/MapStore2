/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { includes, merge } = require('lodash');
const { compose, withProps, createEventHandler, withHandlers, withStateHandlers, defaultProps } = require('recompose');
const { getLayerJSONFeature, describeFeatureType } = require('../../../observables/wfs');
const { getCurrentPaginationOptions, updatePages } = require('../../../utils/FeatureGridUtils');
const { getFeatureTypeProperties } = require('../../../utils/ogc/WFS/base');
const propsStreamFactory = require('../../misc/enhancers/propsStreamFactory');
const Rx = require('rxjs');

const sameFilter = (f1, f2) => f1 === f2;
const sameOptions = (o1 = {}, o2 = {}) =>
    o1.propertyName === o2.propertyName;
const sameSortOptions = (o1 = {}, o2 = {}) =>
    o1.sortBy === o2.sortBy
    && o1.sortOrder === o2.sortOrder;
const getLayerUrl = l => l && l.wpsUrl || (l.search && l.search.url) || l.url;

const configureDataRetrieve = ($props) =>
    $props.filter(({ layer = {}, options }) => layer.name && options)
        .distinctUntilChanged(
            ({ layer = {}, options = {}, filter, sortOptions }, newProps) =>
                getLayerUrl(layer) === getLayerUrl(layer)
                && (newProps.layer && layer.name === newProps.layer.name)
                && sameOptions(options, newProps.options)
                && sameFilter(filter, newProps.filter)
                && sameSortOptions(sortOptions, newProps.sortOptions))
        // when one of the items above changed invalidates cache for before the next request
        .map((props) => ({
            ...props,
            features: [],
            pages: [],
            pagination: {}
        }));
/**
 * Get data all in one request.
 * @param {Observable} props$ stream of props
 */
const singlePageDataStream = props$ => props$.switchMap(
    ({
        layer = {},
        options,
        filter,
        onLoad = () => { },
        onLoadError = () => { }
    }) =>
        getLayerJSONFeature(layer, filter, {
            timeout: 15000,
            params: { propertyName: options.propertyName }
            // TODO totalFeatures
            // TODO sortOptions - default
        })
            .map(() => ({
                loading: false,
                error: undefined

            })).do(data => onLoad({
                features: data.features,
                pagination: {
                    totalFeatures: data.totalFeatures
                }
            }))
            .catch((e) => Rx.Observable.of({
                loading: false,
                error: e,
                data: []
            }).do(onLoadError))
);

/**
 * Retrives data on scroll.
 * @param {Observable} pages$ the stream of virtual scroll pages requests
 * @returns a function that can be merged with stream of
 * props to retrieve data using virtual scroll.
 */
const virtualScrollDataStream = pages$ => props$ => props$.switchMap(({
            layer = {},
            size = 20,
            maxStoredPages = 5,
            filter,
            options = {},
            pages,
            features = [],
            onLoad = () => { },
            onLoadError = () => { }
}) => pages$.switchMap(({pagesRange, pagination = {}}, {}) => getLayerJSONFeature(layer, filter, {
        ...getCurrentPaginationOptions(pagesRange, pages, size),
        timeout: 15000,
        totalFeatures: pagination.totalFeatures, // this is needed to allow workaround of GEOS-7233
        propertyName: options.propertyName
        // TODO: defaultSortOptions - to skip primary-key issues
    })
    .do(data => onLoad({
        ...updatePages(data, pagesRange, { pages, features }, { ...getCurrentPaginationOptions(pagesRange, pages, size), size, maxStoredPages }),
        pagination: {
            totalFeatures: data.totalFeatures
        }
    }))
    .map(() => ({
        loading: false
    }))
    .catch((e) => Rx.Observable.of({
        loading: false,
        error: e
    }).do(onLoadError))
    .startWith({
        loading: true
    })
));
const fetchDataStream = (props$, pages$, virtualScroll = true) =>
    configureDataRetrieve(props$)
    .let(virtualScroll
        ? virtualScrollDataStream(
            pages$.withLatestFrom(
                props$
                    // get latest options needed
                    .map(({pagination = {}} = {}) => ({
                        pagination
                    })), // pagination is needed to allow workaround of GEOS-7233
                (pagesRange, otherOptions) => ({
                    pagesRange,
                    ...otherOptions
                })
            )
        )
        : singlePageDataStream
    )
    .startWith({});
const describeStream = props$ =>
    props$
        .distinctUntilChanged(({ layer: layer1 } = {}, { layer: layer2 } = {}) => getLayerUrl(layer1) === getLayerUrl(layer2))
        .switchMap(({ layer } = {}) => describeFeatureType({ layer })
            .map(r => ({ describeFeatureType: r.data, loading: false, error: undefined })))
        .catch(error => Rx.Observable.of({
            loading: false,
            error
        }));

const dataStreamFactory = ($props) => {
    const {handler, stream: pages$ } = createEventHandler();
    return describeStream($props)
        .combineLatest(
            fetchDataStream($props, pages$.startWith({startPage: 0, endPage: 1})),
            (p1, p2) => ({
                ...p1,
                ...p2,
                pageEvents: {
                    moreFeatures: handler,
                    onPageChange: () => {}
                }
            })
        )
        .startWith({loading: true});
};

/**
 * enhances a FeatureGrid to connect to WFS services
 * of a layer and use virtualScroll.
 * Manages propertyNames to manage columns and support WFS Filters
*/
module.exports = compose(
    defaultProps({
        virtualScroll: true,
        size: 20,
        maxStoredPages: 5
    }),
    withStateHandlers({
        pages: [],
        features: [],
        pagination: {}
    }, {
        setData: () => ({pages, features, pagination} = {}) => ({
            pages,
            features,
            pagination,
            error: undefined
        })
    }),
    withHandlers({
        onLoad: ({ setData = () => {}, onLoad = () => {}} = {}) => (...args) => {
            setData(...args);
            onLoad(...args);
        }
    }),
    withProps(() => ({
        dataStreamFactory
    })),
    propsStreamFactory,
    // handle propertyNames and columnOptions
    withProps(({ options = {}, describeFeatureType: dft, columnSettings = {} } = {}) => ({
        columnSettings: merge(
            dft ?
                getFeatureTypeProperties(dft)
                    .filter(p => !includes(options.propertyName || [], p.name))
                    .reduce((acc, p) => ({
                        ...acc,
                        [p.name]: {
                        hide: true
                    }
                    }), {}) : {},
            options.columnSettings || {},
            columnSettings)
    }))
);
