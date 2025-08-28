/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Cesium from 'cesium';
import chroma from 'chroma-js';
import EllipseGeometryLibrary from '@cesium/engine/Source/Core/EllipseGeometryLibrary';
import CylinderGeometryLibrary from '@cesium/engine/Source/Core/CylinderGeometryLibrary';

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
    clampToGround,
    allowPicking = false,
    geodesic,
    id,
    modelMatrix
}) => {
    return new Cesium[clampToGround ? 'GroundPolylinePrimitive' : 'Primitive']({
        geometryInstances: new Cesium.GeometryInstance({
            id,
            geometry: clampToGround
                ? new Cesium.GroundPolylineGeometry({
                    positions: [...coordinates],
                    width
                })
                : new Cesium.PolylineGeometry({
                    positions: [...coordinates],
                    width,
                    arcType: geodesic ? Cesium.ArcType.GEODESIC : Cesium.ArcType.NONE
                }),
            modelMatrix
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
        allowPicking,
        asynchronous: false
    });
};

/**
 * create a polygon primitive
 */
export const createPolygonPrimitive = ({
    id,
    coordinates,
    color = '#ff00ffAA',
    opacity = 1.0,
    depthFailColor,
    depthFailOpacity,
    allowPicking = false,
    geodesic
}) => {
    return new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
            id,
            geometry: new Cesium.PolygonGeometry({
                polygonHierarchy: new Cesium.PolygonHierarchy([...coordinates]),
                perPositionHeight: !geodesic
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
        allowPicking,
        asynchronous: false
    });
};

/**
 * create an ellipse polyline primitive
 */
export const createEllipsePolylinePrimitive = ({
    width = 4,
    coordinates,
    color = '#ff00ff',
    opacity = 1.0,
    depthFailColor,
    depthFailOpacity,
    dashLength,
    clampToGround,
    allowPicking = false,
    id,
    radius,
    semiMajorAxis,
    semiMinorAxis,
    geodesic
}) => {
    const { outerPositions } = EllipseGeometryLibrary.computeEllipsePositions({
        granularity: 0.02,
        semiMajorAxis: radius || semiMajorAxis,
        semiMinorAxis: radius || semiMinorAxis,
        rotation: 0,
        center: coordinates
    }, false, true);
    const ellipseCoordinates = Cesium.Cartesian3.unpackArray(outerPositions);
    return createPolylinePrimitive({
        coordinates: [...ellipseCoordinates, ellipseCoordinates[0]],
        width,
        color,
        opacity,
        depthFailColor,
        depthFailOpacity,
        dashLength,
        clampToGround,
        allowPicking,
        id,
        geodesic
    });
};

/**
 * create an ellipse primitive
 */
export const createEllipsePrimitive = ({
    id,
    coordinates,
    color = '#ff00ffAA',
    opacity = 1.0,
    depthFailColor,
    depthFailOpacity,
    allowPicking = false,
    clampToGround,
    radius,
    semiMajorAxis,
    semiMinorAxis
}) => {
    return new Cesium[clampToGround ? 'GroundPrimitive' : 'Primitive']({
        geometryInstances: new Cesium.GeometryInstance({
            id,
            geometry: new Cesium.EllipseGeometry({
                center: coordinates,
                semiMajorAxis: radius || semiMajorAxis,
                semiMinorAxis: radius || semiMinorAxis
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
        allowPicking,
        asynchronous: false
    });
};

/**
 * create a cylinder primitive
 */
export const createCylinderPrimitive = ({
    id,
    coordinates,
    color = '#ff00ffAA',
    opacity = 1.0,
    depthFailColor,
    depthFailOpacity,
    allowPicking = false,
    length,
    radius,
    topRadius,
    bottomRadius
}) => {
    return new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
            id,
            geometry: new Cesium.CylinderGeometry({
                length: length ?? 0.1,
                topRadius: topRadius ?? radius,
                bottomRadius: bottomRadius ?? radius
            }),
            modelMatrix: Cesium.Matrix4.multiplyByTranslation(
                Cesium.Transforms.eastNorthUpToFixedFrame(
                    coordinates
                ),
                new Cesium.Cartesian3(0, 0, 0),
                new Cesium.Matrix4()
            )
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
        allowPicking,
        asynchronous: false
    });
};

/**
 * create a cylinder polyline primitive
 */
export const createCylinderPolylinePrimitive = ({
    id,
    coordinates,
    color = '#ff00ffAA',
    opacity = 1.0,
    depthFailColor,
    depthFailOpacity,
    allowPicking = false,
    length,
    radius,
    dashLength,
    clampToGround,
    geodesic,
    width,
    slices = 128,
    topRadius,
    bottomRadius
}) => {
    const modelMatrix = Cesium.Matrix4.multiplyByTranslation(
        Cesium.Transforms.eastNorthUpToFixedFrame(
            coordinates
        ),
        new Cesium.Cartesian3(0, 0, 0),
        new Cesium.Matrix4()
    );
    const positions = CylinderGeometryLibrary.computePositions(
        length ?? 0.0,
        topRadius ?? radius,
        bottomRadius ?? radius,
        slices,
        false
    );
    const cylinderGeometryCoordinates = Cesium.Cartesian3.unpackArray(positions);
    return createPolylinePrimitive({
        coordinates: !length
            ? [...cylinderGeometryCoordinates.splice(0, Math.ceil(cylinderGeometryCoordinates.length / 2)), cylinderGeometryCoordinates[0]]
            : cylinderGeometryCoordinates,
        width,
        color,
        opacity,
        depthFailColor,
        depthFailOpacity,
        dashLength,
        clampToGround,
        allowPicking,
        id,
        geodesic,
        modelMatrix
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
    if (fill) { ctx.fillStyle = fill; }
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth;
    }
    ctx.arc(fullSize / 2, fullSize / 2, size / 2, 0, 2 * Math.PI);
    if (fill) { ctx.fill(); }
    if (stroke) { ctx.stroke(); }
    return canvas;
};


/**
 * Creates a collection of Cesium ClippingPolygon objects from a GeoJSON polygon
 * @param {Object} clippingPolygon - GeoJSON polygon object
 * @returns {Array} - Array of Cesium.ClippingPolygon objects
 */
export const createClippingPolygonsFromGeoJSON = (clippingPolygon) => {
    const polygons = [];
    const coordinates = clippingPolygon?.geometry?.coordinates?.[0] || [];
    if (coordinates.length > 0) {
        const positions = coordinates.map((coord) => {
            const [lng, lat, height = 0] = coord;
            return Cesium.Cartesian3.fromDegrees(lng, lat, height);
        });
        const clippedPolygon = new Cesium.ClippingPolygon({
            positions: positions
        });
        polygons.push(clippedPolygon);
    }

    return polygons;
};

/**
 * Applies clipping polygons to a Cesium object (globe or tileset)
 * @param {Object} options - Configuration options
 * @param {Object} options.target - The target object to apply clipping to (globe or tileset)
 * @param {Array} options.polygons - Array of Cesium.ClippingPolygon objects
 * @param {Boolean} options.inverse - Whether to inverse the clipping (clip outside instead of inside)
 * @param {Object} options.scene - Cesium scene object for rendering
 * @param {Object} [options.additionalProperties] - Additional properties to set on the target (optional)
 */
export const applyClippingPolygons = ({ target, polygons, inverse, scene, additionalProperties = {} }) => {
    if (!target || !polygons || !Array.isArray(polygons)) {
        return;
    }
    if (polygons.length && !target.clippingPolygons) {
        target.clippingPolygons = new Cesium.ClippingPolygonCollection({
            polygons: polygons,
            enabled: true,
            inverse: !!inverse
        });
    }
    if (target.clippingPolygons) {
        target.clippingPolygons.removeAll();
        polygons.forEach((polygon) => {
            target.clippingPolygons.add(polygon);
        });
        target.clippingPolygons.inverse = !!inverse;
        Object.entries(additionalProperties).forEach(([key, value]) => {
            target[key] = value;
        });
        if (scene) {
            scene.requestRender();
        }
    }
};
