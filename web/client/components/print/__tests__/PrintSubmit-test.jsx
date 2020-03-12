/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var React = require('react');
var ReactDOM = require('react-dom');
var PrintSubmit = require('../PrintSubmit');

var ReactTestUtils = require('react-dom/test-utils');

describe("Test the PrintSubmit component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates component with defaults', () => {
        const cmp = ReactDOM.render(<PrintSubmit/>, document.getElementById("container"));
        expect(cmp).toBeTruthy();

        const node = ReactDOM.findDOMNode(cmp);
        expect(node).toBeTruthy();
        expect(node.tagName.toLowerCase()).toBe('button');
        expect(node.disabled).toBeFalsy();
    });

    it('creates component disabled', () => {
        const cmp = ReactDOM.render(<PrintSubmit disabled/>, document.getElementById("container"));
        expect(cmp).toBeTruthy();

        const node = ReactDOM.findDOMNode(cmp);
        expect(node).toBeTruthy();
        expect(node.tagName.toLowerCase()).toBe('button');
        expect(node.disabled).toBeTruthy();
    });

    it('creates component loading', () => {
        const cmp = ReactDOM.render(<PrintSubmit loading/>, document.getElementById("container"));
        expect(cmp).toBeTruthy();
        const node = ReactDOM.findDOMNode(cmp);
        expect(node.getElementsByClassName('spinner').length).toBe(1);
    });

    it('pdf onPrint', (done) => {
        const handler = (e) => {
            expect(e).toBeTruthy();
            done();
        };
        const cmp = ReactDOM.render(<PrintSubmit onPrint={handler}/>, document.getElementById("container"));
        expect(cmp).toBeTruthy();
        const node = ReactDOM.findDOMNode(cmp);
        ReactTestUtils.Simulate.click(node);
    });
});
