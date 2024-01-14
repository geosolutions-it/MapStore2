

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import TestUtils from 'react-dom/test-utils';
import DateTimePickerWithRange from '../RangedDateTimePicker';

describe('DateTimePickerWithRange component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('DateTimePickerWithRange with type time rendering with defaults', () => {
        ReactDOM.render(<DateTimePickerWithRange type="time" time operator="=" />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.rw-datetimepicker.range-time-input.rw-widget');
        const clockIcon = container.querySelector('.rw-i.rw-i-clock-o');
        expect(el).toExist();
        expect(clockIcon).toExist();
    });

    it('DateTimePickerWithRange with type date rendering with defaults', () => {
        ReactDOM.render(<DateTimePickerWithRange type="date" calendar operator="=" />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.rw-datetimepicker.range-time-input.rw-widget');
        const clockIcon = container.querySelector('.rw-i.rw-i-calendar');
        expect(el).toExist();
        expect(clockIcon).toExist();
    });
    it('DateTimePickerWithRange with type date-time rendering with defaults', () => {
        ReactDOM.render(<DateTimePickerWithRange type="date-time" calendar operator="=" />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.rw-datetimepicker.range-time-input.rw-widget');
        const dateTimeIcon = container.querySelector('.glyphicon-date-time');
        expect(el).toExist();
        expect(dateTimeIcon).toExist();
    });

    it('DateTimePickerWithRange show calendar on calendar button click', function() {
        ReactDOM.render(<DateTimePickerWithRange type="date" time operator="=" />, document.getElementById("container"));
        const container = document.getElementById('container');
        const button = container.querySelector('.rw-btn-calendar');
        TestUtils.Simulate.click(button);
        const calendar = document.querySelector('.shadow-soft.picker-container');
        expect(calendar.style.position).toBe('relative');
        expect(calendar).toExist();
    });
});
