 /**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */


const axios = require('../libs/ajax');

const urlUtil = require('url');
const Rx = require('rxjs');
const {parseString} = require('xml2js');
const {stripPrefix} = require('xml2js/lib/processors');

const {interceptOGCError} = require('../utils/ObservableUtils');
const {getCapabilitiesUrl} = require('../utils/LayersUtils');
const FilterUtils = require('../utils/FilterUtils');
const requestBuilder = require('../utils/ogc/WFS/RequestBuilder');
const {getFeature, query} = requestBuilder({ wfsVersion: "1.1.0" });

const toDescribeURL = ({name, search = {}, url} = {}) => {
    const parsed = urlUtil.parse(search.url || url, true);
    return urlUtil.format(
        {
        ...parsed,
        search: undefined, // this allows to merge parameters correctly
        query: {
            ...parsed.query,

            service: "WFS",
            version: "1.1.0",
            typeName: name,
            outputFormat: 'application/json',
            request: "DescribeFeatureType"
        }
    });
};
const toLayerCapabilitiesURL = ({name, search = {}, url} = {}) => {
    const URL = getCapabilitiesUrl({name, url: search && search.url || url });
    const parsed = urlUtil.parse(URL, true);
    return urlUtil.format(
        {
        ...parsed,
        search: undefined, // this allows to merge parameters correctly
        query: {
            ...parsed.query,
            service: "WFS",
            version: "1.1.1",
            request: "GetCapabilities"
        }
    });
};
const Url = require('url');
const { isObject } = require('lodash');

// this is a workaround for https://osgeo-org.atlassian.net/browse/GEOS-7233. can be removed when fixed
const workaroundGEOS7233 = ({ totalFeatures, features, ...rest } = {}, { startIndex, maxFeatures } = {}, originalSize) => {
    if (originalSize > totalFeatures && originalSize === startIndex + features.length && totalFeatures === features.length) {
        return {
            ...rest,
            features,
            totalFeatures: originalSize
        };
    }
    return {
        ...rest,
        features,
        totalFeatures
    };

};
const getWFSFilterData = (filterObj) => {
    let data;
    if (typeof filterObj === 'string') {
        data = filterObj;
    } else {
        data = filterObj.filterType === "OGC"
            ? FilterUtils.toOGCFilter(filterObj.featureTypeName, filterObj, filterObj.ogcVersion, filterObj.sortOptions, filterObj.hits)
            : FilterUtils.toCQLFilter(filterObj);
    }
    return data;
};

/**
 * Get Features in json format. Intercepts request with 200 errors and workarounds GEOS-7233 if `totalFeatures` is passed
 * @param {string} searchUrl URL of WFS service
 * @param {object} filterObj FilterObject
 * @param {number} totalFeatures optional number to use in case of a previews request, needed to workaround GEOS-7233.
 * @return {Observable} a stream that emits the GeoJSON or an error.
 */
const getJSONFeature = (searchUrl, filterObj, totalFeatures) => {
    const data = getWFSFilterData(filterObj);

    const urlParsedObj = Url.parse(searchUrl, true);
    let params = isObject(urlParsedObj.query) ? urlParsedObj.query : {};
    params.service = 'WFS';
    params.outputFormat = 'json';
    const queryString = Url.format({
        protocol: urlParsedObj.protocol,
        host: urlParsedObj.host,
        pathname: urlParsedObj.pathname,
        query: params
    });

    return Rx.Observable.defer(() =>
        axios.post(queryString, data, {
            timeout: 60000,
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        }))
        .let(interceptOGCError)
        .map((response) => workaroundGEOS7233(response.data, filterObj.pagination, totalFeatures));
};

/**
 * Same of `getJSONFeature` but auto-retries possible errors due to no-primary-key issues
 * (when you are using pagination vendor parameters for GeoServer and the primary-key of the table was not set).
 * When this kind of error occours, auto-retry using the sortOptions passed.
 * present. .
 * @param {string} searchUrl URL of WFS service
 * @param {object} filterObj Filter object
 * @param {object} options params that can contain `totalFeatures` and sort options
 * @return {Observable} a stream that emits the GeoJSON or an error.
 */
const getJSONFeatureWA = (searchUrl, filterObj, { totalFeatures, sortOptions = {} } = {}) =>
    getJSONFeature(searchUrl, filterObj, totalFeatures)
        .catch(error => {
            if (error.name === "OGCError" && error.code === 'NoApplicableCode') {
                return getJSONFeature(searchUrl, {
                    ...filterObj,
                    sortOptions
                }, totalFeatures);
            }
            throw error;
        });
const getFeatureOtpions = (obj) => Object.keys().reduce(
    (acc, k) => k !== "totalFeatures" && k !== "sortOptions"
        ? {
        ...acc,
        [k]: obj[k]
        }
        : acc
    , {});
/**
 * Same of `getJSONFeatureWA` but accepts the layer as first parameter.
 * Accepts also a filter as a string
 * @param {object} layer the layer to search
 * @param {object|string} filter the filter object or string of the filter
 * @param {object} options the optnions (pagination, totalFeatures and so on ...)
 */
const getLayerJSONFeature = ({ search = {}, url, name } = {}, filter = {}, options) =>
    getJSONFeatureWA(search.url || url,
        typeof filter === 'object' ? {
            ...filter,
            typeName: name || filter.typeName
        } : getFeature(
                query(name, filter),
                getFeatureOtpions(options)),
    options);

module.exports = {
    getJSONFeature,
    getLayerJSONFeature,
    getJSONFeatureWA,
    describeFeatureType: ({layer}) =>
        Rx.Observable.defer(() =>
            axios.get(toDescribeURL(layer))).let(interceptOGCError),
    getLayerWFSCapabilities: ({layer}) =>
            Rx.Observable.defer( () => axios.get(toLayerCapabilitiesURL(layer)))
            .let(interceptOGCError)
            .switchMap( response => Rx.Observable.bindNodeCallback( (data, callback) => parseString(data, {
                 tagNameProcessors: [stripPrefix],
                 explicitArray: false,
                 mergeAttrs: true
            }, callback))(response.data)
        )

};
