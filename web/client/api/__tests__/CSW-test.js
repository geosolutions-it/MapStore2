/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import axios from '../../libs/ajax';
import MockAdapter from 'axios-mock-adapter';
import GRDCResponse from 'raw-loader!../../test-resources/csw/getRecordsResponseDC.xml';
import GRDCResponseWith3DLayersAt1st from 'raw-loader!../../test-resources/csw/getRecordsResponseDCWith3DLayersAt1st.xml';
import GRDCResponseWith3DLayersAtMiddle from 'raw-loader!../../test-resources/csw/getRecordsResponseDCWith3DLayersAtMiddle.xml';
import GRDCResponseWith3DLayersAtLast from 'raw-loader!../../test-resources/csw/getRecordsResponseDCWith3DLayersAtLast.xml';
import API, {constructXMLBody, getLayerReferenceFromDc } from '../CSW';

import tileSetResponse from '../../test-resources/3dtiles/tileSetSample2.json';

let mockAxios;

describe('Test correctness of the CSW APIs', () => {
    it('getRecords ISO Metadata Profile', (done) => {
        API.getRecords('base/web/client/test-resources/csw/getRecordsResponseISO.xml', 1, 1).then((result) => {
            try {
                expect(result).toExist();
                expect(result.records).toExist();
                expect(result.records.length).toBe(1);
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('getRecords Error', (done) => {
        API.getRecords('base/web/client/test-resources/csw/getRecordsResponseException.xml', 1, 1).then((result) => {
            try {
                expect(result).toExist();
                expect(result.error).toExist();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('getRecords Dublin Core', (done) => {
        API.getRecords('base/web/client/test-resources/csw/getRecordsResponseDC.xml', 1, 2).then((result) => {
            try {
                expect(result).toExist();
                expect(result.records).toExist();
                expect(result.records.length).toBe(4);
                const [rec0, rec1, rec2, rec3] = result.records;

                expect(rec0.dc).toExist();
                expect(rec0.boundingBox).toExist();
                expect(rec0.boundingBox.crs).toBe('EPSG:4326');
                expect(rec0.boundingBox.extent).toEqual([45.542, 11.874, 46.026, 12.718]);

                expect(rec1.dc.URI).toExist();
                expect(rec1.dc.URI[0]).toExist();
                const uri = rec1.dc.URI[0];
                expect(uri.name).toExist();
                expect(uri.value).toExist();
                expect(uri.description).toExist();
                expect(rec1.boundingBox).toExist();
                expect(rec1.boundingBox.crs).toBe('EPSG:4326');
                expect(rec1.boundingBox.extent).toEqual([12.002717999999996, 45.760718, 12.429282000000002, 46.187282]);

                expect(rec2.boundingBox).toExist();
                expect(rec2.boundingBox.crs).toBe('EPSG:4326');
                expect(rec2.boundingBox.extent).toEqual([ -4.14168, 47.93257, -4.1149, 47.959353362144 ]);

                expect(rec3.boundingBox).toExist();
                expect(rec3.boundingBox.crs).toBe('EPSG:4326');
                expect(rec3.boundingBox.extent).toEqual([ 12.56, 47.46, 13.27, 48.13 ]);
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('getRecordsById ISO Metadata Profile', (done) => {
        API.getRecordById('base/web/client/test-resources/csw/getRecordById.xml').then((result) => {
            try {
                expect(result).toExist();
                expect(result.dc).toExist();
                expect(result.dc.identifier).toBe("msg_rss_micro");
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('getRecordsById Error', (done) => {
        API.getRecordById('base/web/client/test-resources/csw/getRecordsResponseException.xml').then((result) => {
            try {
                expect(result).toExist();
                expect(result.error).toExist();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
});

describe('Test capabilities data in CSW records', () => {
    const options = {options: {service: {autoSetVisibilityLimits: true}}};
    it('getRecords update capabilities when autoSetVisibilityLimits is true', (done) => {
        API.getRecords('base/web/client/test-resources/csw/getRecordsResponseDC.xml', 1, 1, null, options)
            .then((result) => {
                try {
                    expect(result).toBeTruthy();
                    expect(result.records[0]).toBeTruthy();
                    expect(result.records[0].capabilities).toBeTruthy();
                    done();
                } catch (ex) {
                    done(ex);
                }
            });
    });
    it('getRecords skip capabilities update', (done) => {
        API.getRecords('base/web/client/test-resources/csw/getRecordsResponseDC.xml', 1, 1).then((result) => {
            try {
                expect(result).toBeTruthy();
                expect(result.records).toBeTruthy();
                expect(result.records[0].capabilities).toBeFalsy();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('does not include capabilities when no parsedUrl in getRecords', (done) => {
        API.getRecords('base/web/client/test-resources/csw/getRecordsNoWMS.xml', 1, 1, null, options).then((result) => {
            try {
                expect(result).toBeTruthy();
                expect(result.records[0].capabilities).toBeFalsy();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
    it('obtains parsedUrl from dc:uri and gets capabilities', (done) => {
        API.getRecords('base/web/client/test-resources/csw/getRecordsWithDcURI.xml', 1, 1, null, options)
            .then((result) => {
                try {
                    expect(result).toBeTruthy();
                    expect(result.records[0].capabilities).toBeTruthy();
                    done();
                } catch (ex) {
                    done(ex);
                }
            });
    });
    it("dc:uri do not add capabilities when layer name doesn't match", (done) => {
        API.getRecords('base/web/client/test-resources/csw/getRecordsWithDcURI.xml', 1, 2, null, options)
            .then((result) => {
                try {
                    expect(result).toBeTruthy();
                    expect(result.records[1].capabilities).toBeFalsy();
                    done();
                } catch (ex) {
                    done(ex);
                }
            });
    });
});


describe('tests with mockedActions', () => {
    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });
    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
    });
    describe('workspaceSearch', () => {
        it('workspaceSearch test', (done) => {
            mockAxios.onPost().reply( (config) => {
                expect(config.data).toEqual(
                    "<csw:GetRecords xmlns:csw=\"http://www.opengis.net/cat/csw/2.0.2\" "
                    + "xmlns:ogc=\"http://www.opengis.net/ogc\" "
                    + "xmlns:gml=\"http://www.opengis.net/gml\" "
                    + "xmlns:dc=\"http://purl.org/dc/elements/1.1/\" "
                    + "xmlns:dct=\"http://purl.org/dc/terms/\" "
                    + "xmlns:gmd=\"http://www.isotc211.org/2005/gmd\" "
                    + "xmlns:gco=\"http://www.isotc211.org/2005/gco\" "
                    + "xmlns:gmi=\"http://www.isotc211.org/2005/gmi\" "
                    + "xmlns:ows=\"http://www.opengis.net/ows\" service=\"CSW\" "
                    + "version=\"2.0.2\" resultType=\"results\" startPosition=\"1\" "
                    + "maxRecords=\"1\">"
                    +    "<csw:Query typeNames=\"csw:Record\"><csw:ElementSetName>full</csw:ElementSetName>"
                    +       "<csw:Constraint version=\"1.1.0\"><ogc:Filter><ogc:PropertyIsLike wildCard=\"%\" singleChar=\"_\" escapeChar=\"\\\\\">"
                    +       "<ogc:PropertyName>dc:identifier</ogc:PropertyName><ogc:Literal>wp:%test%</ogc:Literal></ogc:PropertyIsLike>"
                    +       "</ogc:Filter></csw:Constraint>"
                    +    "</csw:Query>"
                    + "</csw:GetRecords>"
                );
                return [200, GRDCResponse];
            });
            API.workspaceSearch('/TESTURL', 1, 1, "test", "wp").then((data) => {
                expect(data).toExist();
                expect(data.records).toExist();
                expect(data.records.length).toBe(4);
                done();
            });
        });
    });
    describe("getRecords for 3D layers", () => {
        const threeDLayerRecord = {
            "boundingBox": {
                "extent": [
                    11.244154369601063,
                    43.75907090685874,
                    11.265929832205956,
                    43.78084636946362
                ],
                "crs": "EPSG:4326"
            },
            "dc": {
                "references": [],
                "identifier": "test:20230829_test_3dtile_01",
                "date": "2023-09-22",
                "title": "Metadato di test per 3D-tile",
                "abstract": "Breve descrizione della risorsa",
                "description": "Breve descrizione della risorsa",
                "type": "dataset",
                "subject": [
                    "Zone a rischio naturale",
                    "health"
                ],
                "format": "3D Tiles",
                "contributor": "Nome dell'ufficio responsabile del dato",
                "rights": [
                    "otherRestrictions",
                    "otherRestrictions"
                ],
                "language": "ita",
                "source": "Descrizione della provenienza e del processo di produzione del dato (storia, ciclo di vita, rilevazione, acquisizione, forma attuale, qualità richiesta per garantirne l'interoperabilità)",
                "temporal": "start=2009-01-01; end=2013-12-31",
                "URI": {
                    "TYPE_NAME": "DC_1_1.URI",
                    "protocol": "https://registry.geodati.gov.it/metadata-codelist/ProtocolValue/www-download",
                    "description": "access point",
                    "value": "https://3d-layers.s3.eu-central-1.amazonaws.com/3dtiles/centro_storico_di_firenze_-_brass_city_model/tileset.json"
                }
            }
        };
        it('test getRecords that contain 3D tile layers at 1st index ', (done) => {
            mockAxios.onPost().replyOnce(()=>{
                return [200, GRDCResponseWith3DLayersAt1st];
            });
            mockAxios.onGet().reply(()=>{
                return [200, tileSetResponse];
            });
            API.getRecords('base/web/client/test-resources/csw/getRecordsResponseDCWith3DLayersAt1st.xml', 1, 2).then((result) => {
                try {
                    expect(result).toExist();
                    expect(result.records).toExist();
                    expect(result.records.length).toBe(4);
                    const [rec0, rec1, rec2, rec3] = result.records;
                    expect(rec0.dc.format).toEqual("3D Tiles");
                    expect(rec0.boundingBox).toExist();
                    expect(rec0.boundingBox.crs).toBe('EPSG:4326');
                    expect(rec0.boundingBox.extent[0]).toEqual(threeDLayerRecord.boundingBox.extent[0]);
                    expect(rec0.boundingBox.extent[1]).toEqual(threeDLayerRecord.boundingBox.extent[1]);
                    expect(rec0.boundingBox.extent[2]).toEqual(threeDLayerRecord.boundingBox.extent[2]);
                    expect(rec0.boundingBox.extent[3]).toEqual(threeDLayerRecord.boundingBox.extent[3]);
                    expect(rec1.dc).toExist();
                    expect(rec1.boundingBox).toExist();
                    expect(rec1.boundingBox.crs).toBe('EPSG:4326');
                    expect(rec1.boundingBox.extent).toEqual([45.542, 11.874, 46.026, 12.718]);
                    expect(rec2.boundingBox).toExist();
                    expect(rec2.boundingBox.crs).toBe('EPSG:4326');
                    expect(rec2.boundingBox.extent).toEqual([ 12.002717999999996, 45.760718, 12.429282000000002, 46.187282]);
                    expect(rec3.boundingBox).toExist();
                    expect(rec3.boundingBox.crs).toBe('EPSG:4326');
                    expect(rec3.boundingBox.extent).toEqual([ -4.14168, 47.93257, -4.1149, 47.959353362144 ]);
                    done();
                } catch (ex) {
                    done(ex);
                }
            }).catch(ex=>{
                done(ex);
            });
        });
        it('test getRecords that contain 3D tile layers at last index', (done) => {
            mockAxios.onPost().replyOnce(()=>{
                return [200, GRDCResponseWith3DLayersAtLast];
            });
            mockAxios.onGet().reply(()=>{
                return [200, tileSetResponse];
            });
            API.getRecords('base/web/client/test-resources/csw/getRecordsResponseDCWith3DLayersAtLast.xml', 1, 2).then((result) => {
                try {
                    expect(result).toExist();
                    expect(result.records).toExist();
                    expect(result.records.length).toBe(4);
                    const [rec0, rec1, rec2, rec3] = result.records;
                    expect(rec0.dc).toExist();
                    expect(rec0.boundingBox).toExist();
                    expect(rec0.boundingBox.crs).toBe('EPSG:4326');
                    expect(rec0.boundingBox.extent).toEqual([45.542, 11.874, 46.026, 12.718]);
                    expect(rec1.dc.URI).toExist();
                    expect(rec1.dc.URI[0]).toExist();
                    const uri = rec1.dc.URI[0];
                    expect(uri.name).toExist();
                    expect(uri.value).toExist();
                    expect(uri.description).toExist();
                    expect(rec1.boundingBox).toExist();
                    expect(rec1.boundingBox.crs).toBe('EPSG:4326');
                    expect(rec1.boundingBox.extent).toEqual([ 12.002717999999996, 45.760718, 12.429282000000002, 46.187282]);
                    expect(rec2.boundingBox).toExist();
                    expect(rec2.boundingBox.crs).toBe('EPSG:4326');
                    expect(rec2.boundingBox.extent).toEqual([ -4.14168, 47.93257, -4.1149, 47.959353362144 ]);
                    expect(rec3.dc.format).toEqual("3D Tiles");
                    expect(rec3.boundingBox).toExist();
                    expect(rec3.boundingBox.crs).toBe('EPSG:4326');
                    expect(rec3.boundingBox.extent[0]).toEqual(threeDLayerRecord.boundingBox.extent[0]);
                    expect(rec3.boundingBox.extent[1]).toEqual(threeDLayerRecord.boundingBox.extent[1]);
                    expect(rec3.boundingBox.extent[2]).toEqual(threeDLayerRecord.boundingBox.extent[2]);
                    expect(rec3.boundingBox.extent[3]).toEqual(threeDLayerRecord.boundingBox.extent[3]);
                    done();
                } catch (ex) {
                    done(ex);
                }
            }).catch(ex=>{
                done(ex);
            });
        });
        it('test getRecords that contain 3D tile layers at the middle', (done) => {
            mockAxios.onPost().replyOnce(()=>{
                return [200, GRDCResponseWith3DLayersAtMiddle];
            });
            mockAxios.onGet().reply(()=>{
                return [200, tileSetResponse];
            });
            API.getRecords('base/web/client/test-resources/csw/getRecordsResponseDCWith3DLayersAtMiddle.xml', 1, 2).then((result) => {
                try {
                    expect(result).toExist();
                    expect(result.records).toExist();
                    expect(result.records.length).toBe(3);
                    const [rec0, rec1, rec2] = result.records;
                    expect(rec0.dc).toExist();
                    expect(rec0.boundingBox).toExist();
                    expect(rec0.boundingBox.crs).toBe('EPSG:4326');
                    expect(rec0.boundingBox.extent).toEqual([45.542, 11.874, 46.026, 12.718]);
                    expect(rec1.dc.format).toEqual("3D Tiles");
                    expect(rec1.boundingBox).toExist();
                    expect(rec1.boundingBox.crs).toBe('EPSG:4326');
                    expect(rec1.boundingBox.extent[0]).toEqual(threeDLayerRecord.boundingBox.extent[0]);
                    expect(rec1.boundingBox.extent[1]).toEqual(threeDLayerRecord.boundingBox.extent[1]);
                    expect(rec1.boundingBox.extent[2]).toEqual(threeDLayerRecord.boundingBox.extent[2]);
                    expect(rec1.boundingBox.extent[3]).toEqual(threeDLayerRecord.boundingBox.extent[3]);
                    expect(rec2.dc.URI).toExist();
                    expect(rec2.dc.URI[0]).toExist();
                    const uri = rec2.dc.URI[0];
                    expect(uri.name).toExist();
                    expect(uri.value).toExist();
                    expect(uri.description).toExist();
                    expect(rec2.boundingBox).toExist();
                    expect(rec2.boundingBox.crs).toBe('EPSG:4326');
                    expect(rec2.boundingBox.extent).toEqual([ 12.002717999999996, 45.760718, 12.429282000000002, 46.187282]);
                    done();
                } catch (ex) {
                    done(ex);
                }
            }).catch(ex=>{
                done(ex);
            });
        });
    });
});


describe("constructXMLBody", () => {
    it("construct body without PropertyIsLike when there is no search text", () => {
        const body = constructXMLBody(1, 5, null);
        expect(body.indexOf("PropertyIsLike")).toBe(-1);
    });

    it("construct body with PropertyIsLike when there is search text", () => {
        const body = constructXMLBody(1, 5, "text");
        expect(body.indexOf("PropertyIsLike")).toNotBe(-1);
    });

    it("construct body with PropertyIsEqualTo always", () => {
        const body = constructXMLBody(1, 5, "text");
        expect(body.indexOf("PropertyIsEqualTo")).toNotBe(-1);

        const body2 = constructXMLBody(1, 5, null);
        expect(body2.indexOf("PropertyIsEqualTo")).toNotBe(-1);
    });
    it("construct body with custom filter", () => {
        const filter = {
            staticFilter: "<ogc:Or><ogc:PropertyIsEqualTo><ogc:PropertyName>dc:type</ogc:PropertyName><ogc:Literal>dataset</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Or>",
            dynamicFilter: "<ogc:PropertyIsLike wildCard='*' singleChar='_' escapeChar='\\'><ogc:PropertyName>csw:AnyText</ogc:PropertyName><ogc:Literal>${searchText}*</ogc:Literal></ogc:PropertyIsLike>"
        };
        // With search text
        let body = constructXMLBody(1, 5, "text", {filter});

        expect(body.indexOf("text*")).toNotBe(-1); // Dynamic filter

        // Empty search
        body = constructXMLBody(1, 5, null);
        expect(body.indexOf("dc:type")).toNotBe(-1); // Static filter
        expect(body.indexOf("text*")).toBe(-1); // Dynamic filter
    });
});

describe("getLayerReferenceFromDc", () => {
    it("test layer reference with dc.references of scheme OGC:WMS", () => {
        const dc = {references: [{value: "http://wmsurl", scheme: 'OGC:WMS'}, {value: "wfsurl", scheme: 'OGC:WFS'}], alternative: "some_layer"};
        const layerRef = getLayerReferenceFromDc(dc);
        expect(layerRef.params.name).toBe('some_layer');
        expect(layerRef.type).toBe('OGC:WMS');
        expect(layerRef.url).toBe('http://wmsurl');
    });
    it("test layer reference with dc.references of scheme OGC:WMS-http-get-map", () => {
        const dc = {references: [{value: "http://wmsurl", scheme: 'OGC:WMS-http-get-map'}, {value: "wfsurl", scheme: 'OGC:WFS'}], alternative: "some_layer"};
        const layerRef = getLayerReferenceFromDc(dc);
        expect(layerRef.params.name).toBe('some_layer');
        expect(layerRef.type).toBe('OGC:WMS-http-get-map');
        expect(layerRef.url).toBe('http://wmsurl');
    });
    it("test layer reference with dc.URI of scheme serviceType/ogc/wms and options", () => {
        const dc = {URI: [{value: "wmsurl?service=wms&layers=some_layer&version=1.3.0", protocol: 'serviceType/ogc/wms'}, {value: "wfsurl", protocol: 'OGC:WFS'}]};
        const layerRef = getLayerReferenceFromDc(dc, {catalogURL: "catalog_url"});
        expect(layerRef.params.name).toBe('some_layer');
        expect(layerRef.type).toBe('OGC:WMS');
        expect(layerRef.url).toBe('catalog_url/wmsurl?SERVICE=WMS&VERSION=1.3.0');
    });
    it("test layer reference with multiple dc.URI of scheme OGC:WMS", () => {
        const dc = {URI: [{value: "http://wmsurl", protocol: 'OGC:WMS', name: 'some_layer'}, {value: "wfsurl", protocol: 'OGC:WFS'}]};
        const layerRef = getLayerReferenceFromDc(dc);
        expect(layerRef.params.name).toBe('some_layer');
        expect(layerRef.type).toBe('OGC:WMS');
        expect(layerRef.url).toBe('http://wmsurl');
    });
    it("test layer reference with single dc.URI of scheme OGC:WMS", () => {
        const dc = {URI: {value: "http://wmsurl", protocol: 'OGC:WMS', name: 'some_layer'}};
        const layerRef = getLayerReferenceFromDc(dc);
        expect(layerRef.params.name).toBe('some_layer');
        expect(layerRef.type).toBe('OGC:WMS');
        expect(layerRef.url).toBe('http://wmsurl');
    });
    it("test layer reference with dc.references of scheme WWW:DOWNLOAD-REST_MAP", () => {
        const dc = {references: [{value: "http://esri_url", scheme: 'WWW:DOWNLOAD-REST_MAP'}, {value: "wfsurl", protocol: 'OGC:WFS'}], alternative: "some_layer"};
        const layerRef = getLayerReferenceFromDc(dc);
        expect(layerRef.params.name).toBe('some_layer');
        expect(layerRef.type).toBe('arcgis');
        expect(layerRef.url).toBe('http://esri_url');
    });

});


