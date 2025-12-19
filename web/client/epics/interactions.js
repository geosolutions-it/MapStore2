/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';
import uuid from 'uuid/v1';
import { get } from 'lodash';

import {
    INTERACTION_EVENT,
    EXECUTE_TARGET_OPERATION,
    executeTargetOperation as executeTargetOperationAction,
    registerInteraction
} from '../actions/interactions';

import { getConnectedInteractions } from '../selectors/interactions';
// import { getWidgetInteractionTreeGenerated } from '../selectors/widgets';
import { extractTraceFromWidgetByNodePath } from '../utils/InteractionUtils';
// import { evaluatePath } from '../utils/InteractionUtils';
import { updateWidgetProperty } from '../actions/widgets';

/**
 * Helper: Extract widget ID from node path
 * Returns the first element ID after "widgets" collection
 * @todo Used in commented code for future implementation
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

    // const widgetInteractionTree = getWidgetInteractionTreeGenerated(state);

    // Extract widget ID from node path
    const widgetId = extractWidgetIdFromNodePath(target.nodePath);
    // get node at the target.nodePath (for future use)
    // const targetNode = evaluatePath(widgetInteractionTree, target.nodePath);

    if (!widgetId) {
        // eslint-disable-next-line no-console
        console.warn(`Interaction -> Widget ID not found for node path: ${target.nodePath}`);
        return { type: 'TARGET_OPERATION_SKIPPED', reason: 'target_not_found' };
    }

    // TODO: handle for map too
    // Verify target widget exists
    const widgets = get(state, 'widgets.containers.floating.widgets') || [];
    const targetWidget = widgets.find(w => w.id === widgetId);

    if (!targetWidget) {
        // eslint-disable-next-line no-console
        console.warn(`Interaction -> Target widget not found: ${widgetId}`);
        return { type: 'TARGET_OPERATION_SKIPPED', reason: 'widget_not_found' };
    }

    // Check if target is a trace path
    const traceInfo = extractTraceInfoFromNodePath(target.nodePath);
    const isTrace = isTracePath(target.nodePath);

    // widgetObject from state , match from the ID
    // const widgetObject = get(state, `widgets.containers.floating.widgets.${widgetId}`);
    const traceObject = extractTraceFromWidgetByNodePath(targetWidget, target.nodePath);

    // eslint-disable-next-line no-console
    console.log('Interaction -> Target execution on this node path', {
        targetNodePath: target.nodePath,
        widgetId,
        targetProperty: target.target,
        mode: target.mode || 'upsert',
        filterData: interaction.appliedData,
        isTrace,
        traceInfo
    });

    const widgetCharts = JSON.parse(JSON.stringify(targetWidget?.charts ?? []));
    const cqlFilter = {
        ...interaction.appliedData
    };
    // console.log(updatedFilter, "updatedFilter");
    const updatedFilter = {
        "id": interaction.id,
        "format": "logic",
        "version": "1.0.0",
        "logic": "OR",
        "filters": [
            cqlFilter
        ]
    };

    // append eventPayload.data to trace.layer.layerFilter.filters
    // TODO: handle for all, charts here
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
 * Epic to handle interaction events
 * Queries Redux state for matching interactions and dispatches target operations
 */
export const handleInteractionEvent = (action$, store) => action$
    .ofType(INTERACTION_EVENT)
    .mergeMap(({ payload }) => {

        const state = store.getState();
        const interactions = getConnectedInteractions(state);

        // Find matching interactions
        const matchingInteractions = interactions.filter(interaction => {
            // Check if interaction is enabled
            // if (!interaction.enabled) {
            //     return false;
            // }

            // // Match by source node path
            if (interaction.source.nodePath !== payload.sourceNodePath) {
                return false;
            }

            return true;
        });

        if (matchingInteractions.length === 0) {
            // eslint-disable-next-line no-console
            console.log('Interaction -> No plugged targets found for event', JSON.stringify({
                eventType: payload.eventType,
                sourceNodePath: payload.sourceNodePath
            }));
            return Rx.Observable.empty();
        }

        // eslint-disable-next-line no-console
        console.log('Interaction -> Plugged targets found', {
            count: matchingInteractions.length,
            targets: matchingInteractions.map(i => ({
                targetNodePath: i.target.nodePath,
                target: i.target.target,
                mode: i.target.mode
            }))
        });

        // Dispatch target operations for each matching interaction
        const actions = matchingInteractions.map(interaction => {
            return executeTargetOperationAction(interaction, payload);
        });

        return Rx.Observable.from(actions);
    });

/**
 * Epic to handle target operation execution
 * This is where the actual widget updates happen
 */
export const handleTargetOperation = (action$, store) => action$
    .ofType(EXECUTE_TARGET_OPERATION)
    .map(({ interaction, eventPayload }) => {
        const state = store.getState();
        const interactions = getConnectedInteractions(state);
        const existingInteraction = interactions.find(i => i.id === interaction.id);

        if (!existingInteraction) {
            // eslint-disable-next-line no-console
            console.warn(`Interaction -> Interaction not found: ${interaction.id}`);
            return { type: 'TARGET_OPERATION_SKIPPED', reason: 'interaction_not_found' };
        }
        // console.log(existingInteraction, "existingInteraction1");
        // from filter widget, filter per defined filters comes. Only use the exact filter
        const filter = eventPayload.data?.find(f => existingInteraction.source.nodePath.includes(f.filterId));

        // Update interaction with appliedData and generate new traceId when appliedData changes
        const updatedInteraction = {
            ...existingInteraction,
            appliedData: filter,
            appliedDataTraceId: uuid() // Generate new UUID traceId when new filter is applied
        };

        return registerInteraction(updatedInteraction);
    });

/**
 * Epic to watch connectedInteractions and filter by appliedData
 * Watches state changes directly and filters interactions that have appliedData
 * Only processes interactions that haven't been processed yet (by traceId)
 */
export const watchConnectedInteractions = (action$, store) => {
    // Track processed traceIds
    const processedTraceIds = new Set();

    return action$
        .startWith({ type: '@@INIT' }) // Start with initial state
        .scan((prevState, action) => {
            const state = store.getState();
            const interactions = getConnectedInteractions(state);

            // Filter interactions that have appliedData
            const interactionsWithAppliedData = interactions;

            return {
                prev: prevState.curr || [],
                curr: interactionsWithAppliedData,
                action
            };
        }, { prev: [], curr: [] })
        .skip(1) // Skip initial scan value
        .map(({ prev, curr }) => {
            // Find interactions that are newly changed (have new traceId that hasn't been processed)
            const newlyChanged = curr.filter(currInteraction => {
                // Must have a traceId
                if (!currInteraction.appliedDataTraceId) {
                    return false;
                }

                // Check if this traceId has already been processed
                if (processedTraceIds.has(currInteraction.appliedDataTraceId)) {
                    return false;
                }

                const prevInteraction = prev.find(p => p.id === currInteraction.id);

                // If it's a new interaction with appliedData and traceId, it's newly changed
                if (!prevInteraction) {
                    return true;
                }

                // If traceId changed, it's newly changed (new filter applied)
                return prevInteraction.appliedDataTraceId !== currInteraction.appliedDataTraceId;
            });

            return newlyChanged;
        })
        .filter(newlyChanged => newlyChanged.length > 0) // Only proceed if there are newly changed
        .distinctUntilChanged((prev, curr) => {
            // Only emit when the newly changed interactions actually change
            const prevTraceIds = prev.map(i => i.appliedDataTraceId).sort().join(',');
            const currTraceIds = curr.map(i => i.appliedDataTraceId).sort().join(',');
            return prevTraceIds === currTraceIds;
        })
        // .debounceTime(300) // Wait 1000ms after last state change
        .mergeMap((newlyChangedInteractions) => {
            const state = store.getState();

            // eslint-disable-next-line no-console
            // console.log('Hello Interactions', JSON.stringify({
            //     count: newlyChangedInteractions.length,
            //     interactions: newlyChangedInteractions.map(i => ({
            //         id: i.id,
            //         targetNodePath: i.target.nodePath,
            //         appliedData: i.appliedData,
            //         traceId: i.appliedDataTraceId
            //     }))
            // }));

            // Dispatch your action here for each newly changed interaction
            const actions = newlyChangedInteractions.map(interaction => {
                // Mark traceId as processed
                processedTraceIds.add(interaction.appliedDataTraceId);

                // Apply effect to interaction
                return applyInteractionEffect(interaction, state);
                // return Observable.empty();
            });

            return Rx.Observable.from(actions.filter(Boolean));
        });
};

export default {
    handleInteractionEvent,
    handleTargetOperation,
    watchConnectedInteractions
};
