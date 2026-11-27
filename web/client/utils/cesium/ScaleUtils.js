/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import * as Cesium from 'cesium';
import { getResolutions, getScale, DEFAULT_SCREEN_DPI } from '../MapUtils';

/**
 * Checks if the camera is looking perpendicular (nadir) to the surface
 * @param {Cesium.Camera} camera - The Cesium camera
 * @param {Cesium.Cartesian3} position - Position on the globe (Cartesian3)
 * @param {Cesium.Ellipsoid} ellipsoid - The ellipsoid (usually scene.globe.ellipsoid)
 * @param {number} threshold - Cosine threshold (0.95 = ~18°, 0.99 = ~8°)
 * @returns {boolean} True if camera is approximately perpendicular
 */
export function isCameraPerpendicularToSurface(camera, position, ellipsoid, threshold = 0.95) {
    const surfaceNormal = ellipsoid.geodeticSurfaceNormal(position);
    const cameraDirection = camera.direction;

    // Dot product: -1 = exactly opposite (straight down), 0 = parallel to surface
    const dot = Cesium.Cartesian3.dot(cameraDirection, surfaceNormal);

    // Check if dot product is close to -1 (camera looking straight down)
    return dot < -threshold;
}

/**
 * Calculates the map scale denominator at the center of the Cesium viewer's screen.
 *
 * @param {Cesium.Viewer} viewer - The Cesium Viewer instance containing the scene and camera.
 * @returns {number} The map scale denominator (M in 1:M) at the screen center.
 *                   Returns a fallback scale based on camera height if the camera
 *                   is looking at space or the globe intersection fails.
 **/
export function getMapScaleForCesium(viewer) {
    const FALLBACK_EARTH_CIRCUMFERENCE_METERS = 80000000;
    const cesiumDefaultProj = "EPSG:3857";
    const scene = viewer.scene;
    const camera = scene.camera;
    const canvas = scene.canvas;
    const ellipsoid = scene.globe.ellipsoid;
    // 1. Get two points at the center of the screen, 1 pixel apart horizontally
    const centerX = Math.floor(canvas.clientWidth / 2);
    const centerY = Math.floor(canvas.clientHeight / 2);

    const leftPoint = new Cesium.Cartesian2(centerX, centerY);
    const rightPoint = new Cesium.Cartesian2(centerX + 1, centerY);

    // 2. Convert screen pixels to Globe positions (Cartesian3)
    const leftRay = camera.getPickRay(leftPoint);
    const rightRay = camera.getPickRay(rightPoint);

    const leftPos = scene.globe.pick(leftRay, scene);
    const rightPos = scene.globe.pick(rightRay, scene);

    // Check if camera is perpendicular (only if we have a valid position to test against)
    const isPerpendicular = Cesium.defined(leftPos) ? isCameraPerpendicularToSurface(camera, leftPos, ellipsoid, 0.95) : false;

    if (!Cesium.defined(leftPos) || !Cesium.defined(rightPos) || isPerpendicular) {
        console.warn('Camera is looking at space/sky or is perpendicular');
        const cameraPosition = camera.positionCartographic;
        const currentZoom = Math.log2(FALLBACK_EARTH_CIRCUMFERENCE_METERS / (cameraPosition.height)) + 1;
        const resolutions = getResolutions();
        const resolution = resolutions[Math.round(currentZoom)];
        const scaleVal = getScale(cesiumDefaultProj, DEFAULT_SCREEN_DPI, resolution);
        return Math.round(scaleVal ?? 0);
    }

    const leftCartographic = scene.globe.ellipsoid.cartesianToCartographic(leftPos);
    const rightCartographic = scene.globe.ellipsoid.cartesianToCartographic(rightPos);

    const geodesic = new Cesium.EllipsoidGeodesic(leftCartographic, rightCartographic);
    const resolution = geodesic.surfaceDistance; // This is meters per 1 pixel [resolution]
    const scaleValue = getScale(cesiumDefaultProj, DEFAULT_SCREEN_DPI, resolution);
    return Math.round(scaleValue ?? 0);
}
