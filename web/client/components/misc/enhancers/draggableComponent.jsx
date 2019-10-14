/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/


const React = require('react');
const {compose, branch} = require('recompose');
const {DragSource: dragSource} = require('react-dnd');
const {DropTarget: dropTarget} = require('react-dnd');


const itemSource = {
    beginDrag: props => ({...props})
};

const itemTarget = {
    drop: (props, monitor) => {
        const item = monitor.getItem();
        if (item.sortId !== props.sortId) {
            props.onSort(props.sortId, item.sortId, {
                id: props.id,
                containerId: props.containerId
            },
            {
                id: item.id,
                containerId: item.containerId
            });
        }
    }
};

const sourceCollect = (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging(),
    draggingItem: monitor.getItem() || null
});

const targetCollect = (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
});


module.exports = branch(
    ({isDraggable} = {}) => isDraggable,
    compose(
        dragSource('row', itemSource, sourceCollect),
        dropTarget('row', itemTarget, targetCollect),
        Component => ({connectDragSource, connectDragPreview, connectDropTarget, isDragging, isOver, ...props}) => {
            const pos = props.draggingItem && props.draggingItem.sortId < props.sortId;

            const isSameContainer = props.draggingItem && props.draggingItem.containerId === props.containerId;
            const draggingClassName = isSameContainer && isDragging ? ' ms-dragging' : '';
            const overClassName = isSameContainer && isOver ? ' ms-over' : '';
            const posClassName = isSameContainer && pos ? ' ms-above' : ' ms-below';

            return connectDragPreview(connectDropTarget(
                <div className={`ms-dragg${draggingClassName}${overClassName} ${posClassName}`}>
                    <div>
                        <Component {...props} connectDragSource={connectDragSource} isDragging={isDragging} isOver={isOver} onDrop={(event) => event.stopPropagation()} />
                    </div>
                </div>));
        })
);
