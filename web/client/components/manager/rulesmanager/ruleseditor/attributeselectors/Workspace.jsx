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
const {error} = require('../../../../../actions/notifications');
const localizedProps = require("../../../../misc/enhancers/localizedProps");
const {getWorkspaces} = require('../../../../../observables/rulesmanager');
const {connect} = require("react-redux");
const Message = require('../../../../I18N/Message');

const WorkspaceSelector = (props) => (
    <Row className={props.disabled ? 'ms-disabled' : ''}>
        <Col xs={12} sm={6}>
            <Message msgId="rulesmanager.workspace"/>
        </Col>
        <Col xs={12} sm={6}>
            <PagedCombo {...props}/>
        </Col>
    </Row>);

module.exports = compose(
    connect(() => ({}), {onError: error}),
    defaultProps({
        paginated: false,
        size: 5,
        textField: "name",
        valueField: "name",
        loadData: getWorkspaces,
        parentsFilter: {},
        filter: "startsWith",
        placeholder: "rulesmanager.placeholders.workspace",
        loadingErrorMsg: {
            title: "rulesmanager.errorTitle",
            message: "rulesmanager.errorLoadingWorkspaces"
        }
    }),
    withHandlers({
        onValueSelected: ({setOption = () => {}}) => filterTerm => {
            setOption({key: "workspace", value: filterTerm});
        }
    }),
    localizedProps(["placeholder"]),
    autoComplete
)(WorkspaceSelector);
