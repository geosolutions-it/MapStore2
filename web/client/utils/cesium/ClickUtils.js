/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Cesium from 'cesium';

export const getCartesian = function(viewer, event) {
    if (event.position !== null) {
        const scene = viewer.scene;
        const ellipsoid = scene._globe.ellipsoid;
        const cartesian = scene.camera.pickEllipsoid(event.position || event.endPosition, ellipsoid);
        return cartesian;
    }
    return null;
};
export const getMouseXYZ = (viewer, event) => {
    const scene = viewer.scene;
    const mousePosition = event.position || event.endPosition;
    if (!mousePosition) {
        return null;
    }

    const feature = viewer.scene.drillPick(mousePosition).find((aFeature) => {
        return !(aFeature?.id?.entityCollection?.owner?.queryable === false);
    });
    if (feature) {
        let currentDepthTestAgainstTerrain = scene.globe.depthTestAgainstTerrain;
        let currentPickTranslucentDepth = scene.pickTranslucentDepth;
        scene.globe.depthTestAgainstTerrain = true;
        scene.pickTranslucentDepth = true;
        const depthCartesian = scene.pickPosition(mousePosition);
        scene.globe.depthTestAgainstTerrain = currentDepthTestAgainstTerrain;
        scene.pickTranslucentDepth = currentPickTranslucentDepth;
        if (depthCartesian) {
            return Cesium.Cartographic.fromCartesian(depthCartesian);
        }
    }

    const ray = viewer.camera.getPickRay(mousePosition);
    const position = viewer.scene.globe.pick(ray, viewer.scene);
    const ellipsoid = scene._globe.ellipsoid;
    if (Cesium.defined(position)) {
        const cartographic = ellipsoid.cartesianToCartographic(position);
        // const height = cartographic.height;
        const cartesian = getCartesian(viewer, event);
        if (cartesian) {
            cartographic.height = scene._globe.getHeight(cartographic);
            cartographic.cartesian = cartesian;
            cartographic.position = position;
        }
        return cartographic;
    }
    return null;
};

export const getMouseTile = (viewer, event) => {
    const scene = viewer.scene;
    if (!event.position) {
        return null;
    }
    const ray = viewer.camera.getPickRay(event.position);
    return viewer.scene.globe.pickTile(ray, scene);
};

export default {
    getMouseXYZ,
    getMouseTile
};
