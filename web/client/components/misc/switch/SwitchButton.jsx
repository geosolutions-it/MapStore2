/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
/**
 * Graphical Switch button.
 * @param {boolean} [checked=false] the status of the button
 * @prop {function} onChange handler for change
 */
class SwitchButton extends React.Component {

    static propTypes = {
        className: PropTypes.string,
        checked: PropTypes.bool,
        onChange: PropTypes.func,
        onClick: PropTypes.func
    };

    static defaultProps = {
        className: "",
        checked: false,
        onChange: () => {},
        onClick: () => {}
    };

    render() {
        return (<label className={`mapstore-switch-btn ${this.props.className}`}>
            <input type="checkbox"
                checked={this.props.checked}
                onChange={() => this.props.onChange(!this.props.checked)}
            />
            <span onClick={() => this.props.onClick(!this.props.checked)} className="m-slider"/>
        </label>);
    }
}

module.exports = SwitchButton;
