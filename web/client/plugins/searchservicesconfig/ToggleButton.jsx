/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');
const {toggleControl} = require('../../actions/controls');
const {FormGroup} = require('react-bootstrap');
const ToggleBtn = require('../../components/buttons/ToggleButton');
const PropTypes = require('prop-types');

class ToggleServicesConfig extends React.Component {
    static propTypes = {
        toggleControl: PropTypes.func,
        enabled: PropTypes.bool
    };

    onClick = () => {
        if (!this.props.enabled) {
            this.props.toggleControl("settings");
            this.props.toggleControl("searchservicesconfig");
        }
    };

    render() {
        return (
            <FormGroup>
                <ToggleBtn key="searchservicesconfig"
                    isButton {...this.props} onClick={this.onClick}/>
            </FormGroup>);
    }
}

module.exports = connect((state) => ({
    enabled: state.controls && state.controls.searchservicesconfig && state.controls.searchservicesconfig.enabled || false,
    pressedStyle: "default",
    defaultStyle: "primary",
    btnConfig: {
        bsSize: "small"}
}), {
    toggleControl: toggleControl
})(ToggleServicesConfig);
