/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const axios = require('../libs/ajax');
const ConfigUtils = require('../utils/ConfigUtils');
const CoordinatesUtils = require('../utils/CoordinatesUtils');

const urlUtil = require('url');
const assign = require('object-assign');

const xml2js = require('xml2js');

const capabilitiesCache = {};

const {isArray, castArray, get} = require('lodash');

const parseUrl = (urls) => {
    const url = (isArray(urls) && urls || urls.split(','))[0];
    const parsed = urlUtil.parse(url, true);
    return urlUtil.format(assign({}, parsed, {search: null}, {
        query: assign({
            service: "WMS",
            version: "1.3.0",
            request: "GetCapabilities"
        }, parsed.query)
    }));
};

/**
 * Extract `credits` property from layer's Attribution
 * (Web Map Service Implementation Specification OGC 01-068r3 - 7.1.4.5.9 )
 * @param {object} attribution Attribution object of WMS Capabilities (parsed with xml2js default format)
 * @return {object} an object to place in `credits` attribute of layer with the structure in the example.
 * @example
 * {
 *     title: "content of <Title></Title>",
 *     imageUrl: "url of the image linked as LogoURL",
 *     link: "http://some.site.of.reference",
 *     logo: { // more info about the logo
 *         format: "image/png",
 *         width: "200",
 *         height: "100"
 *     }
 * }
 *
 */
const extractCredits = attribution => {
    const title = attribution && attribution.Title;
    const logo = attribution.LogoURL && {
        ...(get(attribution, 'LogoURL.$') || {}),
        format: get(attribution, 'LogoURL.Format') // e.g. image/png
    };
    const link = get(attribution, 'OnlineResource.$["xlink:href"]');
    return {
        title,
        logo,
        imageUrl: get(attribution, 'LogoURL.OnlineResource.$["xlink:href"]'),
        link
    };
};

const _ = require('lodash');

const flatLayers = (root) => {
    return root.Layer ? (isArray(root.Layer) && root.Layer || [root.Layer]).reduce((previous, current) => {
        return previous.concat(flatLayers(current)).concat(current.Layer && current.Name ? [current] : []);
    }, []) : root.Name && [root] || [];
};
const getOnlineResource = (c) => {
    return c.Request && c.Request.GetMap && c.Request.GetMap.DCPType && c.Request.GetMap.DCPType.HTTP && c.Request.GetMap.DCPType.HTTP.Get && c.Request.GetMap.DCPType.HTTP.Get.OnlineResource && c.Request.GetMap.DCPType.HTTP.Get.OnlineResource.$ || undefined;
};
const searchAndPaginate = (json = {}, startPosition, maxRecords, text) => {
    const root = (json.WMS_Capabilities || json.WMT_MS_Capabilities || {}).Capability;
    const service = (json.WMS_Capabilities || json.WMT_MS_Capabilities || {}).Service;
    const onlineResource = getOnlineResource(root);
    const SRSList = root.Layer && (root.Layer.SRS || root.Layer.CRS) || [];
    const credits = root.Layer && root.Layer.Attribution && extractCredits(root.Layer.Attribution);
    const rootFormats = root.Request && root.Request.GetMap && root.Request.GetMap.Format || [];
    const layersObj = flatLayers(root);
    const layers = isArray(layersObj) ? layersObj : [layersObj];
    const filteredLayers = layers
        .filter((layer) => !text || layer.Name.toLowerCase().indexOf(text.toLowerCase()) !== -1 || layer.Title && layer.Title.toLowerCase().indexOf(text.toLowerCase()) !== -1 || layer.Abstract && layer.Abstract.toLowerCase().indexOf(text.toLowerCase()) !== -1);
    return {
        numberOfRecordsMatched: filteredLayers.length,
        numberOfRecordsReturned: Math.min(maxRecords, filteredLayers.length),
        nextRecord: startPosition + Math.min(maxRecords, filteredLayers.length) + 1,
        service,
        records: filteredLayers
            .filter((layer, index) => index >= startPosition - 1 && index < startPosition - 1 + maxRecords)
            .map((layer) => assign({}, layer, { formats: rootFormats, onlineResource, SRS: SRSList, credits: layer.Attribution ? extractCredits(layer.Attribution) : credits}))
    };
};

const Api = {
    flatLayers,
    parseUrl,
    getDimensions: function(layer) {
        return castArray(layer.Dimension || layer.dimension || []).map((dim, index) => {
            const extent = (layer.Extent && castArray(layer.Extent)[index] || layer.extent && castArray(layer.extent)[index]);
            return {
                name: dim.$.name,
                units: dim.$.units,
                unitSymbol: dim.$.unitSymbol,
                "default": dim.$.default || (extent && extent.$.default),
                values: dim._ && dim._.split(',') || extent && extent._ && extent._.split(',')
            };
        });
    },
    getCapabilities: function(url, raw) {
        const parsed = urlUtil.parse(url, true);
        const getCapabilitiesUrl = urlUtil.format(assign({}, parsed, {
            query: assign({
                service: "WMS",
                version: "1.1.1",
                request: "GetCapabilities"
            }, parsed.query)
        }));
        return new Promise((resolve) => {
            require.ensure(['../utils/ogc/WMS'], () => {
                const {unmarshaller} = require('../utils/ogc/WMS');
                resolve(axios.get(parseUrl(getCapabilitiesUrl)).then((response) => {
                    if (raw) {
                        let json;
                        xml2js.parseString(response.data, {explicitArray: false}, (ignore, result) => {
                            json = result;
                        });
                        return json;
                    }
                    let json = unmarshaller.unmarshalString(response.data);
                    return json && json.value;
                }));
            });
        });
    },
    describeLayer: function(url, layers, options = {}) {
        const parsed = urlUtil.parse(url, true);
        const describeLayerUrl = urlUtil.format(assign({}, parsed, {
            query: assign({
                service: "WMS",
                version: "1.1.1",
                layers: layers,
                request: "DescribeLayer"
            },
            parsed.query,
            options.query || {})
        }));
        return new Promise((resolve) => {
            require.ensure(['../utils/ogc/WMS'], () => {
                const {unmarshaller} = require('../utils/ogc/WMS');
                resolve(axios.get(parseUrl(describeLayerUrl)).then((response) => {
                    let json = unmarshaller.unmarshalString(response.data);
                    return json && json.value && json.value.layerDescription && json.value.layerDescription[0];

                }));
            });
        });
    },
    getRecords: function(url, startPosition, maxRecords, text) {
        const cached = capabilitiesCache[url];
        if (cached && new Date().getTime() < cached.timestamp + (ConfigUtils.getConfigProp('cacheExpire') || 60) * 1000) {
            return new Promise((resolve) => {
                resolve(searchAndPaginate(cached.data, startPosition, maxRecords, text));
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
            return searchAndPaginate(json, startPosition, maxRecords, text);
        });
    },
    describeLayers: function(url, layers) {
        const parsed = urlUtil.parse(url, true);
        const describeLayerUrl = urlUtil.format(assign({}, parsed, {
            query: assign({
                service: "WMS",
                version: "1.1.1",
                layers: layers,
                request: "DescribeLayer"
            }, parsed.query)
        }));
        return axios.get(parseUrl(describeLayerUrl)).then((response) => {
            let decriptions;
            xml2js.parseString(response.data, {explicitArray: false}, (ignore, result) => {
                decriptions = result && result.WMS_DescribeLayerResponse && result.WMS_DescribeLayerResponse.LayerDescription;
            });
            decriptions = Array.isArray(decriptions) ? decriptions : [decriptions];
            // make it compatible with json format of describe layer
            return decriptions.map(desc => ({
                ...desc && desc.$ || {},
                layerName: desc && desc.$ && desc.$.name,
                query: {
                    ...desc && desc.query && desc.query.$ || {}
                }
            }));
        });
    },
    textSearch: function(url, startPosition, maxRecords, text) {
        return Api.getRecords(url, startPosition, maxRecords, text);
    },
    parseLayerCapabilities: function(capabilities, layer, lyrs) {
        const layers = castArray(lyrs || _.get(capabilities, "capability.layer.layer"));
        return layers.reduce((previous, capability) => {
            if (previous) {
                return previous;
            }
            if (!capability.name && capability.layer) {
                return this.parseLayerCapabilities(capabilities, layer, castArray(capability.layer));
            } else if (layer.name.split(":").length === 2 && capability.name && capability.name.split(":").length === 2) {
                return layer.name === capability.name && capability;
            } else if (capability.name && capability.name.split(":").length === 2) {
                return (layer.name === capability.name.split(":")[1]) && capability;
            } else if (layer.name.split(":").length === 2) {
                return layer.name.split(":")[1] === capability.name && capability;
            }
            return layer.name === capability.name && capability;
        }, null);
    },
    getBBox: function(record, bounds) {
        let layer = record;
        let bbox = (layer.EX_GeographicBoundingBox || layer.exGeographicBoundingBox || CoordinatesUtils.getWMSBoundingBox(layer.BoundingBox) || (layer.LatLonBoundingBox && layer.LatLonBoundingBox.$) || layer.latLonBoundingBox);
        while (!bbox && layer.Layer && layer.Layer.length) {
            layer = layer.Layer[0];
            bbox = (layer.EX_GeographicBoundingBox || layer.exGeographicBoundingBox || CoordinatesUtils.getWMSBoundingBox(layer.BoundingBox) || (layer.LatLonBoundingBox && layer.LatLonBoundingBox.$) || layer.latLonBoundingBox);
        }
        if (!bbox) {
            bbox = {
                westBoundLongitude: -180.0,
                southBoundLatitude: -90.0,
                eastBoundLongitude: 180.0,
                northBoundLatitude: 90.0
            };
        }
        const catalogBounds = {
            extent: [
                bbox.westBoundLongitude || bbox.minx,
                bbox.southBoundLatitude || bbox.miny,
                bbox.eastBoundLongitude || bbox.maxx,
                bbox.northBoundLatitude || bbox.maxy
            ],
            crs: "EPSG:4326"
        };
        if (bounds) {
            return {
                crs: catalogBounds.crs,
                bounds: {
                    minx: catalogBounds.extent[0],
                    miny: catalogBounds.extent[1],
                    maxx: catalogBounds.extent[2],
                    maxy: catalogBounds.extent[3]
                }
            };
        }
        return catalogBounds;
    },
    reset: () => {
        Object.keys(capabilitiesCache).forEach(key => {
            delete capabilitiesCache[key];
        });
    }
};

module.exports = Api;
