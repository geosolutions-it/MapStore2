import PropTypes from 'prop-types';
import AttributeEditor from "./AttributeEditor";
import React from "react";
import DateTimePicker from "../../../misc/datetimepicker";
import utcDateWrapper from "../../../misc/enhancers/utcDateWrapper";

import {getDateTimeFormat} from "../formatters";

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
        rowData: PropTypes.object,
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
        const {dataType, calendar, time, value, rowData} = this.props;
        return (<UTCDateTimePicker
            {...this.props}
            type={dataType}
            defaultValue={value}
            value={value}
            useUTCOffset={rowData?.useUTCOffset}
            onChange={this.onChange}
            calendar={calendar}
            time={time}
            onPopoverOpen={(open) => {
                this.setState({ open });
                if (!open) {
                    this.props.onBlur();
                }
            }}
            options={{
                shouldCalendarSetHours: false
            }}
            format={getDateTimeFormat(rowData?.dateFormats, dataType)}
        />);
    }
    // when we are using the popover we are using a portal
    // this makes the current editor component not contained inside the editor container
    // making this editor directly commit the value causing the issue https://github.com/geosolutions-it/MapStore2/issues/9959
    // here how the original library is checking relation between editor and editor container to trigger the blur event
    // https://github.com/adazzle/react-data-grid/blob/v5.0.4/packages/common/editors/EditorContainer.js#L292-L329
    // ---
    // Workaround:
    // we could take advantage of the unused validate method to solve this problem
    // in this way we prevent to commit the value while the popover is open
    // see https://github.com/adazzle/react-data-grid/blob/v5.0.4/packages/common/editors/EditorContainer.js#L245
    validate = () => {
        return !this.state.open;
    }
}
export default DateTimeEditor;
