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
    it('render with defaults', () => {
        ReactDOM.render(<DateTimeFilter intl={intlMock}/>, document.getElementById("container"));
        const el = document.getElementsByTagName("input")[0];
        expect(el).toExist();
    });
    it('render with value', () => {
        ReactDOM.render(<DateTimeFilter type="date" value="2017-01-05Z"/>, document.getElementById("container"));
        const el = document.getElementsByTagName("input")[0];
        expect(el).toExist();
        const input = document.getElementsByTagName("input")[0];
        expect(input.value.length > 0).toBe(true);
    });
});
