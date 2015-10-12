/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const INFO_FORMATS = {
    "TEXT": "text/plain",
    "HTML": "text/html",
    "JSONP": "text/javascript",
    "JSON": "application/json",
    "GML 2": "application/vnd.ogc.gml",
    "GML 3": "application/vnd.ogc.gml/3.1.1"
};

/**
 * specifies which info formats are currently supported
 */
//           default format ↴
const AVAILABLE_FORMAT = ['TEXT', 'JSON', 'HTML'];

var MapInfoUtils = {
    /**
     * @return a filtered version of INFO_FORMATS object.
     * the returned object contains only keys that AVAILABLE_FORMAT contains.
     */
    getAvailableInfoFormat() {
        return Object.keys(INFO_FORMATS).filter((k) => {
            return AVAILABLE_FORMAT.indexOf(k) !== -1;
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
        return INFO_FORMATS[AVAILABLE_FORMAT[0]];
    }
};

module.exports = MapInfoUtils;
