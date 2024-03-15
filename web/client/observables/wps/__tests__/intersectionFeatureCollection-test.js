/**
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {
    intersectXML
} from '../intersectionFeatureCollection';
describe('WPS intersectionFeatureCollection tests', () => {
    it('intersectXML with defaults', () => {
        const firstFC = {
            type: "FeatureCollection", features: [{
                type: "Feature",
                geometry: {
                    coordinates: [1, 2],
                    type: "Point"
                }
            }]};
        const secondFC = {
            type: "FeatureCollection", features: [{
                type: "Feature",
                geometry: {
                    coordinates: [[1, 2], [2, 2]],
                    type: "LineString"
                }
            }]};
        const result = intersectXML({
            firstFC,
            secondFC
        });
        expect(result).toEqual(`<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:dwn="http://geoserver.org/wps/download" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd"><ows:Identifier>gs:IntersectionFeatureCollection</ows:Identifier><wps:DataInputs><wps:Input><ows:Identifier>first feature collection</ows:Identifier><wps:Data><wps:ComplexData mimeType="application/json"><![CDATA[{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"coordinates":[1,2],"type":"Point"}}]}]]></wps:ComplexData></wps:Data></wps:Input><wps:Input><ows:Identifier>second feature collection</ows:Identifier><wps:Data><wps:ComplexData mimeType="application/json"><![CDATA[{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"coordinates":[[1,2],[2,2]],"type":"LineString"}}]}]]></wps:ComplexData></wps:Data></wps:Input><wps:Input><ows:Identifier>intersectionMode</ows:Identifier><wps:Data><wps:LiteralData>INTERSECTION</wps:LiteralData></wps:Data></wps:Input><wps:Input><ows:Identifier>percentagesEnabled</ows:Identifier><wps:Data><wps:LiteralData>false</wps:LiteralData></wps:Data></wps:Input><wps:Input><ows:Identifier>areasEnabled</ows:Identifier><wps:Data><wps:LiteralData>false</wps:LiteralData></wps:Data></wps:Input></wps:DataInputs><wps:ResponseForm><wps:RawDataOutput mimeType="application/json"><ows:Identifier>result</ows:Identifier></wps:RawDataOutput></wps:ResponseForm></wps:Execute>`);
    });
    it('intersectXML', () => {
        const firstFC = {
            type: "FeatureCollection", features: [{
                type: "Feature",
                geometry: {
                    coordinates: [1, 2],
                    type: "Point"
                }
            }]};
        const secondFC = {
            type: "FeatureCollection", features: [{
                type: "Feature",
                geometry: {
                    coordinates: [[1, 2], [2, 2]],
                    type: "LineString"
                }
            }]};
        const percentagesEnabled = true;
        const intersectionMode = "FIRST";
        const firstAttributeToRetain = "attr1";
        const secondAttributeToRetain = "attr2";
        const areasEnabled = true;
        const result = intersectXML({
            firstFC,
            secondFC,
            firstAttributeToRetain,
            secondAttributeToRetain,
            intersectionMode,
            percentagesEnabled,
            areasEnabled
        });
        expect(result).toEqual(`<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:dwn="http://geoserver.org/wps/download" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd"><ows:Identifier>gs:IntersectionFeatureCollection</ows:Identifier><wps:DataInputs><wps:Input><ows:Identifier>first feature collection</ows:Identifier><wps:Data><wps:ComplexData mimeType="application/json"><![CDATA[{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"coordinates":[1,2],"type":"Point"}}]}]]></wps:ComplexData></wps:Data></wps:Input><wps:Input><ows:Identifier>second feature collection</ows:Identifier><wps:Data><wps:ComplexData mimeType="application/json"><![CDATA[{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"coordinates":[[1,2],[2,2]],"type":"LineString"}}]}]]></wps:ComplexData></wps:Data></wps:Input><wps:Input><ows:Identifier>first attributes to retain</ows:Identifier><wps:Data><wps:LiteralData>attr1</wps:LiteralData></wps:Data></wps:Input><wps:Input><ows:Identifier>second attributes to retain</ows:Identifier><wps:Data><wps:LiteralData>attr2</wps:LiteralData></wps:Data></wps:Input><wps:Input><ows:Identifier>intersectionMode</ows:Identifier><wps:Data><wps:LiteralData>FIRST</wps:LiteralData></wps:Data></wps:Input><wps:Input><ows:Identifier>percentagesEnabled</ows:Identifier><wps:Data><wps:LiteralData>true</wps:LiteralData></wps:Data></wps:Input><wps:Input><ows:Identifier>areasEnabled</ows:Identifier><wps:Data><wps:LiteralData>true</wps:LiteralData></wps:Data></wps:Input></wps:DataInputs><wps:ResponseForm><wps:RawDataOutput mimeType="application/json"><ows:Identifier>result</ows:Identifier></wps:RawDataOutput></wps:ResponseForm></wps:Execute>`);
    });
});

// TEST
// [ ] gpt epics
// [ ] gpt utils
// [ ] gpt observables
// [ ] wfs base
// [ ] layers selector
