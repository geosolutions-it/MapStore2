/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import last from 'lodash/last';
import sortBy from 'lodash/sortBy';

export const getGeom = (geomType) => {
    switch (geomType) {
    case "Point": case "MultiPoint": return "point";
    case "LineString": case "MultiLineString": return "line";
    case "Polygon": case "MultiPolygon": return "polygon";
    default:
        return geomType;
    }
};

/**
 * generator utility for creating a FeatureCollection GeoJSON from an array of features typically from a mapstore vector layer
 * @param {object[]} features the list of single GeoJSON Feature
 * @return {object} the GeoJSON representation of a FeatureCollection
 */
export const createFC = (features) => {
    return {
        type: "FeatureCollection",
        features
    };
};

/**
 * function used to get latest id of a list of buffered or intersected layers in order to always have the
 * counter increased by 1 based on the maximum number found
 * @param {object[]} layers list of layers to check
 * @param {string} groupName the related group to compare
 * @return {number} the counter value
 */
export const getCounter = (layers, groupName) => {
    const allLayers = sortBy(layers?.filter(({group}) => group === groupName), ["name"]);
    const counter = allLayers.length ? Number(last(allLayers).name.match(/\d/)[0]) + 1 : 0;
    return counter;
};
