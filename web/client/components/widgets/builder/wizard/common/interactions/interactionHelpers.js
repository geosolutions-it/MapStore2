/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import uuid from 'uuid/v1';
import { DEFAULT_CONFIGURATION } from './interactionConstants';
import {
    isLayerDimensionTarget,
    isLayerTimeDimensionTarget,
    isMapTimeTarget,
    TARGET_TYPES
} from '../../../../../../utils/InteractionUtils';

const DEFAULT_NODE_DISABLED = {
    disabled: false,
    reasonMsgId: null
};

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

export function findInteraction(interactions = [], sourceNodePath, targetNodePath, targetType) {
    return interactions.find(interaction =>
        matchesInteraction(interaction, sourceNodePath, targetNodePath, targetType)
    );
}

export const getInteractionTargetNodeDisabled = ({
    item,
    target,
    targetNodePath,
    sourceNodePath,
    plugged,
    alreadyExistingInteractions = [],
    sourceSelectionMode,
    timelineEnabled = false
}) => {
    if (item?.type !== 'element') {
        return DEFAULT_NODE_DISABLED;
    }

    const styleAlreadyConnected = alreadyExistingInteractions
        .filter(i => i?.source?.nodePath !== sourceNodePath)
        .some(i =>
            i.targetType === TARGET_TYPES.APPLY_STYLE
            && target.targetType === TARGET_TYPES.APPLY_STYLE
            && i?.target?.nodePath === targetNodePath
            && i.plugged
        );

    if (styleAlreadyConnected) {
        return {
            disabled: true,
            reasonMsgId: 'widgets.filterWidget.targetAlreadyConnectedToAnotherFilterTooltip'
        };
    }

    if (target.targetType === TARGET_TYPES.APPLY_DIMENSION) {
        const layerTimeDisabledByTimeline = timelineEnabled && isLayerTimeDimensionTarget(targetNodePath);

        if (layerTimeDisabledByTimeline) {
            return {
                disabled: true,
                reasonMsgId: 'widgets.filterWidget.layerTimeControlledByTimelineTooltip'
            };
        }

        if (!timelineEnabled && isMapTimeTarget(targetNodePath)) {
            return {
                disabled: true,
                reasonMsgId: 'widgets.filterWidget.timelineTargetUnavailableTooltip'
            };
        }

        const layerDimensionAlreadyConnected = isLayerDimensionTarget(targetNodePath)
            && alreadyExistingInteractions
                .filter(i => i?.source?.nodePath !== sourceNodePath)
                .some(i =>
                    i.targetType === TARGET_TYPES.APPLY_DIMENSION
                    && i?.target?.nodePath === targetNodePath
                    && i.plugged
                );

        if (layerDimensionAlreadyConnected) {
            return {
                disabled: true,
                reasonMsgId: 'widgets.filterWidget.targetAlreadyConnectedToAnotherFilterTooltip'
            };
        }

        if (sourceSelectionMode === 'multiple' && !plugged) {
            return {
                disabled: true,
                reasonMsgId: 'widgets.filterWidget.applyDimensionMultipleSelectionDisabledTooltip'
            };
        }
    }

    const sourceConnections = alreadyExistingInteractions.filter(i =>
        i?.source?.nodePath === sourceNodePath
    );
    const hasTwoWayMapTimeConnection = sourceConnections.some(i =>
        isMapTimeTarget(i?.target?.nodePath)
        && i?.configuration?.twoWaySynchronization === true
    );
    const currentItemIsMapTime = isMapTimeTarget(targetNodePath);
    const mapTimeLockConflict = hasTwoWayMapTimeConnection && !currentItemIsMapTime;

    if (mapTimeLockConflict) {
        return {
            disabled: true,
            reasonMsgId: 'widgets.filterWidget.targetAlreadyConnectedToTimeTooltip'
        };
    }

    return DEFAULT_NODE_DISABLED;
};
