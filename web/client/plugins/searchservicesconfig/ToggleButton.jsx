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
const ToggleServicesConfig = React.createClass({
    propTypes: {
        toggleControl: React.PropTypes.func,
        enabled: React.PropTypes.bool
    },
    onClick() {
        if (!this.props.enabled) {
            this.props.toggleControl("settings");
            this.props.toggleControl("searchservicesconfig");
        }
    },
    render() {
        return (
            <FormGroup>
                <ToggleBtn key="searchservicesconfig"
                    isButton={true} {...this.props} onClick={this.onClick}/>
            </FormGroup>);
    }
});

module.exports = connect((state) => ({
    enabled: state.controls && state.controls.searchservicesconfig && state.controls.searchservicesconfig.enabled || false,
    pressedStyle: "default",
    defaultStyle: "primary",
    btnConfig: {
        bsSize: "small"}
}), {
    toggleControl: toggleControl
})(ToggleServicesConfig);


