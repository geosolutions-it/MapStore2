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
    downloadEstimatorXML,
    downloadXML,
    download
} from '../download';

let mockAxios;

const sampleFilter = {
    type: 'TEXT',
    data: {
        mimeType: 'text/xml; filter/1.0',
        data: `<ogc:Filter` +
            `xmlns:ogc="http://www.opengis.net/ogc"` +
            `xmlns:gml="http://www.opengis.net/gml">` +
            `<ogc:And>` +
                `<ogc:Intersects>` +
                    `<ogc:PropertyName>geom</ogc:PropertyName>` +
                    `<gml:Polygon srsName="EPSG:3857">` +
                        `<gml:outerBoundaryIs>` +
                            `<gml:LinearRing>` +
                                `<gml:coordinates>-13829598.653580368,6423156.360859931 -11452101.325798247,6413372.421239428 -12127193.159612924,5033836.934748568 -13898086.230923887,4945781.478164044 -13829598.653580368,6423156.360859931</gml:coordinates>` +
                            `</gml:LinearRing>` +
                        `</gml:outerBoundaryIs>` +
                    `</gml:Polygon>` +
                `</ogc:Intersects>` +
            `</ogc:And>` +
        `</ogc:Filter>`
    }
};
const sampleROI = {
    type: 'TEXT',
    data: {
        mimeType: 'application/wkt',
        data: 'POLYGON (( 500116.08576537756 499994.25579707103, 500116.08576537756 500110.1012210889, 500286.2657688021 500110.1012210889, 500286.2657688021 499994.25579707103, 500116.08576537756 499994.25579707103 ))'
    }
};
const downloadEstimatorSucceededResponse = `<?xml version="1.0" encoding="UTF-8"?>
<wps:ExecuteResponse
	xmlns:xs="http://www.w3.org/2001/XMLSchema"
	xmlns:ows="http://www.opengis.net/ows/1.1"
	xmlns:wps="http://www.opengis.net/wps/1.0.0"
	xmlns:xlink="http://www.w3.org/1999/xlink" xml:lang="en" service="WPS" serviceInstance="https://testserver/geoserver/ows?authkey=b5165fae-cdd9-48f1-ada5-da9c79e6c658&amp;" version="1.0.0">
	<wps:Process wps:processVersion="1.0.0">
		<ows:Identifier>gs:DownloadEstimator</ows:Identifier>
		<ows:Title>Estimator Process</ows:Title>
		<ows:Abstract>Checks if the input file does not exceed the limits</ows:Abstract>
	</wps:Process>
	<wps:Status creationTime="2020-11-18T10:27:39.759Z">
		<wps:ProcessSucceeded>Process succeeded.</wps:ProcessSucceeded>
	</wps:Status>
	<wps:ProcessOutputs>
		<wps:Output>
			<ows:Identifier>result</ows:Identifier>
			<ows:Title>Download Limits are respected or not!</ows:Title>
			<wps:Data>
				<wps:LiteralData>true</wps:LiteralData>
			</wps:Data>
		</wps:Output>
	</wps:ProcessOutputs>
</wps:ExecuteResponse>`;
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

describe('WPS download tests', () => {
    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });
    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
    });
    it('downloadEstimatorXML', () => {
        const options = {
            layerName: 'layer',
            dataFilter: sampleFilter,
            ROI: sampleROI,
            roiCRS: 'EPSG:3857',
            targetCRS: 'EPSG:4326'
        };
        const expectedResult = `<?xml version="1.0" encoding="UTF-8"?>` +
            `<wps:Execute version="1.0.0" service="WPS" ` +
            `xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ` +
            `xmlns="http://www.opengis.net/wps/1.0.0" ` +
            `xmlns:wfs="http://www.opengis.net/wfs" ` +
            `xmlns:wps="http://www.opengis.net/wps/1.0.0" ` +
            `xmlns:ows="http://www.opengis.net/ows/1.1" ` +
            `xmlns:gml="http://www.opengis.net/gml" ` +
            `xmlns:ogc="http://www.opengis.net/ogc" ` +
            `xmlns:wcs="http://www.opengis.net/wcs/1.1.1" ` +
            `xmlns:dwn="http://geoserver.org/wps/download" ` +
            `xmlns:xlink="http://www.w3.org/1999/xlink" ` +
            `xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">` +
            `<ows:Identifier>gs:DownloadEstimator</ows:Identifier>` +
            `<wps:DataInputs>` +
                `<wps:Input>` +
                    `<ows:Identifier>layerName</ows:Identifier>` +
                    `<wps:Data>` +
                        `<wps:LiteralData>layer</wps:LiteralData>` +
                    `</wps:Data>` +
                `</wps:Input>` +
                `<wps:Input>` +
                    `<ows:Identifier>ROI</ows:Identifier>` +
                    `<wps:Data>` +
                        `<wps:ComplexData mimeType="application/wkt">` +
                            `<![CDATA[POLYGON (( 500116.08576537756 499994.25579707103, 500116.08576537756 500110.1012210889, 500286.2657688021 500110.1012210889, 500286.2657688021 499994.25579707103, 500116.08576537756 499994.25579707103 ))]]>` +
                        `</wps:ComplexData>` +
                    `</wps:Data>` +
                `</wps:Input>` +
                `<wps:Input>` +
                    `<ows:Identifier>RoiCRS</ows:Identifier>` +
                    `<wps:Data>` +
                        `<wps:LiteralData>EPSG:3857</wps:LiteralData>` +
                    `</wps:Data>` +
                `</wps:Input>` +
                `<wps:Input>` +
                    `<ows:Identifier>filter</ows:Identifier>` +
                    `<wps:Data>` +
                        `<wps:ComplexData mimeType="text/xml; filter/1.0">` +
                            `<![CDATA[${sampleFilter.data.data}]]>` +
                        `</wps:ComplexData>` +
                    `</wps:Data>` +
                `</wps:Input>` +
                `<wps:Input>` +
                    `<ows:Identifier>targetCRS</ows:Identifier>` +
                    `<wps:Data>` +
                        `<wps:LiteralData>EPSG:4326</wps:LiteralData>` +
                    `</wps:Data>` +
                `</wps:Input>` +
            `</wps:DataInputs>` +
            `</wps:Execute>`;
        const result = downloadEstimatorXML(options);

        expect(result).toBe(expectedResult);
    });
    it('downloadXML', () => {
        const options = {
            layerName: 'layer',
            outputFormat: 'application/json',
            dataFilter: sampleFilter,
            ROI: sampleROI,
            roiCRS: 'EPSG:3857',
            targetCRS: 'EPSG:4326',
            cropToROI: true,
            outputAsReference: true,
            resultOutput: 'application/xml',
            writeParameters: {
                parameter: '500',
                parameter2: 'value'
            }
        };

        const expectedResult = `<?xml version="1.0" encoding="UTF-8"?>` +
            `<wps:Execute version="1.0.0" service="WPS" ` +
            `xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ` +
            `xmlns="http://www.opengis.net/wps/1.0.0" ` +
            `xmlns:wfs="http://www.opengis.net/wfs" ` +
            `xmlns:wps="http://www.opengis.net/wps/1.0.0" ` +
            `xmlns:ows="http://www.opengis.net/ows/1.1" ` +
            `xmlns:gml="http://www.opengis.net/gml" ` +
            `xmlns:ogc="http://www.opengis.net/ogc" ` +
            `xmlns:wcs="http://www.opengis.net/wcs/1.1.1" ` +
            `xmlns:dwn="http://geoserver.org/wps/download" ` +
            `xmlns:xlink="http://www.w3.org/1999/xlink" ` +
            `xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">` +
            `<ows:Identifier>gs:Download</ows:Identifier>` +
            `<wps:DataInputs>` +
                `<wps:Input>` +
                    `<ows:Identifier>layerName</ows:Identifier>` +
                    `<wps:Data>` +
                        `<wps:LiteralData>layer</wps:LiteralData>` +
                    `</wps:Data>` +
                `</wps:Input>` +
                `<wps:Input>` +
                    `<ows:Identifier>outputFormat</ows:Identifier>` +
                    `<wps:Data>` +
                        `<wps:LiteralData>application/json</wps:LiteralData>` +
                    `</wps:Data>` +
                `</wps:Input>` +
                `<wps:Input>` +
                    `<ows:Identifier>ROI</ows:Identifier>` +
                    `<wps:Data>` +
                        `<wps:ComplexData mimeType="application/wkt">` +
                            `<![CDATA[POLYGON (( 500116.08576537756 499994.25579707103, 500116.08576537756 500110.1012210889, 500286.2657688021 500110.1012210889, 500286.2657688021 499994.25579707103, 500116.08576537756 499994.25579707103 ))]]>` +
                        `</wps:ComplexData>` +
                    `</wps:Data>` +
                `</wps:Input>` +
                `<wps:Input>` +
                    `<ows:Identifier>filter</ows:Identifier>` +
                    `<wps:Data>` +
                        `<wps:ComplexData mimeType="text/xml; filter/1.0">` +
                            `<![CDATA[${sampleFilter.data.data}]]>` +
                        `</wps:ComplexData>` +
                    `</wps:Data>` +
                `</wps:Input>` +
                `<wps:Input>` +
                    `<ows:Identifier>targetCRS</ows:Identifier>` +
                    `<wps:Data>` +
                        `<wps:LiteralData>EPSG:4326</wps:LiteralData>` +
                    `</wps:Data>` +
                `</wps:Input>` +
                `<wps:Input>` +
                    `<ows:Identifier>RoiCRS</ows:Identifier>` +
                    `<wps:Data>` +
                        `<wps:LiteralData>EPSG:3857</wps:LiteralData>` +
                    `</wps:Data>` +
                `</wps:Input>` +
                `<wps:Input>` +
                    `<ows:Identifier>cropToROI</ows:Identifier>` +
                    `<wps:Data>` +
                        `<wps:LiteralData>true</wps:LiteralData>` +
                    `</wps:Data>` +
                `</wps:Input>` +
                `<wps:Input>` +
                    `<ows:Identifier>writeParameters</ows:Identifier>` +
                    `<wps:Data>` +
                        `<wps:ComplexData>` +
                            `<dwn:Parameters>` +
                                `<dwn:Parameter key="parameter">500</dwn:Parameter>` +
                                `<dwn:Parameter key="parameter2">value</dwn:Parameter>` +
                            `</dwn:Parameters>` +
                        `</wps:ComplexData>` +
                    `</wps:Data>` +
                `</wps:Input>` +
            `</wps:DataInputs>` +
            `<wps:ResponseForm>` +
                `<wps:RawDataOutput mimeType="application/xml">` +
                    `<ows:Identifier>result</ows:Identifier>` +
                `</wps:RawDataOutput>` +
            `</wps:ResponseForm>` +
            `</wps:Execute>`;
        const result = downloadXML(options);

        expect(result).toBe(expectedResult);
    });
    it('downloadXML asynchronous', () => {
        const options = {
            layerName: 'layer',
            outputFormat: 'application/json',
            asynchronous: true,
            outputAsReference: true
        };

        const expectedResult = `<?xml version="1.0" encoding="UTF-8"?>` +
            `<wps:Execute version="1.0.0" service="WPS" ` +
            `xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ` +
            `xmlns="http://www.opengis.net/wps/1.0.0" ` +
            `xmlns:wfs="http://www.opengis.net/wfs" ` +
            `xmlns:wps="http://www.opengis.net/wps/1.0.0" ` +
            `xmlns:ows="http://www.opengis.net/ows/1.1" ` +
            `xmlns:gml="http://www.opengis.net/gml" ` +
            `xmlns:ogc="http://www.opengis.net/ogc" ` +
            `xmlns:wcs="http://www.opengis.net/wcs/1.1.1" ` +
            `xmlns:dwn="http://geoserver.org/wps/download" ` +
            `xmlns:xlink="http://www.w3.org/1999/xlink" ` +
            `xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">` +
            `<ows:Identifier>gs:Download</ows:Identifier>` +
            `<wps:DataInputs>` +
                `<wps:Input>` +
                    `<ows:Identifier>layerName</ows:Identifier>` +
                    `<wps:Data>` +
                        `<wps:LiteralData>layer</wps:LiteralData>` +
                    `</wps:Data>` +
                `</wps:Input>` +
                `<wps:Input>` +
                    `<ows:Identifier>outputFormat</ows:Identifier>` +
                    `<wps:Data>` +
                        `<wps:LiteralData>application/json</wps:LiteralData>` +
                    `</wps:Data>` +
                `</wps:Input>` +
                `<wps:Input>` +
                    `<ows:Identifier>cropToROI</ows:Identifier>` +
                    `<wps:Data>` +
                        `<wps:LiteralData>false</wps:LiteralData>` +
                    `</wps:Data>` +
                `</wps:Input>` +
            `</wps:DataInputs>` +
            `<wps:ResponseForm>` +
                `<wps:ResponseDocument storeExecuteResponse="true" status="true">` +
                    `<wps:Output asReference="true">` +
                        `<ows:Identifier>result</ows:Identifier>` +
                    `</wps:Output>` +
                `</wps:ResponseDocument>` +
            `</wps:ResponseForm>` +
            `</wps:Execute>`;
        const result = downloadXML(options);

        expect(result).toBe(expectedResult);
    });
    it('download', (done) => {
        const options = {
            layerName: 'layer',
            outputFormat: 'application/json'
        };

        mockAxios
            .onPost()
            .replyOnce(200, downloadEstimatorSucceededResponse, {'content-type': 'application/xml'})
            .onPost()
            .replyOnce(200, responseWithComplexDataOutput, {'content-type': 'application/xml'});

        download('http://testserver', options, {executeStatusUpdateInterval: 0}).subscribe(
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
            e => {
                done(e);
            }
        );
    });
    it('download with notifyDownloadEstimatorSuccess', (done) => {
        const options = {
            layerName: 'layer',
            outputFormat: 'application/json',
            notifyDownloadEstimatorSuccess: true
        };

        mockAxios
            .onPost()
            .replyOnce(200, downloadEstimatorSucceededResponse, {'content-type': 'application/xml'})
            .onPost()
            .replyOnce(200, responseWithComplexDataOutput, {'content-type': 'application/xml'});

        let results = [];
        download('http://testserver', options, {executeStatusUpdateInterval: 0}).subscribe(
            result => {
                results.push(result);
            },
            e => {
                done(e);
            },
            () => {
                try {
                    expect(results.length).toBe(2);
                    expect(results[0]).toBe('DownloadEstimatorSuccess');
                    expect(results[1].length).toBe(1);
                    expect(results[1][0].Identifier?.[0]).toExist();
                    expect(results[1][0].Data?.[0]?.ComplexData).toExist();
                    done();
                } catch (e) {
                    done(e);
                }
            }
        );
    });
});
