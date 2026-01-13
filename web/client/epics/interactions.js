/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';
import { get } from 'lodash';

import { extractTraceFromWidgetByNodePath } from '../utils/InteractionUtils';
import { updateWidgetProperty } from '../actions/widgets';
import { getLayerFromId } from '../selectors/layers';
import { changeLayerProperties } from '../actions/layers';
import { combineFiltersToCQL } from '../utils/FilterEventUtils';
import { APPLY_FILTER_WIDGET_INTERACTIONS } from '../actions/interactions';

/**
 * Helper: Extract widget ID from node path
 * Returns the first element ID after "widgets" collection
 */
// eslint-disable-next-line no-unused-vars
function extractWidgetIdFromNodePath(nodePath) {
    if (!nodePath) return null;

    // Try new format: root.widgets[id] or .widgets[id]
    // Match: .widgets followed by [id]
    const newFormatMatch = nodePath.match(/\.widgets\[([^\]]+)\]/);
    if (newFormatMatch) {
        return newFormatMatch[1];
    }

    return null;
}

/**
 * Helper: Check if node path is a trace path
 * Trace paths have format: root.widgets[widget-id].traces[trace-id] or similar
 * @param {string} nodePath - The node path to check
 * @returns {boolean} True if the path is a trace path
 */
function isTracePath(nodePath) {
    if (!nodePath) return false;
    // Check if path contains .traces[ pattern
    return /\.traces\[/.test(nodePath);
}

/**
 * Helper: Extract chart ID and trace ID from trace node path
 * @param {string} nodePath - The trace node path (e.g., root.widgets[chart-id].traces[trace-id])
 * @returns {object|null} Object with chartId and traceId, or null if not a trace path
 * @todo Used in commented code for future implementation
 */
// eslint-disable-next-line no-unused-vars
function extractTraceInfoFromNodePath(nodePath) {
    if (!nodePath || !isTracePath(nodePath)) {
        return null;
    }

    // Match pattern: .widgets[chartId].traces[traceId]
    const traceMatch = nodePath.match(/\.widgets\[([^\]]+)\]\.traces\[([^\]]+)\]/);
    if (traceMatch) {
        return {
            chartId: traceMatch[1],
            traceId: traceMatch[2]
        };
    }

    return null;
}

/**
 * Creates the updated filter object from interaction data
 * @param {object} interaction - The interaction object
 * @returns {object} The updated filter object
 */
function createUpdatedFilter(interaction) {
    const cqlFilter = {
        ...interaction.appliedData
    };
    return {
        "id": interaction.id,
        "format": "logic",
        "version": "1.0.0",
        "logic": "OR",
        "filters": [
            cqlFilter
        ]
    };
}

/**
 * Updates a chart widget with filter by updating the trace's layer filter
 * @param {object} widget - The chart widget object
 * @param {object} interaction - The interaction object
 * @param {object} traceObject - The trace object to update
 * @param {string} widgetId - The widget ID
 * @returns {object} Action to update the widget's charts property
 */
function updateChartWidgetWithFilter(widget, interaction, traceObject, widgetId) {
    const widgetCharts = JSON.parse(JSON.stringify(widget?.charts ?? []));
    const updatedFilter = createUpdatedFilter(interaction);

    // append eventPayload.data to trace.layer.layerFilter.filters
    widgetCharts.forEach(chart => {
        chart.traces = chart.traces.map(trace => {
            if (trace.id === traceObject.id) {
                const existingFilters = trace.layer.layerFilter?.filters || [];
                const filterIndex = existingFilters.findIndex(f => f.id === updatedFilter.id);
                const updatedFilters = filterIndex >= 0
                    ? existingFilters.map((f, idx) => idx === filterIndex ? updatedFilter : f)
                    : [...existingFilters, updatedFilter];
                return {
                    ...trace,
                    layer: {
                        ...trace.layer,
                        layerFilter: {
                            ...trace.layer.layerFilter,
                            filters: updatedFilters
                        }
                    }
                };
            }
            return trace;
        });
    });

    // update widgetObject.charts
    return updateWidgetProperty(widgetId, 'charts', widgetCharts);
}

/**
 * Updates a table widget with filter by updating the widget's layer filter
 * @param {object} widget - The table widget object
 * @param {object} interaction - The interaction object
 * @param {string} widgetId - The widget ID
 * @returns {object} Action to update the widget's layer property
 */
function updateTableWidgetWithFilter(widget, interaction, widgetId) {
    const updatedWidget = JSON.parse(JSON.stringify(widget));
    const updatedFilter = createUpdatedFilter(interaction);

    // Ensure layer and layerFilter exist
    if (!updatedWidget.layer) {
        updatedWidget.layer = {};
    }
    if (!updatedWidget.layer.layerFilter) {
        updatedWidget.layer.layerFilter = {};
    }

    const existingFilters = updatedWidget.layer.layerFilter.filters || [];
    const filterIndex = existingFilters.findIndex(f => f.id === updatedFilter.id);
    const updatedFilters = filterIndex >= 0
        ? existingFilters.map((f, idx) => idx === filterIndex ? updatedFilter : f)
        : [...existingFilters, updatedFilter];

    updatedWidget.layer.layerFilter.filters = updatedFilters;

    return updateWidgetProperty(widgetId, 'layer', updatedWidget.layer);
}

/**
 * Updates a counter widget with filter by updating the widget's layer filter
 * @param {object} widget - The counter widget object
 * @param {object} interaction - The interaction object
 * @param {string} widgetId - The widget ID
 * @returns {object} Action to update the widget's layer property
 */
function updateCounterWidgetWithFilter(widget, interaction, widgetId) {
    const updatedWidget = JSON.parse(JSON.stringify(widget));
    const updatedFilter = createUpdatedFilter(interaction);

    // Ensure layer and layerFilter exist
    if (!updatedWidget.layer) {
        updatedWidget.layer = {};
    }
    if (!updatedWidget.layer.layerFilter) {
        updatedWidget.layer.layerFilter = {};
    }

    const existingFilters = updatedWidget.layer.layerFilter.filters || [];
    const filterIndex = existingFilters.findIndex(f => f.id === updatedFilter.id);
    const updatedFilters = filterIndex >= 0
        ? existingFilters.map((f, idx) => idx === filterIndex ? updatedFilter : f)
        : [...existingFilters, updatedFilter];

    updatedWidget.layer.layerFilter.filters = updatedFilters;
    return updateWidgetProperty(widgetId, 'layer', updatedWidget.layer);
}

/**
 * Updates a map widget with filter by updating the layer's filter in the appropriate map
 * @param {object} widget - The map widget object
 * @param {object} interaction - The interaction object with target containing nodePath
 * @param {string} widgetId - The widget ID
 * @returns {object} Action to update the widget's maps property
 */
function updateMapWidgetWithFilter(widget, interaction, widgetId) {
    if (!interaction || !interaction.target || !interaction.target.nodePath) {
        // eslint-disable-next-line no-console
        console.warn('Interaction -> Target or nodePath not found for map widget update', { widgetId });
        return null;
    }

    const nodePath = interaction.target.nodePath;
    const updatedWidget = JSON.parse(JSON.stringify(widget));
    const updatedFilter = createUpdatedFilter(interaction);

    // Extract mapId and layerId from nodePath
    // Expected pattern: root.widgets[widgetId].maps[mapId][layerId]
    const mapsMatch = nodePath.match(/\.maps\[([^\]]+)\]\[([^\]]+)\]$/);
    if (!mapsMatch) {
        // eslint-disable-next-line no-console
        console.warn(`Interaction -> Map ID or Layer ID not found in node path: ${nodePath}`);
        return null;
    }

    const mapId = mapsMatch[1];
    const layerId = mapsMatch[2];

    // Find the map and layer in the widget's maps array
    if (!updatedWidget.maps || !Array.isArray(updatedWidget.maps)) {
        // eslint-disable-next-line no-console
        console.warn(`Interaction -> Maps array not found in map widget: ${widgetId}`);
        return null;
    }

    const targetMap = updatedWidget.maps.find(map => map.mapId === mapId);
    if (!targetMap) {
        // eslint-disable-next-line no-console
        console.warn(`Interaction -> Map not found: ${mapId} in widget: ${widgetId}`);
        return null;
    }

    if (!targetMap.layers || !Array.isArray(targetMap.layers)) {
        // eslint-disable-next-line no-console
        console.warn(`Interaction -> Layers array not found in map: ${mapId}`);
        return null;
    }

    const targetLayer = targetMap.layers.find(layer => layer.id === layerId);
    if (!targetLayer) {
        // eslint-disable-next-line no-console
        console.warn(`Interaction -> Layer not found: ${layerId} in map: ${mapId}`);
        return null;
    }

    // Ensure layerFilter and filters exist
    if (!targetLayer.layerFilter) {
        targetLayer.layerFilter = {};
    }
    if (!targetLayer.layerFilter.filters) {
        targetLayer.layerFilter.filters = [];
    }

    // Update filters array: find existing filter by id and replace, or append if not found
    const existingFilters = targetLayer.layerFilter.filters || [];
    const filterIndex = existingFilters.findIndex(f => f.id === updatedFilter.id);
    const updatedFilters = filterIndex >= 0
        ? existingFilters.map((f, idx) => idx === filterIndex ? updatedFilter : f)
        : [...existingFilters, updatedFilter];
    // remove filter if no real filter applied;
    targetLayer.layerFilter.filters = updatedFilters.filter(f => !!interaction?.appliedData ? true : f.id !== updatedFilter?.id);

    // Update widget's maps property
    return updateWidgetProperty(widgetId, 'maps', updatedWidget.maps);
}

/**
 * Helper: Extract layer ID from node path
 * Returns the layer ID from pattern: root.maps.layers[layerId]
 * @param {string} nodePath - The node path to parse
 * @returns {string|null} The layer ID or null if not found
 */
function extractLayerIdFromNodePath(nodePath) {
    if (!nodePath) return null;

    // Match pattern: .layers[layerId]
    const layersMatch = nodePath.match(/\.layers\[([^\]]+)\]/);
    if (layersMatch) {
        return layersMatch[1];
    }

    return null;
}

/**
 * Helper: Extract filter ID from node path
 * Returns the filter ID from patterns like:
 * - root.widgets[widgetId][filterId] (direct format)
 * - root.widgets[widgetId].filters[filterId] (with filters collection)
 * @param {string} nodePath - The node path to parse
 * @param {string} widgetId - The widget ID to match
 * @returns {string|null} The filter ID or null if not found
 */
function extractFilterIdFromNodePath(nodePath, widgetId) {
    if (!nodePath || !widgetId) return null;

    // Escape special regex characters in widgetId
    const escapedWidgetId = widgetId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Try pattern: root.widgets[widgetId][filterId] (direct format, fallback in InteractionEventsSelector)
    const directMatch = nodePath.match(new RegExp(`\\.widgets\\[${escapedWidgetId}\\]\\[([^\\]]+)\\]`));
    if (directMatch) {
        return directMatch[1];
    }

    // Try pattern: root.widgets[widgetId].filters[filterId] (with filters collection)
    const filtersMatch = nodePath.match(new RegExp(`\\.widgets\\[${escapedWidgetId}\\]\\.filters\\[([^\\]]+)\\]`));
    if (filtersMatch) {
        return filtersMatch[1];
    }

    return null;
}

/**
 * Updates a map layer with filter by updating the layer's filter in Redux
 * @param {object} interaction - The interaction object
 * @param {object} target - The target object with nodePath
 * @param {object} state - Redux state
 * @returns {object|null} Action to update the layer or null if layer not found
 */
function updateMapLayerWithFilter( interaction, target, state) {
    if (!target || !target.nodePath) {
        // eslint-disable-next-line no-console
        console.warn('Interaction -> Target or nodePath not found for map layer update', { interactionId: interaction.id });
        return null;
    }

    // Extract layer ID from node path
    const layerId = extractLayerIdFromNodePath(target.nodePath);
    if (!layerId) {
        // eslint-disable-next-line no-console
        console.warn(`Interaction -> Layer ID not found for node path: ${target.nodePath}`);
        return { type: 'TARGET_OPERATION_SKIPPED', reason: 'layer_id_not_found' };
    }

    // Find layer in Redux state
    const layer = getLayerFromId(state, layerId);
    if (!layer) {
        // eslint-disable-next-line no-console
        console.warn(`Interaction -> Layer not found: ${layerId}`);
        return { type: 'TARGET_OPERATION_SKIPPED', reason: 'layer_not_found' };
    }

    // Create updated filter
    const updatedFilter = createUpdatedFilter(interaction);

    // Deep clone the layer to avoid mutations
    const updatedLayer = JSON.parse(JSON.stringify(layer));

    // Ensure layerFilter and filters exist
    if (!updatedLayer.layerFilter) {
        updatedLayer.layerFilter = {};
    }
    if (!updatedLayer.layerFilter.filters) {
        updatedLayer.layerFilter.filters = [];
    }

    // Update filters array: find existing filter by id and replace, or append if not found
    const existingFilters = updatedLayer.layerFilter.filters || [];
    const filterIndex = existingFilters.findIndex(f => f.id === updatedFilter.id);
    const updatedFilters = filterIndex >= 0
        ? existingFilters.map((f, idx) => idx === filterIndex ? updatedFilter : f)
        : [...existingFilters, updatedFilter];

    updatedLayer.layerFilter.filters = updatedFilters;
    // remove filter if no real filter applied;
    updatedLayer.layerFilter.filters = updatedFilters.filter(f => !!interaction?.appliedData ? true : f.id !== updatedFilter?.id);
    return changeLayerProperties(updatedLayer.id, { layerFilter: updatedLayer.layerFilter });
}

/**
 * Creates an updated widget by type, routing to the appropriate update function
 * @param {object} widget - The widget object
 * @param {object} interaction - The interaction object
 * @param {object} target - The target object with nodePath
 * @param {string} widgetId - The widget ID
 * @returns {object|null} Action to dispatch or null if unsupported type
 */
function createUpdatedWidgetByType(widget, interaction, target, widgetId) {
    if (!widget) {
        return null;
    }

    const widgetType = widget.widgetType;

    switch (widgetType) {
    case 'chart': {
        // For chart widgets, extract trace object from node path
        const traceObject = extractTraceFromWidgetByNodePath(widget, target.nodePath);
        if (!traceObject) {
            // eslint-disable-next-line no-console
            console.warn(`Interaction -> Trace not found for chart widget: ${widgetId}`, { nodePath: target.nodePath });
            return null;
        }
        return updateChartWidgetWithFilter(widget, interaction, traceObject, widgetId);
    }
    case 'table':
        return updateTableWidgetWithFilter(widget, interaction, widgetId);
    case 'counter':
        return updateCounterWidgetWithFilter(widget, interaction, widgetId);
    case "map":
        return updateMapWidgetWithFilter(widget, interaction, widgetId);
    default:
        // eslint-disable-next-line no-console
        console.warn(`Interaction -> Unsupported widget type: ${widgetType}`, { widgetId });
        return null;
    }
}

/**
 * Apply effect to interaction considering target and expectedDataType
 * @param {object} interaction - The interaction object with target and expectedDataType
 * @param {object} state - Redux state
 * @returns {object|null} Action to dispatch or null if skipped
 */
function applyInteractionEffect(interaction, state) {
    const { target } = interaction;

    if (!target || !target.nodePath) {
        // eslint-disable-next-line no-console
        console.warn('Interaction -> Target or nodePath not found', { interactionId: interaction.id });
        return null;
    }

    const isMapLayer = target.nodePath.includes('root.maps.layers');
    if (isMapLayer) {
        return updateMapLayerWithFilter(interaction, target, state);
    }

    // Extract widget ID from node path
    const widgetId = extractWidgetIdFromNodePath(target.nodePath);

    if (!widgetId) {
        // eslint-disable-next-line no-console
        console.warn(`Interaction -> Widget ID not found for node path: ${target.nodePath}`);
        return { type: 'TARGET_OPERATION_SKIPPED', reason: 'target_not_found' };
    }

    // Verify target widget exists
    const widgets = get(state, 'widgets.containers.floating.widgets') || [];
    const targetWidget = widgets.find(w => w.id === widgetId);

    if (!targetWidget) {
        // eslint-disable-next-line no-console
        console.warn(`Interaction -> Target widget not found: ${widgetId}`);
        return { type: 'TARGET_OPERATION_SKIPPED', reason: 'widget_not_found' };
    }

    // Create updated widget by type
    return createUpdatedWidgetByType(targetWidget, interaction, target, widgetId);
}

/**
 * Helper: Apply interaction effects for a filter widget
 * Extracts interactions from widget, converts selections to CQL, and applies effects
 * @param {object} filterWidget - The filter widget object
 * @param {string} widgetId - The widget ID
 * @param {object} state - Redux state
 * @returns {array} Array of actions from applyInteractionEffect
 */
function applyInteractionsForFilterWidget(filterWidget, widgetId, state) {
    // Get interactions from filter widget
    const interactions = filterWidget.interactions || [];

    if (interactions.length === 0) {
        return [];
    }

    // Filter to only process interactions that are plugged
    const pluggedInteractions = interactions.filter(interaction => interaction.plugged === true);

    if (pluggedInteractions.length === 0) {
        return [];
    }

    // Get current selections and filters
    const selections = filterWidget.selections || {};
    const filters = filterWidget.filters || [];

    // Convert selections to CQL filters
    const cqlFilters = combineFiltersToCQL(filters, selections);

    if (!cqlFilters || cqlFilters.length === 0) {
        // If no filters, still process interactions but with null appliedData
        return pluggedInteractions.map(interaction => {
            const updatedInteraction = {
                ...interaction,
                appliedData: null
            };
            return applyInteractionEffect(updatedInteraction, state);
        }).filter(Boolean);
    }

    // Process each interaction
    return pluggedInteractions.map(interaction => {
        // Extract filter ID from interaction's source node path
        const filterId = extractFilterIdFromNodePath(interaction.source.nodePath, widgetId);

        if (!filterId) {
            // eslint-disable-next-line no-console
            console.warn(`Interaction -> Filter ID not found in node path: ${interaction.source.nodePath}`, { widgetId });
            return null;
        }

        // Find the matching filter from CQL filters array
        const matchingFilter = cqlFilters.find(f => f.filterId === filterId);

        // Create updated interaction with appliedData
        const updatedInteraction = {
            ...interaction,
            appliedData: matchingFilter || null
        };

        // Apply effect to interaction
        return applyInteractionEffect(updatedInteraction, state);
    }).filter(Boolean);
}

/**
 * Epic to apply interaction effects for a filter widget
 * Triggered manually when needed (e.g., after saving or loading a widget)
 * Useful for applying interactions based on default selections set during editing
 */
export const applyFilterWidgetInteractionsEpic = (action$, store) => {
    return action$
        .ofType(APPLY_FILTER_WIDGET_INTERACTIONS)
        .mergeMap(({ widgetId, target }) => {
            const state = store.getState();
            const widgets = get(state, `widgets.containers[${target}].widgets`) || [];
            const filterWidget = widgets.find(w => w.id === widgetId);

            if (!filterWidget) {
                // eslint-disable-next-line no-console
                console.warn(`Interaction -> Filter widget not found: ${widgetId} in container: ${target}`);
                return Rx.Observable.empty();
            }

            if (filterWidget.widgetType !== 'filter') {
                // eslint-disable-next-line no-console
                console.warn(`Interaction -> Widget is not a filter widget: ${widgetId}`);
                return Rx.Observable.empty();
            }

            // Use helper function to apply interactions
            const actions = applyInteractionsForFilterWidget(filterWidget, widgetId, state);
            return Rx.Observable.from(actions);
        });
};

export default {
    applyFilterWidgetInteractionsEpic
};
