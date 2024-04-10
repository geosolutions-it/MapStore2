/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { DropTarget as dropTarget } from 'react-dnd';

const ITEM_KEY = 'node';

const formatDataId = (_id = '', position, lastId) => {
    let id = _id;
    if (lastId) {
        // ensure to get the latest id from groups
        const parts = _id.split('.');
        id = parts[parts.length - 1];
    }
    return `node-${id.replace(/\.|\:| /g, '-')}${position ? `-${position}` : ''}`;
};

const computeSorting = (props, monitor) => {
    const dragItem = monitor.getItem();
    const { id, parentId, index, position } = props;
    const containerNode = dragItem.containerNode;
    const nodeTypes = dragItem.nodeTypes || {};
    // Don't replace items with themselves
    if (id === dragItem.id || !containerNode) {
        return null;
    }
    const rootParentId = containerNode.getAttribute('data-root-parent-id');
    const hoverTargetId = id || rootParentId;
    const hoverNode = containerNode.querySelector(`[data-id=${formatDataId(hoverTargetId, position, true)}]`);
    const dragNode = containerNode.querySelector(`[data-id=${formatDataId(dragItem.id || rootParentId, dragItem.position, true)}]`);

    if (!hoverNode?.getBoundingClientRect || !dragNode?.getBoundingClientRect) {
        return null;
    }

    const hoverNodeType = props?.nodeType;

    const hoverNodeId = hoverNode.getAttribute('data-node-id');
    const dragNodeId = dragNode.getAttribute('data-node-id');
    const dragParentNodeId = dragNode.getAttribute('data-parent-node-id') || rootParentId;
    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    // ---
    // the id of group is dynamic based on the parent id
    // eg: parentGroupId.childGroupId
    // the dragItem is not updated until we drop
    // but while dragging we are also updating the nodes structure
    // this is needed to sync the correct id
    dragItem.id = dragNodeId;
    dragItem.parentId = dragParentNodeId;
    // Don't replace items with themselves
    if (hoverNodeId === dragNodeId) {
        return null;
    }

    const hoverBoundingRect = hoverNode.getBoundingClientRect();
    const dragBoundingRect = dragNode.getBoundingClientRect();
    const dragY = dragBoundingRect.top;
    const hoverY = hoverBoundingRect.top;
    const hoverIndex = index;
    // Determine rectangle on screen
    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
    // Determine mouse position
    const clientOffset = monitor.getClientOffset();
    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;
    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    if (position === 'before' && dragParentNodeId !== hoverTargetId) {
        return [dragItem.id, hoverTargetId, 0];
    }

    if (position === 'after' && dragY < hoverY && hoverClientY > hoverMiddleY) {
        const hoverParentId =  parentId || rootParentId;
        // we should increase the detected index by one
        // in case a node change the parent group
        // this fix the behoviour of sorting from top to bottom
        // when inserterting a node after a group
        const targetIndex = dragParentNodeId !== hoverParentId
            ? hoverIndex + 1
            : hoverIndex;
        return [dragItem.id, hoverParentId, targetIndex];
    }

    if (['after', 'before'].includes(position)) {
        return null;
    }

    if (hoverNodeType === nodeTypes.GROUP && dragY < hoverY) {
        return null;
    }

    if (dragY > hoverY && hoverClientY > hoverMiddleY) {
        return null;
    }
    if (dragY < hoverY && hoverClientY < hoverMiddleY) {
        return null;
    }

    return [dragItem.id, parentId || rootParentId, hoverIndex];
};

const drop = dropTarget(ITEM_KEY,
    {
        drop: (props) => {
            const { sort = {} } = props;
            if (sort?.drop) {
                sort.drop();
            }
        },
        hover: (props, monitor) => {
            const { sort = {} } = props;
            const payload = computeSorting(props, monitor);
            if (payload && sort?.hover) {
                const [ id, groupId, index ] = payload;
                sort.hover(id, groupId, index);
            }
        }
    },
    (_connect) => ({
        connectDropTarget: _connect.dropTarget()
    })
);

const Drop = drop(({
    id,
    parentId,
    position,
    style,
    children,
    connectDropTarget,
    nodeType
}) => {

    return connectDropTarget(
        <div
            data-id={formatDataId(id, position, true)}
            data-node-id={id}
            data-parent-node-id={parentId}
            className={`ms-drop-node${nodeType ? ` ${nodeType}` : ''}`}
            style={style}
        >
            {children}
        </div>
    );
});
/**
 * DropNode applies all property and handlers for drop events
 * @prop {string} id identifier of the node
 * @prop {string} parentId identifier of the node parent
 * @prop {string} position needed only to manage some drops event in group nodes, it could be `after` or `before`.
 * @prop {string} nodeType node type, one of `layers` or `groups`
 * @prop {object} style custom style
 * @prop {boolean} sortable if true adds all the needed properties and handler for drop events
 */
const DropNode = ({ children, ...props }) => {
    if (!props.sortable) {
        return children;
    }
    return <Drop {...props}>{children}</Drop>;
};

export default DropNode;
