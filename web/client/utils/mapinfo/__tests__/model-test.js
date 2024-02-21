/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import model from '../model';

describe('mapinfo 3D tiles utils', () => {
    it('should create a request with empty features', () => {
        const layer = {
            title: 'Title'
        };
        const request = model.buildRequest(layer);
        expect(request).toEqual({
            request: {
                features: [],
                outputFormat: 'application/json',
                lat: undefined,
                lng: undefined
            },
            metadata: {
                title: layer.title, fields: [], resolution: undefined, buffer: 2, units: undefined, rowViewer: undefined, viewer: undefined, layerId: undefined
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
            intersectedFeatures: [{ id: 'layer-id', features: [{ type: 'Feature', properties: { key: 'value' }, geometry: null }] }], latlng: { lat: 1, lng: 1 }
        };
        const request = model.buildRequest(layer, { point });
        expect(request).toEqual({
            request: {
                features: [{ type: 'Feature', properties: { key: 'value' }, geometry: null }],
                outputFormat: 'application/json',
                lat: 1,
                lng: 1
            },
            metadata: {
                title: layer.title, fields: [], resolution: undefined, buffer: 2, units: undefined, rowViewer: undefined, viewer: undefined, layerId: 'layer-id'
            },
            url: 'client'
        });
    });
    it('should return the response object from getIdentifyFlow', (done) => {
        model.getIdentifyFlow(undefined, undefined, { features: [] })
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
