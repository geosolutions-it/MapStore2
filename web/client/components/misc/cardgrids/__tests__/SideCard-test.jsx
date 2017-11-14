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
const SideCard = require('../SideCard');
describe('SideCard component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('SideCard rendering with defaults', () => {
        ReactDOM.render(<SideCard />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.mapstore-side-card');
        expect(el).toExist();
        expect(container.querySelector('.selected')).toNotExist();
    });
    it('SideCard selected', () => {
        ReactDOM.render(<SideCard selected/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.selected');
        expect(el).toExist();
    });
});
