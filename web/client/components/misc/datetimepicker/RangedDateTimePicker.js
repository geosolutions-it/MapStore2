/*
 * Copyright 2023, GeoSolutions Sas.
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
import { getMessageById } from '../../../utils/LocaleUtils';
import Message from '../../I18N/Message';
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
 * @name DateTimePickerWithRange
 * The revised react-widget datetimepicker to support operator in addition to date and time.
 * This component mimick the react-widget date time picker component behaviours and
 * props. Please see https://jquense.github.io/react-widgets/api/DateTimePicker/.
 * The operator supported must be placed before date in input field and it should be
 * one of !==|!=|<>|<=|>=|===|==|=|<|> operator. Anything else should not be
 * considered as operator by this component.
 *
 */
class DateTimePickerWithRange extends Component {

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
        disabled: PropTypes.bool,
        quickDateTimeSelectors: PropTypes.array
    }

    static defaultProps = {
        placeholder: 'Type date...',
        calendar: true,
        time: true,
        onChange: () => { },
        value: null,
        popupPosition: 'bottom'
    }
	static contextTypes = {
	    messages: PropTypes.object,
	    locale: PropTypes.string
	};
    state = {
        openRangeContainer: false,
        openRangeInputs: 'start',			// start, end
        openDateTCalendar: false,
        openTime: false,
        focused: false,
	 	mainInputValue: '',
        inputValue: {			// what's shown on input for user
            startDate: '',
            endDate: ''
        },
        operator: '><',
        date: {				// stored values
            startDate: null,
            endDate: null
        },
        isInputNotValid: false
    }

    componentDidMount() {
        const { value, operator } = this.props;
        this.setDateFromValueProp(value, operator);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.value?.startDate !== this.props.value?.startDate || prevProps.value?.endDate !== this.props.value?.endDate ) {
            const { value, operator } = this.props;
            this.setDateFromValueProp(value, operator);
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

    renderInput = (inputValue, operator, toolTip, placeholder, tabIndex, calendarVisible, timeVisible, style = {}, className) => {
        let inputV = this.props.isWithinAttrTbl ? `${inputValue}` : `${operator}${inputValue}`;
        const inputEl = <input style={style} disabled={this.props.disabled || true} type="text" id="rw_1_input" role="combobox" placeholder={placeholder} aria-expanded={calendarVisible || timeVisible} aria-haspopup="true" aria-busy="false" aria-owns="rw_1_cal rw_1_time_listbox" tabIndex={tabIndex} autoComplete="off" value={inputV} className={`rw-input ${this.state.isInputNotValid ? 'has-error' : ''} ${className ? className : ''}`} onChange={this.handleValueChange} />;
        if (toolTip) {
            return (<OverlayTrigger placement="top" overlay={<Tooltip id="tooltip">{toolTip}</Tooltip>}>
                {inputEl}
            </OverlayTrigger>);
        }
        return inputEl;
    }
	renderHoursRange = () =>{
	    const { inputValue, operator, focused, openRangeInputs} = this.state;
	    const { placeholder, tabIndex } = this.props;
	    const props = omit(this.props, ['placeholder', 'calendar', 'time', 'onChange', 'value', 'toolTip', 'onMouseOver']);
	    return (
	        <div onMouseDown={this.handleMouseDown} style={{display: 'flex', flexDirection: 'column', height: '200px'}}>
	            <div style={{display: 'flex', flexDirection: 'row'}}>
	                <div onClick={this.toggleStart} className={this.rangeTabClassName('start')}>
	                    <strong style={{fontSize: '12px'}}><Message msgId="featuregrid.attributeFilter.rangeTab.start"/></strong>
	                    <span>
	                        {inputValue.startDate || getMessageById(this.context.messages, "featuregrid.attributeFilter.placeholders.range") }
	                    </span>
	                </div>
	                <div onClick={this.toggleEnd} className={this.rangeTabClassName('end')}>
	                    <strong style={{fontSize: '12px'}}><Message msgId="featuregrid.attributeFilter.rangeTab.end"/></strong>
	                    <span>
	                        {inputValue.endDate || getMessageById(this.context.messages, "featuregrid.attributeFilter.placeholders.range") }
	                    </span>
	                </div>
	            </div>
	            <div style={{display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
	                <div tabIndex="-1" style={{ display: openRangeInputs === 'start' ? 'block' : 'none'}} className={`rw-datetimepicker rw-widget rw-has-neither ${focused ? 'rw-state-focus' : ''}`}>
	                    {this.renderInput(inputValue.startDate, operator, '', placeholder, tabIndex, false, true, {width: '90%'})}
	                    <span>
	                        <button tabIndex="-1" title="Select Time" type="button" aria-disabled="false" aria-label="Select Time" className="rw-btn-time rw-btn" onClick={this.toggleTime}>
	                            <span aria-hidden="true" className="rw-i rw-i-clock-o"></span>
	                        </button>
	                    </span>
	                    <div className="dateTime-picker-hours" style={{display: 'block', background: 'white', position: 'relative', zIndex: 1}}>
	                        <Hours ref={elem => {this.attachStartTimeRef = elem;}} value={inputValue?.startDate || ''} onMouseDown={this.handleMouseDown} {...props} onClose={this.close} onSelect={(evt) => this.handleTimeSelect(evt, 'start')} />
	                    </div>
	                </div>
	                <div tabIndex="-1" style={{ display: openRangeInputs === 'end' ? 'block' : 'none'}} className={`rw-datetimepicker rw-widget rw-has-neither ${focused ? 'rw-state-focus' : ''}`}>
	                    {this.renderInput(inputValue.endDate, operator, '', placeholder, tabIndex, false, true, {width: '90%'})}
	                    <span>
	                        <button tabIndex="-1" title="Select Time" type="button" aria-disabled="false" aria-label="Select Time" className="rw-btn-time rw-btn" onClick={this.toggleTime}>
	                            <span aria-hidden="true" className="rw-i rw-i-clock-o"></span>
	                        </button>
	                    </span>
	                    <div className="dateTime-picker-hours" style={{display: 'block', background: 'white', position: 'relative', zIndex: 1}}>
	                        <Hours ref={elem => {this.attachTimeEndRef = elem;}} value={inputValue?.endDate || ''} onMouseDown={this.handleMouseDown} {...props} onClose={this.close} onSelect={(evt) => this.handleTimeSelect(evt, 'end')} />
	                    </div>
	                </div>
	            </div>
	        </div>
	    );
	}
	renderHours = () =>{
	 	const { inputValue, operator, focused } = this.state;
     	const { toolTip, placeholder, tabIndex, popupPosition } = this.props;
     	let shownVal = (inputValue.endDate || inputValue.startDate) ? Object.values(inputValue).join(" : ") : '';
	 	return (
		 	<div tabIndex="-1" onKeyDown={this.handleKeyDown} onBlur={this.handleWidgetBlur} onFocus={this.handleWidgetFocus} className={`rw-datetimepicker range-time-input rw-widget rw-has-neither ${focused ? 'rw-state-focus' : ''}`}>
			 	{this.renderInput(shownVal, operator, toolTip, placeholder, tabIndex, false, true)}
			 	<span className="rw-select">
				 <Popover
	                    disabled={false}
	                    placement={popupPosition}
					 	triggerScrollableElement={document.querySelector('.feature-grid-container .react-grid-Container .react-grid-Canvas')}
	                    content={
                        	<div className="shadow-soft picker-container time">
	                            { this.renderHoursRange() }
	                        </div>
	                    }
	                >
	                    <button disabled={this.props.disabled} tabIndex="-1" title="Select Date" type="button" aria-disabled={this.props.disabled} aria-label="Select Date" className="rw-btn-calendar rw-btn" onClick={this.toggleHandler}>
	                        <span aria-hidden="true" className="rw-i rw-i-clock-o"></span>
	                    </button>
	                </Popover>
			 	</span>
		 	</div>
	 	);
	}
	rangeTabClassName = (type) => {
	    const openRangeInputs = this.state.openRangeInputs;
	    return "range-tab" + (openRangeInputs === type || !openRangeInputs ? '' : ' selected');
	}
	renderCalendarRange = () =>{
	    const { openRangeInputs, inputValue } = this.state;
	    const props = omit(this.props, ['placeholder', 'calendar', 'time', 'onChange', 'value', 'toolTip', 'onMouseOver']);
	    return (
	        <div onMouseDown={this.handleMouseDown} style={{display: 'flex', flexDirection: 'column'}}>
	            <div style={{display: 'flex', flexDirection: 'row'}}>
	                <div onClick={this.toggleStart} className={this.rangeTabClassName('start')}>
	                    <strong style={{fontSize: '12px'}}><Message msgId="featuregrid.attributeFilter.rangeTab.start"/></strong>
	                    <span>
	                        {inputValue.startDate || getMessageById(this.context.messages, "featuregrid.attributeFilter.placeholders.range")}
	                    </span>
	                </div>
	                <div onClick={this.toggleEnd} className={this.rangeTabClassName('end')}>
	                    <strong style={{fontSize: '12px'}}><Message msgId="featuregrid.attributeFilter.rangeTab.end"/></strong>
	                    <span>
	                        {inputValue.endDate || getMessageById(this.context.messages, "featuregrid.attributeFilter.placeholders.range")}
	                    </span>
	                </div>
	            </div>
	            <div style={{display: 'flex', flexDirection: 'column', overflow: 'auto'}}>
	                <div style={{display: openRangeInputs === 'start' ? 'block' : 'none'}}>
	                    <Calendar
	                        tabIndex="-1"
	                        ref={elem => {this.attachCalStartRef = elem;}}
	                        onMouseDown={this.handleMouseDown}
	                        onChange={(value) => this.handleCalendarChange(value, 'start')}
	                        {...props}
	                        value={!isNil(this.state.date?.startDate || this.props.value?.startDate) ? new Date(this.state.date?.startDate || this.props.value?.startDate) : undefined}
	                        />
	                </div>
	                <div style={{display: openRangeInputs === 'end' ? 'block' : 'none'}}>
	                    <Calendar
	                        tabIndex="-1"
	                        ref={elem => { this.attachCalEndRef = elem;}}
	                        onMouseDown={this.handleMouseDown}
	                        onChange={(value) => this.handleCalendarChange(value, 'end')}
	                        {...props}
	                        value={!isNil(this.state.date?.endDate || this.props.value?.endDate) ? new Date(this.state.date?.endDate || this.props.value?.endDate) : undefined}
	                    />
	                </div>
	            </div>
	        </div>
	    );
	}
	renderCalendar = () =>{
	    const { inputValue, operator, focused } = this.state;
	    const { toolTip, placeholder, tabIndex, popupPosition, type, className } = this.props;
	    let shownVal = (inputValue.endDate || inputValue.startDate) ? Object.values(inputValue).join(" : ") : '';

	    return (
	        <div tabIndex="-1" onKeyDown={this.handleKeyDown} ref={elem => {this.calendarRef = elem;}} onBlur={()=> this.handleWidgetBlur(type)} onFocus={this.handleWidgetFocus} className={`rw-datetimepicker range-time-input rw-widget ${focused ? 'rw-state-focus' : ''}`}>
	            {this.renderInput(shownVal, operator, toolTip, placeholder, tabIndex, true, false)}
	            <span className="rw-select">
	                <Popover
	                    disabled={false}
	                    placement={popupPosition}
					 	triggerScrollableElement={document.querySelector('.feature-grid-container .react-grid-Container .react-grid-Canvas')}
	                    content={
                        	<div className={`shadow-soft picker-container range ${className}`}>
	                            { this.renderCalendarRange() }
	                            {this.renderQuickTimeSelectors()}
	                        </div>
	                    }
	                >
	                    <button disabled={this.props.disabled} tabIndex="-1" title="Select Date" type="button" aria-disabled={this.props.disabled} aria-label="Select Date" className="rw-btn-calendar rw-btn" onClick={this.toggleHandler}>
	                        <span aria-hidden="true" className="rw-i rw-i-calendar"></span>
	                    </button>
	                </Popover>
	            </span>
	        </div>
	    );
	}
	renderDateTimeRange = () =>{
	    const { inputValue, operator, openRangeInputs, openTime } = this.state;
	    const { tabIndex } = this.props;
	    const props = omit(this.props, ['placeholder', 'calendar', 'time', 'onChange', 'value', 'toolTip', 'onMouseOver']);
	    let timePlaceholderMsgId = getMessageById(this.context.messages, "featuregrid.attributeFilter.placeholders.time");

	    return (
	        <div onMouseDown={this.handleMouseDown} style={{display: 'flex', flexDirection: 'column'}}>
	            <div style={{display: 'flex', flexDirection: 'row'}}>
	                <div onClick={this.toggleStart} className={this.rangeTabClassName('start')}>
	                    <strong style={{fontSize: '12px'}}><Message msgId="featuregrid.attributeFilter.rangeTab.start"/></strong>
	                    <span>
	                        {inputValue.startDate || getMessageById(this.context.messages, "featuregrid.attributeFilter.placeholders.range")}
	                    </span>
	                </div>
	                <div onClick={this.toggleEnd} className={this.rangeTabClassName('end')}>
	                    <strong style={{fontSize: '12px'}}><Message msgId="featuregrid.attributeFilter.rangeTab.end"/></strong>
	                    <span>
	                        {inputValue.endDate || getMessageById(this.context.messages, "featuregrid.attributeFilter.placeholders.range")}
	                    </span>
	                </div>
	            </div>
	            <div style={{display: 'flex', flexDirection: 'column', overflow: 'auto'}}>
	                <div className="date-time-container" style={{display: openRangeInputs === 'start' ? 'block' : 'none'}}>
	                    <Calendar
	                        tabIndex="-1"
	                        ref={elem => {this.attachCalStartRef = elem;}}
	                        onMouseDown={this.handleMouseDown}
	                        onChange={(evt) => this.handleCalendarChange(evt, 'start')}
	                        {...props}
	                        value={!isNil(this.state.date?.startDate || this.props.value?.startDate) ? new Date(this.state.date?.startDate || this.props.value?.startDate) : undefined}
	                        />
	                	<div style={{ display: openRangeInputs === 'start' ? 'block' : 'none'}}>
	                        <div className="date-time-hour-input">
	                    		{this.renderInput(inputValue.startDate, operator, '', timePlaceholderMsgId, tabIndex, false, true, {}, 'form-control')}
	                            <span className="time-icon">
	                                <button style={{width: '100%'}} tabIndex="-1" title="Select Time" type="button" aria-disabled="false" aria-label="Select Time" className="rw-btn-time rw-btn" onClick={this.toggleTime}>
	                                    <span aria-hidden="true" className="rw-i rw-i-clock-o"></span>
	                                </button>
	                            </span>
	                        </div>
	                    <div className="dateTime-picker-hours" style={{display: openTime ? 'block' : 'none', background: 'white', position: 'relative', zIndex: 1}}>
	                        <Hours style={{maxHeight: "120px"}} value={inputValue?.startDate || ''} ref={elem => {this.attachTimeStartRef = elem;}} onMouseDown={this.handleMouseDown} {...props} onClose={this.close} onSelect={(evt) => this.handleTimeSelect(evt, 'start')} />
	                    </div>
	                </div>
	                </div>
	                <div className="date-time-container" style={{display: openRangeInputs === 'end' ? 'block' : 'none'}}>
	                    <Calendar
	                        tabIndex="-1"
	                        ref={elem => { this.attachCalEndRef = elem;}}
	                        onMouseDown={this.handleMouseDown}
	                        onChange={(evt) => this.handleCalendarChange(evt, 'end')}
	                        {...props}
	                        value={!isNil(this.state.date?.endDate || this.props.value?.endDate) ? new Date(this.state.date?.endDate || this.props.value?.endDate) : undefined}
	                    />
	                	<div style={{ display: openRangeInputs === 'end' ? 'block' : 'none'}}>
	                        <div className="date-time-hour-input">
	                            {this.renderInput(inputValue.endDate, operator, '', timePlaceholderMsgId, tabIndex, false, true, {}, 'form-control')}
	                            <span className="time-icon">
	                                <button style={{width: '100%'}} tabIndex="-1" title="Select Time" type="button" aria-disabled="false" aria-label="Select Time" className="rw-btn-time rw-btn" onClick={this.toggleTime}>
	                                    <span aria-hidden="true" className="rw-i rw-i-clock-o"></span>
	                                </button>
	                            </span>
	                        </div>
	                        <div className="dateTime-picker-hours" style={{display: openTime ? 'block' : 'none', background: 'white', position: 'relative', zIndex: 1}}>
	                            <Hours style={{maxHeight: "120px"}} value={inputValue?.endDate || ''} ref={elem => { this.attachTimeEndRef = elem;}} onMouseDown={this.handleMouseDown} {...props} onClose={this.close} onSelect={(evt) => this.handleTimeSelect(evt, 'end')} />
	                        </div>
	                	</div>
	                </div>
	            </div>
	        </div>
	    );
	}
	renderCalendarTimeDate = () =>{
	    const { inputValue, operator, focused } = this.state;
	    const { toolTip, placeholder, tabIndex, popupPosition, type, className } = this.props;
	    let shownVal = (inputValue.endDate || inputValue.startDate) ? Object.values(inputValue).join(" : ") : '';

	    return (
	        <div tabIndex="-1" onKeyDown={this.handleKeyDown} ref={elem => {this.dateTimeRef = elem;}} onBlur={() => this.handleWidgetBlur(type)} onFocus={this.handleWidgetFocus} className={`rw-datetimepicker range-time-input rw-widget ${focused ? 'rw-state-focus' : ''}`}>
	            {this.renderInput(shownVal, operator, toolTip, placeholder, tabIndex, true, true)}
	            <span className="rw-select">
	                <Popover
	                    disabled={false}
	                    placement={popupPosition}
					 	triggerScrollableElement={document.querySelector('.feature-grid-container .react-grid-Container .react-grid-Canvas')}
	                    content={
                         	<div className={`shadow-soft picker-container date-time range ${className}`}>
	                            {this.renderDateTimeRange()}
	                            {this.renderQuickTimeSelectors()}
	                        </div>
	                    }
	                >
	                    <button disabled={this.props.disabled} tabIndex="-1" title="Select Date" type="button" aria-disabled={this.props.disabled} aria-label="Select Date" className="rw-btn-calendar rw-btn" onClick={this.toggleHandler}>
	                        <Glyphicon glyph={'date-time'} />
	                    </button>
	                </Popover>
	            </span>
	        </div>
	    );
	}

	render() {
	    const { type } = this.props;
	    if (type === 'time') return this.renderHours();
	    else if (type === 'date') return this.renderCalendar();
	    return this.renderCalendarTimeDate();
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
        if (type === 'date') {
            this.calendarRef.click();
        } else if (type === 'date-time') {
            this.dateTimeRef.click();
        }
        this.setState({ openRangeContainer: '', focused: false });
    }
	rangeContainerMouseLeaveHandler = () => {
	    this.setState({ openRangeContainer: false });
	}
    handleMouseDown = () => {
        this.ignoreBlur = true;
    }

    toggleStart = () => {
        if (this.state.openRangeInputs !== 'start') {
            this.setState({ openRangeInputs: 'start', openTime: false, openDateTCalendar: false });
        }
    }
	toggleEnd = () => {
	 	if (this.state.openRangeInputs !== 'end') {
		  	this.setState({ openRangeInputs: 'end', openTime: false, openDateTCalendar: false });
	 	}
	}
	toggleTime = () => {
	    this.setState(prev => ({ openTime: !prev.openTime }));
	}
	toggleHandler = () => {
	    this.setState(prevState => ({ openRangeContainer: !prevState.openRangeContainer, openTime: false, openDateTCalendar: false }));
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
	handleKeyDown = e => {
	    if (e.key === 'Escape') {
	        // escape key should close the calendar or time popup
	        this.close();
	        return;
	    }
	}
    setDateFromValueProp = (value, operator) => {
        if ((isDate(value?.startDate) && value?.startDate) || (isDate(value?.endtDate) && value?.endtDate)) {
            let startValue = this.format(value?.startDate);
            let endValue = this.format(value?.endDate);
            let inputValue = {
                startDate: startValue,
                endDate: endValue
            };
            this.setState(prevState => ({ date: { ...value }, inputValue, operator: operator || prevState.operator }));
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
        this.setState({ openRangeContainer: '' });
    }

    openHandler = () => {
        const { calendar, time } = this.props;
        return !calendar && time ? this.setState({ open: 'time' }) : calendar && !time ? this.setState({ open: 'date' }) : '';
    }


    handleValueChange = (event) => {
        const { value } = event.target;
        const match = /\s*(!==|!=|<>|<=|>=|===|==|=|<|>)?(.*)/.exec(value);
        this.setState({ mainInputValue: match[2], operator: match[1] || '' });
        this.inputFlush = true;
    }

    handleCalendarChange = (value, order) => {
        const date = setTime(value, new Date(value));
        const inputValue = this.format(date);
        let inputValueClone = { ...this.state.inputValue};
        if (order === 'start') {
		 	inputValueClone.startDate = inputValue;
	 	} else {
		 	inputValueClone.endDate = inputValue;
	 	}
        let upadtedDate = {
            startDate: order === 'start' ? date : this.state.date.startDate,
            endDate: order === 'end' ? date : this.state.date.endDate
        };
        let startTimeStamp = upadtedDate.startDate ? (upadtedDate.startDate).getTime() : 0;
        let endTimeStamp = upadtedDate.endDate ? (upadtedDate.endDate).getTime() : 0;
        if (upadtedDate.startDate && upadtedDate.endDate && endTimeStamp < startTimeStamp) {
            this.setState({
                date: upadtedDate,
                inputValue: inputValueClone,
                isInputNotValid: true
            });
            return;
        }
        this.setState({
            date: upadtedDate,
            inputValue: inputValueClone,
            isInputNotValid: false
        });
        if (order === 'start') {
            this.props.onChange(date, inputValueClone.startDate, 'start');
        } else if (order === 'end') {
            this.props.onChange(date, inputValueClone.endDate, 'end');
        }
    }

    handleTimeSelect = (time, order) => {
        const selectedDate = (order === 'start' ? this.state.date.startDate : this.state.date.endDate ) || new Date();
        const date = setTime(selectedDate, time.date);
        const inputValue = this.format(date);
        let inputValueClone = { ...this.state.inputValue};
        if (order === 'start') inputValueClone.startDate = inputValue;
        else inputValueClone.endDate = inputValue;
        let upadtedDate = {
            startDate: order === 'start' ? date : this.state.date.startDate,
            endDate: order === 'end' ? date : this.state.date.endDate
        };
        let startTimeStamp = upadtedDate.startDate ? (upadtedDate.startDate).getTime() : 0;
        let endTimeStamp = upadtedDate.endDate ? (upadtedDate.endDate).getTime() : 0;
        if (upadtedDate.startDate && upadtedDate.endDate && endTimeStamp < startTimeStamp) {
            this.setState({ inputValue: inputValueClone, date: upadtedDate, openTime: '', isInputNotValid: true});
        } else {
            this.setState({ inputValue: inputValueClone, openTime: '', date: upadtedDate, isInputNotValid: false});
            if (order === 'start') this.props.onChange(date, inputValueClone.startDate, 'start');
            else if (order === 'end') this.props.onChange(date, inputValueClone.endDate, 'end');
        }
    }

    attachTimeStartRef = ref => (this.timeStartRef = ref)
    attachTimeEndRef = ref => (this.timeEndRef = ref)

    attachCalStartRef = ref => (this.calStartRef = ref)
    attachCalEndRef = ref => (this.calEndRef = ref)

}
export default DateTimePickerWithRange;

