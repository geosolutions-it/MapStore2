/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import MockAdapter from "axios-mock-adapter";

import axios from '../../../libs/ajax';
import {INFO_FORMATS} from "../../FeatureInfoUtils";
import {ServerTypes} from "../../LayersUtils";
import {getFeatureInfo} from "../../../api/identify";
import wms from '../wms';

describe('mapinfo wms utils', () => {
    let mockAxios;
    beforeEach((done) => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });
    afterEach((done) => {
        if (mockAxios) {
            mockAxios.restore();
        }
        mockAxios = null;
        setTimeout(done);
    });
    it('should build a WMS GetFeatureInfo request with default feature_count', () => {
        const { request } = wms.buildRequest({
            type: "wms",
            id: "test_layer",
            name: "test_layer",
            url: "/geoserver/wms"
        }, {
            point: { latlng: { lat: 0, lng: 0 } },
            map: { projection: "EPSG:4326", resolution: 1 }
        });

        expect(request.feature_count).toBe(10);
        expect(request.buffer).toNotExist();
    });
    it('should build a WMS GetFeatureInfo request with layer featureInfo maxItems', () => {
        const layer = {
            type: "wms",
            id: "test_layer",
            name: "test_layer",
            url: "/geoserver/wms",
            featureInfo: {
                maxItems: 25
            }
        };
        const { request } = wms.buildRequest(layer, {
            point: { latlng: { lat: 0, lng: 0 } },
            map: { projection: "EPSG:4326", resolution: 1 },
            maxItems: 50
        }, undefined, undefined, layer.featureInfo);

        expect(request.feature_count).toBe(25);
    });
    it('should include buffer only for GeoServer WMS GetFeatureInfo requests', () => {
        const layer = {
            type: "wms",
            id: "test_layer",
            name: "test_layer",
            url: "/geoserver/wms",
            serverType: ServerTypes.GEOSERVER,
            featureInfo: {
                buffer: 8
            }
        };
        const options = {
            point: { latlng: { lat: 0, lng: 0 } },
            map: { projection: "EPSG:4326", resolution: 1 }
        };

        expect(wms.buildRequest(layer, options, undefined, undefined, layer.featureInfo).request.buffer).toBe(8);
        expect(wms.buildRequest({ ...layer, serverType: ServerTypes.NO_VENDOR }, options, undefined, undefined, layer.featureInfo).request.buffer).toNotExist();
    });
    it('should return the response object from getIdentifyFlow in case of 200 with empty features,', (done) => {
        const SAMPLE_LAYER = {
            type: "wms",
            name: "test_layer"
        };
        mockAxios.onGet().reply(() => {
            return [200, {
                "type": "FeatureCollection",
                "features": [],
                "totalFeatures": "unknown",
                "numberReturned": 0,
                "timeStamp": "2023-09-22T08:50:30.808Z",
                "crs": null
            }];
        });
        getFeatureInfo(
            "TEST_URL", {
                info_format: INFO_FORMATS.JSON
            }, SAMPLE_LAYER
        ).subscribe(
            n => {
                expect(n.data.features.length).toEqual(0);
                expect(n.features).toEqual([]);
                done();
            },
            error => {
                return done(error);
            }
        );
    });
    it('should return the response object from getIdentifyFlow in case of 200 with features,', (done) => {
        const SAMPLE_LAYER = {
            type: "wms",
            name: "test_layer"
        };
        mockAxios.onGet().reply(() => {
            return [200, {
                "type": "FeatureCollection",
                "features": [{}, {}],
                "totalFeatures": "unknown",
                "numberReturned": 2,
                "timeStamp": "2023-09-22T08:50:30.808Z",
                "crs": null
            }];
        });
        getFeatureInfo(
            "TEST_URL", {
                info_format: INFO_FORMATS.JSON
            }, SAMPLE_LAYER
        ).subscribe(
            n => {
                expect(n.data.features.length).toEqual(2);
                expect(n.features.length).toEqual(2);
                done();
            },
            error => {
                return done(error);
            }
        );
    });
    it('should return the response object from getIdentifyFlow in case no data features as a text,', (done) => {
        const SAMPLE_LAYER = {
            type: "wms",
            name: "test_layer"
        };
        mockAxios.onGet().reply(() => {
            return [200, 'no features were found'];
        });
        getFeatureInfo(
            "TEST_URL", {
                info_format: INFO_FORMATS.TEXT
            }, SAMPLE_LAYER
        ).subscribe(
            n => {
                expect(n.data).toEqual('no features were found');
                done();
            },
            error => {
                return done(error);
            }
        );
    });
    it('test intercept ogc error in wms if success', (done)=>{
        mockAxios.onGet().reply(() => {
            return [200,  {
                "type": "FeatureCollection",
                "features": [],
                "totalFeatures": "unknown",
                "numberReturned": 0,
                "timeStamp": "2023-09-22T08:50:30.808Z",
                "crs": null
            }];
        });
        wms
            .getIdentifyFlow(undefined, "/", { features: [] })
            .subscribe((response) => {
                expect(response?.data?.features).toEqual([]);
                done();
            });
    });
    it('test intercept ogc error in wms if exception', (done)=>{
        mockAxios.onGet().reply(() => {
            return [200, `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
            <!DOCTYPE ServiceExceptionReport SYSTEM "https://geobretagne.fr/geoserver/schemas/wms/1.1.1/WMS_exception_1_1_1.dtd">
            <ServiceExceptionReport version="1.1.1" >
                <ServiceException>
                  java.lang.NumberFormatException: For input string: &quot;asd&quot;
            For input string: &quot;asd&quot;
            </ServiceException>
            </ServiceExceptionReport>`];
        });
        wms
            .getIdentifyFlow(undefined, "/", { features: [] })
            .subscribe((response) => {
                expect(response?.data?.exceptions).toExist();
            }, error=>{
                expect(error.name).toEqual('OGCError');
                done();
            });
    });
    it('test intercept ogc error in wms if failed', (done)=>{
        mockAxios.onGet().reply(() => {
            return [404, {}];
        });
        wms
            .getIdentifyFlow(undefined, "/", { features: [] })
            .subscribe((response) => {
                expect(response?.data?.features).toEqual([]);
            }, error => {
                expect(error.status).toEqual(404);
                done();
            });
    });
});
