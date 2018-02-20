/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { compose, withProps, createEventHandler, withHandlers, withStateHandlers, defaultProps } = require('recompose');
const { getLayerJSONFeature, describeFeatureType } = require('../../../observables/wfs');
const { getCurrentPaginationOptions, updatePages } = require('../../../utils/FeatureGridUtils');
const propsStreamFactory = require('../../misc/enhancers/propsStreamFactory');
const Rx = require('rxjs');

const sameFilter = (f1, f2) => f1 === f2;
const sameOptions = (o1 = {}, o2 = {}) =>
    o1.propertyName === o2.propertyName;

const getLayerUrl = l => l && l.wpsUrl || (l.search && l.search.url) || l.url;

const configureDataRetrieve = ($props) =>
    $props.filter(({ layer = {}, options }) => layer.name && options)
        .distinctUntilChanged(
            ({ layer = {}, options = {}, filter }, newProps) =>
                getLayerUrl(layer) === getLayerUrl(layer)
                && (newProps.layer && layer.name === newProps.layer.name)
                && sameOptions(options, newProps.options)
                && sameFilter(filter, newProps.filter));
/**
 * get data all in one request.
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
            .map((data) => ({
                loading: false,
                error: undefined,
                features: data.features,
                pagination: {
                    totalFeatures: data.totalFeatures
                }
            })).do(onLoad)
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
            options,
            filter,
            pages,
            features = [],
            onLoad = () => { },
            onLoadError = () => { }
}) => pages$.switchMap(pagesRange => getLayerJSONFeature(layer, filter, {
        ...getCurrentPaginationOptions(pagesRange, pages, size),
            timeout: 15000,
            params: { propertyName: options.propertyName }
            //TODO: manage no primary key issues
        // TODO totalFeatures
        // TODO sortOptions - default
    }).do(data => onLoad(updatePages(data, pagesRange, { pages, features }, { ...getCurrentPaginationOptions(pagesRange, pages, size), size, maxStoredPages })))
    .map( ({result = {}} = {}) => ({
        pagination: {totalFeatures: result.totalFeatures}
    }))
    .catch((e) => Rx.Observable.of({
        loading: false,
        error: e,
        data: []
    }).do(onLoadError))
    ));
const dataRetrieveStream = (props$, pages$, virtualScroll = true) =>
    configureDataRetrieve(props$)
    .let(virtualScroll
        ? virtualScrollDataStream(pages$)
        : singlePageDataStream
    )
    .startWith({});
const describeStream = props$ =>
    props$
        .distinctUntilChanged(({ layer: layer1 } = {}, { layer: layer2 } = {}) => getLayerUrl(layer1) === getLayerUrl(layer2))
        .switchMap(({ layer } = {}) => describeFeatureType({ layer })
            .map(r => ({ describeFeatureType: r.data, loading: false })))
        .catch(error => Rx.Observable.of({
            loading: false,
            error
        }));

const dataStreamFactory = ($props) => {
    const {handler, stream: pages$ } = createEventHandler();
    return describeStream($props)
        .combineLatest(
            dataRetrieveStream($props, pages$.startWith({startPage: 0, endPage: 1})),
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
module.exports = compose(
    defaultProps({
        virtualScroll: true,
        size: 20,
        maxStoredPages: 5
    }),
    withStateHandlers({
        pages: [],
        features: []
    }, {
        setData: () => ({pages, features} = {}) => ({
            pages,
            features
        })
    }),
    withHandlers({
        onLoad: ({ setData = () => {}, onLoad = () => {}} = {}) => ({pages, features} = {}) => {
            setData({pages, features});
            onLoad({pages, features});
        }
    }),
    withProps(() => ({
        dataStreamFactory
    })),
    propsStreamFactory
);
