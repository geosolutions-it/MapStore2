/**
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const FeatureInfoUtils = require("./FeatureInfoUtils");
const INFO_FORMATS = FeatureInfoUtils.INFO_FORMATS;
const INFO_FORMATS_BY_MIME_TYPE = FeatureInfoUtils.INFO_FORMATS_BY_MIME_TYPE;
const pointOnSurface = require('turf-point-on-surface');
const {findIndex} = require('lodash');

const MapInfoUtils = {
    /**
     * specifies which info formats are currently supported
     */
    //           default format ↴
    AVAILABLE_FORMAT: ['TEXT', 'PROPERTIES', 'HTML', 'TEMPLATE'],

    EMPTY_RESOURCE_VALUE: 'NODATA',

    VIEWERS: {},
    /**
     * @return a filtered version of INFO_FORMATS object.
     * the returned object contains only keys that AVAILABLE_FORMAT contains.
     */
    getAvailableInfoFormat() {
        return Object.keys(INFO_FORMATS).filter((k) => {
            return MapInfoUtils.AVAILABLE_FORMAT.indexOf(k) !== -1;
        }).reduce((prev, k) => {
            prev[k] = INFO_FORMATS[k];
            return prev;
        }, {});
    },
    /**
     * @return the label of an inputformat given the value
     */
    getLabelFromValue(value) {
        return MapInfoUtils.getAvailableInfoFormatLabels().filter(info => INFO_FORMATS[info] === value)[0] || "TEXT";
    },
    /**
     * @return like getAvailableInfoFormat but return an array filled with the keys
     */
    getAvailableInfoFormatLabels() {
        return Object.keys(MapInfoUtils.getAvailableInfoFormat());
    },
    /**
     * @return like getAvailableInfoFormat but return an array filled with the values
     */
    getAvailableInfoFormatValues() {
        return Object.keys(MapInfoUtils.getAvailableInfoFormat()).map( label => {
            return INFO_FORMATS[label];
        });
    },
    /**
     * @return {string} the default info format value
     */
    getDefaultInfoFormatValue() {
        return INFO_FORMATS[MapInfoUtils.AVAILABLE_FORMAT[0]];
    },
    /**
     * @return {string} the info format value from layer, otherwise the info format in settings
     */
    getDefaultInfoFormatValueFromLayer: (layer, props) =>
        layer.featureInfo
            && layer.featureInfo.format
            && INFO_FORMATS[layer.featureInfo.format]
            || props.format
            || MapInfoUtils.getDefaultInfoFormatValue(),
    getLayerFeatureInfoViewer(layer) {
        if (layer.featureInfo
            && layer.featureInfo.viewer) {
            return layer.featureInfo.viewer;
        }
        return {};
    },
    /**
     * returns feature info options of layer
     * @param layer {object} layer object
     * @return {object} feature info options
     */
    getLayerFeatureInfo(layer) {
        return layer && layer.featureInfo && {...layer.featureInfo} || {};
    },
    clickedPointToGeoJson(clickedPoint) {
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
                    coordinates: [parseFloat(clickedPoint.lng), parseFloat(clickedPoint.lat)]
                },
                style: [{
                    iconUrl: require('../components/map/openlayers/img/marker-icon.png'),
                    iconAnchor: [12, 41], // in leaflet there is no anchor in fraction
                    iconSize: [25, 41]
                }]

            }
        ];
    },
    getMarkerLayer(name, clickedMapPoint, styleName, otherParams, markerLabel) {
        return {
            type: 'vector',
            visibility: true,
            name: name || "GetFeatureInfo",
            styleName: styleName || "marker",
            label: markerLabel,
            features: MapInfoUtils.clickedPointToGeoJson(clickedMapPoint),
            ...otherParams
        };
    },
    /**
     * Creates GFI request and metadata for specific layer.
     * @param {object} layer the layer object
     * @param {object} options the options for the request
     * @param {string} options.format the format to use
     * @param {string} options.map the map object, with projection and
     * @param {object} options.point
     */
    buildIdentifyRequest(layer, options) {
        if (MapInfoUtils.services[layer.type]) {
            let infoFormat = MapInfoUtils.getDefaultInfoFormatValueFromLayer(layer, options);
            let viewer = MapInfoUtils.getLayerFeatureInfoViewer(layer);
            const featureInfo = MapInfoUtils.getLayerFeatureInfo(layer);
            return MapInfoUtils.services[layer.type].buildRequest(layer, options, infoFormat, viewer, featureInfo);
        }
        return {};
    },
    /**
     * Returns an Observable that emits the response when ready.
     * @param {object} layer the layer
     * @param {string} baseURL the URL for the request
     * @param {object} params for the request
     */
    getIdentifyFlow(layer, baseURL, params) {
        if (MapInfoUtils.services[layer.type] && MapInfoUtils.services[layer.type].getIdentifyFlow) {
            return MapInfoUtils.services[layer.type].getIdentifyFlow(layer, baseURL, params);
        }
        return null;
    },
    getValidator(format) {
        const defaultValidator = {
            getValidResponses: (responses) => responses,
            getNoValidResponses: () => []
        };
        return {
            getValidResponses: (responses, renderEmpty = false) => {
                return responses.reduce((previous, current) => {
                    if (current) {
                        let infoFormat;
                        // Handle WMS, WMTS
                        if (current.queryParams && current.queryParams.hasOwnProperty('info_format')) {
                            infoFormat = current.queryParams.info_format;
                        }
                        // handle WFS
                        if (current.queryParams && current.queryParams.hasOwnProperty('outputFormat')) {
                            infoFormat = current.queryParams.outputFormat;
                        }
                        const valid = (FeatureInfoUtils.Validator[current.format || INFO_FORMATS_BY_MIME_TYPE[infoFormat] || INFO_FORMATS_BY_MIME_TYPE[format]] || defaultValidator).getValidResponses([current], renderEmpty);
                        return [...previous, ...valid];
                    }
                    return [...previous];
                }, []);
            },
            getNoValidResponses: (responses) => {
                return responses.reduce((previous, current) => {
                    if (current) {
                        let infoFormat;
                        if (current.queryParams && current.queryParams.hasOwnProperty('info_format')) {
                            infoFormat = current.queryParams.info_format;
                        }
                        if (current.queryParams && current.queryParams.hasOwnProperty('outputFormat')) {
                            infoFormat = current.queryParams.outputFormat;
                        }
                        const valid = (FeatureInfoUtils.Validator[current.format || INFO_FORMATS_BY_MIME_TYPE[infoFormat] || INFO_FORMATS_BY_MIME_TYPE[format]] || defaultValidator).getNoValidResponses([current]);
                        return [...previous, ...valid];
                    }
                    return [...previous];
                }, []);
            }
        };
    },
    getViewers() {
        return {
            [FeatureInfoUtils.INFO_FORMATS.PROPERTIES]: require('../components/data/identify/viewers/JSONViewer'),
            [FeatureInfoUtils.INFO_FORMATS.JSON]: require('../components/data/identify/viewers/JSONViewer'),
            [FeatureInfoUtils.INFO_FORMATS.HTML]: require('../components/data/identify/viewers/HTMLViewer'),
            [FeatureInfoUtils.INFO_FORMATS.TEXT]: require('../components/data/identify/viewers/TextViewer')
        };
    },
    defaultQueryableFilter(l) {
        return l.visibility &&
            MapInfoUtils.services[l.type] &&
            (l.queryable === undefined || l.queryable) &&
            l.group !== "background"
        ;
    },
    services: {
        wfs: require('./mapinfo/wfs'),
        wms: require('./mapinfo/wms'),
        wmts: require('./mapinfo/wmts'),
        vector: require('./mapinfo/vector')
    },
    /**
     * To get the custom viewer with the given type
     * This way you can extend the featureinfo with your custom viewers in external projects.
     * @param type {string} the string the component was registered with
     * @return {object} the registered component
     */
    getViewer: (type) => {
        return !!MapInfoUtils.VIEWERS[type] ? MapInfoUtils.VIEWERS[type] : null;
    },
    /**
     * To register a custom viewer
     * This way you can extend the featureinfo with your custom viewers in external projects.
     * @param type {string} the string you want to register the component with
     * @param viewer {object} the component to register
     */
    setViewer: (type, viewer) => {
        MapInfoUtils.VIEWERS[type] = viewer;
    },
    /**
     * returns new options filtered by include and exclude options
     * @param layer {object} layer object
     * @param includeOptions {array} options to include
     * @param excludeParams {array} options to exclude
     * @return {object} new filtered options
     */
    filterRequestParams: (layer, includeOptions, excludeParams) => {
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
    }
};

module.exports = MapInfoUtils;
