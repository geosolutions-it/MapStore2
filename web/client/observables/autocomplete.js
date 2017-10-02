/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
 /**
 * Observables used for autocomplete in the feature editor
 * @name observables.autocomplete
 * @type {Object}
 *
*/
const Rx = require('rxjs');
const axios = require('../libs/ajax');
const {getWpsPayload} = require('../utils/ogc/WPS/autocomplete');

/**
 * creates a stream for fetching data via WPS
 * @param  {external:Observable} props
 * @memberof observables.autocomplete
 * @return {external:Observable} the stream used for fetching data for the autocomplete editor
*/
const createPagedUniqueAutompleteStream = (props$) => props$
    .distinctUntilChanged( ({value, currentPage}, newProps = {}) => !(newProps.value !== value || newProps.currentPage !== currentPage))
    .throttle(props => Rx.Observable.timer(props.delayDebounce || 0))
    .merge(props$.debounce(props => Rx.Observable.timer(props.delayDebounce || 0))).distinctUntilChanged()
    .switchMap((p) => {
        if (p.performFetch) {
            const data = getWpsPayload({
                    attribute: p.attribute,
                    layerName: p.typeName,
                    maxFeatures: p.maxFeatures,
                    startIndex: (p.currentPage - 1) * p.maxFeatures,
                    value: p.value
                });
            return Rx.Observable.fromPromise(
                axios.post(p.url, data, {
                    timeout: 60000,
                    headers: {'Accept': 'application/json', 'Content-Type': 'application/xml'}
                }).then(response => { return {fetchedData: response.data, busy: false}; }))
                .catch(() => {
                    return Rx.Observable.of({fetchedData: {values: [], size: 0}, busy: false});
                }).startWith({busy: true});
        }
        return Rx.Observable.of({fetchedData: {values: [], size: 0}, busy: false});
    }).startWith({});


module.exports = {
    createPagedUniqueAutompleteStream
};
