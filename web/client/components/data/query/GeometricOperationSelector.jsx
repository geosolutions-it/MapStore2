const React = require('react');

const Message = require('../../I18N/Message');
const {DropdownList} = require('react-widgets');

const ListItem = ({ item } = {}) => (
    <span>
        {item && item.name ? <Message msgId={item.name} /> : null}
    </span>
);
module.exports = ({spatialOperations = [], onChange = () => {}, value} = {}) =>
    (<DropdownList
        valueField="id"
        className="geometry-operation-selector"
        onChange={onChange}
        data={spatialOperations}
        valueComponent={ListItem}
        value={value}
        itemComponent={ListItem} />
    );
