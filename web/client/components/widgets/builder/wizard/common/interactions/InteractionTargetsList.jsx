/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import FlexBox from '../../../../../layout/FlexBox';
import { filterTreeWithTarget } from '../../../../../../utils/InteractionUtils';
import InteractionsRow from './InteractionsRow';

const InteractionTargetsList = ({target, widgetInteractionTree, interactions, sourceWidgetId, filterId, onEditorChange}) => {
    const filteredTree = React.useMemo(() => filterTreeWithTarget(widgetInteractionTree, target), [widgetInteractionTree, target]);


    const renderContainer = (children) => (
        <FlexBox className="ms-interaction-target" component="li" gap="xs" column onPointerOver={() => { /* todo highlight */ }} >
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
    );

    return (
        <FlexBox component="ul" column gap="xs">
            {renderContainer(filteredTree.children)}
        </FlexBox>
    );
};

export default InteractionTargetsList;

