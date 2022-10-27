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
    getCesiumColor,
    createPolylinePrimitive,
    createPolygonPrimitive,
    createCircleMarkerImage,
    polygonToClippingPlanes
} from '../PrimitivesUtils';

describe('Test PrimitivesUtils', () => {
    it('getCesiumColor', () => {
        expect(getCesiumColor({ color: '#ff0000', opacity: 0.5 }).toCssColorString()).toBe('rgba(255,0,0,0.5)');
        expect(getCesiumColor({ color: '#ff0000' }).toCssColorString()).toBe('rgb(255,0,0)');
        expect(getCesiumColor({ color: 'rgba(255,0,0,0.5)' }).toCssColorString()).toBe('rgba(255,0,0,0.5)');
    });
    it('createPolylinePrimitive', () => {
        const primitive = createPolylinePrimitive({ coordinates: Cesium.Cartesian3.fromDegreesArray([10, 10, 20, 20]) });
        expect(primitive instanceof Cesium.Primitive).toBe(true);
    });
    it('createPolygonPrimitive', () => {
        const primitive = createPolygonPrimitive({ coordinates: Cesium.Cartesian3.fromDegreesArray([10, 10, 20, 20, 5, 0]) });
        expect(primitive instanceof Cesium.Primitive).toBe(true);
    });
    it('createCircleMarkerImage', () => {
        const canvas = createCircleMarkerImage(16);
        expect(canvas.getAttribute('width')).toBe('16');
        expect(canvas.getAttribute('height')).toBe('16');
    });
    it('polygonToClippingPlanes', (done) => {
        polygonToClippingPlanes({
            "type": "Feature",
            "properties": {},
            "geometry": {
                "coordinates": [
                    [
                        [
                            8.931329125577776,
                            44.40689401356852
                        ],
                        [
                            8.931329125577776,
                            44.40035268585416
                        ],
                        [
                            8.939979994731459,
                            44.40035268585416
                        ],
                        [
                            8.939979994731459,
                            44.40689401356852
                        ],
                        [
                            8.931329125577776,
                            44.40689401356852
                        ]
                    ]
                ],
                "type": "Polygon"
            }
        })
            .then((clippingPlanes) => {
                expect(clippingPlanes.length).toBe(4);
                clippingPlanes.forEach((clippingPlane) => {
                    expect(clippingPlane instanceof Cesium.ClippingPlane).toBe(true);
                });
                done();
            })
            .catch((e) => {
                done(e);
            });
    });
});

