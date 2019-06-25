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
                        name: 'elevation'
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
                        name: 'elevation'
                    },
                    _: '1,2'
                }]
            }]
        }, {});
        expect(records.length).toBe(1);
        expect(records[0].dimensions.length).toBe(1);
        expect(records[0].dimensions[0].values.length).toBe(2);
    });
    // this is needed to avoid to show time values for timeline, until support for time values is fully implemented
    it('wms dimensions time is excluded', () => {
        const records = CatalogUtils.getCatalogRecords('wms', {
            records: [{
                Dimension: [{
                    $: {
                        name: 'time'
                    },
                    _: '2008-10-31T00:00:00.000Z,2008-11-04T00:00:00.000Z'
                }]
            }]
        }, {});
        expect(records.length).toBe(1);
        expect(records[0].dimensions.length).toBe(0);
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

    it('csw with various DC attributes', () => {
        const records = CatalogUtils.getCatalogRecords('csw', {
            records: [{
                boundingBox: {
                    extent: [ 43.718, 11.348, 43.84, 11.145 ],
                    crs: 'EPSG:3003'
                },
                dc: {
                    references: [],
                    identifier: 'c_d612:sha-identifier',
                    title: 'title',
                    type: 'dataset',
                    subject: [
                        'web',
                        'world',
                        'sport',
                        'transportation'
                    ],
                    format: [
                        'ESRI Shapefile',
                        'KML'
                    ],
                    contributor: 'contributor',
                    rights: [
                        'otherRestrictions',
                        'otherRestrictions'
                    ],
                    source: 'source',
                    relation: {
                        TYPE_NAME: 'DC_1_1.SimpleLiteral'
                    },
                    URI: [{
                        TYPE_NAME: 'DC_1_1.URI',
                        protocol: '',
                        name: 'Beda - Shapefile',
                        description: '',
                        value: 'http://www.beda.it/Beda.zip'
                    },
                    {
                        TYPE_NAME: 'DC_1_1.URI',
                        protocol: '',
                        name: 'Beda - KML',
                        description: '',
                        value: 'http://www.beda.it/Beda.kmz'
                    }]
                }
            }]
        }, {});
        expect(records.length).toEqual(1);
        expect(records[0].boundingBox).toEqual({ extent: [ 43.718, 11.348, 43.84, 11.145 ], crs: 'EPSG:3003' });
        expect(records[0].description).toEqual("");
        expect(records[0].identifier).toEqual("c_d612:sha-identifier");
        expect(records[0].references).toEqual([]);
        expect(records[0].thumbnail).toEqual(null);
        expect(records[0].title).toEqual('title');
        expect(records[0].tags).toEqual('');
        expect(records[0].metadata.boundingBox).toEqual([ '43.718,11.348,43.84,11.145' ]);
        expect(records[0].metadata.URI).toEqual([{
            TYPE_NAME: 'DC_1_1.URI', protocol: '', name: 'Beda - Shapefile', description: '', value: 'http://www.beda.it/Beda.zip'
            }, {
            TYPE_NAME: 'DC_1_1.URI', protocol: '', name: 'Beda - KML', description: '', value: 'http://www.beda.it/Beda.kmz'
        }]);
        expect(records[0].metadata.contributor).toEqual([ 'contributor' ]);
        expect(records[0].metadata.format).toEqual([ 'ESRI Shapefile', 'KML' ]);
        expect(records[0].metadata.identifier).toEqual([ 'c_d612:sha-identifier' ]);
        expect(records[0].metadata.relation).toEqual([ { TYPE_NAME: 'DC_1_1.SimpleLiteral' } ]);
        expect(records[0].metadata.rights).toEqual([ 'otherRestrictions' ]);
        expect(records[0].metadata.references).toEqual(undefined);
        expect(records[0].metadata.source).toEqual(['source']);
        expect(records[0].metadata.subject).toEqual(["<ul><li>web</li><li>world</li><li>sport</li><li>transportation</li></ul>"]);
        expect(records[0].metadata.title).toEqual(['title']);
        expect(records[0].metadata.type).toEqual([ 'dataset' ]);
        expect(records[0].metadata.uri).toEqual(['<ul><li><a target="_blank" href="http://www.beda.it/Beda.zip">Beda - Shapefile</a></li><li><a target="_blank" href="http://www.beda.it/Beda.kmz">Beda - KML</a></li></ul>']);
    });

    it('csw dct:temporal metadata YYYY-MM-DD', () => {
        let records = CatalogUtils.getCatalogRecords('csw', {
            records: [{
                dc: {
                    temporal: "start=2019-02-03; end=2019-03-03"
                }
            }]
        }, {}, {});
        expect(records.length).toEqual(1);
        let temporal = records[0].metadata.temporal;
        expect(temporal).toEqual(["<ul><li>catalog.start2019-02-03</li><li>catalog.end2019-03-03</li></ul>"]);
    });
    it('csw dct:temporal metadata YYYY-MM', () => {
        let records = CatalogUtils.getCatalogRecords('csw', {
            records: [{
                dc: {
                    temporal: "start=2019-02; end=2019-03"
                }
            }]
        }, {}, {});
        expect(records.length).toEqual(1);
        let temporal = records[0].metadata.temporal;
        expect(temporal).toEqual(["<ul><li>catalog.start2019-02</li><li>catalog.end2019-03</li></ul>"]);
    });
    it('csw dct:temporal metadata YYYY', () => {
        let records = CatalogUtils.getCatalogRecords('csw', {
            records: [{
                dc: {
                    temporal: "start=2019; end=2019"
                }
            }]
        }, {}, {});
        expect(records.length).toEqual(1);
        let temporal = records[0].metadata.temporal;
        expect(temporal).toEqual(["<ul><li>catalog.start2019</li><li>catalog.end2019</li></ul>"]);
    });
    it('csw dct:temporal metadata YYYY-MM-DDThh:mm:ssZ', () => {
        let records = CatalogUtils.getCatalogRecords('csw', {
            records: [{
                dc: {
                    temporal: "start=2019-03-05T02:02:00Z; end=2019-03-05T02:52:00Z"
                }
            }]
        }, {}, {});
        expect(records.length).toEqual(1);
        let temporal = records[0].metadata.temporal;
        expect(temporal).toEqual([`<ul><li>catalog.start${new Date("2019-03-05T02:02:00Z").toLocaleString()}</li><li>catalog.end${new Date("2019-03-05T02:52:00Z").toLocaleString()}</li></ul>`]);
    });
    it('csw dct:temporal metadata YYYY-MM-DDThh:mm:ssTZD', () => {
        let records = CatalogUtils.getCatalogRecords('csw', {
            records: [{
                dc: {
                    temporal: "start=2019-03-05T02:02:00+05:00; end=2019-03-05T02:52:00+05:00"
                }
            }]
        }, {}, {});
        expect(records.length).toEqual(1);
        let temporal = records[0].metadata.temporal;
        expect(temporal).toEqual([`<ul><li>catalog.start${new Date("2019-03-05T02:02:00+05:00").toLocaleString()}</li><li>catalog.end${new Date("2019-03-05T02:52:00+05:00").toLocaleString()}</li></ul>`]);
    });
    it('csw dct:temporal metadata YYYY-MM-DDThh:mm:ssTZD scheme="W3C-DTF"', () => {
        let records = CatalogUtils.getCatalogRecords('csw', {
            records: [{
                dc: {
                    temporal: "start=2019-03-05T02:02:00+05:00; end=2019-03-05T02:52:00+05:00; scheme=W3C-DTF"
                }
            }]
        }, {}, {});
        expect(records.length).toEqual(1);
        let temporal = records[0].metadata.temporal;
        expect(temporal).toEqual([`<ul><li>catalog.start${new Date("2019-03-05T02:02:00+05:00").toLocaleString()}</li><li>catalog.end${new Date("2019-03-05T02:52:00+05:00").toLocaleString()}</li></ul>`]);
    });
    it('csw dct:temporal metadata YYYY-MM-DDThh:mm:ssTZD scheme="Geological timescale"', () => {
        let records = CatalogUtils.getCatalogRecords('csw', {
            records: [{
                dc: {
                    temporal: "start=Cambrian period; scheme=Geological timescale; name=Phanerozoic Eon"
                }
            }]
        }, {}, {});
        expect(records.length).toEqual(1);
        let temporal = records[0].metadata.temporal;
        expect(temporal).toEqual(["<ul><li>catalog.startCambrian period</li></ul>"]);
    });
    it('csw with DC uri empty', () => {
        const records = CatalogUtils.getCatalogRecords('csw', {
            records: [{
                dc: {
                        URI: []
                    }
                }
            ]
        }, {});
        expect(records.length).toEqual(1);
        expect(records[0].metadata.uri).toEqual(undefined);
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
    it('csw with DC references, no name', () => {
        /*
         * Issue that happens with CSW GeoServer plugin, with the following Records.properties
         * references.value=list(strConcat('${url.wms}?service=WMS&request=GetMap&layers=',prefixedName), Concatenate('https://some-url/geoserver/', "store.workspace.name", '/', "name", '/ows?service=wms&version=1.3.0&request=GetCapabilities'), Concatenate('https://some-url/geoserver/', "store.workspace.name", '/', "name", '/wfs?service=wfs&version=1.3.0&request=GetCapabilities'))
         */
        const records = CatalogUtils.getCatalogRecords('csw', {
            records: [{
                dc: {
                    references: [{
                        scheme: "http-get-capabilities",
                        value: "http://geoserver"
                    }]
                }
            }]
        }, {});
        expect(records.length).toBe(1);
        expect(records[0].references.length).toBe(1);
        expect(records[0].references[0].url).toBe("http://geoserver");
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
            },
            {
                dc: {
                    alternative: "1-Hurricane Track",
                    identifier: "e5efb394-aac2-432e-b784-f18a6f663915",
                    references: [{
                            scheme: "WWW:DOWNLOAD-REST_MAP",
                            value: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Hurricanes/MapServer"
                        }]
                    }
            }]
        }, {});
        expect(records.length).toBe(2);
        const r = records[0];
        expect(r.thumbnail).toExist();
        expect(r.references.length).toBe(1);
        const ref = r.references[0];
        expect(ref.type).toBe("OGC:WMS");
        expect(ref.params.name).toBe("layer.name");
        const esri = records[1];
        expect(esri).toExist();
        expect(esri.references[0]).toExist();
        expect(esri.references[0].type).toBe("arcgis");
        expect(esri.references[0].params.name).toBe("1-Hurricane Track");
    });

});
