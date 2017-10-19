const React = require('react');
const PropTypes = require('prop-types');

class SwitchButton extends React.Component {

    static propTypes = {
        checked: PropTypes.bool,
        onChange: PropTypes.func
    };

    static defaultProps = {
        checked: false,
        onChange: () => {}
    };

    render() {
        return (<label className="mapstore-switch-btn">
            <input type="checkbox"
                onChange={() => {
                    this.props.onChange(!this.props.checked);
                }}
                checked={this.props.checked}
                />
            <span className="m-slider"/>
        </label>);
    }
}

module.exports = SwitchButton;
