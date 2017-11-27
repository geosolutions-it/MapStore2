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
const {setObservableConfig, mapPropsStreamWithConfig, compose, withStateHandlers, withPropsOnChange} = require('recompose');
const rxjsConfig = require('recompose/rxjsObservableConfig').default;
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
        busy: data.busy
    }));
});

// component enhanced with props from stream, and local state
const PagedWFSComboboxEnhanced = streamEnhancer(
    ({ open, toggle, select, focus, change, value, valuesCount, onChangeDrawingStatus,
    loadNextPage, loadPrevPage, maxFeatures, currentPage, itemComponent, features,
    busy, data, loading = false, valueField, textField }) => {
        const numberOfPages = Math.ceil(valuesCount / maxFeatures);
        // for understanding "numberOfPages <= currentPage" see  https://osgeo-org.atlassian.net/browse/GEOS-7233. can be removed when fixed
        // sometimes on the last page it returns a wrong totalFeatures number
        return (<PagedComboboxWithFeatures
            pagination={{firstPage: currentPage === 1, lastPage: numberOfPages <= currentPage, paginated: true, loadPrevPage, loadNextPage, currentPage}}
            busy={busy} dropUp={false} data={data} open={open} onChangeDrawingStatus={onChangeDrawingStatus}
            valueField={valueField} textField={textField} itemComponent={itemComponent}
            onFocus={focus} onToggle={toggle} onChange={change} onSelect={select} features={features}
            selectedValue={value} loading={loading}/>);
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
        value: props.value,
        onChangeDrawingStatus: props.onChangeDrawingStatus,
        itemComponent: props.itemComponent,
        attribute: props.column && props.column.key
    }), {
        select: (state) => () => {
            return ({
            ...state,
            selected: true
        }); },
        change: (state) => (v, valuefield) => {
            if (!state.selected && !state.open) {
                state.onChangeDrawingStatus('clean', null, "queryform", [], {});
            }
            if (state.selected && state.changingPage) {
                return ({
                    ...state,
                    delayDebounce: state.selected ? 0 : 500,
                    selected: false,
                    changingPage: false,
                    performFetch: state.selected && !state.changingPage ? false : true,
                    value: state.value,
                    currentPage: !state.changingPage ? 1 : state.currentPage
                });
            }
            const value = typeof v === "string" ? v : v[valuefield];
            return ({
                ...state,
                delayDebounce: state.selected ? 0 : 500,
                selected: false,
                changingPage: false,
                performFetch: state.selected && !state.changingPage ? false : true,
                value: value,
                currentPage: !state.changingPage ? 1 : state.currentPage
            });
        },
        focus: (state) => (options) => {
            if (options && options.length === 0 && state.value === "") {
                return ({
                    ...state,
                    delayDebounce: 0,
                    currentPage: 1,
                    performFetch: true,
                    isToggled: false,
                    open: true
                });
            }
            return (state);
        },
        toggle: (state) => (v, feature, page) => {
            return ({
            ...state,
            open: state.changingPage ? true : !state.open,
            value: state.currentPage === page && !v && !feature ? "" : state.value
        }); },
        loadNextPage: (state) => () => ({
            ...state,
            currentPage: state.currentPage + 1,
            performFetch: true,
            changingPage: true,
            delayDebounce: 0,
            value: state.value
        }),
        loadPrevPage: (state) => () => ({
            ...state,
            currentPage: state.currentPage - 1,
            performFetch: true,
            changingPage: true,
            delayDebounce: 0,
            value: state.value
        })
    })
);

const AutocompleteWFSCombobox = addStateHandlers(PagedWFSComboboxEnhanced);

module.exports = {
    AutocompleteWFSCombobox
};
