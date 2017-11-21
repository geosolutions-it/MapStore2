const PropTypes = require('prop-types');
const React = require('react');
const colors = require("./ExtendColorBrewer");
const Message = require('../../I18N/Message');
class ColorRampItem extends React.Component {
    static propTypes = {
        item: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
    };

    render() {
        let ramp = this.props.item && (this.props.item.ramp || colors[this.props.item.name] && colors[this.props.item.name][5]) || [];
        return (<div className="color-ramp-item">
                {ramp.map(cell => <div className="color-cell" key={this.props.item && this.props.item.name + "-" + cell} style={{backgroundColor: cell}}/>)}
                <div className="colorname-cell">
                    {this.props.item && this.props.item.name
                        ? <Message msgId={this.props.item.name} msgParams={{number: ramp.length}} />
                    : this.props.item && this.props.item.name}
                </div>
                </div>);
    }
}

module.exports = ColorRampItem;
