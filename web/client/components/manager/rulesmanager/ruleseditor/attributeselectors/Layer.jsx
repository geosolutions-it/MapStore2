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
import { compose, defaultProps, withHandlers, withProps, withPropsOnChange } from 'recompose';

import {error} from '../../../../../actions/notifications';
import {loadLayers} from '../../../../../observables/rulesmanager';
import Message from '../../../../I18N/Message';
import PagedCombo from '../../../../misc/combobox/PagedCombobox';
import localizedProps from "../../../../misc/enhancers/localizedProps";
import autoComplete from "../../enhancers/autoComplete";

const LayerSelector = (props) => (
    <Row className={props.disabled ? 'ms-disabled' : ''}>
        <Col xs={12} sm={6}>
            <Message msgId="rulesmanager.layer"/>
        </Col>
        <Col xs={12} sm={6}>
            <PagedCombo {...props}/>
        </Col>
    </Row>);

export default compose(
    connect(() => ({}), {onError: error}),
    defaultProps({
        paginated: true,
        size: 5,
        textField: "name",
        valueField: "name",
        parentsFilter: {},
        filter: false,
        placeholder: "rulesmanager.placeholders.layer",
        loadingErrorMsg: {
            title: "rulesmanager.errorTitle",
            message: "rulesmanager.errorLoadingLayers"
        }
    }),
    withPropsOnChange(["workspace"], ({workspace}) => {
        return {
            parentsFilter: {workspace}
        };
    }),
    withProps((ownProps) => ({loadData: (...args) => loadLayers(...args, ownProps.gsInstanceURL)})),
    withHandlers({
        onValueSelected: ({setOption = () => {}}) => filterTerm => {
            setOption({key: "layer", value: filterTerm});
        }
    }),
    localizedProps(["placeholder"]),
    autoComplete
)(LayerSelector);
