/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const Message = require("../../plugins/locale/Message");
const {FormControl, FormGroup, ControlLabel} = require('react-bootstrap');


class FeatureInfoTriggerSelector extends React.Component {
    static propTypes = {
        trigger: PropTypes.string,
        onTriggerChange: PropTypes.func
    }
    render() {
        return (
            <FormGroup bsSize="small">
                <ControlLabel>{<Message msgId="infoTriggerLabel" />}</ControlLabel>
                <FormControl
                    value={this.props.trigger}
                    componentClass="select"
                    onChange={this.props.onTriggerChange}>
                    <option value="click" key="click">Click</option>
                    <option value="hover" key="hover">Hover</option>
                </FormControl>
            </FormGroup>
        );
    }
}

module.exports = FeatureInfoTriggerSelector;
