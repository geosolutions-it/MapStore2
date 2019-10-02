/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {castArray} = require('lodash');
const applyTemplate = ({featureType, aggregationAttribute, groupByAttributes = [], aggregateFunction, viewParams, filter = ""}) => `<?xml version="1.0" encoding="UTF-8"?>
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
    <ows:Identifier>gs:Aggregate</ows:Identifier>
    <wps:DataInputs>
        <wps:Input>
            <ows:Identifier>features</ows:Identifier>
            <wps:Reference method="POST" mimeType="text/xml" xlink:href="http://geoserver/wfs">
                <wps:Body>
                    <wfs:GetFeature ${viewParams ? `viewParams="${viewParams}"` : ""} outputFormat="GML2" service="WFS" version="1.0.0">
                        <wfs:Query typeName="${featureType}">
                        ${filter}
                        </wfs:Query>
                    </wfs:GetFeature>
                </wps:Body>
            </wps:Reference>
        </wps:Input>
        <wps:Input>
            <ows:Identifier>aggregationAttribute</ows:Identifier>
            <wps:Data>
                <wps:LiteralData>${aggregationAttribute}</wps:LiteralData>
            </wps:Data>
        </wps:Input>
        ${castArray(aggregateFunction).map( fun =>
        `<wps:Input>
                    <ows:Identifier>function</ows:Identifier>
                    <wps:Data>
                        <wps:LiteralData>${fun}</wps:LiteralData>
                    </wps:Data>
                    </wps:Input>`)}
        <wps:Input>
            <ows:Identifier>singlePass</ows:Identifier>
            <wps:Data>
                <wps:LiteralData>false</wps:LiteralData>
            </wps:Data>
        </wps:Input>
        ${castArray(groupByAttributes).map( (attribute) => `<wps:Input>
            <ows:Identifier>groupByAttributes</ows:Identifier>
            <wps:Data>
                <wps:LiteralData>${attribute}</wps:LiteralData>
            </wps:Data>
        </wps:Input>`)}
    </wps:DataInputs>
    <wps:ResponseForm>
        <wps:RawDataOutput mimeType="application/json">
            <ows:Identifier>result</ows:Identifier>
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
