/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

/**
 * Utils used in DrawSupport for leaflet and openlayers
*/

const ol = require('openlayers');
const {isArray} = require('lodash');
const {reproject} = require('./CoordinatesUtils');

/**
 * Transforms a leaflet bounds object into an array.
 * @prop {object} the bounds
 * @return the array [minx, miny, maxx, maxy]
*/
const boundsToOLExtent = (bounds) => {
    return [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
};

/**
 * @return a feature extracted from leaflet layer used in queryform
*/
const fromLeafletFeatureToQueryform = (layer) => {
    let geoJesonFt = layer.toGeoJSON();
    let bounds = layer.getBounds();
    let extent = boundsToOLExtent(bounds);
    let center = bounds.getCenter();
    let radius = layer.getRadius ? layer.getRadius() : 0;
    let coordinates = geoJesonFt.features[0].geometry.coordinates;
    let projection = "EPSG:4326";
    let type = geoJesonFt.features[0].geometry.type;

    // Geometry respect query form panel needs
    return {
        type,
        extent,
        center,
        coordinates,
        radius,
        projection
    };
};

const calculateRadius = (center, coordinates, mapCrs, coordinateCrs) => {
    if (isArray(coordinates) && isArray(coordinates[0]) && isArray(coordinates[0][0])) {
        const point = reproject(coordinates[0][0], coordinateCrs, mapCrs);
        return Math.sqrt(Math.pow(center[0] - point.x, 2) + Math.pow(center[1] - point.y, 2));
    }
    return 100;
};

/**
 * Transform a feature that is a circle with Polygon geometry in coordinateCrs to a feature with Circle geometry in mapCrs
 * @param {Feature} feature feature to transform
 * @param {string} mapCrs map's current crs
 * @param {string} [coordinateCrs=mapCrs] crs that feature's coordinates are in
 * @returns {Feature} the transformed feature
 */
const transformPolygonToCircle = (feature, mapCrs, coordinateCrs = mapCrs) => {

    if (!feature.getGeometry() || feature.getGeometry().getType() !== "Polygon" || feature.getProperties().center && feature.getProperties().center.length === 0) {
        return feature;
    }
    if (feature.getProperties() && feature.getProperties().isCircle && feature.getProperties().center && feature.getProperties().center[0] && feature.getProperties().center[1]) {
        // center must be a valid point
        const extent = feature.getGeometry().getExtent();
        let center;
        if (feature.getProperties().center) {
            center = reproject(feature.getProperties().center, "EPSG:4326", mapCrs);
            center = [center.x, center.y];
        } else {
            center = ol.extent.getCenter(extent);
        }
        const radius = calculateRadius(center, feature.getGeometry().getCoordinates(), mapCrs, coordinateCrs);
        feature.setGeometry(new ol.geom.Circle(center, radius));
        return feature;
    }
    return feature;
};

module.exports = {
    transformPolygonToCircle,
    boundsToOLExtent,
    fromLeafletFeatureToQueryform
};
