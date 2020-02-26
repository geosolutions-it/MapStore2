/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import ConfigUtils from '../utils/ConfigUtils';
import xml2js from 'xml2js';
import axios from '../libs/ajax';
import {castArray} from 'lodash';


const capabilitiesCache = {};


const searchAndPaginate = (json = {}, startPosition, maxRecords, text) => {

    const layers = castArray(json.TileSets.TileSet);
    const filteredLayers = layers.filter((layer) => !text
            || layer.Name.toLowerCase().indexOf(text.toLowerCase()) !== -1
            || layer.Title && layer.Title.toLowerCase().indexOf(text.toLowerCase()) !== -1
            || layer.Abstract && layer.Abstract.toLowerCase().indexOf(text.toLowerCase()) !== -1
    );
    return {
        numberOfRecordsMatched: filteredLayers.length,
        numberOfRecordsReturned: Math.min(maxRecords, filteredLayers.length),
        nextRecord: startPosition + Math.min(maxRecords, filteredLayers.length) + 1,
        records: filteredLayers
            .filter((layer, index) => index >= startPosition - 1 && index < startPosition - 1 + maxRecords)
    };
};

export const parseUrl = url => url;
export const getRecords = (url, startPosition, maxRecords, text) => {
    const cached = capabilitiesCache[url];
    if (cached && new Date().getTime() < cached.timestamp + (ConfigUtils.getConfigProp('cacheExpire') || 60) * 1000) {
        return new Promise((resolve) => {
            resolve(searchAndPaginate(cached.data, startPosition, maxRecords, text));
        });
    }
    return axios.get(url).then((response) => {
        let json;
        xml2js.parseString(response.data, { explicitArray: false }, (ignore, result) => {
            json = result;
        });
        capabilitiesCache[url] = {
            timestamp: new Date().getTime(),
            data: json
        };
        return searchAndPaginate(json, startPosition, maxRecords, text);
    });
};
// export const textSearch = (url, startPosition, maxRecords, text) => getRecords(url, startPosition, maxRecords, text);

