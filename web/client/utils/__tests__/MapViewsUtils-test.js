/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import {
    createInverseMaskFromPolygonFeatureCollection,
    mergeViewLayers,
    formatClippingFeatures,
    getZoomFromHeight,
    getHeightFromZoom
} from '../MapViewsUtils';

describe('Test MapViewsUtils', () => {
    it('createInverseMaskFromPolygonFeatureCollection', (done) => {
        createInverseMaskFromPolygonFeatureCollection({
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
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
                        ]
                    },
                    properties: {}
                }
            ]
        }, { offset: 100 }).then((inverseCollection) => {
            expect(inverseCollection.features.length).toBe(1);
            done();
        }).catch((e) => {
            done(e);
        });
    });
    it('mergeViewLayers', () => {
        const layers = [ { id: 'layer.01', type: '3dtiles', url: 'tileset.json', visibility: false } ];
        expect(mergeViewLayers(layers)).toEqual(layers);
        const view = { layers: [ { id: 'layer.01', visibility: true } ] };
        expect(mergeViewLayers(layers, view)).toEqual([ {
            id: 'layer.01',
            type: '3dtiles',
            url: 'tileset.json',
            visibility: true,
            changed: true
        } ]);
    });
    it('formatClippingFeatures', () => {
        expect(formatClippingFeatures()).toEqual(undefined);
        let feature = {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [
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
                ]
            },
            properties: {}
        };
        expect(formatClippingFeatures([feature])[0].id).toEqual('Feature 1');
        feature = {
            ...feature,
            id: 0
        };
        expect(formatClippingFeatures([feature])[0].id).toEqual('Feature 0');
        feature = {
            ...feature,
            id: 'feature.01'
        };
        expect(formatClippingFeatures([feature])[0].id).toEqual('feature.01');
    });
    it('getZoomFromHeight', () => {
        expect(Math.round(getZoomFromHeight(1000))).toBe(17);
    });
    it('getHeightFromZoom', () => {
        expect(Math.round(getHeightFromZoom(17))).toBe(1221);
    });
});
