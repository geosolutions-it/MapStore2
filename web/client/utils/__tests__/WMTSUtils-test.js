/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import xml2js from 'xml2js';
import * as WMTSUtils from '../WMTSUtils';
import restCapabilities from 'raw-loader!../../test-resources/wmts/GetCapabilities-rest.xml';
import kvpCapabilities from 'raw-loader!../../test-resources/wmts/GetCapabilities-1.0.0.xml';

describe('Test the WMTSUtils', () => {
    it('get matrix ids with object', () => {
        const ids = WMTSUtils.getMatrixIds({
            "EPSG:4326": [{
                identifier: 'EPSG:4326'
            }]
        }, 'EPSG:4326');
        expect(ids.length).toBe(1);
        expect(ids[0].identifier).toBe('EPSG:4326');
    });

    it('get matrix ids with array', () => {
        const ids = WMTSUtils.getMatrixIds([{
            identifier: 'EPSG:4326'
        }], 'EPSG:4326');
        expect(ids.length).toBe(1);
        expect(ids[0].identifier).toBe('EPSG:4326');
    });

    it('wmts kvp', (done) => {
        xml2js.parseString(kvpCapabilities, { explicitArray: false }, (ignore, json) => {
            const operations = WMTSUtils.getOperations(json);
            const kvpOperation = WMTSUtils.getOperation(operations, "GetTile", "KVP");
            expect(kvpOperation).toBe("http://sample.server/geoserver/gwc/service/wmts?");
            expect(WMTSUtils.getOperation(operations, "GetTile", "RESTful")).toNotExist();
            expect(WMTSUtils.getRequestEncoding(json)).toBe("KVP");
            done();
        });
    });
    it('wmts rest', (done) => {
        xml2js.parseString(restCapabilities, { explicitArray: false }, (ignore, json) => {
            const operations = WMTSUtils.getOperations(json);
            const kvpOperation = WMTSUtils.getOperation(operations, "GetTile", "KVP");
            expect(kvpOperation).toNotExist();
            expect(WMTSUtils.getOperation(operations, "GetTile", "RESTful")).toBe("https://maps.sampleServer.org/basemap");
            const tileURLs = WMTSUtils.getGetTileURL(json.Capabilities.Contents.Layer[0]);
            expect(tileURLs).toExist();
            expect(tileURLs.length).toBe(5);
            expect(tileURLs[0]).toBe("https://maps1.sampleServer.org/basemap/geolandbasemap/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png");
            done();
        });
    });
    it('parseTileMatrixSetOption', () => {
        const layer = WMTSUtils.parseTileMatrixSetOption({
            availableTileMatrixSets: {
                'EPSG:4326': {
                    crs: 'EPSG:4326',
                    limits: [
                        {
                            "identifier": "EPSG:4326:0",
                            "ranges": {
                                "cols": {
                                    "min": "0",
                                    "max": "0"
                                },
                                "rows": {
                                    "min": "0",
                                    "max": "0"
                                }
                            }
                        }
                    ],
                    tileMatrixSet: {
                        'TileMatrix': [{
                            'ows:Identifier': 'EPSG:4326:0'
                        }],
                        'ows:Identifier': "EPSG:4326",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                    }
                },
                'custom': {
                    crs: 'EPSG::900913',
                    tileMatrixSet: {
                        'TileMatrix': [{
                            'ows:Identifier': 'custom:0'
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }
                }
            }
        });
        expect(layer.matrixIds).toEqual({
            'EPSG:4326': [ { identifier: 'EPSG:4326:0', ranges: { cols: { min: '0', max: '0' }, rows: { min: '0', max: '0' } } } ],
            'custom': [ { identifier: 'custom:0' } ],
            'EPSG::900913': [ { identifier: 'custom:0' } ]
        });
        expect(layer.tileMatrixSet).toEqual([
            {
                'TileMatrix': [{
                    'ows:Identifier': 'EPSG:4326:0'
                }],
                'ows:Identifier': "EPSG:4326",
                'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
            },
            {
                'TileMatrix': [{
                    'ows:Identifier': 'custom:0'
                }],
                'ows:Identifier': "custom",
                'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
            }
        ]);
    });
    it('parseTileMatrixSetOption and getTileMatrix with shared CRS', () => {
        const options = {
            availableTileMatrixSets: {
                'EPSG:4326': {
                    crs: 'EPSG:4326',
                    tileMatrixSet: {
                        'TileMatrix': [{
                            'ows:Identifier': 'EPSG:4326:0',
                            'ScaleDenominator': '279541132.0143589'
                        }],
                        'ows:Identifier': 'EPSG:4326',
                        'ows:SupportedCRS': 'urn:ogc:def:crs:EPSG::4326'
                    }
                },
                'GlobalCRS84Geometric': {
                    crs: 'EPSG:4326',
                    tileMatrixSet: {
                        'TileMatrix': [{
                            'ows:Identifier': 'GlobalCRS84Geometric:0',
                            'ScaleDenominator': '279541132.0143589'
                        }],
                        'ows:Identifier': 'GlobalCRS84Geometric',
                        'ows:SupportedCRS': 'urn:ogc:def:crs:EPSG::4326'
                    }
                },
                'GridA': {
                    crs: 'EPSG:3857',
                    tileMatrixSet: {
                        'TileMatrix': [{
                            'ows:Identifier': 'GridA:0',
                            'ScaleDenominator': '559082264.0287178'
                        }],
                        'ows:Identifier': 'GridA',
                        'ows:SupportedCRS': 'urn:ogc:def:crs:EPSG::3857'
                    }
                },
                'GridB': {
                    crs: 'EPSG:3857',
                    tileMatrixSet: {
                        'TileMatrix': [{
                            'ows:Identifier': 'GridB:0',
                            'ScaleDenominator': '559082264.0287178'
                        }],
                        'ows:Identifier': 'GridB',
                        'ows:SupportedCRS': 'urn:ogc:def:crs:EPSG::3857'
                    }
                }
            }
        };
        const parsed = WMTSUtils.parseTileMatrixSetOption(options);
        expect(parsed.matrixIds['EPSG:4326']).toEqual([{ identifier: 'EPSG:4326:0' }]);
        expect(parsed.matrixIds.GlobalCRS84Geometric).toEqual([{ identifier: 'GlobalCRS84Geometric:0' }]);
        expect(parsed.matrixIds['EPSG:3857']).toEqual([{ identifier: 'GridA:0' }]);

        const { tileMatrixSetName, tileMatrixSet, matrixIds } = WMTSUtils.getTileMatrix(options, 'EPSG:4326');
        expect(tileMatrixSetName).toBe('EPSG:4326');
        expect(tileMatrixSet.TileMatrix.length).toBe(1);
        expect(tileMatrixSet.TileMatrix[0]['ows:Identifier']).toBe('EPSG:4326:0');
        expect(matrixIds).toEqual([{ identifier: 'EPSG:4326:0' }]);
    });
    it('sortTileMatrix handles empty ids and string ids', () => {
        const tms = {
            'ows:Identifier': 'EPSG:4326',
            TileMatrix: [
                { 'ows:Identifier': 'EPSG:4326:1', ScaleDenominator: '1000' },
                { 'ows:Identifier': 'EPSG:4326:0', ScaleDenominator: '2000' }
            ]
        };
        const withEmptyIds = WMTSUtils.sortTileMatrix(tms, []);
        expect(withEmptyIds.TileMatrix.map(t => t['ows:Identifier'])).toEqual(['EPSG:4326:0', 'EPSG:4326:1']);

        const withStringIds = WMTSUtils.sortTileMatrix(tms, ['EPSG:4326:1']);
        expect(withStringIds.TileMatrix.map(t => t['ows:Identifier'])).toEqual(['EPSG:4326:1']);
    });
    describe('getDefaultStyleIdentifier', () => {
        it('tests fetching the style when it is missing', () => {
            let style = WMTSUtils.getDefaultStyleIdentifier({});
            expect(style).toBeFalsy();
            style = WMTSUtils.getDefaultStyleIdentifier();
            expect(style).toBeFalsy();
        });
        it('tests fetching the style from a layer record', () => {
            const layer = {
                Style: {
                    "$": {
                        "isDefault": "true"
                    },
                    "ows:Title": "generic Legend",
                    "ows:Abstract": "abstract",
                    "ows:Keywords": {
                        "ows:Keyword": "default"
                    },
                    "ows:Identifier": "normal"
                }
            };
            const style = WMTSUtils.getDefaultStyleIdentifier(layer);
            expect(style).toBe('normal');
        });
        it('tests fetching the default style when "isDefault" is not present', () => {
            const layer = {
                Style: {
                    "ows:Title": "generic Legend",
                    "ows:Abstract": "abstract",
                    "ows:Keywords": {
                        "ows:Keyword": "default"
                    },
                    "ows:Identifier": "default"
                }
            };
            const style = WMTSUtils.getDefaultStyleIdentifier(layer);
            expect(style).toBe('default');
        });

    });
    it('generateGeoServerWMTSUrl', () => {
        expect(WMTSUtils.generateGeoServerWMTSUrl({ url: '/geoserver/wms' })).toBe('/geoserver/gwc/service/wmts?REQUEST=GetCapabilities');
        expect(WMTSUtils.generateGeoServerWMTSUrl({ url: '/geoserver/wms', name: 'workspace:name' })).toBe('/geoserver/workspace/name/gwc/service/wmts?REQUEST=GetCapabilities');
        expect(WMTSUtils.generateGeoServerWMTSUrl({ url: '/geoserver/wms', name: 'name' })).toBe('/geoserver/gwc/service/wmts?REQUEST=GetCapabilities');
        expect(WMTSUtils.generateGeoServerWMTSUrl({ url: '/wms' })).toBe('');
    });
});
