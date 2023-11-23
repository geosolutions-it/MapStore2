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
        operator: PropTypes.string,
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
        operator: "=",
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
            operator: this.props.isWithinAttrTbl ? "=" : ""
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
        if (['date', 'time', 'date-time'].includes(this.props.type)) isValueExist = this.state?.value ?? this.props.value?.startDate ?? this.props.value;
        let isNullOperator = this.state.operator === 'isNull';
        return (<div className="rw-widget">
            <input
                disabled={this.props.disabled || isNullOperator}
                key={inputKey}
                type="text"
                className="form-control input-sm"
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
                style={{ width: '30%'}}
                // dropUp={this.props.dropUp}
                fieldOptions= {this.getOperator(this.props.type)}
                fieldName="operator"
                fieldRowId={1}
                onSelect={(selectedOperator)=>{
                    if (selectedOperator === this.state.operator) return;
                    let isValueExist = this.state?.value ?? this.props.value;
                    if (['date', 'time', 'date-time'].includes(this.props.type)) isValueExist = this.state?.value ?? this.props.value?.startDate ?? this.props.value;
                    this.setState({ operator: selectedOperator, value: selectedOperator === 'isNull' ? undefined : isValueExist });
                    let isNullOperatorSelected = selectedOperator === 'isNull';
                    let isOperatorChangedFromIsNullAndValueNotExist = this.state.operator === 'isNull' && this.state.operator !== selectedOperator && !isValueExist;
                    if (isValueExist || isNullOperatorSelected || isOperatorChangedFromIsNullAndValueNotExist ) this.props.onChange({value: isNullOperatorSelected ? null : isValueExist, attribute: this.props.column && this.props.column.key, inputOperator: selectedOperator});
                }}
                fieldValue={this.state.operator}
                onUpdateField={() => {}}/>
        );
    };
    render() {
        let inputKey = 'header-filter--' + this.props.column.key;
        return (
            <div key={inputKey} className={`form-group${(this.props.valid ? "" : " has-error")}`}>
                {this.props.isWithinAttrTbl ? this.renderOperatorField() : null}
                {this.renderTooltip(this.renderInput())}
            </div>
        );
    }
    handleChange = (e) => {
        const value = e.target.value;
        this.setState({value});
        this.props.onChange({value, attribute: this.props.column && this.props.column.key, inputOperator: this.state.operator});
    }
}

export default AttributeFilter;
