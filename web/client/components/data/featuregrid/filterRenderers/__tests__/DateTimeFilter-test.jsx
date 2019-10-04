/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
import React from 'react';
import ReactDOM from 'react-dom';
import DateTimeFilter from '../DateTimeFilter';
import expect from 'expect';
import Moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
import TestUtils from 'react-dom/test-utils';

momentLocalizer(Moment);

const intlMock = {
    formatMessage: () => 'any message'
};

describe('Test for DateTimeFilter component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('DateTimeFilter render with defaults', () => {
        ReactDOM.render(<DateTimeFilter intl={intlMock}/>, document.getElementById("container"));
        const el = document.getElementsByTagName("input")[0];
        expect(el).toExist();
    });
    it('DateTimeFilter render with value', () => {
        ReactDOM.render(<DateTimeFilter type="date" value="2017-01-05Z"/>, document.getElementById("container"));
        const el = document.getElementsByTagName("input")[0];
        expect(el).toExist();
        const input = document.getElementsByTagName("input")[0];
        expect(input.value.length > 0).toBe(true);
    });

    it('DateTimeFilter transform !== into <>', (done) => {
        const format='DD/MM/YYYY hh:mm:ss'; // eslint-disable-line space-infix-ops
        const date = '22/05/2010';
        const handleChange = ({value, operator}) => {
            expect(value.startDate).toExist();
            expect(operator).toEqual('<>');
            done();
        };
        ReactDOM.render(<DateTimeFilter onChange={handleChange} format={format} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const input = container.querySelector('input');
        TestUtils.Simulate.change(input, { target: { value: `!== ${date}` } });
        TestUtils.Simulate.keyDown(input, {key: 'Enter'});
    });

    it('DateTimeFilter transform === into =', (done) => {
        const format='DD/MM/YYYY hh:mm:ss'; // eslint-disable-line space-infix-ops
        const date = '22/05/2010';
        const handleChange = ({value, operator}) => {
            expect(value.startDate).toExist();
            expect(operator).toEqual('=');
            done();
        };
        ReactDOM.render(<DateTimeFilter onChange={handleChange} format={format} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const input = container.querySelector('input');
        TestUtils.Simulate.change(input, { target: { value: `=== ${date}` } });
        TestUtils.Simulate.keyDown(input, {key: 'Enter'});
    });
});
