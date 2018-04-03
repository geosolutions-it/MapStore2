
const React = require('react');
const {compose, branch} = require('recompose');
const {DragSource: dragSource} = require('react-dnd');
const {DropTarget: dropTarget} = require('react-dnd');
const ReactCSSTransitionGroup = require('react-addons-css-transition-group');

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
    isDragging: monitor.isDragging(),
    draggingItem: monitor.getItem() || null
});

const targetCollect = (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
});

module.exports = compose(
    dragSource('row', itemSource, sourceCollect),
    dropTarget('row', itemTarget, targetCollect),
    branch(
        ({isDraggable}) => isDraggable,
        Component => ({connectDragSource, connectDropTarget, isDragging, isOver, ...props}) => {
            const pos = props.draggingItem && props.draggingItem.sortId < props.sortId;
            return connectDragSource(connectDropTarget(
                <div className={`ms-dragg ${isDragging ? 'ms-dragging ' : ''}${isOver ? 'ms-over ' : ''} ${pos ? 'ms-above ' : 'ms-below '}`}>
                    <ReactCSSTransitionGroup
                        transitionName={'ms-drag-vert-transition'}
                        transitionEnterTimeout={500}
                        transitionLeaveTimeout={500}>
                        {isOver && props.draggingItem && props.draggingItem.sortId !== props.sortId && !pos && props.draggingItem && <div key="drag-above" className="ms-placeholder"><Component {...props.draggingItem}/></div>}
                        <Component {...props} isDragging={isDragging} isOver={isOver} />
                        {isOver && props.draggingItem && props.draggingItem.sortId !== props.sortId && pos && props.draggingItem && <div key="drag-below" className="ms-placeholder"><Component {...props.draggingItem}/></div>}
                    </ReactCSSTransitionGroup>
                </div>)
            );
        }
    )
);
