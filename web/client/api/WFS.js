/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import axios from '../libs/ajax';
import urlUtil from 'url';
import assign from 'object-assign';
import xml2js from 'xml2js';
import ConfigUtils from '../utils/ConfigUtils';
import requestBuilder from '../utils/ogc/WFS/RequestBuilder';
import {toOGCFilterParts} from '../utils/FilterUtils';
import { getDefaultUrl } from '../utils/URLUtils';
import { castArray } from 'lodash';
import { isValidGetFeatureInfoFormat } from '../utils/WMSUtils';

const capabilitiesCache = {};

export const toDescribeURL = (url, typeName) => {
    const parsed = urlUtil.parse(getDefaultUrl(url), true);
    return urlUtil.format(
        {
            ...parsed,
            search: undefined, // this allows to merge parameters correctly
            query: {
                ...parsed.query,

                service: "WFS",
                version: "1.1.0",
                typeName,
                outputFormat: 'application/json',
                request: "DescribeFeatureType"
            }
        });
};
/**
 * Simple getFeature using http GET method with json format
 */
export const getFeatureSimple = function(baseUrl, params) {
    return axios.get(baseUrl + '?service=WFS&version=1.1.0&request=GetFeature', {
        params: assign({
            outputFormat: "application/json"
        }, params)
    }).then((response) => {
        if (typeof response.data !== 'object') {
            return JSON.parse(response.data);
        }
        return response.data;
    });
};

export const getCapabilitiesURL = (url, {version = "1.1.0"} = {}) => {
    const parsed = urlUtil.parse(getDefaultUrl(url), true);
    return urlUtil.format(assign({}, parsed, {
        search: undefined, // this allows to merge parameters correctly
        query: assign({
            version,
            ...parsed.query,
            service: "WFS",
            request: "GetCapabilities"
        })
    }));
};

export const getFeatureURL = (url, typeName, { version = "1.1.0", ...params } = {}) => {
    const parsed = urlUtil.parse(getDefaultUrl(url), true);
    return urlUtil.format(assign({}, parsed, {
        search: undefined, // this allows to merge parameters correctly
        query: assign({
            typeName,
            version,
            ...parsed.query,
            service: "WFS",
            request: "GetFeature",
            ...params
        })
    }));
};
/**
 * Performs a getFeature request (using axios POST) to a WFS service for a given MapStore layer WFS layer object.
 * @param {object} layer MapStore layer object
 * @param {object} requestOptions additional request options. Can include:
 * - `version`: WFS version. Default: `1.1.0`
 * - `filter`: optional array of mapstore filters. If the layer has a `layerFilter` property or filterObj, it will be added to the filter in a logic AND.
 * - `proj`: projection string
 * - `outputFormat`: output format string. Default: `application/json`
 * - `resultType`: result type string. Default: `results`
 * @param {object} config axios request config (headers, etc...)
 */
export const getFeatureLayer = (layer, {version =  "1.1.0", filters, proj, outputFormat = 'application/json', resultType = 'results'} = {}, config) => {
    const {url, name: typeName, params } = layer;
    const {layerFilter, filterObj: featureGridFilter} = layer; // TODO: add
    const {getFeature: wfsGetFeature, query, filter, and} = requestBuilder({wfsVersion: version});
    const allFilters = []
        .concat(filters ?? [])
        .concat(layerFilter ? layerFilter : [])
        .concat(featureGridFilter ? featureGridFilter : []);
    const reqBody = wfsGetFeature(query(
        typeName,
        // TODO: insert propertyName before filter to limit attributes to return
        allFilters.length > 0
            ? filter(
                and(
                    allFilters
                        .map(f => toOGCFilterParts(f, version, "ogc"))
                )

            ) : "",
        {srsName: proj} // 3rd for query is optional
    ),
    {outputFormat, resultType}
    );
    return axios.post(url, reqBody, {
        ...config,
        params,
        headers: {
            ...config?.headers,
            'Content-Type': 'application/xml'
        }
    });
};

/**
 * Performs a WFS GetFeature request (using axios GET) with the given parameters.
 * @param {string} url URL of the WFS service
 * @param {string} typeName layer name
 * @param {object} params the params to add to the request
 * @param {object} config axios request config (headers, etc...)
 * @returns {Promise} the axios promise
 */
export const getFeature = (url, typeName, params, config) => {
    return axios.get(getFeatureURL(url, typeName, params), config);
};

export const getCapabilities = function(url) {
    const cached = capabilitiesCache[url];
    if (cached && new Date().getTime() < cached.timestamp + (ConfigUtils.getConfigProp('cacheExpire') || 60) * 1000) {
        return Promise.resolve(cached.data);
    }
    return axios.get(getCapabilitiesURL(url))
        .then((response) => {
            let json;
            xml2js.parseString(response.data, { explicitArray: false, stripPrefix: true }, (ignore, result) => {
                json = { ...result, url };
            });
            capabilitiesCache[url] = {
                timestamp: new Date().getTime(),
                data: json
            };
            return json;
        });
};

export const describeFeatureType = function(url, typeName) {
    return axios.get(toDescribeURL(url, typeName)).then(({data}) => data);
};

/**
 * Fetch the supported formats of the WFS service
 * @param url
 * @return {object} { infoFormats }
 */
export const getSupportedFormat = (url) => {
    return getCapabilities(url)
        .then((response) => {
            const operations = castArray(response?.['wfs:WFS_Capabilities']?.['ows:OperationsMetadata']?.['ows:Operation'] || []);
            const getFeatureOperation = operations.find(operation => operation?.$?.name === 'GetFeature');
            const parameters = castArray(getFeatureOperation?.['ows:Parameter'] || []);
            const outputFormats = parameters.find((parameter) => parameter?.$?.name === 'outputFormat')?.['ows:Value'] || [];
            const infoFormats = outputFormats.filter(isValidGetFeatureInfoFormat);
            return {
                infoFormats: infoFormats?.length ? infoFormats : ['application/json']
            };
        })
        .catch(() => ({ infoFormats: ['application/json'] }));
};

