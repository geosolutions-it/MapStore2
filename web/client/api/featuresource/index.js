/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as wfs from './wfs';
import * as vector from './vector';

/**
 * Registry of the services able to feed the attribute table.
 * A feature source exposes:
 * - `describe(layer, options)` promise of `{schema, attributes, geometry, jsonSchema, original}`
 * - `getFeatures(layer, filter, options)` observable of a feature collection
 * @name featuresource
 * @memberof api
 */
const sources = {
    wfs,
    wms: wfs,
    vector
};

/**
 * Register a feature source for a layer type
 * @param {string} type the layer type, or the `search.type` of the layer
 * @param {object} source the feature source implementation
 */
export const registerFeatureSource = (type, source) => {
    sources[type] = source;
};

/**
 * Get the feature source registered for a type
 * @param {string} type the registered type
 * @returns {object} the feature source
 */
export const getFeatureSourceByType = (type) => sources[type];

/**
 * Resolve the source type of a layer. A WMS layer is served by the service it is
 * linked to for search, every other layer by its own type.
 * @param {object} layer the layer
 * @returns {string} the source type
 */
export const getFeatureSourceType = (layer = {}) => layer?.type === 'wms'
    ? layer?.search?.type ?? 'wms'
    : layer?.type;

/**
 * Get the feature source of a layer
 * @param {object} layer the layer
 * @returns {object} the feature source
 */
export const getFeatureSource = (layer) => getFeatureSourceByType(getFeatureSourceType(layer));

/**
 * Check if the layer can be browsed in the attribute table
 * @param {object} layer the layer
 * @returns {boolean} flag
 */
export const canBrowseFeatures = (layer) => !!getFeatureSource(layer)?.capabilities?.(layer)?.browse;

/**
 * Check if the layer supports feature editing
 * @param {object} layer the layer
 * @returns {boolean} flag
 */
export const supportsFeatureEditing = (layer) => !!getFeatureSource(layer)?.capabilities?.(layer)?.editing;

/**
 * Check if layer features are editable, combining the source capabilities with the layer setting
 * @param {object} layer the layer
 * @returns {boolean} flag
 */
export const areLayerFeaturesEditable = (layer) => !layer?.disableFeaturesEditing && supportsFeatureEditing(layer);
