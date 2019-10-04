/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const {isArray} = require('lodash');
const PagedComboboxWithFeatures = require('./combobox/PagedComboboxWithFeatures');
const {generateTemplateString} = require('../../utils/TemplateUtils');
const {setObservableConfig, mapPropsStreamWithConfig, compose, withStateHandlers, withPropsOnChange, withHandlers} = require('recompose');
const rxjsConfig = require('recompose/rxjsObservableConfig').default;

const {escapeCQLStrings} = require('../../utils/FilterUtils');

setObservableConfig(rxjsConfig);
const mapPropsStream = mapPropsStreamWithConfig(rxjsConfig);

// fetch data from wps service
const streamEnhancer = mapPropsStream(props$ => {
    let fetcherStream = props$.take(1).switchMap(p => {
        return p.autocompleteStreamFactory(props$);
    });
    return fetcherStream.combineLatest(props$, (data, props) => ({
        ...props,
        data: isArray(data && data.fetchedData && data.fetchedData.values) ? data.fetchedData.values : [],
        features: isArray(data && data.fetchedData && data.fetchedData.features) ? data.fetchedData.features : [],
        valuesCount: data && data.fetchedData && data.fetchedData.size,
        srsName: data && data.fetchedData && data.fetchedData.crs,
        busy: data.busy
    }));
});

// component enhanced with props from stream, and local state
const PagedWFSComboboxEnhanced = streamEnhancer(
    ({ open, toggle, select, focus, change, changed, originalValue, value, valuesCount, onChangeDrawingStatus,
        loadNextPage, loadPrevPage, maxFeatures, currentPage, itemComponent, features,
        busy, data, loading = false, valueField, textField, filter, srsName, style }) => {
        const numberOfPages = Math.ceil(valuesCount / maxFeatures);
        // for understanding "numberOfPages <= currentPage" see  https://osgeo-org.atlassian.net/browse/GEOS-7233. can be removed when fixed
        // sometimes on the last page it returns a wrong totalFeatures number
        return (<PagedComboboxWithFeatures
            pagination={{firstPage: currentPage === 1, lastPage: numberOfPages <= currentPage, paginated: true, loadPrevPage, loadNextPage, currentPage}}
            srsName={srsName} busy={busy} dropUp={false} data={data} open={open} onChangeDrawingStatus={onChangeDrawingStatus}
            valueField={valueField} textField={textField} itemComponent={itemComponent} filter={filter}
            onFocus={focus} onToggle={toggle} onChange={change} onSelect={select} features={features} style={style}
            selectedValue={!changed ? originalValue || value : value} loading={loading}/>);
    });

// state enhancer for local props
const addStateHandlers = compose(
    withPropsOnChange(
        ["valueField"], () => ({value: undefined})
    ),
    withStateHandlers((props) => ({
        delayDebounce: 0,
        performFetch: false,
        open: false,
        currentPage: 1,
        maxFeatures: 5,
        changed: props.value,
        value: props.value,
        onChangeDrawingStatus: props.onChangeDrawingStatus,
        itemComponent: props.itemComponent
    }), {
        select: () => (selected) => {
            return ({
                selected
            });
        },
        change: (state) => (v, valuefield) => {
            if (!state.selected && !state.open) {
                state.onChangeDrawingStatus('clean', '', "queryform", [], {});
            }
            return ({
                delayDebounce: 500,
                selected: false,
                changingPage: false,
                changed: true,
                performFetch: state.selected && !state.changingPage ? false : true,
                value: state.selected && state.changingPage && state.value
                    || (typeof v === "string" ? v : v[valuefield]),
                currentPage: !state.changingPage ? 1 : state.currentPage
            });
        },
        focus: (state) => (options) => {
            if (options && options.length === 0 && state.value === "") {
                return ({
                    delayDebounce: 0,
                    currentPage: 1,
                    performFetch: true,
                    isToggled: false,
                    open: true
                });
            }
            return (state);
        },
        toggle: (state) => () => {
            return ({
                open: state.changingPage ? true : !state.open
            });
        },
        loadNextPage: (state) => () => ({
            currentPage: state.currentPage + 1,
            performFetch: true,
            changingPage: true,
            delayDebounce: 0
        }),
        loadPrevPage: (state) => () => ({
            currentPage: state.currentPage - 1,
            performFetch: true,
            changingPage: true,
            delayDebounce: 0
        })
    }),
    withHandlers({
        select: ({options, onChangeSpatialFilterValue = () => {}, select = () => {}} = {}) => (value, feature, srsName, style) => {
            if (feature) {
                onChangeSpatialFilterValue({
                    geometry: feature.geometry,
                    value,
                    feature,
                    srsName,
                    style,
                    options,
                    collectGeometries:
                        options && options.crossLayer
                            ?
                            {
                                queryCollection: {
                                    typeName: options.crossLayer.typeName,
                                    geometryName: options.crossLayer.geometryName,
                                    cqlFilter: generateTemplateString(options.crossLayer.cqlTemplate || "", escapeCQLStrings)(feature)
                                }
                            }
                            : undefined
                });
            }
            select(true);
        }
    })
);

const AutocompleteWFSCombobox = addStateHandlers(PagedWFSComboboxEnhanced);

module.exports = {
    AutocompleteWFSCombobox
};
