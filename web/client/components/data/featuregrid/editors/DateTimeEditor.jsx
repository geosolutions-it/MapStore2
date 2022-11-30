import PropTypes from 'prop-types';
import AttributeEditor from "./AttributeEditor";
import React from "react";
import DateTimePicker from "../../../misc/datetimepicker";
import utcDateWrapper from "../../../misc/enhancers/utcDateWrapper";
import {dateFormats} from "../../../../utils/FeatureGridUtils";

/**
 * Date time picker enhanced with UTC and timezone offset
 * it takes the localized date in input and it translates to UTC
 * for the DateTimePicker tool
 */
const UTCDateTimePicker = utcDateWrapper({
    dateProp: "value",
    dateTypeProp: "dataType",
    setDateProp: "onChange"
})(DateTimePicker);

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
        onChange: PropTypes.func,
        onBlur: PropTypes.func
    };

    static contextTypes = {
        locale: PropTypes.string
    };

    static defaultProps = {
        dataType: "date-time",
        column: {},
        calendar: true,
        time: false,
        onChange: () => {},
        onBlur: () => {}
    };

    constructor() {
        super();
        this.state = {
            date: null
        };
    }
    componentDidMount() {
        this.date = this.props.value;
        this.props.onTemporaryChanges?.(true);
    }
    componentWillUnmount() {
        this.props.onTemporaryChanges?.(false);
    }
    onChange = (date) => {
        this.date = date;
    };

    getValue = () => {
        return {
            [this.props.column.key]: this.date
        };
    };

    render() {
        const {dataType, calendar, time} = this.props;
        const { value } = this.props;
        return (<UTCDateTimePicker
            {...this.props}
            type={dataType}
            defaultValue={value}
            value={value}
            onChange={this.onChange}
            calendar={calendar}
            time={time}
            options={{
                shouldCalendarSetHours: false
            }}
            format={dateFormats[dataType]}
        />);
    }
}
export default DateTimeEditor;
