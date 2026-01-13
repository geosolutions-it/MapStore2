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
    getDirectlyPluggableTargets,
    getConfigurableTargets,
    getConfiguredTargets,
    generateNodePath,
    getItemPluggableStatus
} from '../../../../../../utils/InteractionUtils';
import InteractionButtons from './InteractionButtons';
import InteractionConfiguration from './InteractionConfiguration';
import { buildNodePathFromItem, buildInteractionObject } from './interactionHelpers';
import { DEFAULT_CONFIGURATION } from './interactionConstants';

const InteractionsRow = ({item, event, interactions, sourceWidgetId, widgetInteractionTree, filterId, onEditorChange}) => {
    // from interactions we can derive if the target is plugged or not, and its configuration

    const hasChildren = item?.children?.length > 0;
    const [expanded, setExpanded] = React.useState(true);
    const directlyPluggableTargets = getDirectlyPluggableTargets(item, event);
    const configurableTargets = getConfigurableTargets(item, event);

    // Build source and target node paths using generateNodePath with original tree
    const sourceNodePath = generateNodePath(widgetInteractionTree, filterId) || `root.widgets[${sourceWidgetId}][${filterId}]`;
    const targetNodePath = buildNodePathFromItem(item, widgetInteractionTree);

    // Check if interaction already exists
    const existingInteraction = interactions.find(i =>
        i.source.nodePath === sourceNodePath &&
        i.source.eventType === (event.eventType || event.type) &&
        i.target.nodePath === targetNodePath
    );

    // Get configuration directly from existing interaction or use default
    const configuration = existingInteraction?.configuration || DEFAULT_CONFIGURATION;
    const plugged = existingInteraction?.plugged || false;

    const configuredTargets = getConfiguredTargets(item, event, configuration);

    // Get the target metadata (use first directly pluggable or first configured)
    const targetMetadata = directlyPluggableTargets[0] || configuredTargets[0];

    // tree should be already filtered but just in case
    // if (directlyPluggableTargets.length === 0 && configurableTargets.length === 0) {
    //     return null;
    // }

    const { directlyPluggable, configuredToForcePlug } = getItemPluggableStatus(item, event, configuration);
    const isPluggable = directlyPluggable || configuredToForcePlug;
    const isConfigurable = configurableTargets.length > 0;

    // Helper function to update or create interaction
    const setInteraction = React.useCallback((updates) => {
        if (!sourceWidgetId || !targetMetadata || !onEditorChange) {
            return;
        }

        // Find existing interaction using current interactions array
        const currentInteraction = (interactions || []).find(i =>
            i.source.nodePath === sourceNodePath &&
            i.source.eventType === (event.eventType || event.type) &&
            i.target.nodePath === targetNodePath
        );

        if (currentInteraction) {
            // Update existing interaction
            const updatedInteraction = {
                ...currentInteraction,
                ...updates
            };
            const updatedInteractions = (interactions || []).map(i =>
                i.id === currentInteraction.id ? updatedInteraction : i
            );
            onEditorChange('interactions', updatedInteractions);
        } else {
            // Create new interaction
            const interaction = buildInteractionObject(
                item,
                event,
                targetMetadata,
                sourceWidgetId,
                widgetInteractionTree,
                filterId,
                updates.configuration || DEFAULT_CONFIGURATION,
                updates.plugged || false
            );
            onEditorChange('interactions', [...(interactions || []), interaction]);
        }
    }, [sourceWidgetId, targetMetadata, onEditorChange, item, event, widgetInteractionTree, filterId, interactions, sourceNodePath, targetNodePath]);


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
                        isConfigurable={isConfigurable}
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
                            event={event}
                            interactions={interactions}
                            sourceWidgetId={sourceWidgetId}
                            widgetInteractionTree={widgetInteractionTree}
                            filterId={filterId}
                            onEditorChange={onEditorChange}
                        />
                    ))}
                </FlexBox>
            )}
        </FlexBox>
    );
};

export default InteractionsRow;

