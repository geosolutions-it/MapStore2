/**
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { INFO_FORMATS, INFO_FORMATS_BY_MIME_TYPE, JSON_MIME_TYPE, GEOJSON_MIME_TYPE, validator } from './FeatureInfoUtils';

import pointOnSurface from 'turf-point-on-surface';
import { findIndex } from 'lodash';
import iconUrl from '../components/map/openlayers/img/marker-icon.png';
import JSONViewer from '../components/data/identify/viewers/JSONViewer';
import HTMLViewer from '../components/data/identify/viewers/HTMLViewer';
import TextViewer from '../components/data/identify/viewers/TextViewer';

import wfs from './mapinfo/wfs';
import wms from './mapinfo/wms';
import wmts from './mapinfo/wmts';
import vector from './mapinfo/vector';
import threeDTiles from './mapinfo/threeDTiles';
import model from './mapinfo/model';
import arcgis from './mapinfo/arcgis';
import cog from './mapinfo/cog';
import flatgeobuf from './mapinfo/flatgeobuf';
// TODO import only index in ./mapinfo

let MapInfoUtils;
/**
 * Map of info modes which are used to display feature info data (identify tools).
 * To be distinguished with INFO_FORMATS which is the map of mime types used in client server communication.
 * These are strictly a representation of the various ways that info data is visualized.
 * Has an N <=> N relationship with INFO_FORMATS.
 */
const INFO_VIEW_MODES = {
    TEXT: "TEXT",
    PROPERTIES: "PROPERTIES",
    HTML: "HTML",
    TEMPLATE: "TEMPLATE"
};

/**
 * @returns {object} Map of views which are used to display feature info data (identify tools).
 */
export const getInfoViewModes = () => {
    return {...INFO_VIEW_MODES};
};
/**
 * Given an `infoFormat` mime-type passed, it returns the default view mode (e.g. `PROPERTIES`, `HTML`, `TEXT`) for the format selected.
 *
 * @param {string} infoFormat the info format mime type.
 * @returns {string} the info view mode that is used for that info format.
 */
export const getDefaultInfoViewMode = (infoFormat) => {
    let infoView;
    switch (infoFormat) {
    case INFO_FORMATS.TEXT:
        infoView = INFO_VIEW_MODES.TEXT;
        break;
    case INFO_FORMATS.HTML:
        infoView = INFO_VIEW_MODES.HTML;
        break;
    case INFO_FORMATS.JSON:
        infoView = INFO_VIEW_MODES.PROPERTIES;
        break;
    case INFO_FORMATS.GEOJSON:
        infoView = INFO_VIEW_MODES.PROPERTIES;
        break;
    default:
        // TODO: re-assess leaving default null value, this way tests work but caller is burdened with fallback.
        infoView;
    }

    return infoView;
};
/**
 * Given a infoViewMode (e.g. "HTML", "PROPERTIES", "TEMPLATE"), returns the mime-type to use for the request for the given layer.
 *
 * @param {string} infoView the info view mode.
 * @param {array} layerInfoFormatCfg the layer supported GFI mime types.
 * @returns {string} the info format mime type.
 */
export const getInfoFormatByInfoView = (infoView, layerInfoFormatCfg) => {
    let infoFormat;
    switch (infoView) {
    case INFO_VIEW_MODES.TEXT:
        infoFormat = INFO_FORMATS.TEXT;
        break;
    case INFO_VIEW_MODES.HTML:
        infoFormat = INFO_FORMATS.HTML;
        break;
    case INFO_VIEW_MODES.PROPERTIES:
    case INFO_VIEW_MODES.TEMPLATE:
        infoFormat = layerInfoFormatCfg?.includes(GEOJSON_MIME_TYPE) ? INFO_FORMATS.GEOJSON : INFO_FORMATS.JSON;
        break;
    default:
        // TODO: re-assess leaving default null value, this way tests work but caller is burdened with fallback.
        infoFormat;
    }

    return infoFormat;
};

/**
 * specifies which info formats are currently supported
 */
//           default format ↴
export const SUPPORTED_FORMATS = ['TEXT', 'HTML', 'JSON', 'GEOJSON'];

export const EMPTY_RESOURCE_VALUE = 'NODATA';

/**
 * @return a filtered version of INFO_FORMATS object.
 * the returned object contains only keys that SUPPORTED_FORMATS contains.
 */
export const getAvailableInfoFormat = () => {
    return Object.keys(INFO_FORMATS).filter((k) => {
        return MapInfoUtils.SUPPORTED_FORMATS.indexOf(k) !== -1;
    }).reduce((prev, k) => {
        prev[k] = INFO_FORMATS[k];
        return prev;
    }, {});
};
/**
 * @return the label of an inputformat given the value
 */
export const getLabelFromValue = (value) => {
    return MapInfoUtils.getAvailableInfoFormatLabels().filter(info => INFO_FORMATS[info] === value)[0] || "TEXT";
};
/**
 * @return like getAvailableInfoFormat but return an array filled with the keys
 */
export const getAvailableInfoFormatLabels = () => {
    return Object.keys(MapInfoUtils.getAvailableInfoFormat());
};
/**
 * @return like getAvailableInfoFormat but return an array filled with the values
 */
export const getAvailableInfoFormatValues = () => {
    return Object.keys(MapInfoUtils.getAvailableInfoFormat()).map( label => {
        return INFO_FORMATS[label];
    });
};
/**
 * @return {string} the default info format value
 */
export const getDefaultInfoFormatValue = () => {
    return INFO_FORMATS[MapInfoUtils.SUPPORTED_FORMATS[0]];
};
/**
 * @param {object} param object map of params for a getFeatureInfo request.
 * @return {boolean} Check if param.info_format of param.outputFormat is set as json / geojson mime type.
 */
export const isDataFormat = (param) => {
    return param?.info_format === JSON_MIME_TYPE
        || param?.outputFormat === JSON_MIME_TYPE
        || param?.info_format === GEOJSON_MIME_TYPE
        || param?.outputFormat === GEOJSON_MIME_TYPE;
};
/**
 * returns feature info options of layer
 * @param layer {object} layer object
 * @return {object} feature info options
 */
export const getLayerFeatureInfo = (layer) => {
    return layer && layer.featureInfo && {...layer.featureInfo} || {};
};
/**
 * Extracts the proper mime time to use for the layer, given the passed props that determine the preferred type. This
 *  helps to convert, for instance, the mime-type set as default for the map (e.g. `application/json`) into the effective
 * mime type requested by the server (e.g. `application/geo+json`)
 * @param {object} layer the layer
 * @param props.format the preferred format, corresponding to the global settings information sheet field. it can be a mime type like `application/json`.
 * @return {string} the info format value from layer, otherwise the info format in settings
 */
export const getDefaultInfoFormatValueFromLayer = (layer, props) => {
    const featInfoFormat = getLayerFeatureInfo(layer)?.format;
    if (featInfoFormat) {
        // When the user explicitly configures the format from the layer settings => feature info page, return directly from definition map.
        // Check if featInfoFormat is an actual view, otherwise retrieve infoFormat directly.
        return Object.values(getInfoViewModes()).includes(featInfoFormat)
            ? getInfoFormatByInfoView(featInfoFormat, layer.infoFormats)
            : getAvailableInfoFormat()[featInfoFormat];
    }
    if (props.format) {
        if (props.format === JSON_MIME_TYPE && layer.infoFormats && layer.infoFormats.includes(GEOJSON_MIME_TYPE)) {
            // When global settings is configured for PROPERTIES (json), layer settings are not used and the layer.info_format configuration supports geo+json
            // then override global settings and set param.info_format to geo+json mime type explicitly.
            return GEOJSON_MIME_TYPE;
        }

        // otherwise, preserve and obey the global configration for getFeatureInfo mime type.
        return props.format;
    }

    // if global configration somehow fails provide a last fallback.
    return MapInfoUtils.getDefaultInfoFormatValue();
};
/**
 * @param {object} layer a layer object
 * @returns {object} the viewer configured for the layer. If viewer is not configured, it returns an empty object.
 */
export const getLayerFeatureInfoViewer = (layer) => {
    if (layer.featureInfo
        && layer.featureInfo.viewer) {
        return layer.featureInfo.viewer;
    }
    return {};
};
export const clickedPointToGeoJson = (clickedPoint) => {
    if (!clickedPoint) {
        return [];
    }
    if (clickedPoint.type === "Feature") {
        let features = [pointOnSurface(clickedPoint)];
        if (clickedPoint && clickedPoint.geometry && clickedPoint.geometry.type !== "Point") {
            features.push(clickedPoint);
        }
        return features;
    }

    if (clickedPoint.lng === undefined || clickedPoint.lat === undefined) {
        return clickedPoint.features || [];
    }
    return [
        ...(clickedPoint.features || []), // highlight features
        {
            id: "get-feature-info-point",
            type: "Feature",
            geometry: {
                type: 'Point',
                coordinates: [
                    parseFloat(clickedPoint.lng),
                    parseFloat(clickedPoint.lat),
                    ...(clickedPoint.height !== undefined
                        ? [parseFloat(clickedPoint.height)]
                        : [])
                ]
            },
            properties: {
                id: 'get-feature-info-point'
            },
            style: [{
                iconUrl,
                iconAnchor: [12, 41], // in leaflet there is no anchor in fraction
                iconSize: [25, 41],
                leaderLine: clickedPoint.height !== undefined
            }]

        }
    ];
};
export const getMarkerLayer = (name, clickedMapPoint, styleName, otherParams, markerLabel) => {
    return {
        type: 'vector',
        visibility: true,
        queryable: false,
        name: name || "GetFeatureInfo",
        styleName: styleName || "marker",
        label: markerLabel,
        features: MapInfoUtils.clickedPointToGeoJson(clickedMapPoint),
        ...otherParams
    };
};
/**
 * Creates GFI request and metadata for specific layer.
 * @param {object} layer the layer object
 * @param {object} options the options for the request
 * @param {string} options.format the format to use
 * @param {string} options.map the map object, with projection and
 * @param {object} options.point
 */
export const buildIdentifyRequest = (layer, options) => {
    if (MapInfoUtils.services[layer.type]) {
        let infoFormat = MapInfoUtils.getDefaultInfoFormatValueFromLayer(layer, options);
        let viewer = MapInfoUtils.getLayerFeatureInfoViewer(layer);
        const featureInfo = MapInfoUtils.getLayerFeatureInfo(layer);
        return MapInfoUtils.services[layer.type].buildRequest(layer, options, infoFormat, viewer, featureInfo);
    }
    return {};
};
/**
 * Returns an Observable that emits the response when ready.
 * @param {object} layer the layer
 * @param {string} baseURL the URL for the request
 * @param {object} params for the request
 */
export const getIdentifyFlow = (layer, baseURL, params) => {
    if (MapInfoUtils.services[layer.type] && MapInfoUtils.services[layer.type].getIdentifyFlow) {
        return MapInfoUtils.services[layer.type].getIdentifyFlow(layer, baseURL, params);
    }
    return null;
};

const deduceInfoFormat = (response) => {
    let infoFormat;
    // Handle WMS, WMTS
    if (response.queryParams && response.queryParams.hasOwnProperty('info_format')) {
        infoFormat = response.queryParams.info_format;
    }
    // handle WFS
    if (response.queryParams && response.queryParams.hasOwnProperty('outputFormat')) {
        infoFormat = response.queryParams.outputFormat;
    }
    return infoFormat;
};

const determineValidatorFormat = (response, format) => {
    if (response.format) return response.format;

    const infoFormat = deduceInfoFormat(response);
    return INFO_FORMATS_BY_MIME_TYPE[infoFormat] || INFO_FORMATS_BY_MIME_TYPE[format];
};

const determineValidator = (response, format) => {
    const validatorFormat = determineValidatorFormat(response, format);
    return validator(validatorFormat);
};

export const getValidator = (format) => {
    return {
        getValidResponses: (responses) => {
            return responses.filter((current) => {
                if (current) {
                    return determineValidator(current, format).isValidResponse(current);
                }
                return false;
            });
        },
        getNoValidResponses: (responses) => {
            return responses.filter((current) => {
                if (current) {
                    return !determineValidator(current, format).isValidResponse(current);
                }
                return false;
            });
        }
    };
};
export const getViewers = () => {
    return {
        [INFO_VIEW_MODES.TEMPLATE]: JSONViewer,
        [INFO_VIEW_MODES.PROPERTIES]: JSONViewer,
        [INFO_VIEW_MODES.HTML]: HTMLViewer,
        [INFO_VIEW_MODES.TEXT]: TextViewer
    };
};
/**
 * @param {string} infoFormat the info format key corresponding to a specific mime type in INFO_FORMATS OR a custom viewer key set by the user.
 * @param {object} viewers a map of {infoFormat: viewerType} (see MapInfoUtils.getViewers).
 * @returns {jsx} the associated viewer component.
 */
export const getDefaultViewer = function(infoFormat, viewers = getViewers()) {
    let isInfoKey = getAvailableInfoFormatLabels()?.includes(infoFormat);
    let isInfoValue = getAvailableInfoFormatValues()?.includes(infoFormat);
    if (isInfoKey) {
        return viewers[getDefaultInfoViewMode(getAvailableInfoFormat()[infoFormat])];
    }
    if (isInfoValue) {
        return viewers[getDefaultInfoViewMode(infoFormat)];
    }

    return viewers[infoFormat];
};
export const defaultQueryableFilter = (l) => {
    return l.visibility &&
        MapInfoUtils.services[l.type] &&
        (l.queryable === undefined || l.queryable) &&
        l.group !== "background" && l?.featureInfo?.format !== 'HIDDEN'
    ;
};
export const services = {
    'wfs': wfs,
    'wms': wms,
    'wmts': wmts,
    'vector': vector,
    '3dtiles': threeDTiles,
    'model': model,
    'arcgis': arcgis,
    'flatgeobuf': flatgeobuf,
    'cog': cog
};
/**
 * To get the custom viewer with the given type
 * This way you can extend the featureinfo with your custom viewers in external projects.
 * @param type {string} the string the component was registered with
 * @return {object} the registered component
 */
export const getViewer = (type) => {
    return !!MapInfoUtils.VIEWERS[type] ? MapInfoUtils.VIEWERS[type] : null;
};
/**
 * To register a custom viewer
 * This way you can extend the featureinfo with your custom viewers in external projects.
 * @param type {string} the string you want to register the component with
 * @param viewer {object} the component to register
 */
export const setViewer = (type, viewer) => {
    MapInfoUtils.VIEWERS[type] = viewer;
};
/**
 * returns new options filtered by include and exclude options
 * @param layer {object} layer object
 * @param includeOptions {array} options to include
 * @param excludeParams {array} options to exclude
 * @return {object} new filtered options
 */
export const filterRequestParams = (layer, includeOptions, excludeParams) => {
    let includeOpt = includeOptions || [];
    let excludeList = excludeParams || [];
    let options = Object.keys(layer).reduce((op, next) => {
        if (next !== "params" && includeOpt.indexOf(next) !== -1) {
            op[next] = layer[next];
        } else if (next === "params" && excludeList.length > 0) {
            let params = layer[next];
            Object.keys(params).forEach((n) => {
                if (findIndex(excludeList, (el) => {return el === n; }) === -1) {
                    op[n] = params[n];
                }
            }, {});
        }
        return op;
    }, {});
    return options;
};

let rowViewers = {};

export const registerRowViewer = (name, options) => {
    rowViewers[name] = options;
};

export const getRowViewer = (name) => {
    return rowViewers[name];
};

MapInfoUtils = {
    SUPPORTED_FORMATS,
    getAvailableInfoFormatLabels,
    getAvailableInfoFormat,
    getDefaultInfoFormatValue,
    clickedPointToGeoJson,
    services,
    getDefaultInfoFormatValueFromLayer,
    getLayerFeatureInfoViewer,
    getLayerFeatureInfo,
    VIEWERS: {},
    registerRowViewer,
    getRowViewer
};

