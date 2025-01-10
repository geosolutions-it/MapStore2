/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import urlUtil from 'url';
import { isArray, castArray, get } from 'lodash';
import xml2js from 'xml2js';
import axios from '../libs/ajax';
import { getConfigProp } from '../utils/ConfigUtils';
import { getWMSBoundingBox } from '../utils/CoordinatesUtils';
import { isValidGetMapFormat, isValidGetFeatureInfoFormat } from '../utils/WMSUtils';
const capabilitiesCache = {};

export const WMS_GET_CAPABILITIES_VERSION = '1.3.0';
// The describe layer request is used to detect the OWS type, WFS or WCS type (eg: get additional information for the styling)
// The default version is 1.1.1 because GeoServer is not fully supporting the version 1.3.0
export const WMS_DESCRIBE_LAYER_VERSION = '1.1.1';

export const parseUrl = (
    urls,
    query = {
        service: "WMS",
        version: WMS_GET_CAPABILITIES_VERSION,
        request: "GetCapabilities"
    },
    options
) => {
    const url = (isArray(urls) && urls || urls.split(','))[0];
    const parsed = urlUtil.parse(url, true);
    return urlUtil.format({
        ...parsed,
        search: null,
        query: {
            ...query,
            ...parsed.query,
            ...(options?.query || {})
        }
    });
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
export const extractCredits = attribution => {
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

export const flatLayers = (root) => {
    const rootLayer = root?.Layer ?? root?.layer;
    const rootName = root?.Name ?? root?.name;
    return rootLayer
        ? (castArray(rootLayer))
            .reduce((acc, current) => {
                const currentLayer = current.Layer ?? current.layer;
                const currentName = current.Name ?? current.name;
                return [
                    ...acc,
                    ...flatLayers(current),
                    ...(currentLayer && currentName ? [current] : [])
                ];
            }, [])
        : rootName && [root] || [];
};

const getFormats = (response) => {
    const root = response.Capability;
    const imageFormats = castArray(root?.Request?.GetMap?.Format || []).filter(isValidGetMapFormat);
    const infoFormats = castArray(root?.Request?.GetFeatureInfo?.Format || []).filter(isValidGetFeatureInfoFormat);
    return { imageFormats, infoFormats };
};

export const getOnlineResource = (c) => {
    return c.Request && c.Request.GetMap && c.Request.GetMap.DCPType && c.Request.GetMap.DCPType.HTTP && c.Request.GetMap.DCPType.HTTP.Get && c.Request.GetMap.DCPType.HTTP.Get.OnlineResource && c.Request.GetMap.DCPType.HTTP.Get.OnlineResource.$ || undefined;
};
export const searchAndPaginate = (json = {}, startPosition, maxRecords, text) => {
    const root = json.Capability;
    const service = json.Service;
    const onlineResource = getOnlineResource(root);
    const SRSList = root.Layer && castArray(root.Layer.SRS || root.Layer.CRS)?.map((crs) => crs.toUpperCase()) || [];
    const credits = root.Layer && root.Layer.Attribution && extractCredits(root.Layer.Attribution);
    const getMapFormats = castArray(root?.Request?.GetMap?.Format || []);
    const getFeatureInfoFormats = castArray(root?.Request?.GetFeatureInfo?.Format || []);
    const layersObj = flatLayers(root);
    const layers = isArray(layersObj) ? layersObj : [layersObj];
    const filteredLayers = layers
        .filter((layer) => !text || layer.Name.toLowerCase().indexOf(text.toLowerCase()) !== -1 || layer.Title && layer.Title.toLowerCase().indexOf(text.toLowerCase()) !== -1 || layer.Abstract && layer.Abstract.toLowerCase().indexOf(text.toLowerCase()) !== -1);
    return {
        numberOfRecordsMatched: filteredLayers.length,
        numberOfRecordsReturned: Math.min(maxRecords, filteredLayers.length),
        nextRecord: startPosition + Math.min(maxRecords, filteredLayers.length) + 1,
        service,
        layerOptions: {
            version: json?.$?.version || WMS_GET_CAPABILITIES_VERSION
        },
        records: filteredLayers
            .filter((layer, index) => index >= startPosition - 1 && index < startPosition - 1 + maxRecords)
            .map((layer) => ({
                ...layer,
                getMapFormats,
                getFeatureInfoFormats,
                onlineResource,
                SRS: SRSList,
                credits: layer.Attribution ? extractCredits(layer.Attribution) : credits
            }))
    };
};

export const getDimensions = (layer) => {
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
};
/**
 * Get the WMS capabilities given a valid url endpoint
 * @param {string} url WMS endpoint
 * @return {object} root object of the capabilities
 * - `$`: object with additional information of the capability (eg: $.version)
 * - `Capability`: capability object that contains layers and requests formats
 * - `Service`: service information object
 */
export const getCapabilities = (url) => {
    return axios.get(parseUrl(url, {
        service: "WMS",
        version: WMS_GET_CAPABILITIES_VERSION,
        request: "GetCapabilities"
    })).then((response) => {
        let json;
        xml2js.parseString(response.data, {explicitArray: false}, (ignore, result) => {
            json = result;
        });
        return (json.WMS_Capabilities || json.WMT_MS_Capabilities || {});
    });
};

export const describeLayer = (url, layer, options = {}) => {
    return axios.get(parseUrl(url, {
        service: "WMS",
        version: WMS_DESCRIBE_LAYER_VERSION,
        layers: layer,
        request: "DescribeLayer"
    }, options)).then((response) => {
        let json;
        xml2js.parseString(response.data, {explicitArray: false}, (ignore, result) => {
            json = result;
        });
        const layerDescription = json?.WMS_DescribeLayerResponse?.LayerDescription && castArray(json.WMS_DescribeLayerResponse.LayerDescription)[0];
        return layerDescription && {
            ...layerDescription?.$,
            ...(layerDescription?.Query && {
                query: castArray(layerDescription.Query).map(query => ({
                    ...query?.$
                }))
            })
        };
    });
};
export const getRecords = (url, startPosition, maxRecords, text) => {
    const cached = capabilitiesCache[url];
    if (cached && new Date().getTime() < cached.timestamp + (getConfigProp('cacheExpire') || 60) * 1000) {
        return new Promise((resolve) => {
            resolve(searchAndPaginate(cached.data, startPosition, maxRecords, text));
        });
    }
    return getCapabilities(url)
        .then((json) => {
            capabilitiesCache[url] = {
                timestamp: new Date().getTime(),
                data: json
            };
            return searchAndPaginate(json, startPosition, maxRecords, text);
        });
};
export const describeLayers = (url, layers) => {
    return axios.get(parseUrl(url, {
        service: "WMS",
        version: WMS_DESCRIBE_LAYER_VERSION,
        layers: layers,
        request: "DescribeLayer"
    })).then((response) => {
        let decriptions;
        xml2js.parseString(response.data, {explicitArray: false}, (ignore, result) => {
            decriptions = result && result.WMS_DescribeLayerResponse && result.WMS_DescribeLayerResponse.LayerDescription;
        });
        decriptions = Array.isArray(decriptions) ? decriptions : [decriptions];
        // make it compatible with json format of describe layer
        return decriptions.map(desc => ({
            ...(desc && desc.$ || {}),
            layerName: desc && desc.$ && desc.$.name,
            query: {
                ...(desc && desc.query && desc.query.$ || {})
            }
        }));
    });
};
export const textSearch = (url, startPosition, maxRecords, text) => {
    return getRecords(url, startPosition, maxRecords, text);
};
export const parseLayerCapabilities = (json, layer) => {
    const root = json.Capability;
    const layersCapabilities = flatLayers(root);
    const capabilities = layersCapabilities.find((layerCapability) => {
        const capabilityName = layerCapability.Name;
        if (layer.name.split(":").length === 2 && capabilityName && capabilityName.split(":").length === 2) {
            return layer.name === capabilityName && layerCapability;
        }
        if (capabilityName && capabilityName.split(":").length === 2) {
            return (layer.name === capabilityName.split(":")[1]) && layerCapability;
        }
        if (layer.name.split(":").length === 2) {
            return layer.name.split(":")[1] === capabilityName && layerCapability;
        }
        return layer.name === capabilityName && layerCapability;
    });
    if (capabilities) {
        const { imageFormats, infoFormats } = getFormats(json);
        return {
            ...capabilities,
            layerOptions: {
                imageFormats,
                infoFormats
            }
        };
    }
    return null;
};
export const getBBox = (record, bounds) => {
    let layer = record;
    let bbox = (layer.EX_GeographicBoundingBox || layer.exGeographicBoundingBox || getWMSBoundingBox(layer.BoundingBox) || (layer.LatLonBoundingBox && layer.LatLonBoundingBox.$) || layer.latLonBoundingBox);
    while (!bbox && layer.Layer && layer.Layer.length) {
        layer = layer.Layer[0];
        bbox = (layer.EX_GeographicBoundingBox || layer.exGeographicBoundingBox || getWMSBoundingBox(layer.BoundingBox) || (layer.LatLonBoundingBox && layer.LatLonBoundingBox.$) || layer.latLonBoundingBox);
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
};
export const reset = () => {
    Object.keys(capabilitiesCache).forEach(key => {
        delete capabilitiesCache[key];
    });
};

/**
 * Fetch the supported formats of the WMS service
 * @param url
 * @param includeGFIFormats
 * @return {object|string} formats
 */
export const getSupportedFormat = (url, includeGFIFormats = false) => {
    return getCapabilities(url)
        .then((response) => {
            const { imageFormats, infoFormats } = getFormats(response);
            if (includeGFIFormats) {
                return { imageFormats, infoFormats };
            }
            return imageFormats;
        })
        .catch(() => includeGFIFormats ? { imageFormats: [], infoFormats: [] } : []);
};

export const getJsonWMSLegend = (url) => {
    return axios.get(url)
        .then((response) => {
            if (typeof response?.data === 'string' && response.data.includes("Exception")) {
                throw new Error("Faild to get json legend");
            }
            return response?.data?.Legend || [];
        }).catch(err => { throw err; });
};

const Api = {
    flatLayers,
    parseUrl,
    getDimensions,
    getCapabilities,
    describeLayer,
    getRecords,
    describeLayers,
    textSearch,
    parseLayerCapabilities,
    getBBox,
    reset,
    getSupportedFormat
};

export default Api;
