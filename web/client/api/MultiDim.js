/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const ajax = require('../libs/ajax');
const {replace, endsWith} = require('lodash');

// const {endsWith, replace} = require('lodash');
const {Observable} = require('rxjs');
const {parseXML, interceptOGCError} = require('../utils/ObservableUtils');

// TODO: remove this. It should be automatically the correct address
// const toMultiDimURL = url => endsWith(url, "wms") ? replace(url, "wms", "gwc/service/wmts") : url;
const toMultiDimURL = url => url;
// this fixes temporary this issue
// https://github.com/geosolutions-it/MapStore2/issues/3144
// can be removed or replaced with identity function when the issue is fixed
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
 * @returns a stream that emits the request result
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
const getHistogram = (url, layer, histogram, dimensionIdentifiers, resolution, {
    service = "WMTS",
    version = "1.1.0",
    tileMatrixSet = "EPSG:4326",
    bbox

} = {} ) =>
    Observable.defer( () => ajax.get(toMultiDimURL(url), {
        params: trimUndefinedParams({
            service,
            REQUEST: "GetHistogram",
            resolution,
            histogram,
            version,
            layer,
            tileMatrixSet,
            bbox,
            ...dimensionIdentifiers
        })
    }))
        .let(interceptOGCError)
        .switchMap(response => parseXML(response.data));

// http://localhost:8080/geoserver/gwc/service/wmts?request=GetDomainValues&Version=1.0.0&Layer=sampleLayer&domain=elevation&limit=2

/**
 * Retrieves domain values for a layer. Useful for animations.
 * @param {string} url url of the multidimensional extension
 * @param {string} layer layer name
 * @param {string} domain domain identifier
 * @param {object} pagination options for pagination. Can contain `fromValue`, `sort` (`asc` or `desc`) and `limit`.
 * @param {options} param4 other options
 */
const getDomainValues = (url, layer, domain, {
    time,
    fromValue,
    sort = "asc",
    limit = 20
} = {}, {
    bbox,
    tileMatrixSet = "EPSG:4326",
    service = "WMTS",
    version = "1.0.0"// ,
    // tileMatrixSet = "EPSG:4326" // this is required because this is an option of WMTS,

} = {}) => Observable.defer(() => ajax.get(toMultiDimURL(url), {
    params: trimUndefinedParams({
        service,
        version,
        request: "GetDomainValues",
        tileMatrixSet,
        bbox,
        layer,
        domain,
        fromValue,
        sort,
        limit,
        time
    })
}))
    .let(interceptOGCError)
    .switchMap(response => parseXML(response.data));

/**
 * Tries to guess the layer's information form the URL.
 * TODO: find out a better way to do this
 * @param {string} url the wms layers wms URL
 */
const getMultidimURL = ({ url } = {}) =>
    endsWith(url, "/wms")
        ? replace(url, /\/wms$/, "/gwc/service/wmts")
        : endsWith(url, "/ows")
            ? replace(url, /\/ows$/, "/gwc/service/wmts")
            : url;

/**
 * API for [WMTS Multidimensional](http://docs.geoserver.org/latest/en/user/community/wmts-multidimensional/index.html) that in the future
 * should be extended to WMS.
 *
 * @memberof api
 */
module.exports = {
    getMultidimURL,
    describeDomains,
    getHistogram,
    getDomainValues
};
