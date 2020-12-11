/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from "react";
import {Col, Row} from 'react-bootstrap';
import { compose, defaultProps, withHandlers, withPropsOnChange } from 'recompose';

import Message from '../../../../I18N/Message';
import PagedCombo from '../../../../misc/combobox/PagedCombobox';
import localizedProps from "../../../../misc/enhancers/localizedProps";
import fixedOptions from "../../enhancers/fixedOptions";

const AccessSelector = (props) => (
    <Row className={props.disabled ? 'ms-disabled' : ''}>
        <Col xs={12} sm={6}>
            <Message msgId="rulesmanager.access"/>
        </Col>
        <Col xs={12} sm={6}>
            <PagedCombo {...props}/>
        </Col>
    </Row>);

export default compose(
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
