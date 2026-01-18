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
import { getWidgetInteractionTreeGenerated, getEditingWidget } from '../../../../../../selectors/widgets';
import InteractionTargetsList from './InteractionTargetsList';
import './interaction-wizard.less';
import { detachSingleChildCollections, filterTreeWithTarget } from '../../../../../../utils/InteractionUtils';


const InteractionEventsSelector = ({target, expanded, toggleExpanded = () => {}, interactionTree, interactions, sourceWidgetId, currentSourceId, onEditorChange}) => {

    const filteredInteractionTree = useMemo(() => {
        const filteredTree = filterTreeWithTarget(interactionTree, target);
        return detachSingleChildCollections(filteredTree, ['widgets', 'traces', "layers"]);
    }, [interactionTree]);

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


            </FlexBox>
            {expanded && <FlexBox className="ms-interactions-targets" component="ul" column gap="sm" >
                <InteractionTargetsList
                    target={target}
                    interactionTree={interactionTree}
                    interactions={interactions}
                    sourceWidgetId={sourceWidgetId}
                    currentSourceId={currentSourceId}
                    onEditorChange={onEditorChange}
                    filteredInteractionTree={filteredInteractionTree}
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
        interactionTree: originalTree,
        interactions
    };
}, null)(InteractionEventsSelector);
