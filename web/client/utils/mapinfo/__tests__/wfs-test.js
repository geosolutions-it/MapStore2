/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from "expect";
import wfs from "../wfs";
import axios from '../../../libs/ajax';
import MockAdapter from 'axios-mock-adapter';

let mockAxios;

describe("mapinfo wfs utils", () => {
    beforeEach((done) => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach((done) => {
        mockAxios.restore();
        setTimeout(done);
    });
    it("should create a GetFeature request", () => {
        const layer = {
            title: "Title",
            url: "http://layer.url"
        };
        const request = wfs.buildRequest(layer);
        expect(request).toEqual({
            request: {
                point: undefined,
                service: "WFS",
                version: "1.1.1",
                request: "GetFeature",
                outputFormat: "application/json",
                exceptions: "application/json",
                id: undefined,
                typeName: undefined,
                srs: "EPSG:4326",
                feature_count: 10,
                params: undefined
            },
            metadata: {
                title: "Title",
                regex: undefined,
                viewer: undefined,
                featureInfo: undefined
            },
            url: "http://layer.url"
        });
    });

    it("should create a request with features retrieved from the intersected ones", () => {
        const layer = {
            id: "layer-id",
            title: "Title",
            fields: [{
                name: "key",
                type: "string",
                alias: "alias"
            }]
        };
        const point = {
            intersectedFeatures: [
                {
                    id: "layer-id",
                    features: [
                        {
                            type: "Feature",
                            properties: { key: "value" },
                            geometry: null
                        }
                    ]
                }
            ]
        };
        const request = wfs.buildRequest(layer, { point });
        expect(request).toEqual({
            request: {
                features: [
                    {
                        type: "Feature",
                        properties: { key: "value" },
                        geometry: null
                    }
                ],
                outputFormat: "application/json"
            },
            metadata: {
                title: "Title",
                regex: undefined,
                fields: [{
                    name: "key",
                    type: "string",
                    alias: "alias"
                }],
                viewer: undefined,
                featureInfo: undefined
            },
            url: "client"
        });
    });

    it("should return the response object from getIdentifyFlow", (done) => {
        wfs
            .getIdentifyFlow(undefined, undefined, { features: [] })
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

    it('should build the request with text/html output', () => {
        const layer = {
            id: "layer-id",
            title: "Title",
            url: '/geoserver/wfs',
            fields: [{
                name: "key",
                type: "string",
                alias: "alias"
            }]
        };
        const point = {
            intersectedFeatures: [
                {
                    id: "layer-id",
                    features: [
                        {
                            type: "Feature",
                            id: 'feature.1',
                            properties: { key: "value" },
                            geometry: null
                        }
                    ]
                }
            ]
        };
        expect(wfs.buildRequest(layer, { point }, 'text/html')).toEqual({
            request: {
                features: [
                    { type: 'Feature', id: 'feature.1', properties: { key: 'value' }, geometry: null }
                ],
                outputFormat: 'text/html'
            },
            metadata: {
                title: 'Title',
                regex: undefined,
                fields: [ { name: 'key', type: 'string', alias: 'alias' } ],
                viewer: undefined,
                featureInfo: undefined
            },
            url: '/geoserver/wfs'
        });
    });

    it("should request html info with cql filter", (done) => {
        mockAxios.onGet().reply((req) => {
            try {
                expect(req.url).toBe("/geoserver/wfs?typeName=&version=1.1.0&service=WFS&request=GetFeature&outputFormat=text%2Fhtml&CQL_FILTER=IN%20('feature.1')");
            } catch (e) {
                done(e);
            }
            done();
            return [200, {}];
        });
        const layer = {
            id: "layer-id",
            title: "Title",
            url: '/geoserver/wfs',
            fields: [{
                name: "key",
                type: "string",
                alias: "alias"
            }]
        };
        wfs
            .getIdentifyFlow(layer, layer.url, {
                features: [{
                    type: "Feature",
                    id: 'feature.1',
                    properties: { key: "value" },
                    geometry: null
                }],
                outputFormat: 'text/html'
            })
            .toPromise();
    });
});
