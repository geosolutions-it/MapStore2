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

const {isArray} = require('lodash');

const parseUrl = (url) => {
    const parsed = urlUtil.parse(url, true);
    return urlUtil.format(assign({}, parsed, {
        query: assign({
            service: "WMS",
            version: "1.3.0",
            request: "GetCapabilities"
        }, parsed.query)
    }));
};

const searchAndPaginate = (json, startPosition, maxRecords, text) => {
    const layersObj = json.WMS_Capabilities.Capability.Layer.Layer || json.WMS_Capabilities.Capability.Layer;
    const layers = isArray(layersObj) ? layersObj : [layersObj];
    const filteredLayers = layers
        .filter((layer) => !text || layer.Name.toLowerCase().indexOf(text.toLowerCase()) !== -1 || (layer.Title && layer.Title.toLowerCase().indexOf(text.toLowerCase()) !== -1) || (layer.Abstract && layer.Abstract.toLowerCase().indexOf(text.toLowerCase()) !== -1));
    return {
        numberOfRecordsMatched: filteredLayers.length,
        numberOfRecordsReturned: Math.min(maxRecords, filteredLayers.length),
        nextRecord: startPosition + Math.min(maxRecords, filteredLayers.length) + 1,
        records: filteredLayers
            .filter((layer, index) => index >= (startPosition - 1) && index < (startPosition - 1) + maxRecords)
    };
};

const Api = {
    getRecords: function(url, startPosition, maxRecords, text) {
        const cached = capabilitiesCache[url];
        if (cached && new Date().getTime() < cached.timestamp + (ConfigUtils.getConfigProp('cacheExpire') || 60) * 1000) {
            return searchAndPaginate(cached.data, startPosition, maxRecords, text);
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
            return searchAndPaginate(json, startPosition, maxRecords, text);
        });
    },
    textSearch: function(url, startPosition, maxRecords, text) {
        return Api.getRecords(url, startPosition, maxRecords, text);
    }
};

module.exports = Api;
