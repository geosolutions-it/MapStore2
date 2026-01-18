/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import FlexBox from '../../../../../layout/FlexBox';
import Text from '../../../../../layout/Text';
import Button from '../../../../../layout/Button';
import { Glyphicon } from 'react-bootstrap';
import {
    generateNodePath,
    getItemPluggableStatus
} from '../../../../../../utils/InteractionUtils';
import InteractionButtons from './InteractionButtons';
import InteractionConfiguration from './InteractionConfiguration';
import { buildInteractionObject, matchesInteraction } from './interactionHelpers';
import { DEFAULT_CONFIGURATION } from './interactionConstants';

const InteractionsRow = ({item, target, interactions, sourceWidgetId, interactionTree, currentSourceId, onEditorChange}) => {
    // from interactions we can derive if the target is plugged or not, and its configuration

    const hasChildren = item?.children?.length > 0;
    const [expanded, setExpanded] = React.useState(true);

    // Calculate targetMetadata from item's interactionMetadata
    const targetMetaData = React.useMemo(() =>
        item?.interactionMetadata?.targets?.find(t => t.targetType === target.targetType),
    [item, target.targetType]);

    // Build source and target node paths using generateNodePath with interaction tree
    const sourceNodePath = React.useMemo(() =>
        generateNodePath(interactionTree, currentSourceId),
    [interactionTree, currentSourceId]);
    const targetNodePath = item.nodePath;

    // Check if interaction already exists
    const existingInteraction = React.useMemo(() =>
        interactions.find(i =>
            matchesInteraction(i, sourceNodePath, targetNodePath)
        ),
    [interactions, sourceNodePath, targetNodePath]);

    // Get configuration directly from existing interaction or use default
    const configuration = existingInteraction?.configuration || DEFAULT_CONFIGURATION;
    const plugged = existingInteraction?.plugged || false;


    const { directlyPluggable, configuredToForcePlug } = getItemPluggableStatus(item, target, configuration);
    const isPluggable = directlyPluggable || configuredToForcePlug;

    // Helper function to update or create interaction
    const setInteraction = React.useCallback((updates) => {
        if (!sourceWidgetId || !onEditorChange) {
            return;
        }


        if (existingInteraction) {
            // Update existing interaction
            const updatedInteraction = {
                ...existingInteraction,
                ...updates
            };
            const updatedInteractions = (interactions || []).map(i =>
                i.id === existingInteraction.id ? updatedInteraction : i
            );
            onEditorChange('interactions', updatedInteractions);
        } else {
            // Create new interaction
            const interaction = buildInteractionObject({
                sourceNodePath,
                targetNodePath,
                configuration: updates.configuration || DEFAULT_CONFIGURATION,
                plugged: updates.plugged || false,
                targetMetaData: targetMetaData
            });
            onEditorChange('interactions', [...(interactions || []), interaction]);
        }
    }, [sourceWidgetId, onEditorChange, item, target, interactionTree, currentSourceId, interactions, sourceNodePath, targetNodePath, existingInteraction, targetMetaData]);


    // Handle plug/unplug
    const handlePlugToggle = (shouldPlug) => {
        setInteraction({ plugged: shouldPlug, configuration: configuration });
    };

    // Handle configuration change
    const handleConfigurationChange = (newConfiguration) => {
        setInteraction({ configuration: newConfiguration, plugged: plugged });
    };

    const [showConfiguration, setShowConfiguration] = React.useState(false);

    return (
        <FlexBox key={item.id} component="li" gap="xs" column>
            <FlexBox gap="xs" className="ms-connection-row"  centerChildrenVertically>
                {hasChildren && (
                    <Button
                        onClick={() => setExpanded(!expanded)}
                        borderTransparent
                        style={{ padding: 0, background: 'transparent' }}>
                        <Glyphicon glyph={expanded ? "bottom" : "next"} />
                    </Button>
                )}
                <Glyphicon glyph={item.icon}/>
                <Text className="ms-flex-fill">{item.title}</Text>
                {item.interactionMetadata && item.type === "element" && (
                    <InteractionButtons
                        item={item}
                        plugged={plugged}
                        isPluggable={isPluggable || configuration.forcePlug}
                        isConfigurable={!directlyPluggable}
                        configuration={configuration}
                        setPlugged={handlePlugToggle}
                        showConfiguration={showConfiguration}
                        setShowConfiguration={setShowConfiguration}
                    />
                )}
            </FlexBox>
            <InteractionConfiguration item={item} show={showConfiguration} configuration={configuration} setConfiguration={handleConfigurationChange} setPlugged={handlePlugToggle} />
            {hasChildren && expanded && (
                <FlexBox component="ul" column gap="xs">
                    {item.children?.map((child, idx) => (
                        <InteractionsRow
                            key={idx}
                            item={child}
                            target={target}
                            interactions={interactions}
                            sourceWidgetId={sourceWidgetId}
                            interactionTree={interactionTree}
                            currentSourceId={currentSourceId}
                            onEditorChange={onEditorChange}
                        />
                    ))}
                </FlexBox>
            )}
        </FlexBox>
    );
};

export default InteractionsRow;

