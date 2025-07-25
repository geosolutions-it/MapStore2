import { get } from 'lodash';

/**
 * Filters a layer to determine if it's eligible for selection.
 * Excludes background layers and only allows WMS, WFS, or ArcGIS types.
 *
 * @param {Object} layer - A layer object.
 * @returns {boolean} True if the layer is selectable.
 */
export const filterLayerForSelect = layer => layer && layer.group !== 'background' && ['wms', 'wfs', 'arcgis'].includes(layer.type);

/**
 * Retrieves all selectable layers from the Redux state.
 *
 * @param {Object} state - Redux state.
 * @returns {Array} List of selectable layers.
 */
export const selectLayersSelector = state => (get(state, 'layers.flat') || []).filter(filterLayerForSelect);

/**
 * Checks if the select control is currently enabled.
 *
 * @param {Object} state - Redux state.
 * @returns {boolean} True if selection is enabled.
 */
export const isSelectEnabled = state => get(state, "controls.select.enabled");

/**
 * Checks if a node explicitly has the `isSelectQueriable` property.
 *
 * @param {Object} node - Layer node or descriptor.
 * @returns {boolean} True if the property exists.
 */
export const hasSelectQueriableProp = node => Object.hasOwn(node, 'isSelectQueriable');

/**
 * Determines whether a layer node is considered selectable.
 * If `isSelectQueriable` is defined, it uses that.
 * Otherwise, falls back to `visibility` status.
 *
 * @param {Object} node - Layer node or descriptor.
 * @returns {boolean} True if the node is considered selectable.
 */
export const isSelectQueriable = node => hasSelectQueriableProp(node) ? node.isSelectQueriable : !!node?.visibility;

/**
 * Retrieves the entire `select` object from Redux state.
 *
 * @param {Object} state - Redux state.
 * @returns {Object} Selection-related state object.
 */
export const getSelectObj = state => get(state, 'select') ?? {};

/**
 * Retrieves query options used for selection.
 *
 * @param {Object} state - Redux state.
 * @returns {Object} Query options configuration.
 */
export const getSelectQueryOptions = state => getSelectObj(state).cfg?.queryOptions ?? {};

/**
 * Gets the maximum number of features to return in a select query.
 * Defaults to -1 if not defined or invalid.
 *
 * @param {Object} state - Redux state.
 * @returns {number} Maximum feature count for queries.
 */
export const getSelectQueryMaxFeatureCount = state => {
    const queryOptions = getSelectQueryOptions(state);
    return Number.isInteger(queryOptions.maxCount) ? queryOptions.maxCount : -1;
};

/**
 * Retrieves highlight options to apply on selected features.
 *
 * @param {Object} state - Redux state.
 * @returns {Object} Highlight configuration.
 */
export const getSelectHighlightOptions = state => getSelectObj(state).cfg?.highlightOptions ?? {};

/**
 * Retrieves all current selection data, grouped by layer ID.
 *
 * @param {Object} state - Redux state.
 * @returns {Object} A mapping of layer ID to GeoJSON feature collections.
 */
export const getSelectSelections = state => getSelectObj(state).selections ?? {};
