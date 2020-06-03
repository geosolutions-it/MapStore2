/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';

import Details from '../Details';

describe('Details component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Details default rendering', () => {
        ReactDOM.render(<Details/>, document.getElementById('container'));
        expect(document.getElementsByClassName('ms-details-component')[0]).toExist();
        expect(document.getElementsByClassName('spinner')[0]).toExist();
        expect(document.getElementsByClassName('rdw-editor-main')[0]).toNotExist();
    });
    it('Details with editing=true', () => {
        ReactDOM.render(<Details editing/>, document.getElementById('container'));
        expect(document.getElementsByClassName('ms-details-component')[0]).toExist();
        expect(document.getElementsByClassName('spinner')[0]).toNotExist();
        expect(document.getElementsByClassName('rdw-editor-main')[0]).toExist();
    });
});
