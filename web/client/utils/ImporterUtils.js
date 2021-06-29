/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const getbsStyleForState = function(state) {
    switch (state) {
    case "NO_FORMAT":
    case "NO_CRS":
    case "BAD_FORMAT":
    case "NO_BOUNDS":
    case "ERROR":
    case "CANCELED":
    case "INIT_ERROR":
        return "danger";
    case "READY":
    case "PENDING":
        return "info";
    case "INIT":
    case "RUNNING":
        return "warning";
    case "COMPLETE":
        return "success";
    default:
        return "default";

    }
};

/**
 * @param {*} layer
 * @returns {boolean}
 */

export const checkFeaturesStyle = (layer = {}) => {
    return layer && layer.features.length ?
        layer.features.reduce((hasCustomStyle, feature ) => {
            const isCustomStylePresent = feature.style &&
            (Array.isArray(feature.style) && feature.style.length ) ||
            (Object.keys(feature.style || {}).length);
            return hasCustomStyle || !!isCustomStylePresent;
        }, false) : false;
};
