/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { find } from 'lodash';

import axios from '../../libs/ajax';
import ConfigUtils from '../../utils/ConfigUtils';
import { getLayerJSONFeature } from '../../observables/wfs';
import { mergeFiltersToOGC } from '../../utils/FilterUtils';
import {
    describeFeatureTypeToAttributes,
    describeFeatureTypeToJSONSchema,
    describeFeatureTypeToSchema
} from '../../utils/FeatureTypeUtils';
import { isGeometryType } from '../../utils/ogc/WFS/base';

export const INVALID_JSON = 'InvalidJSON';
export const EMPTY_FEATURE_TYPES = 'EmptyFeatureTypes';

const describeError = (message, code) => {
    const error = new Error(message);
    error.code = code;
    return error;
};

/**
 * Build the feature type info from a DescribeFeatureType response
 * @param {object} data the DescribeFeatureType response
 * @param {object[]} [fields=[]] the `fields` of the layer
 * @returns {object} the feature type info
 */
export const toInfo = (data, fields = []) => ({
    geometry: data.featureTypes[0].properties
        .filter(isGeometryType)
        .map((attribute) => ({
            label: find(fields, {name: attribute.name}) ?? attribute.name,
            attribute: attribute.name,
            type: 'geometry',
            valueId: "id",
            valueLabel: "name",
            values: []
        })),
    original: data,
    schema: describeFeatureTypeToSchema(data, fields),
    attributesJSONSchema: describeFeatureTypeToJSONSchema(data),
    attributes: describeFeatureTypeToAttributes(data, fields)
});

/**
 * Describe a WFS feature type
 * @param {object} layer the layer
 * @param {object} options `url`, `typeName`, `fields` and `authkeyParamName`
 * @returns {object} promise of the feature type info
 */
export const describe = (layer = {}, { url, typeName, fields = [], authkeyParamName } = {}) => {
    const describeUrl = ConfigUtils.filterUrlParams(url, authkeyParamName)
        + '?service=WFS&version=1.1.0&request=DescribeFeatureType&typeName=' + typeName
        + '&outputFormat=application/json';
    return axios.get(describeUrl, {_msAuthSourceId: layer?.security?.sourceId})
        .then(({ data }) => {
            if (typeof data === 'object' && data.featureTypes && data.featureTypes[0]) {
                return toInfo(data, fields);
            }
            try {
                JSON.parse(data);
            } catch (e) {
                throw describeError('Error from WFS: ' + e.message, INVALID_JSON);
            }
            throw describeError('Error: feature types are empty', EMPTY_FEATURE_TYPES);
        });
};

/**
 * Get the features of a WFS layer, composing the layer filter and the cql_filter
 * of the layer with the requested one
 * @param {object} layer the layer
 * @param {object} filter the filter object
 * @param {object} options `url`, `featureTypeName`, `useLayerFilter` and the request options
 * @returns {object} observable of the feature collection
 */
export const getFeatures = (layer, filter, options = {}) => {
    const { url, featureTypeName, useLayerFilter, ...requestOptions } = options;
    const { layerFilter, params = {} } = layer ?? {};
    const cqlFilter = params?.[find(Object.keys(params || {}), (k = "") => k.toLowerCase() === "cql_filter")];
    const ogcFilter = mergeFiltersToOGC({ogcVersion: '1.1.0'}, cqlFilter, useLayerFilter ? layerFilter : null, filter);
    return getLayerJSONFeature(
        {...layer, name: featureTypeName || layer?.name, search: {...(layer?.search ?? {}), url}},
        ogcFilter,
        {...requestOptions, layer}
    );
};
