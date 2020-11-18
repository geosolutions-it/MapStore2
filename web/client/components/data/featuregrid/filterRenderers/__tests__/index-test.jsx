/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import {getFilterRenderer} from '../index';

describe('Test for filterRenderer function', () => {
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
        let Cmp = getFilterRenderer("unknown");
        expect(Cmp).toExist();
        ReactDOM.render(<Cmp />, document.getElementById("container"));
        Cmp = getFilterRenderer("string");
        expect(Cmp).toExist();
        ReactDOM.render(<Cmp />, document.getElementById("container"));
        Cmp = getFilterRenderer("int");
        expect(Cmp).toExist();
        ReactDOM.render(<Cmp />, document.getElementById("container"));
        Cmp = getFilterRenderer("number");
        expect(Cmp).toExist();
        ReactDOM.render(<Cmp />, document.getElementById("container"));
        Cmp = getFilterRenderer("time");
        expect(Cmp).toExist();
        ReactDOM.render(<Cmp />, document.getElementById("container"));
        Cmp = getFilterRenderer("date");
        expect(Cmp).toExist();
        ReactDOM.render(<Cmp />, document.getElementById("container"));
        Cmp = getFilterRenderer("date-time");
        expect(Cmp).toExist();
        ReactDOM.render(<Cmp />, document.getElementById("container"));
    });
});
