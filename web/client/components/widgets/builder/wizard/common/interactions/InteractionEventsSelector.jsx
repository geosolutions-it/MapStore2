/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {useMemo} from 'react';
import { connect } from 'react-redux';
import FlexBox from '../../../../../layout/FlexBox';
import Text from '../../../../../layout/Text';
import Button from '../../../../../layout/Button';
import { Glyphicon } from 'react-bootstrap';
import { getWidgetInteractionTreeGenerated, getEditingWidget, getAllInteractionsWhileEditingSelector } from '../../../../../../selectors/widgets';
import InteractionTargetsList from './InteractionTargetsList';
import './interaction-wizard.less';
import { detachSingleChildCollections, filterTreeWithTarget, filterDimensionTreeByValueAttributeType } from '../../../../../../utils/InteractionUtils';
import Message from '../../../../../I18N/Message';

export const InteractionEventsSelector = ({target, expanded, toggleExpanded = () => {}, interactionTree, interactions, sourceWidgetId, currentSourceId, onEditorChange, alreadyExistingInteractions, valueAttributeType, targetTitleMsgIds = {}}) => {

    const filteredInteractionTree = useMemo(() => {
        const filteredTree = filterTreeWithTarget(interactionTree, target) || { children: [] };
        const dimensionFilteredTree = target?.targetType === 'applyDimension'
            ? filterDimensionTreeByValueAttributeType(filteredTree, valueAttributeType)
            : filteredTree;
        return detachSingleChildCollections(dimensionFilteredTree, ['widgets', 'traces', "map", "layers"]) || { children: [] };
    }, [interactionTree, target, valueAttributeType]);
    const hasConnectableNodes = (filteredInteractionTree?.children || []).length > 0;
    const targetTitleMsgId = targetTitleMsgIds[target.targetType];

    return (<FlexBox className="ms-interactions-container" component="ul" column gap="sm">
        <FlexBox component="li" gap="xs" column>
            <FlexBox className="ms-interactions-event" gap="sm" centerChildrenVertically >
                <Button
                    onClick={() => toggleExpanded()}
                    borderTransparent
                    style={{ padding: 0, background: 'transparent' }}>
                    {
                        expanded ? <Glyphicon glyph="bottom" /> : <Glyphicon glyph="next" />
                    }
                </Button>
                <Glyphicon glyph={target?.glyph} />
                <Text className="ms-flex-fill">
                    {targetTitleMsgId ? <Message msgId={targetTitleMsgId} /> : target.title}
                </Text>


            </FlexBox>
            {expanded && <FlexBox className="ms-interactions-targets" component="ul" column gap="sm" >
                {hasConnectableNodes ? (
                    <InteractionTargetsList
                        target={target}
                        interactionTree={interactionTree}
                        interactions={interactions}
                        sourceWidgetId={sourceWidgetId}
                        currentSourceId={currentSourceId}
                        onEditorChange={onEditorChange}
                        filteredInteractionTree={filteredInteractionTree}
                        alreadyExistingInteractions={alreadyExistingInteractions}
                    />
                ) : (
                    <FlexBox component="li" className="ms-interactions-empty-state">
                        <Text><Message msgId="widgets.filterWidget.noConnectableNodesAvailable" /></Text>
                    </FlexBox>
                )}
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
        interactionTree: originalTree,
        // for editing widget
        interactions,
        // for all widget
        alreadyExistingInteractions: getAllInteractionsWhileEditingSelector(state)
    };
}, null)(InteractionEventsSelector);
