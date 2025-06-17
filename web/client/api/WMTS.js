/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import axios from '../libs/ajax';

import { getConfigProp } from '../utils/ConfigUtils';
import urlUtil from 'url';
import xml2js from 'xml2js';

const capabilitiesCache = {};

import { castArray } from 'lodash';
import { getEPSGCode } from '../utils/CoordinatesUtils';
import { getDefaultUrl } from '../utils/URLUtils';

import {
    getOperations,
    getOperation,
    getRequestEncoding,
    getDefaultStyleIdentifier,
    getDefaultFormat
} from '../utils/WMTSUtils';
import { getAuthorizationBasic } from '../utils/SecurityUtils';

export const parseUrl = (url) => {
    const parsed = urlUtil.parse(getDefaultUrl(url), true);
    return urlUtil.format(Object.assign({}, parsed, {search: null}, {
        query: Object.assign({
            SERVICE: "WMTS",
            VERSION: "1.0.0",
            REQUEST: "GetCapabilities"
        }, parsed.query)
    }));
};

const searchAndPaginate = (json, startPosition, maxRecords, text, url) => {
    const root = json.Capabilities.Contents;
    const operations = getOperations(json);
    const requestEncoding = getRequestEncoding(json);
    const TileMatrixSet = root.TileMatrixSet && castArray(root.TileMatrixSet) || [];
    let SRSList = [];
    let len = TileMatrixSet.length;
    for (let i = 0; i < len; i++) {
        SRSList.push(getEPSGCode(TileMatrixSet[i]["ows:SupportedCRS"]));
    }
    const layersObj = root.Layer;
    const layers = castArray(layersObj);
    const filteredLayers = layers
        .filter((layer) => !text || layer["ows:Identifier"].toLowerCase().indexOf(text.toLowerCase()) !== -1 || layer["ows:Title"] && layer["ows:Title"].toLowerCase().indexOf(text.toLowerCase()) !== -1);
    return {
        numberOfRecordsMatched: filteredLayers.length,
        numberOfRecordsReturned: Math.min(maxRecords, filteredLayers.length),
        nextRecord: startPosition + Math.min(maxRecords, filteredLayers.length) + 1,
        records: filteredLayers
            .filter((layer, index) => index >= startPosition - 1 && index < startPosition - 1 + maxRecords)
            .map((layer) => Object.assign({}, layer, {
                SRS: SRSList,
                TileMatrixSet,
                // Only KVP is supported by MapInfo, for the moment. TODO: Support single layer's InfoFormat
                queryable: !!getOperation(operations, "GetFeatureInfo", "KVP"),
                requestEncoding: requestEncoding,
                style: getDefaultStyleIdentifier(layer), // it must be collected because it can be used in RESTful version to create the path
                format: getDefaultFormat(layer),
                formats: castArray(layer.Format),
                GetTileURL: getOperation(operations, "GetTile", requestEncoding),
                capabilitiesURL: url
            }))
    };
};

const Api = {
    parseUrl,
    getRecords: function(url, startPosition, maxRecords, text, options) {
        const cached = capabilitiesCache[url];
        if (cached && new Date().getTime() < cached.timestamp + (getConfigProp('cacheExpire') || 60) * 1000) {
            return new Promise((resolve) => {
                resolve(searchAndPaginate(cached.data, startPosition, maxRecords, text, url));
            });
        }
        const protectedId = options?.options?.service?.protectedId;
        let headers = getAuthorizationBasic(protectedId);
        return axios.get(parseUrl(url), {headers}).then((response) => {
            let json;
            xml2js.parseString(response.data, {explicitArray: false}, (ignore, result) => {
                json = result;
            });
            capabilitiesCache[url] = {
                timestamp: new Date().getTime(),
                data: json
            };
            return searchAndPaginate(json, startPosition, maxRecords, text, url);
        });
    },
    getCapabilities: (url, options) => {
        if (options?.force && capabilitiesCache[url]) {
            delete capabilitiesCache[url];
        }
        const cached = capabilitiesCache[url];
        if (cached && new Date().getTime() < cached.timestamp + (getConfigProp('cacheExpire') || 60) * 1000) {
            return new Promise((resolve) => {
                resolve(cached.data);
            });
        }
        const protectedId = options?.options?.service?.protectedId;
        let headers = getAuthorizationBasic(protectedId);
        return axios.get(parseUrl(url), {headers}).then((response) => {
            let json;
            xml2js.parseString(response.data, {explicitArray: false}, (ignore, result) => {
                json = result;
            });
            capabilitiesCache[url] = {
                timestamp: new Date().getTime(),
                data: json
            };
            return json;
        });
    },
    textSearch: function(url, startPosition, maxRecords, text, options) {
        return Api.getRecords(url, startPosition, maxRecords, text, options);
    },
    reset: () => {
        Object.keys(capabilitiesCache).forEach(key => {
            delete capabilitiesCache[key];
        });
    }
};

/**
 * Return tileMatrixSets, tileMatrixSetLinks, tileGrids, styles and formats of from WMTS capabilities for a specific layer
 * @param {string} url wmts endpoint url
 * @param {string} layerName layer name
 * @param {object} options optional configuration
 * @param {boolean} options.force if true delete the cache for this url and force the request
 * @return {promise}
 */
export const getLayerTileMatrixSetsInfo = (url, layerName = '', options) => {
    return Api.getCapabilities(url, { force: options?.force })
        .then((response) => {
            const layerParts = layerName.split(':');
            const layers = castArray(response?.Capabilities?.Contents?.Layer || []);
            const wmtsLayer = layers.find((layer) => layer['ows:Identifier'] === layerParts[1] || layer['ows:Identifier'] === layerName);
            const tileMatrixSetLinks = castArray(wmtsLayer?.TileMatrixSetLink || []).map(({ TileMatrixSet }) => TileMatrixSet);
            const tileMatrixSets = castArray(response?.Capabilities?.Contents?.TileMatrixSet || []).filter((tileMatrixSet) => tileMatrixSetLinks.includes(tileMatrixSet['ows:Identifier']));
            const tileGrids = tileMatrixSets.map((tileMatrixSet) => {
                const origins = tileMatrixSet.TileMatrix.map((tileMatrixLevel) => tileMatrixLevel.TopLeftCorner.split(' ').map(parseFloat));
                const tileSizes = tileMatrixSet.TileMatrix.map((tileMatrixLevel) => [parseFloat(tileMatrixLevel.TileWidth), parseFloat(tileMatrixLevel.TileHeight)]);
                const firstOrigin = origins[0];
                const firsTileSize = tileSizes[0];
                const isSingleOrigin = origins.every(entry => firstOrigin[0] === entry[0] && firstOrigin[1] === entry[1]);
                const isSingleTileSize = tileSizes.every(entry => firsTileSize[0] === entry[0] && firsTileSize[1] === entry[1]);
                return {
                    id: tileMatrixSet['ows:Identifier'],
                    crs: getEPSGCode(tileMatrixSet['ows:SupportedCRS']),
                    scales: tileMatrixSet.TileMatrix.map((tileMatrixLevel) => parseFloat(tileMatrixLevel.ScaleDenominator)),
                    ...(isSingleOrigin ? { origin: firstOrigin } : { origins }),
                    ...(isSingleTileSize ? { tileSize: firsTileSize } : { tileSizes })
                };
            });
            return {
                tileMatrixSets,
                tileMatrixSetLinks,
                tileGrids,
                styles: castArray(wmtsLayer?.Style || []).map((style) => style['ows:Identifier']),
                formats: castArray(wmtsLayer?.Format || [])
            };
        });
};

export default Api;
