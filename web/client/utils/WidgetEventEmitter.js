/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { interactionEvent } from '../actions/interactions';
import { EVENTS, DATATYPES } from './InteractionUtils';
import uuid from 'uuid/v1';

/**
 * Get the data type for a given event type.
 * @param {string} eventType - Event type
 * @returns {string} Data type
 */
const getDataTypeForEvent = (eventType) => {
    const eventDataTypeMap = {
        [EVENTS.FILTER_CHANGE]: DATATYPES.LAYER_FILTER,
        [EVENTS.VIEWPORT_CHANGE]: DATATYPES.BBOX_COORDINATES,
        [EVENTS.CENTER_CHANGE]: DATATYPES.POINT,
        [EVENTS.ZOOM_CHANGE]: DATATYPES.NUMBER,
        [EVENTS.FEATURE_CLICK]: DATATYPES.FEATURE,
        [EVENTS.ZOOM_CLICK]: DATATYPES.FEATURE,
        [EVENTS.SELECTION_CHANGE]: DATATYPES.LAYER_FILTER,
        [EVENTS.TRACE_CLICK]: DATATYPES.FEATURE,
        [EVENTS.VISIBILITY_TOGGLE]: DATATYPES.STRING
    };

    return eventDataTypeMap[eventType] || DATATYPES.STRING;
};

/**
 * Emit a widget event by dispatching INTERACTION_EVENT action
 * @param {function} dispatch - Redux dispatch function
 * @param {string} widgetId - ID of the widget emitting the event
 * @param {string} eventType - Type of event (from EVENTS constants)
 * @param {*} data - Event payload data
 * @param {object} [constraints] - Optional constraints (e.g., layer info)
 * @param {string} [nodePath] - Optional node path (defaults to widgets['widgetId'])
 */
export const emitWidgetEvent = (dispatch, widgetId, eventType, data, constraints = {}, nodePath = null) => {
    if (!dispatch) {
        // eslint-disable-next-line no-console
        console.warn('Interaction -> dispatch function not provided, cannot emit event');
        return;
    }

    // Determine dataType from eventType
    const dataType = getDataTypeForEvent(eventType);

    // Derive node path if not provided
    const sourceNodePath = nodePath || `widgets["${widgetId}"]`;

    // Generate trace ID
    const traceId = uuid();

    // Build event payload
    const payload = {
        traceId,
        eventType,
        dataType,
        data,
        sourceNodePath,
        extra: constraints || {}
    };

    // eslint-disable-next-line no-console
    console.log('Interaction -> Event Triggered (action dispatched)', {
        eventType: payload.eventType,
        sourceNodePath: payload.sourceNodePath,
        dataType: payload.dataType
    });

    // Dispatch action directly
    dispatch(interactionEvent(payload));
};

/**
 * Emit a filter change event.
 * @param {function} dispatch - Redux dispatch function
 * @param {string} widgetId - Widget ID
 * @param {object} filterObj - Filter object in mapstore format
 * @param {object} [constraints] - Optional constraints (layer info)
 * @param {string} [nodePath] - Optional node path
 */
export const emitFilterChange = (dispatch, widgetId, filterObj, constraints = {}, nodePath = null) => {
    // eslint-disable-next-line no-console
    console.log('Interaction -> emitFilterChange called', {
        widgetId,
        filterObj,
        constraints,
        nodePath
    });
    emitWidgetEvent(
        dispatch,
        widgetId,
        EVENTS.FILTER_CHANGE,
        filterObj,
        constraints,
        nodePath
    );
};
