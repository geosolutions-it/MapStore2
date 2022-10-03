/**
  * Copyright 2020, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import expect from 'expect';

import {
    getWPSURL,
    cdata
} from '../common';


describe('common WPS utils', () => {

    const options = {
        IDENTIFIER: "gs:Aggregate",
        REQUEST: "DescribeProcess",
        version: "1.0.0"
    };
    it('test getWpsUrl', () => {

        const tests = [{
            url: "https://host/service/wms",
            result: "https://host/service/wps?service=WPS&IDENTIFIER=gs%3AAggregate&REQUEST=DescribeProcess&version=1.0.0"
        },
        {
            url: {},
            result: {}
        }];
        tests.forEach(({url, result}) => {
            expect(getWPSURL(url, options)).toEqual(result);
        });
    });
    it("test getWPSURL with array of urls", () => {

        const url = ["https://host/service/wms", "https://host1/service/wms", "https://host2/service/wms"];
        expect(/https:\/\/host.?\/service\/wps\?service=WPS&IDENTIFIER=gs%3AAggregate&REQUEST=DescribeProcess&version=1\.0\.0/.test(getWPSURL(url, options))).toEqual(true);

    });
    it('test cdata wrapper on xml with no cdata', () => {
        const filterString = `<wps:ComplexData mimeType="text/xml; subtype=filter/1.1">
					<ogc:Filter
						xmlns:ogc="http://www.test.net/ogc"
						xmlns:gml="http://www.test.net/gml">
						<ogc:And>
							<ogc:Intersects>
								<ogc:PropertyName>the_geom</ogc:PropertyName>
								<ogc:Function name="collectGeometries">
									<ogc:Function name="queryCollection">
										<ogc:Literal>geonode:test_export_filter0</ogc:Literal>
										<ogc:Literal>the_geom</ogc:Literal>
									</ogc:Function>
								</ogc:Function>
							</ogc:Intersects>
						</ogc:And>
					</ogc:Filter>
				</wps:ComplexData>`;
        expect(cdata(filterString)).toEqual(`<![CDATA[<wps:ComplexData mimeType="text/xml; subtype=filter/1.1">
					<ogc:Filter
						xmlns:ogc="http://www.test.net/ogc"
						xmlns:gml="http://www.test.net/gml">
						<ogc:And>
							<ogc:Intersects>
								<ogc:PropertyName>the_geom</ogc:PropertyName>
								<ogc:Function name="collectGeometries">
									<ogc:Function name="queryCollection">
										<ogc:Literal>geonode:test_export_filter0</ogc:Literal>
										<ogc:Literal>the_geom</ogc:Literal>
									</ogc:Function>
								</ogc:Function>
							</ogc:Intersects>
						</ogc:And>
					</ogc:Filter>
				</wps:ComplexData>]]>`);
    });
    it('test cdata wrapper on xml with cdata', () => {
        const filterString = `<wps:ComplexData mimeType="text/xml; subtype=filter/1.1">
					<ogc:Filter
						xmlns:ogc="http://www.test.net/ogc"
						xmlns:gml="http://www.test.net/gml">
						<ogc:And>
							<ogc:Intersects>
								<ogc:PropertyName>the_geom</ogc:PropertyName>
								<ogc:Function name="collectGeometries">
									<ogc:Function name="queryCollection">
										<ogc:Literal>geonode:test_export_filter0</ogc:Literal>
										<ogc:Literal>the_geom</ogc:Literal>
                                        <ogc:Literal>
											<![CDATA[INCLUDE]]>
										</ogc:Literal>
									</ogc:Function>
								</ogc:Function>
							</ogc:Intersects>
						</ogc:And>
					</ogc:Filter>
				</wps:ComplexData>`;
        expect(cdata(filterString)).toEqual(filterString);
    });
});
