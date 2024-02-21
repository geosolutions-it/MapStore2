/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {intlShape} from 'react-intl';
import {getContext} from 'recompose';
import DateTimePicker from '../../../misc/datetimepicker';
import RangedDateTimePicker  from '../../../misc/datetimepicker/RangedDateTimePicker';
import {getMessageById} from '../../../../utils/LocaleUtils';
import { getDateTimeFormat } from '../../../../utils/TimeUtils';
import AttributeFilter from './AttributeFilter';
import utcDateWrapper from '../../../misc/enhancers/utcDateWrapper';

const UTCDateTimePicker = utcDateWrapper({
    dateProp: "value",
    dateTypeProp: "type",
    setDateProp: "onChange"
})(DateTimePicker);

const UTCDateTimePickerWithRange = utcDateWrapper({
    dateProp: "value",
    dateTypeProp: "type",
    setDateProp: "onChange"
})(RangedDateTimePicker );


export class DateFilter extends AttributeFilter {
    static propTypes = {
        type: PropTypes.string,
        disabled: PropTypes.bool,
        onChange: PropTypes.func,
        intl: intlShape
    };
    static contextTypes = {
        messages: PropTypes.object,
        locale: PropTypes.string
    };
    static defaultProps = {
        value: null,
        type: "date-time",
        column: {},
        placeholderMsgId: "featuregrid.filter.placeholders.default",
        onChange: () => {}
    };
    renderInput = () => {
        if (this.props.column.filterable === false) {
            return <span />;
        }
        const operator = this.props.value && this.props.value.operator || this.state.operator;
        const format = getDateTimeFormat(this.context.locale, this.props.type);
        const placeholder = getMessageById(this.context.messages, this.props.placeholderMsgId) || "Insert date";
        const toolTip = this.props.intl && this.props.tooltipMsgId
            ? this.props.intl.formatMessage({id: `${this.props.tooltipMsgId}`}, {format})
            : `Insert date in ${format} format`;

        const inputKey = 'header-filter-' + this.props.column.key;
        let val;
        // reset correctly the value; if it is null or startDate is null then reset
        if (this.props.value && this.props.value.startDate === null || !this.props.value) {
            val = null;
        } else {
            val = this.props.value && this.props.value.startDate || this.props.value;
        }
        const dateValue = this.props.value ? val : null;
        if (operator === '><') {
            return (
                <UTCDateTimePickerWithRange
                    isWithinAttrTbl={this.props.isWithinAttrTbl}
                    key={inputKey}
                    disabled={this.props.disabled}
                    format={format}
                    placeholder={placeholder}
                    value={dateValue}
                    toolTip={toolTip}
                    popupPosition={'top'}     // popover open direction
                    operator={operator}
                    type={this.props.type}
                    time={this.props.type === 'time'}
                    calendar={this.props.type === 'date-time' || this.props.type === 'date'}
                    onChange={(date, stringDate, order) => this.handleChangeRangeFilter(date, stringDate, order)}
                />
            );
        }
        return (<UTCDateTimePicker
            isWithinAttrTbl={this.props.isWithinAttrTbl}
            key={inputKey}
            disabled={this.props.disabled}
            format={format}
            placeholder={placeholder}
            value={dateValue}
            toolTip={toolTip}
            operator={operator}
            type={this.props.type}
            popupPosition={'top'} // popover open direction
            time={this.props.type === 'date-time' || this.props.type === 'time'}
            calendar={this.props.type === 'date-time' || this.props.type === 'date'}
            onChange={(date, stringDate) => this.handleChange(date, stringDate)}
        />);
    }
    handleChange = (value, stringValue) => {
        this.props.onChange({ value, stringValue, attribute: this.props.column && this.props.column.name, inputOperator: this.state.operator || this.props.operator });
    }
    handleChangeRangeFilter = (value, stringValue, order = 'start') => {
        let reqVal = {};
        if (order === 'end') {
            reqVal = {
                startDate: this.props.value?.startDate,
                endDate: value
            };
        } else {
            reqVal = {
                startDate: value,
                endDate: this.props.value?.endDate
            };
        }
        this.props.onChange({ value: reqVal, stringValue, attribute: this.props.column && this.props.column.name, inputOperator: this.state.operator || this.props.operator });
    }
}

export default getContext({
    intl: intlShape
})(DateFilter);
