/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useState } from 'react';
import { Glyphicon } from 'react-bootstrap';
import { DragSource as dragSource, DropTarget as dropTarget } from 'react-dnd';
import ButtonMS from '../misc/Button';
import tooltip from '../misc/enhancers/tooltip';
const Button = tooltip(ButtonMS);

const formatDataId = id => id.replace(/\./g, '-');

function MapViewItem({
    id,
    title,
    selected,
    onSelect,
    onRemove,
    isDragging,
    connectDragPreview,
    connectDropTarget,
    connectDragSource,
    isSortable
}) {
    const selectButton = useRef();
    const [focus, setFocus] = useState(false);
    const opacity = isDragging ? 0 : 1;
    const handler = isSortable ? connectDragSource(
        <div className="grab-handle" onClick={(event) => event.stopPropagation()}>
            <Glyphicon glyph="grab-handle" />
        </div>
    ) : null;

    const content = (<li
        data-id={`item-${formatDataId(id)}`}
        className={`ms-map-views-item${selected ? ' selected' : ''}${focus ? ' focus' : ''}`}
        style={{ opacity }}
        onClick={() => selectButton?.current?.click()}
        tabIndex={0}
    >
        {handler}
        <div className="ms-map-views-item-title">{title}</div>
        <div onClick={(event) => event.stopPropagation()}>
            <button
                ref={selectButton}
                style={{ left: 0, visibility: 'hidden', position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
                onClick={onSelect}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
            >
                select {title} item
            </button>
            {onRemove && <Button
                className="square-button-md"
                bsStyle={selected ? 'primary' : 'default'}
                onClick={onRemove}
                tooltipId="mapViews.removeView"
            >
                <Glyphicon glyph="trash" />
            </Button>}
        </div>
    </li>);

    return isSortable ? connectDragPreview(connectDropTarget(content)) : content;
}

const ITEM_KEY = 'option';
const drag = dragSource(ITEM_KEY,
    {
        beginDrag: ({ id, index }) => ({
            id,
            index
        })
    },
    (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    })
);
const drop = dropTarget('option',
    {
        drop: (props) => {
            const { onMoveEnd = () => { } } = props;
            onMoveEnd();
        },
        // based on react-dnd doc
        // see https://github.com/react-dnd/react-dnd/blob/v16.0.0/packages/examples/src/04-sortable/simple/Card.tsx#L42
        hover: (props, monitor) => {
            const item = monitor.getItem();
            const { id, index, onMove = () => { } } = props;
            const node = document.querySelector(`[data-id=item-${formatDataId(id)}]`);

            if (!node?.getBoundingClientRect) {
                return null;
            }
            const dragIndex = item.index;
            const hoverIndex = index;
            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return null;
            }
            // Determine rectangle on screen
            const hoverBoundingRect = node.getBoundingClientRect();
            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            // Determine mouse position
            const clientOffset = monitor.getClientOffset();
            // Get pixels to the top
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;
            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%
            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return null;
            }
            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return null;
            }
            // Time to actually perform the action
            onMove(dragIndex, hoverIndex);
            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex;
            return null;
        }
    },
    (connect, monitor) => ({
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver()
    })
);

export default drag(drop(MapViewItem));
