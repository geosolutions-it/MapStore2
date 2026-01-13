/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { connect } from 'react-redux';
import FlexBox from '../../../../../layout/FlexBox';
import Text from '../../../../../layout/Text';
import Button from '../../../../../layout/Button';
import { Glyphicon } from 'react-bootstrap';
import {
    filterTreeWithTarget,
    generateNodePath
} from '../../../../../../utils/InteractionUtils';
import tooltip from '../../../../../misc/enhancers/tooltip';
import { getWidgetInteractionTreeGenerated, getEditingWidget } from '../../../../../../selectors/widgets';
import InteractionTargetsList from './InteractionTargetsList';
import { buildNodePathFromItem, buildInteractionObject, findPluggableItems } from './interactionHelpers';
import './interaction-wizard.less';

const TButton = tooltip(Button);

const InteractionEventsSelector = ({target, expanded, toggleExpanded = () => {}, widgetInteractionTree, interactions, sourceWidgetId, filterId, onEditorChange}) => {
    const handlePlugAll = () => {
        if (!sourceWidgetId || !onEditorChange || !widgetInteractionTree) {
            return;
        }

        // Filter tree to get only matching targets
        const filteredTree = filterTreeWithTarget(widgetInteractionTree, target);
        if (!filteredTree) {
            return;
        }

        // Find all pluggable items in the filtered tree
        const pluggableItems = [];
        if (filteredTree.children && Array.isArray(filteredTree.children)) {
            filteredTree.children.forEach(container => {
                if (container.children && Array.isArray(container.children)) {
                    container.children.forEach(item => {
                        findPluggableItems(item, target, pluggableItems);
                    });
                }
            });
        }

        // Build source node path
        const sourceNodePath = generateNodePath(widgetInteractionTree, filterId) || `root.widgets[${sourceWidgetId}][${filterId}]`;

        // Process each pluggable item
        let updatedInteractions = [...(interactions || [])];
        pluggableItems.forEach(({ item, targetMetadata, configuration }) => {
            const targetNodePath = buildNodePathFromItem(item, widgetInteractionTree);
            if (!targetNodePath) {
                return;
            }

            // Check if interaction already exists
            const existingInteraction = updatedInteractions.find(i =>
                i.source.nodePath === sourceNodePath &&
                i.source.eventType === (target.eventType || target.type) &&
                i.target.nodePath === targetNodePath
            );

            if (existingInteraction) {
                // Update existing interaction to be plugged
                updatedInteractions = updatedInteractions.map(i =>
                    i.id === existingInteraction.id
                        ? { ...i, plugged: true, configuration: i.configuration || configuration }
                        : i
                );
            } else {
                // Create new interaction
                const interaction = buildInteractionObject(
                    item,
                    target,
                    targetMetadata,
                    sourceWidgetId,
                    widgetInteractionTree,
                    filterId,
                    configuration,
                    true // Set plugged to true
                );
                updatedInteractions.push(interaction);
            }
        });

        // Update all interactions at once
        if (pluggableItems.length > 0) {
            onEditorChange('interactions', updatedInteractions);
        }
    };

    return (<FlexBox className="ms-interactions-container" component="ul" column gap="sm">
        <FlexBox component="li" gap="xs" column>
            <FlexBox className="ms-interactions-event"gap="sm" centerChildrenVertically >
                <Button
                    onClick={() => toggleExpanded()}
                    borderTransparent
                    style={{ padding: 0, background: 'transparent' }}>
                    {
                        expanded ? <Glyphicon glyph="bottom" /> : <Glyphicon glyph="next" />
                    }
                </Button>
                <Glyphicon glyph={target?.glyph} />
                <Text className="ms-flex-fill" fontSize="md">{target?.title}</Text>
                <TButton
                    id="plug-all-button"
                    onClick={handlePlugAll}
                    visible
                    variant="primary"
                    tooltip="Plug all pluggable items"
                    tooltipPosition="top"
                ><Glyphicon glyph="plug"/></TButton>


            </FlexBox>
            {expanded && <FlexBox className="ms-interactions-targets" component="ul" column gap="sm" >
                <InteractionTargetsList
                    target={target}
                    widgetInteractionTree={widgetInteractionTree}
                    interactions={interactions}
                    sourceWidgetId={sourceWidgetId}
                    filterId={filterId}
                    onEditorChange={onEditorChange}
                />
            </FlexBox>}
        </FlexBox>
    </FlexBox>);
};

export default connect((state) => {
    const originalTree = getWidgetInteractionTreeGenerated(state);
    const editingWidget = getEditingWidget(state);
    // Use interactions from widget object only
    const interactions = editingWidget?.interactions || [];
    return {
        widgetInteractionTree: originalTree,
        interactions
    };
}, null)(InteractionEventsSelector);
