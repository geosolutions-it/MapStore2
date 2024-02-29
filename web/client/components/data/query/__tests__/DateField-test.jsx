/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import DateField from '../DateField.jsx';
import expect from 'expect';

describe('DateField', () => {

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates the DateField component with single date', () => {
        let operator = ">";
        let fieldName = "valueField";
        let fieldRowId = 200;
        let fieldValue = {startDate: new Date(86400000), endDate: null};

        ReactDOM.render(
            <DateField attType="date"
                operator={operator}
                fieldName={fieldName}
                fieldRowId={fieldRowId}
                fieldValue={fieldValue}/>,
            document.getElementById("container")
        );
        const container = document.getElementById('container');
        expect(container).toBeTruthy();
        const datePicker = container.querySelector('.rw-datetimepicker');
        expect(datePicker).toBeTruthy();
        const button = container.querySelector('.rw-btn-calendar');
        expect(button).toBeTruthy();
        ReactTestUtils.Simulate.click(button);
        const quickTimeSelector = document.querySelectorAll('.quick-time-selector');
        expect(quickTimeSelector).toBeTruthy();
        const selectorBtns = document.querySelectorAll('.selector-btn');
        expect(selectorBtns).toBeTruthy();
        expect(selectorBtns.length).toBe(3);
    });

    it('creates the DateField component with date range', () => {
        let operator = "><";
        let fieldName = "valueField";
        let fieldRowId = 200;
        let fieldValue = {startDate: new Date(86400000), endDate: new Date(96400000)};

        ReactDOM.render(
            <DateField attType="date"
                operator={operator}
                fieldName={fieldName}
                fieldRowId={fieldRowId}
                fieldValue={fieldValue}/>,
            document.getElementById("container")
        );
        const container = document.getElementById('container');
        const el = container.querySelector('.rw-datetimepicker.range-time-input.rw-widget');
        const clockIcon = container.querySelector('.rw-i.rw-i-calendar');
        expect(el).toBeTruthy();
        expect(clockIcon).toBeTruthy();
    });

    it('creates the DateField with date-time type', () => {
        let operator = ">";
        let fieldName = "valueField";
        let fieldRowId = 200;
        let fieldValue = {startDate: new Date(86400000), endDate: null};

        ReactDOM.render(
            <DateField
                timeEnabled
                dateEnabled
                attType="date-time"
                operator={operator}
                fieldName={fieldName}
                fieldRowId={fieldRowId}
                fieldValue={fieldValue}/>,
            document.getElementById("container")
        );
        const container = document.getElementById('container');
        expect(container).toBeTruthy();
        const el = container.querySelector('.rw-datetimepicker.range-time-input.rw-widget');
        const dateTimeIcon = container.querySelector('.glyphicon-date-time');
        expect(el).toBeTruthy();
        expect(dateTimeIcon).toBeTruthy();
        const button = container.querySelector('.rw-btn-calendar');
        expect(button).toBeTruthy();
        ReactTestUtils.Simulate.click(button);
        const quickTimeSelector = document.querySelectorAll('.quick-time-selector');
        expect(quickTimeSelector).toBeTruthy();
        const selectorBtns = document.querySelectorAll('.selector-btn');
        expect(selectorBtns).toBeTruthy();
        expect(selectorBtns.length).toBe(3);
    });

    it('creates the DateField with time type', () => {
        let operator = ">";
        let fieldName = "valueField";
        let fieldRowId = 200;
        let fieldValue = {startDate: new Date(86400000), endDate: null};

        ReactDOM.render(
            <DateField
                timeEnabled
                dateEnabled={false}
                attType="time"
                operator={operator}
                fieldName={fieldName}
                fieldRowId={fieldRowId}
                fieldValue={fieldValue}/>,
            document.getElementById("container")
        );
        const container = document.getElementById('container');
        expect(container).toBeTruthy();
        const button = container.querySelector('.rw-btn-time');
        expect(button).toBeTruthy();
    });
});
