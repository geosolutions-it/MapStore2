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
const PRModal = require('../PasswordResetModal');

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
        expect(cmp).toBeTruthy();
    });

    it('creates component to show', () => {
        const cmp = ReactDOM.render(<PRModal options={{animation: false}} show />, document.getElementById("container"));
        expect(cmp).toBeTruthy();
    });

    it('test password reset submit', () => {
        let callbacks = {
            onPasswordChange: (user, pass) => {
                expect(pass).toEqual("test");
                expect(pass).toEqual("password");
            }
        };
        let spy = expect.spyOn(callbacks, 'onPasswordChange').mockImplementation();
        const cmp = ReactDOM.render(<PRModal options={{animation: false}} show user={{name: "test"}} onPasswordChange={callbacks.onPasswordChange}/>, document.getElementById("container"));
        expect(cmp).toBeTruthy();
        let inputs = document.getElementsByTagName("input");
        Array.prototype.forEach.call(inputs, (i) => {
            i.value = "password";
            ReactTestUtils.Simulate.change(i);
        });
        let button = document.getElementsByTagName("button")[1];
        ReactTestUtils.Simulate.click(button);
        expect(spy.mock.calls.length).toEqual(1);
    });
});
