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

import url from 'url';

import { endsWith, head, isNil } from 'lodash';
import assign from 'object-assign';
import Rx from 'rxjs';

import {API} from '../api/searchText';
import axios from '../libs/ajax';
import { getWpsPayload } from '../utils/ogc/WPS/autocomplete';

export const singleAttributeFilter = ({searchText = "", queriableAttributes = [], predicate = "ILIKE"} ) => {
    const attribute = head(queriableAttributes);
    const text = searchText.toLowerCase();
    let filter = `strToLowerCase(${attribute}) ${predicate} '%${text}%'`;
    if (isNil(attribute)) {
        return "";
    }
    return "(" + filter + ")";
};

/**
 * creates a stream for fetching data via WPS
 * @param  {external:Observable} props
 * @memberof observables.autocomplete
 * @return {external:Observable} the stream used for fetching data for the autocomplete editor
*/
export const createPagedUniqueAutompleteStream = (props$) => props$
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

export const createWFSFetchStream = (props$) =>
    Rx.Observable.merge(
        props$.distinctUntilChanged(({value} = {}, {value: nextValue} = {}) => value === nextValue ).debounce(props => Rx.Observable.timer(props.delayDebounce || 0)),
        props$.distinctUntilChanged( ({filterProps, currentPage} = {}, {filterProps: nextFilterProps, currentPage: nextCurrentPage} ) => filterProps === nextFilterProps && currentPage === nextCurrentPage)
    )
        .switchMap((p) => {
            if (p.performFetch) {
                let parsed = url.parse(p.url, true);
                let newPathname = "";
                if (endsWith(parsed.pathname, "wfs") || endsWith(parsed.pathname, "wms") || endsWith(parsed.pathname, "ows") || endsWith(parsed.pathname, "wps")) {
                    newPathname = parsed.pathname.replace(/(wms|ows|wps|wfs)$/, "wfs");
                }
                if ( !!parsed.query && !!parsed.query.service) {
                    delete parsed.query.service;
                }
                const urlParsed = url.format(assign({}, parsed, {search: null, pathname: newPathname }));
                let serviceOptions = assign({}, {
                    url: urlParsed,
                    typeName: p.filterProps && p.filterProps.typeName || "",
                    predicate: p.filterProps && p.filterProps.predicate || "ILIKE",
                    blacklist: p.filterProps && p.filterProps.blacklist || [],
                    maxFeatures: p.filterProps && p.filterProps.maxFeatures || 3,
                    queriableAttributes: p.filterProps && p.filterProps.queriableAttributes || [],
                    returnFullData: true,
                    startIndex: ((p.currentPage || 1) - 1) * (p.filterProps && p.filterProps.maxFeatures || 3),
                    outputFormat: "application/json",
                    staticFilter: "",
                    fromTextToFilter: singleAttributeFilter,
                    item: {},
                    timeout: 60000,
                    headers: {'Accept': 'application/json', 'Content-Type': 'application/xml'},
                    srsName: p.filterProps && p.filterProps.srsName || "EPSG:4326",
                    ...parsed.query
                });
                return Rx.Observable.fromPromise((API.Utils.getService("wfs")(p.value, serviceOptions)
                    .then( data => {
                        return {fetchedData: { values: data.features.map(f => f.properties), size: data.totalFeatures, features: data.features, crs: p.filterProps && p.filterProps.srsName || "EPSG:4326"}, busy: false};
                    }))).catch(() => {
                    return Rx.Observable.of({fetchedData: {values: [], size: 0, features: []}, busy: false});
                }).startWith({busy: true});
            }
            return Rx.Observable.of({fetchedData: {values: [], size: 0, features: []}, busy: false});
        }).startWith({});

export default {
    createPagedUniqueAutompleteStream,
    createWFSFetchStream,
    singleAttributeFilter
};
