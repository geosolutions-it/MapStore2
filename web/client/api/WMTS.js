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
import assign from 'object-assign';
import xml2js from 'xml2js';

const capabilitiesCache = {};

import { castArray } from 'lodash';
import { getEPSGCode } from '../utils/CoordinatesUtils';

import {
    getOperations,
    getOperation,
    getRequestEncoding,
    getDefaultStyleIdentifier,
    getDefaultFormat
} from '../utils/WMTSUtils';

const parseUrl = (url) => {
    const parsed = urlUtil.parse(url, true);
    return urlUtil.format(assign({}, parsed, {search: null}, {
        query: assign({
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
            .map((layer) => assign({}, layer, {
                SRS: SRSList,
                TileMatrixSet,
                // Only KVP is supported by MapInfo, for the moment. TODO: Support single layer's InfoFormat
                queryable: !!getOperation(operations, "GetFeatureInfo", "KVP"),
                requestEncoding: requestEncoding,
                style: getDefaultStyleIdentifier(layer), // it must be collected because it can be used in RESTful version to create the path
                format: getDefaultFormat(layer),
                GetTileURL: getOperation(operations, "GetTile", requestEncoding),
                capabilitiesURL: url
            }))
    };
};

const Api = {
    parseUrl,
    getRecords: function(url, startPosition, maxRecords, text) {
        const cached = capabilitiesCache[url];
        if (cached && new Date().getTime() < cached.timestamp + (getConfigProp('cacheExpire') || 60) * 1000) {
            return new Promise((resolve) => {
                resolve(searchAndPaginate(cached.data, startPosition, maxRecords, text, url));
            });
        }
        return axios.get(parseUrl(url)).then((response) => {
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
    getCapabilities: (url) => {
        const cached = capabilitiesCache[url];
        if (cached && new Date().getTime() < cached.timestamp + (getConfigProp('cacheExpire') || 60) * 1000) {
            return new Promise((resolve) => {
                resolve(cached.data);
            });
        }
        return axios.get(parseUrl(url)).then((response) => {
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
    textSearch: function(url, startPosition, maxRecords, text) {
        return Api.getRecords(url, startPosition, maxRecords, text);
    },
    reset: () => {
        Object.keys(capabilitiesCache).forEach(key => {
            delete capabilitiesCache[key];
        });
    }
};

export default Api;
