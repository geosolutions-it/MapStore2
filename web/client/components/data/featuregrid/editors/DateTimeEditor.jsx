import PropTypes from 'prop-types';
import AttributeEditor from "./AttributeEditor";
import React from "react";
import DateTimePicker from "../../../misc/datetimepicker";
import utcDateWrapper from "../../../misc/enhancers/utcDateWrapper";
import moment from "moment";

/**
 * Date time picker enhanced with UTC and timezone offset
 * it takes the localized date in input and it translates to UTC
 * for the DateTimePicker tool
 */
const UTCDateTimePicker = utcDateWrapper({
    dateProp: "value",
    dateTypeProp: "dataType",
    setDateProp: "onBlur"
})(DateTimePicker);

const formats = {
    'date-time': 'YYYY-MM-DDTHH:mm:ss[Z]',
    'time': 'HH:mm:ss',
    'date': 'YYYY-MM-DD[Z]'
};

/**
 * date, date-time, time editor for FeatureGrid
 *
 * @name DateTimeEditor
 * @memberof components.data.featuregrid.editors
 * @type {Object}
 */
class DateTimeEditor extends AttributeEditor {
    static propTypes = {
        value: PropTypes.string,
        inputProps: PropTypes.object,
        dataType: PropTypes.string,
        minValue: PropTypes.number,
        maxValue: PropTypes.number,
        column: PropTypes.object,
        onTemporaryChanges: PropTypes.func,
        calendar: PropTypes.bool,
        time: PropTypes.bool,
        shouldCalendarSetHours: PropTypes.bool
    };

    static contextTypes = {
        locale: PropTypes.string
    };

    static defaultProps = {
        dataType: "date-time",
        column: {},
        calendar: true,
        time: false,
        shouldCalendarSetHours: false
    };

    componentDidMount() {
        this.props.onTemporaryChanges?.(true);
    }
    componentWillUnmount() {
        this.props.onTemporaryChanges?.(false);
    }

    render() {
        const {shouldCalendarSetHours, dataType, value, calendar, time} = this.props;
        const date = moment.utc(value, formats[dataType]).toDate();
        return (<UTCDateTimePicker
            {...this.props}
            type={dataType}
            defaultValue={date}
            value={date}
            calendar={calendar}
            time={time}
            format={formats[dataType]}
            options={{
                shouldCalendarSetHours
            }}
        />);
    }
}
export default DateTimeEditor;
