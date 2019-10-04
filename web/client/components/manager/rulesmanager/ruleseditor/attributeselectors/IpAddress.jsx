/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const React = require("react");
const PropTypes = require("prop-types");
const {FormControl, FormGroup, Row, Col} = require("react-bootstrap");
const Message = require('../../../../I18N/Message');
const {checkIp} = require('../../../../../utils/RulesEditor');
const withLocalized = require("../../../../misc/enhancers/localizedProps");
const {compose, defaultProps} = require("recompose");

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

module.exports = compose(
    defaultProps({
        placeholder: "rulesmanager.placeholders.ip"
    }),
    withLocalized(["placeholder"]))(IpAddress);

