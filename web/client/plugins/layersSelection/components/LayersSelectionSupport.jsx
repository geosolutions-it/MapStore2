/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { lazy, Suspense, useEffect } from 'react';
import { MapLibraries } from '../../../utils/MapTypeUtils';
import { circleToPolygon } from '../../../utils/DrawGeometryUtils';
import { createDefaultStyle } from '../../../utils/StyleUtils';

const drawGeometrySupportSupports = {
    // TODO: include support of Rectangle in Cesium support
    // TODO: ensure only 2D coordinates are provided to the filter
    // [MapLibraries.CESIUM]: lazy(() => import(/* webpackChunkName: 'supports/cesiumDrawGeometrySupport' */ '../../../components/map/cesium/DrawGeometrySupport')),
    [MapLibraries.OPENLAYERS]: lazy(() => import(/* webpackChunkName: 'supports/olDrawGeometrySupport' */ '../../../components/map/openlayers/DrawGeometrySupport'))
};

const LAYER_SELECTION_LAYER_ID = 'LAYER_SELECTION_LAYER_ID';

const LayersSelectionSupport = ({
    map,
    mapType,
    type,
    feature,
    onChange = () => {},
    onUpdateLayer = () => {},
    onRemoveLayer = () => {},
    cleanSelection
}) => {

    const DrawGeometrySupport = drawGeometrySupportSupports[mapType];

    useEffect(() => {
        return () => {
            onChange(null);
            onRemoveLayer({ owner: LAYER_SELECTION_LAYER_ID });
            cleanSelection();
        };
    }, [onUpdateLayer, onChange, onRemoveLayer, mapType, cleanSelection]);

    useEffect(() => {
        onUpdateLayer(LAYER_SELECTION_LAYER_ID, LAYER_SELECTION_LAYER_ID, 'overlay', {
            id: LAYER_SELECTION_LAYER_ID,
            type: 'vector',
            visibility: true,
            features: feature ? [feature] : [],
            style: feature ? createDefaultStyle({
                fillColor: '#f2f2f2',
                fillOpacity: 0.3,
                strokeColor: '#ffcc33',
                strokeOpacity: 1,
                strokeWidth: 2,
                radius: 10,
                geometryType: feature?.geometry?.type
            }) : undefined
        });
    }, [feature]);

    if (!DrawGeometrySupport) {
        return null;
    }
    const geometryType = type === 'BBOX' ? 'Rectangle' : type;
    return (
        <Suspense fallback={null}>
            <DrawGeometrySupport
                map={map}
                active={!!geometryType && !feature}
                depthTestAgainstTerrain={false}
                geometryType={geometryType}
                getObjectsToExcludeOnPick={() => []}
                onDrawEnd={({ feature: newFeature }) => {
                    const geometry = newFeature?.properties?.radius !== undefined
                        ? circleToPolygon(newFeature.geometry.coordinates, newFeature.properties.radius, false)
                        : newFeature.geometry;
                    onChange({
                        ...newFeature,
                        properties: {
                            ...newFeature?.properties,
                            drawType: geometryType
                        },
                        geometry: {
                            ...geometry,
                            projection: 'EPSG:4326'
                        }
                    });
                }}
            />
        </Suspense>
    );
};

export default LayersSelectionSupport;
