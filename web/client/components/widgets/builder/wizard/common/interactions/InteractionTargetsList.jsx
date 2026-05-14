/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import FlexBox from '../../../../../layout/FlexBox';
// import { filterTreeWithTarget } from '../../../../../../utils/InteractionUtils';
import Message from '../../../../../I18N/Message';
import { findNodeById, getItemPluggableStatus, isMapTimeTarget } from '../../../../../../utils/InteractionUtils';
import InteractionsRow from './InteractionsRow';
import { buildInteractionObject, findInteraction, getInteractionTargetNodeDisabled } from './interactionHelpers';
import { DEFAULT_CONFIGURATION } from './interactionConstants';

const InteractionTargetsList = ({target, interactionTree, interactions, sourceWidgetId, currentSourceId, onEditorChange, filteredInteractionTree, alreadyExistingInteractions, sourceSelectionMode}) => {
    const sourceNodePath = React.useMemo(() => {
        const sourceNode = findNodeById(interactionTree, currentSourceId);
        return sourceNode?.nodePath || null;
    }, [interactionTree, currentSourceId]);

    const getNodeDisabled = React.useCallback(({ item, target: rowTarget, targetNodePath, sourceNodePath: rowSourceNodePath, plugged }) => {
        const nodeDisabled = getInteractionTargetNodeDisabled({
            item,
            target: rowTarget,
            targetNodePath,
            sourceNodePath: rowSourceNodePath,
            plugged,
            alreadyExistingInteractions,
            sourceSelectionMode
        });
        return {
            disabled: nodeDisabled.disabled,
            reason: nodeDisabled.reasonMsgId ? <Message msgId={nodeDisabled.reasonMsgId} /> : null
        };
    }, [alreadyExistingInteractions, sourceSelectionMode]);

    const setInteraction = React.useCallback(({
        targetNodePath,
        existingInteraction,
        targetMetaData,
        updates
    }) => {
        if (!sourceWidgetId || !onEditorChange) {
            return;
        }

        if (existingInteraction) {
            const updatedInteraction = {
                ...existingInteraction,
                ...updates
            };
            const updatedInteractions = (interactions || []).map(interaction =>
                interaction.id === existingInteraction.id ? updatedInteraction : interaction
            );
            onEditorChange('interactions', updatedInteractions);
            return;
        }

        const interaction = buildInteractionObject({
            sourceNodePath,
            targetNodePath,
            configuration: updates.configuration || DEFAULT_CONFIGURATION,
            plugged: updates.plugged || false,
            targetMetaData,
            targetType: target.targetType
        });
        onEditorChange('interactions', [...(interactions || []), interaction]);
    }, [sourceWidgetId, onEditorChange, interactions, sourceNodePath, target]);

    const renderRow = (item, idx) => {
        const targetNodePath = item.nodePath;
        const targetMetaData = item?.interactionMetadata?.targets?.find(t => t.targetType === target.targetType);
        const existingInteraction = findInteraction(interactions, sourceNodePath, targetNodePath, target.targetType);
        const isMapTime = isMapTimeTarget(targetNodePath);
        const configuration = existingInteraction?.configuration || DEFAULT_CONFIGURATION;
        const plugged = existingInteraction?.plugged || false;
        const { directlyPluggable, configuredToForcePlug } = getItemPluggableStatus(item, target, configuration);
        const nodeDisabled = getNodeDisabled({
            item,
            target,
            targetNodePath,
            sourceNodePath,
            plugged
        });
        const hasOtherThanMapTimeConnected = isMapTime && (alreadyExistingInteractions || []).some(interaction =>
            interaction?.plugged === true
            && interaction?.source?.nodePath === sourceNodePath
            && !isMapTimeTarget(interaction?.target?.nodePath)
        );

        const updateInteraction = (updates) => setInteraction({
            targetNodePath,
            existingInteraction,
            targetMetaData,
            updates
        });

        const handlePlugChange = (shouldPlug) => {
            updateInteraction({ plugged: shouldPlug, configuration });
        };

        const handleConfigurationChange = (newConfiguration) => {
            updateInteraction({
                configuration: newConfiguration,
                plugged: !isMapTime && !newConfiguration.forcePlug ? false : plugged
            });
        };

        return (
            <InteractionsRow
                key={item.id || idx}
                item={item}
                target={target}
                plugged={plugged}
                isPluggable={directlyPluggable || configuredToForcePlug || configuration.forcePlug}
                isConfigurable={!directlyPluggable || isMapTime}
                configuration={configuration}
                configurationContext={{
                    hasOtherThanMapTimeConnected: hasOtherThanMapTimeConnected
                }}
                nodeDisabled={nodeDisabled}
                onPlugChange={handlePlugChange}
                onConfigurationChange={handleConfigurationChange}
            >
                {item.children?.map(renderRow)}
            </InteractionsRow>
        );
    };

    const renderContainer = (children) => (
        <FlexBox className="ms-interaction-target" component="li" gap="xs" column onPointerOver={() => { /* todo highlight */ }} >
            {children?.map(renderRow)}
        </FlexBox>
    );

    return (
        <FlexBox component="ul" column gap="xs">
            {renderContainer(filteredInteractionTree.children)}
        </FlexBox>
    );
};

export default InteractionTargetsList;
