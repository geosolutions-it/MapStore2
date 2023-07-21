/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
    cdata,
    complexData,
    literalData,
    processData,
    processParameter,
    rawDataOutput,
    responseForm
} from './common';
import {executeProcessXML} from './execute';

/**
 * function used to generate the Execute wps process payload for
 * the geo:buffer
 * @param {object} options the options to use
 * @param {number} options.distance the distance to buffer the input geometry, in the units of the geometry
 * @param {object} options.geometry the geojson geometry in 3857
 * @param {number} options.quadrantSegments Number determining the style and smoothness of buffer corners. Positive numbers create round corners with that number of segments per quarter-circle, 0 creates flat corners.
 * @param {string} options.capStyle Style for the buffer end caps. Values are: Round - rounded ends (default), Flat - flat ends; Square - square ends.

 */
export const bufferXML = ({
    geometry3857,
    distance = 100,
    quadrantSegments,
    capStyle
}) => {
    const payload = [
        processParameter('geom', processData(complexData(cdata(geometry3857), "application/wkt"))),
        processParameter('distance', processData(literalData(distance))),
        ...(quadrantSegments ? [processParameter("quadrantSegments", processData(literalData(quadrantSegments)))] : []),
        ...(capStyle ? [processParameter("capStyle", processData(literalData(capStyle)))] : [])
    ];
    return executeProcessXML(
        'geo:buffer',
        payload,
        responseForm(
            rawDataOutput('result', "application/json")
        )
    );
};

export default bufferXML;

/*
<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">
  <ows:Identifier>geo:buffer</ows:Identifier>
  <wps:DataInputs>
    <wps:Input>
      <ows:Identifier>geom</ows:Identifier>
      <wps:Data>
        <wps:ComplexData mimeType="application/wkt"><![CDATA[LINESTRING (4.8166672 44.8674605, 4.8206175 44.8644508, 4.8294315 44.8657944, 4.8246483 44.8697177)]]></wps:ComplexData>
      </wps:Data>
    </wps:Input>
    <wps:Input>
      <ows:Identifier>distance</ows:Identifier>
      <wps:Data>
        <wps:LiteralData>100</wps:LiteralData>
      </wps:Data>
    </wps:Input>
  </wps:DataInputs>
  <wps:ResponseForm>
    <wps:RawDataOutput mimeType="application/json">
      <ows:Identifier>result</ows:Identifier>
    </wps:RawDataOutput>
  </wps:ResponseForm>
</
wps:Execute>
*/
