/**
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

import PRModal from '../PasswordResetModal';

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
        const cmp = ReactDOM.render(<PRModal options={{animation: false}} show />, document.getElementById("container"));
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
        const cmp = ReactDOM.render(<PRModal options={{animation: false}} show user={{name: "test"}} onPasswordChange={callbacks.onPasswordChange}/>, document.getElementById("container"));
        expect(cmp).toExist();
        let inputs = document.getElementsByTagName("input");
        Array.prototype.forEach.call(inputs, (i) => {
            i.value = "password";
            ReactTestUtils.Simulate.change(i);
        });
        let button = document.querySelector('button[value="user.changePwd"]');
        expect(button).toExist();
        ReactTestUtils.Simulate.click(button);
        expect(spy.calls.length).toEqual(1);
    });

    it('test password show spinner on Submit', () => {
        let callbacks = {
            onPasswordChange: (user, pass) => {
                expect(pass).toEqual("test");
                expect(pass).toEqual("password");
            }
        };
        expect.spyOn(callbacks, 'onPasswordChange');
        ReactDOM.render(<PRModal loading={false} options={{animation: false}} show user={{name: "test"}} onPasswordChange={callbacks.onPasswordChange}/>, document.getElementById("container"));
        let button = document.getElementsByTagName("button")[1];
        ReactTestUtils.Simulate.click(button);
        let spinner = document.getElementsByTagName("Spinner");
        expect(spinner).toExist();
    });

});
