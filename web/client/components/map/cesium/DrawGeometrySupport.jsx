/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useRef, useEffect } from 'react';
import * as Cesium from 'cesium';
import earcut from 'earcut';
import throttle from 'lodash/throttle';

function computePositionInfo(map, movement, {
    pickObjectsLimit = Number.MAX_VALUE
} = {}) {

    const scene = map.scene;
    const camera = map.camera;
    const position = movement.position || movement.endPosition;

    const feature = scene.pick(position);
    const depthCartesian = scene.pickPosition(position);

    if (!!(feature && depthCartesian)) {
        return {
            cartesian: depthCartesian,
            cartographic: Cesium.Cartographic.fromCartesian(depthCartesian),
            feature
        };
    }

    const ray = camera.getPickRay(position);

    const drillPickFeature = scene.drillPickFromRay(ray, pickObjectsLimit)
        .find(({ exclude, object, position: rayIntersectionPosition }) =>
            !exclude && rayIntersectionPosition && object) || null;

    if (drillPickFeature) {
        return {
            cartesian: drillPickFeature.position,
            cartographic: Cesium.Cartographic.fromCartesian(drillPickFeature.position),
            feature: drillPickFeature?.object?.primitive
        };
    }

    const globeCartesian = scene.globe.pick(ray, scene);

    if (globeCartesian) {
        const cartographic =  Cesium.Cartographic.fromCartesian(globeCartesian);
        return {
            cartesian: globeCartesian,
            cartographic
        };
    }

    return {};
}

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

// from https://groups.google.com/g/cesium-dev/c/q6N5MmykVPU
function computeArea(positions, holes) {

    if (positions?.length < 3) {
        return 0;
    }

    // "indices" here defines an array, elements of which defines the indice of a vector
    // defining one corner of a triangle. Add up the areas of those triangles to get
    // an approximate area for the polygon
    const flattenedPositions = Cesium.Cartesian2.packArray(positions);
    // see triangulate function at cesium/Source/Core/PolygonPipeline
    const indices = earcut(flattenedPositions, holes, 2);
    let area = 0; // In square kilometers

    for (let i = 0; i < indices.length; i += 3) {
        const vector1 = positions[indices[i]];
        const vector2 = positions[indices[i + 1]];
        const vector3 = positions[indices[i + 2]];

        // These vectors define the sides of a parallelogram (double the size of the triangle)
        const vectorC = Cesium.Cartesian3.subtract(vector2, vector1, new Cesium.Cartesian3());
        const vectorD = Cesium.Cartesian3.subtract(vector3, vector1, new Cesium.Cartesian3());

        // Area of parallelogram is the cross product of the vectors defining its sides
        const areaVector = Cesium.Cartesian3.cross(vectorC, vectorD, new Cesium.Cartesian3());

        // Area of the triangle is just half the area of the parallelogram, add it to the sum.
        area += Cesium.Cartesian3.magnitude(areaVector) / 2.0;
    }
    return area;

}

function computeDistance(positions) {
    if (positions?.length < 2) {
        return 0;
    }
    return positions.reduce((sum, cartesian, idx) =>
        positions[idx - 1]
            ? sum + Cesium.Cartesian3.distance(cartesian, positions[idx - 1])
            : sum, 0);
}

function computeHeightSign(cartesianArray) {
    return Math.sign(
        Cesium.Cartographic.fromCartesian(cartesianArray[1]).height -
        Cesium.Cartographic.fromCartesian(cartesianArray[0]).height
    );
}

function cartesianToCartographicArray(cartesian) {
    const { longitude, latitude, height } = Cesium.Cartographic.fromCartesian(cartesian);
    return [ Cesium.Math.toDegrees(longitude), Cesium.Math.toDegrees(latitude), height ];
}

function cesiumCoordinatesToGeoJSONFeature(geometryType, coordinates, {
    area,
    areaUom,
    length,
    lengthUom,
    height,
    heightUom,
    terrainCoordinates
}) {
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
                : {},
            geometry: {
                type: 'Point',
                coordinates: cartesianToCartographicArray(coordinates[coordinates.length - 1])
            }
        };
    case 'LineString':
        return {
            type: 'Feature',
            properties: { length, lengthUom },
            geometry: {
                type: 'LineString',
                coordinates: coordinates.map((cartesian) => cartesianToCartographicArray(cartesian))
            }
        };
    case 'Polygon':
        return {
            type: 'Feature',
            properties: { area, areaUom, length, lengthUom },
            geometry: {
                type: 'Polygon',
                coordinates: [
                    coordinates.map((cartesian) => cartesianToCartographicArray(cartesian))
                ]
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

        const readyPromise = terrainProvider.ready
            ? Promise.resolve(true)
            : terrainProvider.readyPromise;

        readyPromise.then(() => {
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
    });
}

/**
 * Support for 3D drawing, this component provides only the interactions and callback for a drawing workflow
 * @name DrawGeometrySupport
 * @prop {object} map instance of the current map library in use
 * @prop {boolean} active activate the drawing functionalities
 * @prop {string} geometryType type of geometry to draw: Point, LineString or Polygon
 * @prop {function} onDrawStart callback triggered at drawing start
 * @prop {function} onDrawing callback triggered at every click/pointerdown events
 * @prop {function} onMouseMove callback triggered at every mouse move events
 * @prop {function} onDrawEnd callback triggered at drawing end with double click event or single click if coordinatesLength is defined
 * @prop {function} getObjectsToExcludeOnPick function that return all the primitive collection to be excluded while picking the coordinates, it is useful to exclude the current drawn geometries
 * @prop {number} mouseMoveThrottleTime throttle value to limit the mousemove event callback and improve the interaction, default 100ms
 * @prop {boolean} depthTestAgainstTerrain force depth against terrain while picking the coordinates
 * @prop {boolean} sampleTerrain enable sample terrain functionality only for Point geometry type
 * @prop {number} coordinatesLength number of coordinates expected by a LineString or Polygon geometry, onDrawEnd will be called after the last coordinates added with single click interaction
 * @prop {function} getPositionInfo override the default getPositionInfo function, mainly used for testing
 */
function DrawGeometrySupport({
    map,
    active,
    geometryType = 'LineString',
    onDrawStart = () => { },
    onDrawing = () => { },
    onMouseMove = () => { },
    onDrawEnd = () => { },
    onInit = () => { },
    onDestroy = () => { },
    getObjectsToExcludeOnPick,
    mouseMoveThrottleTime = 100,
    depthTestAgainstTerrain,
    sampleTerrain,
    coordinatesLength,
    getPositionInfo =  defaultGetPositionInfo
}) {

    const handler = useRef();
    const drawing = useRef(false);
    const forcedDrawEnd = useRef(false);
    const coordinates = useRef([]);

    function handleDrawEnd(movement, isDoubleClick) {
        if (drawing.current) {
            const { cartesian } = getPositionInfo(map, movement, {
                getObjectsToExcludeOnPick,
                depthTestAgainstTerrain
            });

            if (isDoubleClick) {
                // remove last two elements added with the double click event
                coordinates.current.splice(coordinates.current.length - 2, 2);
            }

            coordinates.current.push(cartesian);

            if (!validateDrawnGeometry(geometryType, [...coordinates.current], coordinatesLength)) {
                onDrawEnd({});
                coordinates.current = [];
                drawing.current = false;
                return null;
            }

            const currentCoordinates = geometryType === 'Polygon'
                ? [...coordinates.current, coordinates.current[0]]
                : [...coordinates.current];
            const area = computeArea(currentCoordinates);
            const distance = computeDistance(currentCoordinates);

            onDrawEnd({
                area,
                distance,
                coordinates: currentCoordinates,
                feature: cesiumCoordinatesToGeoJSONFeature(geometryType, currentCoordinates, {
                    area,
                    areaUom: 'sqm',
                    length: distance,
                    lengthUom: 'm'
                })
            });
            coordinates.current = [];
            drawing.current = false;
        }
        return null;
    }

    function handleDrawing(movement) {
        if (drawing.current) {
            if ((coordinates.current.length + 1) === coordinatesLength) {
                forcedDrawEnd.current = true;
                return handleDrawEnd(movement);
            }
            const { cartesian } = getPositionInfo(map, movement, {
                getObjectsToExcludeOnPick,
                depthTestAgainstTerrain
            });
            if (cartesian) {
                const previousCartesian = coordinates.current[coordinates.current.length - 1];
                coordinates.current.push(cartesian);
                const currentCoordinates = [...coordinates.current];
                const area = computeArea(currentCoordinates);
                const distance = computeDistance(currentCoordinates);
                onDrawing({
                    area,
                    distance,
                    previousCartesian,
                    cartesian,
                    coordinates: [...coordinates.current]
                });
            }
        }
        return null;
    }

    function handleDrawStart(movement) {
        if (!drawing.current && !forcedDrawEnd.current) {
            const initialCoordinates = [...coordinates.current];
            coordinates.current = [];
            const { cartesian } = getPositionInfo(map, movement, {
                getObjectsToExcludeOnPick,
                depthTestAgainstTerrain
            });
            if (cartesian) {
                coordinates.current.push(cartesian);
                if (geometryType === 'Point') {

                    const requestSampleTerrain = sampleTerrain && initialCoordinates.length !== 2
                        ? () => getSampledTerrainPositions(
                            map?.terrainProvider,
                            map?.terrainProvider?.sampleTerrainZoomLevel ?? 18,
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
                            onDrawStart({
                                cartesian: currentCoordinates[currentCoordinates.length - 1],
                                coordinates: currentCoordinates
                            });
                            onDrawEnd({
                                coordinates: currentCoordinates,
                                feature: sampleTerrain && currentCoordinates.length === 2
                                    ? cesiumCoordinatesToGeoJSONFeature(geometryType, currentCoordinates, {
                                        height: computeHeightSign(currentCoordinates) * computeDistance(currentCoordinates),
                                        heightUom: 'm',
                                        terrainCoordinates: cartesianToCartographicArray(currentCoordinates[0])
                                    })
                                    : cesiumCoordinatesToGeoJSONFeature(geometryType, currentCoordinates, {})
                            });
                        });
                    coordinates.current = [];
                } else {
                    onDrawStart({
                        cartesian,
                        coordinates: [...coordinates.current]
                    });
                    drawing.current = true;
                }
            }
        }
        if (forcedDrawEnd.current) {
            forcedDrawEnd.current = false;
        }
    }

    function handleMouseMove(movement) {
        if (active) {
            const { cartesian } = getPositionInfo(map, movement, {
                getObjectsToExcludeOnPick,
                depthTestAgainstTerrain
            });
            if (cartesian) {
                if (geometryType === 'Point' && sampleTerrain) {
                    getSampledTerrainPositions(
                        map?.terrainProvider,
                        map?.terrainProvider?.sampleTerrainZoomLevel ?? 18,
                        [cartesian]
                    )
                        .then((updatedPositions) => {
                            let distance;
                            if (updatedPositions) {
                                const [updatedPosition] = updatedPositions;
                                const cartesianTerrain = Cesium.Cartographic.toCartesian(updatedPosition);
                                const heightCoordinates = [cartesianTerrain, cartesian];
                                distance = computeHeightSign(heightCoordinates) * computeDistance(heightCoordinates);
                                coordinates.current = heightCoordinates;
                            } else {
                                coordinates.current = [cartesian];
                            }
                            onMouseMove({
                                distance,
                                cartesian,
                                coordinates: [...coordinates.current]
                            });
                        });
                } else {
                    const previousCartesian = coordinates.current[coordinates.current.length - 1];
                    const currentCoordinates = [...coordinates.current, cartesian];
                    const area = computeArea(currentCoordinates);
                    const distance = computeDistance(currentCoordinates);
                    onMouseMove({
                        area,
                        distance,
                        previousCartesian,
                        cartesian,
                        coordinates: currentCoordinates
                    });
                }
            }
        }
    }

    useEffect(() => {
        if (map?.canvas && active) {
            onInit();
            handler.current = new Cesium.ScreenSpaceEventHandler(map.canvas);
            handler.current.setInputAction((movement) => {
                handleDrawEnd(movement, true);
            }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            handler.current.setInputAction((movement) => {
                handleDrawing(movement);
                handleDrawStart(movement);
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            handler.current.setInputAction(throttle((movement) => {
                handleMouseMove(movement);
            }, mouseMoveThrottleTime), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        }
        return () => {
            onDestroy({
                coordinates: [...coordinates.current]
            });
            if (handler.current) {
                handler.current.destroy();
                handler.current = null;
            }
            coordinates.current = [];
            drawing.current = false;
        };
    }, [map, active, geometryType, mouseMoveThrottleTime, sampleTerrain, coordinatesLength]);

    return null;
}

export default DrawGeometrySupport;
