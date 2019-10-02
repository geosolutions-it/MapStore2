/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Rx = require('rxjs');
const axios = require('../libs/ajax');
const {UPDATE_FILTER_FIELD, updateFilterFieldOptions, loadingFilterFieldOptions, setAutocompleteMode, toggleMenu} = require('../actions/queryform');
const {FEATURE_TYPE_SELECTED} = require('../actions/wfsquery');
const {getWpsPayload} = require('../utils/ogc/WPS/autocomplete');
const {isArray, startsWith} = require('lodash');
const {error} = require('../actions/notifications');
const {typeNameSelector} = require('../selectors/query');
const {maxFeaturesWPSSelector, appliedFilterSelector, storedFilterSelector} = require('../selectors/queryform');
const {getParsedUrl} = require('../utils/ConfigUtils');
const {authkeyParamNameSelector} = require('../selectors/catalog');

/**
    * Epics for WFS query requests
    * @name epics.wfsquery
    * @type {Object}
    */

module.exports = {

    isAutoCompleteEnabled: (action$, store) =>
        action$.ofType(FEATURE_TYPE_SELECTED)
            .switchMap((action) => {
                const parsedUrl = getParsedUrl(action.url, {
                    "version": "1.0.0",
                    "REQUEST": "DescribeProcess",
                    "IDENTIFIER": "gs:PagedUnique" }, authkeyParamNameSelector(store.getState()));
                if (parsedUrl === null) {
                    return Rx.Observable.of(setAutocompleteMode(false));
                }
                return Rx.Observable.fromPromise(
                    axios.post(parsedUrl, null, {
                        timeout: 5000,
                        headers: {'Accept': 'application/json', 'Content-Type': 'application/xml'}
                    }).then(res => res.data)
                ).switchMap((data) => {
                    if (startsWith(data, "<ows:ExceptionReport")) {
                        return Rx.Observable.of(setAutocompleteMode(false));
                    }
                    return Rx.Observable.of(setAutocompleteMode(true));
                }).catch(() => { return Rx.Observable.of(setAutocompleteMode(false)); });
            }),
    fetchAutocompleteOptionsEpic: (action$, store) =>
        action$.ofType(UPDATE_FILTER_FIELD)
            .debounce((action) => {
                return Rx.Observable.timer(action.fieldOptions.delayDebounce || 0);
            })
            .filter( (action) => action.fieldName === "value" && action.fieldType === "string" && store.getState().queryform.autocompleteEnabled )
            .switchMap((action) => {
                const state = store.getState();
                const maxFeaturesWPS = maxFeaturesWPSSelector(state);
                const filterField = state.queryform && state.queryform.filterFields && state.queryform.filterFields.filter((f) => f.rowId === action.rowId)[0];

                if (action.fieldOptions.selected === "selected") {
                    return Rx.Observable.from([
                        updateFilterFieldOptions(filterField, [], 0)
                    ]);
                }
                const data = getWpsPayload({
                    attribute: filterField.attribute,
                    layerName: typeNameSelector(state),
                    layerFilter: appliedFilterSelector(state) || storedFilterSelector(state),
                    maxFeatures: maxFeaturesWPS,
                    startIndex: (action.fieldOptions.currentPage - 1) * maxFeaturesWPS,
                    value: action.fieldValue
                });
                const parsedUrl = getParsedUrl(state.query.url, {"outputFormat": "json"}, authkeyParamNameSelector(store.getState()));
                if (parsedUrl === null) {
                    return Rx.Observable.of(setAutocompleteMode(false));
                }
                return Rx.Observable.fromPromise(
                    axios.post(parsedUrl, data, {
                        timeout: 60000,
                        headers: {'Accept': 'application/json', 'Content-Type': 'application/xml'}
                    }).then(response => response.data)
                ).switchMap((res) => {
                    let newOptions = isArray(res.values) ? res.values : [res.values];
                    let valuesCount = res.size;
                    return Rx.Observable.from([updateFilterFieldOptions(filterField, newOptions, valuesCount), toggleMenu(action.rowId, true)] );
                })
                    .startWith(loadingFilterFieldOptions(true, filterField))
                    .catch( () => {
                    // console.log("error: " + e + " data:" + e.data);
                        return Rx.Observable.from([
                            updateFilterFieldOptions(filterField, [], 0),
                            error({
                                title: "warning",
                                message: "warning", // TODO add tranlations
                                action: {
                                    label: "warning" // TODO add tranlations
                                },
                                autoDismiss: 3,
                                position: "tr"
                            }), toggleMenu(action.rowId, true)
                        ]);
                    })
                    .concat([loadingFilterFieldOptions(false, filterField)]);
            })
};
