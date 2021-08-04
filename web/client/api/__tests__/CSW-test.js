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

import API from '../CSW';

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
                expect(rec0.dc.URI).toExist();
                expect(rec0.dc.URI[0]);
                expect(rec0.boundingBox).toExist();
                expect(rec0.boundingBox.crs).toBe('EPSG:4326');
                expect(rec0.boundingBox.extent).toEqual([45.542, 11.874, 46.026, 12.718]);
                const uri = rec0.dc.URI[0];
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

describe('workspaceSearch', () => {
    let mockAxios;
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });
    afterEach(() => {
        mockAxios.restore();
    });
    it('workspaceSearch', (done) => {
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
