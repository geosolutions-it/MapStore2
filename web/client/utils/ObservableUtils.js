/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';

import { get } from 'lodash';
import { parseString } from 'xml2js';
import { stripPrefix } from 'xml2js/lib/processors';
import GeoStoreApi from '../api/GeoStoreDAO';

class OGCError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'OGCError';
        this.code = code;
    }
}
export const parseXML = (xml, options = {
    tagNameProcessors: [stripPrefix],
    explicitArray: false,
    mergeAttrs: true
} ) => Rx.Observable.bindNodeCallback((data, callback) => parseString(data, options, callback))(xml);
/**
 * Intercept OGC Exception (200 response with exceptionReport) to throw error in the stream
 * @param  {observable} observable The observable that emits the server response
 * @return {observable}            The observable that returns the response or throws the error.
 */
export const interceptOGCError = (observable) => observable.switchMap(response => {
    if (typeof response.data === "string") {
        if (response.data.indexOf("ExceptionReport") > 0) {
            return Rx.Observable.bindNodeCallback( (data, callback) => parseString(data, {
                tagNameProcessors: [stripPrefix],
                explicitArray: false,
                mergeAttrs: true
            }, callback))(response.data).map(data => {
                const message = get(data, "ExceptionReport.Exception.ExceptionText");
                throw new OGCError(message || "Undefined OGC Service Error", get(data, "ExceptionReport.Exception.exceptionCode"));
            });

        }
    }
    return Rx.Observable.of(response);
});

export const deleteResourceById = (resId, options) => resId ?
    GeoStoreApi.deleteResource(resId, options)
        .then((res) => {return {data: res.data, resType: "success", error: null}; })
        .catch((e) => {return {error: e, resType: "error"}; }) :
    Rx.Observable.of({resType: "success"});
