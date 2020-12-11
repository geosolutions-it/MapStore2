/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';
import Message from '../../plugins/locale/Message';
import { FormControl, FormGroup, ControlLabel } from 'react-bootstrap';


class FeatureInfoTriggerSelector extends React.Component {
    static propTypes = {
        trigger: PropTypes.string,
        onSetMapTrigger: PropTypes.func
    }

    onChange = (event) => {
        this.props.onSetMapTrigger(event.target.value);
    }

    render() {
        return (
            <FormGroup bsSize="small">
                <ControlLabel>{<Message msgId="infoTriggerLabel" />}</ControlLabel>
                <FormControl
                    value={this.props.trigger}
                    componentClass="select"
                    onChange={this.onChange}>
                    <option value="click" key="click">Click</option>
                    <option value="hover" key="hover">Hover</option>
                </FormControl>
            </FormGroup>
        );
    }
}

export default FeatureInfoTriggerSelector;
