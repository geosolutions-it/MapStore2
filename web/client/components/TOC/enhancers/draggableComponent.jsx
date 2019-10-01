const ReactDOM = require('react-dom');
const {DragSource: dragSource, DropTarget: dropTarget} = require('react-dnd');
const {compose, branch} = require('recompose');

const dragSpec = {
    beginDrag: (props) => {
        return {
            node: props.node.id,
            parentNodeId: props.parentNodeId,
            sortIndex: props.sortIndex,
            newSortIndex: props.sortIndex,
            newParentNodeId: props.newParentNodeId
        };
    },
    endDrag: (props, monitor) => {
        const {newSortIndex, newParentNodeId} = monitor.getItem();
        if (props.onSort) {
            props.onSort(props.node.id, newParentNodeId, newSortIndex);
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
        const draggedItemIndex = item.newSortIndex;
        const hoveredItemIndex = props.sortIndex;
        if (monitor.isOver({shallow: true})) {
            const domNode = ReactDOM.findDOMNode(component);
            if (domNode) {
                const boundingRect = domNode.getBoundingClientRect();
                const middleY = (boundingRect.bottom - boundingRect.top) / 2;
                const clientY = monitor.getClientOffset().y - boundingRect.top;
                if ((item.parentNodeId === props.parentNodeId && props.sortIndex < item.sortIndex) || item.parentNodeId !== props.parentNodeId) {
                    if (draggedItemIndex !== hoveredItemIndex + 1 && clientY > middleY) {
                        item.newSortIndex = hoveredItemIndex + 1;
                    } else if (draggedItemIndex !== hoveredItemIndex && clientY < middleY) {
                        item.newSortIndex = hoveredItemIndex;
                    }
                } else {
                    if (draggedItemIndex !== hoveredItemIndex && clientY > middleY) {
                        item.newSortIndex = hoveredItemIndex;
                    } else if (draggedItemIndex !== hoveredItemIndex - 1 && clientY < middleY) {
                        item.newSortIndex = hoveredItemIndex - 1;
                    }
                }
                item.newParentNodeId = props.parentNodeId;
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

module.exports = (type, ...args) => {
    return branch(
        ({isDraggable} = {}) => isDraggable,
        compose(
            dragSource(type, dragSpec, dragCollect),
            dropTarget(type, dropSpec, dropCollect)
        )
    )(...args);
};
