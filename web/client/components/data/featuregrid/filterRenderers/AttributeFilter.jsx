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
        isShownOperators: PropTypes.bool
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
        isShownOperators: false
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
            operator: this.props.operator || "="
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
        return (<div className="rw-widget">
            <input
                disabled={this.props.disabled || this.state.operator === 'isNull'}
                key={inputKey}
                type="text"
                className="form-control input-sm"
                placeholder={placeholder}
                value={this.state?.value ?? this.props.value}
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
                    this.setState({ operator: selectedOperator, value: selectedOperator === 'isNull' ? undefined : this.state?.value ?? this.props.value });
                    let isNullOperatorSelected = selectedOperator === 'isNull';
                    let isValueExist = this.state?.value ?? this.props.value;
                    let isOperatorChangedFromIsNullAndValueNotExist = this.state.operator === 'isNull' && this.state.operator !== selectedOperator && !isValueExist;
                    if (isValueExist || isNullOperatorSelected || isOperatorChangedFromIsNullAndValueNotExist ) this.props.onChange({value: this.state?.value ?? this.props.value, attribute: this.props.column && this.props.column.key, inputOperator: selectedOperator});
                }}
                fieldValue={this.state.operator}
                onUpdateField={this.updateFieldElement}/>
        );
    };
    render() {
        let inputKey = 'header-filter--' + this.props.column.key;
        return (
            <div key={inputKey} className={`form-group${(this.props.valid ? "" : " has-error")}`}>
                {this.props.isShownOperators ? this.renderOperatorField() : null}
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
