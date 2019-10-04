/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const assign = require('object-assign');
const FilterUtils = require('../../../FilterUtils');
const {getWpsPayload} = require('../autocomplete');

const defaultOptions = {
    value: "somevalue",
    layerName: "layerName",
    layerFilter: undefined,
    attribute: "attribute",
    maxFeatures: 5,
    startIndex: 0
};

const sampleFilter = {
    "searchUrl": null,
    "featureTypeConfigUrl": null,
    "showGeneratedFilter": false,
    "attributePanelExpanded": true,
    "spatialPanelExpanded": true,
    "crossLayerExpanded": true,
    "showDetailsPanel": false,
    "groupLevels": 5,
    "useMapProjection": false,
    "toolbarEnabled": true,
    "groupFields": [{
        "id": 1,
        "logic": "OR",
        "index": 0
    }],
    "maxFeaturesWPS": 5,
    "filterFields": [{
        "rowId": 1567774442481,
        "groupId": 1,
        "attribute": "STATE_FIPS",
        "operator": "=",
        "value": "05",
        "type": "string",
        "fieldOptions": {
            "valuesCount": 0,
            "currentPage": 1
        },
        "exception": null,
        "loading": false,
        "openAutocompleteMenu": false,
        "options": {
            "STATE_FIPS": []
        }
    }],
    "spatialField": {
        "method": null,
        "operation": "INTERSECTS",
        "geometry": null,
        "attribute": "the_geom"
    },
    "simpleFilterFields": [],
    "crossLayerFilter": {
        "attribute": "the_geom"
    },
    "autocompleteEnabled": true
};

const getBodyPart1 = ({layerName}) => '<wps:Execute xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.0.0" service="WPS" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd"> '
+ ' <ows:Identifier xmlns:ows="http://www.opengis.net/ows/1.1">gs:PagedUnique</ows:Identifier> '
+ ' <wps:DataInputs> '
+ '   <wps:Input> '
+ '     <ows:Identifier xmlns:ows="http://www.opengis.net/ows/1.1">features</ows:Identifier> '
+ '     <ows:Title xmlns:ows="http://www.opengis.net/ows/1.1">features</ows:Title> '
+ '     <wps:Data /> '
+ '     <wps:Reference xmlns:xlink="http://www.w3.org/1999/xlink" mimeType="text/xml" xlink:href="http://geoserver/wfs" method="POST"> '
+ '       <wps:Body>'
+ '         <wfs:GetFeature xmlns:wfs="http://www.opengis.net/wfs" service="WFS" version="1.0.0">'
+ '           <wfs:Query typeName="' + layerName + '">';

const getBodyPart2 = ({attribute, value}) => '<ogc:Filter xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml">'
+ '<ogc:And>'
+ '<ogc:PropertyIsLike matchCase="false" wildCard="*" singleChar="." escapeChar="!">'
+ '   <ogc:PropertyName>' + attribute + '</ogc:PropertyName>'
+ '   <ogc:Literal>*' + value + '*</ogc:Literal>'
+ '</ogc:PropertyIsLike>'
+ '</ogc:And>'
+ '</ogc:Filter>';

const getBodyPart2WithLayerFilter = ({layerFilter}) => '<ogc:Filter xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml">'
+ '<ogc:And>'
+ FilterUtils.toOGCFilterParts(layerFilter, "1.1.0", "ogc").join('')
+ '</ogc:And>'
+ '</ogc:Filter>';

const getBodyPart2Both = ({attribute, value, layerFilter}) => '<ogc:Filter xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml">'
+ '<ogc:And>'
+ FilterUtils.toOGCFilterParts(layerFilter, "1.1.0", "ogc").join('')
+ '<ogc:PropertyIsLike matchCase="false" wildCard="*" singleChar="." escapeChar="!">'
+ '   <ogc:PropertyName>' + attribute + '</ogc:PropertyName>'
+ '   <ogc:Literal>*' + value + '*</ogc:Literal>'
+ '</ogc:PropertyIsLike>'
+ '</ogc:And>'
+ '</ogc:Filter>';

const getBodyPart3 = ({attribute, maxFeatures, startIndex}) => '             <ogc:SortBy xmlns:ogc="http://www.opengis.net/ogc">'
+ '               <ogc:SortProperty>'
+ '                 <ogc:PropertyName>' + attribute + '</ogc:PropertyName>'
+ '               </ogc:SortProperty>'
+ '             </ogc:SortBy>'
+ '           </wfs:Query>'
+ '         </wfs:GetFeature>'
+ '       </wps:Body>'
+ '     </wps:Reference>'
+ '   </wps:Input>'
+ '   <wps:Input>'
+ '     <ows:Identifier xmlns:ows="http://www.opengis.net/ows/1.1">fieldName</ows:Identifier>'
+ '     <ows:Title xmlns:ows="http://www.opengis.net/ows/1.1">fieldName</ows:Title>'
+ '     <wps:Data>'
+ '       <wps:LiteralData>' + attribute + '</wps:LiteralData>'
+ '     </wps:Data>'
+ '   </wps:Input>'
+ '   <wps:Input>'
+ '     <ows:Identifier xmlns:ows="http://www.opengis.net/ows/1.1">maxFeatures</ows:Identifier>'
+ '     <ows:Title xmlns:ows="http://www.opengis.net/ows/1.1">maxFeatures</ows:Title>'
+ '     <wps:Data>'
+ '       <wps:LiteralData>' + maxFeatures + '</wps:LiteralData>'
+ '     </wps:Data>'
+ '   </wps:Input>'
+ '   <wps:Input>'
+ '     <ows:Identifier xmlns:ows="http://www.opengis.net/ows/1.1">startIndex</ows:Identifier>'
+ '     <ows:Title xmlns:ows="http://www.opengis.net/ows/1.1">startIndex</ows:Title>'
+ '     <wps:Data>'
+ '       <wps:LiteralData>' + startIndex + '</wps:LiteralData>'
+ '     </wps:Data>'
+ '   </wps:Input>'
+ ' </wps:DataInputs>'
+ ' <wps:ResponseForm>'
+ '   <wps:RawDataOutput mimeType="application/json">'
+ '     <ows:Identifier xmlns:ows="http://www.opengis.net/ows/1.1">result</ows:Identifier>'
+ '   </wps:RawDataOutput>'
+ ' </wps:ResponseForm>'
+ '</wps:Execute>';


describe('Test WPS requests', () => {

    it('getWpsPayload with value', () => {
        const options = assign({}, defaultOptions);
        const requestBody = getWpsPayload(options);
        expect(requestBody).toExist();
        const expectedBody = getBodyPart1(options) + getBodyPart2(options) + getBodyPart3(options);
        expect(requestBody).toBe(expectedBody);
    });
    it('getWpsPayload with value null', () => {
        const options = assign({}, defaultOptions, {value: null});
        const requestBody = getWpsPayload(options);
        expect(requestBody).toExist();
        const expectedBody = getBodyPart1(options) + getBodyPart3(options);
        expect(requestBody).toBe(expectedBody);
    });
    it('getWpsPayload with value undefined', () => {
        const options = assign({}, defaultOptions, {value: undefined});
        const requestBody = getWpsPayload(options);
        expect(requestBody).toExist();
        const expectedBody = getBodyPart1(options) + getBodyPart3(options);
        expect(requestBody).toBe(expectedBody);
    });
    it('getWpsPayload with no data', () => {
        const requestBody = getWpsPayload({});
        expect(requestBody).toExist();
        const expectedBody = getBodyPart1({}) + getBodyPart3({});
        expect(requestBody).toBe(expectedBody);
    });
    it('getWpsPayload with layerFilter', () => {
        const options = assign({}, defaultOptions, {layerFilter: sampleFilter});
        const requestBody = getWpsPayload(options);
        expect(requestBody).toExist();
        const expectedBody = getBodyPart1(options) + getBodyPart2Both(options) + getBodyPart3(options);
        expect(requestBody).toBe(expectedBody);
    });
    it('getWpsPayload with layerFilter and value undefined', () => {
        const options = assign({}, defaultOptions, {layerFilter: sampleFilter, value: undefined});
        const requestBody = getWpsPayload(options);
        expect(requestBody).toExist();
        const expectedBody = getBodyPart1(options) + getBodyPart2WithLayerFilter(options) + getBodyPart3(options);
        expect(requestBody).toBe(expectedBody);
    });
});
