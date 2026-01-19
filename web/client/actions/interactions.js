/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


export const INTERACTION_EVENT = 'INTERACTIONS:INTERACTION_EVENT';
export const APPLY_FILTER_WIDGET_INTERACTIONS = 'INTERACTIONS:APPLY_FILTER_WIDGET_INTERACTIONS';

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
