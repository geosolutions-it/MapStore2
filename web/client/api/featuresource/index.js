/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as wfs from './wfs';
import * as vector from './vector';
import { isAnnotationLayer } from '../../utils/AnnotationsLayerUtils';

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
    : isAnnotationLayer(layer)
        ? undefined
        : layer?.type;

/**
 * Get the feature source of a layer
 * @param {object} layer the layer
 * @returns {object} the feature source
 */
export const getFeatureSource = (layer) => getFeatureSourceByType(getFeatureSourceType(layer));

/**
 * Name identifying the feature type of a layer, as its own source names it
 * @param {object} layer the layer
 * @returns {string} the feature type name
 */
export const getFeatureTypeName = (layer) => getFeatureSource(layer)?.getTypeName?.(layer) ?? layer?.name;

/**
 * What the attribute table can offer for a layer. A flag is `false` when the source
 * does not support it, `true` when it does, and an object when the support is partial.
 * @typedef {object} FeatureSourceCapabilities
 * @property {boolean} browse the features can be listed
 * @property {boolean} editing the features can be written back
 * @property {boolean|object} attributeFilter the attribute filters are honoured, `{operators}` tells if the comparison operators are
 * @property {boolean|object} spatialFilter the spatial filters are honoured, geometry filter, map selection and viewport filter
 * @property {boolean} advancedFilter the filters built by the query panel are honoured
 * @property {boolean} mapFilterSync the filter of the grid can be pushed to the layer on the map
 * @property {boolean} download the features can be exported
 */
const DEFAULT_CAPABILITIES = {
    browse: false,
    editing: false,
    attributeFilter: false,
    spatialFilter: false,
    advancedFilter: false,
    mapFilterSync: false,
    download: false
};

/**
 * Get the capabilities of the source of a layer, defaulting to no support at all
 * @param {object} layer the layer
 * @returns {FeatureSourceCapabilities} the capabilities
 */
export const getCapabilities = (layer) => ({
    ...DEFAULT_CAPABILITIES,
    ...(getFeatureSource(layer)?.capabilities?.(layer) || {})
});

/**
 * Check if the layer can be browsed in the attribute table
 * @param {object} layer the layer
 * @returns {boolean} flag
 */
export const canBrowseFeatures = (layer) => !!getCapabilities(layer).browse;

/**
 * Check if the layer supports feature editing
 * @param {object} layer the layer
 * @returns {boolean} flag
 */
export const supportsFeatureEditing = (layer) => !!getCapabilities(layer).editing;

/**
 * Check if layer features are editable, combining the source capabilities with the layer setting
 * @param {object} layer the layer
 * @returns {boolean} flag
 */
export const areLayerFeaturesEditable = (layer) => !layer?.disableFeaturesEditing && supportsFeatureEditing(layer);
