/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import React from 'react';

import PropTypes from 'prop-types';
import { getMessageById } from '../../../../utils/LocaleUtils';
import { Tooltip } from 'react-bootstrap';
import OverlayTrigger from '../../../misc/OverlayTrigger';
import ComboField from '../../query/ComboField';

class AttributeFilter extends React.PureComponent {
    static propTypes = {
        valid: PropTypes.bool,
        disabled: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
        value: PropTypes.any,
        column: PropTypes.object,
        placeholderMsgId: PropTypes.string,
        tooltipMsgId: PropTypes.string,
        defaultOperator: PropTypes.string,
        type: PropTypes.string,
        isWithinAttrTbl: PropTypes.bool
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        value: '',
        valid: true,
        onChange: () => {},
        column: {},
        placeholderMsgId: "featuregrid.filter.placeholders.default",
        defaultOperator: "=",
        isWithinAttrTbl: false
    };
    constructor(props) {
        super(props);
        this.state = {
            listOperators: ["="],
            stringOperators: ["=", "<>", "like", "ilike", "isNull"],
            arrayOperators: ["contains"],
            booleanOperators: ["="],
            defaultOperators: ["=", ">", "<", ">=", "<=", "<>", "isNull"],
            timeDateOperators: ["=", ">", "<", ">=", "<=", "<>", "><", "isNull"],
            operator: this.props.isWithinAttrTbl ? (this.props.defaultOperator) : "",
            isInputValid: true
        };
    }
    getOperator = (type) => {
        switch (type) {
        case "list": {
            return this.state.listOperators;
        }
        case "string": {
            return this.state.stringOperators;
        }
        case "boolean": {
            return this.state.booleanOperators;
        }
        case "array": {
            return this.state.arrayOperators;
        }
        case "date":
        case "time":
        case "date-time":
        {
            return this.state.timeDateOperators;
        }
        default:
            return this.state.defaultOperators;
        }
    };
    renderInput = () => {
        if (this.props.column.filterable === false) {
            return <span/>;
        }
        const placeholder = getMessageById(this.context.messages, this.props.placeholderMsgId) || "Search";
        let inputKey = 'header-filter-' + this.props.column.key;
        let isValueExist = this.state?.value ?? this.props.value;
        if (this.isDateTimeField() && this.props.isWithinAttrTbl) isValueExist = this.state?.value ?? this.props.value?.startDate ?? this.props.value;
        let isNullOperator = this.state.operator === 'isNull';
        return (<div className={`rw-widget ${this.state.isInputValid ? "" : "show-error"}`}>
            <input
                disabled={this.props.disabled || isNullOperator}
                key={inputKey}
                type="text"
                className={"form-control input-sm"}
                placeholder={placeholder}
                value={isValueExist}
                onChange={this.handleChange}/>
        </div>);
    }
    renderTooltip = (cmp) => {
        if (this.props.tooltipMsgId && getMessageById(this.context.messages, this.props.tooltipMsgId)) {
            return (<OverlayTrigger placement="top" overlay={<Tooltip id="tooltip">{getMessageById(this.context.messages, this.props.tooltipMsgId)}</Tooltip>}>
                {cmp}
            </OverlayTrigger>);
        }
        return cmp;
    }
    renderOperatorField = () => {
        return (
            <ComboField
                style={{ width: 90 }}
                fieldOptions= {this.getOperator(this.props.type)}
                fieldName="operator"
                fieldRowId={1}
                disabled={this.props.disabled}
                onSelect={(selectedOperator)=>{
                    // if select the same operator -> don't do anything
                    if (selectedOperator === this.state.operator) return;
                    let isValueExist;           // entered value
                    if (this.isDateTimeField()) {
                        isValueExist = this.state?.value ?? this.props.value?.startDate ?? this.props.value;
                    } else {
                        isValueExist = this.state?.value ?? this.props.value;
                    }
                    let isNullOperatorSelected = selectedOperator === 'isNull';
                    let isOperatorChangedFromRange = this.state.operator === '><';
                    // set the selected operator + value and reset the value in case of isNull
                    this.setState({ operator: selectedOperator, value: (isNullOperatorSelected || isOperatorChangedFromRange) ? undefined : isValueExist });
                    // get flag of being (operator was isNull then changes to other operator)
                    let isOperatorChangedFromIsNull = this.state.operator === 'isNull' && selectedOperator !== 'isNull';
                    // apply filter if value exists 'OR' operator = isNull 'OR' (prev operator was isNull and changes --> reset filter)
                    if (isNullOperatorSelected || isOperatorChangedFromIsNull || isOperatorChangedFromRange) {
                        // reset data --> operator = isNull 'OR' (prev operator was isNull and changes)
                        this.props.onChange({value: null, attribute: this.props.column && this.props.column.key, inputOperator: selectedOperator});
                    } else if (isValueExist) {
                        // apply filter --> if value exists
                        this.props.onChange({value: isValueExist, attribute: this.props.column && this.props.column.key, inputOperator: selectedOperator});
                    }
                }}
                fieldValue={this.state.operator}
                onUpdateField={() => {}}/>
        );
    };
    render() {
        let inputKey = 'header-filter--' + this.props.column.key;
        return (
            <div key={inputKey} className={`form-group${((this.state.isInputValid && this.props.valid) ? "" : " has-error")}`}>
                {this.props.isWithinAttrTbl ? <>
                    {this.renderOperatorField()}
                    {this.isDateTimeField() ? this.renderInput() : this.renderTooltip(this.renderInput())}
                </> : this.renderTooltip(this.renderInput())}
            </div>
        );
    }
    isDateTimeField = () => {
        return ['date', 'time', 'date-time'].includes(this.props.type);
    }
    handleChange = (e) => {
        const value = e.target.value;
        // todo: validate input based on type
        let isValid = true;
        if (this.props.isWithinAttrTbl) {
            const match = /\s*(!==|!=|<>|<=|>=|===|==|=|<|>)?(.*)/.exec(value);
            if (match[1]) isValid = false;
            if (match[2]) {
                if (['integer', 'number'].includes(this.props.type) && isNaN(match[2])) isValid = false;
            }
        }
        this.setState({value, isInputValid: isValid});
        if (isValid) {
            this.props.onChange({value, attribute: this.props.column && this.props.column.key, inputOperator: this.state.operator});
        }
    }
}

export default AttributeFilter;
