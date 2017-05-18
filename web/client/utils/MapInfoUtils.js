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

const MapInfoUtils = {
    /**
     * specifies which info formats are currently supported
     */
    //           default format ↴
    AVAILABLE_FORMAT: ['TEXT', 'JSON', 'HTML'],

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
            return MapInfoUtils.services[layer.type].buildRequest(layer, props);
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
                    const valid = (FeatureInfoUtils.Validator[current.format || INFO_FORMATS_BY_MIME_TYPE[format]] || defaultValidator).getValidResponses([current]);
                    return [...previous, ...valid];
                }, []);
            },
            getNoValidResponses: (responses) => {
                return responses.reduce((previous, current) => {
                    const valid = (FeatureInfoUtils.Validator[current.format || INFO_FORMATS_BY_MIME_TYPE[format]] || defaultValidator).getNoValidResponses([current]);
                    return [...previous, ...valid];
                }, []);
            }
        };
    },
    getViewers() {
        return {
            [FeatureInfoUtils.INFO_FORMATS.JSON]: require('../components/data/identify/viewers/JSONViewer'),
            [FeatureInfoUtils.INFO_FORMATS.HTML]: require('../components/data/identify/viewers/HTMLViewer'),
            [FeatureInfoUtils.INFO_FORMATS.TEXT]: require('../components/data/identify/viewers/TextViewer')
        };
    },
    defaultQueryableFilter(l) {
        return l.visibility &&
            (MapInfoUtils.services[l.type]) &&
            (l.queryable === undefined || l.queryable) &&
            l.group !== "background"
        ;
    },
    services: {
        wms: require('./mapinfo/wms'),
        wmts: require('./mapinfo/wmts'),
        vector: require('./mapinfo/vector')
    }
};

module.exports = MapInfoUtils;
