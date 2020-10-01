/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import ConfigUtils from '../../utils/ConfigUtils';
import xml2js from 'xml2js';
import axios from '../../libs/ajax';
import { get, castArray } from 'lodash';
import { cleanAuthParamsFromURL } from '../../utils/SecurityUtils';
import { guessFormat } from '../../utils/TMSUtils';

const capabilitiesCache = {};

const isSameSRS = (srs, projection) => srs === projection
    || srs === "EPSG:3857" && projection === "EPSG:900913"
    || srs === "EPSG:900913" && projection === "EPSG:3857";

const searchAndPaginate = (json = {}, startPosition, maxRecords, text, info = {}) => {

    const layers = castArray(get(json, 'TileMapService.TileMaps.TileMap', []));
    const { projection } = info;
    const allSRS = get(info, 'options.service.allSRS'); // this option allows to show also other layers
    const filteredLayers = layers
        .map(({ $ = {} }) => ({
            ...$, // get only the xml attributes
            href: cleanAuthParamsFromURL($.href),
            identifier: cleanAuthParamsFromURL($.href), // add identifier for the layer
            format: guessFormat($.href),
            tmsUrl: cleanAuthParamsFromURL(json.url) // Service URL
        }))
        .filter(({ srs }) => (projection && !allSRS) ? isSameSRS(srs, projection) : true)
        .filter(({ title = "", srs = "" } = {}) => !text
            || title.toLowerCase().indexOf(text.toLowerCase()) !== -1
            || srs.toLowerCase().indexOf(text.toLowerCase()) !== -1

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
export const getRecords = (url, startPosition, maxRecords, text, info) => {
    const cached = capabilitiesCache[url];
    if (cached && new Date().getTime() < cached.timestamp + (ConfigUtils.getConfigProp('cacheExpire') || 60) * 1000) {
        return new Promise((resolve) => {
            resolve(searchAndPaginate(cached.data, startPosition, maxRecords, text, info));
        });
    }
    return axios.get(url).then((response) => {
        let json;
        xml2js.parseString(response.data, { explicitArray: false }, (ignore, result) => {
            json = { ...result, url };
        });
        capabilitiesCache[url] = {
            timestamp: new Date().getTime(),
            data: json
        };
        return searchAndPaginate(json, startPosition, maxRecords, text, info);
    });
};
export const textSearch = (url, startPosition, maxRecords, text, info) => getRecords(url, startPosition, maxRecords, text, info);

