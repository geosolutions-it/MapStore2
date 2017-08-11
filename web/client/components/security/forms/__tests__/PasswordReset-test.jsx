/**
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const React = require('react');
const ReactDOM = require('react-dom');
const ReactTestUtils = require('react-dom/test-utils');
const PasswordReset = require('../PasswordReset');


describe("Test the password reset form component", () => {
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
        const cmp = ReactDOM.render(<PasswordReset/>, document.getElementById("container"));
        expect(cmp).toExist();
    });

    it('alert for success', () => {
        const cmp = ReactDOM.render(<PasswordReset changed/>, document.getElementById("container"));
        expect(cmp).toExist();
        let alert = ReactDOM.findDOMNode(ReactTestUtils.scryRenderedDOMComponentsWithClass(cmp, "alert-success")[0]);
        expect(alert).toExist();
    });

    it('alert for error', () => {
        const cmp = ReactDOM.render(<PasswordReset error={{message: 'error'}}/>, document.getElementById("container"));
        expect(cmp).toExist();
        let alert = ReactDOM.findDOMNode(ReactTestUtils.scryRenderedDOMComponentsWithClass(cmp, "alert-danger")[0]);
        expect(alert).toExist();
    });

    it('test component validity', () => {
        const cmp = ReactDOM.render(<PasswordReset />, document.getElementById("container"));
        expect(cmp).toExist();
        let password = ReactDOM.findDOMNode(ReactTestUtils.scryRenderedDOMComponentsWithTag(cmp, "input")[0]);
        expect(password).toExist();
        password.value = "test";
        ReactTestUtils.Simulate.change(password);
        expect(cmp.isValid()).toEqual(false);
        let password2 = ReactDOM.findDOMNode(ReactTestUtils.scryRenderedDOMComponentsWithTag(cmp, "input")[1]);
        expect(password2).toExist();
        password2.value = "test2";
        ReactTestUtils.Simulate.change(password2);
        expect(cmp.isValid()).toEqual(false);
        // size is < then 6
        password2.value = "test";
        ReactTestUtils.Simulate.change(password2);
        expect(cmp.isValid()).toEqual(false);
        // invalid characters
        password.value = "testòàè+";
        password2.value = "testòàè+";
        ReactTestUtils.Simulate.change(password2);
        expect(cmp.isValid()).toEqual(false);

        // test valid
        password.value = "password123!$&#";
        password2.value = "password123!$&#";
        ReactTestUtils.Simulate.change(password);
        ReactTestUtils.Simulate.change(password2);
        expect(cmp.isValid()).toEqual(true);
    });
});
