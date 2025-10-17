/**
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../../libs/ajax';
import Api from '../GeoFence';
import ConfigUtils from '../../../utils/ConfigUtils';

let mockAxios;

describe('Api module', () => {

    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });

    afterEach(() => {
        mockAxios.restore();
    });

    describe('test addBaseUrl', () => {
        it('addBaseUrl should return full geofence URL', () => {
            const options = { headers: { Accept: 'application/json' } };
            const result = Api.addBaseUrl(options);
            expect(result.baseURL).toContain('geofence/rest');
            expect(result.headers.Accept).toEqual('application/json');
        });

        it('addBaseUrlGS should append slash if missing', () => {
            const options = { headers: { Accept: 'application/json' } };
            const gsURL = 'http://test-geoserver';
            const result = Api.addBaseUrlGS(options, gsURL);
            expect(result.baseURL).toEqual('http://test-geoserver/');
        });
    });

    describe('Users & Roles', () => {

        it('test getUsersCount', () => {
            const mockCount = 5;
            mockAxios.onGet().reply(() => [ 200, { data: mockCount}]);

            Api.getUsersCount().then(count => {
                expect(count).toEqual(mockCount);
            });
        });

        it('getRolesCount', () => {
            const mockCount = 10;
            mockAxios.onGet().reply(() => [ 200, { data: mockCount}]);

            Api.getRolesCount().then(count => {
                expect(count).toEqual(mockCount);
            });
        });

        it('test getUsers', () => {
            const users = Array.from({ length: 3 }, (_, i) => ({ userName: `user${i + 1}` }));
            mockAxios.onGet().reply(() => [ 200, { data: users}]);
            Api.getUsers("", 0, 10).then(result => {
                expect(result.users.length).toEqual(3);
                expect(result.users[0].userName).toEqual('user1');
            });
        });

    });

    describe('Rules', () => {
        it('test getRulesCount', () => {
            const mockCount = 7;
            mockAxios.onGet("/rules/count").reply(() => [ 200, { data: mockCount}]);
            const filters = {};
            Api.getRulesCount(filters).then(count => {
                expect(count).toEqual(mockCount);
            });
        });
    });

    describe('Layers', () => {
        it('test getLayers using rest', (done) => {
            ConfigUtils.setConfigProp("geoFenceLayerServiceType", "rest");
            mockAxios.onGet().reply(() => [ 200, {layers: {layer: [{
                "name": "tiger:giant_polygon",
                "href": "http://localhost:8087/geoserver2/rest/layers/tiger%3Agiant_polygon.json"
            }]}}]);

            Api.getLayers("", 0, 10, {}, "http://localhost:8080/geoserver").then(result => {
                expect(result.data[0].name).toEqual('giant_polygon');
                ConfigUtils.removeConfigProp("geoFenceLayerServiceType");
                done();
            });
        });
        it('test getLayers using csw', (done) => {
            ConfigUtils.setConfigProp("geoFenceLayerServiceType", "csw");
            const payload = `<?xml version="1.0" encoding="UTF-8"?><csw:GetRecordsResponse xmlns:csw="http://www.opengis.net/cat/csw/2.0.2" xmlns:rim="urn:oasis:names:tc:ebxml-regrep:xsd:rim:3.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dct="http://purl.org/dc/terms/" xmlns:ows="http://www.opengis.net/ows" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="2.0.2" xsi:schemaLocation="http://www.opengis.net/cat/csw/2.0.2 http://localhost:8087/geoserver272csw/schemas/csw/2.0.2/record.xsd">
            <csw:SearchStatus timestamp="2025-10-10T14:53:14.158Z"/>
            <csw:SearchResults numberOfRecordsMatched="25" numberOfRecordsReturned="5" nextRecord="6" elementSet="full">
                <csw:Record>
                <dc:identifier>tiger:giant_polygon</dc:identifier>
                <dc:creator>GeoServer Catalog</dc:creator>
                <dct:references scheme="OGC:WMS">http://localhost:8087/geoserver272csw/wms?service=WMS&amp;request=GetMap&amp;layers=tiger:giant_polygon</dct:references>
                <dc:subject>DS_giant_polygon</dc:subject>
                <dc:subject>giant_polygon</dc:subject>
                <dct:abstract>A simple rectangular polygon covering most of the world, it's only used for the purpose of providing a background (WMS bgcolor could be used instead)</dct:abstract>
                <dc:type>http://purl.org/dc/dcmitype/Dataset</dc:type>
                <dc:title>World rectangle</dc:title>
                <ows:BoundingBox crs="urn:x-ogc:def:crs:EPSG:6.11:4326">
                    <ows:LowerCorner>-90.0 -180.0</ows:LowerCorner>
                    <ows:UpperCorner>90.0 180.0</ows:UpperCorner>
                </ows:BoundingBox>
                </csw:Record>
            </csw:SearchResults>
            </csw:GetRecordsResponse>`;
            mockAxios.onPost().reply(() => [ 200, payload]);

            Api.getLayers("", 0, 10, {}, "http://localhost:8080/geoserver").then(result => {
                expect(result.data[0].name).toEqual('giant_polygon');
                ConfigUtils.removeConfigProp("geoFenceLayerServiceType");
                done();
            });
        });
    });

    describe('GeoServer instances', () => {
        it('loadGSInstances delegates to GSInstanceService', () => {
            mockAxios.onGet().reply(() => [ 200, { data: [{ name: 'GS1', id: 1, url: 'url1' }], count: 1}]);
            Api.loadGSInstances().then(result => {
                expect(result.data[0].name).toEqual('GS1');
                expect(result.count).toEqual(1);
            });
        });
    });

    describe('getWorkspaces', () => {
        it('test getWorkspaces', () => {
            const mockData = { workspaces: ['ws1', 'ws2'] };
            mockAxios.onGet('rest/workspaces').reply(200, mockData);

            Api.getWorkspaces().then(data => {
                expect(data).toEqual(mockData);
            });
        });
    });
});
