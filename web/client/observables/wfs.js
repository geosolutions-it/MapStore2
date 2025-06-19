/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import urlUtil from 'url';

import { isArray, castArray, isNil, isObject } from 'lodash';
import Rx from 'rxjs';
import { parseString } from 'xml2js';
import { stripPrefix } from 'xml2js/lib/processors';

import axios from '../libs/ajax';
import { createFeatureFilter, getWFSFilterData } from '../utils/FilterUtils';
import { getCapabilitiesUrl } from '../utils/LayersUtils';
import { interceptOGCError } from '../utils/ObservableUtils';
import requestBuilder from '../utils/ogc/WFS/RequestBuilder';
import { getDefaultUrl } from '../utils/URLUtils';
import { getAuthorizationBasic } from '../utils/SecurityUtils';

const {getFeature, query, sortBy, propertyName} = requestBuilder({ wfsVersion: "1.1.0" });

export const toDescribeURL = ({ name, search = {}, url, describeFeatureTypeURL} = {}) => {
    const parsed = urlUtil.parse(getDefaultUrl(describeFeatureTypeURL || search.url || url), true);
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
export const toLayerCapabilitiesURL = ({name, search = {}, url} = {}) => {
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

// this is a workaround for https://osgeo-org.atlassian.net/browse/GEOS-7233. can be removed when fixed
export const workaroundGEOS7233 = ({ totalFeatures, features, ...rest } = {}, { startIndex } = {}, originalSize) => {
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


export const getPagination = (filterObj = {}, options = {}) =>
    filterObj.pagination
    || !isNil(options.startIndex)
        && !isNil(options.maxFeatures)
        && {
            startIndex: options.startIndex,
            maxFeatures: options.maxFeatures
        };

const createFeatureCollection = (features) => (
    {
        crs: {type: "name", properties: {name: "urn:ogc:def:crs:EPSG::4326"}},
        numberMatched: features.length,
        numberReturned: features.length,
        timeStamp: "2020-07-20T11:36:20.118Z",
        totalFeatures: features.length,
        type: 'FeatureCollection',
        features: features
    }
);

const getFeaturesFiltered = (features, filterObj) => {
    if (filterObj.filterFields && filterObj.filterFields.length !== 0) {
        const featuresFiltered = features.features.filter(createFeatureFilter(filterObj));

        features.features = featuresFiltered;
        features.numberMatched = featuresFiltered.length;
        features.numberReturned = featuresFiltered.length;
        features.totalFeatures = featuresFiltered.length;
    }
    if (filterObj.sortOptions && filterObj.sortOptions.sortBy && filterObj.sortOptions.sortOrder &&
        filterObj.sortOptions.sortOrder !== "NONE") {
        features.features.sort((a, b) => {
            const avalue = a.properties[filterObj.sortOptions.sortBy];
            const bvalue = b.properties[filterObj.sortOptions.sortBy];
            const diff = avalue.toLowerCase().localeCompare(bvalue.toLowerCase());
            if (filterObj.sortOptions.sortOrder === "ASC") {
                return diff;
            }

            return -1 * diff;
        });
    }
    return features;

};

/**
 * Get data and query string for WFS query for either JSON or XML formats
 * @param {string} searchUrl URL of WFS service
 * @param {object} filterObj FilterObject
 * @param {*} downloadOption selected format for query
 * @returns {Object} The data and query string
 */
export const getFeatureUtilities = (searchUrl, filterObj, options = {}, downloadOption = 'json') => {
    const data = getWFSFilterData(filterObj, options);

    const urlParsedObj = urlUtil.parse(getDefaultUrl(searchUrl), true);
    let params = isObject(urlParsedObj.query) ? urlParsedObj.query : {};
    params.service = 'WFS';
    params.outputFormat = downloadOption;
    const queryString = urlUtil.format({
        protocol: urlParsedObj.protocol,
        host: urlParsedObj.host,
        pathname: urlParsedObj.pathname,
        query: params
    });

    if (options.layer && options.layer.type === 'vector') {
        return Rx.Observable.defer(() => new Promise((resolve) => {
            let features = createFeatureCollection(options.layer.features);
            let featuresFiltered = getFeaturesFiltered(features, filterObj);
            resolve(featuresFiltered);
        }));
    }

    return {
        data,
        queryString
    };
};

/**
 * Get Features in xml format.
 * @param {string} searchUrl URL of WFS service
 * @param {object} filterObj FilterObject
 * @param {*} downloadOption selected format for download
 * @returns {Observable} a stream that emits the XML
 */
export const getXMLFeature = (searchUrl, filterObj, options = {}, downloadOption) => {

    if (options.layer && options.layer.type === 'vector') {
        return getFeatureUtilities(searchUrl, filterObj, options, downloadOption);
    }

    const { data, queryString } = getFeatureUtilities(searchUrl, filterObj, options, downloadOption);
    const headers = getAuthorizationBasic(options.layer?.security?.sourceId || options.security?.sourceId);

    return Rx.Observable.defer(() =>
        axios.post(queryString, data, {
            timeout: 60000,
            responseType: 'arraybuffer',
            headers: {
                'Accept': `application/xml`,
                'Content-Type': `application/xml`,
                ...headers
            }
        }));
};

/**
 * Get Features in json format. Intercepts request with 200 errors and workarounds GEOS-7233 if `totalFeatures` is passed
 * @param {string} searchUrl URL of WFS service
 * @param {object} filterObj FilterObject
 * @param {number} totalFeatures optional number to use in case of a previews request, needed to workaround GEOS-7233.
 * @return {Observable} a stream that emits the GeoJSON or an error.
 */
export const getJSONFeature = (searchUrl, filterObj, options = {}) => {

    if (options.layer && options.layer.type === 'vector') {
        return getFeatureUtilities(searchUrl, filterObj, options);
    }

    const { data, queryString } = getFeatureUtilities(searchUrl, filterObj, options);

    return Rx.Observable.defer(() =>
        axios.post(queryString, data, {
            timeout: 60000,
            headers: { 'Accept': 'application/json', 'Content-Type': `application/xml` },
            ...options?.requestOptions
        }))
        .let(interceptOGCError)
        .map((response) => workaroundGEOS7233(response.data, getPagination(filterObj, options), options.totalFeatures));
};

/**
 * Same of `getJSONFeature` but auto-retries possible errors due to no-primary-key issues
 * (when you are using pagination vendor parameters for GeoServer and the primary-key of the table was not set).
 * When this kind of error occurs, auto-retry using the sortOptions passed.
 * present. .
 * @param {string} searchUrl URL of WFS service
 * @param {object} filterObj Filter object
 * @param {object} options params that can contain `totalFeatures` and sort options
 * @return {Observable} a stream that emits the GeoJSON or an error.
 */
export const getJSONFeatureWA = (searchUrl, filterObj, { sortOptions = {}, ...options } = {}) =>
    getJSONFeature(searchUrl, filterObj, options)
        .catch(error => {
            if (error.name === "OGCError" && error.code === 'NoApplicableCode') {
                return getJSONFeature(searchUrl, {
                    ...filterObj,
                    sortOptions
                }, options);
            }
            throw error;
        });

/**
 * Same of `getJSONFeatureWA` but accepts the layer as first parameter.
 * Accepts filter as a string or object. In case of string filter manages pagination and
 * sort options from 3rd parameter. This is a little different from normal getJSONFeature,
 * anyway this version is more rational, separating pagination, sorting etc... from filter.
 * TODO: make this more flexible to manage also object filter with a clear default rule.
 * @param {object} layer the layer to search
 * @param {object|string} filter the filter object or string of the filter. To maintain
 * retro compatibility the filter object can contain pagination info, typeName and so on.
 * @param {object} options the options (pagination, totalFeatures and so on ...)
 */
export const getLayerJSONFeature = ({ search = {}, url, name, security } = {}, filter, {sortOptions, propertyName: pn, ...options} = {}) =>
    // TODO: Apply sort workaround for no primary keys
    getJSONFeature(search.url || url,
        filter && typeof filter === 'object' ? {
            ...filter,
            typeName: name || filter.typeName
        } : getFeature(
            query(name,
                [
                    ...( sortOptions ? [sortBy(sortOptions.sortBy, sortOptions.sortOrder)] : []),
                    ...(pn ? [propertyName(pn)] : []),
                    ...(filter ? castArray(filter) : [])
                ]),
            options), // options contains startIndex, maxFeatures and it can be passed as it is
        {security, ...options})
        // retry using 1st propertyNames property, if present, to workaround primary-key issues
        .catch(error => {
            if (error.name === "OGCError" && error.code === 'NoApplicableCode' && !sortOptions && pn && pn[0]) {
                return getJSONFeature(search.url || url,
                    filter && typeof filter === 'object' ? {
                        ...filter,
                        typeName: name || filter.typeName
                    } : getFeature(
                        query(name,
                            [
                                sortBy(isArray(pn) ? pn[0] : pn),
                                ...(pn ? [propertyName(pn)] : []),
                                ...(filter ? castArray(filter) : [])
                            ]),
                        options), // options contains startIndex, maxFeatures and it can be passed as it is
                    options);
            }
            throw error;
        });

export const describeFeatureType = ({layer}) => {
    const headers = getAuthorizationBasic(layer?.security?.sourceId);
    return Rx.Observable.defer(() =>
        axios.get(toDescribeURL(layer), {headers})).let(interceptOGCError);
};
export const getLayerWFSCapabilities = ({layer}) => {
    const headers = getAuthorizationBasic(layer?.security?.sourceId);

    return Rx.Observable.defer( () => axios.get(toLayerCapabilitiesURL(layer), {headers}))
        .let(interceptOGCError)
        .switchMap( response => Rx.Observable.bindNodeCallback( (data, callback) => parseString(data, {
            tagNameProcessors: [stripPrefix],
            explicitArray: false,
            mergeAttrs: true
        }, callback))(response.data)
        );
};

export default {
    getJSONFeature,
    getLayerJSONFeature,
    getJSONFeatureWA,
    describeFeatureType,
    getLayerWFSCapabilities
};

