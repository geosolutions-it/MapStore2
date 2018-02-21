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
const {findIndex, has, trim, isString} = require('lodash');

const MapInfoUtils = {
    /**
     * specifies which info formats are currently supported
     */
    //           default format ↴
    AVAILABLE_FORMAT: ['TEXT', 'PROPERTIES', 'HTML', 'TEMPLATE'],

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
            || 'application/json',
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
            return [];
        }
        return [
            {
                id: "get-feature-info-point",
                type: "Feature",
                geometry: {
                    type: 'Point',
                    coordinates: [parseFloat(clickedPoint.lng), parseFloat(clickedPoint.lat)]
                }
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
    buildIdentifyRequest(layer, props) {
        if (MapInfoUtils.services[layer.type]) {
            let infoFormat = MapInfoUtils.getDefaultInfoFormatValueFromLayer(layer, props);
            let viewer = MapInfoUtils.getLayerFeatureInfoViewer(layer);
            const featureInfo = MapInfoUtils.getLayerFeatureInfo(layer);
            return MapInfoUtils.services[layer.type].buildRequest(layer, props, infoFormat, viewer, featureInfo);
        }
        return {};
    },
    getValidator(format) {
        const defaultValidator = {
            getValidResponses: (responses) => responses,
            getNoValidResponses: () => []
        };
        return {
            getValidResponses: (responses) => {
                return responses.reduce((previous, current) => {
                    let infoFormat;
                    if (current.queryParams && current.queryParams.hasOwnProperty('info_format')) {
                        infoFormat = current.queryParams.info_format;
                    }
                    const valid = (FeatureInfoUtils.Validator[current.format || INFO_FORMATS_BY_MIME_TYPE[infoFormat] || INFO_FORMATS_BY_MIME_TYPE[format]] || defaultValidator).getValidResponses([current]);
                    return [...previous, ...valid];
                }, []);
            },
            getNoValidResponses: (responses) => {
                return responses.reduce((previous, current) => {
                    let infoFormat;
                    if (current.queryParams && current.queryParams.hasOwnProperty('info_format')) {
                        infoFormat = current.queryParams.info_format;
                    }
                    const valid = (FeatureInfoUtils.Validator[current.format || INFO_FORMATS_BY_MIME_TYPE[infoFormat] || INFO_FORMATS_BY_MIME_TYPE[format]] || defaultValidator).getNoValidResponses([current]);
                    return [...previous, ...valid];
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
    },
    /**
     * check if a string attribute is inside of a given object
     * @param feature {object}
     * @param attribute {string} name of attribue with dot notations
     * @param start {array} substring start
     * @param end {array} substring end
     * @return {bool} true if feature contains the attribute
     */
    validateStringAttribute: (feature, attribute, start = 0, end = 0) => {
        const path = isString(attribute) && trim(attribute.substring(start, attribute.length - end)) || '';
        return has(feature, path);
    },
    /**
     * returns a valid template
     * @param template {string} text with attribute to validate
     * @param feature {object} object to match attributes
     * @param regex {regex}
     * @param start {array} substring start
     * @param end {array} substring end
     * @return {string} templete without invalid attribute and html tag inside attribute, e.g. ${ <p>properties.id</p> } -> ${ properties.id }
     */
    getCleanTemplate: (template, feature, regex, start = 0, end = 0) => {
        const matchVariables = isString(template) && template.match(regex);
        const replacedTag = matchVariables && matchVariables.map(temp => ({ previous: temp, next: MapInfoUtils.validateStringAttribute(feature, temp.replace(/(<([^>]+)>)/ig, ''), start, end) && temp.replace(/(<([^>]+)>)/ig, '') || ''})) || null;
        return replacedTag && replacedTag.reduce((temp, variable) => temp.replace(variable.previous, variable.next), template) || template || '';
    }
};

module.exports = MapInfoUtils;
