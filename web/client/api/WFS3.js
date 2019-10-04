/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import axios from 'axios';
import head from 'lodash/head';
import isString from 'lodash/isString';
import ConfigUtils from '../utils/ConfigUtils';

const capabilitiesCache = {};

const collectionToLayer = (collection) => {
    const { name, title, extent, links } = collection;
    const spatial = extent && extent.spatial || [-180, -90, 180, 90];
    const { href: layerUrl, type: format } = head((links || []).filter(({ rel }) => rel === 'tiles')) || {};
    const { href: tilingSchemes } = head((links || []).filter(({ rel }) => rel === 'tilingSchemes')) || {};
    const { href: tilingScheme } = head((links || []).filter(({ rel }) => rel === 'tilingScheme')) || {};
    return {
        name,
        title,
        type: 'wfs3',
        visibility: true,
        url: layerUrl,
        format,
        tilingScheme,
        tilingSchemes,
        bbox: {
            crs: 'EPSG:4326',
            bounds: {
                minx: spatial[0],
                miny: spatial[1],
                maxx: spatial[2],
                maxy: spatial[3]
            }
        }
    };
};

const searchAndPaginate = (json = {}, startPosition, maxRecords, text, url) => {
    const { collections } = json;
    const filteredLayers = collections
        .filter((layer = {}) => !text
        || layer.name && layer.name.toLowerCase().indexOf(text.toLowerCase()) !== -1
        || layer.title && layer.title.toLowerCase().indexOf(text.toLowerCase()) !== -1);
    return {
        numberOfRecordsMatched: filteredLayers.length,
        numberOfRecordsReturned: Math.min(maxRecords, filteredLayers.length),
        nextRecord: startPosition + Math.min(maxRecords, filteredLayers.length) + 1,
        records: filteredLayers
            .filter((layer, index) => index >= startPosition - 1 && index < startPosition - 1 + maxRecords)
            .map((collection) => ({
                ...collection,
                ...collectionToLayer(collection),
                capabilitiesUrl: url
            }))
    };
};

const parseUrl = function(url) {
    const serviceUrl = (url || '').split(/\/wfs3\//)[0];
    return `${serviceUrl}/wfs3/collections`;
};

export const getRecords = function(url, startPosition, maxRecords, text) {
    const cached = capabilitiesCache[url];
    if (cached && new Date().getTime() < cached.timestamp + (ConfigUtils.getConfigProp('cacheExpire') || 60) * 1000) {
        return new Promise((resolve) => {
            resolve(searchAndPaginate(cached.data, startPosition, maxRecords, text, url));
        });
    }
    return axios.get(parseUrl(url))
        .then(({ data }) => {
            capabilitiesCache[url] = {
                timestamp: new Date().getTime(),
                data
            };
            return searchAndPaginate(data, startPosition, maxRecords, text, url);
        });
};

export const textSearch = function(url, startPosition, maxRecords, text) {
    return getRecords(url, startPosition, maxRecords, text);
};

export const getTilingSchemes = (layer) => {
    const { tilingSchemes, tilingScheme } = layer;
    if (isString(tilingSchemes)) {
        return axios.get(tilingSchemes)
            .then(({ data }) => {
                return data && data.tilingSchemes && data.tilingSchemes.length > 0
                    ? axios.all(
                        data.tilingSchemes.map((tilingSchemeId) =>
                            axios.get(tilingScheme.replace('{tilingSchemeId}', tilingSchemeId))
                                .then(({ data: scheme }) => scheme)
                                .catch(() => null)
                        )
                    )
                        .then((schemes) => ({
                            tilingSchemes: {
                                url: tilingSchemes,
                                schemes: schemes.filter(scheme => scheme)
                            },
                            allowedSRS: schemes
                                .filter(scheme => scheme)
                                .reduce((acc, { supportedCRS }) => {
                                    return {
                                        ...acc,
                                        [supportedCRS]: true
                                    };
                                }, {})
                        }))
                    : {
                        tilingSchemes: {
                            url: tilingSchemes,
                            schemes: null
                        },
                        allowedSRS: {}
                    };
            });
    }
    return new Promise((resolve) => resolve(tilingSchemes));
};

export const getLayerFromId = (serviceUrl, collectionId) => {
    return axios.get(`${parseUrl(serviceUrl)}/${collectionId}`)
        .then(({ data: collection }) => {
            const layer = collectionToLayer(collection);
            return getTilingSchemes(layer)
                .then((params) => ({
                    ...layer,
                    ...params
                }));
        });
};

export const reset = () => {
    Object.keys(capabilitiesCache).forEach(key => {
        delete capabilitiesCache[key];
    });
};
