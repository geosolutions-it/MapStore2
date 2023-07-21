/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
    processReference,
    processParameter,
    rawDataOutput,
    responseForm
} from './common';
import {executeProcessXML} from './execute';

import requestBuilder from '../../utils/ogc/WFS/RequestBuilder';

const {
    getFeature,
    query
} = requestBuilder({ wfsVersion: "1.1.0" });

/**
 * function used to generate the Execute wps process payload for
 * the gs:CollectGeometries
 * @param {object} options the options to use
 * @param {string} options.name the layer typeName
 */
export const collectGeometriesXML = ({
    name
}) => executeProcessXML(
    'gs:CollectGeometries',
    [
        processParameter('features', processReference(
            "test/xml",
            "http://geoserver/wfs",
            'POST',
            getFeature(query(name))
        ))
    ],
    responseForm(
        rawDataOutput('result', "application/json")
    )
);

export default collectGeometriesXML;

/*
<?xml version="1.0" encoding="UTF-8"?>
<wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">
<ows:Identifier>gs:CollectGeometries</ows:Identifier>
<wps:DataInputs>
<wps:Input>
<ows:Identifier>features</ows:Identifier>
<wps:Reference mimeType="text/xml" xlink:href="http://geoserver/wfs" method="POST">
<wps:Body>
<wfs:GetFeature service="WFS" version="1.0.0" outputFormat="GML2">
<wfs:Query typeName="cnr:CNR00L93_CRUE"/>
</wfs:GetFeature>
</wps:Body>
</wps:Reference>
</wps:Input>
</wps:DataInputs>
<wps:ResponseForm>
<wps:RawDataOutput mimeType="application/json">
<ows:Identifier>result</ows:Identifier>
</wps:RawDataOutput>
</wps:ResponseForm>
*/
