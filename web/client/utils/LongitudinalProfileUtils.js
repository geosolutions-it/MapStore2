/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import {parseURN, reprojectGeoJson} from "../utils/CoordinatesUtils";

/**
 * Utility function to traverse through json input recursively and build a flat array of features
 * @param json
 * @param features
 * @returns {*[]|*}
 */
export const flattenImportedFeatures = (json, features = undefined) => {
    let flatten = [];
    if (typeof features !== 'undefined') {
        flatten = features;
    }
    if (json?.layers && Array.isArray(json.layers)) {
        return json.layers.forEach(l => flattenImportedFeatures(l, flatten));
    }
    if (json?.map && json.map?.layers) {
        flattenImportedFeatures(json.map?.layers, flatten);
    }
    if (Array.isArray(json)) {
        json.forEach(el => flattenImportedFeatures(el, flatten));
    }
    if (json?.features && Array.isArray(json.features)) {
        json.features.forEach(feature => flattenImportedFeatures(feature, flatten));
    }
    if (json?.type === 'Feature') {
        flatten.push(json);
    }
    return flatten;
};

/**
 * Finds first line feature in array of features and reprojects geometry for further use in WPS request
 * @param collection
 * @param projection
 * @returns {{feature: *, coordinates: *, reprojected: (*)}|{feature: undefined, coordinates: undefined, reprojected: undefined}}
 */
export const selectLineFeature = (collection, projection = "EPSG:4326") => {
    const parsedProjectionName = parseURN(projection);
    const feature = collection.find((f) => ["LineString", "MultiLineString"].includes(f?.geometry?.type));
    if (feature) {
        const reprojected = parsedProjectionName !== "EPSG:3857" ? reprojectGeoJson(feature, parsedProjectionName, "EPSG:3857") : feature;
        const coordinates = reprojected.geometry.type === "MultiLineString" ? reprojected.geometry.coordinates[0] : reprojected.geometry.coordinates;
        return { feature, reprojected, coordinates };
    }
    return { feature: undefined, reprojected: undefined, coordinates: undefined };
};

/**
 * Applies style to the features list
 * @param features
 * @param style
 * @returns {*}
 */
export const styleFeatures = (features, style) => {
    return features.map((feature) => {
        return {
            ...feature,
            style
        };
    });
};
