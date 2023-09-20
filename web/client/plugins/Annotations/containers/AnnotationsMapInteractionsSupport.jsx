/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { lazy, Suspense } from 'react';
import { MapLibraries } from '../../../utils/MapTypeUtils';
import { validateFeature } from '../utils/AnnotationsUtils';

const drawGeometrySupportSupports = {
    [MapLibraries.OPENLAYERS]: lazy(() => import(/* webpackChunkName: 'supports/olDrawGeometrySupport' */ '../../../components/map/openlayers/DrawGeometrySupport')),
    [MapLibraries.CESIUM]: lazy(() => import(/* webpackChunkName: 'supports/cesiumDrawGeometrySupport' */ '../../../components/map/cesium/DrawGeometrySupport'))
};
const editGeoJSONSupportSupports = {
    [MapLibraries.OPENLAYERS]: lazy(() => import(/* webpackChunkName: 'supports/olEditGeoJSONSupport' */ '../../../components/map/openlayers/EditGeoJSONSupport')),
    [MapLibraries.CESIUM]: lazy(() => import(/* webpackChunkName: 'supports/cesiumEditGeoJSONSupport' */ '../../../components/map/cesium/EditGeoJSONSupport'))
};

export const areAnnotationsMapInteractionsSupported = (mapType) => {
    return drawGeometrySupportSupports[mapType] && editGeoJSONSupportSupports[mapType];
};

function AnnotationsMapInteractionsSupport({
    map,
    active,
    mapType,
    feature,
    geodesic = {},
    onChange = () => {}
}) {

    const getGeometryType = ({ properties } = {}) => properties?.annotationType === 'Text' ? 'Point' : properties?.annotationType;
    if (!areAnnotationsMapInteractionsSupported(mapType)) {
        return null;
    }
    const DrawGeometrySupport = drawGeometrySupportSupports[mapType];
    const EditFeatureSupport = editGeoJSONSupportSupports[mapType];
    const isFeatureGeometryValid = validateFeature(feature, true);
    const selectedAnnotationType = getGeometryType(feature);
    const isGeodesic = !!geodesic[selectedAnnotationType];
    return (
        <Suspense fallback={null}>
            <>
                <DrawGeometrySupport
                    map={map}
                    active={active && feature.geometry === null}
                    depthTestAgainstTerrain={false}
                    geometryType={selectedAnnotationType}
                    geodesic={isGeodesic}
                    getObjectsToExcludeOnPick={() => []}
                    onDrawEnd={({ feature: newFeature }) => {
                        onChange({
                            ...feature,
                            properties: {
                                ...feature?.properties,
                                geodesic: isGeodesic,
                                ...(newFeature?.properties?.radius !== undefined && {
                                    radius: newFeature?.properties?.radius
                                })
                            },
                            geometry: newFeature.geometry
                        });
                    }}
                />
                <EditFeatureSupport
                    map={map}
                    active={active && isFeatureGeometryValid}
                    geojson={feature}
                    getGeometryType={getGeometryType}
                    onEditEnd={newFeature => onChange(newFeature)}
                />
            </>
        </Suspense>
    );
}

export default AnnotationsMapInteractionsSupport;
