
const React = require('react');
const {compose, branch} = require('recompose');

module.exports = compose(
    branch(
        ({isDraggable = true}) => isDraggable,
        Component => ({onSort, isDraggable, items = [], containerId, ...props}) => {
            const draggableItems = items.map((item, sortId) => ({...item, onSort, isDraggable, sortId, key: item.id || sortId, containerId}));
            return <Component {...{...props, isDraggable}} items={draggableItems}/>;
        }
    )
);
