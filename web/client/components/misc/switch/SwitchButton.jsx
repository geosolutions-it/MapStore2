const React = require('react');
const PropTypes = require('prop-types');

class SwitchButton extends React.Component {

    static propTypes = {
        checked: PropTypes.bool,
        onSwitch: PropTypes.func
    };

    static defaultProps = {
        checked: false,
        onSwitch: () => {}
    };

    render() {
        return (<label className="mapstore-switch-btn">
            <input type="checkbox"
                onChange={() => {
                    this.props.onSwitch(!this.props.checked);
                }}
                checked={this.props.checked}
                />
            <span className="m-slider"/>
        </label>);
    }
}

module.exports = SwitchButton;
