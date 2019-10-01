/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

/**
 * Utils used in DrawSupport for leaflet
*/

/**
 * Transforms a leaflet bounds object into an array.
 * @prop {object} the bounds
 * @return the array [minx, miny, maxx, maxy]
*/
export const boundsToOLExtent = (bounds) => {
    return [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
};

/**
 * @return a feature extracted from leaflet layer used in queryform
*/
export const fromLeafletFeatureToQueryform = (layer) => {
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

