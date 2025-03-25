/**
* Copyright 2025, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from "react";
import {Col, ControlLabel, FormGroup, Row} from 'react-bootstrap';
import {connect} from "react-redux";
import { compose, defaultProps, getContext, withHandlers } from 'recompose';
import moment from "moment";
import { intlShape } from "react-intl";

import {error} from '../../../../../actions/notifications';
import Message from '../../../../I18N/Message';
import localizedProps from "../../../../misc/enhancers/localizedProps";
import DateTimePicker from "../../../../misc/datetimepicker";

const ValidityPeriodSelector = (props) => {
    const toolTip = props.intl && props.intl.formatMessage({id: `${props.dateTooltip}`}, {format: "DD/MM/YYYY"}) || `Insert date in ${'DD/MM/YYYY'} format`;

    return (
        <Row className={props.disabled ? 'ms-disabled' : ''}>
            <Col xs={12} sm={6}>
                <Message msgId="rulesmanager.validityPeriod.title"/>
            </Col>
            <Col xs={12} sm={6}>
                <FormGroup className="flex-center">
                    <ControlLabel className="validity-period-sublabel"><Message msgId="rulesmanager.validityPeriod.start" /></ControlLabel>
                    <DateTimePicker {...props} toolTip={toolTip} format={"DD/MM/YYYY"} time={false} onChange={props.onValueStartDateSelected} value={props.selectedStart ? new Date(props.selectedStart) : props.selectedStart} />
                </FormGroup>
                <FormGroup className="flex-center">
                    <ControlLabel className="validity-period-sublabel"><Message msgId="rulesmanager.validityPeriod.end" /></ControlLabel>
                    <DateTimePicker {...props} toolTip={toolTip} format={"DD/MM/YYYY"} time={false} onChange={props.onValueEndDateSelected} value={props.selectedEnd ? new Date(props.selectedEnd) : props.selectedEnd} />
                </FormGroup>
            </Col>
        </Row>);
};
const ValidityPeriodWithContext = getContext({
    intl: intlShape
})(ValidityPeriodSelector);
export default compose(
    connect(() => ({}), {onError: error}),
    defaultProps({
        textField: "validityPeriod",
        valueField: "validityPeriod",
        parentsFilter: {},
        filter: false,
        placeholder: "rulesmanager.placeholders.validityPeriod",
        dateTooltip: "rulesmanager.tooltip.date",
        loadingErrorMsg: {
            title: "rulesmanager.errorTitle",
            message: "rulesmanager.errorLoadingRoles"
        }
    }),
    withHandlers({
        onValueStartDateSelected: ({setOption = () => {}}) => filterTerm => {
            setOption({key: "validafter", value: filterTerm ? moment(filterTerm).format('YYYY-MM-DD') : null});
        },
        onValueEndDateSelected: ({setOption = () => {}}) => filterTerm => {
            setOption({key: "validbefore", value: filterTerm ? moment(filterTerm).format('YYYY-MM-DD') : null});
        }
    }),
    localizedProps(["placeholder", "loadingErroMsg"])
)(ValidityPeriodWithContext);
