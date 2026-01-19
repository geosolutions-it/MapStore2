/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import uuid from 'uuid/v1';
import {
    getDirectlyPluggableTargets,
    getConfiguredTargets,
    getItemPluggableStatus
} from '../../../../../../utils/InteractionUtils';
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
export function buildInteractionObject({ sourceNodePath, targetNodePath, configuration = null, plugged = false, existingId = null, targetMetaData }) {
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
        plugged: plugged
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
export function matchesInteraction(interaction, sourceNodePath, targetNodePath) {
    return interaction.source.nodePath === sourceNodePath &&
        interaction.target.nodePath === targetNodePath;
}

/**
 * Helper: Recursively find all pluggable items in the tree
 * @param {object} node - The tree node to traverse
 * @param {object} event - The event object
 * @param {array} items - Accumulator array for pluggable items
 * @returns {array} Array of pluggable items with their metadata
 */
export function findPluggableItems(node, event, items = []) {
    if (!node) return items;

    // Check if this node is an element with interaction metadata
    if (node.type === 'element' && node.interactionMetadata) {
        const { directlyPluggable, configuredToForcePlug } = getItemPluggableStatus(node, event, DEFAULT_CONFIGURATION);
        const isPluggable = directlyPluggable || configuredToForcePlug;

        if (isPluggable) {
            const directlyPluggableTargets = getDirectlyPluggableTargets(node, event);
            const configuredTargets = getConfiguredTargets(node, event, DEFAULT_CONFIGURATION);
            const targetMetadata = directlyPluggableTargets[0] || configuredTargets[0];
            items.push({
                item: node,
                targetMetadata,
                configuration: DEFAULT_CONFIGURATION
            });
        }
    }

    // Recursively process children
    if (node.children && Array.isArray(node.children)) {
        node.children.forEach(child => {
            findPluggableItems(child, event, items);
        });
    }

    return items;
}

