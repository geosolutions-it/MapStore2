/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import find from 'lodash/find';

/**
 * Source neutral description of a feature type, produced by the adapters of each
 * service (WFS DescribeFeatureType, ArcGIS FeatureServer fields, ...).
 * @typedef {object} FeatureSchema
 * @property {string} [typeName] name of the feature type
 * @property {object[]} attributes every attribute, geometries included, with `name`, `label`, `type`, `localType`, `nillable`, `minOccurs`, `maxOccurs` and `geometry`
 * @property {string} [geometryAttribute] name of the primary geometry attribute
 * @property {string} [geometryType] GeoJSON geometry type of the primary geometry attribute
 * @property {string} [idAttribute] attribute holding the feature identifier, when the source exposes one
 * @property {string} srs projection of the geometries returned by the source
 * @name FeatureSchemaUtils
 * @memberof utils
 */

export const DEFAULT_SCHEMA_SRS = 'EPSG:4326';

/**
 * Get the attributes of a schema, geometries excluded
 * @param {FeatureSchema} schema the feature schema
 * @param {object} [options] `typedOnly` keeps only the attributes with a normalized type
 * @returns {object[]} the attributes
 */
export const getSchemaAttributes = (schema, { typedOnly = false } = {}) =>
    (schema?.attributes || []).filter((attribute) => !attribute.geometry && (!typedOnly || !!attribute.type));

/**
 * Get a single attribute descriptor by name
 * @param {FeatureSchema} schema the feature schema
 * @param {string} name the attribute name
 * @returns {object} the attribute descriptor
 */
export const getSchemaAttribute = (schema, name) => find(schema?.attributes, { name });

/**
 * Get the primary geometry attribute descriptor
 * @param {FeatureSchema} schema the feature schema
 * @returns {object} the attribute descriptor
 */
export const getGeometryAttribute = (schema) => find(schema?.attributes, (attribute) => !!attribute.geometry);

/**
 * Check if an attribute of the schema holds a geometry
 * @param {FeatureSchema} schema the feature schema
 * @param {string} name the attribute name
 * @returns {boolean} flag
 */
export const isGeometryAttribute = (schema, name) => !!getSchemaAttribute(schema, name)?.geometry;

/**
 * Check if a value is acceptable for an attribute.
 * Same outcome of utils/ogc/WFS/base `isValidValue`, so an attribute with no `nillable` is never valid.
 * @param {*} value the value to check
 * @param {object} attribute the attribute descriptor
 * @returns {boolean} flag
 */
export const isValidValueForAttribute = (value, attribute) =>
    attribute === undefined
    || attribute === null
    || attribute.nillable === true
    || attribute.nillable === false && value !== undefined && value !== null;

/**
 * Check if a value is acceptable for a named attribute of the schema
 * @param {*} value the value to check
 * @param {string} name the attribute name
 * @param {FeatureSchema} schema the feature schema
 * @returns {boolean} flag
 */
export const isValidValueForAttributeName = (value, name, schema) =>
    isValidValueForAttribute(value, getSchemaAttribute(schema, name));
