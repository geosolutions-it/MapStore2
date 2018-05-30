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
const calculateRadius = (center, coordinates) => {
    return Math.sqrt(Math.pow(center[0] - coordinates[0][0][0], 2) + Math.pow(center[1] - coordinates[0][0][1], 2));
};

const transformPolygonToCircle = (feature, mapCrs) => {
    if (feature.getGeometry().getType() !== "Polygon") {
        return feature;
    }
    if (feature.getProperties() && feature.getProperties().isCircle) {
        const extent = feature.getGeometry().getExtent();
        let center;
        if (feature.getProperties().center) {
            center = reproject(feature.getProperties().center, "EPSG:4326", mapCrs);
            center = [center.x, center.y];
        } else {
            center = ol.extent.getCenter(extent);
        }
        const radius = feature.getProperties().radius || calculateRadius(center, feature.getGeometry().getCoordinates());
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
