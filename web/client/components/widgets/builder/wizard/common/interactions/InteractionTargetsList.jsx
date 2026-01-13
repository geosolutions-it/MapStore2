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
import { filterTreeWithTarget } from '../../../../../../utils/InteractionUtils';
import InteractionsRow from './InteractionsRow';

const InteractionTargetsList = ({target, widgetInteractionTree, interactions, sourceWidgetId, filterId, onEditorChange}) => {
    const [widgetsExpanded, setWidgetsExpanded] = React.useState(true);
    const [mapsExpanded, setMapsExpanded] = React.useState(true);
    const filteredTree = React.useMemo(() => filterTreeWithTarget(widgetInteractionTree, target), [widgetInteractionTree, target]);

    const widgetsContainer = {
        id: 'container1',
        glyph: 'dashboard',
        title: 'Widgets'
    };
    const mapsContainer = {
        id: 'container2',
        glyph: 'map',
        title: 'Map'
    };


    const renderContainer = (container, children, expanded, setExpanded) => (
        <FlexBox className="ms-interaction-target" component="li" gap="xs" key={container.id} column onPointerOver={() => { /* todo highlight */ }} >
            <FlexBox gap="xs" className="ms-connection-row">
                <Button
                    onClick={() => setExpanded(!expanded)}
                    borderTransparent
                    style={{ padding: 0, background: 'transparent' }}>
                    <Glyphicon glyph={expanded ? "bottom" : "next"} />
                </Button>
                <Glyphicon glyph={container.glyph} />
                <Text className="ms-flex-fill">{container.title}</Text>
            </FlexBox>
            {expanded && (
                <FlexBox style={{paddingLeft: 16}} component="ul" column gap="xs">
                    {children?.map((item) => (
                        <InteractionsRow
                            key={item.id}
                            item={item}
                            event={target}
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

    return (
        <FlexBox component="ul" column gap="xs">
            {renderContainer(widgetsContainer, filteredTree.children[0].children, widgetsExpanded, setWidgetsExpanded)}
            {filteredTree.children[1]?.children && renderContainer(mapsContainer, filteredTree.children[1]?.children, mapsExpanded, setMapsExpanded)}
        </FlexBox>
    );
};

export default InteractionTargetsList;

