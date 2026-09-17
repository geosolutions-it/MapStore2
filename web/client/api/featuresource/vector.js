/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import axios from '../../libs/ajax';
import { getLayerJSONFeature } from '../../observables/wfs';
import { describeFeatureTypeToAttributes, describeFeatureTypeToSchema } from '../../utils/FeatureTypeUtils';

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
            .filter((attribute) => attribute.name.indexOf('geometry') === 0),
        original,
        schema: describeFeatureTypeToSchema(original, fields),
        attributes: describeFeatureTypeToAttributes(original, fields)
    };
};

/**
 * Describe a vector layer, reading the feature type from its url
 * @param {object} layer the layer
 * @param {object} options `url` and `fields`
 * @returns {object} promise of the feature type info
 */
export const describe = (layer = {}, { url, fields = [] } = {}) =>
    axios.get(url, {_msAuthSourceId: layer?.security?.sourceId}).then(({ data }) => toInfo(data, fields));

/**
 * Get the features of a vector layer, filtering them client side
 * @param {object} layer the layer
 * @param {object} filter the filter object
 * @param {object} options `url`, `featureTypeName` and the request options
 * @returns {object} observable of the feature collection
 */
export const getFeatures = (layer, filter, options = {}) => {
    const { url, featureTypeName, useLayerFilter, ...requestOptions } = options;
    return getLayerJSONFeature(
        {...layer, name: featureTypeName || layer?.name, search: {...(layer?.search ?? {}), url}},
        filter,
        {...requestOptions, layer}
    );
};
