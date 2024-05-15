/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import axios from '../libs/ajax';

let _cache = {};
/**
 * Retrieve layer metadata.
 *
 * @param {string} layerUrl - url of the rest service
 * @param {string} layerName - id of the layer
 * @returns layer metadata
 */
export const getLayerMetadata = (layerUrl, layerName) => {
    return axios.get(`${layerUrl}/${layerName}`, { params: { f: 'json' }}).then(({data}) => data);
};
export const searchAndPaginate = (records, params) => {
    const { startPosition, maxRecords, text } = params;
    const filteredLayers = records?.filter(layer => !text || layer?.name.toLowerCase().indexOf(text.toLowerCase()) !== -1);
    return {
        numberOfRecordsMatched: filteredLayers.length,
        numberOfRecordsReturned: Math.min(maxRecords, filteredLayers.length),
        records: filteredLayers.filter((layer, index) => index >= startPosition - 1 && index < startPosition - 1 + maxRecords)
    };
};
const getData = (url, params = {}) => {
    const request = _cache[url]
        ? () => Promise.resolve(_cache[url])
        : () => axios.get(url, {
            params: {
                f: 'json'
            }
        }).then(({ data }) => {
            _cache[url] = data;
            return data;
        });
    return request()
        .then((data) => {
            // Modify the next line to allow raster sets where layers property is empty.
            const records = (data?.layers || []).map((layer) => {
                return {
                    ...layer,
                    url,
                    version: data?.currentVersion
                };
            });
            return searchAndPaginate(records, params);
        });
};
/**
 * Retrieve arcgis service capabilities.
 * @param {string} url - url of the rest service
 * @param {number} startPosition - pagination start position
 * @param {number} maxRecords - maximum number of records
 * @param {string} text - search text
 * @param {object} info
 * @returns {object}
 * - numberOfRecordsMatched
 * - numberOfRecordsReturned
 * - {array} records - records list
 */
export const getCapabilities = (url, startPosition, maxRecords, text, info) => {
    return getData(url, { startPosition, maxRecords, text, info })
        .then(({ numberOfRecordsMatched, numberOfRecordsReturned, records }) => {
            return { numberOfRecordsMatched, numberOfRecordsReturned, records };
        });
};
