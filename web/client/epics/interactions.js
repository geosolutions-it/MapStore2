/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';
import { get } from 'lodash';

import { extractTraceFromWidgetByNodePath, TARGET_TYPES } from '../utils/InteractionUtils';
import { updateWidgetProperty, INSERT, UPDATE, DELETE } from '../actions/widgets';
import { getLayerFromId, layersSelector } from '../selectors/layers';
import { changeLayerProperties } from '../actions/layers';
import { processFilterToCQL } from '../utils/FilterEventUtils';
import { defaultLayerFilter } from '../utils/FilterUtils';
import { APPLY_FILTER_WIDGET_INTERACTIONS, applyFilterWidgetInteractions } from '../actions/interactions';

// ============================================================================
// Node Path Utilities
// ============================================================================

/**
 * Extracts widget ID from node path
 * Returns the first element ID after "widgets" collection
 * @param {string} nodePath - The node path to parse
 * @returns {string|null} The widget ID or null if not found
 */
function extractWidgetIdFromNodePath(nodePath) {
    if (!nodePath) return null;

    // Match: widgets[id] (at start or after dot)
    const newFormatMatch = nodePath.match(/(?:^|\.)widgets\[([^\]]+)\]/);
    if (newFormatMatch) {
        return newFormatMatch[1];
    }

    return null;
}

/**
 * Checks if a node path refers to a map layer
 * @param {string} nodePath - The node path to check
 * @returns {boolean} True if the node path is a map layer path
 */
function isMapLayerPath(nodePath) {
    if (!nodePath) return false;
    // Check for map.layers (direct map layers at start)
    return /^map\.layers/.test(nodePath);
}

/**
 * Extracts layer ID from node path
 * Returns the layer ID from pattern: map.layers[layerId] or widgets[widgetId].maps[mapId].layers[layerId]
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


// ============================================================================
// Filter Creation & Helpers
// ============================================================================

/**
 * Ensures layerFilter structure exists on a layer object.
 * When layerFilter is null/undefined, uses full default (groupFields, filterFields, etc.).
 * When it exists but is partial, merges with default and normalizes .filters.
 * @param {object} layer - The layer object to ensure structure on
 * @returns {object} The layer with ensured layerFilter structure
 */
function ensureLayerFilterStructure(layer) {
    if (!layer.layerFilter) {
        layer.layerFilter = { ...defaultLayerFilter, filters: [] };
    } else {
        layer.layerFilter = {
            ...defaultLayerFilter,
            ...layer.layerFilter,
            filters: Array.isArray(layer.layerFilter.filters) ? layer.layerFilter.filters : []
        };
    }
    return layer;
}

/**
 * Ensures interactionFilters array exists on a container (trace or widget)
 * @param {object} container - The trace or widget object to ensure structure on
 * @returns {object} The container with ensured interactionFilters array
 */
function ensureInteractionFiltersStructure(container) {
    if (!Array.isArray(container.interactionFilters)) {
        container.interactionFilters = [];
    }
    return container;
}

/**
 * Updates filters array by finding existing filter by ID and replacing or appending
 * @param {array} existingFilters - The current filters array
 * @param {object} updatedFilter - The filter to add or update
 * @returns {array} The updated filters array
 */
function updateFiltersArray(existingFilters, updatedFilter) {
    const filterIndex = existingFilters.findIndex(f => f.id === updatedFilter.id);
    return filterIndex >= 0
        ? existingFilters.map((f, idx) => idx === filterIndex ? updatedFilter : f)
        : [...existingFilters, updatedFilter];
}

/**
 * Removes empty filters (filters with no applied data) from the filters array
 * @param {array} filters - The filters array to clean
 * @param {object} interaction - The interaction object to check for appliedData
 * @param {string} filterId - The filter ID to potentially remove
 * @returns {array} The cleaned filters array
 */
function removeEmptyFilters(filters, interaction, filterId) {
    return filters.filter(f => {
        // Keep filter if it has applied data, or if it's not the filter we're checking
        return !!interaction?.appliedData ? true : f.id !== filterId;
    });
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
 * Updates a chart widget with filter by updating the trace's interactionFilters
 * @param {object} widget - The chart widget object
 * @param {object} interaction - The interaction object
 * @param {object} traceObject - The trace object to update
 * @param {string} widgetId - The widget ID
 * @returns {object} Action to update the widget's charts property
 */
function updateChartWidgetWithFilter(widget, interaction, traceObject, widgetId) {
    const widgetCharts = JSON.parse(JSON.stringify(widget?.charts ?? []));
    const filterWidgetId = extractWidgetIdFromNodePath(interaction?.source?.nodePath);
    const updatedFilter = createUpdatedFilter(interaction, filterWidgetId);

    widgetCharts.forEach(chart => {
        chart.traces = (chart.traces || []).map(trace => {
            if (trace.id === traceObject.id) {
                ensureInteractionFiltersStructure(trace);
                const existingFilters = trace.interactionFilters || [];
                const updatedFilters = updateFiltersArray(existingFilters, updatedFilter);
                const cleanedFilters = removeEmptyFilters(updatedFilters, interaction, updatedFilter.id);
                return {
                    ...trace,
                    interactionFilters: cleanedFilters
                };
            }
            return trace;
        });
    });

    return updateWidgetProperty(widgetId, 'charts', widgetCharts);
}

/**
 * Updates a layer-based widget (table or counter) with filter by updating the widget's interactionFilters
 * @param {object} widget - The widget object (table or counter)
 * @param {object} interaction - The interaction object
 * @param {string} widgetId - The widget ID
 * @returns {object} Action to update the widget's interactionFilters property
 */
function updateLayerBasedWidgetWithFilter(widget, interaction, widgetId) {
    const updatedWidget = JSON.parse(JSON.stringify(widget));
    const filterWidgetId = extractWidgetIdFromNodePath(interaction?.source?.nodePath);
    const updatedFilter = createUpdatedFilter(interaction, filterWidgetId);

    ensureInteractionFiltersStructure(updatedWidget);

    const existingFilters = updatedWidget.interactionFilters || [];
    const updatedFilters = updateFiltersArray(existingFilters, updatedFilter);
    const cleanedFilters = removeEmptyFilters(updatedFilters, interaction, updatedFilter.id);
    updatedWidget.interactionFilters = cleanedFilters;

    return updateWidgetProperty(widgetId, 'interactionFilters', updatedWidget.interactionFilters);
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
        return null;
    }

    const nodePath = interaction.target.nodePath;
    const updatedWidget = JSON.parse(JSON.stringify(widget));
    const filterWidgetId = extractWidgetIdFromNodePath(interaction?.source?.nodePath);
    const updatedFilter = createUpdatedFilter(interaction, filterWidgetId);

    // Extract mapId and layerId from nodePath
    // Expected pattern: widgets[widgetId].maps[mapId].layers[layerId]
    const mapsMatch = nodePath.match(/\.maps\[([^\]]+)\]\.layers\[([^\]]+)\]$/);
    if (!mapsMatch) {
        return null;
    }

    const mapId = mapsMatch[1];
    const layerId = mapsMatch[2];

    // Find the map and layer in the widget's maps array
    if (!updatedWidget.maps || !Array.isArray(updatedWidget.maps)) {
        return null;
    }

    const targetMap = updatedWidget.maps.find(map => map.mapId === mapId);
    if (!targetMap) {
        return null;
    }

    if (!targetMap.layers || !Array.isArray(targetMap.layers)) {
        return null;
    }

    const targetLayer = targetMap.layers.find(layer => layer.id === layerId);
    if (!targetLayer) {
        return null;
    }

    // Ensure layerFilter and filters exist
    ensureLayerFilterStructure(targetLayer);

    // Update filters array
    const existingFilters = targetLayer.layerFilter.filters || [];
    const updatedFilters = updateFiltersArray(existingFilters, updatedFilter);
    const cleanedFilters = removeEmptyFilters(updatedFilters, interaction, updatedFilter.id);
    targetLayer.layerFilter.filters = cleanedFilters;

    return updateWidgetProperty(widgetId, 'maps', updatedWidget.maps);
}

/**
 * Updates a map widget with style by updating the layer's style in the appropriate map
 * @param {object} widget - The map widget object
 * @param {object} interaction - The interaction object with target containing nodePath
 * @param {string} widgetId - The widget ID
 * @returns {object} Action to update the widget's maps property
 */
function updateMapWidgetWithStyle(widget, interaction, widgetId) {
    if (!interaction || !interaction.target || !interaction.target.nodePath) {
        return null;
    }

    const nodePath = interaction.target.nodePath;
    const updatedWidget = JSON.parse(JSON.stringify(widget));

    // Extract mapId and layerId from nodePath
    // Expected pattern: widgets[widgetId].maps[mapId][layerId]
    const mapsMatch = nodePath.match(/\.maps\[([^\]]+)\]\[([^\]]+)\]$/);
    if (!mapsMatch) {
        return null;
    }

    const mapId = mapsMatch[1];
    const layerId = mapsMatch[2];

    // Find the map and layer in the widget's maps array
    if (!updatedWidget.maps || !Array.isArray(updatedWidget.maps)) {
        return null;
    }

    const targetMap = updatedWidget.maps.find(map => map.mapId === mapId);
    if (!targetMap) {
        return null;
    }

    if (!targetMap.layers || !Array.isArray(targetMap.layers)) {
        return null;
    }

    const targetLayer = targetMap.layers.find(layer => layer.id === layerId);
    if (!targetLayer) {
        return null;
    }

    // Update layer style
    targetLayer.style = interaction.appliedData;

    return updateWidgetProperty(widgetId, 'maps', updatedWidget.maps);
}

// ============================================================================
// Widget Updates
// ============================================================================

// ============================================================================
// Layer Updates
// ============================================================================

/**
 * Updates a map layer with filter by updating the layer's filter in Redux
 * @param {object} interaction - The interaction object
 * @param {object} target - The target object with nodePath
 * @param {object} state - Redux state
 * @returns {object|null} Action to update the layer or null if layer not found
 */
function updateMapLayerWithFilter(interaction, target, state) {
    if (!target || !target.nodePath) {
        return null;
    }

    // Extract layer ID from node path
    const layerId = extractLayerIdFromNodePath(target.nodePath);
    if (!layerId) {
        return { type: 'TARGET_OPERATION_SKIPPED', reason: 'layer_id_not_found' };
    }

    // Find layer in Redux state
    const layer = getLayerFromId(state, layerId);
    if (!layer) {
        return { type: 'TARGET_OPERATION_SKIPPED', reason: 'layer_not_found' };
    }

    const filterWidgetId = extractWidgetIdFromNodePath(interaction?.source?.nodePath);
    const updatedFilter = createUpdatedFilter(interaction, filterWidgetId);

    // Deep clone the layer to avoid mutations
    const updatedLayer = JSON.parse(JSON.stringify(layer));

    // Ensure layerFilter and filters exist
    ensureLayerFilterStructure(updatedLayer);

    // Update filters array
    const existingFilters = updatedLayer.layerFilter.filters || [];
    const updatedFilters = updateFiltersArray(existingFilters, updatedFilter);
    const cleanedFilters = removeEmptyFilters(updatedFilters, interaction, updatedFilter.id);
    updatedLayer.layerFilter.filters = cleanedFilters;
    return changeLayerProperties(updatedLayer.id, { layerFilter: updatedLayer.layerFilter });
}

const updateMapLayerWithStyle = (interaction, target, state) => {
    const layerId = extractLayerIdFromNodePath(target.nodePath);
    if (!layerId) {
        return Rx.Observable.empty();
    }
    const layer = getLayerFromId(state, layerId);
    if (!layer) {
        return Rx.Observable.empty();
    }

    // const updatedLayer = JSON.parse(JSON.stringify(layer));
    // updatedLayer.style = interaction.appliedData;
    return changeLayerProperties(layer.id, { style: interaction.appliedData});
};


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
            return null;
        }
        return updateChartWidgetWithFilter(widget, interaction, traceObject, widgetId);
    }
    case 'table':
    case 'counter':
        return updateLayerBasedWidgetWithFilter(widget, interaction, widgetId);
    case 'map':
        return updateMapWidgetWithFilter(widget, interaction, widgetId);
    default:
        return null;
    }
}

// ============================================================================
// Cleanup Functions
// ============================================================================

/**
 * Removes filters applied by a specific widget from a filters array
 * @param {array} filters - The filters array
 * @param {string} widgetId - The filter widget ID
 * @returns {array} The filtered array
 */
function removeFiltersByWidgetId(filters, widgetId) {
    return filters.filter(f => !(f.appliedFromWidget === widgetId));
}

/**
 * Cleans up interactionFilters from a container (trace or widget).
 * Returns an object with cleaned filters and update flags.
 * @param {object} container - The container object (trace or widget) to clean filters from
 * @param {string} widgetId - The filter widget ID
 * @returns {object} Object with { updatedContainer, needsUpdate } where updatedContainer has cleaned filters
 */
function cleanupInteractionFilters(container, widgetId) {
    let needsUpdate = false;
    const updatedContainer = { ...container };

    // Cleanup from interactionFilters
    if (container.interactionFilters && Array.isArray(container.interactionFilters)) {
        const filteredFilters = removeFiltersByWidgetId(container.interactionFilters, widgetId);
        if (filteredFilters.length !== container.interactionFilters.length) {
            needsUpdate = true;
            updatedContainer.interactionFilters = filteredFilters;
        }
    }
    // Cleanup from old location: layer.layerFilter.filters (backward compatibility)
    if (container.layer && container.layer.layerFilter && container.layer.layerFilter.filters && Array.isArray(container.layer.layerFilter.filters)) {
        const filteredLayerFilters = removeFiltersByWidgetId(
            container.layer.layerFilter.filters,
            widgetId
        );
        if (filteredLayerFilters.length !== container.layer.layerFilter.filters.length) {
            needsUpdate = true;
            updatedContainer.layer = {
                ...container.layer,
                layerFilter: {
                    ...container.layer.layerFilter,
                    filters: filteredLayerFilters
                }
            };
        }
    }

    return { updatedContainer, needsUpdate };
}

/**
 * Cleanup filters from map layers
 * @param {string} widgetId - The filter widget ID
 * @param {object} state - Redux state
 * @returns {array} Array of actions to update affected layers
 */
function cleanupFiltersFromMapLayers(widgetId, state) {
    const actions = [];
    const layers = layersSelector(state) || [];

    layers.forEach(layer => {
        if (layer.layerFilter && layer.layerFilter.filters && Array.isArray(layer.layerFilter.filters)) {
            const filteredFilters = removeFiltersByWidgetId(layer.layerFilter.filters, widgetId);

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

    return actions;
}

/**
 * Cleanup filters from a chart widget
 * @param {object} widget - The chart widget
 * @param {string} widgetId - The filter widget ID
 * @returns {object|null} Updated widget or null if no changes
 */
function cleanupFiltersFromChartWidget(widget, widgetId) {
    if (!widget.charts || !Array.isArray(widget.charts)) {
        return null;
    }

    let needsUpdate = false;
    const updatedCharts = widget.charts.map(chart => {
        if (!chart.traces || !Array.isArray(chart.traces)) {
            return chart;
        }

        const updatedTraces = chart.traces.map(trace => {
            const { updatedContainer, needsUpdate: traceUpdated } = cleanupInteractionFilters(trace, widgetId);
            if (traceUpdated) {
                needsUpdate = true;
                return updatedContainer;
            }
            return trace;
        });

        return {
            ...chart,
            traces: updatedTraces
        };
    });

    return needsUpdate ? { ...widget, charts: updatedCharts } : null;
}

/**
 * Cleanup filters from a layer-based widget (table or counter)
 * @param {object} widget - The widget object
 * @param {string} widgetId - The filter widget ID
 * @returns {object|null} Updated widget or null if no changes
 */
function cleanupFiltersFromLayerBasedWidget(widget, widgetId) {
    const { updatedContainer, needsUpdate } = cleanupInteractionFilters(widget, widgetId);
    return needsUpdate ? updatedContainer : null;
}

/**
 * Cleanup filters from a map widget
 * @param {object} widget - The map widget
 * @param {string} widgetId - The filter widget ID
 * @returns {object|null} Updated widget or null if no changes
 */
function cleanupFiltersFromMapWidget(widget, widgetId) {
    if (!widget.maps || !Array.isArray(widget.maps)) {
        return null;
    }

    let needsUpdate = false;
    const updatedMaps = widget.maps.map(map => {
        if (!map.layers || !Array.isArray(map.layers)) {
            return map;
        }

        const updatedLayers = map.layers.map(layer => {
            if (layer.layerFilter && layer.layerFilter.filters) {
                const filteredFilters = removeFiltersByWidgetId(layer.layerFilter.filters, widgetId);
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
    });

    return needsUpdate ? { ...widget, maps: updatedMaps } : null;
}

/**
 * Cleanup filters from widgets
 * @param {string} widgetId - The filter widget ID
 * @param {object} state - Redux state
 * @param {string} targetContainer - The widget container target (default: 'floating')
 * @returns {array} Array of actions to update affected widgets
 */
function cleanupFiltersFromWidgets(widgetId, state, targetContainer = 'floating') {
    const actions = [];
    const allWidgets = get(state, `widgets.containers[${targetContainer}].widgets`) || [];

    allWidgets.forEach(widget => {
        let updatedWidget = null;

        switch (widget.widgetType) {
        case 'chart':
            updatedWidget = cleanupFiltersFromChartWidget(widget, widgetId);
            if (updatedWidget) {
                actions.push(updateWidgetProperty(widget.id, 'charts', updatedWidget.charts));
            }
            break;
        case 'table':
        case 'counter':
            updatedWidget = cleanupFiltersFromLayerBasedWidget(widget, widgetId);
            if (updatedWidget) {
                actions.push(updateWidgetProperty(widget.id, 'interactionFilters', updatedWidget.interactionFilters));
            }
            break;
        case 'map':
            updatedWidget = cleanupFiltersFromMapWidget(widget, widgetId);
            if (updatedWidget) {
                actions.push(updateWidgetProperty(widget.id, 'maps', updatedWidget.maps));
            }
            break;
        default:
            break;
        }
    });

    return actions;
}

/**
 * Cleanup filters applied by a specific filter widget
 * Removes all filters with appliedFromWidget === widgetId from map layers and widget layers
 * @param {string} widgetId - The filter widget ID
 * @param {object} state - Redux state
 * @param {string} targetContainer - The widget container target (default: 'floating')
 * @returns {array} Array of actions to update affected layers and widgets
 */
function cleanupFiltersByWidgetId(widgetId, state, targetContainer = 'floating') {
    if (!widgetId) {
        return [];
    }

    const layerActions = cleanupFiltersFromMapLayers(widgetId, state);
    const widgetActions = cleanupFiltersFromWidgets(widgetId, state, targetContainer);

    return [...layerActions, ...widgetActions];
}

/**
 * Cleanup interactions from filter widgets that reference a deleted widget
 * Removes interactions where source.nodePath contains the deleted widget ID
 * @param {string} deletedWidgetId - The deleted widget ID
 * @param {object} state - Redux state
 * @param {string} targetContainer - The widget container target (default: 'floating')
 * @returns {array} Array of actions to update affected filter widgets
 */
function cleanupInteractionsFromFilterWidgets(deletedWidgetId, state, targetContainer = 'floating') {
    if (!deletedWidgetId) {
        return [];
    }

    const actions = [];
    const allWidgets = get(state, `widgets.containers[${targetContainer}].widgets`) || [];
    const filterWidgets = allWidgets.filter(w => w.widgetType === 'filter');

    filterWidgets.forEach(filterWidget => {
        const interactions = filterWidget.interactions || [];
        // Filter out interactions that reference the deleted widget in source.nodePath
        const filteredInteractions = interactions.filter(interaction => {
            const targetNodePath = interaction?.target?.nodePath || '';
            // Check if nodePath contains reference to the deleted widget
            // Pattern: widgets[deletedWidgetId]
            const widgetIdPattern = new RegExp(`widgets\\[${deletedWidgetId}\\]`);
            return !widgetIdPattern.test(targetNodePath);
        });

        // Only update if interactions were actually removed
        if (filteredInteractions.length !== interactions.length) {
            actions.push(updateWidgetProperty(filterWidget.id, 'interactions', filteredInteractions, 'replace', targetContainer));
        }
    });

    return actions;
}

// ============================================================================
// Interaction Effect
// ============================================================================

/**
 * Apply effect to interaction considering target and expectedDataType
 * @param {object} interaction - The interaction object with target and expectedDataType
 * @param {object} state - Redux state
 * @param {string} targetContainer - The widget container target (default: 'floating')
 * @returns {object|null} Action to dispatch or null if skipped
 */
function applyInteractionEffect(interaction, state, targetContainer = 'floating') {
    const { target: interactionTarget } = interaction;

    if (!interactionTarget || !interactionTarget.nodePath) {
        return null;
    }

    if (isMapLayerPath(interactionTarget.nodePath)) {
        return updateMapLayerWithFilter(interaction, interactionTarget, state);
    }

    // Extract widget ID from node path
    const widgetId = extractWidgetIdFromNodePath(interactionTarget.nodePath);

    if (!widgetId) {
        return Rx.Observable.empty();
    }

    // Verify target widget exists
    const widgets = get(state, `widgets.containers[${targetContainer}].widgets`) || [];
    const targetWidget = widgets.find(w => w.id === widgetId);

    if (!targetWidget) {
        return Rx.Observable.empty();
    }

    // Create updated widget by type
    return createUpdatedWidgetByType(targetWidget, interaction, interactionTarget, widgetId);
}

const applyInteractionEffectForApplyStyle = (interaction, state, targetContainer = 'floating') => {
    const { target: interactionTarget } = interaction;


    if (!interactionTarget || !interactionTarget.nodePath) {
        return null;
    }

    if (isMapLayerPath(interaction.target.nodePath)) {
        return updateMapLayerWithStyle(interaction, interactionTarget, state);
    }

    // Extract widget ID from node path
    const widgetId = extractWidgetIdFromNodePath(interactionTarget.nodePath);

    if (!widgetId) {
        return Rx.Observable.empty();
    }

    // Verify target widget exists
    const widgets = get(state, `widgets.containers[${targetContainer}].widgets`) || [];
    const targetWidget = widgets.find(w => w.id === widgetId);

    if (!targetWidget) {
        return Rx.Observable.empty();
    }

    // If it's a map widget, update it with style
    if (targetWidget.widgetType === 'map') {
        return updateMapWidgetWithStyle(targetWidget, interaction, widgetId);
    }

    return Rx.Observable.empty();
};

// ============================================================================
// Epics
// ============================================================================

/**
 * Epic to apply interaction effects for a filter widget
 * Triggered manually when needed (e.g., after saving or loading a widget)
 * Useful for applying interactions based on default selections set during editing
 */
export const applyFilterWidgetInteractionsEpic = (action$, store) => {
    return action$
        .ofType(APPLY_FILTER_WIDGET_INTERACTIONS)
        .switchMap(({ widgetId, target, filterId }) => {
            const state = store.getState();
            const widgets = get(state, `widgets.containers[${target}].widgets`) || [];
            const filterWidget = widgets.find(w => w.id === widgetId);

            if (!filterWidget) {
                return Rx.Observable.empty();
            }

            // only filter widget supports interaction for now
            if (filterWidget.widgetType !== 'filter') {
                return Rx.Observable.empty();
            }

            // Get interactions from filter widget
            const interactions = filterWidget.interactions || [];
            const pluggedInteractions = interactions.filter(interaction => interaction.plugged === true && interaction.source.nodePath.includes(filterId) && !!interaction.targetType);

            if (pluggedInteractions.length === 0) {
                return Rx.Observable.empty();
            }

            // Get current selections and filters
            const selections = filterWidget.selections || {};
            const filters = filterWidget.filters || [];

            // Process interactions sequentially using concatMap
            return Rx.Observable.from(pluggedInteractions)
                .switchMap(interaction => {
                    // Get fresh state for each interaction
                    const currentState = store.getState();
                    const filter = filters.find(f => f.id === filterId);


                    if (interaction.targetType === TARGET_TYPES.APPLY_STYLE) {
                        const selectedStyle = selections[filterId][0];
                        const styleName = filter?.data?.userDefinedItems?.find(item => item.id === selectedStyle)?.style?.name;

                        const updatedInteraction = {
                            ...interaction,
                            appliedData: styleName
                        };
                        const action = applyInteractionEffectForApplyStyle(updatedInteraction, currentState, target);
                        return action
                            ? Rx.Observable.of(action)
                            : Rx.Observable.empty();
                    }
                    // Find the specific filter and process it to CQL
                    const filterSelections = selections[filterId];
                    const matchingFilter = filter ? processFilterToCQL(filter, filterSelections) : null;

                    const updatedInteraction = {
                        ...interaction,
                        appliedData: matchingFilter || null
                    };

                    // Apply effect to interaction with fresh state
                    const action = applyInteractionEffect(updatedInteraction, currentState, target);

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

                if (!widgetId) {
                    return Rx.Observable.empty();
                }

                // For DELETE: cleanup interactions from filter widgets that reference this widget
                const interactionCleanupActions = cleanupInteractionsFromFilterWidgets(widgetId, state, target);

                // If deleted widget is a filter widget, also cleanup filters applied by it
                if (widget && widget.widgetType === 'filter') {
                    const filterCleanupActions = cleanupFiltersByWidgetId(widgetId, state, target);
                    const allCleanupActions = [...interactionCleanupActions, ...filterCleanupActions];
                    return allCleanupActions.length > 0
                        ? Rx.Observable.from(allCleanupActions)
                        : Rx.Observable.empty();
                }

                // For non-filter widgets, only cleanup interactions
                return interactionCleanupActions.length > 0
                    ? Rx.Observable.from(interactionCleanupActions)
                    : Rx.Observable.empty();
            } else if (action.type === INSERT) {
                widget = action.widget;
                widgetId = action.id || widget?.id;
                target = action.target || 'floating';
            } else if (action.type === UPDATE) {
                widget = action.widget;
                widgetId = widget?.id;
                target = action.target || 'floating';
            }

            // For INSERT/UPDATE: only process filter widgets
            if (!widget || widget.widgetType !== 'filter' || !widgetId) {
                return Rx.Observable.empty();
            }

            // Cleanup filters applied by this widget
            const cleanupActions = cleanupFiltersByWidgetId(widgetId, state, target);

            // For INSERT/UPDATE: cleanup first, then reapply
            const cleanupObservable = cleanupActions.length > 0
                ? Rx.Observable.from(cleanupActions)
                : Rx.Observable.empty();

            // After cleanup completes, reapply interactions for all filter widgets
            return cleanupObservable
                .concat(
                    Rx.Observable.defer(() => {
                        const currentState = store.getState();
                        const allWidgets = get(currentState, `widgets.containers[${target}].widgets`) || [];
                        const filterWidgets = allWidgets.filter(w => w.widgetType === 'filter');

                        if (filterWidgets.length === 0) {
                            return Rx.Observable.empty();
                        }

                        // Apply interactions for all filter widgets sequentially
                        return Rx.Observable.from(filterWidgets)
                            .switchMap(filterWidget => {
                                // Get all filter IDs from widget.filters
                                const filterIds = (filterWidget.filters || []).map(f => f.id);

                                // Apply interactions for each filter ID
                                return Rx.Observable.from(filterIds)
                                    .switchMap(filterId =>
                                        Rx.Observable.of(applyFilterWidgetInteractions(filterWidget.id, target, filterId))
                                    );
                            });
                    })
                );
        });
};

export default {
    applyFilterWidgetInteractionsEpic,
    cleanupAndReapplyFilterWidgetInteractionsEpic
};
