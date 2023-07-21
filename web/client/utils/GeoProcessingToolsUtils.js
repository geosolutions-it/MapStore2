/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {WKT, GeoJSON} from 'ol/format';

/**
 * Convert geojson geom in wkt
 * @param {object} feature the geojson feature
 * @returns {string} the converted string in wkt
 */
export const convertGeoJSONFeatureToWKT = (feature) => {
    const formatGeoJSON = new GeoJSON();
    const WKTGeoJSON = new WKT();
    const olFeature = formatGeoJSON.readFeature(feature);
    const geometry = WKTGeoJSON.writeFeature(olFeature);
    return geometry;
};

/**
 * check if intersection is possible between two features
 * @param {object} sourceFeature the geojson feature
 * @param {object} intersectionFeature the geojson feature
 * @returns {string} the converted string in wkt
 */
export const checkIfIntersectionIsPossible = (sourceFeature = {}, intersectionFeature = {}) => {

    if (
        sourceFeature?.geometry?.type.includes("Point") ||
        intersectionFeature?.geometry?.type.includes("Point")
    ) {
        return (sourceFeature?.geometry?.type.includes("Point") && intersectionFeature?.geometry?.type.includes("Polygon")) ||
            (intersectionFeature?.geometry?.type.includes("Point") && sourceFeature?.geometry?.type.includes("Polygon") );
    }
    return true;
};
