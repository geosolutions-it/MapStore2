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
import {saveLayer, ServerTypes} from "../../LayersUtils";
import {getFeatureInfo} from "../../../api/identify";
import { buildIdentifyRequestPlan, resolveIdentifyLayer } from '../../MapInfoUtils';
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
    [undefined, ServerTypes.NO_VENDOR].forEach(serverType => {
        it(`detects QGIS before planning Identify for an existing ${serverType || 'default'} layer`, async() => {
            const layer = {
                type: 'wms',
                name: 'trees',
                url: '/ows',
                serverType,
                params: { MAP: 'trees.qgz' },
                infoFormats: ['text/html'],
                featureInfo: { buffer: 10 }
            };
            mockAxios.onGet('/ows?service=WMS&version=1.3.0&request=GetCapabilities&MAP=trees.qgz')
                .reply(200, '<WMS_Capabilities xmlns:qgs="http://www.qgis.org/wms"><Capability/></WMS_Capabilities>');
            const options = {
                point: { latlng: { lat: 0, lng: 0 } },
                map: { projection: 'EPSG:4326', resolution: 1 },
                format: INFO_FORMATS.HTML
            };
            const resolvedLayer = await resolveIdentifyLayer(layer, options);
            const { requests } = buildIdentifyRequestPlan(resolvedLayer, options);
            expect(resolvedLayer.isQGIS).toBe(true);
            expect(layer).toExcludeKey('isQGIS');
            expect(requests.length).toBe(1);
            expect(requests[0].request).toInclude({
                FI_POINT_TOLERANCE: 10,
                FI_LINE_TOLERANCE: 10,
                FI_POLYGON_TOLERANCE: 10,
                MAP: 'trees.qgz'
            });
            expect(requests[0].request).toExcludeKey('buffer');
        });
    });
    it('reuses QGIS detection for concurrent and subsequent clicks on the same layer', async() => {
        const layer = { url: '/ows', featureInfo: { buffer: 0 } };
        mockAxios.onGet().reply(200, '<WMS_Capabilities xmlns:qgs="http://www.qgis.org/wms"><Capability/></WMS_Capabilities>');
        const layers = await Promise.all([wms.resolveLayer(layer), wms.resolveLayer(layer)]);
        expect(layers.every(({ isQGIS }) => isQGIS)).toBe(true);
        expect((await wms.resolveLayer(layer)).isQGIS).toBe(true);
        expect(mockAxios.history.get.length).toBe(1);
    });
    it('keeps Identify working after failed detection and retries on the next click', async() => {
        const layer = { url: '/ows', featureInfo: { buffer: 10 } };
        mockAxios.onGet().replyOnce(500);
        expect(await wms.resolveLayer(layer)).toBe(layer);
        mockAxios.onGet().reply(200, '<WMS_Capabilities xmlns:qgs="http://www.qgis.org/wms"><Capability/></WMS_Capabilities>');
        expect((await wms.resolveLayer(layer)).isQGIS).toBe(true);
        expect(mockAxios.history.get.length).toBe(2);
    });
    it('does not fetch capabilities for known servers or layers without a valid buffer', async() => {
        const layers = [
            { url: '/ows', isQGIS: true, featureInfo: { buffer: 10 } },
            { url: '/ows', isQGIS: false, featureInfo: { buffer: 10 } },
            { featureInfo: { buffer: 10 } },
            ...[undefined, '', null, -1, 'invalid'].map(buffer => ({ url: '/ows', featureInfo: { buffer } }))
        ];
        for (const layer of layers) {
            expect(await wms.resolveLayer(layer)).toBe(layer);
        }
        expect(mockAxios.history.get.length).toBe(0);
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
    [
        { serverType: ServerTypes.GEOSERVER },
        { serverType: ServerTypes.NO_VENDOR },
        {},
        { serverType: ServerTypes.NO_VENDOR, isQGIS: true },
        { isQGIS: true }
    ].forEach(serverOptions => {
        const { serverType, isQGIS } = serverOptions;
        const layer = {
            type: "wms",
            id: "test_layer",
            name: "test_layer",
            url: "/wms",
            ...serverOptions
        };
        const options = {
            point: { latlng: { lat: 0, lng: 0 } },
            map: { projection: "EPSG:4326", resolution: 1 }
        };
        const toleranceParams = ['FI_POINT_TOLERANCE', 'FI_LINE_TOLERANCE', 'FI_POLYGON_TOLERANCE'];

        const serverDescription = `${serverType || 'default'}${isQGIS ? ' QGIS' : ''}`;
        it(`should map the buffer to the correct parameters for ${serverDescription} WMS requests`, () => {
            [0, 8, '5', 1000, 1001].forEach(buffer => {
                const { request } = wms.buildRequest(layer, options, undefined, undefined, { buffer });
                const expectedBuffer = Math.min(Number(buffer), 1000);
                if (isQGIS) {
                    expect(request).toExcludeKey('buffer');
                    toleranceParams.forEach(param => expect(request[param]).toBe(expectedBuffer));
                } else if (serverType !== ServerTypes.NO_VENDOR) {
                    expect(request.buffer).toBe(expectedBuffer);
                    toleranceParams.forEach(param => expect(request).toExcludeKey(param));
                } else {
                    ['buffer', ...toleranceParams].forEach(param => expect(request).toExcludeKey(param));
                }
            });
        });

        it(`should omit unset or invalid buffer parameters for ${serverDescription} WMS requests`, () => {
            [undefined, {}, ...['', undefined, null, -1, 1.5, 'invalid'].map(buffer => ({ buffer }))].forEach(featureInfo => {
                const { request } = wms.buildRequest(layer, options, undefined, undefined, featureInfo);
                ['buffer', ...toleranceParams].forEach(param => expect(request).toExcludeKey(param));
            });
        });
    });
    it('should preserve QGIS detection and buffer mapping when saving and reloading a layer', () => {
        const layer = JSON.parse(JSON.stringify(saveLayer({
            type: 'wms',
            name: 'trees',
            url: '/ows',
            serverType: ServerTypes.NO_VENDOR,
            isQGIS: true,
            featureInfo: { buffer: 5 }
        })));
        const { request } = wms.buildRequest(layer, {
            point: { latlng: { lat: 0, lng: 0 } },
            map: { projection: 'EPSG:4326', resolution: 1 }
        }, undefined, undefined, layer.featureInfo);
        expect(layer.isQGIS).toBe(true);
        expect(request.FI_POINT_TOLERANCE).toBe(5);
        expect(request.FI_LINE_TOLERANCE).toBe(5);
        expect(request.FI_POLYGON_TOLERANCE).toBe(5);
        expect(request).toExcludeKey('buffer');
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
