/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { lazy, Suspense, useEffect, useRef } from 'react';
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
    const getDrawGeometryType = ({ geometry, properties } = {}) => properties?.annotationType === 'Text'
    || (properties?.radius > 0 && !geometry) ? 'Point' : properties?.annotationType;

    if (!areAnnotationsMapInteractionsSupported(mapType)) {
        return null;
    }
    const DrawGeometrySupport = drawGeometrySupportSupports[mapType];
    const EditFeatureSupport = editGeoJSONSupportSupports[mapType];
    const isFeatureGeometryValid = validateFeature(feature, true);
    const selectedAnnotationType = getGeometryType(feature);
    const drawGeometryType = getDrawGeometryType(feature);
    const isGeodesic = !!geodesic[selectedAnnotationType];

    const featureRef = useRef(feature);
    useEffect(() => {
        // to avoid stale closure in the callback
        featureRef.current = feature;
    }, [feature]);

    return (
        <Suspense fallback={null}>
            <>
                <DrawGeometrySupport
                    map={map}
                    active={active && feature.geometry === null}
                    depthTestAgainstTerrain={false}
                    geometryType={drawGeometryType}
                    geodesic={isGeodesic}
                    getObjectsToExcludeOnPick={() => []}
                    onDrawEnd={({ feature: newFeature }) => {
                        onChange({
                            ...featureRef.current,
                            properties: {
                                ...featureRef.current?.properties,
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
