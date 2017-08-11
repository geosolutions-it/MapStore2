/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var React = require('react');
var ReactDOM = require('react-dom');
const ReactTestUtils = require('react-dom/test-utils');
var MeasureDialog = require('../MeasureDialog');


describe("test the MeasureComponent", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test component creation', () => {
        let measurement = {};
        const mc = ReactDOM.render(<MeasureDialog show measurement={measurement}/>, document.getElementById("container"));
        expect(mc).toExist();
    });
    it('test close', () => {
        let measurement = {};
        const handlers = {
            onClose() {}
        };
        let spy = expect.spyOn(handlers, "onClose");
        const mc = ReactDOM.render(<MeasureDialog show onClose={handlers.onClose} measurement={measurement}/>, document.getElementById("container"));
        expect(mc).toExist();
        const dom = ReactDOM.findDOMNode(mc);
        const closeBtn = dom.getElementsByClassName('close')[0];
        expect(closeBtn).toExist();
        ReactTestUtils.Simulate.click(closeBtn);
        expect(spy.calls.length).toBe(1);
    });
});
