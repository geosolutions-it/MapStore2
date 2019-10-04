/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const React = require("react");
const {Row, Col} = require('react-bootstrap');
const PagedCombo = require('../../../../misc/combobox/PagedCombobox');
const autoComplete = require("../../enhancers/autoComplete");
const { compose, defaultProps, withHandlers} = require('recompose');
const localizedProps = require("../../../../misc/enhancers/localizedProps");
const {getUsers} = require('../../../../../observables/rulesmanager');
const {connect} = require("react-redux");
const {error} = require('../../../../../actions/notifications');
const Message = require('../../../../I18N/Message');

const UserSelector = (props) => (
    <Row className={props.disabled ? 'ms-disabled' : ''}>
        <Col xs={12} sm={6}>
            <Message msgId="rulesmanager.user"/>
        </Col>
        <Col xs={12} sm={6}>
            <PagedCombo {...props}/>
        </Col>
    </Row>);

module.exports = compose(
    connect(() => ({}), {onError: error}),
    defaultProps({
        size: 5,
        textField: "userName",
        valueField: "userName",
        loadData: getUsers,
        parentsFilter: {},
        filter: false,
        placeholder: "rulesmanager.placeholders.user",
        loadingErrorMsg: {
            title: "rulesmanager.errorTitle",
            message: "rulesmanager.errorLoadingRoles"
        }
    }),
    withHandlers({
        onValueSelected: ({setOption = () => {}}) => filterTerm => {
            setOption({key: "username", value: filterTerm});
        }
    }),
    localizedProps(["placeholder", "loadingErroMsg"]),
    autoComplete
)(UserSelector);
