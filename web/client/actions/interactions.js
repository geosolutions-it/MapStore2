/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import uuid from 'uuid/v1';

export const REGISTER_INTERACTION = 'INTERACTIONS:REGISTER_INTERACTION';
export const UNREGISTER_INTERACTION = 'INTERACTIONS:UNREGISTER_INTERACTION';
export const INTERACTION_EVENT = 'INTERACTIONS:INTERACTION_EVENT';
export const EXECUTE_TARGET_OPERATION = 'INTERACTIONS:EXECUTE_TARGET_OPERATION';

/**
 * Register an interaction in Redux state
 * @param {object} interaction - Interaction object with id, source, target, transform, enabled
 */
export const registerInteraction = (interaction) => ({
    type: REGISTER_INTERACTION,
    interaction: {
        id: interaction.id || uuid(),
        ...interaction
    }
});

/**
 * Unregister an interaction from Redux state
 * @param {string} interactionId - ID of the interaction to remove
 */
export const unregisterInteraction = (interactionId) => ({
    type: UNREGISTER_INTERACTION,
    interactionId
});

/**
 * Interaction event action (dispatched by widgets when events occur)
 * @param {object} payload - Event payload with traceId, eventType, dataType, data, sourceNodePath, extra
 */
export const interactionEvent = (payload) => ({
    type: INTERACTION_EVENT,
    payload: {
        traceId: payload.traceId || uuid(),
        eventType: payload.eventType,
        dataType: payload.dataType,
        data: payload.data,
        sourceNodePath: payload.sourceNodePath,
        extra: payload.extra || {}
    }
});

/**
 * Execute a target operation (dispatched by epic when event matches interaction)
 * @param {object} interaction - Interaction object from state
 * @param {object} eventPayload - Event payload from INTERACTION_EVENT action
 */
export const executeTargetOperation = (interaction, eventPayload) => ({
    type: EXECUTE_TARGET_OPERATION,
    interaction,
    eventPayload
});
