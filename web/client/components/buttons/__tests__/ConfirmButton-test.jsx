/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var React = require('react');
var ReactDOM = require('react-dom');
var ConfirmButton = require('../ConfirmButton');

describe("test the ConfirmButton", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test default props', () => {
        const tb = ReactDOM.render(<ConfirmButton/>, document.getElementById("container"));
        expect(tb).toExist();
        const tbNode = ReactDOM.findDOMNode(tb);
        expect(tbNode).toExist();
    });
    it('test click display confirm', () => {
        const tb = ReactDOM.render(<ConfirmButton/>, document.getElementById("container"));
        expect(tb).toExist();
        const tbNode = ReactDOM.findDOMNode(tb);
        expect(tbNode).toExist();
        const ReactTestUtils = require('react-dom/test-utils');
        ReactTestUtils.Simulate.click(tbNode);
        expect(tb).toExist();
        const txt = tbNode.textContent || tbNode.innerText;
        expect(txt).toBe("Confirm?");
    });
    it('test click to confirm', () => {
        const handlers1 = {
            onConfirm() {}
        };
        const spy1 = expect.spyOn(handlers1, "onConfirm");
        const tb = ReactDOM.render(<ConfirmButton onConfirm={handlers1.onConfirm}/>, document.getElementById("container"));
        expect(tb).toExist();
        const tbNode = ReactDOM.findDOMNode(tb);
        expect(tbNode).toExist();
        const ReactTestUtils = require('react-dom/test-utils');
        ReactTestUtils.Simulate.click(tbNode);
        expect(tb).toExist();
        ReactTestUtils.Simulate.click(tbNode);
        expect(spy1.calls.length).toBe(1);
    });
    it('test cancel on blur', (done) => {
        const handlers2 = {
            onConfirm() {}
        };
        const spy2 = expect.spyOn(handlers2, "onConfirm");
        const tb = ReactDOM.render(<ConfirmButton onConfirm={handlers2.onConfirm}/>, document.getElementById("container"));
        expect(tb).toExist();
        const tbNode = ReactDOM.findDOMNode(tb);
        expect(tbNode).toExist();
        const ReactTestUtils = require('react-dom/test-utils');
        ReactTestUtils.Simulate.click(tbNode);
        ReactTestUtils.Simulate.focus(tbNode);
        ReactTestUtils.Simulate.blur(tbNode);
        expect(tb).toExist();
        // click out for blur
        setTimeout(() => {
            ReactTestUtils.Simulate.click(tbNode);
            expect(spy2.calls.length).toBe(0); // second click don't do confirm
            done();
        }, 100);
    });
    it('test disableAfterConfirmed', () => {
        const tb = ReactDOM.render(<ConfirmButton disableAfterConfirmed />, document.getElementById("container"));
        expect(tb).toExist();
        const tbNode = ReactDOM.findDOMNode(tb);
        expect(tbNode).toExist();
        const ReactTestUtils = require('react-dom/test-utils');
        ReactTestUtils.Simulate.click(tbNode);
        ReactTestUtils.Simulate.click(tbNode);
        expect(tbNode.disabled).toBe(true);

    });
});
