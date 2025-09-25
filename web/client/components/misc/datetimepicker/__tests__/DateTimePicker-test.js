

import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import expect from 'expect';
import TestUtils, { act } from 'react-dom/test-utils';
import DateTimePicker from '../index';
import {getUTCTimePart} from "../../../../utils/TimeUtils";

describe('DateTimePicker component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('DateTimePicker rendering with defaults', () => {
        ReactDOM.render(<DateTimePicker />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.rw-datetimepicker');
        expect(el).toExist();
    });

    it('DateTimePicker rendering with quick time selectors', () => {
        ReactDOM.render(<DateTimePicker type="date" calendar
            quickDateTimeSelectors={[{type: "date", value: "{today}+P0D", label: "Test"}]} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.rw-datetimepicker');
        const button = container.querySelector('.rw-btn-calendar');
        TestUtils.Simulate.click(button);
        const quickTimeSelector = document.querySelector('.quick-time-selector');
        expect(el).toBeTruthy();
        expect(quickTimeSelector).toBeTruthy();
    });

    it('DateTimePicker with value prop of date type', function() {
        const today = new Date();
        ReactDOM.render(<DateTimePicker value={today} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const input = container.querySelector('input');
        expect(input.value).toEqual(moment(today).format('lll'));
    });

    it('DateTimePicker with value prop of not date type', function() {
        const today = '>05-30-2019';
        ReactDOM.render(<DateTimePicker value={today} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const input = container.querySelector('input');
        expect(input.value).toEqual('');
    });

    it('DateTimePicker with value and operator prop', function() {
        const today = new Date();
        ReactDOM.render(<DateTimePicker value={today} operator="<" type="date" />, document.getElementById("container"));
        const container = document.getElementById('container');
        const input = container.querySelector('input');
        const match = /\s*(!==|!=|<>|<=|>=|===|==|=|<|>)?(.*)/.exec(input.value);
        expect(match[2]).toEqual(moment(today).format('lll'));
        expect(match[1]).toEqual('<');
    });

    it('DateTimePicker show calendar on calendar button click', function() {
        ReactDOM.render(<DateTimePicker type="date" />, document.getElementById("container"));
        const container = document.getElementById('container');
        const button = container.querySelector('.rw-btn-calendar');
        TestUtils.Simulate.click(button);
        const calendar = document.querySelector('.shadow-soft.picker-container .rw-calendar.rw-widget');
        expect(calendar).toExist();
        expect(calendar.style.display).toNotEqual('none');
    });
    it('calendar opens to today when value is null or undefined', function() {
        ReactDOM.render(<DateTimePicker type="date" />, document.getElementById("container"));
        const container = document.getElementById('container');
        const button = container.querySelector('.rw-btn-calendar');
        TestUtils.Simulate.click(button);
        const monthLabel = document.querySelector('.ms-popover-overlay > div > div.shadow-soft .rw-calendar.rw-widget .rw-btn-view');
        expect(monthLabel.innerHTML).toBe(moment().format('MMMM YYYY'));
    });
    it('calendar opens at the values date', function() {
        const value = "01-01-2010";
        ReactDOM.render(<DateTimePicker type="date" value={value} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const button = container.querySelector('.rw-btn-calendar');
        TestUtils.Simulate.click(button);
        const monthLabel = document.querySelector('.ms-popover-overlay > div > div.shadow-soft .rw-calendar.rw-widget .rw-btn-view');
        expect(monthLabel.innerHTML).toBe(moment(value).format('MMMM YYYY'));
    });
    it('DateTimePicker show hours on time button click', function() {
        ReactDOM.render(<DateTimePicker type="time" />, document.getElementById("container"));
        const container = document.getElementById('container');
        const button = container.querySelector('.rw-btn-time');
        TestUtils.Simulate.click(button);
        const hourPopup = document.querySelector('.ms-popover-overlay > div > div.shadow-soft .dateTime-picker-hours');
        expect(hourPopup.style.display).toNotEqual('none');
    });

    it('DateTimePicker can parse !== operator', function(done) {
        const date = '01-01-2010';
        const handleChange = (value, stringDate) => {
            const match = /\s*(!==|!=|<>|<=|>=|===|==|=|<|>)?(.*)/.exec(stringDate);
            expect(value).toEqual(moment(date, 'lll').toDate());
            expect(match[1]).toEqual('!==');
            done();
        };
        ReactDOM.render(<DateTimePicker onChange={handleChange} type="date-time" />, document.getElementById("container"));
        const container = document.getElementById('container');
        const input = container.querySelector('input');
        TestUtils.Simulate.focus(input);
        TestUtils.Simulate.change(input, { target: { value: `!== ${date}` } });
        TestUtils.Simulate.blur(input, {key: 'inputFocus'});
    });

    it('DateTimePicker can call onChange on press enter key', function(done) {
        const date = '01-01-2010';
        const handleChange = (value, stringDate) => {
            const match = /\s*(!==|!=|<>|<=|>=|===|==|=|<|>)?(.*)/.exec(stringDate);
            expect(value).toEqual(moment(date, 'lll').toDate());
            expect(match[1]).toEqual('!==');
            done();
        };
        ReactDOM.render(<DateTimePicker onChange={handleChange} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const input = container.querySelector('input');
        TestUtils.Simulate.change(input, { target: { value: `!== ${date}` } });
        TestUtils.Simulate.keyDown(input, {key: 'Enter'});
    });

    it('DateTimePicker should parse date according to provided format', function(done) {
        const format='DD/MM/YYYY hh:mm:ss'; // eslint-disable-line space-infix-ops
        const date = '22/05/2010';
        const handleChange = (value, stringDate) => {
            const match = /\s*(!==|!=|<>|<=|>=|===|==|=|<|>)?(.*)/.exec(stringDate);
            expect(value).toEqual(moment(date, format).toDate());
            expect(match[1]).toEqual('!==');
            done();
        };
        ReactDOM.render(<DateTimePicker onChange={handleChange} format={format} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const input = container.querySelector('input');
        TestUtils.Simulate.change(input, { target: { value: `!== ${date}` } });
        TestUtils.Simulate.keyDown(input, {key: 'Enter'});
    });

    it('DateTimePicker should fails to parse date with invalid format', function(done) {
        const format='DD/MM/YYYY hh:mm:ss'; // eslint-disable-line space-infix-ops
        const date = '05/22/2010';
        const handleChange = (value, stringValue) => {
            expect(value).toEqual(null);
            expect(stringValue).toEqual('!==');
            done();
        };
        ReactDOM.render(<DateTimePicker onChange={handleChange} format={format} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const input = container.querySelector('input');
        TestUtils.Simulate.change(input, { target: { value: `!== ${date}` } });
        TestUtils.Simulate.keyDown(input, {key: 'Enter'});
    });
    it('DateTimePicker test popup position', function(done) {
        ReactDOM.render(<DateTimePicker popupPosition="top" />, document.getElementById("container"));
        const container = document.getElementById('container');
        const calendar = container.querySelector('.rw-btn-calendar');
        TestUtils.Simulate.click(calendar);
        const dropUp = document.querySelector('.shadow-soft.picker-container div').getAttribute('popupposition');
        expect(dropUp).toEqual('top');
        done();
    });

    it('DateTimePicker test calendarSetHours disabled option', function(done) {
        const date = '2010-01-01T00:00:00Z';
        const handleChange = (value) => {
            const hours = getUTCTimePart(value);
            expect(hours).toEqual('00:00:00');
            done();
        };
        const dateObj = moment.utc(date, 'YYYY-MM-DDTHH:mm:ss[Z]').toDate();
        ReactDOM.render(<DateTimePicker format="YYYY-MM-DDTHH:mm:ss[Z]" value={dateObj} currentDate={dateObj} onChange={handleChange} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const calendar = container.querySelector('.rw-btn-calendar');
        TestUtils.Simulate.click(calendar);
        const day = document.querySelector('.shadow-soft.picker-container tbody tr td:first-child .rw-btn');
        TestUtils.Simulate.click(day);
    });
    it('DateTimePicker avoid error when text (e.g. "2") is inserted and calendar is clicked', (done) => {
        // Error boundary component for testing
        class ErrorBoundary extends React.Component {
            constructor(props) {
                super(props);
                this.state = { hasError: false, error: null };
            }
            static getDerivedStateFromError(error) {
                return { hasError: true, error };
            }
            componentDidCatch(error, info) {

                console.error(
                    error,

                    info.componentStack,
                    React.captureOwnerStack()
                );
                done(error);
            }
            render() {
                if (this.state.hasError) {
                    done("Error");
                    return <div data-testid="error">{this.state.error.message}</div>;
                }
                return this.props.children;
            }
        }

        act(() => {
            ReactDOM.render(
                <ErrorBoundary>
                    <DateTimePicker
                        calendar
                        type="date-time"
                        defaultValue="2" />
                </ErrorBoundary>,
                document.getElementById("container")
            );
            const container = document.getElementById('container');
            const input = container.querySelector('input');
            // // TestUtils.Simulate.change(input, { target: { value: '2' } });
            input.value = '2';
            const button = container.querySelector('.rw-btn-calendar');
            TestUtils.Simulate.click(button);
        });

        const container = document.getElementById('container');
        setTimeout(() => {
            const error = container.querySelector('[data-testid="error"]');
            if (error) {
                done(error.innerHTML);
            } else {
                done();
            }
        }, 500);
    });
});
