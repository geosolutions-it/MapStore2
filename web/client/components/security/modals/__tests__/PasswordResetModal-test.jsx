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
const ReactTestUtils = require('react-addons-test-utils');
const PRModal = require('../PasswordResetModal');
const {Modal} = require('react-bootstrap');

describe("Test password reset modal", () => {
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
        const cmp = ReactDOM.render(<PRModal options={{animation: false}}/>, document.getElementById("container"));
        expect(cmp).toExist();
    });

    it('creates component to show', () => {
        const cmp = ReactDOM.render(<PRModal options={{animation: false}} show={true} />, document.getElementById("container"));
        expect(cmp).toExist();
    });

    it('test password reset submit', () => {
        let callbacks = {
            onPasswordChange: (user, pass) => {
                expect(pass).toEqual("test");
                expect(pass).toEqual("password");
            }
        };
        let spy = expect.spyOn(callbacks, 'onPasswordChange');
        const cmp = ReactDOM.render(<PRModal options={{animation: false}} show={true} user={{name: "test"}} onPasswordChange={callbacks.onPasswordChange}/>, document.getElementById("container"));
        expect(cmp).toExist();
        let modalInstance = ReactTestUtils.findRenderedComponentWithType(cmp, Modal);
        let inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag(modalInstance._modal, "input");
        inputs.forEach((i) => {
            i.value = "password";

        });
        // force onChange event to enable form button
        cmp.refs.passwordResetForm.refs.password.props.onChange();
        let button = cmp.refs.passwordChangeButton;
        button.props.onClick();
        expect(spy.calls.length).toEqual(1);
    });
});
