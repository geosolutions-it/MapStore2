/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import { getCatalogRecords } from '../WMTS';

describe('Test correctness of the WMTS APIs', () => {
    it('wmts', () => {
        const records = getCatalogRecords({
            records: [{}]
        }, {});
        expect(records.length).toBe(1);
    });

    it('wmts with tilematrix', () => {
        const records = getCatalogRecords({
            records: [{
                "ows:WGS84BoundingBox": {
                    "ows:LowerCorner": "-180.0 -90.0",
                    "ows:UpperCorner": "180.0 90.0"
                },
                TileMatrixSetLink: [{
                    TileMatrixSet: 'EPSG:4326',
                    TileMatrixSetLimits: {
                        TileMatrixSetLimits: [{
                            TileMatrix: 'EPSG:4326:0',
                            MinTileCol: 0,
                            MaxTileCol: 10,
                            MinTileRow: 0,
                            MaxTileRow: 10
                        }]
                    }
                }],
                TileMatrixSet: [{
                    "ows:Identifier": "EPSG:4326",
                    "ows:SupportedCRS": "EPSG:4326"
                }]
            }]
        }, {});
        expect(records.length).toBe(1);

    });

    it('wmts with tilematrix filtered', () => {
        const records = getCatalogRecords({
            records: [{
                "ows:WGS84BoundingBox": {
                    "ows:LowerCorner": "-180.0 -90.0",
                    "ows:UpperCorner": "180.0 90.0"
                },
                TileMatrixSetLink: [{
                    TileMatrixSet: 'EPSG:4326',
                    TileMatrixSetLimits: {
                        TileMatrixSetLimits: [{
                            TileMatrix: 'EPSG:4326:0',
                            MinTileCol: 0,
                            MaxTileCol: 10,
                            MinTileRow: 0,
                            MaxTileRow: 10
                        }]
                    }
                }],
                TileMatrixSet: [{
                    "ows:Identifier": "EPSG:4326",
                    "ows:SupportedCRS": "EPSG:4326"
                }],
                SRS: ['EPSG:4326', 'EPSG:3857']
            }]
        }, {});
        expect(records.length).toBe(1);
        expect(records[0].references.length).toBe(1);
        expect(records[0].references[0].SRS.length).toBe(1);
    });

    it('wmts with tilematrix not filtered', () => {
        const records = getCatalogRecords({
            records: [{
                "ows:WGS84BoundingBox": {
                    "ows:LowerCorner": "-180.0 -90.0",
                    "ows:UpperCorner": "180.0 90.0"
                },
                TileMatrixSetLink: [{
                    TileMatrixSet: 'EPSG:4326',
                    TileMatrixSetLimits: {
                        TileMatrixSetLimits: [{
                            TileMatrix: 'EPSG:4326:0',
                            MinTileCol: 0,
                            MaxTileCol: 10,
                            MinTileRow: 0,
                            MaxTileRow: 10
                        }]
                    }
                }, {
                    TileMatrixSet: 'EPSG:3857',
                    TileMatrixSetLimits: {
                        TileMatrixSetLimits: [{
                            TileMatrix: 'EPSG:3857:0',
                            MinTileCol: 0,
                            MaxTileCol: 10,
                            MinTileRow: 0,
                            MaxTileRow: 10
                        }]
                    }
                }],
                TileMatrixSet: [{
                    "ows:Identifier": "EPSG:4326",
                    "ows:SupportedCRS": "EPSG:4326"
                }, {
                    "ows:Identifier": "EPSG:3857",
                    "ows:SupportedCRS": "EPSG:3857"
                }],
                SRS: ['EPSG:4326', 'EPSG:3857']
            }]
        }, {});
        expect(records.length).toBe(1);
        expect(records[0].references.length).toBe(1);
        expect(records[0].references[0].SRS.length).toBe(2);
    });
    it('wmts, with url, with options', () => {
        const url = "http://some.url";
        const wmtsRecords = [{}];
        const records = getCatalogRecords({ records: wmtsRecords }, { url });
        expect(records.length).toBe(1);
        expect(records[0].references[0].url).toBe(url);
    });

    it('wmts, NO url, with options', () => {
        const wmtsRecords = [{}];
        const records = getCatalogRecords({ records: wmtsRecords }, {});
        expect(records.length).toBe(1);
        expect(records[0].references[0].url).toBe(undefined);
    });
    it('wmts, NO url, no options', () => {
        const wmtsRecords = [{}];
        const records = getCatalogRecords({ records: wmtsRecords });
        expect(records.length).toBe(1);
        expect(records[0].references[0].url).toBe(undefined);
    });
    it('wmts capabilities url', () => {
        const wmtsRecords = [{ GetTileURL: "tileURL" }];
        const records = getCatalogRecords({ records: wmtsRecords });
        expect(records.length).toBe(1);
        expect(records[0].capabilitiesURL).toBe("tileURL");
        const wmtsRecords2 = [{ GetTileURL: "tileURL", capabilitiesURL: "capURL" }];
        const records2 = getCatalogRecords({ records: wmtsRecords2 });
        expect(records2.length).toBe(1);
        expect(records2[0].capabilitiesURL).toBe("capURL");
    });
});
