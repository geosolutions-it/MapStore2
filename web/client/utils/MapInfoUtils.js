/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const INFO_FORMATS = require("./FeatureInfoUtils").INFO_FORMATS;

var MapInfoUtils = {
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
    getMarkerLayer(name, clickedMapPoint) {
        return {
            type: 'vector',
            visibility: true,
            name: name || "GetFeatureInfo",
            styleName: "marker",
            features: MapInfoUtils.clickedPointToGeoJson(clickedMapPoint)
        };
    }
};

module.exports = MapInfoUtils;
