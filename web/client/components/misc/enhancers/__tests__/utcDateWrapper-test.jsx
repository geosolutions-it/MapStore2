/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import {createSink} from 'recompose';

import expect from 'expect';
import utcDateWrapper from '../utcDateWrapper';
import {DateTimePicker} from 'react-widgets';
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
momentLocalizer(moment);
const enhanceCustom = utcDateWrapper({dateProp: "value", dateTypeProp: "type", setDateProp: "onChange"});
const CMP = enhanceCustom((props) => <DateTimePicker id="CMP" {...props}/>);

describe('utcDateWrapper enhancher', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('testing date type', () => {
        ReactDOM.render(<CMP
            value="2018-01-02Z"
            type="date"
            format="DD/MM/YYYY"
        />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('#CMP');
        expect(el).toExist();
        const inputs = container.getElementsByTagName('input');
        expect(inputs).toExist();
        expect(inputs.length).toBe(1);
        expect(inputs[0].value).toBe('02/01/2018');
    });
    it('testing time type', () => {
        ReactDOM.render(<CMP
            value="03:00:00Z"
            format="HH:mm:SS"
            type="time"
        />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('#CMP');
        expect(el).toExist();
        const inputs = container.getElementsByTagName('input');
        expect(inputs).toExist();
        expect(inputs.length).toBe(1);
        expect(inputs[0].value).toBe('03:00:00');
    });
    it('testing date-time type', () => {
        ReactDOM.render(<CMP
            value="2018-01-02T03:00:00Z"
            format="DD/MM/YYYY HH:mm:SS"
            type="date-time"
        />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('#CMP');
        expect(el).toExist();
        const inputs = container.getElementsByTagName('input');
        expect(inputs).toExist();
        expect(inputs.length).toBe(1);
        expect(inputs[0].value).toBe('02/01/2018 03:00:00');
    });

    it('UTCDateWrapper calls onSetDate', (done) => {
        const actions = {
            onSetDate: () => { }
        };
        const spyonSetDate = expect.spyOn(actions, 'onSetDate');

        const check = (date, expectedUTCString, index, callback = () => {}) => (props) => {
            expect(props).toExist();
            // check component as expectedUTCDate
            // check the current date is properly shifted
            expect(date.getTime() + date.getTimezoneOffset() * 60000).toEqual(props.date.getTime());

            // test callback
            props.onSetDate(props.date);
            expect(spyonSetDate).toHaveBeenCalled();

            // check the returned date is properly conveerted back to UTC Date
            expect(spyonSetDate.calls[index].arguments[0].toISOString()).toBe(expectedUTCString);
            callback();
        };
        const Sink = utcDateWrapper()(createSink( props => {
            props.check(props);
        }));
        const TESTS = [
            "2010-01-01T00:00:00.000Z",
            "2010-01-02T00:00:00.000Z",
            "2010-01-02T23:59:59.999Z",
            "2010-12-31T00:00:00.000Z",
            "2010-12-31T23:59:59.999Z",
            "2010-01-01T00:00:00.000Z",
            "2018-06-01T12:38:42.100Z"
        ];
        TESTS.map((t, i) =>
            ReactDOM.render(<Sink onSetDate={actions.onSetDate} date={new Date(t)} check={check(new Date(t), t, i, i === TESTS.length - 1 ? () => done() : undefined)}/>, document.getElementById("container")));
    });

});
