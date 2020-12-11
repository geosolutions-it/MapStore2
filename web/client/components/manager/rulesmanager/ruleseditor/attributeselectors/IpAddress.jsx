/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import PropTypes from "prop-types";
import React from "react";
import {Col, FormControl, FormGroup, Row} from "react-bootstrap";
import {compose, defaultProps} from "recompose";

import {checkIp} from '../../../../../utils/RulesEditorUtils';
import Message from '../../../../I18N/Message';
import withLocalized from "../../../../misc/enhancers/localizedProps";

class IpAddress extends React.Component {
    static propTypes = {
        selected: PropTypes.string,
        setOption: PropTypes.func,
        placeholder: PropTypes.string,
        disabled: PropTypes.bool
    }
    static defaultProps = {
        setOption: () => {},
        disabled: false
    }
    getValidationState() {
        if (this.props.selected && this.props.selected.length > 0) {
            return this.props.selected.match(checkIp) && "success" || "error";
        }
        return null;
    }
    render() {
        const {disabled, selected, placeholder} = this.props;
        return (
            <Row className={disabled ? 'ms-disabled' : ''}>
                <Col xs={12} sm={6}>
                    <Message msgId="rulesmanager.ip"/>
                </Col>
                <Col xs={12} sm={6}>
                    <FormGroup validationState={this.getValidationState()}>
                        <FormControl
                            type="text"
                            value={selected}
                            placeholder={placeholder}
                            onChange={this.handleChange}
                        />
                    </FormGroup>
                </Col>
            </Row>
        );
    }
    handleChange = (e) => {
        this.props.setOption({key: "ipaddress", value: e.target.value});
    }
}

export default compose(
    defaultProps({
        placeholder: "rulesmanager.placeholders.ip"
    }),
    withLocalized(["placeholder"]))(IpAddress);

