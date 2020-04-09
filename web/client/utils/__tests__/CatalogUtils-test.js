/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import {map, clone} from 'lodash';
import { compose, set } from '../ImmutableUtils';

import CatalogUtils from '../CatalogUtils';
import ConfigUtils from '../ConfigUtils';
import TileMapSample from '../../test-resources/tms/TileMapSample';


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
    it('wms multiple urls', () => {
        const records = CatalogUtils.getCatalogRecords('wms', {
            records: [{}]
        }, { url: 'http://sample1, http://sample2' });
        expect(records.length).toBe(1);
        const layer = CatalogUtils.recordToLayer(records[0]);
        expect(layer.url.length).toBe(2);
        expect(layer.url[0]).toBe('http://sample1');
        expect(layer.url[1]).toBe('http://sample2');

    });

    it('wms layer options', () => {
        const records = CatalogUtils.getCatalogRecords('wms', {
            records: [{}]
        }, {
            url: 'http://sample',
            layerOptions: {
                tileSize: 512
            }
        });
        expect(records.length).toBe(1);
        const layer = CatalogUtils.recordToLayer(records[0]);
        expect(layer.tileSize).toBe(512);
    });

    it('wms with no ogcServiceReference.url', () => {
        const records = CatalogUtils.getCatalogRecords(
            'wms',
            {
                records: [{
                    SRS: ['EPSG:4326', 'EPSG:3857', 'EPSG:5041']
                }]
            }, {
                url: undefined
            });
        expect(records.length).toBe(1);
        const sampleUrl = "http://sample";
        const layer = CatalogUtils.recordToLayer(records[0], "wms", {catalogURL: sampleUrl});

        expect(layer.url).toBe(sampleUrl);
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
    it('wmts capabilities url', () => {
        const wmtsRecords = [{ GetTileURL: "tileURL"}];
        const records = CatalogUtils.getCatalogRecords('wmts', { records: wmtsRecords });
        expect(records.length).toBe(1);
        expect(records[0].capabilitiesURL).toBe("tileURL");
        const wmtsRecords2 = [{ GetTileURL: "tileURL", capabilitiesURL: "capURL" }];
        const records2 = CatalogUtils.getCatalogRecords('wmts', { records: wmtsRecords2 });
        expect(records2.length).toBe(1);
        expect(records2[0].capabilitiesURL).toBe("capURL");
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
    describe('tms and tileProvider', () => {
        const TMS_DATA = { records: [{
            title: "TEST_TITLE",
            href: "TEST_HREF",
            srs: "EPSG:4326"
        }]};
        const TILEPROVIDER_DATA = {
            records: [{
                provider: "provider.variant",
                options: {
                    subdomains: ['a']
                }
            }]
        };
        const OPTIONS_TMS = {
            tmsUrl: "TMS_URL",
            url: "SomeURL",
            service: {provider: "tms"}
        };
        const OPTIONS_TILEPROVIDER = {

        };

        it('getCatalogRecords tileProvider', () => {
            const res = CatalogUtils.getCatalogRecords('tms', TILEPROVIDER_DATA, OPTIONS_TILEPROVIDER);
            const rec = res[0];
            expect(res[0]).toBeTruthy();
            expect(rec.title).toBe(TILEPROVIDER_DATA.records[0].provider);
            expect(rec.provider).toBe(TILEPROVIDER_DATA.records[0].provider);
            expect(rec.options).toBe(TILEPROVIDER_DATA.records[0].options);
            expect(rec.type).toBe("tileprovider");
        });
        it('getCatalogRecords TMS 1.0.0', () => {
            const res = CatalogUtils.getCatalogRecords('tms', TMS_DATA, OPTIONS_TMS);
            const rec = res[0];
            expect(res[0]).toBeTruthy();
            expect(rec.title).toBe(TMS_DATA.records[0].title);
            expect(rec.description).toBe(TMS_DATA.records[0].srs);
            expect(rec.tileMapUrl).toBe(TMS_DATA.records[0].href);
            expect(rec.references[0].url).toBe(OPTIONS_TMS.url);
            expect(rec.references[0].type).toBe("OGC:TMS");
            expect(rec.references[0].version).toBe("1.0.0");
        });
        it('getCatalogRecords TMS 1.0.0 (optional format in description)', () => {
            const res = CatalogUtils.getCatalogRecords('tms', {...TMS_DATA, records: [{
                ...TMS_DATA.records[0],
                format: "jpg"
            }]}, OPTIONS_TMS);
            const rec = res[0];
            expect(res[0]).toBeTruthy();
            expect(rec.title).toBe(TMS_DATA.records[0].title);
            expect(rec.description).toBe(TMS_DATA.records[0].srs + ", jpg");
            expect(rec.tileMapUrl).toBe(TMS_DATA.records[0].href);
            expect(rec.references[0].url).toBe(OPTIONS_TMS.url);
            expect(rec.references[0].type).toBe("OGC:TMS");
            expect(rec.references[0].version).toBe("1.0.0");
        });
        it('tmsToLayer', () => {


            // constants
            const RECORD = {
                tileMapUrl: "TEST"
            };
            const OPTIONS = {
                forceDefaultTileGrid: true
            };

            const layer = CatalogUtils.tmsToLayer(RECORD, TileMapSample, OPTIONS);
            const SRS = TileMapSample.TileMap.SRS;
            const { x, y } = TileMapSample.TileMap.Origin.$;
            const {minx, miny, maxx, maxy} = TileMapSample.TileMap.BoundingBox.$;
            expect(layer.type).toBe("tms");
            expect(layer.visibility).toBe(true);
            expect(layer.hideErrors).toBe(true); // avoid many error that can occour
            expect(layer.name).toBe(TileMapSample.TileMap.Title);
            expect(layer.title).toBe(TileMapSample.TileMap.Title);
            expect(layer.description).toBe(TileMapSample.TileMap.Abstract);
            expect(layer.srs).toBe(SRS);
            expect(layer.allowedSRS).toEqual({[SRS]: true});
            expect(layer.tileMapUrl).toExist(RECORD.tileMapUrl);
            expect(layer.forceDefaultTileGrid).toBe(OPTIONS.forceDefaultTileGrid);
            expect(layer.origin).toEqual({x: parseFloat(x), y: parseFloat(y)});
            expect(layer.bbox).toEqual({
                crs: SRS,
                bounds: {minx: parseFloat(minx), miny: parseFloat(miny), maxx: parseFloat(maxx), maxy: parseFloat(maxy)}
            });
        });
        it('tmsToLayer (authentication)', () => {
            // setup authentication
            const rules = ConfigUtils.getConfigProp('authenticationRules');
            ConfigUtils.setConfigProp('authenticationRules', [
                {
                    "urlPattern": ".*geoserver.*",
                    "method": "test",
                    "authkeyParamName": "authkey",
                    "token": "mykey"
                }
            ]);

            // constants
            const RECORD = {
                tileMapUrl: "TEST"
            };
            const OPTIONS = {
                forceDefaultTileGrid: true
            };
            // setup authenticated test file
            const TileMapServiceAuthenticated = compose(
                set('TileMap.$.tilemapservice', `${TileMapSample.TileMap.$.tilemapservice}?authkey=AUTHKEY`),
                set('TileMap.TileSets.TileSet', TileMapSample.TileMap.TileSets.TileSet.map(({$}) => {
                    return {
                        $: {
                            ...$,
                            href: `${$.href}?authkey=AUTHKEY`
                        }
                    };
                }))
            )(TileMapSample);
            ConfigUtils.setConfigProp('useAuthenticationRules', true);

            const layer = CatalogUtils.tmsToLayer(RECORD, TileMapServiceAuthenticated, OPTIONS);
            layer.tileSets.map(({href = ""}) => {
                expect(href.indexOf("authkey=")).toBe(-1);
            });
            expect(layer.tileMapService.indexOf("authkey=")).toBe(-1);
            expect(layer.tileMapService.indexOf(TileMapSample.TileMap.$.tilemapservice)).toBe(0);
            // tear down authentication
            ConfigUtils.setConfigProp('authenticationRules', rules); // restore old values
            ConfigUtils.setConfigProp('useAuthenticationRules', false);
        });
    });
    it('tileProviderToLayer', ( ) => {
        const RECORD = {
            url: "url",
            title: "title",
            options: {"options": "something"},
            provider: "provider"
        };
        const layer = CatalogUtils.tileProviderToLayer(RECORD);
        expect(layer.type).toBe("tileprovider");
        expect(layer.visibility).toBe(true);
        expect(layer.url).toBe(RECORD.url);
        expect(layer.title).toBe(RECORD.title);
        expect(layer.options).toBe(RECORD.options);
        expect(layer.provider).toBe(RECORD.provider);
        expect(layer.name).toBe(RECORD.provider);
    });
});
