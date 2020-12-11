
import React from 'react';
import { compose, branch } from 'recompose';

export default compose(
    branch(
        ({isDraggable = true}) => isDraggable,
        Component => ({onSort, isDraggable, items = [], containerId, ...props}) => {
            const draggableItems = items.map((item, sortId) => ({...item, onSort, isDraggable, sortId, key: item.id || sortId, containerId}));
            return <Component {...{...props, isDraggable}} items={draggableItems}/>;
        }
    )
);
