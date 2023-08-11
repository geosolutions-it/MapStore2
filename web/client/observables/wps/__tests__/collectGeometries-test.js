/**
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {
    collectGeometriesXML
} from '../collectGeometries';
describe('WPS collectGeometries tests', () => {
    it('collectGeometriesXML', () => {
        const name = "workspace:layername";
        const result = collectGeometriesXML({
            name
        });
        expect(result).toEqual(`<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:dwn="http://geoserver.org/wps/download" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd"><ows:Identifier>gs:CollectGeometries</ows:Identifier><wps:DataInputs><wps:Input><ows:Identifier>features</ows:Identifier><wps:Reference mimeType="test/xml" xlink:href="http://geoserver/wfs" method="POST"><wps:Body><wfs:GetFeature service="WFS" version="1.1.0" xmlns:gml="http://www.opengis.net/gml" xmlns:wfs="http://www.opengis.net/wfs" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd"><wfs:Query typeName="workspace:layername" srsName="EPSG:4326">undefined</wfs:Query></wfs:GetFeature></wps:Body></wps:Reference></wps:Input></wps:DataInputs><wps:ResponseForm><wps:RawDataOutput mimeType="application/json"><ows:Identifier>result</ows:Identifier></wps:RawDataOutput></wps:ResponseForm></wps:Execute>`);
    });
});

// TEST
// [ ] gpt epics
// [ ] gpt utils
// [ ] gpt observables
// [ ] wfs base
// [ ] layers selector
