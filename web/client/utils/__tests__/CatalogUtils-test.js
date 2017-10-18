/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');

const CatalogUtils = require('../CatalogUtils');

describe('Test the CatalogUtils', () => {
    it('wms dimensions without values', () => {
        const records = CatalogUtils.getCatalogRecords('wms', {
            records: [{
                Dimension: [{
                    $: {
                        name: 'time'
                    }
                }]
            }]
        }, {});
        expect(records.length).toBe(1);
        expect(records[0].dimensions.length).toBe(1);
        expect(records[0].dimensions[0].values.length).toBe(0);
    });

    it('wms dimensions with values', () => {
        const records = CatalogUtils.getCatalogRecords('wms', {
            records: [{
                Dimension: [{
                    $: {
                        name: 'time'
                    },
                    _: '1,2'
                }]
            }]
        }, {});
        expect(records.length).toBe(1);
        expect(records[0].dimensions.length).toBe(1);
        expect(records[0].dimensions[0].values.length).toBe(2);
    });

    it('wmts', () => {
        const records = CatalogUtils.getCatalogRecords('wmts', {
            records: [{}]
        }, {});
        expect(records.length).toBe(1);
    });

    it('wmts with tilematrix', () => {
        const records = CatalogUtils.getCatalogRecords('wmts', {
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
        const records = CatalogUtils.getCatalogRecords('wmts', {
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
        const records = CatalogUtils.getCatalogRecords('wmts', {
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

    it('csw empty', () => {
        const records = CatalogUtils.getCatalogRecords('csw', {
            records: [{}]
        }, {});
        expect(records.length).toBe(1);
    });

    it('csw with DC URI', () => {
        const records = CatalogUtils.getCatalogRecords('csw', {
            records: [{
                dc: {
                    URI: [{
                        name: "thumbnail",
                        value: "http://thumb"
                    }, {
                        name: "wms",
                        protocol: "OGC:WMS-1.1.1-http-get-map",
                        value: "http://geoserver"
                    }]
                }
            }]
        }, {});
        expect(records.length).toBe(1);
    });

    it('csw with DC references', () => {
        const records = CatalogUtils.getCatalogRecords('csw', {
            records: [{
                dc: {
                    references: [{
                        name: "thumbnail",
                        scheme: "WWW:LINK-1.0-http--image-thumbnail",
                        value: "http://thumb"
                    }, {
                        name: "wms",
                        scheme: "OGC:WMS-1.1.1-http-get-map",
                        value: "http://geoserver"
                    }]
                }
            }]
        }, {});
        expect(records.length).toBe(1);
    });
});
