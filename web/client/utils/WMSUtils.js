/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { uniq, isObject, castArray } from 'lodash';
import { getAvailableInfoFormat } from "./MapInfoUtils";
import { getConfigProp } from './ConfigUtils';

/**
 * Get unique array of supported GetFeatureInfo formats
 * @return {array} GetFeatureInfo formats
 */
export const getDefaultSupportedGetFeatureInfoFormats = () => {
    return uniq(Object.values(getAvailableInfoFormat()));
};
/**
 * Get unique array of supported GetMap formats
 * @return {array} GetMap formats
 */
export const getDefaultSupportedGetMapFormat = () => {
    return uniq([
        "image/png",
        "image/gif",
        "image/jpeg",
        "image/png8",
        "image/png; mode=8bit",
        "image/png; mode=24bit",
        "image/vnd.jpeg-png",
        "image/vnd.jpeg-png8",
        ...(getConfigProp('supportedGetMapFormats') || [])
    ]);
};
/**
 * Validate GetMap format from WMS capabilities
 * @param {string} format GetMap format
 * @return {boolean}
 */
export const isValidGetMapFormat = (format) => {
    return getDefaultSupportedGetMapFormat().includes(format);
};
/**
 * Validate GetFeatureInfo format from WMS capabilities
 * @param {string} format GetFeatureInfo format
 * @return {boolean}
 */
export const isValidGetFeatureInfoFormat = (format) => {
    return getDefaultSupportedGetFeatureInfoFormats().includes(format);
};
/**
 * Parses layer info from capabilities object
 * @param {object} capabilities capabilities section of the layer as an object from xml2js parsing of the WMS capabilities
 * @return {object} parsed data that can be assigned to the MapStore layer object. It contains the following properties:
 * - `capabilities`: the original capabilities object
 * - `description`: the layer abstract
 * - `boundingBox`: the layer bounding box
 * - `availableStyles`: the list of available styles
 */
export const getLayerOptions = function(capabilities) {
    return isObject(capabilities)
        ? {
            capabilities,
            description: capabilities.Abstract,
            boundingBox: capabilities?.EX_GeographicBoundingBox
                ? {
                    minx: capabilities.EX_GeographicBoundingBox?.westBoundLongitude,
                    miny: capabilities.EX_GeographicBoundingBox?.southBoundLatitude,
                    maxx: capabilities.EX_GeographicBoundingBox?.eastBoundLongitude,
                    maxy: capabilities.EX_GeographicBoundingBox?.northBoundLatitude
                }
                : capabilities?.LatLonBoundingBox?.$,
            availableStyles: capabilities?.Style && castArray(capabilities.Style)
                .map((capStyle) => ({
                    name: capStyle.Name,
                    ...(capStyle.Title && { title: capStyle.Title }),
                    ...(capStyle.Abstract && { _abstract: capStyle.Abstract }),
                    ...(capStyle.LegendURL && {
                        legendURL: castArray(capStyle.LegendURL)
                            .map((capLegendURL) => ({
                                width: capLegendURL?.$?.width ? parseFloat(capLegendURL.$.width) : undefined,
                                height: capLegendURL?.$?.height ? parseFloat(capLegendURL.$.height) : undefined,
                                format: capLegendURL?.Format,
                                ...(capLegendURL?.OnlineResource?.$?.['xlink:type'] &&
                                capLegendURL?.OnlineResource?.$?.['xlink:href'] && {
                                    onlineResource: {
                                        type: capLegendURL.OnlineResource.$['xlink:type'],
                                        href: capLegendURL.OnlineResource.$['xlink:href']
                                    }
                                })
                            }))
                    })
                }))
        }
        : {};
};
