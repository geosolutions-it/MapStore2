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
import { Tooltip } from 'react-bootstrap';
import { isDate, isNil } from 'lodash';
import OverlayTrigger from '../OverlayTrigger';
import Hours from './Hours';

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
        options: PropTypes.object
    }

    static defaultProps = {
        placeholder: 'Type date...',
        calendar: true,
        time: true,
        onChange: () => { },
        value: null,
        popupPosition: 'bottom'
    }

    state = {
        openRangeContainer: false,
        openRangeInputs: 'start',			// start, end
        openDateTCalendar: false,				// start, end
        openDateTTime: false,					// start, end
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
        }
    }

    getFormat = () => {
        const { format, time, calendar } = this.props;
        const { date: dateFormat, time: timeFormat, base: defaultFormat } = formats;
        return format ? format : !time && calendar ? dateFormat : time && !calendar ? timeFormat : defaultFormat;
    }

    renderInput = (inputValue, operator, toolTip, placeholder, tabIndex, calendarVisible, timeVisible, disabled, isFullWidth) => {
        if (toolTip) {
            return (<OverlayTrigger placement="top" overlay={<Tooltip id="tooltip">{toolTip}</Tooltip>}>
                <input type="text" id="rw_1_input" disabled={disabled} role="combobox" onBlur={this.handleInputBlur} style={{width: isFullWidth ? '100%' : ''}} placeholder={placeholder} aria-expanded={calendarVisible || timeVisible} aria-haspopup="true" aria-busy="false" aria-owns="rw_1_cal rw_1_time_listbox" tabIndex={tabIndex} autoComplete="off" value={`${operator}${inputValue}`} className="rw-input" onChange={this.handleValueChange} />
            </OverlayTrigger>);
        }
        return (<input type="text" id="rw_1_input" disabled={disabled} role="combobox" onBlur={this.handleInputBlur} style={{width: isFullWidth ? '100%' : ''}} placeholder={placeholder} aria-expanded={calendarVisible || timeVisible} aria-haspopup="true" aria-busy="false" aria-owns="rw_1_cal rw_1_time_listbox" tabIndex={tabIndex} autoComplete="off" value={`${operator}${inputValue}`} className="rw-input" onChange={this.handleValueChange} />);
    }
	renderHoursRange = () =>{
	    const { inputValue, operator, focused, openRangeInputs } = this.state;
	    const { toolTip, placeholder, tabIndex } = this.props;
	    const props = Object.keys(this.props).reduce((acc, key) => {
	        if (['placeholder', 'calendar', 'time', 'onChange', 'value'].includes(key)) {
	            // remove these props because they might have undesired effects to the subsequent components
	            return acc;
	        }
	        acc[key] = this.props[key];
	        return acc;

	    }, {});
	    // const calendarVisible = open === 'date';
	    // const timeVisible = open === 'time';
	    return (
	        <div style={{display: 'flex', flexDirection: 'column', border: 'solid 5px'}}>
	            <div style={{display: 'flex', flexDirection: 'row'}}>
	                <div onClick={this.toggleStart} style={{width: '50%', fontSize: '8px', height: '40px', color: 'black', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: openRangeInputs === 'start' || !openRangeInputs ? 'white' : 'gray', padding: '0.5rem'}}>
	                    <strong style={{fontSize: '12px'}}>Start</strong>
	                    <span>
							Please Enter ...
	                    </span>
	                </div>
	                <div onClick={this.toggleEnd} style={{width: '50%', fontSize: '8px', height: '40px', color: 'black', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: openRangeInputs === 'end' || !openRangeInputs ? 'white' : 'gray', padding: '0.5rem'}}>
	                    <strong style={{fontSize: '12px'}}>End</strong>
	                    <span>
							Please Enter ...
	                    </span>
	                </div>
	            </div>
	            <div style={{display: 'flex', flexDirection: 'column'}}>
	                <div tabIndex="-1" style={{ display: openRangeInputs === 'start' ? 'block' : 'none'}} onBlur={this.handleWidgetBlur} onFocus={this.handleWidgetFocus} className={`rw-datetimepicker rw-widget rw-has-neither ${focused ? 'rw-state-focus' : ''}`}>
	                    {this.renderInput(inputValue, operator, toolTip, placeholder, tabIndex, false, true)}
	                    <span className="rw-select">
	                        <button tabIndex="-1" title="Select Time" type="button" aria-disabled="false" aria-label="Select Time" className="rw-btn-time rw-btn" onClick={this.toggleStart}>
	                            <span aria-hidden="true" className="rw-i rw-i-clock-o"></span>
	                        </button>
	                    </span>
	                    <div style={{display: openRangeInputs === 'start' ? 'block' : 'none'}}>
	                        <Hours ref={this.attachTimeRef} onMouseDown={this.handleMouseDown} {...props} onClose={this.close} onSelect={this.handleTimeSelect} />
	                    </div>
	                </div>
	                <div tabIndex="-1" style={{ display: openRangeInputs === 'end' ? 'block' : 'none'}} onBlur={this.handleWidgetBlur} onFocus={this.handleWidgetFocus} className={`rw-datetimepicker rw-widget rw-has-neither ${focused ? 'rw-state-focus' : ''}`}>
	                    {this.renderInput(inputValue, operator, toolTip, placeholder, tabIndex, false, true)}
	                    <span className="rw-select">
	                        <button tabIndex="-1" title="Select Time" type="button" aria-disabled="false" aria-label="Select Time" className="rw-btn-time rw-btn" onClick={this.toggleEnd}>
	                            <span aria-hidden="true" className="rw-i rw-i-clock-o"></span>
	                        </button>
	                    </span>
	                    <div style={{display: openRangeInputs === 'end' ? 'block' : 'none'}}>
	                        <Hours ref={this.attachTimeRef} onMouseDown={this.handleMouseDown} {...props} onClose={this.close} onSelect={this.handleTimeSelect} />
	                    </div>
	                </div>
	            </div>
	        </div>
	    );
	}
	renderHours = () =>{
	 	const { inputValue, operator, focused, openRangeContainer } = this.state;
     	const { toolTip, placeholder, tabIndex, popupPosition } = this.props;
     	// const props = Object.keys(this.props).reduce((acc, key) => {
	    //  	if (['placeholder', 'calendar', 'time', 'onChange', 'value'].includes(key)) {
	    //  	// remove these props because they might have undesired effects to the subsequent components
	    // 	 	return acc;
	    //  	}
	    //  	acc[key] = this.props[key];
	    //  	return acc;

     	// }, {});
     	// const calendarVisible = open === 'date';
     	// const timeVisible = open === 'time';
	 	return (
		 	<div tabIndex="-1" onBlur={this.handleWidgetBlur} onFocus={this.handleWidgetFocus} className={`rw-datetimepicker range-time-input rw-widget rw-has-neither ${focused ? 'rw-state-focus' : ''}`}>
			 	{this.renderInput(inputValue, operator, toolTip, placeholder, tabIndex, false, true, true)}
			 	<span className="rw-select">
				 	<button tabIndex="-1" title="Select Time" type="button" aria-disabled="false" aria-label="Select Time" className="rw-btn-time rw-btn" onClick={this.toggleHandler}>
					 	<span aria-hidden="true" className="rw-i rw-i-clock-o"></span>
				 	</button>
			 	</span>
	            { openRangeContainer && <>
	                <div className={`rw-calendar-popup rw-popup-container ${popupPosition === 'top' ? 'rw-dropup' : ''} ${!openRangeContainer ? 'rw-popup-animating' : ''}`} style={{ display: openRangeContainer ? 'block' : 'none', overflow: openRangeContainer ? 'visible' : 'hidden' }}>
	                    {this.renderHoursRange()}
	                </div>
	            </> }

		 	</div>
	 	);
	}
	renderCalendarRange = () =>{
	    const { openRangeInputs } = this.state;
	    // const { popupPosition } = this.props;
	    const props = Object.keys(this.props).reduce((acc, key) => {
	        if (['placeholder', 'calendar', 'time', 'onChange', 'value'].includes(key)) {
	            // remove these props because they might have undesired effects to the subsequent components
	            return acc;
	        }
	        acc[key] = this.props[key];
	        return acc;

	    }, {});
	    // const calendarVisible = type === 'date';
	    // const timeVisible = open === 'time';
	    return (
	        <div style={{display: 'flex', flexDirection: 'column', border: 'solid 5px'}}>
	            <div style={{display: 'flex', flexDirection: 'row'}}>
	                <div onClick={this.toggleStart} style={{width: '50%', fontSize: '8px', height: '40px', color: 'black', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: openRangeInputs === 'start' || !openRangeInputs ? 'white' : 'gray', padding: '0.5rem'}}>
	                    <strong style={{fontSize: '12px'}}>Start</strong>
	                    <span>
							Please Enter ...
	                    </span>
	                </div>
	                <div onClick={this.toggleEnd} style={{width: '50%', fontSize: '8px', height: '40px', color: 'black', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: openRangeInputs === 'end' || !openRangeInputs ? 'white' : 'gray', padding: '0.5rem'}}>
	                    <strong style={{fontSize: '12px'}}>End</strong>
	                    <span>
							Please Enter ...
	                    </span>
	                </div>
	            </div>
	            <div style={{display: 'flex', flexDirection: 'column'}}>
	                <div style={{display: openRangeInputs === 'start' ? 'block' : 'none'}}>
	                    <Calendar
	                        tabIndex="-1"
	                        ref={this.attachCalRef}
	                        onMouseDown={this.handleMouseDown}
	                        onChange={this.handleCalendarChange}
	                        {...props}
	                        value={!isNil(this.props.value) ? new Date(this.props.value) : undefined}
	                        />
	                </div>
	                <div style={{display: openRangeInputs === 'end' ? 'block' : 'none'}}>
	                    <Calendar
	                                tabIndex="-1"
	                                ref={this.attachCalRef}
	                                onMouseDown={this.handleMouseDown}
	                                onChange={this.handleCalendarChange}
	                                {...props}
	                                value={!isNil(this.props.value) ? new Date(this.props.value) : undefined}
	                            />
	                </div>
	            </div>
	        </div>
	    );
	}
	renderCalendar = () =>{
	    const { inputValue, operator, focused, openRangeContainer, popupPosition } = this.state;
	    const { toolTip, placeholder, tabIndex } = this.props;
	    // const props = Object.keys(this.props).reduce((acc, key) => {
	    //     if (['placeholder', 'calendar', 'time', 'onChange', 'value'].includes(key)) {
	    //         // remove these props because they might have undesired effects to the subsequent components
	    //         return acc;
	    //     }
	    //     acc[key] = this.props[key];
	    //     return acc;

	    // }, {});
	    // const calendarVisible = type === 'date';
	    // const timeVisible = open === 'time';
	    return (
	        <div tabIndex="-1" onBlur={this.handleWidgetBlur} onFocus={this.handleWidgetFocus} className={`rw-datetimepicker range-time-input rw-widget rw-has-neither ${focused ? 'rw-state-focus' : ''}`}>
	            {this.renderInput(inputValue, operator, toolTip, placeholder, tabIndex, true, false, true)}
	            <span className="rw-select">
	                <button tabIndex="-1" title="Select Date" type="button" aria-disabled="false" aria-label="Select Date" className="rw-btn-calendar rw-btn" onClick={this.toggleHandler}>
	                    <span aria-hidden="true" className="rw-i rw-i-calendar"></span>
	                </button>
	            </span>
	            { openRangeContainer && <>
	                <div className={`rw-calendar-popup rw-popup-container ${popupPosition === 'top' ? 'rw-dropup' : ''} ${!openRangeContainer ? 'rw-popup-animating' : ''}`} style={{ display: openRangeContainer ? 'block' : 'none', overflow: openRangeContainer ? 'visible' : 'hidden', height: '285px' }}>
	            		{ this.renderCalendarRange() }
	                </div>
	            </>}
	        </div>
	    );
	}
	renderDateTimeRange = () =>{
	    const { inputValue, operator, openRangeInputs, openDateTTime } = this.state;
	    const { toolTip, placeholder, tabIndex } = this.props;

	    // const { popupPosition } = this.props;
	    const props = Object.keys(this.props).reduce((acc, key) => {
	        if (['placeholder', 'calendar', 'time', 'onChange', 'value'].includes(key)) {
	            // remove these props because they might have undesired effects to the subsequent components
	            return acc;
	        }
	        acc[key] = this.props[key];
	        return acc;

	    }, {});
	    // const calendarVisible = type === 'date';
	    // const timeVisible = open === 'time';
	    return (
	        <div style={{display: 'flex', flexDirection: 'column', border: 'solid 5px', maxHeight: '360px', overflowY: 'auto'}}>
	            <div style={{display: 'flex', flexDirection: 'row'}}>
	                <div onClick={this.toggleStart} style={{width: '50%', fontSize: '8px', height: '40px', color: 'black', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: openRangeInputs === 'start' || !openRangeInputs ? 'white' : 'gray', padding: '0.5rem'}}>
	                    <strong style={{fontSize: '12px'}}>Start</strong>
	                    <span>
							Please Enter ...
	                    </span>
	                </div>
	                <div onClick={this.toggleEnd} style={{width: '50%', fontSize: '8px', height: '40px', color: 'black', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: openRangeInputs === 'end' || !openRangeInputs ? 'white' : 'gray', padding: '0.5rem'}}>
	                    <strong style={{fontSize: '12px'}}>End</strong>
	                    <span>
							Please Enter ...
	                    </span>
	                </div>
	            </div>
	            <div style={{display: 'flex', flexDirection: 'column'}}>
	                <div style={{display: openRangeInputs === 'start' ? 'block' : 'none'}}>
	                    <Calendar
	                        tabIndex="-1"
	                        ref={this.attachCalRef}
	                        onMouseDown={this.handleMouseDown}
	                        onChange={this.handleCalendarChange}
	                        {...props}
	                        value={!isNil(this.props.value) ? new Date(this.props.value) : undefined}
	                        />
	                	<div style={{ display: openRangeInputs === 'start' ? 'block' : 'none'}}>
	                        <div style={{display: 'flex'}}>
	                    {this.renderInput(inputValue, operator, toolTip, placeholder, tabIndex, false, true, false, true)}
	                            <span className="">
	                                <button tabIndex="-1" title="Select Time" type="button" aria-disabled="false" aria-label="Select Time" className="rw-btn-time rw-btn" onClick={this.toggleTimeInDateTime}>
	                                    <span aria-hidden="true" className="rw-i rw-i-clock-o"></span>
	                                </button>
	                            </span>
	                        </div>
	                    <div style={{display: openDateTTime ? 'block' : 'none'}}>
	                        <Hours ref={this.attachTimeRef} onMouseDown={this.handleMouseDown} {...props} onClose={this.close} onSelect={this.handleTimeSelect} />
	                    </div>
	                </div>
	                </div>
	                <div style={{display: openRangeInputs === 'end' ? 'block' : 'none'}}>
	                    <Calendar
	                                tabIndex="-1"
	                                ref={this.attachCalRef}
	                                onMouseDown={this.handleMouseDown}
	                                onChange={this.handleCalendarChange}
	                                {...props}
	                                value={!isNil(this.props.value) ? new Date(this.props.value) : undefined}
	                            />
	                	<div style={{ display: openRangeInputs === 'end' ? 'block' : 'none'}}>
	                        <div style={{display: 'flex'}}>
	                            {this.renderInput(inputValue, operator, toolTip, placeholder, tabIndex, false, true, false, true)}
	                            <span className="">
	                                <button tabIndex="-1" title="Select Time" type="button" aria-disabled="false" aria-label="Select Time" className="rw-btn-time rw-btn" onClick={this.toggleTimeInDateTime}>
	                                    <span aria-hidden="true" className="rw-i rw-i-clock-o"></span>
	                                </button>
	                            </span>
	                        </div>
	                        <div style={{display: openDateTTime ? 'block' : 'none'}}>
	                            <Hours ref={this.attachTimeRef} onMouseDown={this.handleMouseDown} {...props} onClose={this.close} onSelect={this.handleTimeSelect} />
	                        </div>
	                	</div>
	                </div>
	            </div>
	        </div>
	    );
	}
	renderCalendarTimeDate = () =>{
	    const { openRangeContainer, inputValue, operator, focused } = this.state;
	    const { toolTip, placeholder, tabIndex, popupPosition } = this.props;
	    // const props = Object.keys(this.props).reduce((acc, key) => {
	    //     if (['placeholder', 'calendar', 'time', 'onChange', 'value'].includes(key)) {
	    //         // remove these props because they might have undesired effects to the subsequent components
	    //         return acc;
	    //     }
	    //     acc[key] = this.props[key];
	    //     return acc;

	    // }, {});
	    // const calendarVisible = open === 'date';
	    // const timeVisible = open === 'time';
	    return (
	        <div tabIndex="-1" onBlur={this.handleWidgetBlur} onFocus={this.handleWidgetFocus} className={`rw-datetimepicker range-time-input rw-widget rw-has-both ${focused ? 'rw-state-focus' : ''}`}>
	            {this.renderInput(inputValue, operator, toolTip, placeholder, tabIndex, true, true, true)}
	            <span className="rw-select">
	                <button tabIndex="-1" title="Select Date" type="button" aria-disabled="false" aria-label="Select Date" className="rw-btn-calendar rw-btn" onClick={this.toggleHandler}>
	                    <span aria-hidden="true" className="rw-i rw-i-calendar"></span>
	                </button>
	            </span>
	            { openRangeContainer && <>
	                <div className={`rw-calendar-popup rw-popup-container ${popupPosition === 'top' ? 'rw-dropup' : ''} ${!openRangeContainer ? 'rw-popup-animating' : ''}`} style={{ display: openRangeContainer ? 'block' : 'none', overflow: openRangeContainer ? 'visible' : 'hidden' }}>
	                    {this.renderDateTimeRange()}
	                </div>
	            </> }
	        </div>
	    );
	}

	render() {
	    // const { open } = this.state;
	    const { type } = this.props;
	    // const props = Object.keys(this.props).reduce((acc, key) => {
	    //     if (['placeholder', 'calendar', 'time', 'onChange', 'value'].includes(key)) {
	    //         // remove these props because they might have undesired effects to the subsequent components
	    //         return acc;
	    //     }
	    //     acc[key] = this.props[key];
	    //     return acc;

	    // }, {});
	    // const calendarVisible = open === 'date';
	    // const timeVisible = open === 'time';
	    if (type === 'time') return this.renderHours();
	    else if (type === 'date') return this.renderCalendar();
	    return this.renderCalendarTimeDate();
	}

    inputFlush = false;
    // Ignore blur to manual control de-rendering of cal/time popup
    ignoreBlur = false;

    handleWidgetFocus = () => {
        this.setState({ focused: true });
        this.ignoreBlur = false;
    }

    handleWidgetBlur = () => {
        if (this.ignoreBlur) {
            return;
        }
        this.setState({ open: '', focused: false });
    }
	rangeContainerMouseLeaveHandler = () => {
	    this.setState({ openRangeContainer: false });
	}
    handleMouseDown = () => {
        this.ignoreBlur = true;
    }

    toggleStart = () => {
        if (this.state.openRangeInputs !== 'start') {
            this.setState({ openRangeInputs: 'start', openDateTTime: false, openDateTCalendar: false });
        }
    }
	toggleEnd = () => {
	 	if (this.state.openRangeInputs !== 'end') {
		  	this.setState({ openRangeInputs: 'end', openDateTTime: false, openDateTCalendar: false });
	 	}
	}
	toggleTimeInDateTime = () => {
	    this.setState(prev => ({ openDateTTime: !prev.openDateTTime }));
	}
	toggleHandler = () => {
	    this.setState(prevState => ({ openRangeContainer: !prevState.openRangeContainer, openDateTTime: false, openDateTCalendar: false }));
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
        this.setState({ open: '' });
    }

    openHandler = () => {
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
            this.timeRef.handleKeyDown(e);
        }

        if (calVisible) {
            this.calRef.refs.inner.handleKeyDown(e);
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
        const date = setTime(value, this.state.date || new Date());
        const inputValue = this.format(date);
        this.setState({ date, inputValue, open: '' });
        this.props.onChange(date, `${this.state.operator}${inputValue}`);
    }

    handleTimeSelect = time => {
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

