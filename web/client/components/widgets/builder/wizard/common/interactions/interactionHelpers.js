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
    generateNodePath,
    getItemPluggableStatus
} from '../../../../../../utils/InteractionUtils';
import { DEFAULT_CONFIGURATION } from './interactionConstants';

/**
 * Helper: Build node path from item using generateNodePath
 * Supports complex paths like root.widgets[chart-1].traces[trace-1]
 * @param {object} item - The item to build path for
 * @param {object} tree - The widget interaction tree
 * @returns {string|null} The node path or null
 */
export function buildNodePathFromItem(item, tree) {
    if (!item || !item.id || !tree) {
        return null;
    }
    // Use generateNodePath to get the proper path format
    const path = generateNodePath(tree, item.id);
    return path;
}

/**
 * Helper: Build interaction object from item, event, and target metadata
 * @param {object} item - The target item
 * @param {object} event - The event object
 * @param {object} targetMetadata - The target metadata
 * @param {string} sourceWidgetId - The source widget ID
 * @param {object} tree - The widget interaction tree
 * @param {string} filterId - The filter ID
 * @param {object} configuration - Optional configuration object
 * @param {boolean} plugged - Whether the interaction is plugged (default: false)
 * @param {string} existingId - Optional existing interaction ID to preserve
 * @returns {object} The interaction object
 */
export function buildInteractionObject(item, event, targetMetadata, sourceWidgetId, tree, filterId, configuration = null, plugged = false, existingId = null) {
    const sourceNodePath = generateNodePath(tree, filterId) || `root.widgets[${sourceWidgetId}][${filterId}]`;
    const targetNodePath = buildNodePathFromItem(item, tree);
    const targetProperty = targetMetadata.attributeName || targetMetadata.targetProperty;

    return {
        id: existingId || uuid(),
        source: {
            nodePath: sourceNodePath,
            eventType: event.eventType || event.type
        },
        target: {
            nodePath: targetNodePath,
            target: targetProperty,
            mode: targetMetadata.mode || 'upsert'
        },
        configuration: configuration || DEFAULT_CONFIGURATION,
        plugged: plugged
    };
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

