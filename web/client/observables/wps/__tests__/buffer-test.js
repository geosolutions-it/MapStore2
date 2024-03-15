/**
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {
    bufferXML
} from '../buffer';
describe('WPS buffer tests', () => {
    it('bufferXML', () => {
        const geometry3857 = "POINT(1,2)";
        const distance = 100;
        const quadrantSegments = 200;
        const capStyle = "Round";
        const result = bufferXML({
            geometry3857,
            distance,
            quadrantSegments,
            capStyle
        });
        expect(result).toEqual(`<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:dwn="http://geoserver.org/wps/download" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd"><ows:Identifier>geo:buffer</ows:Identifier><wps:DataInputs><wps:Input><ows:Identifier>geom</ows:Identifier><wps:Data><wps:ComplexData mimeType="application/wkt"><![CDATA[POINT(1,2)]]></wps:ComplexData></wps:Data></wps:Input><wps:Input><ows:Identifier>distance</ows:Identifier><wps:Data><wps:LiteralData>100</wps:LiteralData></wps:Data></wps:Input><wps:Input><ows:Identifier>quadrantSegments</ows:Identifier><wps:Data><wps:LiteralData>200</wps:LiteralData></wps:Data></wps:Input><wps:Input><ows:Identifier>capStyle</ows:Identifier><wps:Data><wps:LiteralData>Round</wps:LiteralData></wps:Data></wps:Input></wps:DataInputs><wps:ResponseForm><wps:RawDataOutput mimeType="application/json"><ows:Identifier>result</ows:Identifier></wps:RawDataOutput></wps:ResponseForm></wps:Execute>`);
    });
});
