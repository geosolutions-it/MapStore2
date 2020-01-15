/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const applyTemplate = ({wfsGetFeature}) => `<?xml version="1.0" encoding="UTF-8"?>
<wps:Execute service="WPS"   version="1.0.0"
    xmlns="http://www.opengis.net/wps/1.0.0"
    xmlns:gml="http://www.opengis.net/gml"
    xmlns:ogc="http://www.opengis.net/ogc"
    xmlns:ows="http://www.opengis.net/ows/1.1"
    xmlns:wcs="http://www.opengis.net/wcs/1.1.1"
    xmlns:wfs="http://www.opengis.net/wfs"
    xmlns:wps="http://www.opengis.net/wps/1.0.0"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"   xsi:schemaLocation="http://www.opengis.net/wps/1.0.0  http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">
    <ows:Identifier>gs:Bounds</ows:Identifier>
    <wps:DataInputs>
        <wps:Input>
            <ows:Identifier>features</ows:Identifier>
            <wps:Reference method="POST" mimeType="text/xml" xlink:href="http://geoserver/wfs">
                <wps:Body>
                    ${wfsGetFeature}
                </wps:Body>
            </wps:Reference>
        </wps:Input>
    </wps:DataInputs>
    <wps:ResponseForm>
        <wps:RawDataOutput mimeType="application/json">
            <ows:Identifier>bounds</ows:Identifier>
        </wps:RawDataOutput>
    </wps:ResponseForm>
</wps:Execute>`;

const axios = require('../../libs/ajax');

const Rx = require('rxjs');
const {getWPSURL} = require('./common');
module.exports = (url, options, requestOptions = {}) =>
    Rx.Observable.defer(() =>
        axios.post(getWPSURL(url), applyTemplate(options), {
            headers: {'Content-Type': 'text/xml'},
            ...requestOptions
        }));
