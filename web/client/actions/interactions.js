/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


export const APPLY_FILTER_WIDGET_INTERACTIONS = 'INTERACTIONS:APPLY_FILTER_WIDGET_INTERACTIONS';
export const ZOOM_TO_FILTER_EXTENT = 'INTERACTIONS:ZOOM_TO_FILTER_EXTENT';

/**
 * Apply interaction effects for all filters in a filter widget
 * Useful for triggering interactions right after saving or loading a widget
 * @param {string} widgetId - The filter widget ID
 * @param {string} [target='floating'] - The target container (defaults to 'floating')
 */
export const applyFilterWidgetInteractions = (widgetId, target = 'floating', filterId) => ({
    type: APPLY_FILTER_WIDGET_INTERACTIONS,
    widgetId,
    target,
    filterId
});

/**
 * Manually trigger a zoom-to interaction effect for a filter widget's filter.
 * @param {string} widgetId - The filter widget ID
 * @param {string} [target='floating'] - The target container (defaults to 'floating')
 * @param {string} filterId - The filter ID whose plugged zoom-to interaction(s) should zoom
 */
export const zoomToFilterExtent = (widgetId, target = 'floating', filterId) => ({
    type: ZOOM_TO_FILTER_EXTENT,
    widgetId,
    target,
    filterId
});
