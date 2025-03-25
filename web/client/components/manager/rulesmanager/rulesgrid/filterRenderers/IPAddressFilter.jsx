/**
* Copyright 2025, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import React, { useState } from 'react';
import { compose, defaultProps, withHandlers } from 'recompose';
import localizedProps from '../../../../misc/enhancers/localizedProps';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { filterSelector } from '../../../../../selectors/rulesmanager';
import { error } from '../../../../../actions/notifications';
import { FormGroup, Tooltip } from 'react-bootstrap';
import OverlayTrigger from '../../../../misc/OverlayTrigger';
import { checkIpV4Range } from '../../../../../utils/RulesEditorUtils';
import DebouncedFormControl from '../../../../misc/DebouncedFormControl';
const selector = createSelector(filterSelector, (filter) => ({
    selected: filter.ipAddress,
    anyFieldVal: filter.ipAddressAny
}));

const IPAddressFilter = (props) => {
    const [ipAddressRangeValid, setIpAddressRangeValid] = useState(false);
    const {disabled, onReset, label: l, clearable = true, onFilterChange, placeholder, selected: selectedValue, onChange } = props;
    let label = l ? (<label>{l}</label>) :  null;
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
    const setIpAddressRangeValidHandler = (selectedVal) => {
        if (selectedVal && selectedVal.length > 0) {
            return selectedVal.match(checkIpV4Range) && "success" || "error";
        }
        return null;
    };
    return (
        <div className={`autocompleteField ${props.anyFilterRuleMode ? 'd-flex' : ''}`}>
            {label}
            {clearable ? (
                <div className={`input-clearable ${disabled && 'disabled' || ''}`}>
                    <FormGroup style={{margin: 0}} validationState={ipAddressRangeValid} className="rw-widget">
                        <DebouncedFormControl
                            type="text"
                            className={"form-control input-sm"}
                            value={selectedValue || ""}
                            placeholder={placeholder}
                            onChange={(value) => {
                                const isValid = setIpAddressRangeValidHandler(value);
                                setIpAddressRangeValid(isValid);
                                if (isValid !== 'error') {
                                    onChange({column: {key: "ipAddress"}, filterTerm: value});
                                }
                            }}
                        />
                    </FormGroup>
                    <span className={`clear-btn ${!selectedValue && 'hidden' || ''}`} onClick={()=>{
                        if (props.anyFilterRuleMode) {
                            // reset the checkbox as well
                            onFilterChange({column: {key: "ipAddress"}, filterTerm: undefined, isResetField: true});
                        } else {
                            onReset();
                        }
                    }}>x</span>
                </div>) :
                <FormGroup style={{margin: 0}} validationState={ipAddressRangeValid} className="rw-widget">
                    <DebouncedFormControl
                        type="text"
                        className={"form-control input-sm"}
                        value={selectedValue || ""}
                        placeholder={placeholder}
                        onChange={(value) => {
                            const isValid = setIpAddressRangeValidHandler(value);
                            setIpAddressRangeValid(isValid);
                            if (isValid !== 'error') {
                                onChange({column: {key: "ipAddress"}, filterTerm: value});
                            }
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
        size: 5,
        textField: "ipAddress",
        valueField: "ipAddress",
        parentsFilter: {},
        filter: false,
        placeholder: "rulesmanager.placeholders.ipRange",
        unCheckedAnyField: "rulesmanager.tooltip.filterRuleList",
        checkedAnyField: "rulesmanager.tooltip.showAllRules",
        anyFilterRuleMode: 'ipAddressAny'
    }),
    withHandlers({
        onChangeHeaderFilter: ({column = {}, onFilterChange = () => {}}) => filterTerm => {
            onFilterChange({column, filterTerm});
        }
    }),
    localizedProps(["placeholder", "checkedAnyField", "unCheckedAnyField"])
)(IPAddressFilter);
