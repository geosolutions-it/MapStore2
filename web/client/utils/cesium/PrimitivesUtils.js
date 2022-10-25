/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Cesium from 'cesium';
import chroma from 'chroma-js';
import uniqBy from 'lodash/uniqBy';

/**
 * return a cesium color
 * @param {object} options
 * @param {string} options.color a color css string (eg. #ff0000)
 * @param {number} options.opacity a number between 0 and 1 where 1 is fully opaque
 */
export const getCesiumColor = ({ color, opacity }) => {
    const [r, g, b, a] = chroma(color).gl();
    if (opacity !== undefined) {
        return new Cesium.Color(r, g, b, opacity);
    }
    return new Cesium.Color(r, g, b, a);
};

/**
 * create a polyline primitive
 */
export const createPolylinePrimitive = ({
    coordinates,
    width = 4,
    color = '#ff00ff',
    opacity = 1.0,
    depthFailColor,
    depthFailOpacity,
    dashLength,
    clampToGround
}) => {
    return new Cesium[clampToGround ? 'GroundPolylinePrimitive' : 'Primitive']({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: clampToGround
                ? new Cesium.GroundPolylineGeometry({
                    positions: [...coordinates],
                    width
                })
                : new Cesium.PolylineGeometry({
                    positions: [...coordinates],
                    width,
                    arcType: Cesium.ArcType.NONE
                })
        }),
        appearance: new Cesium.PolylineMaterialAppearance({
            material: !dashLength
                ? Cesium.Material.fromType('Color', {
                    color: getCesiumColor({
                        color: color,
                        opacity
                    })
                })
                : Cesium.Material.fromType('PolylineDash', {
                    color: getCesiumColor({
                        color: color,
                        opacity
                    }),
                    dashLength
                })
        }),
        ...(depthFailColor && {
            depthFailAppearance: new Cesium.PolylineMaterialAppearance({
                material: !dashLength
                    ? Cesium.Material.fromType('Color', {
                        color: getCesiumColor({
                            color: depthFailColor,
                            opacity: depthFailOpacity
                        })
                    })
                    : Cesium.Material.fromType('PolylineDash', {
                        color: getCesiumColor({
                            color: depthFailColor,
                            opacity: depthFailOpacity
                        }),
                        dashLength
                    })
            })
        }),
        allowPicking: false,
        asynchronous: false
    });
};

/**
 * create a polygon primitive
 */
export const createPolygonPrimitive = ({
    coordinates,
    color = '#ff00ffAA',
    opacity = 1.0,
    depthFailColor,
    depthFailOpacity
}) => {
    return new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.PolygonGeometry({
                polygonHierarchy: new Cesium.PolygonHierarchy([...coordinates]),
                perPositionHeight: true
            })
        }),
        appearance: new Cesium.MaterialAppearance({
            material: Cesium.Material.fromType('Color', {
                color: getCesiumColor({
                    color,
                    opacity
                })
            }),
            faceForward: true
        }),
        ...(depthFailColor && {
            depthFailAppearance: new Cesium.MaterialAppearance({
                material: Cesium.Material.fromType('Color', {
                    color: getCesiumColor({
                        color: depthFailColor,
                        opacity: depthFailOpacity
                    })
                }),
                faceForward: true
            })
        }),
        allowPicking: false,
        asynchronous: false
    });
};

export const clearPrimitivesCollection = (map, primitivesCollection) => {
    if (map?.scene?.primitives && primitivesCollection && !primitivesCollection.isDestroyed()) {
        primitivesCollection.removeAll();
        // remove destroys the primitive collection so we don't need to explicitly use primitivesCollection.destroy()
        map.scene.primitives.remove(primitivesCollection);
    }
};

/**
 * return a canvas with a circle drawn on it that can be used as billboard image
 * @param {object} size size of the canvas
 * @param {object} options
 * @param {string} options.fill color css string (eg. #ff0000)
 * @param {string} options.stroke color css string (eg. #ff0000)
 * @param {number} options.strokeWidth width of the stroke in pixel
 */
export const createCircleMarkerImage = (size, { stroke, strokeWidth = 1, fill = '#ffffff' } = {}) => {
    const fullSize = stroke ? size + strokeWidth * 2 : size;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', fullSize);
    canvas.setAttribute('height', fullSize);
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    if (fill) { ctx.fillStyle = '#ffffff'; }
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth;
    }
    ctx.arc(fullSize / 2, fullSize / 2, size / 2, 0, 2 * Math.PI);
    if (fill) { ctx.fill(); }
    if (stroke) { ctx.stroke(); }
    return canvas;
};

const clockwiseCoordinates = (coordinates) => {
    return import('@turf/boolean-clockwise')
        .then((mod) => {
            const turfClockwise = mod.default;
            const isClockwise = turfClockwise({ type: 'Feature', geometry: { type: 'LineString', coordinates }, properties: {} });
            if (isClockwise) {
                return coordinates;
            }
            return [...coordinates].reverse();
        });
};

/**
 * convert a polygon feature to clipping planes
 * @param {object} feature a GeoJSON polygon feature
 * @param {boolean} union if true the clip will show the outside of the feature
 * @param {boolean} clipOriginalGeometry use the original geometry without conversion to convex geometry
 */
export const polygonToClippingPlanes = (feature, union, clipOriginalGeometry) => {
    return import('@turf/convex')
        .then((mod) => {
            const turfConvex = mod.default;
            const hull = clipOriginalGeometry ? feature : turfConvex(feature);
            const { geometry } = hull;
            return clockwiseCoordinates([...(geometry?.coordinates?.[0] || [])])
                .then((coordinates) => {
                    const outerRingCoordinates = uniqBy(union ? coordinates : coordinates.reverse(), (coords) => `${coords[0]}${coords[1]}`);
                    const points = outerRingCoordinates.map(([lng, lat, height = 0]) => {
                        const point = Cesium.Cartesian3.fromDegrees(lng, lat, height);
                        return point;
                    });

                    const pointsLength = points.length;

                    // Create center points for each clipping plane
                    const clippingPlanes = [];

                    for (let i = 0; i < pointsLength; ++i) {
                        const nextIndex = (i + 1) % pointsLength;
                        let midpoint = Cesium.Cartesian3.add(points[i], points[nextIndex], new Cesium.Cartesian3());
                        midpoint = Cesium.Cartesian3.multiplyByScalar(midpoint, 0.5, midpoint);
                        const up = Cesium.Cartesian3.normalize(midpoint, new Cesium.Cartesian3());

                        let right = Cesium.Cartesian3.subtract(points[nextIndex], midpoint, new Cesium.Cartesian3());
                        right = Cesium.Cartesian3.normalize(right, right);

                        let normal = Cesium.Cartesian3.cross(right, up, new Cesium.Cartesian3());
                        normal = Cesium.Cartesian3.normalize(normal, normal);
                        // Compute distance by pretending the plane is at the origin
                        const originCenteredPlane = new Cesium.Plane(normal, 0.0);
                        const distance = Cesium.Plane.getPointDistance(originCenteredPlane, midpoint);
                        clippingPlanes.push(new Cesium.ClippingPlane(normal, distance));
                    }
                    return clippingPlanes;
                });
        });
};
