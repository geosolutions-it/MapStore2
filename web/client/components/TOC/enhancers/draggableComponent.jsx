const ReactDOM = require('react-dom');
const {DragSource: dragSource, DropTarget: dropTarget} = require('react-dnd');
const {compose, branch} = require('recompose');

const dragSpec = {
    beginDrag: (props) => {
        if (props.setDndState) {
            props.setDndState({
                node: props.node,
                parentNodeId: props.parentNodeId,
                newParentNodeId: props.parentNodeId,
                sortIndex: props.sortIndex
            });
        }
        return {
            node: props.node,
            parentNodeId: props.parentNodeId,
            newParentNodeId: props.parentNodeId,
            sortIndex: props.sortIndex
        };
    },
    endDrag: (props, monitor) => {
        const {sortIndex, newParentNodeId, illegalDrop} = monitor.getItem();
        if (props.setDndState) {
            props.setDndState({
                node: null,
                illegalDrop: null
            });
        }
        if (illegalDrop) {
            if (props.onError) {
                props.onError({
                    title: 'notification.warning',
                    autoDismiss: 5,
                    position: 'tc',
                    ...illegalDrop
                });
            }
        } else if (props.onSort) {
            props.onSort(props.node.id, newParentNodeId, sortIndex);
        }
    }
};

const dragCollect = (connect, monitor) => {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging(),
        draggedItem: monitor.getItem()
    };
};

const dropSpec = {
    hover: (props, monitor, component) => {
        const item = monitor.getItem();
        const draggedItemIndex = item.sortIndex;
        const hoveredItemIndex = props.sortIndex;
        // This code gets the underlying DOM node for a component that we are currently hovering above,
        // to get their sizes and use them to determine how and when to update the dragging state.
        // Currently for layer list item it sets sortIndex of a dragged element to a sortIndex of that item,
        // when user's cursor passes a Y coordinate that divides item's bounding rect in half
        // For group list items it inserts dragged element above the group item in it's parent node if we
        // are hovering above the upper third of a component and into the group item if we are hovering above the lower
        // two thirds of a component
        if (monitor.isOver({shallow: true})) {
            const componentDomNode = ReactDOM.findDOMNode(component);
            const headDomNode = componentDomNode.getElementsByClassName('toc-default-group-head')[0];
            const domNode = headDomNode || componentDomNode;
            if (domNode) {
                const boundingRect = domNode.getBoundingClientRect();
                const clientY = monitor.getClientOffset().y - boundingRect.top;
                if (headDomNode) {
                    const thirdY = (boundingRect.bottom - boundingRect.top) / 3;
                    if (props.isDragging || (props.node && props.node.placeholder)) {
                        return;
                    }
                    if (item.newParentNodeId === props.parentNodeId && draggedItemIndex < hoveredItemIndex && clientY < thirdY) {
                        return;
                    }
                    if (item.newParentNodeId === props.parentNodeId && draggedItemIndex > hoveredItemIndex && clientY > 2 * thirdY) {
                        return;
                    }
                    if (clientY < thirdY) {
                        item.sortIndex = props.sortIndex;
                        item.newParentNodeId = props.parentNodeId;
                        // check if we are over the Default group
                        if (props.node.name === 'Default') {
                            item.illegalDrop = {
                                message: 'toc.error.defaultGroupOnTop',
                                values: {
                                    groupTitle: props.node.title
                                }
                            };
                        }
                    } else {
                        item.sortIndex = 0;
                        item.newParentNodeId = props.node.id;
                        item.illegalDrop = null;
                    }
                } else {
                    const middleY = (boundingRect.bottom - boundingRect.top) / 2;
                    if (draggedItemIndex === hoveredItemIndex && item.newParentNodeId === props.parentNodeId) {
                        return;
                    }
                    if (item.newParentNodeId === props.parentNodeId && draggedItemIndex < hoveredItemIndex && clientY < middleY) {
                        return;
                    }
                    if (item.newParentNodeId === props.parentNodeId && draggedItemIndex > hoveredItemIndex && clientY > middleY) {
                        return;
                    }
                    item.sortIndex = props.sortIndex;
                    item.newParentNodeId = props.parentNodeId;
                    item.illegalDrop = null;
                }
                if (props.setDndState) {
                    props.setDndState(item);
                }
            }
        }
    }
};

const dropCollect = (connect, monitor) => {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver({shallow: true})
    };
};

/**
* TOC list draggable component enhancer. Enhances a list item(group or layer) to allow it to act as a dragSource and a dropTarget
* @type {function}
* @name draggableComponent
* @memberof components.TOC.enhancers
* @param {string} type Type of an item in dnd interactions. Dropping a source onto a target requires them to have identical types
*/
module.exports = (type, ...args) => {
    return branch(
        ({isDraggable} = {}) => isDraggable,
        compose(
            dragSource(type, dragSpec, dragCollect),
            dropTarget(type, dropSpec, dropCollect)
        ),
        compose(
            dropTarget(type, dropSpec, dropCollect)
        )
    )(...args);
};
