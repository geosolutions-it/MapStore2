/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { getAuthorizationBasic } from '../utils/SecurityUtils';
import axios from '../libs/ajax';
import { reprojectBbox } from '../utils/CoordinatesUtils';
import trimEnd from 'lodash/trimEnd';

let _cache = {};

const extentToBoundingBox = (extent) => {
    const wkid = extent?.spatialReference?.wkt
        ? '4326'
        : extent?.spatialReference?.latestWkid || extent?.spatialReference?.wkid;
    const projectedExtent = extent?.spatialReference?.wkt
        ? reprojectBbox([extent?.xmin, extent?.ymin, extent?.xmax, extent?.ymax], extent.spatialReference.wkt, 'EPSG:4326')
        : extent
            ? [extent?.xmin, extent?.ymin, extent?.xmax, extent?.ymax]
            : null;

    if (projectedExtent) {
        return {
            bounds: {
                minx: projectedExtent[0],
                miny: projectedExtent[1],
                maxx: projectedExtent[2],
                maxy: projectedExtent[3]
            },
            crs: `EPSG:${wkid}`
        };
    }
    return null;
};

const getCommonProperties = (data) => {
    return {
        version: data?.currentVersion,
        queryable: (data?.capabilities || '').includes('Data'),
        format: (data.supportedImageFormatTypes || '')
            .split(',')
            .filter(format => /PNG|JPG|GIF/.test(format))[0] || 'PNG32'
    };
};
/**
 * Retrieve layer metadata.
 *
 * @param {string} layerUrl - url of the rest service
 * @param {string} layerName - id of the layer
 * @returns layer metadata
 */
export const getLayerMetadata = (layerUrl, layerName) => {
    if (layerName === undefined) {
        return axios.get(layerUrl, { params: { f: 'json' }})
            .then(({ data }) => {
                const bbox = extentToBoundingBox(data?.fullExtent);
                return {
                    ...getCommonProperties(data),
                    ...(bbox && { bbox }),
                    description: data.description || data.serviceDescription,
                    options: {
                        layers: data.layers
                    },
                    data
                };
            });
    }
    return axios.get(`${trimEnd(layerUrl, '/')}/${layerName}`, { params: { f: 'json' }})
        .then(({ data }) => {
            const bbox = extentToBoundingBox(data?.extent);
            return {
                ...(bbox && { bbox }),
                data
            };
        });
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
    const protectedId = params?.info?.options?.service?.protectedId;
    let headers = getAuthorizationBasic(protectedId);
    const request = _cache[url]
        ? () => Promise.resolve(_cache[url])
        : () => axios.get(url, {
            params: {
                f: 'json'
            },
            headers
        }).then(({ data }) => {
            _cache[url] = data;
            return data;
        });
    return request()
        .then((data) => {
            const { layers, services } = data || {};
            if (services) {
                return searchAndPaginate(
                    services.filter(service => ['MapServer', 'ImageServer'].includes(service.type)).map((service) => {
                        return {
                            url: `${trimEnd(url, '/')}/${service.name}/${service.type}`,
                            version: data.currentVersion,
                            name: service.name,
                            description: service.type
                        };
                    }), params);
            }
            // Map is similar to WMS GetMap capability for MapServer
            const mapExportSupported = (data?.capabilities || '').includes('Map') || (data?.capabilities || '').includes('Image');
            const commonProperties = {
                url,
                ...getCommonProperties(data),
                layers
            };
            const bbox = extentToBoundingBox(data?.fullExtent);
            const records = [
                ...((mapExportSupported) ? [
                    {
                        name: data?.documentInfo?.Title || data.name || params?.info?.options?.service?.title ||  data.mapName,
                        description: data.description || data.serviceDescription,
                        bbox,
                        ...commonProperties
                    }
                ] : []),
                ...(mapExportSupported && layers ? layers : []).map((layer) => {
                    return {
                        ...layer,
                        ...commonProperties
                    };
                })
            ];
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
