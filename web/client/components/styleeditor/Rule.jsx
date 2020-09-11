/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import Message from '../I18N/Message';
import { Alert, Glyphicon } from 'react-bootstrap';
import {
    DragSource as dragSource,
    DropTarget as dropTarget
} from 'react-dnd';

/**
 * Style rule component
 * @memberof components.styleeditor
 * @name Rule
 * @class
 * @prop {node|string} title title of the rule
 * @prop {node} tools this element are rendered at the right side of title
 * @prop {string} errorId error id message
 * @prop {bool} draggable add connector function for drag and drop event and enable grab handler
 */
function RuleCard({
    title,
    tools,
    errorId,
    draggable,
    connectDragSource,
    connectDropTarget,
    isDragging,
    children
}) {

    const elementRef = useRef(null);

    if (draggable) {
        connectDragSource(elementRef.current);
        connectDropTarget(elementRef.current);
    }

    const dropTargetClassName = isDragging ? ' ms-drop-target' : '';

    return (
        <li
            ref={elementRef}
            className={`ms-style-rule${dropTargetClassName}`}>
            <div className="ms-style-rule-head">
                {draggable && <div className="ms-style-rule-grab-handle">
                    <Glyphicon glyph="grab-handle"/>
                </div>}
                <div className="ms-style-rule-head-info">
                    {title}
                </div>
                <div className="ms-style-rule-head-tools">
                    {tools}
                </div>
            </div>
            {errorId && <Alert bsStyle="danger">
                <Message msgId={errorId} />
            </Alert>}
            <ul className="ms-style-rule-body">
                {children}
            </ul>
        </li>
    );
}

RuleCard.propTypes = {
    title: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    tools: PropTypes.node,
    errorId: PropTypes.string,
    draggable: PropTypes.bool,
    connectDragSource: PropTypes.func,
    connectDropTarget: PropTypes.func,
    isDragging: PropTypes.bool
};

RuleCard.defaultProps = {
    connectDragSource: (el) => el,
    connectDropTarget: (el) => el
};

const itemType = 'RULE';

// from simple sortable example of react-dnd
// full code: https://github.com/react-dnd/react-dnd/blob/v11.1.3/packages/documentation/examples-decorators/src/04-sortable/simple/Card.tsx
function dragAndDropUpdate(props, monitor, component) {
    if (!component) {
        return null;
    }
    const node = findDOMNode(component);
    if (!node) {
        return null;
    }
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;
    if (dragIndex === hoverIndex) {
        return null;
    }
    const { bottom, top } = node.getBoundingClientRect();
    const hoverMiddleY = (bottom - top) / 2;
    const clientOffset = monitor.getClientOffset();
    const hoverClientY = clientOffset.y - top;
    // dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return null;
    }
    // dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return null;
    }
    props.onSort(dragIndex, hoverIndex);
    // comment from original example
    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
    return null;
}

const dropRuleTarget = dropTarget(itemType,
    {
        hover(props, monitor, component) {
            dragAndDropUpdate(props, monitor, component);
        }
    },
    (connect) => ({
        connectDropTarget: connect.dropTarget()
    })
);

const dragRuleSource = dragSource(itemType,
    {
        beginDrag: (props) => ({
            id: props.id,
            index: props.index
        })
    },
    (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    })
);

const Rule = dropRuleTarget(
    dragRuleSource(
        RuleCard
    )
);

export default Rule;
