/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { get, find, castArray, isString } from 'lodash';
import { applyDefaultToLocalizedString } from '../components/I18N/LocalizedString';
import { DEFAULT_SCHEMA_SRS } from './FeatureSchemaUtils';


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
 * Check if a DescribeFeatureType property type holds a geometry
 * @param {string} type the property type, e.g. `gml:Point`
 * @returns {boolean} flag
 */
export const isGeometryPropertyType = (type = '') =>
    type.indexOf('gml:') === 0 || type === 'xsd:Geometry' || !!notPrimaryGeometryFields[type];

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


const FeatureTypesToJSONSChemaTypes = {
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
    'xsd:date': 'string',
    'xsd:dateTime': 'string',
    // 'xsd:duration': 'date',
    // 'xsd:gDay': 'date',
    // 'xsd:gMonth': 'date',
    // 'xsd:gMonthDay': 'date',
    // 'xsd:gYear': 'date',
    // 'xsd:gYearMonth': 'date',
    // date-time
    'xsd:date-time': 'string',
    // time
    'xsd:time': 'string',

    // number
    // 'xsd:byte': 'number',
    'xsd:decimal': 'number',
    'xsd:int': 'integer',
    'xsd:integer': 'integer',
    'xsd:long': 'integer',
    'xsd:negativeInteger': 'integer',
    'xsd:nonNegativeInteger': 'integer',
    'xsd:nonPositiveInteger': 'integer',
    'xsd:positiveInteger': 'integer',
    'xsd:short': 'integer',
    'xsd:unsignedLong': 'integer',
    'xsd:unsignedInt': 'integer',
    'xsd:unsignedShort': 'integer',
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

const parseByJSONSchemaType = schemaType => (value) => {
    if (schemaType === 'string') {
        return `${value}`;
    }
    if (schemaType === 'integer') {
        return parseInt(value, 10);
    }
    if (schemaType === 'number') {
        return parseFloat(value);
    }
    return value;
};

export const describeFeatureTypeToJSONSchema = (describeFeatureType) => {
    const properties = describeFeatureType?.featureTypes?.[0]?.properties || [];
    const attributes = properties.filter(property => !property.type.includes('gml:'));
    const required = attributes.filter((property) => property.nillable === false).map(property => property.name);
    return {
        type: 'object',
        properties: attributes.reduce((acc, property) => {
            const { name, type, restriction, nillable } = property;
            const schemaType = FeatureTypesToJSONSChemaTypes[type] || 'string';
            const enumeration = restriction?.enumeration;
            const minInclusive = restriction?.minInclusive;
            const maxInclusive = restriction?.maxInclusive;
            const parser = parseByJSONSchemaType(schemaType);
            acc[name] = {
                'type': nillable ? [schemaType, 'null'] : schemaType,
                ...(enumeration && {
                    'enum': [
                        ...(nillable ? [null] : []),
                        ...castArray(enumeration).map(parser)
                    ]
                }),
                ...(minInclusive !== undefined && !isString(minInclusive) && {
                    minimum: parser(minInclusive)
                }),
                ...(maxInclusive !== undefined && !isString(maxInclusive) && {
                    maximum: parser(maxInclusive)
                })
            };
            return acc;
        }, {}),
        ...(required.length && { required })
    };
};

const getGeometryTypeName = ({ localType, type = '' } = {}) =>
    localType || notPrimaryGeometryFields[type] || (type.indexOf('gml:') === 0 ? type.replace('gml:', '') : undefined);

/**
 * Transforms the DescribeFeatureType response to a {@link utils.FeatureSchemaUtils FeatureSchema}.
 * Every property is kept, geometries and unmapped types included.
 * @param {object} data JSON response of DescribeFeatureType
 * @param {object[]} [fields=[]] optional `fields` array of the layer, to get the alias of the attributes
 * @returns {object} the feature schema
 */
export const describeFeatureTypeToSchema = (data, fields = []) => {
    const properties = get(data, "featureTypes[0].properties") || [];
    const attributes = properties.map((property) => {
        const geometry = isGeometryPropertyType(property.type);
        const field = find(fields, {name: property.name});
        return {
            name: property.name,
            label: applyDefaultToLocalizedString(field?.alias, property.name),
            type: geometry ? 'geometry' : types[property.type],
            localType: property.localType,
            nillable: property.nillable,
            minOccurs: property.minOccurs,
            maxOccurs: property.maxOccurs,
            geometry
        };
    });
    const geometryProperty = find(properties, (property) => isGeometryPropertyType(property.type));
    const typeName = get(data, "featureTypes[0].typeName");
    return {
        ...(typeName && { typeName: data.targetPrefix ? `${data.targetPrefix}:${typeName}` : typeName }),
        attributes,
        geometryAttribute: geometryProperty?.name,
        geometryType: getGeometryTypeName(geometryProperty),
        srs: DEFAULT_SCHEMA_SRS
    };
};
