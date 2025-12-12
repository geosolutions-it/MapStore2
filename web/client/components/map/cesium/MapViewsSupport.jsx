/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import {
    getCesiumColor,
    createPolylinePrimitive,
    clearPrimitivesCollection,
    createCircleMarkerImage,
    createClippingPolygonsFromGeoJSON,
    applyClippingPolygons
} from '../../../utils/cesium/PrimitivesUtils';
import { computeAngle } from '../../../utils/cesium/MathUtils';
import {
    DefaultViewValues,
    formatClippingFeatures,
    getZoomFromHeight,
    ViewSettingsTypes
} from '../../../utils/MapViewsUtils';

const computeDestinationOrientation = (map, {
    center,
    cameraPosition,
    ...view
}) => {
    if (view.orientation && view.position) {
        return {
            destination: view.position,
            orientation: view.orientation
        };
    }
    let tmp = {
        position: Cesium.Cartesian3.clone(map.camera.position),
        orientation: {
            heading: map.camera.heading,
            pitch: map.camera.pitch,
            roll: map.camera.roll
        }
    };

    const target = Cesium.Cartographic.toCartesian(
        Cesium.Cartographic.fromDegrees(center.longitude, center.latitude, center.height, new Cesium.Cartographic())
    );
    const targetUp = Cesium.Cartographic.toCartesian(
        Cesium.Cartographic.fromDegrees(center.longitude, center.latitude, center.height + 1, new Cesium.Cartographic())
    );
    const origin = Cesium.Cartographic.toCartesian(
        Cesium.Cartographic.fromDegrees(cameraPosition.longitude, cameraPosition.latitude, cameraPosition.height, new Cesium.Cartographic())
    );
    const originUp = Cesium.Cartographic.toCartesian(
        Cesium.Cartographic.fromDegrees(cameraPosition.longitude, cameraPosition.latitude, cameraPosition.height + 1, new Cesium.Cartographic())
    );

    const diff = Cesium.Cartesian3.subtract(origin, target, new Cesium.Cartesian3());
    const vertical = Cesium.Cartesian3.subtract(targetUp, target, new Cesium.Cartesian3());

    // if the direction of the camera is perpendicular to the globe
    // we are using a threshold of 5 degrees
    // we should reverse the up is the latitude is greater than 0
    const shouldReverseUp = center.latitude > 0 && Math.round(computeAngle(diff, vertical)) <= 5;
    const up = shouldReverseUp
        ? Cesium.Cartesian3.subtract(origin, originUp, new Cesium.Cartesian3())
        : Cesium.Cartesian3.subtract(originUp, origin, new Cesium.Cartesian3());

    let direction;
    direction = Cesium.Cartesian3.subtract(target, origin, new Cesium.Cartesian3());
    Cesium.Cartesian3.normalize(direction, direction);
    map.camera.setView({
        destination: origin,
        orientation: {
            direction,
            up
        }
    });
    map.camera.setView({
        destination: origin,
        orientation: {
            direction,
            up
        }
    });
    const properties = {
        destination: {
            x: map.camera.position.x,
            y: map.camera.position.y,
            z: map.camera.position.z
        },
        orientation: {
            heading: map.camera.heading,
            pitch: map.camera.pitch,
            roll: map.camera.roll
        }
    };
    map.camera.setView({
        destination: tmp.position,
        orientation: tmp.orientation
    });
    return properties;
};

function MapViewSupport({
    map,
    selectedId,
    views,
    apiRef = () => { },
    showViewsGeometries,
    showClipGeometries,
    resources
}) {
    const selected = views?.find(view => view.id === selectedId);

    const staticPrimitivesCollection = useRef();
    const staticBillboardCollection = useRef();
    const staticLabelsCollection = useRef();
    const markerImage = useRef();
    const clipGeometriesDataSource = useRef();

    useEffect(() => {
        const api = {
            options: {
                settings: [
                    ViewSettingsTypes.DESCRIPTION,
                    ViewSettingsTypes.POSITION,
                    ViewSettingsTypes.ANIMATION,
                    ViewSettingsTypes.MASK,
                    ViewSettingsTypes.GLOBE_TRANSLUCENCY,
                    ViewSettingsTypes.LAYERS_OPTIONS
                ],
                unsupportedLayers: [],
                showClipGeometriesEnabled: true
            },
            getView: () => {
                const cartographicCameraPosition = map.camera.positionCartographic;
                const zoom = getZoomFromHeight(cartographicCameraPosition.height);
                const rectangle = map.camera.computeViewRectangle(map.scene.globe.ellipsoid, new Cesium.Rectangle());
                let target = map.scene.globe.pick(new Cesium.Ray(map.camera.position, map.camera.direction), map.scene);
                if (!target) {
                    target = Cesium.Cartesian3.add(
                        Cesium.Cartesian3.clone(map.camera.position),
                        Cesium.Cartesian3.multiplyByScalar(Cesium.Cartesian3.clone(map.camera.direction), 100000, new Cesium.Cartesian3() ),
                        new Cesium.Cartesian3()
                    );
                }
                const cartographicCenter = Cesium.Cartographic.fromCartesian(
                    new Cesium.Cartesian3(target.x, target.y, target.z)
                );

                return {
                    zoom,
                    center: {
                        longitude: Cesium.Math.toDegrees(cartographicCenter.longitude),
                        latitude: Cesium.Math.toDegrees(cartographicCenter.latitude),
                        height: cartographicCenter.height
                    },
                    cameraPosition: {
                        longitude: Cesium.Math.toDegrees(cartographicCameraPosition.longitude),
                        latitude: Cesium.Math.toDegrees(cartographicCameraPosition.latitude),
                        height: cartographicCameraPosition.height
                    },
                    bbox: [
                        Cesium.Math.toDegrees(rectangle.west),
                        Cesium.Math.toDegrees(rectangle.south),
                        Cesium.Math.toDegrees(rectangle.east),
                        Cesium.Math.toDegrees(rectangle.north)
                    ]
                };
            },
            setView: (view) => {
                const { destination, orientation } = computeDestinationOrientation(map, view);
                map.camera.cancelFlight();
                map.camera[view.flyTo ? 'flyTo' : 'setView']({
                    destination,
                    orientation
                });
            },
            computeViewCoordinates: (view, newProperties) => {
                // update view with new center and cameraPosition properties
                api.setView({ ...newProperties, flyTo: false });
                // then update also zoom and bbox
                const cartographicCameraPosition = map.camera.positionCartographic;
                const zoom = getZoomFromHeight(cartographicCameraPosition.height);
                const rectangle = map.camera.computeViewRectangle(map.scene.globe.ellipsoid, new Cesium.Rectangle());
                return {
                    ...newProperties,
                    zoom,
                    bbox: [
                        Cesium.Math.toDegrees(rectangle.west),
                        Cesium.Math.toDegrees(rectangle.south),
                        Cesium.Math.toDegrees(rectangle.east),
                        Cesium.Math.toDegrees(rectangle.north)
                    ]
                };
            }
        };

        apiRef(api);

    }, [map]);

    useEffect(() => {
        if (map) {
            staticPrimitivesCollection.current = new Cesium.PrimitiveCollection({ destroyPrimitives: true });
            map.scene.primitives.add(staticPrimitivesCollection.current);

            staticBillboardCollection.current = new Cesium.BillboardCollection();
            map.scene.primitives.add(staticBillboardCollection.current);

            staticLabelsCollection.current = new Cesium.LabelCollection();
            map.scene.primitives.add(staticLabelsCollection.current);

            markerImage.current = createCircleMarkerImage(16, { stroke: '#ffffff', strokeWidth: 2, fill: false});

            clipGeometriesDataSource.current = new Cesium.GeoJsonDataSource('clipGeometriesDataSource');
        }
        return () => {
            if (map?.isDestroyed && !map.isDestroyed()) {
                clearPrimitivesCollection(map, staticPrimitivesCollection.current);
                staticPrimitivesCollection.current = null;
                clearPrimitivesCollection(map, staticBillboardCollection.current);
                staticBillboardCollection.current = null;
                clearPrimitivesCollection(map, staticLabelsCollection.current);
                staticLabelsCollection.current = null;
            }
        };
    }, [map]);

    useEffect(() => {
        if ((showViewsGeometries || showClipGeometries) && map?.isDestroyed && !map.isDestroyed() && views?.length > 0) {
            if (showViewsGeometries) {
                views.forEach((view) => {
                    const position = Cesium.Cartographic.toCartesian(
                        Cesium.Cartographic.fromDegrees(view.cameraPosition.longitude, view.cameraPosition.latitude, view.cameraPosition.height)
                    );
                    const target = Cesium.Cartographic.toCartesian(
                        Cesium.Cartographic.fromDegrees(view.center.longitude, view.center.latitude, view.center.height)
                    );
                    const isSelected = view.id === selectedId;
                    staticPrimitivesCollection.current.add(createPolylinePrimitive({
                        color: isSelected ? '#ffcc33' : '#ffffff',
                        opacity: 1.0,
                        depthFailColor: '#000000',
                        depthFailOpacity: 0.0,
                        width: 1,
                        dashLength: 10,
                        coordinates: [
                            position,
                            target
                        ]
                    }));
                    staticBillboardCollection.current.add({
                        position,
                        image: markerImage.current,
                        color: getCesiumColor({
                            color: isSelected ? '#ffcc33' : '#ffffff'
                        }),
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                        allowPicking: false
                    });
                    staticLabelsCollection.current.add({
                        position,
                        text: view.title,
                        font: '12px sans-serif',
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                        fillColor: getCesiumColor({
                            color: '#ffffff'
                        }),
                        outlineColor: getCesiumColor({
                            color: '#000000'
                        }),
                        outlineWidth: 4,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        showBackground: false,
                        backgroundPadding: new Cesium.Cartesian2(4, 4),
                        pixelOffset: new Cesium.Cartesian2(0, -16),
                        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                        verticalOrigin: Cesium.VerticalOrigin.BASELINE
                    });
                });
            }
            if (showClipGeometries) {
                resources
                    .filter((resource) => {
                        const isUsedByView = !!views?.find((view) => view?.terrain?.clippingLayerResourceId === resource.id || view?.layers?.find(layer => layer?.clippingLayerResourceId === resource.id));
                        return !!(resource?.data?.collection?.features && isUsedByView);
                    })
                    .forEach(resource => {
                        formatClippingFeatures(resource.data.collection.features).forEach((feature) => {
                            staticPrimitivesCollection.current.add(createPolylinePrimitive({
                                color: '#ff0000',
                                opacity: 1.0,
                                width: 3,
                                dashLength: 10,
                                clampToGround: true,
                                coordinates: Cesium.Cartesian3.fromDegreesArray(feature.geometry.coordinates[0].reduce((acc, coords) => [...acc, ...coords], []))
                            }));
                            staticLabelsCollection.current.add({
                                position: Cesium.Cartesian3.fromDegreesArray(feature.geometry.coordinates[0][0])[0],
                                text: feature.id,
                                font: '12px sans-serif',
                                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                                fillColor: getCesiumColor({
                                    color: '#ffffff'
                                }),
                                outlineColor: getCesiumColor({
                                    color: '#000000'
                                }),
                                outlineWidth: 4,
                                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                                showBackground: false,
                                backgroundPadding: new Cesium.Cartesian2(4, 4),
                                pixelOffset: new Cesium.Cartesian2(0, -16),
                                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                                verticalOrigin: Cesium.VerticalOrigin.BASELINE
                            });
                        });
                    });
            }
            map.scene.requestRender();
        }
        return () => {
            if (map?.isDestroyed && !map.isDestroyed()) {
                staticPrimitivesCollection.current?.removeAll();
                staticBillboardCollection.current?.removeAll();
                staticLabelsCollection.current?.removeAll();
                map.scene.requestRender();
            }
        };
    }, [views, selectedId, map, showViewsGeometries, showClipGeometries, resources]);

    useEffect(() => {
        const scene = map.scene;
        const globe = scene.globe;
        const { globeTranslucency = {} } = selected || {};
        globe.translucency.frontFaceAlphaByDistance = new Cesium.NearFarScalar(
            selected?.globeTranslucency?.nearDistance ?? DefaultViewValues.TRANSLUCENCY_NEAR_DISTANCE,
            0.0,
            selected?.globeTranslucency?.farDistance ?? DefaultViewValues.TRANSLUCENCY_FAR_DISTANCE,
            1.0
        );
        const opacity = globeTranslucency?.opacity ?? DefaultViewValues.TRANSLUCENCY_OPACITY;
        globe.translucency.enabled = globeTranslucency?.enabled ?? false;
        globe.translucency.frontFaceAlphaByDistance.nearValue = opacity;
        globe.translucency.frontFaceAlphaByDistance.farValue = globeTranslucency?.fadeByDistance
            ? 1.0
            : opacity;
        map.scene.requestRender();
        return () => {
            if (map?.isDestroyed && !map.isDestroyed()) {
                globe.translucency.enabled = false;
            }
        };
    }, [
        selected?.globeTranslucency?.enabled,
        selected?.globeTranslucency?.fadeByDistance,
        selected?.globeTranslucency?.nearDistance,
        selected?.globeTranslucency?.farDistance,
        selected?.globeTranslucency?.opacity
    ]);

    useEffect(() => {
        const scene = map.scene;
        scene.invertClassification = !!selected?.mask?.enabled;
        scene.invertClassificationColor = new Cesium.Color(0, 0, 0, 0.0);
        return () => {
            if (map?.isDestroyed && !map.isDestroyed()) {
                scene.invertClassification = false;
            }
        };
    }, [
        selected?.mask?.enabled
    ]);

    useEffect(() => {
        const scene = map.scene;
        const globe = scene.globe;
        const terrainClippingLayerResource = resources?.find(resource => resource.id === selected?.terrain?.clippingLayerResourceId)?.data;
        const clippingPolygon = formatClippingFeatures(terrainClippingLayerResource?.collection?.features)?.find((feature) => feature.id === selected?.terrain?.clippingPolygonFeatureId);
        if (clippingPolygon) {
            const polygons = createClippingPolygonsFromGeoJSON(clippingPolygon);
            applyClippingPolygons({
                target: globe,
                polygons: polygons,
                inverse: !!selected?.terrain?.clippingPolygonUnion,
                scene: map.scene,
                additionalProperties: {
                    backFaceCulling: true,
                    showSkirts: true
                }
            });
        } else {
            globe?.clippingPolygons?.removeAll();
            map.scene.requestRender();
        }
        return () => {
            if (map?.isDestroyed && !map.isDestroyed()) {
                globe?.clippingPolygons?.removeAll();
                map.scene.requestRender();
            }
        };
    }, [
        selected?.terrain?.clippingPolygonFeatureId,
        selected?.terrain?.clippingPolygonUnion,
        selected?.terrain?.clipOriginalGeometry,
        selected?.terrain?.clippingLayerResourceId,
        resources
    ]);

    return null;
}

export default MapViewSupport;
