/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import axios from '../libs/ajax';
import Proj4js from 'proj4';
import { reprojectBbox } from '../utils/CoordinatesUtils';
import trimEnd from 'lodash/trimEnd';
import {
    isFeatureServerUrl,
    esriGeometryTypeToGeoJSON,
    esriFieldTypeToPrimitive
} from '../utils/ArcGISUtils';

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

const extentToBoundingBox4326 = (extent) => {
    if (!extent) return null;

    const wkt = extent?.spatialReference?.wkt;
    const wkid = extent?.spatialReference?.latestWkid || extent?.spatialReference?.wkid;
    const rawBbox = [extent.xmin, extent.ymin, extent.xmax, extent.ymax];

    let projectedExtent = null;

    if (wkt) {
        // ArcGIS services may use custom/non-EPSG projections defined only by WKT;
        // register under a synthetic name so Proj4js can resolve it for reprojection
        const projName = 'ESRI_WKT_' + (wkid || 'custom');
        if (!Proj4js.defs(projName)) {
            Proj4js.defs(projName, wkt);
        }
        projectedExtent = reprojectBbox(rawBbox, projName, 'EPSG:4326');
    } else if (wkid && String(wkid) !== '4326') {
        try {
            projectedExtent = reprojectBbox(rawBbox, `EPSG:${wkid}`, 'EPSG:4326');
        } catch (e) {
            projectedExtent = rawBbox;
        }
    } else {
        projectedExtent = rawBbox;
    }

    if (projectedExtent) {
        return {
            bounds: {
                minx: projectedExtent[0],
                miny: projectedExtent[1],
                maxx: projectedExtent[2],
                maxy: projectedExtent[3]
            },
            crs: 'EPSG:4326'
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
    const request = _cache[url]
        ? () => Promise.resolve(_cache[url])
        : () => axios.get(url, {
            params: {
                f: 'json'
            },
            _msAuthSourceId: protectedId
        }).then(({ data }) => {
            _cache[url] = data;
            return data;
        });
    return request()
        .then((data) => {
            const { layers, services } = data || {};
            if (services) {
                return searchAndPaginate(
                    services.filter(service => ['MapServer', 'ImageServer', 'FeatureServer'].includes(service.type)).map((service) => {
                        return {
                            url: `${trimEnd(url, '/')}/${service.name}/${service.type}`,
                            version: data.currentVersion,
                            name: service.name,
                            description: service.type
                        };
                    }), params);
            }

            if (isFeatureServerUrl(url)) {
                const bbox = extentToBoundingBox4326(data?.initialExtent) || extentToBoundingBox4326(data?.fullExtent);
                const queryCapable = (data?.capabilities || '').includes('Query');
                const maxRecordCount = data?.maxRecordCount;
                const featureRecords = (layers || [])
                    .filter(() => queryCapable)
                    .map((layer) => ({
                        ...layer,
                        url,
                        version: data?.currentVersion,
                        queryable: true,
                        geometryType: layer.geometryType
                            ? esriGeometryTypeToGeoJSON(layer.geometryType)
                            : undefined,
                        ...(maxRecordCount && { maxRecordCount }),
                        bbox
                    }));
                return searchAndPaginate(featureRecords, params);
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

const buildFeatureLayerUrl = (url, name) => {
    const baseUrl = trimEnd(url, '/');
    const layerId = name !== undefined && name !== null ? name : 0;
    return `${baseUrl}/${layerId}`;
};

let _schemaCache = {};
let _pendingSchemaFetch = {};
/**
 * Fetch a FeatureService layer's schema
 * @param {string} url FeatureService root url
 * @param {string|number} name layer id within the service
 * @param {object} [opts]
 * @param {string} [opts.authSourceId] security source id forwarded to axios
 * @param {boolean} [opts.force] bypass cache
 * @returns {object} promise resolving with
 * - {array} fields - raw ESRI fields metadata
 * - {object} properties - sampled `{name: 0|''}` primitives
 * - {string} geometryType - GeoJSON geometry type
 */
export const getFeatureLayerSchema = (url, name, opts = {}) => {
    const layerUrl = buildFeatureLayerUrl(url, name);
    if (!opts.force && _schemaCache[layerUrl]) {
        return Promise.resolve(_schemaCache[layerUrl]);
    }
    if (_pendingSchemaFetch[layerUrl]) {
        return _pendingSchemaFetch[layerUrl];
    }
    const request = axios.get(layerUrl, {
        params: { f: 'json' },
        _msAuthSourceId: opts.authSourceId
    }).then(({ data }) => {
        const fields = Array.isArray(data?.fields) ? data.fields : [];
        // Sample primitive value so getVectorLayerAttributes' isNumber/isString filter accepts it.
        const properties = fields.reduce((acc, f) => {
            if (!f?.name) return acc;
            const primitive = esriFieldTypeToPrimitive(f.type);
            if (primitive === 'number') acc[f.name] = 0;
            else if (primitive === 'string') acc[f.name] = '';
            return acc;
        }, {});
        const result = {
            fields,
            properties,
            geometryType: data?.geometryType
                ? esriGeometryTypeToGeoJSON(data.geometryType)
                : undefined
        };
        _schemaCache[layerUrl] = result;
        delete _pendingSchemaFetch[layerUrl];
        return result;
    }).catch((e) => {
        delete _pendingSchemaFetch[layerUrl];
        throw e;
    });
    _pendingSchemaFetch[layerUrl] = request;
    return request;
};

const DEFAULT_FEATURE_PAGE_SIZE = 1000;

/**
 * Paginated fetch of features from a FeatureService layer as GeoJSON.
 * @param {string} url FeatureService root url
 * @param {string|number} name layer id within the service
 * @param {object} [opts]
 * @param {object} [opts.params] extra query params merged into the request
 * @param {number} [opts.pageSize] resultRecordCount per page (default 1000)
 * @param {number} [opts.maxRecordCount] caps the page size (server-side limit)
 * @param {number} [opts.maxFeatures] maximum number of features to return
 * @param {string} [opts.authSourceId] security source id forwarded to axios
 * @returns {object} promise resolving with a GeoJSON FeatureCollection
 * - {string} type - always `FeatureCollection`
 * - {array} features - accumulated GeoJSON features
 */
export const fetchFeatureLayerCollection = (url, name, opts = {}) => {
    const queryUrl = `${buildFeatureLayerUrl(url, name)}/query`;
    const baseParams = {
        where: '1=1',
        outFields: '*',
        outSR: 4326,
        f: 'geojson',
        ...(opts.params || {})
    };
    // Use server-advertised maxRecordCount as page size (may exceed 1000)
    const recordCount = opts.pageSize
        || opts.maxRecordCount
        || DEFAULT_FEATURE_PAGE_SIZE;
    const allFeatures = [];
    const seenIds = new Set();
    const fetchPage = (offset) => {
        return axios.get(queryUrl, {
            params: {
                ...baseParams,
                resultOffset: offset,
                resultRecordCount: recordCount
            },
            _msAuthSourceId: opts.authSourceId
        }).then((response) => {
            const data = response?.data;
            const pageFeatures = data?.features || [];
            const newFeatures = pageFeatures.filter((f) => {
                const id = f.id ?? f.properties?.OBJECTID;
                if (id !== null && id !== undefined && seenIds.has(id)) return false;
                if (id !== null && id !== undefined) seenIds.add(id);
                return true;
            });
            if (newFeatures.length) {
                allFeatures.push(...newFeatures);
            }
            const reachedCap = opts.maxFeatures && allFeatures.length >= opts.maxFeatures;
            const exceeded = data?.exceededTransferLimit
                || data?.properties?.exceededTransferLimit;
            if (!reachedCap && exceeded && newFeatures.length > 0) {
                return fetchPage(offset + pageFeatures.length);
            }
            const features = opts.maxFeatures
                ? allFeatures.slice(0, opts.maxFeatures)
                : allFeatures;
            return { type: 'FeatureCollection', features };
        }).catch(() => ({ type: 'FeatureCollection', features: allFeatures }));
    };
    return fetchPage(0);
};

const DEFAULT_CLASSIFICATION_SAMPLE = 5000;
let _classificationCache = {};

/**
 * Fetch a feature collection suitable for client-side
 * classification of a FeatureService layer
 * @param {object} layer layer config
 * @param {object} [opts]
 * @param {number} [opts.sampleSize] maximum number of features to return
 * @param {boolean} [opts.force] force re-fetch
 * @returns {object} promise resolving with a GeoJSON FeatureCollection
 * - {string} type - always `FeatureCollection`
 * - {array} features - fetched features
 */
export const queryFeatureLayerForClassification = (layer, opts = {}) => {
    const layerUrl = buildFeatureLayerUrl(layer?.url, layer?.name);
    const sampleSize = opts.sampleSize || DEFAULT_CLASSIFICATION_SAMPLE;
    const cacheKey = `${layerUrl}::${sampleSize}`;
    if (!opts.force && _classificationCache[cacheKey]) {
        return _classificationCache[cacheKey];
    }
    const request = fetchFeatureLayerCollection(layer?.url, layer?.name, {
        authSourceId: layer?.security?.sourceId,
        maxRecordCount: layer?.maxRecordCount,
        maxFeatures: sampleSize
    }).then((collection) => {
        // Empty result usually means a rejected request — remove so next call retries.
        if (!collection?.features?.length) {
            delete _classificationCache[cacheKey];
        }
        return collection;
    });
    _classificationCache[cacheKey] = request;
    return request;
};
