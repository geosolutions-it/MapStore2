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
import { compose, defaultProps, withHandlers, withPropsOnChange } from 'recompose';
import {createSelector} from "reselect";

import {servicesConfigSel} from "../../../../../selectors/rulesmanager";
import Message from '../../../../I18N/Message';
import PagedCombo from '../../../../misc/combobox/PagedCombobox';
import localizedProps from "../../../../misc/enhancers/localizedProps";
import fixedOptions from "../../enhancers/fixedOptions";
const selector = createSelector(servicesConfigSel, services => ({
    services
}));

const RequestSelector = (props) => (
    <Row className={props.disabled ? 'ms-disabled' : ''}>
        <Col xs={12} sm={6}>
            <Message msgId="rulesmanager.request"/>
        </Col>
        <Col xs={12} sm={6}>
            <PagedCombo {...props}/>
        </Col>
    </Row>);

export default compose(
    connect(selector),
    defaultProps({
        size: 5,
        emitOnReset: true,
        textField: "label",
        valueField: "value",
        parentsFilter: {},
        filter: "startsWith",
        placeholder: "rulesmanager.placeholders.request",
        services: {
            "WFS": [
                "DescribeFeatureType",
                "GetCapabilities",
                "GetFeature",
                "GetFeatureWithLock",
                "LockFeature",
                "Transaction"
            ],
            "WMS": [
                "DescribeLayer",
                "GetCapabilities",
                "GetFeatureInfo",
                "GetLegendGraphic",
                "GetMap",
                "GetStyles"
            ]
        }
    }),
    withPropsOnChange(["service", "services"], ({services = {}, service}) => {
        return {
            data: service && (services[service] || []).map(req => ({label: req, value: req.toUpperCase()})),
            parentsFilter: {service},
            disabled: !service
        };
    }),
    withHandlers({
        onValueSelected: ({setOption = () => {}}) => filterTerm => {
            setOption({key: "request", value: filterTerm});
        }
    }),
    localizedProps(["placeholder"]),
    fixedOptions
)(RequestSelector);
