/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';
import * as Cesium from 'cesium';
import {
    computeMiddlePoint,
    computeAngle,
    computeNormal,
    computeAngles,
    computeTriangleMiddlePoint,
    computeSlopes
} from '../MathUtils';

describe('Test MathUtils', () => {
    it('computeMiddlePoint', () => {
        const result = computeMiddlePoint(
            new Cesium.Cartesian3(0, 0, 0),
            new Cesium.Cartesian3(1, 0, 0)
        );
        expect(result.x).toBe(0.5);
        expect(result.y).toBe(0);
        expect(result.z).toBe(0);
    });
    it('computeAngle', () => {
        const result = computeAngle(
            new Cesium.Cartesian3(0, 1, 0),
            new Cesium.Cartesian3(1, 0, 0)
        );
        expect(result).toBe(90);
    });
    it('computeNormal', () => {
        const result = computeNormal(
            new Cesium.Cartesian3(0, 10, 0),
            new Cesium.Cartesian3(10, 0, 0)
        );
        expect(result.x).toBe(0);
        expect(result.y).toBe(0);
        expect(result.z).toBe(-1);
    });
    it('computeAngles', () => {
        const result = computeAngles([
            new Cesium.Cartesian3(1, 0, 0),
            new Cesium.Cartesian3(0, 0, 0),
            new Cesium.Cartesian3(0, 1, 0)
        ]);
        expect(result[0]).toBe(90);
    });
    it('computeTriangleMiddlePoint', () => {
        const result = computeTriangleMiddlePoint([
            new Cesium.Cartesian3(1, 0, 0),
            new Cesium.Cartesian3(0, 0, 0),
            new Cesium.Cartesian3(0, 1, 0)
        ]);
        expect(result.x.toFixed(2)).toBe('0.33');
        expect(result.y.toFixed(2)).toBe('0.33');
        expect(result.z).toBe(0);
    });
    it('computeSlopes', () => {
        const result = computeSlopes([
            new Cesium.Cartesian3(4740254.317185668, 1095572.8088459417, 4110460.560372613),
            new Cesium.Cartesian3(4577316.286468084, 1240656.4763755186, 4250569.528458886),
            new Cesium.Cartesian3(4687713.081782806, 1340971.716433566, 4098045.430648446)
        ], new Cesium.Cartesian3(6352463.924705475, 1070597.5587672037, 5895546.60193573));
        expect(Math.round(result)).toBe(1);
    });
});
