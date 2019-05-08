 /**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

const React = require('react');
const PropTypes = require('prop-types');
require('react-widgets/lib/less/react-widgets.less');
const {DateTimePicker} = require('react-widgets');

const LocaleUtils = require('../../../../utils/LocaleUtils');
const {getDateTimeFormat} = require('../../../../utils/TimeUtils');
const AttributeFilter = require('./AttributeFilter');
const utcDateWrapper = require('../../../misc/enhancers/utcDateWrapper');
const UTCDateTimePicker = utcDateWrapper({
    dateProp: "value",
    dateTypeProp: "type",
    setDateProp: "onChange"
})(DateTimePicker);

class DateFilter extends AttributeFilter {
    static propTypes = {
        type: PropTypes.string,
        disabled: PropTypes.boolean,
        onChange: PropTypes.func
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
            return <span/>;
        }
        const placeholder = LocaleUtils.getMessageById(this.context.messages, this.props.placeholderMsgId) || "Insert date";
        const inputKey = 'header-filter-' + this.props.column.key;
        let val;
        // reset correctly the value; if it is null or startDate is null then reset
        if (this.props.value && this.props.value.startDate === null || !this.props.value) {
            val = null;
        } else {
            val = this.props.value && this.props.value.startDate || this.props.value;
        }
        const dateValue = this.props.value ? val : null;
        return (<UTCDateTimePicker
            key={inputKey}
            disabled={this.props.disabled}
            format={getDateTimeFormat(this.context.locale, this.props.type)}
            placeholder={placeholder}
            value={dateValue}
            type={this.props.type}
            time={this.props.type === 'date-time' || this.props.type === 'time'}
            calendar={this.props.type === 'date-time' || this.props.type === 'date'}
            onChange={date => this.handleChange(date)}/>);
    }
    handleChange = (value) => {
        this.props.onChange({value, attribute: this.props.column && this.props.column.name});
    }
}

module.exports = DateFilter;
