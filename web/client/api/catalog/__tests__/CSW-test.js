/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { map, clone } from 'lodash';
import {
    getCatalogRecords
} from '../CSW';
import { THREE_D_TILES } from '../../ThreeDTiles';

describe('Test correctness of the CSW catalog APIs', () => {
    it('csw empty', () => {
        const records = getCatalogRecords({
            records: [{}]
        }, {});
        expect(records.length).toBe(1);
    });

    it('csw with various DC attributes', () => {
        const records = getCatalogRecords({
            records: [{
                boundingBox: {
                    extent: [43.718, 11.348, 43.84, 11.145],
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
        expect(records[0].boundingBox).toEqual({ extent: [43.718, 11.348, 43.84, 11.145], crs: 'EPSG:3003' });
        expect(records[0].description).toEqual("");
        expect(records[0].identifier).toEqual("c_d612:sha-identifier");
        expect(records[0].references).toEqual([]);
        expect(records[0].thumbnail).toEqual(null);
        expect(records[0].title).toEqual('title');
        expect(records[0].tags).toEqual('');
        expect(records[0].metadata.boundingBox).toEqual(['43.718,11.348,43.84,11.145']);
        expect(records[0].metadata.URI).toEqual([{
            TYPE_NAME: 'DC_1_1.URI', protocol: '', name: 'Beda - Shapefile', description: '', value: 'http://www.beda.it/Beda.zip'
        }, {
            TYPE_NAME: 'DC_1_1.URI', protocol: '', name: 'Beda - KML', description: '', value: 'http://www.beda.it/Beda.kmz'
        }]);
        expect(records[0].metadata.contributor).toEqual(['contributor']);
        expect(records[0].metadata.format).toEqual(['ESRI Shapefile', 'KML']);
        expect(records[0].metadata.identifier).toEqual(['c_d612:sha-identifier']);
        expect(records[0].metadata.relation).toEqual([{ TYPE_NAME: 'DC_1_1.SimpleLiteral' }]);
        expect(records[0].metadata.rights).toEqual(['otherRestrictions']);
        expect(records[0].metadata.references).toEqual(undefined);
        expect(records[0].metadata.source).toEqual(['source']);
        expect(records[0].metadata.subject).toEqual(["<ul><li>web</li><li>world</li><li>sport</li><li>transportation</li></ul>"]);
        expect(records[0].metadata.title).toEqual(['title']);
        expect(records[0].metadata.type).toEqual(['dataset']);
        expect(records[0].metadata.uri).toEqual(['<ul><li><a target="_blank" href="http://www.beda.it/Beda.zip">Beda - Shapefile</a></li><li><a target="_blank" href="http://www.beda.it/Beda.kmz">Beda - KML</a></li></ul>']);
    });
    it('csw with dc.URI.protocol = OGC:WMS', () => {
        const records = getCatalogRecords({
            records: [{
                boundingBox: {
                    extent: [43.718, 11.348, 43.84, 11.145],
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
                        TYPE_NAME: "DC_1_1.URI",
                        description: "Synthèse 2011 des POS et des PLU de Rennes Métropole",
                        name: "synthese_pos_plu_rennes_metropole",
                        protocol: "OGC:WMS",
                        value: "https://geobretagne.fr/geoserver/audiar/wms?SERVICE=WMS&REQUEST=GetCapabilities"
                    }]
                }
            }]
        }, {});
        expect(records.length).toEqual(1);
        expect(records[0].boundingBox).toEqual({ extent: [43.718, 11.348, 43.84, 11.145], crs: 'EPSG:3003' });
        expect(records[0].description).toEqual("");
        expect(records[0].identifier).toEqual("c_d612:sha-identifier");
        expect(records[0].references).toEqual([{
            type: 'OGC:WMS',
            url: 'https://geobretagne.fr/geoserver/audiar/wms?SERVICE=WMS&REQUEST=GetCapabilities',
            SRS: [],
            params: {
                name: 'synthese_pos_plu_rennes_metropole'
            }
        }]);
        expect(records[0].thumbnail).toEqual(null);
        expect(records[0].title).toEqual('title');
        expect(records[0].tags).toEqual('');
        expect(records[0].metadata.boundingBox).toEqual(['43.718,11.348,43.84,11.145']);
        expect(records[0].metadata.URI).toEqual([{
            TYPE_NAME: "DC_1_1.URI",
            description: "Synthèse 2011 des POS et des PLU de Rennes Métropole",
            name: "synthese_pos_plu_rennes_metropole",
            protocol: "OGC:WMS",
            value: "https://geobretagne.fr/geoserver/audiar/wms?SERVICE=WMS&REQUEST=GetCapabilities"
        }]);
        expect(records[0].metadata.contributor).toEqual(['contributor']);
        expect(records[0].metadata.format).toEqual(['ESRI Shapefile', 'KML']);
        expect(records[0].metadata.identifier).toEqual(['c_d612:sha-identifier']);
        expect(records[0].metadata.relation).toEqual([{ TYPE_NAME: 'DC_1_1.SimpleLiteral' }]);
        expect(records[0].metadata.rights).toEqual(['otherRestrictions']);
        expect(records[0].metadata.references).toEqual(['<ul><li><a target="_blank" href="https://geobretagne.fr/geoserver/audiar/wms?SERVICE=WMS&REQUEST=GetCapabilities">synthese_pos_plu_rennes_metropole</a></li></ul>']);
        expect(records[0].metadata.source).toEqual(['source']);
        expect(records[0].metadata.subject).toEqual(["<ul><li>web</li><li>world</li><li>sport</li><li>transportation</li></ul>"]);
        expect(records[0].metadata.title).toEqual(['title']);
        expect(records[0].metadata.type).toEqual(['dataset']);
        expect(records[0].metadata.uri).toEqual(['<ul><li><a target="_blank" href="https://geobretagne.fr/geoserver/audiar/wms?SERVICE=WMS&REQUEST=GetCapabilities">synthese_pos_plu_rennes_metropole</a></li></ul>']);
    });

    it('csw with additional OGC services', () => {
        const records = getCatalogRecords({
            records: [{
                boundingBox: {
                    extent: [43.718, 11.348, 43.84, 11.145],
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
                        TYPE_NAME: "DC_1_1.URI",
                        description: "layer1 description",
                        name: "layer1",
                        protocol: "OGC:WMS",
                        value: "https://geoserver/wms?SERVICE=WMS&REQUEST=GetCapabilities"
                    },
                    {
                        TYPE_NAME: "DC_1_1.URI",
                        description: "layer2 description",
                        name: "layer2",
                        protocol: "OGC:WFS",
                        value: "https://geoserver/wfs?SERVICE=WFS&REQUEST=GetCapabilities"
                    }]
                }
            }]
        }, {});
        expect(records.length).toEqual(1);
        expect(records[0].boundingBox).toEqual({ extent: [43.718, 11.348, 43.84, 11.145], crs: 'EPSG:3003' });
        expect(records[0].description).toEqual("");
        expect(records[0].identifier).toEqual("c_d612:sha-identifier");
        expect(records[0].thumbnail).toEqual(null);
        expect(records[0].title).toEqual('title');
        expect(records[0].tags).toEqual('');
        expect(records[0].metadata.boundingBox).toEqual(['43.718,11.348,43.84,11.145']);
        expect(records[0].metadata.contributor).toEqual(['contributor']);
        expect(records[0].metadata.format).toEqual(['ESRI Shapefile', 'KML']);
        expect(records[0].metadata.identifier).toEqual(['c_d612:sha-identifier']);
        expect(records[0].metadata.relation).toEqual([{ TYPE_NAME: 'DC_1_1.SimpleLiteral' }]);
        expect(records[0].metadata.rights).toEqual(['otherRestrictions']);
        expect(records[0].metadata.references).toEqual(['<ul><li><a target="_blank" href="https://geoserver/wms?SERVICE=WMS&REQUEST=GetCapabilities">layer1</a></li><li><a target="_blank" href="https://geoserver/wfs?SERVICE=WFS&REQUEST=GetCapabilities">layer2</a></li></ul>']);
        expect(records[0].metadata.source).toEqual(['source']);
        expect(records[0].metadata.subject).toEqual(["<ul><li>web</li><li>world</li><li>sport</li><li>transportation</li></ul>"]);
        expect(records[0].metadata.title).toEqual(['title']);
        expect(records[0].metadata.type).toEqual(['dataset']);
        expect(records[0].metadata.uri).toEqual(['<ul><li><a target="_blank" href="https://geoserver/wms?SERVICE=WMS&REQUEST=GetCapabilities">layer1</a></li><li><a target="_blank" href="https://geoserver/wfs?SERVICE=WFS&REQUEST=GetCapabilities">layer2</a></li></ul>']);

        expect(records[0].references).toEqual([{
            type: 'OGC:WMS',
            url: 'https://geoserver/wms?SERVICE=WMS&REQUEST=GetCapabilities',
            SRS: [],
            params: {
                name: 'layer1'
            }
        }, {
            type: 'OGC:WFS',
            url: 'https://geoserver/wfs?SERVICE=WFS&REQUEST=GetCapabilities',
            SRS: [],
            params: {
                name: 'layer2'
            }
        }]);
        expect(records[0].ogcReferences).toEqual({
            type: 'OGC:WMS',
            url: 'https://geoserver/wms?SERVICE=WMS&REQUEST=GetCapabilities',
            SRS: [],
            params: {
                name: 'layer1'
            }
        });
        expect(records[0].additionalOGCServices).toEqual(
            {
                wfs: {
                    url: 'https://geoserver/wfs?SERVICE=WFS&REQUEST=GetCapabilities',
                    name: 'layer2',
                    references: [
                        {
                            type: 'OGC:WMS',
                            url: 'https://geoserver/wms?SERVICE=WMS&REQUEST=GetCapabilities',
                            SRS: [],
                            params: { name: 'layer1'}
                        },
                        {
                            type: 'OGC:WFS',
                            url: 'https://geoserver/wfs?SERVICE=WFS&REQUEST=GetCapabilities',
                            SRS: [],
                            params: {name: 'layer2'}
                        }
                    ],
                    ogcReferences: {
                        type: 'OGC:WFS',
                        url: 'https://geoserver/wfs?SERVICE=WFS&REQUEST=GetCapabilities',
                        SRS: [],
                        params: {name: 'layer2'}
                    },
                    fetchCapabilities: true,
                    boundingBox: {
                        crs: 'EPSG:3003',
                        bounds: {
                            minx: 43.718,
                            miny: 11.348,
                            maxx: 43.84,
                            maxy: 11.145
                        }
                    }
                }
            }
        );
    });

    it('csw dct:temporal metadata YYYY-MM-DD', () => {
        let records = getCatalogRecords({
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
        let records = getCatalogRecords({
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
        let records = getCatalogRecords({
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
        let records = getCatalogRecords({
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
        let records = getCatalogRecords({
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
        let records = getCatalogRecords({
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
        let records = getCatalogRecords({
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
        const records = getCatalogRecords({
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
        const records = getCatalogRecords({
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
        const records = getCatalogRecords({
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
    it('csw with DC URI 3D Tiles', ()=>{
        const records = [{
            boundingBox: {
                "extent": [
                    43.718, 11.1, 43.84, 11.348
                ],
                "crs": "EPSG:4326"
            },
            dc: {
                URI: {
                    TYPE_NAME: "DC_1_1.URI",
                    description: "access point",
                    protocol: "https://hostname/ProtocolValue/www-download",
                    value: "https://hostname/3dtiles/layername/tileset.json"
                }, format: THREE_D_TILES, identifier: "test:layername", title: "3D Tiles layer for test"
            }
        }];
        const catalogRecords = getCatalogRecords({records});
        expect(catalogRecords.length).toBe(1);
        expect(catalogRecords[0].bbox).toEqual({ bounds: {minx: 43.718, miny: 11.1, maxx: 43.84, maxy: 11.348}, crs: 'EPSG:4326' });
        expect(catalogRecords[0].url).toEqual("https://hostname/3dtiles/layername/tileset.json");
        expect(catalogRecords[0].identifier).toEqual("test:layername");
        expect(catalogRecords[0].title).toEqual("3D Tiles layer for test");
        expect(catalogRecords[0].serviceType).toEqual("3dtiles");
        expect(catalogRecords[0].isValid).toEqual(true);
        expect(catalogRecords[0].format).toEqual('3D Tiles');
        expect(catalogRecords[0].catalogType).toEqual('csw');
    });
    it('csw with array of (DC URI) 3D Tiles', ()=>{
        const records = [{
            boundingBox: {
                "extent": [
                    43.718, 11.1, 43.84, 11.348
                ],
                "crs": "EPSG:4326"
            },
            dc: {
                URI: [
                    {
                        "TYPE_NAME": "DC_1_1.URI",
                        "protocol": "http://www.w3.org/TR/xlink/",
                        "description": "layer01",
                        "value": "https://hostname/3dtiles/layername/tileset.json"
                    },
                    {
                        "TYPE_NAME": "DC_1_1.URI",
                        "protocol": "image/png",
                        "name": "attachments",
                        "value": "https://hostname/3dtiles/layername1/attachments/GEONETWORK-PON.png"
                    }
                ], format: THREE_D_TILES, identifier: "test:layername", title: "3D Tiles layer for test"
            }
        }];
        const catalogRecords = getCatalogRecords({records});
        expect(catalogRecords.length).toBe(1);
        expect(catalogRecords[0].bbox).toEqual({ bounds: {minx: 43.718, miny: 11.1, maxx: 43.84, maxy: 11.348}, crs: 'EPSG:4326' });
        expect(catalogRecords[0].url).toEqual("https://hostname/3dtiles/layername/tileset.json");
        expect(catalogRecords[0].identifier).toEqual("test:layername");
        expect(catalogRecords[0].title).toEqual("3D Tiles layer for test");
        expect(catalogRecords[0].serviceType).toEqual("3dtiles");
        expect(catalogRecords[0].isValid).toEqual(true);
        expect(catalogRecords[0].format).toEqual('3D Tiles');
        expect(catalogRecords[0].catalogType).toEqual('csw');
    });
    it('csw with DC references', () => {
        const records = getCatalogRecords({
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
        const records = getCatalogRecords({
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
        const records = getCatalogRecords({
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

    it('csw with DC references with implicit name in wms URI (RNDT / INSPIRE)', () => {
        const wmsReferences = [{
            type: "OGC:WMS",
            url: "http://geoserver/wms?SERVICE=WMS&VERSION=1.3.0",
            SRS: [],
            params: {
                name: "workspace:layer"
            }
        }];
        const records = getCatalogRecords({
            records: [{
                dc: {
                    URI: [
                        {
                            TYPE_NAME: 'DC_1_1.URI',
                            protocol: 'http://www.opengis.net/def/serviceType/ogc/wms',
                            description: 'access point',
                            value: 'http://geoserver/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=workspace:layer'
                        }
                    ]
                }
            }]
        }, {});
        expect(records.length).toBe(1);
        expect(records[0].references).toEqual(wmsReferences);
    });

    it('csw with DC references with implicit name in wms URI (RNDT / INSPIRE) - download link - no title', () => {
        const locales = {
            catalog: {
                notAvailable: "Not Available"
            }
        };
        const records = getCatalogRecords({
            records: [{
                dc: {
                    URI: [
                        {
                            protocol: 'https://registry.geodati.gov.it/metadata-codelist/ProtocolValue/www-download',
                            description: 'access point',
                            value: 'http://gisdata.provider.host/shp/test_layer.zip'
                        }
                    ]
                }
            }]
        }, {}, locales);
        const resourceLink = '<ul><li><a target="_blank" href="http://gisdata.provider.host/shp/test_layer.zip">Not Available - Download</a></li></ul>';
        expect(records.length).toBe(1);
        expect(records[0].metadata.uri.length).toBe(1);
        expect(records[0].metadata.uri[0]).toBe(resourceLink);
    });

    it('csw with DC references with implicit name in wms URI (RNDT / INSPIRE) - download link - value only', () => {
        const records = getCatalogRecords({
            records: [{
                dc: {
                    title: 'Test Layer',
                    URI: [
                        {
                            protocol: 'http://www.opengis.net/def/serviceType/ogc/wms',
                            value: 'http://gisdata.provider.host/geoserver/wms?tiled=true&version=1.1.1'
                        }
                    ]
                }
            }]
        }, {});
        const resourceLink = '<ul><li><a target="_blank" href="http://gisdata.provider.host/geoserver/wms?tiled=true&version=1.1.1">Test Layer - WMS</a></li></ul>';
        expect(records.length).toBe(1);
        expect(records[0].metadata.uri.length).toBe(1);
        expect(records[0].metadata.uri[0]).toBe(resourceLink);
    });

    it('csw with DC references, no url, no options, with uri', () => {
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
        const records = getCatalogRecords({ records: cswRecords });
        expect(records.length).toBe(1);
        expect(records[0].thumbnail).toBe("/thumb");
    });

    it('csw with DC references, no url, with thumbnail, with uri', () => {
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
        const records = getCatalogRecords({ records: cswRecords }, {});
        expect(records.length).toBe(1);
        expect(records[0].thumbnail).toBe("/thumb");
    });

    it('csw with DC references, with url, with options, with uri', () => {
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
        const records = getCatalogRecords({ records: cswRecords }, { url });
        expect(records.length).toBe(1);
        expect(records[0].thumbnail).toBe(url + cswRecords[0].dc.URI[0].value);
    });

    it('csw with DC references, with url, with options, no uri', () => {
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
        const cswData = map(cswRecords, clone);
        delete cswData[0].dc.URI;
        const records = getCatalogRecords({ records: cswData }, { url });
        expect(records.length).toBe(1);
        expect(records[0].thumbnail).toBe(cswRecords[0].dc.references[0].value);
    });

    it('csw with DC references with image mime protocol url and no thumbnail', () => {
        const url = "http://some.url";
        const cswRecordsLocal = [{
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
                    protocol: 'image/png',
                    value: "/thumb"
                }]
            }
        }];
        const records = getCatalogRecords({ records: cswRecordsLocal }, { url });
        expect(records.length).toBe(1);
        expect(records[0].thumbnail).toBe(url + cswRecordsLocal[0].dc.URI[0].value);
    });

    it('csw with DC references with image mime protocol url and thumbnail', () => {
        const url = "http://some.url";
        const cswRecordsLocal = [{
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
                    protocol: 'image/png',
                    value: "/thumbimage"
                }, {
                    name: "thumbnail",
                    scheme: "WWW:LINK-1.0-http--image-thumbnail",
                    value: "/thumb"
                }]
            }
        }];
        const records = getCatalogRecords({ records: cswRecordsLocal }, { url });
        expect(records.length).toBe(1);
        expect(records[0].thumbnail).toBe(url + cswRecordsLocal[0].dc.URI[1].value);
    });

    it('csw with DC references with image mime protocol url and with a named image but not a thumbnail', () => {
        const url = "http://some.url";
        const cswRecordsLocal = [{
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
                    protocol: 'image/png',
                    value: "/thumbimage"
                }, {
                    name: "someImage",
                    scheme: "WWW:LINK-1.0-http--image-thumbnail",
                    value: "/thumb"
                }]
            }
        }];
        const records = getCatalogRecords({ records: cswRecordsLocal }, { url });
        expect(records.length).toBe(1);
        expect(records[0].thumbnail).toBe(url + cswRecordsLocal[0].dc.URI[0].value);
    });

    it('csw correctly retrive layer name and thumb from pycsw', () => {
        const records = getCatalogRecords({
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
