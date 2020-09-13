/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const axios = require('../libs/ajax');
const ConfigUtils = require('../utils/ConfigUtils');

const urlUtil = require('url');
const assign = require('object-assign');

const xml2js = require('xml2js');

const capabilitiesCache = {};

const {castArray} = require('lodash');

const CoordinatesUtils = require('../utils/CoordinatesUtils');
const { getOperations, getOperation, getRequestEncoding, getDefaultStyleIdentifier, getDefaultFormat} = require('../utils/WMTSUtils');
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
        SRSList.push(CoordinatesUtils.getEPSGCode(TileMatrixSet[i]["ows:SupportedCRS"]));
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
        if (cached && new Date().getTime() < cached.timestamp + (ConfigUtils.getConfigProp('cacheExpire') || 60) * 1000) {
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
        if (cached && new Date().getTime() < cached.timestamp + (ConfigUtils.getConfigProp('cacheExpire') || 60) * 1000) {
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

module.exports = Api;
