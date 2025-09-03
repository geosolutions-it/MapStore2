/**
* Copyright 2025, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import moment from 'moment';
import { intlShape } from 'react-intl';
import { compose, defaultProps, getContext, withHandlers } from 'recompose';
import localizedProps from '../../../../misc/enhancers/localizedProps';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { filterSelector } from '../../../../../selectors/rulesmanager';
import { error } from '../../../../../actions/notifications';
import { FormGroup, Tooltip } from 'react-bootstrap';
import OverlayTrigger from '../../../../misc/OverlayTrigger';
import DateTimePicker from '../../../../misc/datetimepicker';
const selector = createSelector(filterSelector, (filter) => ({
    selected: filter.date,
    anyFieldVal: filter.dateAny
}));

const DateFilter = (props) => {
    const {label: l, onFilterChange, selected: selectedValue, onChange } = props;
    let label = l ? (<label>{l}</label>) : null;
    const renderTooltipCheckbox = () => {
        const { anyFieldVal } = props;

        let checkboxInput = (
            <input onChange={(evt)=>{
                onFilterChange({column: {key: evt.target.name}, filterTerm: !evt.target.checked});
            }} type="checkbox" checked={!!(typeof anyFieldVal === 'boolean' && !anyFieldVal)}
            name={props.anyFilterRuleMode} />
        );
        const tooltip = (<Tooltip id={props?.tooltip?.id + anyFieldVal ? "checked" : "unchecked"}>
            { !!(typeof anyFieldVal === 'boolean' && !anyFieldVal) ? props?.checkedAnyField : props?.unCheckedAnyField }</Tooltip>);
        return (<OverlayTrigger key={props?.tooltip?.overlayTriggerKey} placement={props?.tooltip?.placement} overlay={tooltip}>
            { checkboxInput }
        </OverlayTrigger>);
    };
    function parseDate(value) {
        const format = 'YYYY-MM-DD';
        const date = moment(value);
        if (date.isValid()) {
            return `${date.format(format)}`;
        }
        return null;
    }
    const toolTip = props.intl && props.intl.formatMessage({id: `${props.dateFilterTooltip}`}, {format: "DD/MM/YYYY"}) || `Insert date in ${'DD/MM/YYYY'} format`;
    return (
        <div className={`autocompleteField date-filter ${props.anyFilterRuleMode ? 'd-flex' : ''}`}>
            {label}
            <FormGroup style={{margin: 0}} className="rw-widget">
                <DateTimePicker
                    value={selectedValue}
                    format={"DD/MM/YYYY"}
                    time={false}
                    toolTip={toolTip}
                    onChange={(value) => {
                        onChange({column: {key: "date"}, filterTerm: value ? parseDate(value) : undefined});
                    }}
                />
            </FormGroup>
            { props.anyFilterRuleMode ?
                <>
                    &nbsp;
                    <div className="checkbox-any-field">
                        {renderTooltipCheckbox()}
                    </div>
                </> : null}
        </div>);
};
const DateFilterCompWithContext = getContext({
    intl: intlShape
})(DateFilter);

export default compose(
    connect(selector, {onError: error}),
    defaultProps({
        textField: "date",
        valueField: "date",
        parentsFilter: {},
        filter: false,
        unCheckedAnyField: "rulesmanager.tooltip.filterRuleList",
        checkedAnyField: "rulesmanager.tooltip.showAllRules",
        dateFilterTooltip: "rulesmanager.tooltip.date",
        anyFilterRuleMode: 'dateAny'
    }),
    withHandlers({
        onChangeHeaderFilter: ({column = {}, onFilterChange = () => {}}) => filterTerm => {
            onFilterChange({column, filterTerm});
        }
    }),
    localizedProps(["checkedAnyField", "unCheckedAnyField"])
)(DateFilterCompWithContext);
