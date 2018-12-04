/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const expect = require('expect');
const WidgetsBar = require('../WidgetsBar');

describe('WidgetsBar component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('WidgetsBar rendering with defaults', () => {
        ReactDOM.render(<WidgetsBar />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.widgets-bar');
        expect(el).toExist();
    });
    it('WidgetsBar rendering widgets', () => {
        ReactDOM.render(<WidgetsBar widgets={[{type: "text"}]} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.btn-group button');
        expect(el).toExist();
    });

});
