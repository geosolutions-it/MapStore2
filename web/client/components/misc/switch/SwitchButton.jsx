const React = require('react');
const PropTypes = require('prop-types');
/**
 * Graphical Switch button.
 * @param {boolean} [checked=false] the status of the button
 * @prop {function} onChange handler for change
 */
class SwitchButton extends React.Component {

    static propTypes = {
        checked: PropTypes.bool,
        onChange: PropTypes.func,
        onClick: PropTypes.func
    };

    static defaultProps = {
        checked: false,
        onChange: () => {},
        onClick: () => {}
    };

    render() {
        return (<label className="mapstore-switch-btn">
            <input type="checkbox"
                checked={this.props.checked}
                onChange={() => this.props.onChange(!this.props.checked)}
            />
            <span onClick={() => this.props.onClick(!this.props.checked)} className="m-slider"/>
        </label>);
    }
}

module.exports = SwitchButton;
