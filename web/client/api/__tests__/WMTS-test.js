/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import API, { getLayerTileMatrixSetsInfo } from '../WMTS';
import { getGetTileURL } from '../../utils/WMTSUtils';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../libs/ajax';
let mockAxios;

describe('Test correctness of the WMTS APIs', () => {
    it('GetRecords KVP', (done) => {
        API.getRecords('base/web/client/test-resources/wmts/GetCapabilities-1.0.0.xml', 0, 3, '').then((result) => {
            try {
                expect(result).toExist();
                expect(result.numberOfRecordsMatched).toBe(3);
                expect(result.records[0].style).toBe("");
                result.records.map(record => {
                    expect(record.requestEncoding).toBe('KVP');
                    expect(record.queryable).toBe(true);
                    expect(record.GetTileURL).toBe("http://sample.server/geoserver/gwc/service/wmts?");
                    expect(getGetTileURL(record)).toBe(record.GetTileURL);
                });

                expect(result.records[0].format).toBe("image/png");
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('GetRecords RESTful', (done) => {
        API.getRecords('base/web/client/test-resources/wmts/GetCapabilities-rest.xml', 0, 7, '').then((result) => {
            try {
                expect(result).toExist();
                expect(result.numberOfRecordsMatched).toBe(7);
                // all records should be RESTful with same GetTileURL
                result.records.map(record => {
                    expect(record.requestEncoding).toBe('RESTful');
                    expect(record.queryable).toBe(false);
                    expect(getGetTileURL(record)).toEqual(record.ResourceURL.map(({$: v}) => v.template));
                });
                expect(result.records[0].style).toBe("normal");
                expect(result.records[0].format).toBe("image/png");
                expect(result.records[1].style).toBe("normal");
                expect(result.records[1].style).toBe("normal");
                expect(result.records[4].format).toBe("image/jpeg");

                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('GetRecords KVP for GeoServer 2.15', (done) => {
        // GS 2.15 has ResourceURLs together with KVP. This checks that the proper URL is returned by getTileURL, used to generate the layer. See #3796
        API.getRecords('base/web/client/test-resources/wmts/GetCapabilities-1.0.0_gs_2.15.xml', 0, 3, '').then((result) => {
            try {
                expect(result).toExist();
                expect(result.numberOfRecordsMatched).toBe(3);
                expect(result.records[0].style).toBe("");
                result.records.map(record => {
                    expect(record.requestEncoding).toBe('KVP');
                    expect(record.queryable).toBe(true);
                    expect(record.GetTileURL).toBe("http://sample.server/geoserver/gwc/service/wmts?");
                    expect(getGetTileURL(record)).toBe(record.GetTileURL);
                });
                expect(result.records[0].format).toBe("image/png");
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
});

describe('Test correctness of the WMTS APIs (mock axios)', () => {
    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach(done => {
        API.reset();
        mockAxios.restore();
        setTimeout(done);
    });

    it('getLayerTileMatrixSetsInfo', (done) => {
        mockAxios.onGet(/\/geoserver/).reply(200, `<?xml version="1.0" encoding="UTF-8"?>
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
        const url = '/geoserver/topp/states/gwc/service/wmts';
        const layerName = 'topp:states';
        getLayerTileMatrixSetsInfo(url, layerName)
            .then((response) => {
                expect(response.tileGrids.length).toBe(2);
                expect(response.tileGrids).toEqual([
                    {
                        id: 'EPSG:32122',
                        crs: 'EPSG:32122',
                        scales: [ 2557541.55271451, 1278770.776357255, 639385.3881786275 ],
                        origins: [ [ 403035.4105968763, 414783 ], [ 403035.4105968763, 414783 ], [ 403035.4105968763, 323121 ] ],
                        tileSize: [ 512, 512 ]
                    },
                    {
                        id: 'EPSG:900913',
                        crs: 'EPSG:900913',
                        scales: [ 559082263.9508929, 279541131.97544646, 139770565.98772323 ],
                        origin: [ -20037508.34, 20037508 ],
                        tileSize: [ 256, 256 ]
                    }
                ]);
                expect(response.styles.length).toBe(1);
                expect(response.styles).toEqual(['population']);
                expect(response.formats.length).toBe(2);
                expect(response.formats).toEqual(['image/png', 'image/jpeg']);
                done();
            })
            .catch(done);
    });
});
