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
 * function used to generate and execute the gs:IntersectionFeatureCollection wps process given some parameters
 * @param {object} options the options to use
 * @param {object} options.firstFC the first feature collection to intersect
 * @param {object} options.secondFC the second feature collection to intersect
 * @param {string} options.firstAttributeToRetain First feature collection attribute to include
 * @param {string} options.secondAttributeToRetain Second feature collection attribute to include
 * @param {string} options.intersectionMode Specifies geometry computed for intersecting features. INTERSECTION (default) computes the spatial intersection of the inputs. FIRST copies geometry A. SECOND copies geometry B.
 * @param {boolean} options.percentagesEnabled Indicates whether to output feature area percentages (attributes percentageA and percentageB)
 * @param {boolean} options.areasEnabled Indicates whether to output feature areas (attributes areaA and areaB)
 */
export const intersectXML = ({
    firstFC,
    secondFC,
    firstAttributeToRetain = "",
    secondAttributeToRetain = "",
    intersectionMode = "INTERSECTION",
    percentagesEnabled = false,
    areasEnabled = false
}) => executeProcessXML(
    'gs:IntersectionFeatureCollection',
    [
        processParameter('first feature collection', processData(complexData(cdata(JSON.stringify(firstFC)), "application/json"))),
        processParameter('second feature collection', processData(complexData(cdata(JSON.stringify(secondFC)), "application/json"))),
        ...(firstAttributeToRetain ? [processParameter("first attributes to retain", processData(literalData(firstAttributeToRetain)))] : []),
        ...(secondAttributeToRetain ? [processParameter("second attributes to retain", processData(literalData(secondAttributeToRetain)))] : []),
        ...(intersectionMode ? [processParameter("intersectionMode", processData(literalData(intersectionMode)))] : []),
        processParameter("percentagesEnabled", processData(literalData(percentagesEnabled))),
        processParameter("areasEnabled", processData(literalData(areasEnabled)))
    ],
    responseForm(
        rawDataOutput('result', "application/json")
    )
);

export default intersectXML;

/*
<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">
  <ows:Identifier>gs:IntersectionFeatureCollection</ows:Identifier>
  <wps:DataInputs>
    <wps:Input>
      <ows:Identifier>second feature collection</ows:Identifier>
      <wps:Data>
        <wps:ComplexData mimeType="application/json"><![CDATA[{

  "type": "FeatureCollection",

}]]></wps:ComplexData>
      </wps:Data>
    </wps:Input>
    <wps:Input>
      <ows:Identifier>second feature collection</ows:Identifier>
      <wps:Data>
        <wps:ComplexData mimeType="application/json"><![CDATA[{

  "type": "FeatureCollection",

}]]></wps:ComplexData>
      </wps:Data>
    </wps:Input>
  </wps:DataInputs>
  <wps:ResponseForm>
    <wps:RawDataOutput mimeType="application/json">
      <ows:Identifier>result</ows:Identifier>
    </wps:RawDataOutput>
  </wps:ResponseForm>
</wps:Execute>
*/
