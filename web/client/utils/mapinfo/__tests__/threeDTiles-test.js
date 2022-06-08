/*
 * Copyright 2012, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import threeDTiles from '../threeDTiles';

describe('mapinfo 3D tiles utils', () => {
    it('should create a request with empty features', () => {
        const layer = {
            title: 'Title'
        };
        const request = threeDTiles.buildRequest(layer);
        expect(request).toEqual({
            request: {
                features: [],
                outputFormat: 'application/json'
            },
            metadata: {
                title: layer.title
            },
            url: 'client'
        });
    });
    it('should create a request with features retrieved from the intersected ones', () => {
        const layer = {
            id: 'layer-id',
            title: 'Title'
        };
        const point = {
            intersectedFeatures: [{ id: 'layer-id', features: [{ type: 'Feature', properties: { key: 'value' }, geometry: null }] }]
        };
        const request = threeDTiles.buildRequest(layer, { point });
        expect(request).toEqual({
            request: {
                features: [{ type: 'Feature', properties: { key: 'value' }, geometry: null }],
                outputFormat: 'application/json'
            },
            metadata: {
                title: layer.title
            },
            url: 'client'
        });
    });
    it('should return the response object from getIdentifyFlow', (done) => {
        threeDTiles.getIdentifyFlow(undefined, undefined, { features: [] })
            .toPromise()
            .then((response) => {
                expect(response).toEqual({
                    data: {
                        features: []
                    }
                });
                done();
            });
    });
});
