/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../libs/ajax';
import { getResourceFromLayer } from '../MapViews';

let mockAxios;

describe('MapViews API', () => {
    afterEach((done) => {
        if (mockAxios) {
            mockAxios.restore();
        }
        mockAxios = null;
        setTimeout(done);
    });
    it('should update a wfs layer resource', (done) => {
        mockAxios = new MockAdapter(axios);
        mockAxios.onGet().reply(200, { type: 'FeatureCollection', features: []  });
        getResourceFromLayer({
            layer: {
                type: 'wfs',
                url: '/geoserver/wfs',
                name: 'name',
                title: 'Title',
                id: 'layer.01'
            }
        })
            .then((resource) => {
                expect(resource).toEqual({
                    id: 'layer.01;inverse:false;offset:0',
                    updated: true,
                    data: {
                        type: 'wfs',
                        name: 'name',
                        title: 'Title',
                        url: '/geoserver/wfs',
                        id: 'layer.01',
                        collection: { type: 'FeatureCollection', features: [] }
                    }
                });
                done();
            })
            .catch((e) => {
                done(e);
            });
    });
    it('should update a vector layer resource', (done) => {
        getResourceFromLayer({
            layer: {
                type: 'vector',
                features: [],
                name: 'name',
                title: 'Title',
                id: 'layer.01'
            }
        })
            .then((resource) => {
                expect(resource).toEqual({
                    id: 'layer.01;inverse:false;offset:0',
                    updated: true,
                    data: {
                        type: 'vector',
                        name: 'name',
                        title: 'Title',
                        url: undefined,
                        id: 'layer.01',
                        collection: { type: 'FeatureCollection', features: [] }
                    }
                });
                done();
            })
            .catch((e) => {
                done(e);
            });
    });
    it('should not update a layer if the resource exists already', (done) => {
        getResourceFromLayer({
            layer: {
                type: 'vector',
                features: [],
                name: 'name',
                title: 'Title',
                id: 'layer.01'
            },
            resources: [
                {
                    id: 'layer.01;inverse:false;offset:0',
                    data: {
                        type: 'vector',
                        name: 'name',
                        title: 'Title',
                        url: undefined,
                        id: 'layer.01',
                        collection: { type: 'FeatureCollection', features: [] }
                    }
                }
            ]
        })
            .then((resource) => {
                expect(resource).toEqual({
                    id: 'layer.01;inverse:false;offset:0',
                    data: {
                        type: 'vector',
                        name: 'name',
                        title: 'Title',
                        url: undefined,
                        id: 'layer.01',
                        collection: { type: 'FeatureCollection', features: [] }
                    }
                });
                done();
            })
            .catch((e) => {
                done(e);
            });
    });
});
