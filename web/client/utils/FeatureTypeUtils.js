/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { get, find } from 'lodash';
import { applyDefaultToLocalizedString } from '../components/I18N/LocalizedString';


const types = {
    // string
    // 'xsd:ENTITIES': 'string',
    // 'xsd:ENTITY': 'string',
    // 'xsd:ID': 'string',
    // 'xsd:IDREF': 'string',
    // 'xsd:IDREFS': 'string',
    // 'xsd:language': 'string',
    // 'xsd:Name': 'string',
    // 'xsd:NCName': 'string',
    // 'xsd:NMTOKEN': 'string',
    // 'xsd:NMTOKENS': 'string',
    'xsd:normalizedString': 'string',
    // 'xsd:QName': 'string',
    'xsd:string': 'string',
    // 'xsd:token': 'string',

    // date
    'xsd:date': 'date',
    'xsd:dateTime': 'date',
    // 'xsd:duration': 'date',
    // 'xsd:gDay': 'date',
    // 'xsd:gMonth': 'date',
    // 'xsd:gMonthDay': 'date',
    // 'xsd:gYear': 'date',
    // 'xsd:gYearMonth': 'date',
    // date-time
    'xsd:date-time': 'date-time',
    // time
    'xsd:time': 'time',

    // number
    // 'xsd:byte': 'number',
    'xsd:decimal': 'number',
    'xsd:int': 'number',
    'xsd:integer': 'number',
    'xsd:long': 'number',
    'xsd:negativeInteger': 'number',
    'xsd:nonNegativeInteger': 'number',
    'xsd:nonPositiveInteger': 'number',
    'xsd:positiveInteger': 'number',
    'xsd:short': 'number',
    'xsd:unsignedLong': 'number',
    'xsd:unsignedInt': 'number',
    'xsd:unsignedShort': 'number',
    // 'xsd:unsignedByte': 'number',

    // from old object
    'xsd:number': 'number',

    // misc
    // 'xsd:anyURI': 'string',
    // 'xsd:base64Binary': 'number',
    'xsd:boolean': 'boolean',
    'xsd:double': 'number',
    // 'xsd:hexBinary': 'string',
    // 'xsd:NOTATION': 'string',
    'xsd:float': 'number',
    'xsd:array': 'array'
};

// for multi-geom fields --> the primary geometry field type is gml:GeometryType like: gml:Point
// and other geom fields type be xsd:GeometryType like: xsd:Point
// ref for available geometry field types :https://docs.geoserver.geo-solutions.it/edu/en/complex_features/intro/index.html#id3
export const notPrimaryGeometryFields = {
    "xsd:Point": "Point",
    "xsd:LineString": "LineString",
    "xsd:Polygon": "Polygon",
    "xsd:MultiPoint": "MultiPoint",
    "xsd:MultiLineString": "MultiLineString",
    "xsd:MultiPolygon": "MultiPolygon",
    "xsd:GeometryCollection": "GeometryCollection",
    "xsd:LinearRing": "LinearRing",
    "xsd:Curve": "Curve",
    "xsd:Surface": "Surface"
};

/**
 * Transforms the DescribeFeatureType response to an array of attributes.
 * @param {object} data JSON response of DescribeFeatureType
 * @param {object[]} [fields=[]] optional `fields` array of the layer, to get the alias of the attributes, for customize/localize labels.
 * @returns {object[]} attributes with `label`, `attribute`, `type`, `valueId`, `valueLabel`, `values`.
 */
export const describeFeatureTypeToAttributes = (data, fields = []) => get(data, "featureTypes[0].properties")
    .filter((attribute) => (attribute.type.indexOf('gml:') !== 0 && types[attribute.type]) && (!notPrimaryGeometryFields[attribute.type]))
    .map((attribute) => {
        const field = find(fields, {name: attribute.name});
        return {
            label: applyDefaultToLocalizedString(field?.alias, attribute.name),
            attribute: attribute.name,
            type: types[attribute.type],
            valueId: "id",
            valueLabel: "name",
            values: []
        };
    });
