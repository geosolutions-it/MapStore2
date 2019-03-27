/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Cesium = require('../../libs/cesium');
const getCartesian = function(viewer, event) {
    if (event.position !== null) {
        const scene = viewer.scene;
        const ellipsoid = scene._globe.ellipsoid;
        const cartesian = scene._camera.pickEllipsoid(event.position || event.endPosition, ellipsoid);
        return cartesian;
    }
    return null;
};
const getMouseXYZ = (viewer, event) => {
    var scene = viewer.scene;
    const mousePosition = event.position || event.endPosition;
    if (!mousePosition) {
        return null;
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

const getMouseTile = (viewer, event) => {
    const scene = viewer.scene;
    if (!event.position) {
        return null;
    }
    const ray = viewer.camera.getPickRay(event.position);
    return viewer.scene.globe.pickTile(ray, scene);
};

module.exports = {
    getMouseXYZ,
    getMouseTile
};
