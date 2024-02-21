
/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { DragSource as dragSource } from 'react-dnd';

const ITEM_KEY = 'node';
const drag = dragSource(ITEM_KEY,
    {
        beginDrag: ({ node, parentId, index, sort, containerNode, nodeTypes }) => {
            if (sort.beginDrag) {
                sort.beginDrag(node.id);
            }
            return {
                id: node.id,
                parentId,
                index,
                nodeType: node?.nodes ? nodeTypes.GROUP : nodeTypes.LAYER,
                containerNode,
                nodeTypes
            };
        }
    },
    (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    })
);

const Drag = drag(({ component: Component, ...props }) => {
    return <Component {...props} />;
});

/**
 * DragNode applies all property and handlers for drag events
 * @prop {component} component component to enhance
 * @prop {boolean} sortable if true adds all the needed properties and handler for drag events
 */
const DragNode = ({ component, ...props }) => {
    const node = props.replaceNodeOptions ? props.replaceNodeOptions(props.node, props.nodeType) : props.node;
    const sortable = !!(props?.config?.sortable !== false && node?.sortable !== false);
    const Component = component;
    if (!sortable) {
        return (
            <Component
                {...props}
                sortable={sortable}
                connectDragSource={cmp => cmp}
                connectDragPreview={cmp => cmp}
            />
        );
    }
    return (<Drag {...props} sortable={sortable} component={component} />);
};

export default DragNode;
