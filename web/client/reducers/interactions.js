/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    REGISTER_INTERACTION,
    UNREGISTER_INTERACTION
} from '../actions/interactions';
import { MAP_CONFIG_LOADED } from '../actions/config';
import { DASHBOARD_LOADED } from '../actions/dashboard';

const initialState = {
    connectedInteractions: []
};

/**
 * Interactions reducer
 * Manages the state of widget interactions
 *
 * @example
 * {
 *   connectedInteractions: [
 *     {
 *       id: "interaction-1234",
 *       source: {
 *         nodePath: "widgets['widget-id']",
 *         eventType: "filter_change"
 *       },
 *       target: {
 *         nodePath: "widgets['target-id']",
 *         target: "dependencies.filters",
 *         mode: "upsert"
 *       },
 *       transform: [],
 *       enabled: true
 *     }
 *   ]
 * }
 */
function interactionsReducer(state = initialState, action) {
    switch (action.type) {
    case REGISTER_INTERACTION: {
        const { interaction } = action;

        // Check if interaction already exists (by id)
        const exists = state.connectedInteractions.some(i => i.id === interaction.id);
        if (exists) {
            // Update existing interaction
            return {
                ...state,
                connectedInteractions: state.connectedInteractions.map(i =>
                    i.id === interaction.id ? interaction : i
                )
            };
        }

        // Add new interaction
        return {
            ...state,
            connectedInteractions: [...state.connectedInteractions, interaction]
        };
    }

    case UNREGISTER_INTERACTION: {
        const { interactionId } = action;
        return {
            ...state,
            connectedInteractions: state.connectedInteractions.filter(i => i.id !== interactionId)
        };
    }

    case MAP_CONFIG_LOADED: {
        const interactions = action.config?.widgetsConfig?.interactions || [];
        return {
            ...state,
            connectedInteractions: interactions
        };
    }

    case DASHBOARD_LOADED: {
        const interactions = action.data?.interactions || [];
        return {
            ...state,
            connectedInteractions: interactions
        };
    }

    default:
        return state;
    }
}

export default interactionsReducer;

