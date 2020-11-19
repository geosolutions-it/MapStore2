/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import ReactDOM from 'react-dom';
import Header from '../Header';
import Toolbar from '../toolbars/Toolbar';
import expect from 'expect';

describe('Test for TopToolbar component', () => {
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
        ReactDOM.render(<Header/>, document.getElementById("container"));
        const el = document.getElementsByClassName("data-grid-top-toolbar")[0];
        expect(el).toExist();
    });
    it('render with ViewTools', () => {
        ReactDOM.render(<Header toolbar={Toolbar}/>, document.getElementById("container"));
        const el = document.getElementsByClassName("data-grid-top-toolbar")[0];
        expect(el).toExist();
    });
});
