/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Cesium from 'cesium';

import {
    getCesiumColor,
    createPolylinePrimitive,
    createPolygonPrimitive,
    clearPrimitivesCollection,
    createCircleMarkerImage,
    createEllipsePrimitive,
    createEllipsePolylinePrimitive,
    createCylinderPolylinePrimitive,
    createCylinderPrimitive
} from './PrimitivesUtils';
import {
    computeDistance,
    computeGeodesicCoordinates
} from './MathUtils';
import throttle from 'lodash/throttle';
import isString from 'lodash/isString';
import { computePositionInfo } from './ClickUtils';
import {
    generateEditingStyle,
    featureToModifyProperties as defaultFeatureToModifyProperties,
    modifyPropertiesToFeatureProperties as defaultModifyPropertiesToFeatureProperties
} from '../DrawUtils';

function featureToCartesianCoordinates(geometryType, feature) {

    if (feature?.geometry === null) {
        return null;
    }

    const { geometry = {} } = feature;
    const { coordinates = []} = geometry;

    switch (geometryType || geometry?.type) {
    case 'Point':
    case 'Circle':
        return [Cesium.Cartographic.toCartesian(Cesium.Cartographic.fromDegrees(...coordinates))];
    case 'LineString':
        return coordinates.map((coords) => Cesium.Cartographic.toCartesian(Cesium.Cartographic.fromDegrees(...coords)));
    case 'Polygon':
        return coordinates[0].map((coords) => Cesium.Cartographic.toCartesian(Cesium.Cartographic.fromDegrees(...coords)));
    default:
        return null;
    }
}

function updateCoordinatesHeight(coordinates) {
    return coordinates.map(([lng, lat, height]) => [lng, lat, height === undefined ? 0 : height]);
}

function updateFeatureCoordinates(feature, updateCallback) {
    if (feature?.geometry === null) {
        return feature;
    }
    const { geometry = {} } = feature;
    switch (geometry?.type) {
    case 'Point':
        return {
            ...feature,
            geometry: {
                type: 'Point',
                coordinates: updateCoordinatesHeight([feature.geometry.coordinates].reduce(updateCallback, []))[0]
            }
        };
    case 'LineString':
        return {
            ...feature,
            geometry: {
                type: 'LineString',
                coordinates: updateCoordinatesHeight(feature.geometry.coordinates.reduce(updateCallback, []))
            }
        };
    case 'Polygon':
        return {
            ...feature,
            geometry: {
                type: 'Polygon',
                coordinates: [updateCoordinatesHeight(feature.geometry.coordinates[0].reduce(updateCallback, []))]
            }
        };
    default:
        return feature;
    }
}

/**
 * Class to manage all modify interaction of Cesium library given a GeoJSON as input data
At the moment  only `Feature` or `FeatureCollection` with single geometries are supported. **The component does not support multi geometry types**.
 * Following feature properties are used by the edit tool:
 * - properties.geodesic {boolean} if true enabled geodesic geometries editing
 * - properties.radius {number} value in meters of radius for `Circle` geometry
 * @param {object} options.map a Cesium map instance
 * @prop {object} geojson `Feature` or `FeatureCollection` GeoJSON data, **does not support multi geometry types**
 * @prop {function} getGeometryType argument of the function is the feature and it should return a string representing the geometry type: `Point`, `LineString`, `Polygon` or `Circle`
 * @param {function} options.onEditEnd triggered one the editing has been completed
 * @param {object} options.style style for drawing geometries, see the web/client/DrawUtils.js file
 * @param {number} options.mouseMoveThrottleTime change the throttle time to get feedback on mouse move event, default 100ms
 * @param {function} options.getPositionInfo custom function to return info given a position
 */
class CesiumModifyGeoJSONInteraction {
    constructor(options = {}) {
        // TODO: add support for multi geometry type.
        // We could check if possible to keep the currently workflow by splitting the multi geometry in single geometry
        // then on edit end reconstruct the multi geometry
        this._map = options.map;
        this._getPositionInfo = options.getPositionInfo ? options.getPositionInfo : (movement) => {
            const position = movement.position || movement.endPosition;
            const intersected = this._map.scene.drillPick(position);
            const { cartesian, cartographic } = computePositionInfo(this._map, movement);
            return { intersected, cartesian, cartographic };
        };
        this._handler = new Cesium.ScreenSpaceEventHandler(this._map.canvas);
        this._handler.setInputAction((movement) => {
            this._handleEdit(movement, true);
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        this._handler.setInputAction((movement) => {
            this._handleEdit(movement);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this._handler.setInputAction(throttle((movement) => {
            this._handleMouseMove(movement);
        }, options.mouseMoveThrottleTime ?? 100), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this._staticPrimitivesCollection = new Cesium.PrimitiveCollection({ destroyPrimitives: true });
        this._map.scene.primitives.add(this._staticPrimitivesCollection);

        this._staticBillboardCollection = new Cesium.BillboardCollection({ scene: this._map.scene });
        this._map.scene.primitives.add(this._staticBillboardCollection);

        this._dynamicPrimitivesCollection = new Cesium.PrimitiveCollection({ destroyPrimitives: true });
        this._map.scene.primitives.add(this._dynamicPrimitivesCollection);

        this._dynamicBillboardCollection = new Cesium.BillboardCollection({ scene: this._map.scene });
        this._map.scene.primitives.add(this._dynamicBillboardCollection);

        this._style = generateEditingStyle(options.style);

        this._cursorImage = createCircleMarkerImage(this._style ?.cursor?.radius * 2, { stroke: '#ffffff', strokeWidth: this._style ?.cursor?.width, fill: 'rgba(0, 0, 0, 0)' });
        this._coordinateNodeImage = createCircleMarkerImage(this._style ?.coordinatesNode?.radius * 2, { stroke: '#ffffff', strokeWidth: this._style?.coordinatesNode?.width, fill: 'rgba(0, 0, 0, 0.1)' });

        this._editing = false;

        this._onKeyboardEvent = (event) => {
            if (event.code === 'Escape' && this._editing) {
                this._editing = false;
                this._dynamicPrimitivesCollection.removeAll();
                this._dynamicBillboardCollection.removeAll();
            }
            if (this._map?.scene && !this._map.isDestroyed()) {
                this._map.scene.requestRender();
            }
        };
        window.addEventListener('keydown', this._onKeyboardEvent);

        this._featureToModifyProperties = defaultFeatureToModifyProperties({ getGeometryType: options?.getGeometryType });
        this._modifyPropertiesToFeatureProperties = defaultModifyPropertiesToFeatureProperties;
        this._onEditEnd = options?.onEditEnd ? options.onEditEnd : () => {};
        this.setGeoJSON(options?.geojson || []);
        Cesium.GroundPrimitive.initializeTerrainHeights()
            .then(() => {
                this._drawStaticFeatures();
            });
    }
    setGeoJSON(geojson) {
        this._features = geojson ? (
            geojson?.type === 'Feature'
                ? [geojson]
                : geojson?.features
        ).map((feature) => ({ ...feature, properties: this._featureToModifyProperties(feature) })) : [];
        this._geojson = {...geojson};
        this._drawStaticFeatures();
    }
    remove() {
        if (this._handler) {
            this._handler.destroy();
            this._handler = null;
        }
        this._editing = false;
        if (this._onKeyboardEvent) {
            window.removeEventListener('keydown', this._onKeyboardEvent);
        }
        if (this._map?.isDestroyed && !this._map.isDestroyed()) {
            clearPrimitivesCollection(this._map, this._staticPrimitivesCollection);
            this._staticPrimitivesCollection = null;
            clearPrimitivesCollection(this._map, this._staticBillboardCollection);
            this._staticBillboardCollection = null;

            clearPrimitivesCollection(this._map, this._dynamicPrimitivesCollection);
            this._dynamicPrimitivesCollection = null;
            clearPrimitivesCollection(this._map, this._dynamicBillboardCollection);
            this._dynamicBillboardCollection = null;
        }
    }
    _drawStaticFeatures() {
        this._staticBillboardCollection?.removeAll();
        this._staticPrimitivesCollection?.removeAll();
        if (this._features?.length > 0) {
            this._features.forEach((feature) => {
                this._updatePrimitives(feature);
            });
        }
    }
    _updatePrimitives(newFeature) {
        const { geometryType, geodesic, radius } = newFeature?.properties || {};
        const coordinates = featureToCartesianCoordinates(geometryType, newFeature);
        if (coordinates) {
            switch (geometryType) {
            case 'Circle':
                this._staticBillboardCollection.add({
                    id: newFeature?.id,
                    position: coordinates[coordinates.length - 1],
                    image: this._coordinateNodeImage,
                    color: getCesiumColor({
                        ...this._style?.coordinatesNode
                    }),
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                });
                if (geodesic) {
                    this._staticPrimitivesCollection.add(createEllipsePrimitive({
                        ...this._style?.areaDrawing,
                        coordinates: coordinates[coordinates.length - 1],
                        radius,
                        clampToGround: true
                    }));
                    // add a transparent line to improve interaction
                    this._staticPrimitivesCollection.add(createEllipsePolylinePrimitive({
                        ...this._style?.lineDrawing,
                        dashLength: undefined,
                        opacity: 0.01,
                        coordinates: coordinates[coordinates.length - 1],
                        radius,
                        allowPicking: true,
                        id: newFeature?.id,
                        geodesic: true
                    }));
                    this._staticPrimitivesCollection.add(createEllipsePolylinePrimitive({
                        ...this._style?.lineDrawing,
                        coordinates: coordinates[coordinates.length - 1],
                        radius,
                        allowPicking: false,
                        geodesic: true
                    }));
                } else {
                    this._staticPrimitivesCollection.add(createCylinderPrimitive({
                        ...this._style?.areaDrawing,
                        coordinates: coordinates[coordinates.length - 1],
                        radius
                    }));
                    this._staticPrimitivesCollection.add(createCylinderPolylinePrimitive({
                        ...this._style?.lineDrawing,
                        coordinates: coordinates[coordinates.length - 1],
                        allowPicking: true,
                        id: newFeature?.id,
                        radius
                    }));
                }
                break;
            case 'Point':
                this._staticBillboardCollection.add({
                    id: newFeature?.id,
                    position: coordinates[coordinates.length - 1],
                    image: this._coordinateNodeImage,
                    color: getCesiumColor({
                        ...this._style?.coordinatesNode
                    }),
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                });
                break;
            case 'LineString':
                if (coordinates.length > 1) {
                    coordinates.forEach((position, idx) => {
                        if (coordinates[idx + 1]) {
                            // add a transparent line to improve interaction
                            this._staticPrimitivesCollection.add(createPolylinePrimitive({
                                ...this._style?.lineDrawing,
                                dashLength: undefined,
                                opacity: 0.01,
                                coordinates: [
                                    position,
                                    coordinates[idx + 1]
                                ],
                                allowPicking: true,
                                id: `${newFeature?.id}:${idx}:segment`,
                                geodesic
                            }));
                            this._staticPrimitivesCollection.add(createPolylinePrimitive({
                                ...this._style?.lineDrawing,
                                coordinates: [
                                    position,
                                    coordinates[idx + 1]
                                ],
                                allowPicking: false,
                                geodesic
                            }));
                        }
                        this._staticBillboardCollection.add({
                            id: `${newFeature?.id}:${idx}:vertex`,
                            position,
                            image: this._coordinateNodeImage,
                            color: getCesiumColor({
                                ...this._style?.coordinatesNode
                            }),
                            disableDepthTestDistance: Number.POSITIVE_INFINITY
                        });
                    });
                }
                break;
            case 'Polygon':
                if (coordinates.length > 2) {
                    this._staticPrimitivesCollection.add(createPolygonPrimitive({
                        ...this._style?.areaDrawing,
                        coordinates: [...coordinates],
                        geodesic
                    }));
                    coordinates.forEach((position, idx) => {
                        if (coordinates[idx + 1]) {
                            // add a transparent line to improve interaction
                            this._staticPrimitivesCollection.add(createPolylinePrimitive({
                                ...this._style?.lineDrawing,
                                dashLength: undefined,
                                opacity: 0.01,
                                coordinates: [
                                    position,
                                    coordinates[idx + 1]
                                ],
                                allowPicking: true,
                                id: `${newFeature?.id}:${idx}:segment`,
                                geodesic
                            }));
                            this._staticPrimitivesCollection.add(createPolylinePrimitive({
                                ...this._style?.lineDrawing,
                                coordinates: [
                                    position,
                                    coordinates[idx + 1]
                                ],
                                allowPicking: false,
                                geodesic
                            }));
                        }
                        this._staticBillboardCollection.add({
                            id: `${newFeature?.id}:${idx}:vertex`,
                            position,
                            image: this._coordinateNodeImage,
                            color: getCesiumColor({
                                ...this._style?.coordinatesNode
                            }),
                            disableDepthTestDistance: Number.POSITIVE_INFINITY
                        });
                    });
                }
                break;
            default:
                break;
            }
        }
        this._map.scene.requestRender();
    }
    _getPrimitiveFeatureId(objectId) {
        return (isString(objectId) ? (objectId || '').split(':') : [])[0];
    }
    _getIntersectedInfo(movement) {
        const { cartesian, cartographic, intersected } = this._getPositionInfo(movement);
        const { id, primitive } = intersected.find((object) => {
            const primitiveFeatureId = this._getPrimitiveFeatureId(object.id);
            const selected = primitiveFeatureId && this._features.find((feature) => feature?.id === primitiveFeatureId);
            if (selected && object.primitive instanceof Cesium.Billboard) {
                return true;
            }
            if (selected && object.primitive instanceof Cesium.Primitive) {
                return true;
            }
            if (selected && object.primitive instanceof Cesium.GroundPolylinePrimitive) {
                return true;
            }
            return false;
        }) || {};
        return { cartesian, cartographic, primitive, id };
    }
    _normalizeGeoJSONResult(callback) {
        const newFeatures = [
            ...(this._geojson?.type === 'Feature'
                ? [this._geojson]
                : this._geojson.features)
        ].map(callback);
        return this._geojson?.type === 'Feature'
            ? newFeatures[0]
            : { type: 'FeatureCollection', features: newFeatures };
    }
    _handleOnEditEnd(newFeature) {
        const newGeoJSON = this._normalizeGeoJSONResult(feature => feature.id === newFeature?.id
            ? {
                ...feature,
                geometry: newFeature.geometry,
                properties: this._modifyPropertiesToFeatureProperties(newFeature?.properties, feature)
            }
            : feature);
        return this._onEditEnd(newGeoJSON);
    }
    _getSingleLinStringGeometry() {
        if (this._features?.length !== 1) {
            return false;
        }
        return this._features[0]?.geometry?.type === 'LineString'
            ? this._features[0]
            : false;
    }
    _handleMouseMove(movement) {
        this._dynamicPrimitivesCollection.removeAll();
        this._dynamicBillboardCollection.removeAll();
        const intersectedInfo = this._getIntersectedInfo(movement);
        const { primitive, cartesian } = intersectedInfo;
        const primitiveFeatureId = this._getPrimitiveFeatureId(this._editing ? this._editing.id : intersectedInfo.id);
        const feature = primitiveFeatureId && this._features.find(({ id }) => id === primitiveFeatureId);
        const { geometryType, radius, geodesic } = feature?.properties || {};

        if (this._editing) {
            if (['Point', 'Circle'].includes(geometryType) && this._editing.primitive instanceof Cesium.Billboard) {
                this._dynamicBillboardCollection.add({
                    position: cartesian,
                    image: this._coordinateNodeImage,
                    color: getCesiumColor({
                        ...this._style?.cursor
                    }),
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                });
                if (geometryType === 'Circle') {
                    this._dynamicPrimitivesCollection.add(geodesic
                        ? createEllipsePrimitive({
                            ...this._style?.area,
                            coordinates: cartesian,
                            radius,
                            clampToGround: true
                        })
                        : createCylinderPrimitive({
                            ...this._style?.areaDrawing,
                            coordinates: cartesian,
                            radius
                        })
                    );
                }
                if (geodesic) {
                    const geodesicCoordinatesZero = computeGeodesicCoordinates([cartesian]);
                    this._dynamicPrimitivesCollection.add(createPolylinePrimitive({ ...this._style?.wireframe, coordinates: [geodesicCoordinatesZero[0], cartesian] }));
                    this._dynamicBillboardCollection.add({
                        position: geodesicCoordinatesZero[0],
                        image: this._coordinateNodeImage,
                        color: getCesiumColor({
                            ...this._style?.coordinatesNode
                        }),
                        disableDepthTestDistance: Number.POSITIVE_INFINITY
                    });
                }
            }
            if (geometryType === 'Circle' && (this._editing.primitive instanceof Cesium.GroundPolylinePrimitive || this._editing.primitive instanceof Cesium.Primitive)) {
                const center = Cesium.Cartographic.toCartesian(
                    new Cesium.Cartographic(
                        Cesium.Math.toRadians(feature.geometry.coordinates[0]),
                        Cesium.Math.toRadians(feature.geometry.coordinates[1]),
                        feature.geometry.coordinates[2] ?? 0
                    )
                );
                const newRadius = computeDistance([center, cartesian], geodesic);
                if (geodesic) {
                    const geodesicCoordinates = computeGeodesicCoordinates([center, cartesian], cartographic => cartographic[cartographic.length - 1]?.height);
                    const geodesicCoordinatesZero = computeGeodesicCoordinates([center, cartesian]);
                    this._dynamicPrimitivesCollection.add(createEllipsePrimitive({
                        ...this._style?.area,
                        coordinates: center,
                        radius: newRadius,
                        clampToGround: true
                    }));
                    this._dynamicPrimitivesCollection.add(createEllipsePolylinePrimitive({
                        ...this._style?.wireframe,
                        coordinates: geodesicCoordinates[0],
                        radius: newRadius,
                        geodesic: true
                    }));
                    this._dynamicPrimitivesCollection.add(createEllipsePolylinePrimitive({
                        ...this._style?.lineDrawing,
                        coordinates: geodesicCoordinatesZero[0],
                        radius: newRadius,
                        geodesic: true
                    }));
                    this._dynamicBillboardCollection.add({
                        position: center,
                        image: this._cursorImage,
                        color: getCesiumColor({
                            ...this._style?.cursor
                        }),
                        disableDepthTestDistance: Number.POSITIVE_INFINITY
                    });
                    this._dynamicBillboardCollection.add({
                        position: geodesicCoordinates[0],
                        image: this._cursorImage,
                        color: getCesiumColor({
                            ...this._style?.cursor
                        }),
                        disableDepthTestDistance: Number.POSITIVE_INFINITY
                    });
                    this._dynamicBillboardCollection.add({
                        position: geodesicCoordinatesZero[0],
                        image: this._cursorImage,
                        color: getCesiumColor({
                            ...this._style?.cursor
                        }),
                        disableDepthTestDistance: Number.POSITIVE_INFINITY
                    });
                    this._dynamicPrimitivesCollection.add(createPolylinePrimitive({
                        ...this._style?.wireframe,
                        geodesic: true,
                        coordinates: [
                            center,
                            geodesicCoordinatesZero[0],
                            geodesicCoordinatesZero[1],
                            geodesicCoordinates[1],
                            geodesicCoordinates[0]
                        ]
                    }));
                } else {
                    this._dynamicPrimitivesCollection.add(createCylinderPolylinePrimitive({
                        ...this._style?.lineDrawing,
                        coordinates: center,
                        radius: newRadius
                    }));
                    this._dynamicPrimitivesCollection.add(createPolylinePrimitive({
                        ...this._style?.wireframe,
                        coordinates: [center, cartesian]
                    }));
                }
            }
            if (['LineString', 'Polygon'].includes(geometryType) && this._editing.primitive instanceof Cesium.Billboard) {
                const index = parseFloat(this._editing.id.split(':')[1]);
                const coordinates = featureToCartesianCoordinates(geometryType, feature);
                const updatedCoordinates = [
                    ...(coordinates[index - 1]
                        ? [coordinates[index - 1]]
                        : geometryType === 'Polygon'
                            ? [coordinates[coordinates.length - 2]]
                            : []),
                    cartesian,
                    ...(coordinates[index + 1]
                        ? [coordinates[index + 1]]
                        : geometryType === 'Polygon'
                            ? [coordinates[1]]
                            : [])];
                this._dynamicBillboardCollection.add({
                    position: cartesian,
                    image: this._coordinateNodeImage,
                    color: getCesiumColor({
                        ...this._style?.cursor
                    }),
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                });
                if (geodesic) {
                    const { height } = Cesium.Cartographic.fromCartesian(cartesian);
                    const geodesicCoordinates = computeGeodesicCoordinates(updatedCoordinates, () => height);
                    const geodesicCoordinatesZero = computeGeodesicCoordinates(updatedCoordinates);
                    this._dynamicPrimitivesCollection.add(createPolylinePrimitive({ ...this._style?.wireframe, geodesic, coordinates: [...geodesicCoordinates] }));
                    this._dynamicPrimitivesCollection.add(createPolylinePrimitive({ ...this._style?.lineDrawing, geodesic, coordinates: [...geodesicCoordinatesZero] }));
                    geodesicCoordinates.forEach((coord, idx) => {
                        this._dynamicPrimitivesCollection.add(createPolylinePrimitive({ ...this._style?.wireframe, geodesic, coordinates: [geodesicCoordinatesZero[idx], geodesicCoordinates[idx]] }));
                    });
                } else {
                    this._dynamicPrimitivesCollection.add(createPolylinePrimitive({
                        ...this._style?.lineDrawing,
                        coordinates: updatedCoordinates
                    }));
                }
            }
            if (['LineString', 'Polygon'].includes(geometryType) && this._editing.primitive instanceof Cesium.Primitive) {
                const index = parseFloat(this._editing.id.split(':')[1]);
                const coordinates = featureToCartesianCoordinates(geometryType, feature);
                const updatedCoordinates = [
                    ...(coordinates[index] ? [coordinates[index]] : []),
                    cartesian,
                    ...(coordinates[index + 1] ? [coordinates[index + 1]] : [])
                ];
                this._dynamicBillboardCollection.add({
                    position: cartesian,
                    image: this._coordinateNodeImage,
                    color: getCesiumColor({
                        ...this._style?.cursor
                    }),
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                });
                if (geodesic) {
                    const { height } = Cesium.Cartographic.fromCartesian(cartesian);
                    const geodesicCoordinates = computeGeodesicCoordinates(updatedCoordinates, () => height);
                    const geodesicCoordinatesZero = computeGeodesicCoordinates(updatedCoordinates);
                    this._dynamicPrimitivesCollection.add(createPolylinePrimitive({ ...this._style?.wireframe, geodesic, coordinates: [...geodesicCoordinates] }));
                    this._dynamicPrimitivesCollection.add(createPolylinePrimitive({ ...this._style?.lineDrawing, geodesic, coordinates: [...geodesicCoordinatesZero] }));
                    geodesicCoordinates.forEach((coord, idx) => {
                        this._dynamicPrimitivesCollection.add(createPolylinePrimitive({ ...this._style?.wireframe, geodesic, coordinates: [geodesicCoordinatesZero[idx], geodesicCoordinates[idx]] }));
                    });
                } else {
                    this._dynamicPrimitivesCollection.add(createPolylinePrimitive({
                        ...this._style?.lineDrawing,
                        coordinates: [
                            ...(coordinates[index] ? [coordinates[index]] : []),
                            cartesian,
                            ...(coordinates[index + 1] ? [coordinates[index + 1]] : [])
                        ]
                    }));
                }
            }
            const singleLinStringGeometry = this._getSingleLinStringGeometry();
            if (!this._editing.primitive && singleLinStringGeometry && cartesian) {
                const coordinates = featureToCartesianCoordinates(geometryType, singleLinStringGeometry);
                const singleLinStringGeometryGeodesic = singleLinStringGeometry?.properties?.geodesic;
                if (singleLinStringGeometryGeodesic) {
                    const updatedCoordinates = [
                        coordinates[coordinates.length - 1],
                        cartesian
                    ];
                    const geodesicCoordinates = computeGeodesicCoordinates(updatedCoordinates, cartographic => cartographic[cartographic.length - 1]?.height);
                    const geodesicCoordinatesZero = computeGeodesicCoordinates(updatedCoordinates);
                    this._dynamicPrimitivesCollection.add(createPolylinePrimitive({ ...this._style?.wireframe, geodesic: true, coordinates: [...geodesicCoordinates] }));
                    this._dynamicPrimitivesCollection.add(createPolylinePrimitive({ ...this._style?.lineDrawing, geodesic: true, coordinates: [...geodesicCoordinatesZero] }));
                    geodesicCoordinates.forEach((coord, idx) => {
                        this._dynamicPrimitivesCollection.add(createPolylinePrimitive({ ...this._style?.wireframe, geodesic: true, coordinates: [geodesicCoordinatesZero[idx], geodesicCoordinates[idx]] }));
                    });
                } else {
                    this._dynamicPrimitivesCollection.add(createPolylinePrimitive({
                        ...this._style?.lineDrawing,
                        coordinates: [
                            coordinates[coordinates.length - 1],
                            cartesian
                        ]
                    }));
                }
                this._dynamicBillboardCollection.add({
                    position: cartesian,
                    image: this._coordinateNodeImage,
                    color: getCesiumColor({
                        ...this._style?.cursor
                    }),
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                });
            }
            this._map.scene.requestRender();
            return null;
        }

        if (primitive instanceof Cesium.Billboard) {
            this._dynamicBillboardCollection.add({
                position: primitive.position,
                image: this._cursorImage,
                color: getCesiumColor({
                    ...this._style?.cursor
                }),
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            });
        }
        if (primitive instanceof Cesium.Primitive
        || primitive instanceof Cesium.GroundPolylinePrimitive) {
            this._dynamicBillboardCollection.add({
                position: cartesian,
                image: this._cursorImage,
                color: getCesiumColor({
                    ...this._style?.cursor
                }),
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            });
        }
        this._map.scene.requestRender();
        return null;
    }
    _handleEdit(movement, close) {
        const intersectedInfo = this._getIntersectedInfo(movement);
        const primitiveFeatureId = this._getPrimitiveFeatureId(this._editing ? this._editing.id : intersectedInfo.id);
        const feature = primitiveFeatureId && this._features.find(({ id }) => id === primitiveFeatureId);
        const { geometryType, geodesic } = feature?.properties || {};
        if (this._editing) {
            this._dynamicPrimitivesCollection.removeAll();
            this._dynamicBillboardCollection.removeAll();
            const editingPrimitive = this._editing.primitive;
            const editingId = this._editing.id;
            this._editing = false;
            const { cartographic, cartesian } = intersectedInfo;
            const newCoords = cartographic && [
                Cesium.Math.toDegrees(cartographic.longitude),
                Cesium.Math.toDegrees(cartographic.latitude),
                geodesic ? 0 : cartographic.height
            ];
            if (['Circle', 'Point'].includes(geometryType) && newCoords && editingPrimitive instanceof Cesium.Billboard) {
                return this._handleOnEditEnd(
                    updateFeatureCoordinates(
                        feature,
                        (acc) => [
                            ...acc,
                            newCoords
                        ])
                );
            }
            if (geometryType === 'Circle' && newCoords && (editingPrimitive instanceof Cesium.GroundPolylinePrimitive || editingPrimitive instanceof Cesium.Primitive)) {
                const center = Cesium.Cartographic.toCartesian(
                    new Cesium.Cartographic(
                        Cesium.Math.toRadians(feature.geometry.coordinates[0]),
                        Cesium.Math.toRadians(feature.geometry.coordinates[1]),
                        feature.geometry.coordinates[2] ?? 0
                    )
                );
                const newRadius = computeDistance([center, cartesian], geodesic);
                return this._handleOnEditEnd({
                    ...feature,
                    properties: {
                        ...feature?.properties,
                        radius: newRadius
                    }
                });
            }
            if (geometryType === 'Polygon' && newCoords && editingPrimitive instanceof Cesium.Billboard) {
                const editingIdx = parseFloat(editingId.split(':')[1]);
                const getIndexes = (coordinates) => (editingIdx === 0 || editingIdx === coordinates.length - 1)
                    ? [0, coordinates.length - 1]
                    : [editingIdx];
                return this._handleOnEditEnd(
                    updateFeatureCoordinates(
                        feature,
                        (acc, coords, idx, coordinates) => [
                            ...acc,
                            getIndexes(coordinates).includes(idx) ? newCoords : coords
                        ])
                );
            }
            if (newCoords && editingPrimitive instanceof Cesium.Billboard) {
                const editingIdx = parseFloat(editingId.split(':')[1]);
                return this._handleOnEditEnd(
                    updateFeatureCoordinates(
                        feature,
                        (acc, coords, idx) => [
                            ...acc,
                            idx === editingIdx ? newCoords : coords
                        ])
                );
            }

            if (newCoords && editingPrimitive instanceof Cesium.Primitive) {
                const editingIdx = parseFloat(editingId.split(':')[1]);
                return this._handleOnEditEnd(
                    updateFeatureCoordinates(
                        feature,
                        (acc, coords, idx) => [
                            ...acc,
                            coords,
                            ...(idx === editingIdx ? [newCoords] : [])
                        ])
                );
            }
            const singleLinStringGeometry = this._getSingleLinStringGeometry();
            if (newCoords && !editingPrimitive && singleLinStringGeometry) {
                const fixedCoords = [
                    newCoords[0],
                    newCoords[1],
                    singleLinStringGeometry?.properties?.geodesic ? 0 : newCoords[2]
                ];
                if (close) {
                    return this._handleOnEditEnd(
                        updateFeatureCoordinates(
                            singleLinStringGeometry,
                            (acc, coords, idx, coordinates) => [
                                ...acc,
                                ...(idx < coordinates.length - 1
                                    ? [coords]
                                    : [])
                            ]
                        )
                    );
                }
                this._editing = { id: editingId };
                return this._handleOnEditEnd(
                    updateFeatureCoordinates(
                        singleLinStringGeometry,
                        (acc, coords, idx, coordinates) => [
                            ...acc,
                            coords,
                            ...(idx === coordinates.length - 1
                                ? [fixedCoords]
                                : [])
                        ]
                    )
                );
            }
        } else {
            this._editing = intersectedInfo;
            if (!intersectedInfo.primitive && !this._getSingleLinStringGeometry()) {
                this._editing = false;
            }
        }
        return null;
    }
}

export default CesiumModifyGeoJSONInteraction;
