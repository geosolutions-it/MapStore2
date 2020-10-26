/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get } from 'lodash';
import { createSelector } from 'reselect';
import { reprojectGeoJson } from '../utils/CoordinatesUtils';

export const selectedFeatures = (state) => get(state, state && state.highlight && state.highlight.featuresPath || "highlight.emptyFeatures") || [];
export const filteredspatialObject = (state) => get(state, state && state.featuregrid && state.featuregrid.open && state.featuregrid.showFilteredObject && "query.filterObj.spatialField" || "emptyObject");
export const filteredGeometry = (state) => filteredspatialObject(state) && filteredspatialObject(state).geometry;
export const filteredspatialObjectType = (state) => filteredGeometry(state) && filteredGeometry(state).type || "Polygon";
export const filteredspatialObjectCoord = (state) => filteredGeometry(state) && filteredGeometry(state).coordinates || [];
export const filteredSpatialObjectCrs = (state) => filteredGeometry(state) && filteredGeometry(state).projection || "EPSG:3857";
export const filteredSpatialObjectId = (state) => filteredGeometry(state) && filteredGeometry(state).id || "spatial_object";
export const filteredFeatures = createSelector(
    [
        filteredspatialObjectCoord,
        filteredspatialObjectType,
        filteredSpatialObjectId,
        filteredSpatialObjectCrs
    ],
    ( geometryCoordinates, geometryType, geometryId, geometryCrs) => {
        let geometry = {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: {
                        type: geometryType,
                        coordinates: geometryCoordinates
                    },
                    style: {
                        fillColor: '#FFFFFF',
                        fillOpacity: '0.2',
                        color: '#ffcc33'
                    },
                    id: geometryId
                }
            ]
        };
        return geometryCoordinates.length > 0 && geometryType ? reprojectGeoJson(geometry, geometryCrs, 'EPSG:4326').features : [];
    }

);

export const highlighedFeatures = createSelector(
    [
        filteredFeatures,
        selectedFeatures
    ],
    (featuresFiltered, featuresSelected) => [ ...featuresSelected, ...featuresFiltered]
);
