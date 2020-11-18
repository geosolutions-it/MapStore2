import React from 'react';
import Message from '../../I18N/Message';
import { DropdownList } from 'react-widgets';

const ListItem = ({ item } = {}) => (
    <span>
        {item && item.name ? <Message msgId={item.name} /> : null}
    </span>
);

export default ({spatialOperations = [], onChange = () => {}, value} = {}) =>
    (<DropdownList
        valueField="id"
        className="geometry-operation-selector"
        onChange={onChange}
        data={spatialOperations}
        valueComponent={ListItem}
        value={value}
        itemComponent={ListItem} />
    );
