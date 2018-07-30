/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const {map, clone} = require('lodash');

const CatalogUtils = require('../CatalogUtils');
const wmsRecords = [{
    references: [{
        type: "OGC:WMS",
        SRS: ['EPSG:4326', 'EPSG:3857'],
        params: {
            name: "record.Name"
        }
    }]
}];
const url = "http://some.url";
const cswRecords = [{
    dc: {
        references: [{
            name: "thumbnail",
            scheme: "WWW:LINK-1.0-http--image-thumbnail",
            value: "http://thumb"
        }, {
            name: "wms",
            scheme: "OGC:WMS-1.1.1-http-get-map",
            value: "http://geoserver"
        }],
        URI: [{
            name: "thumbnail",
            scheme: "WWW:LINK-1.0-http--image-thumbnail",
            value: "/thumb"
        }]
    }

}];
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

    it('wms limited srs', () => {
        const records = CatalogUtils.getCatalogRecords('wms', {
            records: [{
                SRS: ['EPSG:4326', 'EPSG:3857', 'EPSG:5041']
            }]
        }, { url: 'http://sample' });
        expect(records.length).toBe(1);
        const layer = CatalogUtils.recordToLayer(records[0]);
        expect(layer.allowedSRS['EPSG:4326']).toBe(true);
        expect(layer.allowedSRS['EPSG:3857']).toBe(true);
        expect(layer.allowedSRS['EPSG:5041']).toNotExist();
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

    it('csw with DC URI and WMS 1.3.0', () => {
        const records = CatalogUtils.getCatalogRecords('csw', {
            records: [{
                dc: {
                    URI: [{
                        name: "thumbnail",
                        value: "http://thumb"
                    }, {
                        name: "wms",
                        protocol: "OGC:WMS-1.3.0-http-get-map",
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

    it('csw with DC references with only OGC:WMS in URI, GeoNetwork', () => {
        const records = CatalogUtils.getCatalogRecords('csw', {
            records: [{
                dc: {
                    URI: [
                        {
                            TYPE_NAME: 'DC_1_1.URI',
                            protocol: 'OGC:WMS',
                            name: 'wms-name',
                            description: 'wms-desc',
                            value: 'wms-url'
                        },
                        {
                            TYPE_NAME: 'DC_1_1.URI',
                            protocol: 'WWW:LINK-1.0-http--related',
                            name: 'link-name',
                            description: 'link-desc',
                            value: 'link-url'
                        },
                        {
                            TYPE_NAME: 'DC_1_1.URI',
                            protocol: 'image/png',
                            name: 'thumbnail',
                            value: 'path-to-thumbnail'
                        }
                    ]
                }
            }]
        }, {});
        expect(records.length).toBe(1);
    });

    it('wms check for reference url', () => {
        const records = CatalogUtils.getCatalogRecords('wms', {
            records: [{
                references: [{
                    type: "OGC:WMS",
                    // url: options && options.url,
                    SRS: ['EPSG:4326', 'EPSG:3857'],
                    params: {
                        name: "record.Name"
                    }
                }]
            }]
        }, {});
        expect(records[0].references.length).toBe(1);
        expect(records[0].references[0].url).toBe(undefined);
    });

    it('wms check for reference url, no options', () => {
        const records = CatalogUtils.getCatalogRecords('wms', {records: wmsRecords });
        expect(records[0].references.length).toBe(1);
        expect(records[0].references[0].url).toBe(undefined);
    });

    it('wms check for reference url, options with no url', () => {
        const records = CatalogUtils.getCatalogRecords('wms', { records: wmsRecords }, {});
        expect(records[0].references.length).toBe(1);
        expect(records[0].references[0].url).toBe(undefined);
    });

    it('wms check for reference url, no options', () => {
        const records = CatalogUtils.getCatalogRecords('wms', {records: wmsRecords }, {url});
        expect(records[0].references.length).toBe(1);
        expect(records[0].references[0].url).toBe(url);
    });

    it('csw with DC references, no url, no options, with uri', () => {
        const records = CatalogUtils.getCatalogRecords('csw', { records: cswRecords });
        expect(records.length).toBe(1);
        expect(records[0].thumbnail).toBe("/thumb");
    });

    it('csw with DC references, no url, with thumbnail, with uri', () => {
        const records = CatalogUtils.getCatalogRecords('csw', { records: cswRecords }, {});
        expect(records.length).toBe(1);
        expect(records[0].thumbnail).toBe("/thumb");
    });

    it('csw with DC references, with url, with options, with uri', () => {
        const records = CatalogUtils.getCatalogRecords('csw', { records: cswRecords }, {url});
        expect(records.length).toBe(1);
        expect(records[0].thumbnail).toBe(url + cswRecords[0].dc.URI[0].value);
    });

    it('csw with DC references, with url, with options, no uri', () => {
        const cswData = map(cswRecords, clone);
        delete cswData[0].dc.URI;
        const records = CatalogUtils.getCatalogRecords('csw', { records: cswData }, {url});
        expect(records.length).toBe(1);
        expect(records[0].thumbnail).toBe(cswRecords[0].dc.references[0].value);
    });

    it('wmts, with url, with options', () => {
        const wmtsRecords = [{}];
        const records = CatalogUtils.getCatalogRecords('wmts', { records: wmtsRecords }, {url});
        expect(records.length).toBe(1);
        expect(records[0].references[0].url).toBe(url);
    });

    it('wmts, NO url, with options', () => {
        const wmtsRecords = [{}];
        const records = CatalogUtils.getCatalogRecords('wmts', { records: wmtsRecords }, {});
        expect(records.length).toBe(1);
        expect(records[0].references[0].url).toBe(undefined);
    });
    it('wmts, NO url, no options', () => {
        const wmtsRecords = [{}];
        const records = CatalogUtils.getCatalogRecords('wmts', { records: wmtsRecords });
        expect(records.length).toBe(1);
        expect(records[0].references[0].url).toBe(undefined);
    });
    it('csw correctly retrive layer name and thumb from pycsw', () => {
        const records = CatalogUtils.getCatalogRecords('csw', {
            records: [{
                dc: {
                    references: [{
                        scheme: "WWW:DOWNLOAD-1.0-http--download",
                        value: "http://localhost:8000/uploaded/thumbs/layer-09d4e114-74a0-11e8-9c12-20c9d079dc21-thumb.png"
                    }, {
                        scheme: "OGC:WMS",
                        value: "http://geoserver"
                    }],
                    alternative: "layer.name",
                    identifier: "09d4e114-74a0-11e8-9c12-20c9d079dc21"

                }
            }]
        }, {});
        expect(records.length).toBe(1);
        const r = records[0];
        expect(r.thumbnail).toExist();
        expect(r.references.length).toBe(1);
        const ref = r.references[0];
        expect(ref.type).toBe("OGC:WMS");
        expect(ref.params.name).toBe("layer.name");
    });

});
