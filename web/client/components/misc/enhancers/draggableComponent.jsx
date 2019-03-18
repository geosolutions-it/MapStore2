
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
            props.onSort(props.sortId, item.sortId);
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

                return connectDragPreview(connectDropTarget(
                    <div className={`ms-dragg ${isDragging ? 'ms-dragging ' : ''}${isOver ? 'ms-over ' : ''} ${pos ? 'ms-above ' : 'ms-below '}`}>
                        <div>
                            <Component {...props} connectDragSource={connectDragSource} isDragging={isDragging} isOver={isOver} />
                            </div>
                    </div>));
            })
        );
