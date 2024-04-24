/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import * as Cesium from 'cesium';
import earcut from 'earcut';

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

/**
 * Compute area from cartesian positions
 * @param {array} positions coordinates of polygon in cartesian values
 * @param {array} holes arrays of polygon holes
 * @returns number area value in square meter
 */
// from https://groups.google.com/g/cesium-dev/c/q6N5MmykVPU
export function computeArea(positions, holes) {

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
// use the EllipsoidGeodesic surface distance to compute distances
function computeGeoDesicDistance(start, end) {
    const cartographic = [start, end].map((cartesian) => Cesium.Cartographic.fromCartesian(cartesian));
    return new Cesium.EllipsoidGeodesic(...cartographic.map(({ longitude, latitude }) => new Cesium.Cartographic(longitude, latitude, 0))).surfaceDistance;
}
/**
 * Compute distance of a polyline
 * @param {array} positions coordinates in cartesian values
 * @param {boolean} geodesic if true it uses the surface distance
 * @returns number distance value in meter
 */
export function computeDistance(positions, geodesic) {
    if (positions?.length < 2) {
        return 0;
    }
    return positions.reduce((sum, cartesian, idx) =>
        positions[idx - 1]
            ? sum + (geodesic ? computeGeoDesicDistance(cartesian, positions[idx - 1]) : Cesium.Cartesian3.distance(cartesian, positions[idx - 1]))
            : sum, 0);
}
/**
 * Return the direction of the height, 1 if the first value is greater than the second one, -1 the opposite
 * @param {array} cartesianArray coordinates in cartesian values, must contains only two cartesian values
 * @returns number -1 or 1
 */
export function computeHeightSign(cartesianArray) {
    return Math.sign(
        Cesium.Cartographic.fromCartesian(cartesianArray[1]).height -
        Cesium.Cartographic.fromCartesian(cartesianArray[0]).height
    );
}
/**
 * Return the direction of the height, 1 if the first value is greater than the second one, -1 the opposite
 * @param {object} cartesian a Cesium.Cartesian instance
 * @param {number} height the alternative fixed height value
 * @returns array as [longitude, latitude, height]
 */
export function cartesianToCartographicArray(cartesian, height) {
    const { longitude, latitude, height: cartesianHeight } = Cesium.Cartographic.fromCartesian(cartesian);
    return [ Cesium.Math.toDegrees(longitude), Cesium.Math.toDegrees(latitude), height ?? cartesianHeight ];
}
/**
 * Given an array of cartesian value returns a set of cartesian value at a specific height
 * @param {object} positions a Cesium.Cartesian instance
 * @param {function} height (optional) a function that returns a number, the argument is the list of position converted to cartographic (eg: (cartographic) => cartographic[0].height, () => 5), by default the height will be forced to 0
 * @returns array of cartographic positions at a specified height, height is 0 by default
 */
export function computeGeodesicCoordinates(positions, height) {
    const cartographic = positions.map((cartesian) => Cesium.Cartographic.fromCartesian(cartesian));
    const _altitude = height ? height(cartographic) : 0;
    return cartographic.map(({ longitude, latitude }) => {
        return Cesium.Cartographic.toCartesian(new Cesium.Cartographic(longitude, latitude, _altitude));
    });
}
