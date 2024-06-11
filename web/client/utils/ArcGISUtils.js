/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Check if a service url is of type ImageServer
 * @param {string} serviceUrl service url
 * @return {boolean}
 */
export const isImageServerUrl = (serviceUrl = '') => serviceUrl.includes('ImageServer');
/**
 * Check if a service url is of type MapServer
 * @param {string} serviceUrl service url
 * @return {boolean}
 */
export const isMapServerUrl = (serviceUrl = '') => serviceUrl.includes('MapServer');
/**
 * Return all the sub layers ids given a layer id and layers structure
 * @param {string|number} id identifier of the starting layer
 * @param {array} layers set the value of the cookie
 * @return {array} list of layer ids
 */
export const getLayerIds = (id, layers = []) => {
    if (!layers.length) {
        return [`${id}`];
    }
    const layer = layers.find(l => `${l.id}` === `${id}`);
    return [
        `${id}`,
        ...(layer.subLayerIds || []).map(subLayerId => getLayerIds(subLayerId, layers)).flat()
    ];
};
/**
 * Return all the queryable sub layers ids given a layer id and layers structure
 * @param {string|number} id identifier of the starting layer
 * @param {array} layers set the value of the cookie
 * @return {array} list of layer ids
 */
export const getQueryLayerIds = (id, layers = []) => {
    if (!layers.length) {
        return [`${id}`];
    }
    const layer = layers.find(l => `${l.id}` === `${id}`);
    return [
        // the query seems to work only if a layer has not sub layers
        ...(!layer?.subLayerIds ? [`${id}`] : []),
        ...(layer.subLayerIds || []).map(subLayerId => getQueryLayerIds(subLayerId, layers)).flat()
    ];
};
/**
 * Convert an ESRI to a GeoJSON geometry
 * @param {object} geometry esri geometry
 * @return {object} GeoJSON geometry or null
 */
const esriToGeoJSONGeometry = (geometry) => {
    if (!geometry) {
        return null;
    }
    if (geometry.x !== undefined && geometry.y !== undefined) {
        return {
            type: 'Point',
            coordinates: [geometry.x, geometry.y, geometry.z || 0]
        };
    }
    if (geometry.points) {
        return {
            type: 'MultiPoint',
            coordinates: geometry.points.map(([x, y, z]) => [x, y, z || 0])
        };
    }
    if (geometry.paths) {
        return {
            type: 'MultiLineString',
            coordinates: geometry.paths.map(path => path.map(([x, y, z]) => [x, y, z || 0]))
        };
    }
    if (geometry.rings) {
        return {
            type: 'Polygon',
            coordinates: geometry.rings.map(ring => ring.map(([x, y, z]) => [x, y, z || 0]))
        };
    }
    return null;
};
/**
 * Convert an ESRI to a GeoJSON feature
 * @param {object} feature esri feature
 * @return {object} GeoJSON feature
 */
export const esriToGeoJSONFeature = (feature = {}) => {
    return {
        type: 'Feature',
        properties: feature.attributes ?? {},
        geometry: esriToGeoJSONGeometry(feature.geometry)
    };
};
