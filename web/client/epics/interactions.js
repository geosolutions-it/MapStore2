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
import { updateWidgetProperty, INSERT, UPDATE, DELETE } from '../actions/widgets';
import { getLayerFromId, layersSelector } from '../selectors/layers';
import { changeLayerProperties } from '../actions/layers';
import { processFilterToCQL } from '../utils/FilterEventUtils';
import { APPLY_FILTER_WIDGET_INTERACTIONS, applyFilterWidgetInteractions } from '../actions/interactions';

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
 * @param {string} widgetId - The filter widget ID that applied this filter
 * @returns {object} The updated filter object
 */
function createUpdatedFilter(interaction, widgetId) {
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
        ],
        "appliedFromWidget": widgetId
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
    // Extract filter widget ID from interaction's source node path
    const filterWidgetId = extractWidgetIdFromNodePath(interaction?.source?.nodePath);
    const updatedFilter = createUpdatedFilter(interaction, filterWidgetId);

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
    // Extract filter widget ID from interaction's source node path
    const filterWidgetId = extractWidgetIdFromNodePath(interaction?.source?.nodePath);
    const updatedFilter = createUpdatedFilter(interaction, filterWidgetId);

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
    // Extract filter widget ID from interaction's source node path
    const filterWidgetId = extractWidgetIdFromNodePath(interaction?.source?.nodePath);
    const updatedFilter = createUpdatedFilter(interaction, filterWidgetId);

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
    // Extract filter widget ID from interaction's source node path
    const filterWidgetId = extractWidgetIdFromNodePath(interaction?.source?.nodePath);
    const updatedFilter = createUpdatedFilter(interaction, filterWidgetId);

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

    // Extract filter widget ID from interaction's source node path
    const filterWidgetId = extractWidgetIdFromNodePath(interaction?.source?.nodePath);
    // Create updated filter
    const updatedFilter = createUpdatedFilter(interaction, filterWidgetId, interaction.id);

    // Deep clone the layer to avoid mutations
    const updatedLayer = JSON.parse(JSON.stringify(layer));

    if (interaction.source.eventType === "applyStyle") {
        updatedLayer.style = interaction.appliedData;
        return changeLayerProperties(updatedLayer.id, { style: updatedLayer.style });
    }


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
 * Cleanup filters applied by a specific filter widget
 * Removes all filters with appliedFromWidget === widgetId from map layers and widget layers
 * @param {string} widgetId - The filter widget ID
 * @param {object} state - Redux state
 * @returns {array} Array of actions to update affected layers and widgets
 */
function cleanupFiltersByWidgetId(widgetId, state) {
    const actions = [];

    if (!widgetId) {
        return actions;
    }

    // Cleanup from map layers
    const layers = layersSelector(state) || [];
    layers.forEach(layer => {
        if (layer.layerFilter && layer.layerFilter.filters && Array.isArray(layer.layerFilter.filters)) {
            const filteredFilters = layer.layerFilter.filters.filter(
                f => !(f.appliedFromWidget === widgetId)
            );

            // Only update if filters were actually removed
            if (filteredFilters.length !== layer.layerFilter.filters.length) {
                actions.push(
                    changeLayerProperties(layer.id, {
                        layerFilter: {
                            ...layer.layerFilter,
                            filters: filteredFilters
                        }
                    })
                );
            }
        }
    });

    // Cleanup from widgets
    const allWidgets = get(state, 'widgets.containers.floating.widgets') || [];
    allWidgets.forEach(widget => {
        let needsUpdate = false;
        let updatedWidget = null;

        switch (widget.widgetType) {
        case 'chart': {
            if (widget.charts && Array.isArray(widget.charts)) {
                const updatedCharts = widget.charts.map(chart => {
                    if (chart.traces && Array.isArray(chart.traces)) {
                        const updatedTraces = chart.traces.map(trace => {
                            if (trace.layer && trace.layer.layerFilter && trace.layer.layerFilter.filters) {
                                const filteredFilters = trace.layer.layerFilter.filters.filter(
                                    f => !(f.appliedFromWidget === widgetId)
                                );
                                if (filteredFilters.length !== trace.layer.layerFilter.filters.length) {
                                    needsUpdate = true;
                                    return {
                                        ...trace,
                                        layer: {
                                            ...trace.layer,
                                            layerFilter: {
                                                ...trace.layer.layerFilter,
                                                filters: filteredFilters
                                            }
                                        }
                                    };
                                }
                            }
                            return trace;
                        });
                        return {
                            ...chart,
                            traces: updatedTraces
                        };
                    }
                    return chart;
                });
                if (needsUpdate) {
                    updatedWidget = { ...widget, charts: updatedCharts };
                }
            }
            break;
        }
        case 'table':
        case 'counter': {
            if (widget.layer && widget.layer.layerFilter && widget.layer.layerFilter.filters) {
                const filteredFilters = widget.layer.layerFilter.filters.filter(
                    f => !(f.appliedFromWidget === widgetId)
                );
                if (filteredFilters.length !== widget.layer.layerFilter.filters.length) {
                    needsUpdate = true;
                    updatedWidget = {
                        ...widget,
                        layer: {
                            ...widget.layer,
                            layerFilter: {
                                ...widget.layer.layerFilter,
                                filters: filteredFilters
                            }
                        }
                    };
                }
            }
            break;
        }
        case 'map': {
            if (widget.maps && Array.isArray(widget.maps)) {
                const updatedMaps = widget.maps.map(map => {
                    if (map.layers && Array.isArray(map.layers)) {
                        const updatedLayers = map.layers.map(layer => {
                            if (layer.layerFilter && layer.layerFilter.filters) {
                                const filteredFilters = layer.layerFilter.filters.filter(
                                    f => !(f.appliedFromWidget === widgetId)
                                );
                                if (filteredFilters.length !== layer.layerFilter.filters.length) {
                                    needsUpdate = true;
                                    return {
                                        ...layer,
                                        layerFilter: {
                                            ...layer.layerFilter,
                                            filters: filteredFilters
                                        }
                                    };
                                }
                            }
                            return layer;
                        });
                        return {
                            ...map,
                            layers: updatedLayers
                        };
                    }
                    return map;
                });
                if (needsUpdate) {
                    updatedWidget = { ...widget, maps: updatedMaps };
                }
            }
            break;
        }
        default:
            break;
        }

        if (needsUpdate && updatedWidget) {
            // Update the appropriate property based on widget type
            if (widget.widgetType === 'chart') {
                actions.push(updateWidgetProperty(widget.id, 'charts', updatedWidget.charts));
            } else if (widget.widgetType === 'table' || widget.widgetType === 'counter') {
                actions.push(updateWidgetProperty(widget.id, 'layer', updatedWidget.layer));
            } else if (widget.widgetType === 'map') {
                actions.push(updateWidgetProperty(widget.id, 'maps', updatedWidget.maps));
            }
        }
    });

    return actions;
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

            // only filter widget supports interaction for now
            if (filterWidget.widgetType !== 'filter') {
                // eslint-disable-next-line no-console
                console.warn(`Interaction -> Widget is not a filter widget: ${widgetId}`);
                return Rx.Observable.empty();
            }

            // Get interactions from filter widget
            const interactions = filterWidget.interactions || [];
            const pluggedInteractions = interactions.filter(interaction => interaction.plugged === true);

            if (pluggedInteractions.length === 0) {
                return Rx.Observable.empty();
            }

            // Get current selections and filters
            const selections = filterWidget.selections || {};
            const filters = filterWidget.filters || [];

            // Process interactions sequentially using concatMap
            return Rx.Observable.from(pluggedInteractions)
                .concatMap(interaction => {
                    // Get fresh state for each interaction
                    const currentState = store.getState();

                    // Extract filter ID from interaction's source node path
                    const filterId = extractFilterIdFromNodePath(interaction.source.nodePath, widgetId);

                    if (!filterId) {
                        // eslint-disable-next-line no-console
                        console.warn(`Interaction -> Filter ID not found in node path: ${interaction.source.nodePath}`, { widgetId });
                        return Rx.Observable.empty();
                    }

                    // Find the specific filter and process it to CQL
                    const filter = filters.find(f => f.id === filterId);
                    const filterSelections = selections[filterId];
                    const matchingFilter = filter ? processFilterToCQL(filter, filterSelections) : null;

                    let updatedInteraction = {};

                    // for apply style
                    if (interaction.source.eventType === "applyStyle") {
                        updatedInteraction = {
                            ...interaction,
                            appliedData: filterSelections[0] ? filter.data.userDefinedItems.find(item => item.id === filterSelections[0]).style : null
                        };
                    // for apply filter
                    } else if (interaction.source.eventType === "applyFilter") {

                        updatedInteraction = {
                            ...interaction,
                            appliedData: matchingFilter || null
                        };
                    }

                    // Apply effect to interaction with fresh state
                    const action = applyInteractionEffect(updatedInteraction, currentState);

                    return action
                        ? Rx.Observable.of(action)
                        : Rx.Observable.empty();
                });
        });
};

/**
 * Epic to cleanup and reapply filter widget interactions
 * For DELETE: only cleanup filters
 * For INSERT/UPDATE: cleanup existing filters, then reapply fresh filters
 */
export const cleanupAndReapplyFilterWidgetInteractionsEpic = (action$, store) => {
    return action$
        .ofType(DELETE, INSERT, UPDATE)
        .mergeMap((action) => {
            const state = store.getState();
            let widget = null;
            let widgetId = null;
            let target = 'floating';

            // Extract widget information based on action type
            if (action.type === DELETE) {
                widget = action.widget;
                widgetId = widget?.id;
                target = action.target || 'floating';
            } else if (action.type === INSERT) {
                widget = action.widget;
                widgetId = action.id || widget?.id;
                target = action.target || 'floating';
            } else if (action.type === UPDATE) {
                widget = action.widget;
                widgetId = widget?.id;
                target = action.target || 'floating';
            }

            // Only process filter widgets
            if (!widget || widget.widgetType !== 'filter' || !widgetId) {
                return Rx.Observable.empty();
            }

            // Cleanup filters applied by this widget
            const cleanupActions = cleanupFiltersByWidgetId(widgetId, state);

            if (action.type === DELETE) {
                // For DELETE: only cleanup, no reapply
                return cleanupActions.length > 0
                    ? Rx.Observable.from(cleanupActions)
                    : Rx.Observable.empty();
            }

            // For INSERT/UPDATE: cleanup first, then reapply
            const cleanupObservable = cleanupActions.length > 0
                ? Rx.Observable.from(cleanupActions)
                // TODO: make separate action
                : Rx.Observable.of({ type: 'CLEANUP_COMPLETE' });

            // After cleanup completes, reapply interactions
            return cleanupObservable
                .concat(
                    Rx.Observable.of(applyFilterWidgetInteractions(widgetId, target))
                );
        });
};

export default {
    applyFilterWidgetInteractionsEpic,
    cleanupAndReapplyFilterWidgetInteractionsEpic
};
