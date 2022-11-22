import PropTypes from 'prop-types';
import AttributeEditor from "./AttributeEditor";
import React from "react";
import DateTimePicker from "../../../misc/datetimepicker";
import utcDateWrapper from "../../../misc/enhancers/utcDateWrapper";
import moment from "moment";
import {dateFormats} from "../../../../utils/FeatureGridUtils";

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
        shouldCalendarSetHours: false,
        min: new Date(1500, 0, 1),
        max: new Date(2099, 0, 1)
    };

    constructor() {
        super();
        this.state = {
            date: null
        };
    }

    componentDidMount() {
        const {dataType, value} = this.props;
        this.props.onTemporaryChanges?.(true);
        const convertedDate = moment.utc(value, dateFormats[dataType]);
        if (value) {
            this.setState({ date: convertedDate.isValid() ? convertedDate.toDate() : null});
        }
    }

    componentDidUpdate(prevProps) {
        const { value: prevValue, dataType: prevDataType } = prevProps;
        const { value, dataType } = this.props;

        if (prevValue !== value || prevDataType !== dataType) {
            const convertedDate = moment.utc(value, dateFormats[dataType]);
            this.setState({ date: convertedDate.isValid() ? convertedDate.toDate() : null});
        }
    }

    componentWillUnmount() {
        this.props.onTemporaryChanges?.(false);
    }

    render() {
        const {shouldCalendarSetHours, dataType, calendar, time} = this.props;
        const { date } = this.state;
        return (<UTCDateTimePicker
            {...this.props}
            type={dataType}
            defaultValue={date}
            value={date}
            calendar={calendar}
            time={time}
            format={dateFormats[dataType]}
            options={{
                shouldCalendarSetHours
            }}
        />);
    }
}
export default DateTimeEditor;
