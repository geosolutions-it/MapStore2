/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { updateAdditionalLayer } from '../../../actions/additionallayers';
import { applyMapInfoStyle } from '../../../selectors/mapInfo';

export const buildAdditionalLayerName = layerId => `"highlight-select-${layerId}-features"`;
export const buildAdditionalLayerOwnerName = layerId => `Select_${layerId}`;
export const buildAdditionalLayerId = layerId => `${buildAdditionalLayerOwnerName(layerId)}_id`;

function getGeometryType(geometry) {
    if (geometry.x !== undefined && geometry.y !== undefined) {
        return "Point";
    } else if (geometry.paths) {
        return "LineString";
    } else if (geometry.rings) {
        return "Polygon";
    }
    return null;
}

function convertCoordinates(geometry) {
    if (geometry.x !== undefined && geometry.y !== undefined) {
        return [geometry.x, geometry.y];
    } else if (geometry.paths) {
        return geometry.paths[0];
    } else if (geometry.rings) {
        return geometry.rings;
    }
    return null;
}

export const makeCrsValid = crs => {
    const crsSplit = crs.toString().split(':');
    const crsSplitLength = crsSplit.length;
    if (crsSplitLength === 1) {
        return 'EPSG' + ':' + crsSplit[0];
    } else if (crsSplitLength > 1) {
        const geodeticIndex = crsSplit.lastIndexOf(s => s.length > 0, crsSplitLength - 2);
        return (geodeticIndex > -1 ? crsSplit[geodeticIndex] : 'EPSG') + ':' + crsSplit[crsSplitLength - 1];
    }
    return 'EPSG:4326';
};

export const arcgisToGeoJSON = (arcgisFeatures, layerName, idField) => arcgisFeatures.map(feature => ({
    type: "Feature",
    id: `${layerName}.${feature.attributes[idField]}`,
    geometry_name: "geometry",
    geometry: {
        type: getGeometryType(feature.geometry),
        coordinates: convertCoordinates(feature.geometry)
    },
    properties: feature.attributes
}));

export const customUpdateAdditionalLayer = (layerId, features, isVisible, highlightStyle) => updateAdditionalLayer(
    buildAdditionalLayerId(layerId),
    buildAdditionalLayerOwnerName(layerId),
    "overlay",
    {
        type: "vector",
        name: buildAdditionalLayerName(layerId),
        visibility: isVisible,
        features: features.map(applyMapInfoStyle(highlightStyle))
    }
);
