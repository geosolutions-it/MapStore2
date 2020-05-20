/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const React = require("react");
const PropTypes = require("prop-types");
const {FormGroup, Row, Col} = require("react-bootstrap");
const Message = require('../../../../I18N/Message');
const {toNumber, isNumber} = require("lodash");
const withLocalized = require("../../../../misc/enhancers/localizedProps");
const {compose, defaultProps} = require("recompose");
const IntlNumberFormControl = require('../../../../I18N/IntlNumberFormControl');

class Priority extends React.Component {
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
            return isNumber(toNumber(this.props.selected)) && "success" || "error";
        }
        return null;
    }
    render() {
        const {disabled, selected, placeholder} = this.props;
        return (
            <Row className={disabled ? 'ms-disabled' : ''}>
                <Col xs={12} sm={6}>
                    <Message msgId="rulesmanager.priority"/>
                </Col>
                <Col xs={12} sm={6}>
                    <FormGroup validationState={this.getValidationState()}>
                        <IntlNumberFormControl
                            min="0"
                            type="number"
                            value={selected}
                            placeholder={placeholder}
                            onChange={this.handleChange}
                        />
                    </FormGroup>
                </Col>
            </Row>
        );
    }
    handleChange = (value) => {
        this.props.setOption({key: "priority", value});
    }
}

module.exports = compose(
    defaultProps({
        placeholder: "rulesmanager.placeholders.priority"
    }),
    withLocalized(["placeholder"]))(Priority);

