/**
  * Copyright 2020, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import expect from 'expect';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../../libs/ajax';

import {
    executeProcess,
    makeOutputsExtractor,
    literalDataOutputExtractor
} from '../execute';

let mockAxios;

const mockXML = `<?xml version="1.0" encoding="UTF-8"?>
<wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">
 <ows:Identifier>TestProcess</ows:Identifier>
 <wps:DataInputs>
  <wps:Input>
   <ows:Identifier>input</ows:Identifier>
   <wps:Data>
    <wps:LiteralData>testData</wps:LiteralData>
   </wps:Data>
  </wps:Input>
 </wps:DataInputs>
 <wps:ResponseForm>
  <wps:RawDataOutput mimeType="text/plain">
   <ows:Identifier>result</ows:Identifier>
  </wps:RawDataOutput>
 </wps:ResponseForm>
</wps:Execute>`;

const responseWithComplexDataOutput = `<?xml version="1.0" encoding="UTF-8"?>
<wps:ExecuteResponse xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:xlink="http://www.w3.org/1999/xlink" xml:lang="en" service="WPS" serviceInstance="http://testserver/geoserver/ows?" statusLocation="http://testserver/geoserver/ows?service=WPS&amp;version=1.0.0&amp;request=GetExecutionStatus&amp;executionId=0c596a4d-7ddb-4a4e-bf35-4a64b47ee0d3" version="1.0.0">
  <wps:Process wps:processVersion="1.0.0">
      <ows:Identifier>TestProcess</ows:Identifier>
      <ows:Title>test</ows:Title>
  </wps:Process>
  <wps:Status creationTime="2016-08-08T11:18:46.015Z">
      <wps:ProcessSucceeded>Process succeeded.</wps:ProcessSucceeded>
  </wps:Status>
  <wps:ProcessOutputs>
      <wps:Output>
          <ows:Identifier>result</ows:Identifier>
          <ows:Title>Zipped output files to download</ows:Title>
          <wps:Data>
              <wps:ComplexData encoding="base64" mimeType="application/zip">U2VjcmV0WklQ</wps:ComplexData>
          </wps:Data>
      </wps:Output>
  </wps:ProcessOutputs>
</wps:ExecuteResponse>`;

const responseWithLiteralDataOutput = `<?xml version="1.0" encoding="UTF-8"?>
<wps:ExecuteResponse xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:xlink="http://www.w3.org/1999/xlink" xml:lang="en" service="WPS" serviceInstance="http://testserver/geoserver/ows?" statusLocation="http://testserver/geoserver/ows?service=WPS&amp;version=1.0.0&amp;request=GetExecutionStatus&amp;executionId=0c596a4d-7ddb-4a4e-bf35-4a64b47ee0d3" version="1.0.0">
  <wps:Process wps:processVersion="1.0.0">
      <ows:Identifier>TestProcess</ows:Identifier>
      <ows:Title>test</ows:Title>
  </wps:Process>
  <wps:Status creationTime="2016-08-08T11:18:46.015Z">
      <wps:ProcessSucceeded>Process succeeded.</wps:ProcessSucceeded>
  </wps:Status>
  <wps:ProcessOutputs>
      <wps:Output>
          <ows:Identifier>result</ows:Identifier>
          <ows:Title>Zipped output files to download</ows:Title>
          <wps:Data>
              <wps:LiteralData>someData</wps:LiteralData>
          </wps:Data>
      </wps:Output>
  </wps:ProcessOutputs>
</wps:ExecuteResponse>`;

const responseWithProcessAccepted = `<?xml version="1.0" encoding="UTF-8"?>
<wps:ExecuteResponse xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:xlink="http://www.w3.org/1999/xlink" xml:lang="en" service="WPS" serviceInstance="http://testserver/geoserver/ows?" statusLocation="http://testserver/geoserver/ows?service=WPS&amp;version=1.0.0&amp;request=GetExecutionStatus&amp;executionId=0c596a4d-7ddb-4a4e-bf35-4a64b47ee0d3" version="1.0.0">
  <wps:Process wps:processVersion="1.0.0">
      <ows:Identifier>TestProcess</ows:Identifier>
      <ows:Title>test</ows:Title>
  </wps:Process>
  <wps:Status creationTime="2016-08-08T11:18:46.015Z">
      <wps:ProcessAccepted>Process succeeded.</wps:ProcessAccepted>
  </wps:Status>
</wps:ExecuteResponse>`;

const responseWithProcessStarted = `<?xml version="1.0" encoding="UTF-8"?>
<wps:ExecuteResponse xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:xlink="http://www.w3.org/1999/xlink" xml:lang="en" service="WPS" serviceInstance="http://testserver/geoserver/ows?"  version="1.0.0">
  <wps:Process wps:processVersion="1.0.0">
      <ows:Identifier>TestProcess</ows:Identifier>
      <ows:Title>test</ows:Title>
  </wps:Process>
  <wps:Status creationTime="2016-08-08T11:18:46.015Z">
      <wps:ProcessStarted/>
  </wps:Status>
</wps:ExecuteResponse>`;


describe('WPS execute tests', () => {
    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });
    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
    });
    it('executeProcess with text/plain response', (done) => {
        mockAxios.onPost().reply(200, 'responseText', {'content-type': 'text/plain'});
        executeProcess('http://testurl', mockXML).subscribe(
            result => {
                try {
                    expect(result).toBe('responseText');
                    done();
                } catch (e) {
                    done(e);
                }
            },
            error => {
                done(error);
            }
        );
    });
    it('executeProcess with application/xml response', (done) => {
        const responseXML = `<?xml version="1.0" encoding="UTF-8"?><SomeTag>data</SomeTag>`;
        mockAxios.onPost().reply(200, responseXML, {'content-type': 'application/xml'});
        executeProcess('http://testurl', mockXML).subscribe(
            result => {
                try {
                    expect(result).toBe(responseXML);
                    done();
                } catch (e) {
                    done(e);
                }
            },
            error => {
                done(error);
            }
        );
    });
    it('executeProcess with ProcessSucceeded response', (done) => {
        mockAxios.onPost().reply(200, responseWithComplexDataOutput, {'content-type': 'application/xml'});
        executeProcess('http://testurl', mockXML).subscribe(
            result => {
                try {
                    expect(result).toExist();
                    expect(result.length).toBe(1);
                    expect(result[0].Identifier?.[0]).toExist();
                    expect(result[0].Data?.[0]?.ComplexData).toExist();
                    done();
                } catch (e) {
                    done(e);
                }
            },
            error => {
                done(error);
            }
        );
    });
    it('executeProcess with multiple status checks', (done) => {
        const statusResponses = [
            responseWithProcessStarted,
            responseWithProcessStarted,
            responseWithComplexDataOutput
        ];

        mockAxios.onPost().reply(200, responseWithProcessAccepted, {'content-type': 'application/xml'});
        mockAxios.onGet().reply((config) => {

            const expectedUrl = 'http://testserver/?service=WPS&version=1.0.0&REQUEST=GetExecutionStatus&executionId=0c596a4d-7ddb-4a4e-bf35-4a64b47ee0d3';
            const responseData = statusResponses.shift();

            try {
                expect(config.url).toBe(expectedUrl);
            } catch (e) {
                done(e);
            }

            return [200, responseData, {'content-type': 'application/xml'}];
        });

        executeProcess('http://testserver', mockXML, {executeStatusUpdateInterval: 0}).subscribe(
            result => {
                try {
                    expect(result).toExist();
                    expect(result.length).toBe(1);
                    expect(result[0].Identifier?.[0]).toExist();
                    expect(result[0].Data?.[0]?.ComplexData).toExist();
                    done();
                } catch (e) {
                    done(e);
                }
            },
            error => {
                done(error);
            }
        );
    });
    it('executeProcess with outputsExtractor', (done) => {
        const outputsExtractor = makeOutputsExtractor(literalDataOutputExtractor);

        mockAxios.onPost().reply(200, responseWithLiteralDataOutput, { 'content-type': 'application/xml' });

        executeProcess('http://testurl', mockXML, {outputsExtractor}).subscribe(
            result => {
                try {
                    expect(result).toExist();
                    expect(result.length).toBe(1);
                    expect(result[0].identifier).toBe('result');
                    expect(result[0].data).toBe('someData');
                    done();
                } catch (e) {
                    done(e);
                }
            },
            error => {
                done(error);
            }
        );
    });
});
