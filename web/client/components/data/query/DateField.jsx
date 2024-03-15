/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import PropTypes from 'prop-types';
import { intlShape } from 'react-intl';
import { getContext } from 'recompose';
import isNil from 'lodash/isNil';
import isEmpty from 'lodash/isEmpty';
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
momentLocalizer(moment);

import { getDateTimeFormat } from '../../../utils/TimeUtils';
import { getMessageById } from '../../../utils/LocaleUtils';

import utcDateWrapper from '../../misc/enhancers/utcDateWrapper';
import Message from '../../I18N/Message';
import DateTimePicker from '../../misc/datetimepicker';
import RangedDateTimePicker from '../../misc/datetimepicker/RangedDateTimePicker';
import { DATE_TYPE } from '../../../utils/FeatureGridUtils';

const DEFAULT_QUICK_TIME_SELECTORS = [
    {
        "type": DATE_TYPE.DATE,
        "value": "{today}+P0D",
        "labelId": "queryform.attributefilter.datefield.quickSelectors.today"
    },
    {
        "type": DATE_TYPE.DATE,
        "value": "{today}-P1D",
        "labelId": "queryform.attributefilter.datefield.quickSelectors.yesterday"
    },
    {
        "type": DATE_TYPE.DATE,
        "value": "{today}+P1D",
        "labelId": "queryform.attributefilter.datefield.quickSelectors.tomorrow"
    },
    {
        "type": DATE_TYPE.DATE_TIME,
        "value": "{now}+P0D",
        "labelId": "queryform.attributefilter.datefield.quickSelectors.now"
    },
    {
        "type": DATE_TYPE.DATE_TIME,
        "value": "{now}-P1D",
        "labelId": "queryform.attributefilter.datefield.quickSelectors.yesterday"
    },
    {
        "type": DATE_TYPE.DATE_TIME,
        "value": "{now}+P1D",
        "labelId": "queryform.attributefilter.datefield.quickSelectors.tomorrow"
    },
    {
        "type": DATE_TYPE.DATE,
        "value": "{today}/{today}",
        "labelId": "queryform.attributefilter.datefield.quickSelectors.today"
    },
    {
        "type": DATE_TYPE.DATE,
        "value": "{thisWeekStart}/{thisWeekEnd}",
        "labelId": "queryform.attributefilter.datefield.quickSelectors.thisWeek"
    },
    {
        "type": DATE_TYPE.DATE,
        "value": "{thisMonthStart}/{thisMonthEnd}",
        "labelId": "queryform.attributefilter.datefield.quickSelectors.thisMonth"
    },
    {
        "type": DATE_TYPE.DATE,
        "value": "{today}/{today}+P7D",
        "labelId": "queryform.attributefilter.datefield.quickSelectors.nDaysFrom"
    },
    {
        "type": DATE_TYPE.DATE,
        "value": "{today}/{today}+P30D",
        "labelId": "queryform.attributefilter.datefield.quickSelectors.nDaysFrom"
    },
    {
        "type": DATE_TYPE.DATE,
        "value": "{today}/{today}+P90D",
        "labelId": "queryform.attributefilter.datefield.quickSelectors.nDaysFrom"
    },
    {
        "type": DATE_TYPE.DATE_TIME,
        "value": "{now}/{now}",
        "labelId": "queryform.attributefilter.datefield.quickSelectors.now"
    },
    {
        "type": DATE_TYPE.DATE_TIME,
        "value": "{thisWeekStart}/{thisWeekEnd}",
        "labelId": "queryform.attributefilter.datefield.quickSelectors.thisWeek"
    },
    {
        "type": DATE_TYPE.DATE_TIME,
        "value": "{thisMonthStart}/{thisMonthEnd}",
        "labelId": "queryform.attributefilter.datefield.quickSelectors.thisMonth"
    },
    {
        "type": DATE_TYPE.DATE_TIME,
        "value": "{now}/{now}+P7D",
        "labelId": "queryform.attributefilter.datefield.quickSelectors.nDaysFrom"
    },
    {
        "type": DATE_TYPE.DATE_TIME,
        "value": "{now}/{now}+P30D",
        "labelId": "queryform.attributefilter.datefield.quickSelectors.nDaysFrom"
    },
    {
        "type": DATE_TYPE.DATE_TIME,
        "value": "{now}/{now}+P90D",
        "labelId": "queryform.attributefilter.datefield.quickSelectors.nDaysFrom"
    }
];

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

const UTCDateTimePickerWithRange = utcDateWrapper({
    dateProp: "value",
    dateTypeProp: "type",
    setDateProp: "onChange"
})(RangedDateTimePicker);

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
        timeEnabled: PropTypes.bool,
        quickDateTimeSelectors: PropTypes.array,
        placeholderMsgId: PropTypes.string,
        tooltipMsgId: PropTypes.string,
        className: PropTypes.string
    };

    static contextTypes = {
        messages: PropTypes.object,
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
        showLabels: false,
        className: "query-date",
        placeholderMsgId: "queryform.attributefilter.datefield.placeholder",
        tooltipMsgId: "queryform.attributefilter.datefield.tooltip",
        quickDateTimeSelectors: DEFAULT_QUICK_TIME_SELECTORS
    };
    render() {
        const format = getDateTimeFormat(this.context.locale, this.props.attType);
        const placeholder = getMessageById(this.context.messages, this.props.placeholderMsgId) || "Insert date";
        const toolTip = this.props.intl && this.props.intl.formatMessage({id: `${this.props.tooltipMsgId}`}, {format}) || `Insert date in ${format} format`;

        return this.props.operator === "><" ?
            (<div className="query-field">
                <UTCDateTimePickerWithRange
                    isWithinAttrTbl
                    key={'query-range'}
                    className={this.props.className}
                    format={format}
                    placeholder={placeholder}
                    value={this.props.fieldValue}
                    toolTip={toolTip}
                    operator={this.props.operator}
                    popupPosition={'bottom'}
                    type={this.props.attType}
                    time={this.props.attType === DATE_TYPE.TIME}
                    calendar={this.props.attType === DATE_TYPE.DATE_TIME || this.props.attType === DATE_TYPE.DATE}
                    onChange={this.handleChangeRangeFilter}
                    quickDateTimeSelectors={this.getQuickTimeSelectors(true)}
                />
            </div>)
            : (<div>
                {this.props.showLabels && <Message msgId="queryform.date"/>}
                <UTCDateTimePicker
                    isWithinAttrTbl
                    key={'query-single'}
                    className={this.props.className}
                    format={format}
                    placeholder={placeholder}
                    value={this.props.fieldValue?.startDate}
                    toolTip={toolTip}
                    operator={this.props.operator}
                    type={this.props.attType}
                    popupPosition={'bottom'}
                    time={this.props.attType === DATE_TYPE.DATE_TIME || this.props.attType === DATE_TYPE.TIME}
                    calendar={this.props.attType === DATE_TYPE.DATE_TIME || this.props.attType === DATE_TYPE.DATE}
                    onChange={this.handleChange}
                    quickDateTimeSelectors={this.getQuickTimeSelectors()}
                />
            </div>);
    }

    handleChange = (value) => {
        this.props.onUpdateExceptionField(this.props.fieldRowId, null);
        this.props.onUpdateField(this.props.fieldRowId, this.props.fieldName, {startDate: value}, this.props.attType);
    }

    handleChangeRangeFilter = (value, _, order = 'start') => {
        let reqVal = {};
        if (order === 'end') {
            reqVal = {
                startDate: this.props.fieldValue?.startDate,
                endDate: value
            };
        } else {
            reqVal = {
                startDate: value,
                endDate: this.props.fieldValue?.endDate
            };
        }
        this.props.onUpdateExceptionField(this.props.fieldRowId, null);
        this.props.onUpdateField(this.props.fieldRowId, this.props.fieldName, reqVal, this.props.attType);
    }

    getQuickTimeSelectors = (isRange) => {
        return this.props.quickDateTimeSelectors
            ?.filter(({type, value} = {}) => {
                if (!isEmpty(value) && type === this.props.attType) {
                    const endDate = value.split('/')?.[1];
                    return isRange ? !isNil(endDate) : isNil(endDate);
                }
                return false;
            });
    };
}
export default getContext({
    intl: intlShape
})(DateField);
