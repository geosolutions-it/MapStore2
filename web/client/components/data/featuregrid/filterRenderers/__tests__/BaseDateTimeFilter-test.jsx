/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
import React from 'react';
import ReactDOM from 'react-dom';
import BaseDateTimeFilter from '../BaseDateTimeFilter';
import expect from 'expect';
import Moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';

momentLocalizer(Moment);
describe('Test for BaseDateTimeFilter component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('render with defaults', () => {
        ReactDOM.render(<BaseDateTimeFilter />, document.getElementById("container"));
        const el = document.getElementsByTagName("input")[0];
        expect(el).toExist();
    });
    it('render with value', () => {
        ReactDOM.render(<BaseDateTimeFilter type="date" value="2017-01-05Z" />, document.getElementById("container"));
        const el = document.getElementsByTagName("input")[0];
        expect(el).toExist();
        const input = document.getElementsByTagName("input")[0];
        expect(input.value.indexOf(5) > 0).toBe(true);
        ReactDOM.render(<BaseDateTimeFilter type="time" value="04:04:04Z" />, document.getElementById("container"));
        expect(el).toExist();
        ReactDOM.render(<BaseDateTimeFilter type="date-time" value="2017-01-05T04:04:04Z" />, document.getElementById("container"));
        expect(el).toExist();

    });
    it('render with value as startDate', () => {
        ReactDOM.render(<BaseDateTimeFilter type="date" value={{startDate: "2017-01-05Z"}} />, document.getElementById("container"));
        const el = document.getElementsByTagName("input")[0];
        expect(el).toExist();
        const input = document.getElementsByTagName("input")[0];
        expect(input.value.indexOf(5) > 0).toBe(true);
        ReactDOM.render(<BaseDateTimeFilter type="time" value={{startDate: "04:04:04Z"}} />, document.getElementById("container"));
        expect(el).toExist();
        ReactDOM.render(<BaseDateTimeFilter type="date-time" value={{startDate: "2017-01-05T04:04:04Z"}} />, document.getElementById("container"));
        expect(el).toExist();

    });
});
