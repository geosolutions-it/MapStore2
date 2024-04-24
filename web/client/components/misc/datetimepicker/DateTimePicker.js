/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';

import PropTypes from 'prop-types';
import moment from 'moment';
import { Calendar } from 'react-widgets';
import localizer from 'react-widgets/lib/localizers/moment';
import { Tooltip, Glyphicon } from 'react-bootstrap';
import { isDate, isNil, omit } from 'lodash';
import OverlayTrigger from '../OverlayTrigger';
import Hours from './Hours';
import Popover from '../../styleeditor/Popover';
import {getMessageById} from '../../../utils/LocaleUtils';
import QuickTimeSelectors from './QuickTimeSelectors';

localizer(moment);

// lang is supported by moment < 2.8.0 in favour of locale
const localField = typeof moment().locale === 'function' ? 'locale' : 'lang';

function getMoment(culture, value, format) {
    return culture ? moment(value, format)[localField](culture) : moment(value, format);
}

const setTime = (date, dateWithTime) => {
    const value = moment(date);
    value.hours(dateWithTime.getHours())
        .minute(dateWithTime.getMinutes())
        .seconds(dateWithTime.getSeconds())
        .milliseconds(dateWithTime.getMilliseconds());
    return value.toDate();
};

const formats = {
    base: 'lll',
    date: 'L',
    time: 'LT'
};

/**
 * @name DateTimePicker
 * The revised react-widget datetimepicker to support operator in addition to date and time.
 * This component mimick the react-widget date time picker component behaviours and
 * props. Please see https://jquense.github.io/react-widgets/api/DateTimePicker/.
 * The operator supported must be placed before date in input field and it should be
 * one of !==|!=|<>|<=|>=|===|==|=|<|> operator. Anything else should not be
 * considered as operator by this component.
 *
 */
class DateTimePicker extends Component {

    static propTypes = {
        className: PropTypes.string,
        format: PropTypes.string,
        type: PropTypes.string,
        placeholder: PropTypes.string,
        onChange: PropTypes.func,
        calendar: PropTypes.bool,
        popupPosition: PropTypes.oneOf(['top', 'bottom']),
        time: PropTypes.bool,
        value: PropTypes.any,
        operator: PropTypes.string,
        culture: PropTypes.string,
        toolTip: PropTypes.string,
        tabIndex: PropTypes.string,
        options: PropTypes.object,
        isWithinAttrTbl: PropTypes.bool,
        disabled: PropTypes.bool,
        quickDateTimeSelectors: PropTypes.array,
        onPopoverOpen: PropTypes.func
    }
    static contextTypes = {
        messages: PropTypes.object,
        locale: PropTypes.string
    };
    static defaultProps = {
        placeholder: 'Type date...',
        calendar: true,
        time: true,
        onChange: () => { },
        value: null,
        popupPosition: 'bottom',
        isWithinAttrTbl: false,
        onPopoverOpen: () => {}
    }

    state = {
        open: '',
        focused: false,
        inputValue: '',
        operator: '',
        date: null
    }

    componentDidMount() {
        const { value, operator } = this.props;
        this.setDateFromValueProp(value, operator);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.value !== this.props.value || prevProps.operator !== this.props.operator) {
            const { value, operator } = this.props;
            this.setDateFromValueProp(value, operator);
            if (this.props.operator === 'isNull') this.setState({ inputValue: '', date: null });  // eslint-disable-line -- TODO: need to be fixed
        }
    }

    getFormat = () => {
        const { format, time, calendar } = this.props;
        const { date: dateFormat, time: timeFormat, base: defaultFormat } = formats;
        return format ? format : !time && calendar ? dateFormat : time && !calendar ? timeFormat : defaultFormat;
    }

    renderQuickTimeSelectors = () => {
        return (
            <QuickTimeSelectors
                type={this.props.type}
                quickDateTimeSelectors={this.props.quickDateTimeSelectors}
                onMouseDown={this.handleMouseDown}
                onChangeDate={this.handleCalendarChange}
                onChangeTime={(date, type) => this.handleTimeSelect({date}, type)}
            />
        );
    }

    renderCustomDateTimePopup = () => {
        const { inputValue, operator, open } = this.state;
        const { tabIndex, type } = this.props;

        const timeVisible = open === 'time';
        const props = omit(this.props, ['placeholder', 'calendar', 'time', 'onChange', 'value']);
        const calendarVal = this.props.value?.startDate ?? this.props.value;
        let timePlaceholderMsgId = getMessageById(this.context.messages, "featuregrid.attributeFilter.placeholders.time");

        return (
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <div style={{display: 'flex', flexDirection: 'column', overflow: 'auto', height: 'inherit'}}>
                    <div className="date-time-container">
                        <Calendar
                            tabIndex="-1"
                            ref={this.attachCalRef}
                            onMouseDown={this.handleMouseDown}
                            onChange={this.handleCalendarChange}
                            {...props}
                            value={!isNil(calendarVal) ? new Date(calendarVal) : undefined}
                        />
                        <div>
                            <div className="date-time-hour-input">
                                {this.renderInput(inputValue, operator, '', timePlaceholderMsgId, tabIndex, false, true, 'form-control')}
                                <span className="time-icon">
                                    <button tabIndex="-1" title="Select Time" type="button" aria-disabled="false" aria-label="Select Time" className="rw-btn-time rw-btn" onClick={this.toggleTime}>
                                        <span aria-hidden="true" className="rw-i rw-i-clock-o"></span>
                                    </button>
                                </span>
                            </div>
                            <div className="dateTime-picker-hours" style={{display: timeVisible ? 'block' : 'none', background: 'white', position: 'relative', zIndex: 1}}>
                                <Hours style={{maxHeight: "120px"}} ref={this.attachTimeRef} value={inputValue} {...props} onClose={this.close} onSelect={(time) => this.handleTimeSelect(time, type)} />
                            </div>
                        </div>
                        {this.renderQuickTimeSelectors()}
                    </div>
                </div>
            </div>
        );
    };
    renderInput = (inputValue, operator, toolTip, placeholder, tabIndex, calendarVisible, timeVisible, className) => {
        let inputV = this.props.isWithinAttrTbl ? `${inputValue}` : `${operator}${inputValue}`;
        let isNullOperator = this.props.operator === 'isNull';
        if (isNullOperator) inputV = '';
        const inputEl = <input type="text" disabled={this.props.disabled || isNullOperator} id="rw_1_input" role="combobox" onBlur={this.handleInputBlur} placeholder={placeholder} aria-expanded={calendarVisible || timeVisible} aria-haspopup="true" aria-busy="false" aria-owns="rw_1_cal rw_1_time_listbox" tabIndex={tabIndex} autoComplete="off" value={inputV} className={`rw-input ${className ? className : ''}`} onChange={this.handleValueChange} />;
        if (toolTip) {
            return (<OverlayTrigger placement="top" overlay={<Tooltip id="tooltip">{toolTip}</Tooltip>}>
                {inputEl}
            </OverlayTrigger>);
        }
        return inputEl;
    }

    render() {
        const { open, inputValue, operator, focused, openDateTime } = this.state;
        const { calendar, time, toolTip, placeholder, tabIndex, type, popupPosition, className } = this.props;
        const props = Object.keys(this.props).reduce((acc, key) => {
            if (['placeholder', 'calendar', 'time', 'onChange', 'value'].includes(key)) {
                // remove these props because they might have undesired effects to the subsequent components
                return acc;
            }
            acc[key] = this.props[key];
            return acc;

        }, {});
        const calendarVisible = open === 'date';
        const timeVisible = open === 'time';
        const dateTimeVisible = openDateTime === 'dateTime';
        const calendarVal =  this.props.value?.startDate ?? this.props.value;
        let timePlaceholderMsgId = getMessageById(this.context.messages, "featuregrid.attributeFilter.placeholders.time");

        if (type === 'date-time') {
            return (<div tabIndex="-1" ref={elem => {this.dateTimeRef = elem;}} onBlur={() => this.handleWidgetBlur(type)} onKeyDown={this.handleKeyDown} onFocus={this.handleWidgetFocus} className={`rw-datetimepicker range-time-input rw-widget ${focused ? 'rw-state-focus' : ''}`}>
                {this.renderInput(inputValue, operator, dateTimeVisible ? '' : toolTip, placeholder, tabIndex, true, true)}
                <span className="rw-select" >
                    <Popover
                        onClick={this.toggleDateTime}
                        disabled={false}
                        placement={popupPosition}
                        onOpen={this.props.onPopoverOpen}
                        triggerScrollableElement={document.querySelector('.feature-grid-container .react-grid-Container .react-grid-Canvas')}
                        content={
                            <div className={`shadow-soft picker-container date-time ${className}`}>
                                {this.renderCustomDateTimePopup()}
                            </div>
                        }
                    >
                        <button disabled={this.props.disabled} tabIndex="-1" title="Select Date" type="button" aria-disabled="false" aria-label="Select Date" className="rw-btn-calendar rw-btn">
                            <Glyphicon glyph={'date-time'} />
                        </button>
                    </Popover>
                </span>
            </div>);
        } else if (type === 'time') {
            return (
                <div tabIndex="-1" onBlur={this.handleWidgetBlur} onKeyDown={this.handleKeyDown} onFocus={this.handleWidgetFocus} className={`rw-datetimepicker rw-widget ${calendar && time ? 'rw-has-both' : ''} ${!calendar && !time ? 'rw-has-neither' : ''} ${type === 'time' ? 'time-type' : ''} ${focused ? 'rw-state-focus' : ''}`}>
                    {this.renderInput(inputValue, operator, timeVisible ? '' : toolTip, timePlaceholderMsgId, tabIndex, calendarVisible, timeVisible)}
                    <span className="rw-select">
                        <Popover
                            onClick={this.toggleTime}
                            disabled={false}
                            placement={popupPosition}
                            onOpen={this.props.onPopoverOpen}
                            triggerScrollableElement={document.querySelector('.feature-grid-container .react-grid-Container .react-grid-Canvas')}
                            content={
                                <div className="shadow-soft" style={{position: "relative", width: 300, height: 'fit-content', overflow: "auto" }}>
                                    <div className="dateTime-picker-hours" style={{display: 'block', background: 'white', position: 'relative', zIndex: 1}}>
                                        <div style={{ height: '120px' }}>
                                            <Hours style={{maxHeight: "120px"}} ref={this.attachTimeRef} value={inputValue} onMouseDown={this.handleMouseDown} {...props} onClose={this.close} onSelect={this.handleTimeSelect} />
                                        </div>
                                    </div>
                                </div>
                            }
                        >
                            <button disabled={this.props.disabled} tabIndex="-1" title="Select Time" type="button" aria-disabled="false" aria-label="Select Time" className="rw-btn-time rw-btn" >
                                <span aria-hidden="true" className="rw-i rw-i-clock-o"></span>
                            </button>
                        </Popover>
                    </span>
                </div>
            );
        }
        return (
            <div tabIndex="-1" onKeyDown={this.handleKeyDown} onBlur={this.handleWidgetBlur} onFocus={this.handleWidgetFocus} className={`rw-datetimepicker rw-widget ${calendar && time ? 'rw-has-both' : ''} ${!calendar && !time ? 'rw-has-neither' : ''} ${type === 'time' ? 'time-type' : ''} ${focused ? 'rw-state-focus' : ''}`}>
                {this.renderInput(inputValue, operator, calendarVisible ? '' : toolTip, placeholder, tabIndex, calendarVisible, timeVisible)}
                {calendar ?
                    <span className="rw-select">
                        <Popover
                            onClick={this.toggleCalendar}
                            disabled={false}
                            placement={popupPosition}
                            onOpen={this.props.onPopoverOpen}
                            triggerScrollableElement={document.querySelector('.feature-grid-container .react-grid-Container .react-grid-Canvas')}       // table element to trigger its scroll
                            content={
                                <div className={`shadow-soft picker-container ${className}`}>
                                    <Calendar
                                        tabIndex="-1"
                                        ref={this.attachCalRef}
                                        onMouseDown={this.handleMouseDown}
                                        onChange={this.handleCalendarChange}
                                        {...props}
                                        value={!isNil(calendarVal) ? new Date(calendarVal) : undefined}
                                    />
                                    {this.renderQuickTimeSelectors()}
                                </div>
                            }
                        >
                            <button disabled={this.props.disabled} tabIndex="-1" title="Select Date" type="button" aria-disabled="false" aria-label="Select Date" className="rw-btn-calendar rw-btn" >
                                <span aria-hidden="true" className="rw-i rw-i-calendar"></span>
                            </button>
                        </Popover>
                    </span>
                    : ''
                }
            </div>
        );
    }

    inputFlush = false;
    // Ignore blur to manual control de-rendering of cal/time popup
    ignoreBlur = false;

    handleWidgetFocus = () => {
        if (!this.props.disabled) {
            this.setState({ focused: true });
            this.ignoreBlur = false;
        }
    }

    handleWidgetBlur = (type) => {
        if (this.ignoreBlur) {
            return;
        }
        if (type === 'date-time') {
            // this.dateTimeRef.click();
            this.setState({ openDateTime: '', focused: false });
        } else {
            this.setState({ open: '', focused: false });
        }
    }

    handleMouseDown = () => {
        this.ignoreBlur = true;
    }

    toggleCalendar = () => {
        this.setState(prevState => ({ open: prevState.open !== 'date' ? 'date' : '' }));
    }
    toggleDateTime = () => {
        this.setState(prevState => ({ openDateTime: prevState.openDateTime !== 'dateTime' ? 'dateTime' : '', open: '' }));
    }
    toggleTime = () => {
        this.setState(prevState => ({ open: prevState.open !== 'time' ? 'time' : '' }));
    }

    handleInputBlur = () => {
        if (this.inputFlush) {
            // date has changed
            const parsed = this.parse(this.state.inputValue);
            const dateStr = this.format(parsed);
            this.setState({
                inputValue: dateStr,
                date: parsed
            });
            this.inputFlush = false;
            this.props.onChange(parsed, `${this.state.operator}${dateStr}`);
        }
    }

    setDateFromValueProp = (value, operator) => {
        if (isDate(value)) {
            const inputValue = this.format(value);
            this.setState(prevState => ({ date: value, inputValue, operator: operator || prevState.operator }));
        }
    }

    parse = (value) => {
        const { culture } = this.props;
        const format = this.getFormat();
        if (value) {
            const m = getMoment(culture, value, format);
            if (m.isValid()) return m.toDate();
        }
        return null;
    }

    format = (value) => {
        if (!value) return '';
        const { culture } = this.props;
        const format = this.getFormat();
        const m = getMoment(culture, value);
        if (m.isValid()) return m.format(format);
        return '';
    }

    close = () => {
        this.setState({ open: '', openDateTime: '' });
    }

    open = () => {
        const { calendar, time } = this.props;
        return !calendar && time ? this.setState({ open: 'time' }) : calendar && !time ? this.setState({ open: 'date' }) : '';
    }

    handleKeyDown = e => {
        const { open } = this.state;
        const timeVisible = open === 'time';
        const calVisible = open === 'date';

        if (e.defaultPrevented) return;

        if (e.key === 'Escape') {
            // escape key should close the calendar or time popup
            this.close();
            return;
        }
        if (e.altKey && e.key === 'ArrowDown') {
            // user press control/option key for mac together with arrow down
            // this should open the popup
            e.preventDefault();
            this.open();
            return;
        }

        if (e.altKey && e.key === 'ArrowUp') {
            // user press control/option key for mac together with arrow up
            // this should close the popup
            e.preventDefault();
            this.close();
            return;
        }

        if (timeVisible) {
            this.timeRef?.handleKeyDown(e);
        }

        if (calVisible) {
            this.calRef?.refs?.inner?.handleKeyDown(e);
        }

        if (!timeVisible && !calVisible && e.key === 'Enter') {
            // enter key is pressed while hours and calendar are not visible
            // date has changed
            const parsed = this.parse(this.state.inputValue);
            const dateStr = this.format(parsed);
            this.setState({
                inputValue: dateStr,
                date: parsed
            });
            this.inputFlush = false;
            this.props.onChange(parsed, `${this.state.operator}${dateStr}`);
        }
    }


    handleValueChange = (event) => {
        const { value } = event.target;
        const match = /\s*(!==|!=|<>|<=|>=|===|==|=|<|>)?(.*)/.exec(value);
        this.setState({ inputValue: match[2], operator: match[1] || '' });
        this.inputFlush = true;
    }

    handleCalendarChange = value => {
        const date = setTime(value, this.state.date || new Date(value));
        const inputValue = this.format(date);
        this.setState({ date, inputValue, open: '' });
        this.props.onChange(date, `${this.state.operator}${inputValue}`);
    }

    handleTimeSelect = (time, pickerType) => {
        if (pickerType === 'date-time') {
            this.ignoreBlur = true;
        }
        const selectedDate = this.state.date || new Date();
        const date = setTime(selectedDate, time.date);
        const inputValue = this.format(date);
        this.setState({ date, inputValue, open: '' });
        this.props.onChange(date, `${this.state.operator}${inputValue}`);
    }

    attachTimeRef = ref => (this.timeRef = ref)

    attachCalRef = ref => (this.calRef = ref)

}
export default DateTimePicker;

