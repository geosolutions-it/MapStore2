/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';
import { isNil, uniq } from 'lodash';

import { filterFeatureCollection } from '../../utils/VectorFeaturesUtils';
import {
    describeFeatureTypeToAttributes,
    describeFeatureTypeToSchema,
    isGeometryPropertyType
} from '../../utils/FeatureTypeUtils';

export const GEOMETRY_PROPERTY_NAME = 'geometry';

const VALUE_TYPES = {
    'number': 'xsd:number',
    'string': 'xsd:string',
    'boolean': 'xsd:boolean'
};

const propertyType = (features, name) => {
    const value = features
        .map((feature) => feature?.properties?.[name])
        .find((v) => !isNil(v));
    if (value instanceof Date) {
        return 'xsd:date-time';
    }
    return VALUE_TYPES[typeof value] ?? 'xsd:string';
};

/**
 * Build a feature type description from a collection of GeoJSON features, for
 * the sources that carry their data instead of describing it through a service
 * @param {object[]} [features=[]] the GeoJSON features
 * @param {string} [typeName] name of the feature type
 * @returns {object} the feature type description
 */
export const featuresToFeatureType = (features = [], typeName) => {
    const names = uniq(features.reduce((acc, feature) => [...acc, ...Object.keys(feature?.properties || {})], []));
    const geometryType = features.find((feature) => feature?.geometry?.type)?.geometry?.type;
    return {
        featureTypes: [{
            typeName,
            properties: [
                ...(geometryType ? [{
                    name: GEOMETRY_PROPERTY_NAME,
                    nillable: true,
                    type: `xsd:${geometryType}`,
                    localType: geometryType
                }] : []),
                ...names.map((name) => {
                    const type = propertyType(features, name);
                    return {
                        name,
                        nillable: true,
                        type,
                        localType: type.replace('xsd:', '')
                    };
                })
            ]
        }]
    };
};

/**
 * Build the feature type info from a feature type description
 * @param {object} data the feature type description
 * @param {object[]} [fields=[]] the `fields` of the layer
 * @returns {object} the feature type info
 */
export const toInfo = (data, fields = []) => {
    const original = { featureTypes: [data.featureTypes[0]] };
    return {
        geometry: original.featureTypes[0].properties
            .filter((property) => isGeometryPropertyType(property.type))
            .map((property) => ({
                label: property.name,
                attribute: property.name,
                type: 'geometry',
                valueId: "id",
                valueLabel: "name",
                values: []
            })),
        original,
        schema: describeFeatureTypeToSchema(original, fields),
        attributes: describeFeatureTypeToAttributes(original, fields)
    };
};

/**
 * Describe a vector layer. The features of the layer are its metadata.
 * @param {object} layer the layer
 * @param {object} options `fields`
 * @returns {object} promise of the feature type info
 */
export const describe = (layer = {}, { fields = [] } = {}) =>
    Promise.resolve(toInfo(featuresToFeatureType(layer?.features, layer?.name), fields));

/**
 * Get the features of a vector layer, filtering, sorting and paginating them client side
 * @param {object} layer the layer
 * @param {object} filter the filter object
 * @param {object} options `startIndex` and `maxFeatures`
 * @returns {object} observable of the feature collection
 */
// the result must not be emitted synchronously, the epics that dispatch a query
// subscribe to its response only after the query action has gone out
export const getFeatures = (layer, filter, options = {}) =>
    Rx.Observable.defer(() => Promise.resolve(filterFeatureCollection(layer?.features, filter, options)));

/**
 * Name identifying the feature type of a vector layer
 * @param {object} layer the layer
 * @returns {string} the feature type name
 */
export const getTypeName = (layer) => layer?.name ?? layer?.id;

/**
 * Capabilities of a vector layer. The features are filtered in memory, which
 * covers attribute equality only, and there is no service to export them from.
 * @returns {object} the capabilities
 */
export const capabilities = () => ({
    browse: true,
    editing: false,
    attributeFilter: { operators: false },
    spatialFilter: false,
    advancedFilter: false,
    mapFilterSync: true,
    download: false
});
