const React = require('react');
const PropTypes = require('prop-types');
const colors = require('./ExtendColorBrewer');
const Message = require('../../I18N/Message');

const ColorRampItem = ({ item }) => {
    let ramp = item && (item.ramp || colors[item.name] && colors[item.name][5]) || [];
    return (
        <div className="color-ramp-item">
            {ramp.map(cell => <div className="color-cell" key={item && item.name + "-" + cell} style={{ backgroundColor: cell }} />)}
            <div className="colorname-cell">
                {item && item.name
                    ? <Message msgId={item.name.includes('global.colors') ? item.name : `global.colors.${item.name}`} msgParams={{ number: ramp.length }} />
                    : item}
            </div>
        </div>
    );
};

ColorRampItem.propTypes = {
    item: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
};

module.exports = ColorRampItem;
