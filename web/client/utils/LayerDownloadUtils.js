/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import castArray from 'lodash/castArray';
import isNil from 'lodash/isNil';
import get from 'lodash/get';
import axios from '../libs/ajax';
import { describeFeatureTypeToAttributes } from './FeatureTypeUtils';
import { toDescribeURL } from '../observables/wfs';
import { NETCDF_FORMAT } from './FileFormatUtils';
import { findGeoServerName, getLayerUrl } from './LayersUtils';

const VECTOR_TIME_BINDINGS = ['date', 'date-time', 'time'];
const RASTER_TIME_BINDINGS = ['java.util.Date', 'java.sql.Date', 'java.sql.Time', 'java.sql.Timestamp'];

/**
 * Extracts GeoServer REST base URL from layer WMS/WFS URL
 * @param {object} layer layer object
 * @returns {string} GeoServer REST URL
 */
export const getGeoserverRestUrl = (layer = {}) => {
    const url = getLayerUrl(layer) || '';
    if (!url) return '';
    const geoserverName = findGeoServerName(layer);
    const [layerUrl = ""] = url.split(geoserverName);
    return `${layerUrl}${geoserverName}rest/`;
};

/**
 * Identifies date/time attribute names for vector layers from DescribeFeatureType or attributes array
 * @param {object} [describeFeatureType] describeFeatureType response
 * @param {object[]} [attributes] pre-parsed attributes array
 * @returns {string[]} array of time attribute names
 */
export const getVectorTimeAttributes = (describeFeatureType = null, attributes = null) => {
    const _attributes = attributes && attributes.length > 0
        ? attributes
        : describeFeatureType ? describeFeatureTypeToAttributes(describeFeatureType) : [];
    return _attributes
        .filter(a => VECTOR_TIME_BINDINGS.includes(a.type))
        .map(a => a.attribute || a.name)
        .filter(Boolean);
};

/**
 * Asynchronously discovers vector date/time attributes from config, state, or WFS DescribeFeatureType
 * @param {object} layer layer object
 * @param {object} [options] options containing optional describeFeatureType or attributes
 * @returns {Promise<string[]>} resolves with array of time attribute names
 */
export const fetchVectorTimeAttributes = (layer = {}, options = {}) => {
    const attributes = getVectorTimeAttributes(options.describeFeatureType, options.attributes);
    if (attributes.length > 0) {
        return Promise.resolve(attributes);
    }
    const searchUrl = layer.search?.url || layer.url;
    if (!searchUrl || !layer.name) {
        return Promise.resolve([]);
    }
    const describeUrl = toDescribeURL({
        name: layer.name,
        search: layer.search,
        url: layer.url,
        describeFeatureTypeURL: layer.describeFeatureTypeURL
    });
    const requestOptions = {
        ...(layer._msAuthSourceId ? { _msAuthSourceId: layer._msAuthSourceId } : {}),
        ...options
    };
    return axios.get(describeUrl, requestOptions)
        .then(res => getVectorTimeAttributes(res?.data))
        .catch(() => []);
};


/**
 * Fetches raster coverage time attributes from GeoServer REST endpoint
 * @param {object} layer layer object
 * @param {object} options request options
 * @returns {Promise<string[]>} resolves with array of time attribute names
 */
export const fetchRasterTimeAttributes = (layer = {}, options = {}) => {
    const fallbackTimeAttribute = ["time"];
    const baseURL = getGeoserverRestUrl(layer);
    if (!baseURL || !layer.name) {
        return Promise.resolve(fallbackTimeAttribute);
    }
    const requestOptions = {
        ...(layer._msAuthSourceId ? { _msAuthSourceId: layer._msAuthSourceId } : {}),
        ...options
    };
    const layerUrl = `${baseURL}layers/${encodeURIComponent(layer.name)}.json`;
    return axios.get(layerUrl, requestOptions)
        .then(response => {
            const resourceHref = get(response, 'data.layer.resource.href');
            if (resourceHref) {
                const coverageIndexUrl = `${resourceHref.replace(/\.json$/i, '').replace(/\/$/, '')}/index.json`;
                // call coverage index url to obtain attributes of raster
                return axios.get(coverageIndexUrl, requestOptions);
            }
            return null;
        })
        .then(response => {
            const schema = response?.data?.Schema;
            const attributes = castArray(schema?.attributes?.Attribute || []);
            const timeAttributes = attributes
                .filter(attr => RASTER_TIME_BINDINGS.includes(attr.binding))
                .map(attr => attr.name)
                .filter(Boolean);

            return timeAttributes.length > 0 ? timeAttributes : fallbackTimeAttribute;
        })
        .catch(() => fallbackTimeAttribute);
};

/**
 * Fetches time attributes for either raster or vector layer
 * @param {object} layer layer object
 * @param {object} [options] options
 * @returns {Promise<string[]>} resolves with array of time attribute names
 */
export const fetchTimeAttributes = (layer = {}, options = {}) => {
    const isRaster = !layer?.search?.url;
    if (isRaster) {
        return fetchRasterTimeAttributes(layer, options);
    }
    return fetchVectorTimeAttributes(layer, options);
};

/**
 * Builds temporal filter representation (both CQL and OGC filter object)
 * @param {object} params
 * @param {string} params.timeAttribute attribute name
 * @param {string} params.currentTime start / current ISO time
 * @param {string} [params.offsetTime] end ISO time
 * @param {boolean} [params.offsetEnabled] whether range is active
 * @returns {object|null}
 */
export const buildTemporalFilter = ({ timeAttribute, currentTime, offsetTime, offsetEnabled } = {}) => {
    if (!timeAttribute || !currentTime) {
        return null;
    }
    const isRange = !!offsetEnabled && !isNil(offsetTime) && offsetTime !== currentTime;
    if (isRange) {
        const start = new Date(currentTime) <= new Date(offsetTime) ? currentTime : offsetTime;
        const end = new Date(currentTime) <= new Date(offsetTime) ? offsetTime : currentTime;
        return {
            isRange: true,
            cql: `${timeAttribute} >= '${start}' AND ${timeAttribute} <= '${end}'`,
            ogcFilterObj: {
                filterFields: [{
                    attribute: timeAttribute,
                    type: 'date',
                    operator: '><',
                    value: {
                        startDate: start,
                        endDate: end
                    }
                }]
            },
            start,
            end
        };
    }
    return {
        isRange: false,
        cql: `${timeAttribute} = '${currentTime}'`,
        ogcFilterObj: {
            filterFields: [{
                attribute: timeAttribute,
                type: 'date',
                operator: '=',
                value: {
                    startDate: currentTime
                }
            }]
        },
        start: currentTime,
        end: currentTime
    };
};

/**
 * Filters available download formats based on time dimension single/range state
 * @param {object[]} formats available formats
 * @param {boolean} hasTime whether layer has active time dimension
 * @param {boolean} isRange whether timeline is in range mode
 * @returns {object[]} filtered formats
 */
export const filterFormatsByTimeState = (formats = [], hasTime = false, isRange = false) => {
    const filterNetCDF = hasTime && isRange;

    return formats.filter(f =>
        filterNetCDF ? f.name === NETCDF_FORMAT : f.name !== NETCDF_FORMAT
    );
};
