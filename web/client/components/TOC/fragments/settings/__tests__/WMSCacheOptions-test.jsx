/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import { Simulate } from 'react-dom/test-utils';
import WMSCacheOptions from '../WMSCacheOptions';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../../../../libs/ajax';
import WMTSAPI from '../../../../../api/WMTS';
import { waitFor } from '@testing-library/react';
let mockAxios;

describe('WMSCacheOptions', () => {
    beforeEach((done) => {
        mockAxios = new MockAdapter(axios);
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        WMTSAPI.reset();
        mockAxios.restore();
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with default', () => {
        ReactDOM.render(<WMSCacheOptions />, document.getElementById('container'));
        expect(document.querySelector('.ms-wms-cache-options')).toBeTruthy();
        const inputs = document.querySelectorAll('input[type="checkbox"]');
        expect(inputs.length).toBe(1);
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(0);
    });
    it('should not display the tile grid button if geoserver wms and disableTileGrids is true', () => {
        ReactDOM.render(<WMSCacheOptions disableTileGrids layer={{ url: '/geoserver/wms', name: 'topp:states' }} />, document.getElementById('container'));
        expect(document.querySelector('.ms-wms-cache-options')).toBeTruthy();
        const inputs = document.querySelectorAll('input[type="checkbox"]');
        expect(inputs.length).toBe(1);
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(0);
    });
    it('should display the tile grid button if geoserver wms', () => {
        ReactDOM.render(<WMSCacheOptions layer={{ url: '/geoserver/wms', name: 'topp:states' }} />, document.getElementById('container'));
        expect(document.querySelector('.ms-wms-cache-options')).toBeTruthy();
        const inputs = document.querySelectorAll('input[type="checkbox"]');
        expect(inputs.length).toBe(1);
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(2);
        expect([...buttons].map(button => button.querySelector('.glyphicon').getAttribute('class'))).toEqual([
            'glyphicon glyphicon-refresh',
            'glyphicon glyphicon-grid-regular'
        ]);
    });
    it('should display the tile grid buttons if geoserver wms and tile grid strategy is custom (match with map projection)', () => {
        ReactDOM.render(<WMSCacheOptions layer={{
            url: '/geoserver/wms',
            name: 'topp:states',
            tileGridStrategy: 'custom',
            tileGrids: [
                {
                    id: 'EPSG:32122x2',
                    crs: 'EPSG:32122',
                    scales: [2557541.55271451, 1278770.776357255, 639385.3881786275],
                    origins: [[403035.4105968763, 414783], [403035.4105968763, 414783], [403035.4105968763, 323121]],
                    tileSize: [512, 512]
                },
                {
                    id: 'EPSG:900913',
                    crs: 'EPSG:900913',
                    scales: [559082263.9508929, 279541131.97544646, 139770565.98772323],
                    origin: [-20037508.34, 20037508],
                    tileSize: [256, 256]
                }
            ]
        }} projection="EPSG:3857" />, document.getElementById('container'));
        expect(document.querySelector('.ms-wms-cache-options')).toBeTruthy();
        const inputs = document.querySelectorAll('input[type="checkbox"]');
        expect(inputs.length).toBe(1);
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(2);
        expect([...buttons].map(button => button.querySelector('.glyphicon').getAttribute('class'))).toEqual([
            'glyphicon glyphicon-refresh',
            'glyphicon glyphicon-grid-custom'
        ]);
        const info = document.querySelector('.glyphicon-info-sign');
        expect(info).toBeTruthy();
        expect(info.getAttribute('class')).toBe('text-success glyphicon glyphicon-info-sign');

        let table = document.querySelector('table');
        expect(table).toBeFalsy();

        Simulate.mouseOver(info);

        table = document.querySelector('table');
        expect(table).toBeTruthy();

        const tableRows = table.querySelectorAll('tbody > tr');
        expect([...tableRows].map((row) => row.innerText)).toEqual([
            'EPSG:32122x2\tEPSG:32122\t512',
            'EPSG:900913\tEPSG:900913\t256'
        ]);
        const paragraph = document.querySelector('p');
        expect(paragraph.innerText).toBe('layerProperties.tileGridInUse');
    });
    it('should display the tile grid buttons if geoserver wms and tile grid strategy is custom (no match with map projection)', () => {
        ReactDOM.render(<WMSCacheOptions layer={{
            url: '/geoserver/wms',
            name: 'topp:states',
            tileGridStrategy: 'custom',
            tileGrids: [
                {
                    id: 'EPSG:32122x2',
                    crs: 'EPSG:32122',
                    scales: [2557541.55271451, 1278770.776357255, 639385.3881786275],
                    origins: [[403035.4105968763, 414783], [403035.4105968763, 414783], [403035.4105968763, 323121]],
                    tileSize: [512, 512]
                },
                {
                    id: 'EPSG:900913',
                    crs: 'EPSG:900913',
                    scales: [559082263.9508929, 279541131.97544646, 139770565.98772323],
                    origin: [-20037508.34, 20037508],
                    tileSize: [256, 256]
                }
            ]
        }} projection="EPSG:4326" />, document.getElementById('container'));
        expect(document.querySelector('.ms-wms-cache-options')).toBeTruthy();
        const inputs = document.querySelectorAll('input[type="checkbox"]');
        expect(inputs.length).toBe(1);
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(2);
        expect([...buttons].map(button => button.querySelector('.glyphicon').getAttribute('class'))).toEqual([
            'glyphicon glyphicon-refresh',
            'glyphicon glyphicon-grid-custom'
        ]);
        const info = document.querySelector('.glyphicon-info-sign');
        expect(info).toBeTruthy();
        expect(info.getAttribute('class')).toBe('text-danger glyphicon glyphicon-info-sign');

        let table = document.querySelector('table');
        expect(table).toBeFalsy();

        Simulate.mouseOver(info);

        table = document.querySelector('table');
        expect(table).toBeTruthy();

        const tableRows = table.querySelectorAll('tbody > tr');
        expect([...tableRows].map((row) => row.innerText)).toEqual([
            'EPSG:32122x2\tEPSG:32122\t512',
            'EPSG:900913\tEPSG:900913\t256'
        ]);
        const alert = document.querySelector('.alert');
        expect(alert.innerText).toBe('layerProperties.noTileGridMatchesConfiguration');
    });
    it('should request tile grids (success)', (done) => {
        mockAxios.onGet().reply(200, `<?xml version="1.0" encoding="UTF-8"?>
        <Capabilities xmlns="http://www.opengis.net/wmts/1.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:gml="http://www.opengis.net/gml" xsi:schemaLocation="http://www.opengis.net/wmts/1.0 http://schemas.opengis.net/wmts/1.0/wmtsGetCapabilities_response.xsd" version="1.0.0">
          <Contents>
            <Layer>
              <ows:Title>USA Population</ows:Title>
              <ows:Abstract>This is some census data on the states.</ows:Abstract>
              <ows:WGS84BoundingBox>
                <ows:LowerCorner>-124.73142200000001 24.955967</ows:LowerCorner>
                <ows:UpperCorner>-66.969849 49.371735</ows:UpperCorner>
              </ows:WGS84BoundingBox>
              <ows:Identifier>states</ows:Identifier>
              <Style isDefault="true">
                <ows:Identifier>population</ows:Identifier>
                <LegendURL format="image/png" xlink:href="/geoserver/topp/states/ows?service=WMS&amp;request=GetLegendGraphic&amp;format=image%2Fpng&amp;width=20&amp;height=20&amp;layer=topp%3Astates" width="20" height="20"/>
              </Style>
              <Format>image/png</Format>
              <Format>image/jpeg</Format>
              <InfoFormat>text/plain</InfoFormat>
              <InfoFormat>application/vnd.ogc.gml</InfoFormat>
              <InfoFormat>text/xml</InfoFormat>
              <InfoFormat>application/vnd.ogc.gml/3.1.1</InfoFormat>
              <InfoFormat>text/xml</InfoFormat>
              <InfoFormat>text/html</InfoFormat>
              <InfoFormat>application/json</InfoFormat>
              <TileMatrixSetLink>
                <TileMatrixSet>EPSG:32122</TileMatrixSet>
              </TileMatrixSetLink>
              <TileMatrixSetLink>
                <TileMatrixSet>EPSG:4326</TileMatrixSet>
              </TileMatrixSetLink>
              <TileMatrixSetLink>
                <TileMatrixSet>EPSG:900913</TileMatrixSet>
              </TileMatrixSetLink>
            </Layer>
            <TileMatrixSet>
              <ows:Identifier>EPSG:32122</ows:Identifier>
              <ows:SupportedCRS>urn:ogc:def:crs:EPSG::32122</ows:SupportedCRS>
              <TileMatrix>
                <ows:Identifier>EPSG:32122:0</ows:Identifier>
                <ScaleDenominator>2557541.55271451</ScaleDenominator>
                <TopLeftCorner>403035.4105968763 414783.0</TopLeftCorner>
                <TileWidth>512</TileWidth>
                <TileHeight>512</TileHeight>
                <MatrixWidth>1</MatrixWidth>
                <MatrixHeight>1</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
                <ows:Identifier>EPSG:32122:1</ows:Identifier>
                <ScaleDenominator>1278770.776357255</ScaleDenominator>
                <TopLeftCorner>403035.4105968763 414783.0</TopLeftCorner>
                <TileWidth>512</TileWidth>
                <TileHeight>512</TileHeight>
                <MatrixWidth>2</MatrixWidth>
                <MatrixHeight>2</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
                <ows:Identifier>EPSG:32122:2</ows:Identifier>
                <ScaleDenominator>639385.3881786275</ScaleDenominator>
                <TopLeftCorner>403035.4105968763 323121.0</TopLeftCorner>
                <TileWidth>512</TileWidth>
                <TileHeight>512</TileHeight>
                <MatrixWidth>4</MatrixWidth>
                <MatrixHeight>3</MatrixHeight>
              </TileMatrix>
            </TileMatrixSet>
            <TileMatrixSet>
              <ows:Identifier>EPSG:4326</ows:Identifier>
              <ows:SupportedCRS>urn:ogc:def:crs:EPSG::4326</ows:SupportedCRS>
              <TileMatrix>
                <ows:Identifier>EPSG:4326:0</ows:Identifier>
                <ScaleDenominator>2.795411320143589E8</ScaleDenominator>
                <TopLeftCorner>90.0 -180.0</TopLeftCorner>
                <TileWidth>256</TileWidth>
                <TileHeight>256</TileHeight>
                <MatrixWidth>2</MatrixWidth>
                <MatrixHeight>1</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
                <ows:Identifier>EPSG:4326:1</ows:Identifier>
                <ScaleDenominator>1.3977056600717944E8</ScaleDenominator>
                <TopLeftCorner>90.0 -180.0</TopLeftCorner>
                <TileWidth>256</TileWidth>
                <TileHeight>256</TileHeight>
                <MatrixWidth>4</MatrixWidth>
                <MatrixHeight>2</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
                <ows:Identifier>EPSG:4326:2</ows:Identifier>
                <ScaleDenominator>6.988528300358972E7</ScaleDenominator>
                <TopLeftCorner>90.0 -180.0</TopLeftCorner>
                <TileWidth>256</TileWidth>
                <TileHeight>256</TileHeight>
                <MatrixWidth>8</MatrixWidth>
                <MatrixHeight>4</MatrixHeight>
              </TileMatrix>
            </TileMatrixSet>
            <TileMatrixSet>
              <ows:Identifier>EPSG:900913</ows:Identifier>
              <ows:SupportedCRS>urn:ogc:def:crs:EPSG::900913</ows:SupportedCRS>
              <TileMatrix>
                <ows:Identifier>EPSG:900913:0</ows:Identifier>
                <ScaleDenominator>5.590822639508929E8</ScaleDenominator>
                <TopLeftCorner>-2.003750834E7 2.0037508E7</TopLeftCorner>
                <TileWidth>256</TileWidth>
                <TileHeight>256</TileHeight>
                <MatrixWidth>1</MatrixWidth>
                <MatrixHeight>1</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
                <ows:Identifier>EPSG:900913:1</ows:Identifier>
                <ScaleDenominator>2.7954113197544646E8</ScaleDenominator>
                <TopLeftCorner>-2.003750834E7 2.0037508E7</TopLeftCorner>
                <TileWidth>256</TileWidth>
                <TileHeight>256</TileHeight>
                <MatrixWidth>2</MatrixWidth>
                <MatrixHeight>2</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
                <ows:Identifier>EPSG:900913:2</ows:Identifier>
                <ScaleDenominator>1.3977056598772323E8</ScaleDenominator>
                <TopLeftCorner>-2.003750834E7 2.0037508E7</TopLeftCorner>
                <TileWidth>256</TileWidth>
                <TileHeight>256</TileHeight>
                <MatrixWidth>4</MatrixWidth>
                <MatrixHeight>4</MatrixHeight>
              </TileMatrix>
            </TileMatrixSet>
          </Contents>
          <ServiceMetadataURL xlink:href="/geoserver/topp/states/gwc/service/wmts?SERVICE=wmts&amp;REQUEST=getcapabilities&amp;VERSION=1.0.0"/>
          <ServiceMetadataURL xlink:href="/geoserver/topp/states/gwc/service/wmts/rest/WMTSCapabilities.xml"/>
        </Capabilities>`);
        ReactDOM.render(<WMSCacheOptions
            layer={{
                url: '/geoserver/wms',
                name: 'topp:states'
            }}
            projection="EPSG:3857"
            onChange={(options) => {
                try {
                    expect(options).toEqual({
                        tileGridStrategy: 'custom',
                        tileGrids: [{
                            id: 'EPSG:4326',
                            crs: 'EPSG:4326',
                            scales: [279541132.0143589, 139770566.00717944, 69885283.00358972],
                            origin: [90, -180],
                            tileSize: [256, 256]
                        },
                        {
                            id: 'EPSG:900913',
                            crs: 'EPSG:900913',
                            scales: [559082263.9508929, 279541131.97544646, 139770565.98772323],
                            origin: [-20037508.34, 20037508],
                            tileSize: [256, 256]
                        }],
                        tileGridCacheSupport: {
                            formats: ['image/png', 'image/jpeg']
                        }
                    });
                } catch (e) {
                    done(e);
                }
                done();
            }}
        />, document.getElementById('container'));
        expect(document.querySelector('.ms-wms-cache-options')).toBeTruthy();
        const inputs = document.querySelectorAll('input[type="checkbox"]');
        expect(inputs.length).toBe(1);
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(2);
        expect([...buttons].map(button => button.querySelector('.glyphicon').getAttribute('class'))).toEqual([
            'glyphicon glyphicon-refresh',
            'glyphicon glyphicon-grid-regular'
        ]);

        Simulate.click(buttons[1]);

    });
    it('should request tile grids (warning no available tile grids)', (done) => {
        mockAxios.onGet().reply(200, `<?xml version="1.0" encoding="UTF-8"?>
        <Capabilities xmlns="http://www.opengis.net/wmts/1.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:gml="http://www.opengis.net/gml" xsi:schemaLocation="http://www.opengis.net/wmts/1.0 http://schemas.opengis.net/wmts/1.0/wmtsGetCapabilities_response.xsd" version="1.0.0">
          <Contents>
            <Layer>
              <ows:Title>USA Population</ows:Title>
              <ows:Abstract>This is some census data on the states.</ows:Abstract>
              <ows:WGS84BoundingBox>
                <ows:LowerCorner>-124.73142200000001 24.955967</ows:LowerCorner>
                <ows:UpperCorner>-66.969849 49.371735</ows:UpperCorner>
              </ows:WGS84BoundingBox>
              <ows:Identifier>states</ows:Identifier>
              <Style isDefault="true">
                <ows:Identifier>population</ows:Identifier>
                <LegendURL format="image/png" xlink:href="/geoserver/topp/states/ows?service=WMS&amp;request=GetLegendGraphic&amp;format=image%2Fpng&amp;width=20&amp;height=20&amp;layer=topp%3Astates" width="20" height="20"/>
              </Style>
              <Format>image/png</Format>
              <Format>image/jpeg</Format>
              <InfoFormat>text/plain</InfoFormat>
              <InfoFormat>application/vnd.ogc.gml</InfoFormat>
              <InfoFormat>text/xml</InfoFormat>
              <InfoFormat>application/vnd.ogc.gml/3.1.1</InfoFormat>
              <InfoFormat>text/xml</InfoFormat>
              <InfoFormat>text/html</InfoFormat>
              <InfoFormat>application/json</InfoFormat>
              <TileMatrixSetLink>
                <TileMatrixSet>EPSG:32122</TileMatrixSet>
              </TileMatrixSetLink>
            </Layer>
            <TileMatrixSet>
              <ows:Identifier>EPSG:32122</ows:Identifier>
              <ows:SupportedCRS>urn:ogc:def:crs:EPSG::32122</ows:SupportedCRS>
              <TileMatrix>
                <ows:Identifier>EPSG:32122:0</ows:Identifier>
                <ScaleDenominator>2557541.55271451</ScaleDenominator>
                <TopLeftCorner>403035.4105968763 414783.0</TopLeftCorner>
                <TileWidth>512</TileWidth>
                <TileHeight>512</TileHeight>
                <MatrixWidth>1</MatrixWidth>
                <MatrixHeight>1</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
                <ows:Identifier>EPSG:32122:1</ows:Identifier>
                <ScaleDenominator>1278770.776357255</ScaleDenominator>
                <TopLeftCorner>403035.4105968763 414783.0</TopLeftCorner>
                <TileWidth>512</TileWidth>
                <TileHeight>512</TileHeight>
                <MatrixWidth>2</MatrixWidth>
                <MatrixHeight>2</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
                <ows:Identifier>EPSG:32122:2</ows:Identifier>
                <ScaleDenominator>639385.3881786275</ScaleDenominator>
                <TopLeftCorner>403035.4105968763 323121.0</TopLeftCorner>
                <TileWidth>512</TileWidth>
                <TileHeight>512</TileHeight>
                <MatrixWidth>4</MatrixWidth>
                <MatrixHeight>3</MatrixHeight>
              </TileMatrix>
            </TileMatrixSet>
          </Contents>
          <ServiceMetadataURL xlink:href="/geoserver/topp/states/gwc/service/wmts?SERVICE=wmts&amp;REQUEST=getcapabilities&amp;VERSION=1.0.0"/>
          <ServiceMetadataURL xlink:href="/geoserver/topp/states/gwc/service/wmts/rest/WMTSCapabilities.xml"/>
        </Capabilities>`);
        ReactDOM.render(<WMSCacheOptions
            layer={{
                url: '/geoserver/wms',
                name: 'topp:states'
            }}
            projection="EPSG:3857"
            onChange={(options) => {
                try {
                    expect(options).toEqual({ tileGridStrategy: undefined, tileGrids: [], tileGridCacheSupport: undefined });
                    const alert = document.querySelector('.alert');
                    expect(alert.innerText).toBe('layerProperties.noConfiguredGridSets');
                } catch (e) {
                    done(e);
                }
                done();
            }}
        />, document.getElementById('container'));
        expect(document.querySelector('.ms-wms-cache-options')).toBeTruthy();
        const inputs = document.querySelectorAll('input[type="checkbox"]');
        expect(inputs.length).toBe(1);
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(2);
        expect([...buttons].map(button => button.querySelector('.glyphicon').getAttribute('class'))).toEqual([
            'glyphicon glyphicon-refresh',
            'glyphicon glyphicon-grid-regular'
        ]);

        Simulate.click(buttons[1]);

    });
    it('should request tile grids (error)', (done) => {
        mockAxios.onGet().reply(500);
        ReactDOM.render(<WMSCacheOptions
            layer={{
                url: '/geoserver/wms',
                name: 'topp:states'
            }}
            projection="EPSG:3857"
            onChange={(options) => {
                try {
                    expect(options).toEqual({
                        tileGridStrategy: undefined,
                        tileGrids: undefined,
                        tileGridCacheSupport: undefined
                    });
                    const alert = document.querySelector('.alert');
                    expect(alert.innerText).toBe('layerProperties.notPossibleToConnectToWMTSService');
                } catch (e) {
                    done(e);
                }
                done();
            }}
        />, document.getElementById('container'));
        expect(document.querySelector('.ms-wms-cache-options')).toBeTruthy();
        const inputs = document.querySelectorAll('input[type="checkbox"]');
        expect(inputs.length).toBe(1);
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(2);
        expect([...buttons].map(button => button.querySelector('.glyphicon').getAttribute('class'))).toEqual([
            'glyphicon glyphicon-refresh',
            'glyphicon glyphicon-grid-regular'
        ]);

        Simulate.click(buttons[1]);
    });
    it('should refresh the tile grids and trigger the onChange', (done) => {
        mockAxios.onGet().reply(200, `<?xml version="1.0" encoding="UTF-8"?>
        <Capabilities xmlns="http://www.opengis.net/wmts/1.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:gml="http://www.opengis.net/gml" xsi:schemaLocation="http://www.opengis.net/wmts/1.0 http://schemas.opengis.net/wmts/1.0/wmtsGetCapabilities_response.xsd" version="1.0.0">
          <Contents>
            <Layer>
              <ows:Title>USA Population</ows:Title>
              <ows:Abstract>This is some census data on the states.</ows:Abstract>
              <ows:WGS84BoundingBox>
                <ows:LowerCorner>-124.73142200000001 24.955967</ows:LowerCorner>
                <ows:UpperCorner>-66.969849 49.371735</ows:UpperCorner>
              </ows:WGS84BoundingBox>
              <ows:Identifier>states</ows:Identifier>
              <Style isDefault="true">
                <ows:Identifier>population</ows:Identifier>
                <LegendURL format="image/png" xlink:href="/geoserver/topp/states/ows?service=WMS&amp;request=GetLegendGraphic&amp;format=image%2Fpng&amp;width=20&amp;height=20&amp;layer=topp%3Astates" width="20" height="20"/>
              </Style>
              <Format>image/png</Format>
              <Format>image/jpeg</Format>
              <InfoFormat>text/plain</InfoFormat>
              <InfoFormat>application/vnd.ogc.gml</InfoFormat>
              <InfoFormat>text/xml</InfoFormat>
              <InfoFormat>application/vnd.ogc.gml/3.1.1</InfoFormat>
              <InfoFormat>text/xml</InfoFormat>
              <InfoFormat>text/html</InfoFormat>
              <InfoFormat>application/json</InfoFormat>
              <TileMatrixSetLink>
                <TileMatrixSet>EPSG:900913</TileMatrixSet>
              </TileMatrixSetLink>
            </Layer>
            <TileMatrixSet>
              <ows:Identifier>EPSG:900913</ows:Identifier>
              <ows:SupportedCRS>urn:ogc:def:crs:EPSG::900913</ows:SupportedCRS>
              <TileMatrix>
                <ows:Identifier>EPSG:900913:0</ows:Identifier>
                <ScaleDenominator>5.590822639508929E8</ScaleDenominator>
                <TopLeftCorner>-2.003750834E7 2.0037508E7</TopLeftCorner>
                <TileWidth>256</TileWidth>
                <TileHeight>256</TileHeight>
                <MatrixWidth>1</MatrixWidth>
                <MatrixHeight>1</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
                <ows:Identifier>EPSG:900913:1</ows:Identifier>
                <ScaleDenominator>2.7954113197544646E8</ScaleDenominator>
                <TopLeftCorner>-2.003750834E7 2.0037508E7</TopLeftCorner>
                <TileWidth>256</TileWidth>
                <TileHeight>256</TileHeight>
                <MatrixWidth>2</MatrixWidth>
                <MatrixHeight>2</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
                <ows:Identifier>EPSG:900913:2</ows:Identifier>
                <ScaleDenominator>1.3977056598772323E8</ScaleDenominator>
                <TopLeftCorner>-2.003750834E7 2.0037508E7</TopLeftCorner>
                <TileWidth>256</TileWidth>
                <TileHeight>256</TileHeight>
                <MatrixWidth>4</MatrixWidth>
                <MatrixHeight>4</MatrixHeight>
              </TileMatrix>
            </TileMatrixSet>
          </Contents>
          <ServiceMetadataURL xlink:href="/geoserver/topp/states/gwc/service/wmts?SERVICE=wmts&amp;REQUEST=getcapabilities&amp;VERSION=1.0.0"/>
          <ServiceMetadataURL xlink:href="/geoserver/topp/states/gwc/service/wmts/rest/WMTSCapabilities.xml"/>
        </Capabilities>`);
        ReactDOM.render(<WMSCacheOptions
            layer={{
                url: '/geoserver/wms',
                name: 'topp:states',
                tileGridStrategy: 'custom',
                tileGrids: [{
                    id: 'EPSG:4326',
                    crs: 'EPSG:4326',
                    scales: [279541132.0143589, 139770566.00717944, 69885283.00358972],
                    origin: [90, -180],
                    tileSize: [256, 256]
                }],
                tileGridCacheSupport: {
                    formats: ['image/png', 'image/jpeg']
                }
            }}
            projection="EPSG:3857"
            onChange={(options) => {
                try {
                    expect(options).toEqual({
                        tileGrids: [{
                            id: 'EPSG:900913',
                            crs: 'EPSG:900913',
                            scales: [559082263.9508929, 279541131.97544646, 139770565.98772323],
                            origin: [-20037508.34, 20037508],
                            tileSize: [256, 256]
                        }],
                        tileGridCacheSupport: {
                            formats: ['image/png', 'image/jpeg']
                        }
                    });
                } catch (e) {
                    done(e);
                }
                done();
            }}
        />, document.getElementById('container'));
        expect(document.querySelector('.ms-wms-cache-options')).toBeTruthy();
        const inputs = document.querySelectorAll('input[type="checkbox"]');
        expect(inputs.length).toBe(1);
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(2);
        expect([...buttons].map(button => button.querySelector('.glyphicon').getAttribute('class'))).toEqual([
            'glyphicon glyphicon-refresh',
            'glyphicon glyphicon-grid-custom'
        ]);

        Simulate.click(buttons[0]);

    });
    it('should display the format cache warning if not listed in the supported ones', () => {
        ReactDOM.render(<WMSCacheOptions layer={{
            url: '/geoserver/wms',
            name: 'topp:states',
            tileGridStrategy: 'custom',
            format: 'image/jpeg',
            tileGridCacheSupport: {
                formats: ['image/png']
            },
            tileGrids: [
                {
                    id: 'EPSG:32122x2',
                    crs: 'EPSG:32122',
                    scales: [2557541.55271451, 1278770.776357255, 639385.3881786275],
                    origins: [[403035.4105968763, 414783], [403035.4105968763, 414783], [403035.4105968763, 323121]],
                    tileSize: [512, 512]
                },
                {
                    id: 'EPSG:900913',
                    crs: 'EPSG:900913',
                    scales: [559082263.9508929, 279541131.97544646, 139770565.98772323],
                    origin: [-20037508.34, 20037508],
                    tileSize: [256, 256]
                }
            ]
        }} projection="EPSG:3857" />, document.getElementById('container'));
        expect(document.querySelector('.ms-wms-cache-options')).toBeTruthy();
        const inputs = document.querySelectorAll('input[type="checkbox"]');
        expect(inputs.length).toBe(1);
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(2);
        expect([...buttons].map(button => button.querySelector('.glyphicon').getAttribute('class'))).toEqual([
            'glyphicon glyphicon-refresh',
            'glyphicon glyphicon-grid-custom'
        ]);
        const info = document.querySelector('.glyphicon-info-sign');
        expect(info).toBeTruthy();
        expect(info.getAttribute('class')).toBe('text-danger glyphicon glyphicon-info-sign');

        let table = document.querySelector('table');
        expect(table).toBeFalsy();

        Simulate.mouseOver(info);

        table = document.querySelector('table');
        expect(table).toBeTruthy();

        const tableRows = table.querySelectorAll('tbody > tr');
        expect([...tableRows].map((row) => row.innerText)).toEqual([
            'EPSG:32122x2\tEPSG:32122\t512',
            'EPSG:900913\tEPSG:900913\t256'
        ]);
        const alert = document.querySelector('.alert');
        expect(alert.innerText).toBe('layerProperties.notSupportedSelectedFormatCache');
    });
    it('should display the custom param cache warning if localized style is enabled', () => {
        ReactDOM.render(<WMSCacheOptions layer={{
            url: '/geoserver/wms',
            name: 'topp:states',
            tileGridStrategy: 'custom',
            localizedLayerStyles: true,
            tileGrids: [
                {
                    id: 'EPSG:32122x2',
                    crs: 'EPSG:32122',
                    scales: [2557541.55271451, 1278770.776357255, 639385.3881786275],
                    origins: [[403035.4105968763, 414783], [403035.4105968763, 414783], [403035.4105968763, 323121]],
                    tileSize: [512, 512]
                },
                {
                    id: 'EPSG:900913',
                    crs: 'EPSG:900913',
                    scales: [559082263.9508929, 279541131.97544646, 139770565.98772323],
                    origin: [-20037508.34, 20037508],
                    tileSize: [256, 256]
                }
            ]
        }} projection="EPSG:3857" />, document.getElementById('container'));
        expect(document.querySelector('.ms-wms-cache-options')).toBeTruthy();
        const inputs = document.querySelectorAll('input[type="checkbox"]');
        expect(inputs.length).toBe(1);
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(2);
        expect([...buttons].map(button => button.querySelector('.glyphicon').getAttribute('class'))).toEqual([
            'glyphicon glyphicon-refresh',
            'glyphicon glyphicon-grid-custom'
        ]);
        const info = document.querySelector('.glyphicon-info-sign');
        expect(info).toBeTruthy();
        expect(info.getAttribute('class')).toBe('text-success glyphicon glyphicon-info-sign');

        let table = document.querySelector('table');
        expect(table).toBeFalsy();

        Simulate.mouseOver(info);

        table = document.querySelector('table');
        expect(table).toBeTruthy();

        const tableRows = table.querySelectorAll('tbody > tr');
        expect([...tableRows].map((row) => row.innerText)).toEqual([
            'EPSG:32122x2\tEPSG:32122\t512',
            'EPSG:900913\tEPSG:900913\t256'
        ]);
        const alert = [...document.querySelectorAll('.alert')];
        expect(alert[0].innerText).toBe('layerProperties.customParamsCacheWarning');
    });
    it('should allow to click the grid button to switch to normal grid', (done) => {
        ReactDOM.render(<WMSCacheOptions
            onChange={(options) => {
                try {
                    expect(options).toEqual({
                        tileGridStrategy: undefined,
                        tileGrids: undefined,
                        tileGridCacheSupport: undefined
                    });
                } catch (e) {
                    done(e);
                }
                done();
            }}
            layer={{
                url: '/geoserver/wms',
                name: 'topp:states',
                tileGridStrategy: 'custom',
                tileGrids: [
                    {
                        id: 'EPSG:32122x2',
                        crs: 'EPSG:32122',
                        scales: [2557541.55271451, 1278770.776357255, 639385.3881786275],
                        origins: [[403035.4105968763, 414783], [403035.4105968763, 414783], [403035.4105968763, 323121]],
                        tileSize: [512, 512]
                    },
                    {
                        id: 'EPSG:900913',
                        crs: 'EPSG:900913',
                        scales: [559082263.9508929, 279541131.97544646, 139770565.98772323],
                        origin: [-20037508.34, 20037508],
                        tileSize: [256, 256]
                    }
                ]
            }} projection="EPSG:3857" />, document.getElementById('container'));
        expect(document.querySelector('.ms-wms-cache-options')).toBeTruthy();
        const inputs = document.querySelectorAll('input[type="checkbox"]');
        expect(inputs.length).toBe(1);
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(2);
        expect([...buttons].map(button => button.querySelector('.glyphicon').getAttribute('class'))).toEqual([
            'glyphicon glyphicon-refresh',
            'glyphicon glyphicon-grid-custom'
        ]);
        Simulate.click(buttons[1]);

    });
    it('should check tile grids with standard strategy (success)', (done) => {
        mockAxios.onGet().reply(200, `<?xml version="1.0" encoding="UTF-8"?>
        <Capabilities xmlns="http://www.opengis.net/wmts/1.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:gml="http://www.opengis.net/gml" xsi:schemaLocation="http://www.opengis.net/wmts/1.0 http://schemas.opengis.net/wmts/1.0/wmtsGetCapabilities_response.xsd" version="1.0.0">
          <Contents>
            <Layer>
              <ows:Title>USA Population</ows:Title>
              <ows:Abstract>This is some census data on the states.</ows:Abstract>
              <ows:WGS84BoundingBox>
                <ows:LowerCorner>-124.73142200000001 24.955967</ows:LowerCorner>
                <ows:UpperCorner>-66.969849 49.371735</ows:UpperCorner>
              </ows:WGS84BoundingBox>
              <ows:Identifier>states</ows:Identifier>
              <Style isDefault="true">
                <ows:Identifier>population</ows:Identifier>
                <LegendURL format="image/png" xlink:href="/geoserver/topp/states/ows?service=WMS&amp;request=GetLegendGraphic&amp;format=image%2Fpng&amp;width=20&amp;height=20&amp;layer=topp%3Astates" width="20" height="20"/>
              </Style>
              <Format>image/png</Format>
              <Format>image/jpeg</Format>
              <InfoFormat>text/plain</InfoFormat>
              <InfoFormat>application/vnd.ogc.gml</InfoFormat>
              <InfoFormat>text/xml</InfoFormat>
              <InfoFormat>application/vnd.ogc.gml/3.1.1</InfoFormat>
              <InfoFormat>text/xml</InfoFormat>
              <InfoFormat>text/html</InfoFormat>
              <InfoFormat>application/json</InfoFormat>
              <TileMatrixSetLink>
                <TileMatrixSet>EPSG:32122</TileMatrixSet>
              </TileMatrixSetLink>
              <TileMatrixSetLink>
                <TileMatrixSet>EPSG:4326</TileMatrixSet>
              </TileMatrixSetLink>
              <TileMatrixSetLink>
                <TileMatrixSet>EPSG:900913</TileMatrixSet>
              </TileMatrixSetLink>
            </Layer>
            <TileMatrixSet>
              <ows:Identifier>EPSG:32122</ows:Identifier>
              <ows:SupportedCRS>urn:ogc:def:crs:EPSG::32122</ows:SupportedCRS>
              <TileMatrix>
                <ows:Identifier>EPSG:32122:0</ows:Identifier>
                <ScaleDenominator>2557541.55271451</ScaleDenominator>
                <TopLeftCorner>403035.4105968763 414783.0</TopLeftCorner>
                <TileWidth>512</TileWidth>
                <TileHeight>512</TileHeight>
                <MatrixWidth>1</MatrixWidth>
                <MatrixHeight>1</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
                <ows:Identifier>EPSG:32122:1</ows:Identifier>
                <ScaleDenominator>1278770.776357255</ScaleDenominator>
                <TopLeftCorner>403035.4105968763 414783.0</TopLeftCorner>
                <TileWidth>512</TileWidth>
                <TileHeight>512</TileHeight>
                <MatrixWidth>2</MatrixWidth>
                <MatrixHeight>2</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
                <ows:Identifier>EPSG:32122:2</ows:Identifier>
                <ScaleDenominator>639385.3881786275</ScaleDenominator>
                <TopLeftCorner>403035.4105968763 323121.0</TopLeftCorner>
                <TileWidth>512</TileWidth>
                <TileHeight>512</TileHeight>
                <MatrixWidth>4</MatrixWidth>
                <MatrixHeight>3</MatrixHeight>
              </TileMatrix>
            </TileMatrixSet>
            <TileMatrixSet>
              <ows:Identifier>EPSG:4326</ows:Identifier>
              <ows:SupportedCRS>urn:ogc:def:crs:EPSG::4326</ows:SupportedCRS>
              <TileMatrix>
                <ows:Identifier>EPSG:4326:0</ows:Identifier>
                <ScaleDenominator>2.795411320143589E8</ScaleDenominator>
                <TopLeftCorner>90.0 -180.0</TopLeftCorner>
                <TileWidth>256</TileWidth>
                <TileHeight>256</TileHeight>
                <MatrixWidth>2</MatrixWidth>
                <MatrixHeight>1</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
                <ows:Identifier>EPSG:4326:1</ows:Identifier>
                <ScaleDenominator>1.3977056600717944E8</ScaleDenominator>
                <TopLeftCorner>90.0 -180.0</TopLeftCorner>
                <TileWidth>256</TileWidth>
                <TileHeight>256</TileHeight>
                <MatrixWidth>4</MatrixWidth>
                <MatrixHeight>2</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
                <ows:Identifier>EPSG:4326:2</ows:Identifier>
                <ScaleDenominator>6.988528300358972E7</ScaleDenominator>
                <TopLeftCorner>90.0 -180.0</TopLeftCorner>
                <TileWidth>256</TileWidth>
                <TileHeight>256</TileHeight>
                <MatrixWidth>8</MatrixWidth>
                <MatrixHeight>4</MatrixHeight>
              </TileMatrix>
            </TileMatrixSet>
            <TileMatrixSet>
              <ows:Identifier>EPSG:900913</ows:Identifier>
              <ows:SupportedCRS>urn:ogc:def:crs:EPSG::900913</ows:SupportedCRS>
              <TileMatrix>
                <ows:Identifier>EPSG:900913:0</ows:Identifier>
                <ScaleDenominator>5.590822639508929E8</ScaleDenominator>
                <TopLeftCorner>-2.003750834E7 2.0037508E7</TopLeftCorner>
                <TileWidth>256</TileWidth>
                <TileHeight>256</TileHeight>
                <MatrixWidth>1</MatrixWidth>
                <MatrixHeight>1</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
                <ows:Identifier>EPSG:900913:1</ows:Identifier>
                <ScaleDenominator>2.7954113197544646E8</ScaleDenominator>
                <TopLeftCorner>-2.003750834E7 2.0037508E7</TopLeftCorner>
                <TileWidth>256</TileWidth>
                <TileHeight>256</TileHeight>
                <MatrixWidth>2</MatrixWidth>
                <MatrixHeight>2</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
                <ows:Identifier>EPSG:900913:2</ows:Identifier>
                <ScaleDenominator>1.3977056598772323E8</ScaleDenominator>
                <TopLeftCorner>-2.003750834E7 2.0037508E7</TopLeftCorner>
                <TileWidth>256</TileWidth>
                <TileHeight>256</TileHeight>
                <MatrixWidth>4</MatrixWidth>
                <MatrixHeight>4</MatrixHeight>
              </TileMatrix>
            </TileMatrixSet>
          </Contents>
          <ServiceMetadataURL xlink:href="/geoserver/topp/states/gwc/service/wmts?SERVICE=wmts&amp;REQUEST=getcapabilities&amp;VERSION=1.0.0"/>
          <ServiceMetadataURL xlink:href="/geoserver/topp/states/gwc/service/wmts/rest/WMTSCapabilities.xml"/>
        </Capabilities>`);
        ReactDOM.render(<WMSCacheOptions
            layer={{
                url: '/geoserver/wms',
                name: 'topp:states',
                format: 'image/png',
                style: 'population'
            }}
            projection="EPSG:3857"
        />, document.getElementById('container'));
        expect(document.querySelector('.ms-wms-cache-options')).toBeTruthy();
        const inputs = document.querySelectorAll('input[type="checkbox"]');
        expect(inputs.length).toBe(1);
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(2);
        expect([...buttons].map(button => button.querySelector('.glyphicon').getAttribute('class'))).toEqual([
            'glyphicon glyphicon-refresh',
            'glyphicon glyphicon-grid-regular'
        ]);

        Simulate.click(buttons[0]);

        waitFor(() => expect(document.querySelector('.glyphicon-info-sign')).toBeTruthy())
            .then(() => {

                const info = document.querySelector('.glyphicon-info-sign');
                expect(info).toBeTruthy();
                expect(info.getAttribute('class')).toBe('text-success glyphicon glyphicon-info-sign');

                const table = document.querySelector('table');
                expect(table).toBeFalsy();

                Simulate.mouseOver(info);

                const tables = document.querySelectorAll('table');
                expect(tables.length).toBe(3);

                expect([...tables[0].querySelectorAll('tbody > tr')].map((row) => [row.querySelector('.glyphicon').getAttribute('class'), row.innerText])).toEqual([
                    [ 'text-success glyphicon glyphicon-ok-sign', 'layerProperties.projection' ],
                    [ 'text-success glyphicon glyphicon-ok-sign', 'layerProperties.tileSize' ],
                    [ 'text-success glyphicon glyphicon-ok-sign', 'layerProperties.format.title' ]
                ]);

                expect([...tables[1].querySelectorAll('tbody > tr')].map((row) => [...row.querySelectorAll('td')].map(data => [data.getAttribute('class') || '', data.innerText]))).toEqual([
                    [ [ '', 'EPSG:4326' ], [ ' ', 'EPSG:4326' ], [ '', '256' ] ],
                    [ [ '', 'EPSG:900913' ], [ ' bg-success', 'EPSG:900913' ], [ 'bg-success', '256' ] ] ]);

                expect([...tables[2].querySelectorAll('tbody > tr')].map((row) => [row.getAttribute('class') || '', row.innerText])).toEqual([
                    [ 'bg-success', 'image/png' ],
                    [ '', 'image/jpeg' ]
                ]);

                done();
            })
            .catch(done);

    });
    it('should check tile grids with standard strategy (success/mismatch)', (done) => {
        mockAxios.onGet().reply(200, `<?xml version="1.0" encoding="UTF-8"?>
        <Capabilities xmlns="http://www.opengis.net/wmts/1.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:gml="http://www.opengis.net/gml" xsi:schemaLocation="http://www.opengis.net/wmts/1.0 http://schemas.opengis.net/wmts/1.0/wmtsGetCapabilities_response.xsd" version="1.0.0">
          <Contents>
            <Layer>
              <ows:Title>USA Population</ows:Title>
              <ows:Abstract>This is some census data on the states.</ows:Abstract>
              <ows:WGS84BoundingBox>
                <ows:LowerCorner>-124.73142200000001 24.955967</ows:LowerCorner>
                <ows:UpperCorner>-66.969849 49.371735</ows:UpperCorner>
              </ows:WGS84BoundingBox>
              <ows:Identifier>states</ows:Identifier>
              <Style isDefault="true">
                <ows:Identifier>population</ows:Identifier>
                <LegendURL format="image/png" xlink:href="/geoserver/topp/states/ows?service=WMS&amp;request=GetLegendGraphic&amp;format=image%2Fpng&amp;width=20&amp;height=20&amp;layer=topp%3Astates" width="20" height="20"/>
              </Style>
              <Format>image/png</Format>
              <Format>image/jpeg</Format>
              <InfoFormat>text/plain</InfoFormat>
              <InfoFormat>application/vnd.ogc.gml</InfoFormat>
              <InfoFormat>text/xml</InfoFormat>
              <InfoFormat>application/vnd.ogc.gml/3.1.1</InfoFormat>
              <InfoFormat>text/xml</InfoFormat>
              <InfoFormat>text/html</InfoFormat>
              <InfoFormat>application/json</InfoFormat>
              <TileMatrixSetLink>
                <TileMatrixSet>EPSG:4326</TileMatrixSet>
              </TileMatrixSetLink>
            </Layer>
            <TileMatrixSet>
              <ows:Identifier>EPSG:4326</ows:Identifier>
              <ows:SupportedCRS>urn:ogc:def:crs:EPSG::4326</ows:SupportedCRS>
              <TileMatrix>
                <ows:Identifier>EPSG:4326:0</ows:Identifier>
                <ScaleDenominator>2.795411320143589E8</ScaleDenominator>
                <TopLeftCorner>90.0 -180.0</TopLeftCorner>
                <TileWidth>256</TileWidth>
                <TileHeight>256</TileHeight>
                <MatrixWidth>2</MatrixWidth>
                <MatrixHeight>1</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
                <ows:Identifier>EPSG:4326:1</ows:Identifier>
                <ScaleDenominator>1.3977056600717944E8</ScaleDenominator>
                <TopLeftCorner>90.0 -180.0</TopLeftCorner>
                <TileWidth>256</TileWidth>
                <TileHeight>256</TileHeight>
                <MatrixWidth>4</MatrixWidth>
                <MatrixHeight>2</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
                <ows:Identifier>EPSG:4326:2</ows:Identifier>
                <ScaleDenominator>6.988528300358972E7</ScaleDenominator>
                <TopLeftCorner>90.0 -180.0</TopLeftCorner>
                <TileWidth>256</TileWidth>
                <TileHeight>256</TileHeight>
                <MatrixWidth>8</MatrixWidth>
                <MatrixHeight>4</MatrixHeight>
              </TileMatrix>
            </TileMatrixSet>
          </Contents>
          <ServiceMetadataURL xlink:href="/geoserver/topp/states/gwc/service/wmts?SERVICE=wmts&amp;REQUEST=getcapabilities&amp;VERSION=1.0.0"/>
          <ServiceMetadataURL xlink:href="/geoserver/topp/states/gwc/service/wmts/rest/WMTSCapabilities.xml"/>
        </Capabilities>`);
        ReactDOM.render(<WMSCacheOptions
            layer={{
                url: '/geoserver/wms',
                name: 'topp:states',
                format: 'image/gif',
                style: 'population',
                tileSize: 512
            }}
            projection="EPSG:4326"
        />, document.getElementById('container'));
        expect(document.querySelector('.ms-wms-cache-options')).toBeTruthy();
        const inputs = document.querySelectorAll('input[type="checkbox"]');
        expect(inputs.length).toBe(1);
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(2);
        expect([...buttons].map(button => button.querySelector('.glyphicon').getAttribute('class'))).toEqual([
            'glyphicon glyphicon-refresh',
            'glyphicon glyphicon-grid-regular'
        ]);

        Simulate.click(buttons[0]);

        waitFor(() => expect(document.querySelector('.glyphicon-info-sign')).toBeTruthy())
            .then(() => {

                const info = document.querySelector('.glyphicon-info-sign');
                expect(info).toBeTruthy();
                expect(info.getAttribute('class')).toBe('text-danger glyphicon glyphicon-info-sign');

                const table = document.querySelector('table');
                expect(table).toBeFalsy();

                Simulate.mouseOver(info);

                const tables = document.querySelectorAll('table');
                expect(tables.length).toBe(3);

                expect([...tables[0].querySelectorAll('tbody > tr')].map((row) => [row.querySelector('.glyphicon').getAttribute('class'), row.innerText])).toEqual([
                    [ 'text-success glyphicon glyphicon-ok-sign', 'layerProperties.projection' ],
                    [ 'text-danger glyphicon glyphicon-remove-sign', 'layerProperties.tileSize' ],
                    [ 'text-danger glyphicon glyphicon-remove-sign', 'layerProperties.format.title' ]
                ]);

                expect([...tables[1].querySelectorAll('tbody > tr')].map((row) => [...row.querySelectorAll('td')].map(data => [data.getAttribute('class') || '', data.innerText]))).toEqual([
                    [ [ '', 'EPSG:4326' ], [ 'bg-success ', 'EPSG:4326' ], [ '', '256' ] ]
                ]);

                expect([...tables[2].querySelectorAll('tbody > tr')].map((row) => [row.getAttribute('class') || '', row.innerText])).toEqual([
                    [ '', 'image/png' ],
                    [ '', 'image/jpeg' ]
                ]);

                done();
            })
            .catch(done);

    });
});

