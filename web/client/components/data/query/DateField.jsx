/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const moment = require('moment');
const momentLocalizer = require('react-widgets/lib/localizers/moment');
momentLocalizer(moment);
const utcDateWrapper = require('../../misc/enhancers/utcDateWrapper').default;
const Message = require('../../I18N/Message');
const {getDateTimeFormat} = require('../../../utils/TimeUtils');
const {DateTimePicker} = require('react-widgets');

/**
 * Date time picker enhanced with UTC and timezone offset
 * it takes the localized date in input and it translates to UTC
 * for the DateTimePicker tool
*/
const UTCDateTimePicker = utcDateWrapper({
    dateProp: "value",
    dateTypeProp: "type",
    setDateProp: "onChange"
})(DateTimePicker);

require('react-widgets/lib/less/react-widgets.less');

/**
 * This enhanced Component is used for supporting "date", "time" or "date-time" attribute types
*/
class DateField extends React.Component {
    static propTypes = {
        attType: PropTypes.string,
        dateEnabled: PropTypes.bool,
        fieldName: PropTypes.string,
        fieldRowId: PropTypes.number,
        fieldValue: PropTypes.object,
        fieldException: PropTypes.string,
        operator: PropTypes.string,
        onUpdateField: PropTypes.func,
        onUpdateExceptionField: PropTypes.func,
        showLabels: PropTypes.bool,
        timeEnabled: PropTypes.bool
    };

    static contextTypes = {
        locale: PropTypes.string
    };

    static defaultProps = {
        timeEnabled: false,
        dateEnabled: true,
        operator: null,
        fieldName: null,
        fieldRowId: null,
        attType: null,
        fieldValue: null,
        fieldException: null,
        onUpdateField: () => {},
        onUpdateExceptionField: () => {},
        showLabels: false
    };
    render() {
        // these values are already parsed by the enhancer
        const startdate = this.props.fieldValue && this.props.fieldValue.startDate || null;
        const enddate = this.props.fieldValue && this.props.fieldValue.endDate || null;

        // needed to initialize the time parts to 00:00:00

        let dateRow = this.props.operator === "><" ?
            (<div className="query-field">
                <div className="query-field-value">
                    {this.props.showLabels && <Message msgId="queryform.from"/>}
                    <UTCDateTimePicker
                        type={this.props.attType}
                        defaultValue={startdate}
                        value={startdate}
                        calendar={this.props.dateEnabled}
                        time={this.props.timeEnabled}
                        format={getDateTimeFormat(this.context.locale, this.props.attType)}
                        onChange={(date) => this.updateValueState({startDate: date, endDate: enddate})}/>
                </div>
                <div className="query-field-value">
                    {this.props.showLabels && <Message msgId="queryform.to"/>}
                    <UTCDateTimePicker
                        type={this.props.attType}
                        defaultValue={enddate}
                        value={enddate}
                        calendar={this.props.dateEnabled}
                        time={this.props.timeEnabled}
                        format={getDateTimeFormat(this.context.locale, this.props.attType)}
                        onChange={(date) => this.updateValueState({startDate: startdate, endDate: date})}/>
                </div>
            </div>)
            :
            (<div>
                {this.props.showLabels && <Message msgId="queryform.date"/>}
                <UTCDateTimePicker
                    type={this.props.attType}
                    defaultValue={startdate}
                    value={startdate}
                    time={this.props.timeEnabled}
                    calendar={this.props.dateEnabled}
                    format={getDateTimeFormat(this.context.locale, this.props.attType)}
                    onChange={(date) => {
                        this.updateValueState({startDate: date, endDate: null});
                    }}/>
            </div>);
        return (
            dateRow
        );
    }

    updateValueState = (value) => {
        if (value.startDate && value.endDate && value.startDate > value.endDate) {
            this.props.onUpdateExceptionField(this.props.fieldRowId, "queryform.attributefilter.datefield.wrong_date_range");
        } else {
            this.props.onUpdateExceptionField(this.props.fieldRowId, null);
        }
        this.props.onUpdateField(this.props.fieldRowId, this.props.fieldName, value, this.props.attType);
    };
}
module.exports = DateField;
