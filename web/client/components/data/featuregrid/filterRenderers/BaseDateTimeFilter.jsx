 /**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

const React = require('react');
const PropTypes = require('prop-types');
const LocaleUtils = require('../../../../utils/LocaleUtils');

require('react-widgets/lib/less/react-widgets.less');

const {DateTimePicker} = require('react-widgets');

const AttributeFilter = require('./AttributeFilter');

class DateFilter extends AttributeFilter {
    static defaultProps = {
        value: null,
        type: "datetime",
        column: {},
        placeholderMsgId: "featuregrid.filter.placeholders.default"
    };
    static propTypes = {
        type: PropTypes.string,
        disabled: PropTypes.boolean,
        onChange: PropTypes.func
    };
    static contextTypes = {
        locale: PropTypes.string
    };
    getDateValue = (val) => {
        if (this.props.type === "time" && val) {
            return new Date(`1970-01-01T${val}`);
        } else if (this.props.type === "date" && val) {
            let dateParts = val.split("Z");
            if (dateParts.length > 1) {
                return new Date(`${dateParts[0]}T00:00:00Z`);
            }
            return new Date(`${dateParts[0]}T00:00:00`);
        } else if (val) {
            return new Date(val);
        }
        return null;
    }
    getFormat = () => {
        const dateFormat = LocaleUtils.getDateFormat(this.context.locale);
        const timeFormat = "HH:MM:SS";
        switch (this.props.type) {
            case "time":
                return timeFormat;
            case "date":
                return dateFormat;
            default:
                return dateFormat + " " + timeFormat;

        }
    }
    renderInput = () => {
        if (this.props.column.filterable === false) {
            return <span/>;
        }
        const placeholder = LocaleUtils.getMessageById(this.context.messages, this.props.placeholderMsgId) || "Insert date";
        let inputKey = 'header-filter-' + this.props.column.key;
        const val = this.props.value && this.props.value.startDate || this.props.value;
        const dateValue = this.props.value ? this.getDateValue(val) : null;
        return (<DateTimePicker
            key={inputKey}
            disabled={this.props.disabled}
            format={this.getFormat()}
            placeholder={placeholder}
            value={dateValue}
            time={this.props.type === 'date-time' || this.props.type === 'time'}
            calendar={this.props.type === 'date-time' || this.props.type === 'date'}
            format={this.props.dateFormat}
            onChange={(date, stringDate) => this.handleChange(date, stringDate)}/>);
    }
    handleChange = (date, stringDate) => {
        var tzoffset = (new Date()).getTimezoneOffset() * 60000; // offset in milliseconds
        let value = (date && date.toISOString) ? (date).toISOString() : stringDate;
        switch (this.props.type) {
            case "date":
                value = (date && date.toISOString) ? (new Date(date.getTime() - tzoffset)).toISOString() : stringDate;
                if (value) {
                    value = value.split("T")[0] + "Z";
                }
                break;
            case "time":
                if (value) {
                    value = value.split("T")[1];
                }
                break;
            default:
        }


        this.props.onChange({value, attribute: this.props.column && this.props.column.name});
    }
}

module.exports = DateFilter;
