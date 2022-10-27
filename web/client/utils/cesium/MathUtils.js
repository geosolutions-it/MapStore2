/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import * as Cesium from 'cesium';

// return the cartesian middle point given two cartesian
export function computeMiddlePoint(aCartesian, bCartesian) {
    const diff = Cesium.Cartesian3.subtract(bCartesian, aCartesian, new Cesium.Cartesian3());
    const halfDiff = Cesium.Cartesian3.multiplyByScalar(diff, 0.5, new Cesium.Cartesian3());
    return Cesium.Cartesian3.add(aCartesian, halfDiff, new Cesium.Cartesian3());
}

// return the angle in degrees given two cartesian
export function computeAngle(aCartesian, bCartesian) {
    const aNormalized = Cesium.Cartesian3.normalize(aCartesian, new Cesium.Cartesian3());
    const bNormalized = Cesium.Cartesian3.normalize(bCartesian, new Cesium.Cartesian3());
    const dot = Cesium.Cartesian3.dot(aNormalized, bNormalized);
    return Cesium.Math.toDegrees(Math.acos(dot));
}

// return the cartesian normal in degrees given two cartesian
export function computeNormal(aCartesian, bCartesian) {
    const aNormalized = Cesium.Cartesian3.normalize(aCartesian, new Cesium.Cartesian3());
    const bNormalized = Cesium.Cartesian3.normalize(bCartesian, new Cesium.Cartesian3());
    return Cesium.Cartesian3.cross(aNormalized, bNormalized, new Cesium.Cartesian3());
}

// return an array of join angles of a polyline
// given an array of cartesian coordinates, minimum three coordinates
export function computeAngles(coordinates) {
    return coordinates.map((bCartesian, idx) => {
        const aCartesian = coordinates[idx - 1];
        const cCartesian = coordinates[idx + 1];
        if (aCartesian && cCartesian) {
            return computeAngle(
                Cesium.Cartesian3.subtract(aCartesian, bCartesian, new Cesium.Cartesian3()),
                Cesium.Cartesian3.subtract(cCartesian, bCartesian, new Cesium.Cartesian3())
            );
        }
        return null;
    }).filter(angle => angle !== null);
}

// return the cartesian middle point given an array of three cartesian coordinates representing a triangle
export function computeTriangleMiddlePoint(coordinates) {
    return new Cesium.Cartesian3(
        (coordinates[0].x + coordinates[1].x + coordinates[2].x) / 3,
        (coordinates[0].y + coordinates[1].y + coordinates[2].y) / 3,
        (coordinates[0].z + coordinates[1].z + coordinates[2].z) / 3
    );
}

// return an array of slopes given an array of cartesian coordinates and the camera position, minimum three coordinates
export function computeSlopes(coordinates, cameraPosition) {
    return coordinates.map((bCartesian, idx) => {
        const aCartesian = coordinates[idx - 1];
        const cCartesian = coordinates[idx + 1];
        if (aCartesian && cCartesian) {

            const normal = computeNormal(
                Cesium.Cartesian3.subtract(aCartesian, bCartesian, new Cesium.Cartesian3()),
                Cesium.Cartesian3.subtract(cCartesian, bCartesian, new Cesium.Cartesian3())
            );

            const w = -Math.sign(Cesium.Cartesian3.dot(
                normal,
                Cesium.Cartesian3.subtract(
                    bCartesian,
                    cameraPosition,
                    new Cesium.Cartesian3()
                ),
                new Cesium.Cartesian3()
            ));

            return computeAngle(
                Cesium.Cartesian3.multiplyByScalar(normal, w, new Cesium.Cartesian3()),
                bCartesian
            );
        }
        return null;
    }).filter(slope => slope !== null);
}
