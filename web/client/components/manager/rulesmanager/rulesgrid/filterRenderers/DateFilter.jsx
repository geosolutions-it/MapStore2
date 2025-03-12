/**
* Copyright 2025, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import { compose, defaultProps, withHandlers } from 'recompose';
import localizedProps from '../../../../misc/enhancers/localizedProps';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { filterSelector } from '../../../../../selectors/rulesmanager';
import { error } from '../../../../../actions/notifications';
import { FormGroup, Tooltip } from 'react-bootstrap';
import OverlayTrigger from '../../../../misc/OverlayTrigger';
import DateTimePicker from '../../../../misc/datetimepicker';
import moment from 'moment';
const selector = createSelector(filterSelector, (filter) => ({
    selected: filter.date,
    anyFieldVal: filter.dateAny
}));

const DateFilter = (props) => {
    const {disabled, onReset, label: l, clearable = true, onFilterChange, selected: selectedValue, onChange } = props;
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
    return (
        <div className={`autocompleteField date-filter ${props.anyFilterRuleMode ? 'd-flex' : ''}`}>
            {label}
            {clearable ? (
                <div className={`input-clearable ${disabled && 'disabled' || ''}`}>
                    <FormGroup style={{margin: 0}} className="rw-widget">
                        <DateTimePicker
                            value={selectedValue}
                            time={false}
                            onChange={(value) => {
                                onChange({column: {key: "date"}, filterTerm: parseDate(value)});
                            }}
                        />
                    </FormGroup>
                    <span className={`clear-btn ${!selectedValue && 'hidden' || ''}`} onClick={()=>{
                        if (props.anyFilterRuleMode) {
                            // reset the checkbox as well
                            onFilterChange({column: {key: "date"}, filterTerm: undefined, isResetField: true});
                        } else {
                            onReset();
                        }
                    }}>x</span>
                </div>) :
                <FormGroup style={{margin: 0}} className="rw-widget">
                    <DateTimePicker
                        value={selectedValue}
                        time={false}
                        onChange={(value) => {
                            onChange({column: {key: "date"}, filterTerm: parseDate(value)});
                        }}
                    />
                </FormGroup>
            }
            { props.anyFilterRuleMode ?
                <>
                    &nbsp;
                    <div className="checkbox-any-field">
                        {renderTooltipCheckbox()}
                    </div>
                </> : null}
        </div>);
};
export default compose(
    connect(selector, {onError: error}),
    defaultProps({
        textField: "date",
        valueField: "date",
        parentsFilter: {},
        filter: false,
        unCheckedAnyField: "rulesmanager.tooltip.filterRuleList",
        checkedAnyField: "rulesmanager.tooltip.showAllRules",
        anyFilterRuleMode: 'dateAny'
    }),
    withHandlers({
        onChangeHeaderFilter: ({column = {}, onFilterChange = () => {}}) => filterTerm => {
            onFilterChange({column, filterTerm});
        }
    }),
    localizedProps(["checkedAnyField", "unCheckedAnyField"])
)(DateFilter);
