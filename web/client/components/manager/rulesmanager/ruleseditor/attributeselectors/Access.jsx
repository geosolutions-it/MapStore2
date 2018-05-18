/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const React = require("react");
const PagedCombo = require('../../../../misc/combobox/PagedCombobox');
const {Row, Col} = require('react-bootstrap');
const fixedOptions = require("../../enhancers/fixedOptions");
const localizedProps = require("../../../../misc/enhancers/localizedProps");
const { compose, defaultProps, withHandlers, withPropsOnChange} = require('recompose');
const Message = require('../../../../I18N/Message');

const AccessSelector = (props) => (
    <Row className={props.disabled ? 'ms-disabled' : ''}>
        <Col xs={12} sm={6}>
            <Message msgId="rulesmanager.access"/>
        </Col>
        <Col xs={12} sm={6}>
            <PagedCombo {...props}/>
        </Col>
    </Row>);

module.exports = compose(
    defaultProps({
        size: 5,
        textField: "label",
        valueField: "value",
        parentsFilter: {},
        filter: "startsWith",
        placeholder: "rulesmanager.placeholders.access",
        data: [
            {value: "ALLOW", label: "ALLOW"},
            {value: "DENY", label: "DENY"}
        ]
    }),
    withPropsOnChange(["services"], ({services, data}) => ({data: services || data})),
    withHandlers({
        onValueSelected: ({setOption = () => {}}) => filterTerm => {
            setOption({key: "grant", value: filterTerm});
        }
    }),
    localizedProps(["placeholder"]),
    fixedOptions
)(AccessSelector);
