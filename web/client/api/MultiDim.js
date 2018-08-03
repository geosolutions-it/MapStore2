/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const ajax = require('../libs/ajax');
const {endsWith, replace} = require('lodash');
const {Observable} = require('rxjs');
const {parseXML, interceptOGCError} = require('../utils/ObservableUtils');


const toMultiDimURL = url => endsWith(url, "wms") ? replace(url, "wms", "gwc/service/wmts") : url;
const trimUndefinedParams = o =>
    Object.keys(o).reduce( (acc, k) =>
        (o[k] !== undefined && o[k] !== null)
            ? {...acc, [k]: o[k]}
            : acc,
        {});
/**
 * Provides support for [DescribeDomains](http://docs.geoserver.org/latest/en/user/community/wmts-multidimensional/index.html#describedomains)
 * @memberof api.MultiDim
 * @param {string} url base URL for the describeDomains
 * @param {string} layer the layer name
 * @param {object} dimensionIdentifiers At most one per dimension, a range described as min/max, restricting the domain of this dimension
 * @param {object} options params of the request.
 */
const describeDomains = (url, layer, dimensionIdentifiers = {}, {
    service = "WMTS",
    version = "1.0.0",
    tileMatrixSet = "EPSG:4326", // this is required because this is an option of WMTS,
    bbox,
    domains,
    expandLimit
} = {}) =>
    Observable.defer( () => ajax.get(toMultiDimURL(url), {
        params: trimUndefinedParams({
            service,
            REQUEST: "DescribeDomains",
            version,
            layer,
            tileMatrixSet,
            bbox,
            domains,
            expandLimit,
            ...dimensionIdentifiers
        })
    }))
    .let(interceptOGCError)
    .switchMap(response => parseXML(response.data));
const getHistogram = (url, layer, dimensionIdentifiers, resolution, {
    service = "WMTS",
    version="1.1.0",
    tileMatrixSet = "EPSG:4326",
    bbox

} = {} ) =>
    Observable.defer( () => ajax.get(toMultiDimURL(url), {
        params: trimUndefinedParams({
            service,
            REQUEST: "DescribeDomains",
            version,
            layer,
            tileMatrixSet,
            bbox,
            ...dimensionIdentifiers
        })
    }))
    .let(interceptOGCError)
    .switchMap(response => parseXML(response.data));
/**
 * API for [WMTS Multidimensional](http://docs.geoserver.org/latest/en/user/community/wmts-multidimensional/index.html) that in the future
 * should be extended to WMS.
 *
 * @memberof api
 */
module.exports = {
    describeDomains,
    getHistogram
};
