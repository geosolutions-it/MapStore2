/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const {isArray} = require('lodash');
const PagedCombobox = require('./combobox/PagedCombobox');
const {setObservableConfig, mapPropsStreamWithConfig, compose, withStateHandlers} = require('recompose');
const rxjsConfig = require('recompose/rxjsObservableConfig').default;
setObservableConfig(rxjsConfig);
const mapPropsStream = mapPropsStreamWithConfig(rxjsConfig);

// fetch data from wps service
const streamEnhancer = mapPropsStream(props$ => {
    let fetcherStream = props$.take(1).switchMap(p => {
        return p.autocompleteStreamFactory(props$);
    });
    return fetcherStream.combineLatest(props$, (data, props) => ({
        data: isArray(data && data.fetchedData && data.fetchedData.values) ? data.fetchedData.values.map(v => {return {label: v, value: v}; }) : [],
        valuesCount: data && data.fetchedData && data.fetchedData.size,
        currentPage: props && props.currentPage,
        maxFeatures: props && props.maxFeatures,
        select: props && props.select,
        focus: props && props.focus,
        loadNextPage: props && props.loadNextPage,
        loadPrevPage: props && props.loadPrevPage,
        toggle: props && props.toggle,
        change: props.change,
        open: props.open,
        selected: props && props.selected,
        value: props.value,
        busy: data.busy
    }));
});

// component enhanced with props from stream, and local state
const PagedComboboxEnhanced = streamEnhancer(
    ({ open, toggle, select, focus, change, value, valuesCount,
        loadNextPage, loadPrevPage, maxFeatures, currentPage,
        busy, data, loading = false }) => {
        const numberOfPages = Math.ceil(valuesCount / maxFeatures);
        return (<PagedCombobox
            pagination={{firstPage: currentPage === 1, lastPage: currentPage === numberOfPages, paginated: true, loadPrevPage, loadNextPage}}
            busy={busy} dropUp={false} data={data} open={open}
            onFocus={focus} onToggle={toggle} onChange={change} onSelect={select}
            selectedValue={value} loading={loading}/>);
    });

// state enhancer for local props
const addStateHandlers = compose(
    withStateHandlers((props) => ({
        delayDebounce: 0,
        performFetch: false,
        open: false,
        currentPage: 1,
        maxFeatures: 5,
        url: props.url,
        typeName: props.typeName,
        value: props.value,
        attribute: props.column && props.column.key,
        autocompleteStreamFactory: props.autocompleteStreamFactory
    }), {
        select: (state) => () => ({
            ...state,
            selected: true
        }),
        change: (state) => (v) => {
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
            const value = typeof v === "string" ? v : v.value;
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
        toggle: (state) => () => ({
            ...state,
            open: state.changingPage ? true : !state.open
        }),
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

const AutocompleteCombobox = addStateHandlers(PagedComboboxEnhanced);

module.exports = {
    AutocompleteCombobox
};
