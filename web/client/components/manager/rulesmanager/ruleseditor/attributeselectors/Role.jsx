/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from "react";
import {Col, Row} from 'react-bootstrap';
import {connect} from "react-redux";
import { compose, defaultProps, withHandlers } from 'recompose';

import {error} from '../../../../../actions/notifications';
import {getRoles} from '../../../../../observables/rulesmanager';
import Message from '../../../../I18N/Message';
import PagedCombo from '../../../../misc/combobox/PagedCombobox';
import localizedProps from "../../../../misc/enhancers/localizedProps";
import autoComplete from "../../enhancers/autoComplete";

const RoleSelector = (props) => (
    <Row className={props.disabled ? 'ms-disabled' : ''}>
        <Col xs={12} sm={6}>
            <Message msgId="rulesmanager.role"/>
        </Col>
        <Col xs={12} sm={6}>
            <PagedCombo {...props}/>
        </Col>
    </Row>);

export default compose(
    connect(() => ({}), {onError: error}),
    defaultProps({
        size: 5,
        textField: "name",
        valueField: "name",
        loadData: getRoles,
        parentsFilter: {},
        filter: false,
        placeholder: "rulesmanager.placeholders.role",
        loadingErrorMsg: {
            title: "rulesmanager.errorTitle",
            message: "rulesmanager.errorLoadingRoles"
        }
    }),
    withHandlers({
        onValueSelected: ({setOption = () => {}}) => filterTerm => {
            setOption({key: "rolename", value: filterTerm});
        }
    }),
    localizedProps(["placeholder", "loadingErroMsg"]),
    autoComplete
)(RoleSelector);
