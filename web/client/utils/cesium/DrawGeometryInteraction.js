/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Cesium from 'cesium';
import throttle from 'lodash/throttle';
import { computePositionInfo } from './ClickUtils';
import {
    getCesiumColor,
    createPolylinePrimitive,
    createPolygonPrimitive,
    clearPrimitivesCollection,
    createCircleMarkerImage,
    createEllipsePolylinePrimitive,
    createCylinderPolylinePrimitive
} from './PrimitivesUtils';

import {
    computeArea,
    computeDistance,
    computeHeightSign,
    cartesianToCartographicArray,
    computeGeodesicCoordinates
} from './MathUtils';
import { generateEditingStyle } from '../DrawUtils';

function defaultGetPositionInfo(map, movement, {
    getObjectsToExcludeOnPick = () => [],
    pickObjectsLimit = Number.MAX_VALUE,
    depthTestAgainstTerrain
} = {}) {

    const objectToExclude = getObjectsToExcludeOnPick();

    let currentDepthTestAgainstTerrain;
    if (depthTestAgainstTerrain !== undefined) {
        // we should enable depth test to correctly compute the drawing on terrain
        currentDepthTestAgainstTerrain = map.scene.globe.depthTestAgainstTerrain;
        map.scene.globe.depthTestAgainstTerrain = depthTestAgainstTerrain;
    }

    // pick position works with the all the object in the scene
    // to avoid to intercept the geometries we are drawing we need to temporary hide them
    objectToExclude.forEach((obj) => {
        if (obj) {
            obj.show = false;
        }
    });

    const scene = map.scene;
    scene.render();

    const positionInfo = computePositionInfo(map, movement, {
        pickObjectsLimit
    });

    // restore the initial values
    if (depthTestAgainstTerrain !== undefined) {
        map.scene.globe.depthTestAgainstTerrain = currentDepthTestAgainstTerrain;
    }

    objectToExclude.forEach((obj) => {
        if (obj) {
            obj.show = true;
        }
    });

    return positionInfo;
}

function cesiumCoordinatesToGeoJSONFeature(geometryType, coordinates, {
    area,
    areaUom,
    length,
    lengthUom,
    height,
    heightUom,
    terrainCoordinates,
    geodesic
}) {
    const geodesicHeight = geodesic && coordinates?.[coordinates.length - 1] ? Cesium.Cartographic.fromCartesian(coordinates[coordinates.length - 1]).height : undefined;
    switch (geometryType) {
    case 'Point':
        return {
            type: 'Feature',
            properties: terrainCoordinates
                ? {
                    height,
                    heightUom,
                    terrainCoordinates
                }
                : { geodesic },
            geometry: {
                type: 'Point',
                coordinates: cartesianToCartographicArray(coordinates[coordinates.length - 1], geodesicHeight)
            }
        };
    case 'LineString':
        return {
            type: 'Feature',
            properties: { length, lengthUom, geodesic },
            geometry: {
                type: 'LineString',
                coordinates: coordinates.map((cartesian) => cartesianToCartographicArray(cartesian, geodesicHeight))
            }
        };
    case 'Polygon':
        return {
            type: 'Feature',
            properties: { area, areaUom, length, lengthUom, geodesic },
            geometry: {
                type: 'Polygon',
                coordinates: [
                    coordinates.map((cartesian) => cartesianToCartographicArray(cartesian, geodesicHeight))
                ]
            }
        };
    case 'Circle':
        const radius = computeDistance([coordinates[0], coordinates[1]], geodesic);
        return {
            type: 'Feature',
            properties: { radius, radiusUom: 'm', geodesic },
            geometry: {
                type: 'Point',
                coordinates: cartesianToCartographicArray(coordinates[0], geodesicHeight)
            }
        };
    default:
        return null;
    }
}

function validateDrawnGeometry(geometryType, coordinates, coordinatesLength) {
    if (coordinatesLength && coordinatesLength !== coordinates.length) {
        return false;
    }
    switch (geometryType) {
    case 'Point':
        return true;
    case 'LineString':
        return true;
    case 'Polygon':
        return coordinates.length > 2;
    default:
        return true;
    }
}

function getSampledTerrainPositions(terrainProvider, level = 18, positions) {
    return new Promise((resolve) => {
        const cartographicHeightZero = positions
            .map(cartesian => Cesium.Cartographic.fromCartesian(cartesian))
            .map(cartographic => new Cesium.Cartographic(cartographic.longitude, cartographic.latitude, 0));

        const promise = terrainProvider?.availability
            ? Cesium.sampleTerrainMostDetailed(
                terrainProvider,
                cartographicHeightZero
            )
            : Cesium.sampleTerrain(
                terrainProvider,
                level,
                cartographicHeightZero
            );
        if (Cesium.defined(promise)) {
            promise
                .then((updatedPositions) => {
                    resolve(updatedPositions);
                })
                // the sampleTerrainMostDetailed from the Cesium Terrain is still using .otherwise
                // and it resolve everything in the .then
                // while the sampleTerrain uses .catch
                // the optional chain help us to avoid error if catch is not exposed by the promise
                ?.catch?.(() => {
                    resolve();
                });
        } else {
            resolve();
        }
    });
}

/**
 * Class to manage all the drawing interaction of Cesium library
 * @param {string} options.type type of drawing, one of: `Point`, `LineString`, `Polygon` or `Circle`
 * @param {object} options.map a Cesium map instance
 * @param {number} options.coordinatesLength maximum count of drawing coordinates
 * @param {function} options.getPositionInfo custom function to return info given a position
 * @param {function} options.getObjectsToExcludeOnPick function that returns a list of primitives to exclude when computing the position with the default `getPositionInfo` function
 * @param {boolean} options.depthTestAgainstTerrain apply `depthTestAgainstTerrain` while drawing inside the default `getPositionInfo` function
 * @param {object} options.style style for drawing geometries, see the `web/client/DrawUtils.js` file
 * @param {boolean} options.geodesic if true the geometries height will be forced to the ellipsoid at 0 height
 * @param {boolean} options.sampleTerrain enable the possibility to get the point on terrain, it works only with `Point` type
 * @param {number} options.mouseMoveThrottleTime change the throttle time in milliseconds to get feedback on mouse move event, default 100ms
 * @param {function} options.onDrawStart triggered on draw start
 * @param {function} options.onDrawing triggered while drawing
 * @param {function} options.onMouseMove triggered while moving the mouse over the globe
 * @param {function} options.onDrawEnd triggered when the drawing event is completed (double click)
 */
class CesiumDrawGeometryInteraction {

    constructor(options) {

        this._type = options?.type;
        this._map = options?.map;
        this._coordinatesLength = options?.coordinatesLength;
        this._geodesic = options?.geodesic;
        this._sampleTerrain = options?.sampleTerrain;
        this._getObjectsToExcludeOnPick = () => [
            ...(options?.getObjectsToExcludeOnPick ? options.getObjectsToExcludeOnPick() : []),
            this._dynamicPrimitivesCollection,
            this._dynamicBillboardCollection
        ];
        this._depthTestAgainstTerrain = options?.depthTestAgainstTerrain;
        this._getPositionInfo =  options?.getPositionInfo || defaultGetPositionInfo;

        this._handler = new Cesium.ScreenSpaceEventHandler(this._map.canvas);
        this._handler.setInputAction((movement) => {
            this._handleDrawEnd(movement, true);
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        this._handler.setInputAction((movement) => {
            this._handleDrawing(movement);
            this._handleDrawStart(movement);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this._handler.setInputAction(throttle((movement) => {
            this._handleMouseMove(movement);
        }, options.mouseMoveThrottleTime ?? 100), Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this._drawing = false;
        this._forcedDrawEnd = false;
        this._coordinates = [];

        this._style = generateEditingStyle(options?.style);

        this._dynamicPrimitivesCollection = new Cesium.PrimitiveCollection({ destroyPrimitives: true });
        this._map.scene.primitives.add(this._dynamicPrimitivesCollection);

        this._dynamicBillboardCollection = new Cesium.BillboardCollection({ scene: this._map.scene });
        this._map.scene.primitives.add(this._dynamicBillboardCollection);

        this._cursorImage = createCircleMarkerImage(this._style?.cursor?.radius * 2, { stroke: '#ffffff', strokeWidth: this._style?.cursor?.width, fill: 'rgba(0, 0, 0, 0)' });
        this._coordinateNodeImage = createCircleMarkerImage(this._style?.coordinatesNode?.radius * 2, { stroke: '#ffffff', strokeWidth: this._style?.coordinatesNode?.width, fill: 'rgba(0, 0, 0, 0.1)' });

        this._onMouseMove = options?.onMouseMove ? options.onMouseMove : () => {};
        this._onDrawStart = options?.onDrawStart ? options.onDrawStart : () => {};
        this._onDrawing = options?.onDrawing ? options.onDrawing : () => {};
        this._onDrawEnd = options?.onDrawEnd ? options.onDrawEnd : () => {};
    }
    getCoordinates() {
        return this._coordinates;
    }
    remove() {
        if (this._handler) {
            this._handler.destroy();
            this._handler = null;
        }
        this._coordinates = [];
        this._drawing = false;
        if (this._map?.isDestroyed && !this._map.isDestroyed()) {
            clearPrimitivesCollection(this._map, this._dynamicPrimitivesCollection);
            this._dynamicPrimitivesCollection = null;
            clearPrimitivesCollection(this._map, this._dynamicBillboardCollection);
            this._dynamicBillboardCollection = null;
        }
    }
    _getCoordinatesLength() {
        return this._type === 'Circle' ? 2 : this._coordinatesLength;
    }
    _handleMouseMove(movement) {
        const { cartesian } = this._getPositionInfo(this._map, movement, {
            getObjectsToExcludeOnPick: this._getObjectsToExcludeOnPick,
            depthTestAgainstTerrain: this._depthTestAgainstTerrain
        });
        if (cartesian) {
            if (this._type === 'Point' && this._sampleTerrain) {
                getSampledTerrainPositions(
                    this._map?.terrainProvider,
                    this._map?.terrainProvider?.sampleTerrainZoomLevel ?? 18,
                    [cartesian]
                )
                    .then((updatedPositions) => {
                        let distance;
                        if (updatedPositions) {
                            const [updatedPosition] = updatedPositions;
                            const cartesianTerrain = Cesium.Cartographic.toCartesian(updatedPosition);
                            const heightCoordinates = [cartesianTerrain, cartesian];
                            distance = computeHeightSign(heightCoordinates) * computeDistance(heightCoordinates);
                            this._coordinates = heightCoordinates;
                        } else {
                            this._coordinates = [cartesian];
                        }
                        this._onMouseMove(this._drawPrimitives({
                            distance,
                            cartesian,
                            coordinates: [...this._coordinates]
                        }));
                    });
            } else {
                const previousCartesian = this._coordinates[this._coordinates.length - 1];
                const currentCoordinates = [...this._coordinates, cartesian];
                const area = computeArea(currentCoordinates, undefined);
                const distance = computeDistance(currentCoordinates, this._geodesic);
                this._onMouseMove(this._drawPrimitives({
                    area,
                    distance,
                    previousCartesian,
                    cartesian,
                    coordinates: currentCoordinates
                }));
            }
        }
    }
    _handleDrawStart(movement) {
        if (!this._drawing && !this._forcedDrawEnd && !this._handler?.isDestroyed?.()) {
            const initialCoordinates = [...this._coordinates];
            this._coordinates = [];
            const { cartesian } = this._getPositionInfo(this._map, movement, {
                getObjectsToExcludeOnPick: this._getObjectsToExcludeOnPick,
                depthTestAgainstTerrain: this._depthTestAgainstTerrain
            });
            if (cartesian) {
                this._coordinates.push(cartesian);
                if (this._type === 'Point') {

                    const requestSampleTerrain = this._sampleTerrain && initialCoordinates.length !== 2
                        ? () => getSampledTerrainPositions(
                            this._map?.terrainProvider,
                            this._map?.terrainProvider?.sampleTerrainZoomLevel ?? 18,
                            [cartesian]
                        )
                            .then((updatedPositions) => {
                                if (updatedPositions) {
                                    const [updatedPosition] = updatedPositions;
                                    const cartesianTerrain = Cesium.Cartographic.toCartesian(updatedPosition);
                                    const heightCoordinates = [cartesianTerrain, cartesian];
                                    return heightCoordinates;
                                }
                                return [cartesian];
                            })
                        : () => Promise.resolve(initialCoordinates.length === 2 ? initialCoordinates : [cartesian]);

                    requestSampleTerrain()
                        .then((currentCoordinates) => {
                            this._onDrawStart(this._drawPrimitives({
                                cartesian: currentCoordinates[currentCoordinates.length - 1],
                                coordinates: currentCoordinates,
                                geodesicCoordinates: computeGeodesicCoordinates(currentCoordinates)
                            }));
                            this._onDrawEnd(this._clearPrimitive({
                                coordinates: currentCoordinates,
                                geodesicCoordinates: computeGeodesicCoordinates(currentCoordinates),
                                feature: this._sampleTerrain && currentCoordinates.length === 2
                                    ? cesiumCoordinatesToGeoJSONFeature(this._type, currentCoordinates, {
                                        height: computeHeightSign(currentCoordinates) * computeDistance(currentCoordinates),
                                        heightUom: 'm',
                                        terrainCoordinates: cartesianToCartographicArray(currentCoordinates[0]),
                                        geodesic: this._geodesic
                                    })
                                    : cesiumCoordinatesToGeoJSONFeature(this._type, currentCoordinates, { geodesic: this._geodesic })
                            }));
                        });
                    this._coordinates = [];
                } else {
                    this._onDrawStart(this._drawPrimitives({
                        cartesian,
                        coordinates: [...this._coordinates],
                        geodesicCoordinates: computeGeodesicCoordinates(this._coordinates)
                    }));
                    this._drawing = true;
                }
            }
        }
        if (this._forcedDrawEnd) {
            this._forcedDrawEnd = false;
        }
    }
    _handleDrawing(movement) {
        if (this._drawing) {
            if ((this._coordinates.length + 1) === this._getCoordinatesLength()) {
                this._forcedDrawEnd = true;
                return this._handleDrawEnd(movement);
            }
            const { cartesian } = this._getPositionInfo(this._map, movement, {
                getObjectsToExcludeOnPick: this._getObjectsToExcludeOnPick,
                depthTestAgainstTerrain: this._depthTestAgainstTerrain
            });
            if (cartesian) {
                const previousCartesian = this._coordinates[this._coordinates.length - 1];
                this._coordinates.push(cartesian);
                const currentCoordinates = [...this._coordinates];
                const area = computeArea(currentCoordinates, undefined);
                const distance = computeDistance(currentCoordinates, this._geodesic);
                this._onDrawing(this._drawPrimitives({
                    area,
                    distance,
                    previousCartesian,
                    cartesian,
                    coordinates: [...this._coordinates],
                    geodesicCoordinates: computeGeodesicCoordinates(this._coordinates)
                }));
            }
        }
        return null;
    }
    _handleDrawEnd(movement, isDoubleClick) {
        if (this._drawing) {
            const { cartesian } = this._getPositionInfo(this._map, movement, {
                getObjectsToExcludeOnPick: this._getObjectsToExcludeOnPick,
                depthTestAgainstTerrain: this._depthTestAgainstTerrain
            });

            if (isDoubleClick) {
                // remove last two elements added with the double click event
                this._coordinates.splice(this._coordinates.length - 2, 2);
            }

            this._coordinates.push(cartesian);

            if (!validateDrawnGeometry(this._type, [...this._coordinates], this._getCoordinatesLength())) {
                this._onDrawEnd(this._clearPrimitive({}));
                this._coordinates = [];
                this._drawing = false;
                return null;
            }

            const currentCoordinates = this._type === 'Polygon'
                ? [...this._coordinates, this._coordinates[0]]
                : [...this._coordinates];
            const area = computeArea(currentCoordinates, undefined);
            const distance = computeDistance(currentCoordinates, this._geodesic);

            this._onDrawEnd(this._clearPrimitive({
                area,
                distance,
                coordinates: currentCoordinates,
                geodesicCoordinates: computeGeodesicCoordinates(currentCoordinates),
                feature: cesiumCoordinatesToGeoJSONFeature(this._type, currentCoordinates, {
                    area,
                    areaUom: 'sqm',
                    length: distance,
                    lengthUom: 'm',
                    geodesic: this._geodesic
                })
            }));
            this._coordinates = [];
            this._drawing = false;
        }
        return null;
    }
    _drawPrimitives(options) {
        if (this._style) {
            this._updateDynamicCoordinates(options.coordinates);
        }
        return options;
    }

    _clearPrimitive(options) {
        this._dynamicPrimitivesCollection.removeAll();
        this._dynamicBillboardCollection.removeAll();
        return options;
    }

    _updateDynamicCoordinates(updatedCoordinates) {

        this._dynamicPrimitivesCollection.removeAll();
        this._dynamicBillboardCollection.removeAll();

        switch (this._type) {
        case 'Point':
            if (this._geodesic) {
                const geodesicCoordinatesZero = computeGeodesicCoordinates(updatedCoordinates);
                this._dynamicPrimitivesCollection.add(createPolylinePrimitive({ ...this._style?.wireframe, coordinates: [geodesicCoordinatesZero[0], updatedCoordinates[0]] }));
                this._dynamicBillboardCollection.add({
                    position: geodesicCoordinatesZero[0],
                    image: this._coordinateNodeImage,
                    color: getCesiumColor({
                        ...this._style?.coordinatesNode
                    }),
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                });
            }
            break;
        case 'Circle':
            if (updatedCoordinates.length > 1) {
                const radius = computeDistance(updatedCoordinates, this._geodesic);
                if (this._geodesic) {
                    const geodesicCoordinates = computeGeodesicCoordinates(updatedCoordinates, cartographic => cartographic[cartographic.length - 1]?.height);
                    const geodesicCoordinatesZero = computeGeodesicCoordinates(updatedCoordinates);
                    this._dynamicPrimitivesCollection.add(createEllipsePolylinePrimitive({
                        ...this._style?.wireframe,
                        coordinates: geodesicCoordinates[0],
                        radius,
                        geodesic: true
                    }));
                    this._dynamicPrimitivesCollection.add(createEllipsePolylinePrimitive({
                        ...this._style?.lineDrawing,
                        coordinates: geodesicCoordinatesZero[0],
                        radius,
                        geodesic: true
                    }));
                    this._dynamicBillboardCollection.add({
                        position: updatedCoordinates[0],
                        image: this._coordinateNodeImage,
                        color: getCesiumColor({
                            ...this._style?.coordinatesNode
                        }),
                        disableDepthTestDistance: Number.POSITIVE_INFINITY
                    });
                    this._dynamicBillboardCollection.add({
                        position: geodesicCoordinates[0],
                        image: this._coordinateNodeImage,
                        color: getCesiumColor({
                            ...this._style?.coordinatesNode
                        }),
                        disableDepthTestDistance: Number.POSITIVE_INFINITY
                    });
                    this._dynamicBillboardCollection.add({
                        position: geodesicCoordinatesZero[0],
                        image: this._coordinateNodeImage,
                        color: getCesiumColor({
                            ...this._style?.coordinatesNode
                        }),
                        disableDepthTestDistance: Number.POSITIVE_INFINITY
                    });
                    this._dynamicPrimitivesCollection.add(createPolylinePrimitive({
                        ...this._style?.wireframe,
                        geodesic: true,
                        coordinates: [
                            updatedCoordinates[0],
                            geodesicCoordinatesZero[0],
                            geodesicCoordinatesZero[1],
                            geodesicCoordinates[1],
                            geodesicCoordinates[0]
                        ]
                    }));
                } else {
                    this._dynamicPrimitivesCollection.add(createCylinderPolylinePrimitive({
                        ...this._style?.lineDrawing,
                        coordinates: updatedCoordinates[0],
                        radius
                    }));
                    this._dynamicPrimitivesCollection.add(createPolylinePrimitive({
                        ...this._style?.wireframe,
                        coordinates: [...updatedCoordinates]
                    }));
                }
            }
            break;
        case 'LineString':
            if (updatedCoordinates.length > 1) {
                if (this._geodesic) {
                    const geodesicCoordinates = computeGeodesicCoordinates(updatedCoordinates, cartographic => cartographic[cartographic.length - 1]?.height);
                    const geodesicCoordinatesZero = computeGeodesicCoordinates(updatedCoordinates);
                    this._dynamicPrimitivesCollection.add(createPolylinePrimitive({ ...this._style?.wireframe, geodesic: this._geodesic, coordinates: [...geodesicCoordinates] }));
                    this._dynamicPrimitivesCollection.add(createPolylinePrimitive({ ...this._style?.lineDrawing, geodesic: this._geodesic, coordinates: [...geodesicCoordinatesZero] }));
                    geodesicCoordinates.forEach((coord, idx) => {
                        this._dynamicPrimitivesCollection.add(createPolylinePrimitive({ ...this._style?.wireframe, geodesic: this._geodesic, coordinates: [geodesicCoordinatesZero[idx], geodesicCoordinates[idx]] }));
                    });
                } else {
                    this._dynamicPrimitivesCollection.add(createPolylinePrimitive({ ...this._style?.lineDrawing, coordinates: [...updatedCoordinates] }));
                }
            }
            break;
        case 'Polygon':
            if (updatedCoordinates.length > 1) {
                if (this._geodesic) {
                    const geodesicCoordinates = computeGeodesicCoordinates(updatedCoordinates, cartographic => cartographic[cartographic.length - 1]?.height);
                    const geodesicCoordinatesZero = computeGeodesicCoordinates(updatedCoordinates);
                    this._dynamicPrimitivesCollection.add(createPolygonPrimitive({ ...this._style?.areaDrawing, geodesic: this._geodesic, coordinates: [...geodesicCoordinatesZero, geodesicCoordinatesZero[0]] }));
                    this._dynamicPrimitivesCollection.add(createPolylinePrimitive({ ...this._style?.wireframe, geodesic: this._geodesic, coordinates: [...geodesicCoordinates, geodesicCoordinates[0]] }));
                    this._dynamicPrimitivesCollection.add(createPolylinePrimitive({ ...this._style?.lineDrawing, geodesic: this._geodesic, coordinates: [...geodesicCoordinatesZero, geodesicCoordinatesZero[0]] }));
                    geodesicCoordinates.forEach((coord, idx) => {
                        this._dynamicPrimitivesCollection.add(createPolylinePrimitive({ ...this._style?.wireframe, geodesic: this._geodesic, coordinates: [geodesicCoordinatesZero[idx], geodesicCoordinates[idx]] }));
                    });
                } else {
                    this._dynamicPrimitivesCollection.add(createPolygonPrimitive({ ...this._style?.areaDrawing, coordinates: [...updatedCoordinates] }));
                    this._dynamicPrimitivesCollection.add(createPolylinePrimitive({ ...this._style?.lineDrawing, coordinates: [...updatedCoordinates] }));
                }
            }
            break;
        default:
            break;
        }
        if (updatedCoordinates.length > 0) {
            this._dynamicBillboardCollection.add({
                position: updatedCoordinates[updatedCoordinates.length - 1],
                image: this._cursorImage,
                color: getCesiumColor({
                    ...this._style?.cursor
                }),
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            });
        }
        this._map.scene.requestRender();
    }
}

export default CesiumDrawGeometryInteraction;
