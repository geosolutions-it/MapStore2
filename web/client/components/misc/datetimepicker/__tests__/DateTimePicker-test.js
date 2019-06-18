

import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import expect from 'expect';
import TestUtils from 'react-dom/test-utils';
import DateTimePicker from '../index';

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
        ReactDOM.render(<DateTimePicker value={today} operator="<" />, document.getElementById("container"));
        const container = document.getElementById('container');
        const input = container.querySelector('input');
        const match = /\s*(!==|!=|<>|<=|>=|===|==|=|<|>)?(.*)/.exec(input.value);
        expect(match[2]).toEqual(moment(today).format('lll'));
        expect(match[1]).toEqual('<');
    });

    it('DateTimePicker show calendar on calendar button click', function() {
        ReactDOM.render(<DateTimePicker />, document.getElementById("container"));
        const container = document.getElementById('container');
        const button = container.querySelector('.rw-btn-calendar');
        TestUtils.Simulate.click(button);
        const calendar = container.querySelector('.rw-calendar-popup');
        expect(calendar.style.display).toBe('block');
    });

    it('DateTimePicker show hours on time button click', function() {
        ReactDOM.render(<DateTimePicker />, document.getElementById("container"));
        const container = document.getElementById('container');
        const button = container.querySelector('.rw-btn-time');
        TestUtils.Simulate.click(button);
        const hourPopup = container.querySelector('.rw-popup-container');
        expect(hourPopup.style.display).toBe('block');
    });

    it('DateTimePicker can parse !== operator', function(done) {
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

});
