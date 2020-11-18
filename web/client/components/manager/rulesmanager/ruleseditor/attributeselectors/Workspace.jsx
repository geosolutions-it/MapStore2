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
import {getWorkspaces} from '../../../../../observables/rulesmanager';
import Message from '../../../../I18N/Message';
import PagedCombo from '../../../../misc/combobox/PagedCombobox';
import localizedProps from "../../../../misc/enhancers/localizedProps";
import autoComplete from "../../enhancers/autoComplete";

const WorkspaceSelector = (props) => (
    <Row className={props.disabled ? 'ms-disabled' : ''}>
        <Col xs={12} sm={6}>
            <Message msgId="rulesmanager.workspace"/>
        </Col>
        <Col xs={12} sm={6}>
            <PagedCombo {...props}/>
        </Col>
    </Row>);

export default compose(
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
