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
const {connect} = require("react-redux");
const {createSelector} = require("reselect");
const {servicesSelector} = require("../../../../../selectors/rulesmanager");

const selector = createSelector(servicesSelector, ( services) => ({
    services
}));

const WorkspaceSelector = (props) => (
    <Row className={props.disabled ? 'ms-disabled' : ''}>
        <Col xs={12} sm={6}>
            <Message msgId="rulesmanager.service"/>
        </Col>
        <Col xs={12} sm={6}>
            <PagedCombo {...props}/>
        </Col>
    </Row>);

module.exports = compose(
    connect(selector),
    defaultProps({
        size: 5,
        textField: "label",
        valueField: "value",
        parentsFilter: {},
        filter: "startsWith",
        placeholder: "rulesmanager.placeholders.service",
        data: [
            {value: "WMS", label: "WMS"},
            {value: "WFS", label: "WFS"},
            {value: "WCS", label: "WCS"}
        ]
    }),
    withPropsOnChange(["services"], ({services, data}) => ({data: services || data})),
    withHandlers({
        onValueSelected: ({setOption = () => {}}) => filterTerm => {
            setOption({key: "service", value: filterTerm});
        }
    }),
    localizedProps(["placeholder"]),
    fixedOptions
)(WorkspaceSelector);
