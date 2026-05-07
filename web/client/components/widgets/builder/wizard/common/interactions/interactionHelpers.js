/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import uuid from 'uuid/v1';
import { DEFAULT_CONFIGURATION } from './interactionConstants';


/**
 * Helper: Build interaction object from item, event, and target metadata
 * @param {object} params - The parameters object
 * @param {string} params.sourceNodePath - The source node path
 * @param {string} params.targetNodePath - The target node path
 * @param {object} params.configuration - Optional configuration object
 * @param {boolean} params.plugged - Whether the interaction is plugged (default: false)
 * @param {string} params.existingId - Optional existing interaction ID to preserve
 * @returns {object} The interaction object
 */
export function buildInteractionObject({ sourceNodePath, targetNodePath, configuration = null, plugged = false, existingId = null, targetMetaData, targetType}) {
    return {
        id: existingId || uuid(),
        source: {
            nodePath: sourceNodePath
        },
        target: {
            nodePath: targetNodePath,
            metaData: targetMetaData
        },
        configuration: configuration || DEFAULT_CONFIGURATION,
        plugged: plugged,
        targetType: targetType
    };
}

/**
 * Helper: Check if an interaction matches the given source, target, and target node path
 * @param {object} interaction - The interaction to check
 * @param {string} sourceNodePath - The source node path
 * @param {object} target - The target object
 * @param {string} targetNodePath - The target node path
 * @returns {boolean} True if the interaction matches, false otherwise
 */
export function matchesInteraction(interaction, sourceNodePath, targetNodePath, targetType) {
    return interaction.source.nodePath === sourceNodePath &&
        interaction.target.nodePath === targetNodePath && targetType === interaction.targetType;
}
