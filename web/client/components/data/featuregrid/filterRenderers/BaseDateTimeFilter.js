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
import LocaleUtils from '../../../../utils/LocaleUtils';
import { getDateTimeFormat } from '../../../../utils/TimeUtils';
import AttributeFilter from './AttributeFilter';
import utcDateWrapper from '../../../misc/enhancers/utcDateWrapper';
import 'react-widgets/lib/less/react-widgets.less';

const UTCDateTimePicker = utcDateWrapper({
    dateProp: "value",
    dateTypeProp: "type",
    setDateProp: "onChange"
})(DateTimePicker);


class DateFilter extends AttributeFilter {
    static propTypes = {
        type: PropTypes.string,
        disabled: PropTypes.boolean,
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
        placeholderMsgId: "featuregrid.filter.placeholders.default"
    };
    renderInput = () => {
        if (this.props.column.filterable === false) {
            return <span />;
        }
        const format = getDateTimeFormat(this.context.locale, this.props.type);
        const placeholder = LocaleUtils.getMessageById(this.context.messages, this.props.placeholderMsgId) || "Insert date";
        const toolTip = this.props.intl && this.props.intl.formatMessage({id: `${this.props.tooltipMsgId}`}, {format}) || `Insert date in ${format} format`;

        const inputKey = 'header-filter-' + this.props.column.key;
        let val;
        // reset correctly the value; if it is null or startDate is null then reset
        if (this.props.value && this.props.value.startDate === null || !this.props.value) {
            val = null;
        } else {
            val = this.props.value && this.props.value.startDate || this.props.value;
        }
        const dateValue = this.props.value ? val : null;
        const operator = this.props.value && this.props.value.operator;
        return (<UTCDateTimePicker
            key={inputKey}
            disabled={this.props.disabled}
            format={format}
            placeholder={placeholder}
            value={dateValue}
            toolTip={toolTip}
            operator={operator}
            type={this.props.type}
            time={this.props.type === 'date-time' || this.props.type === 'time'}
            calendar={this.props.type === 'date-time' || this.props.type === 'date'}
            onChange={(date, stringDate) => this.handleChange(date, stringDate)}
        />);
    }
    handleChange = (value, stringValue) => {
        this.props.onChange({ value, stringValue, attribute: this.props.column && this.props.column.name });
    }
}

export default getContext({
    intl: intlShape
})(DateFilter);
