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

import LoginModal from '../LoginModal';

describe("Test the login modal", () => {
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
        const cmp = ReactDOM.render(<LoginModal options={{animation: false}}/>, document.getElementById("container"));
        expect(cmp).toExist();
    });

    it('creates empty component with error', () => {
        const cmp = ReactDOM.render(<LoginModal options={{animation: false}} show loginError={{status: 0}}/>, document.getElementById("container"));
        expect(cmp).toExist();
        let node = document.getElementsByClassName('alert-danger');
        expect(node.length).toBe(1);
    });

    it('test component sumbit', () => {
        const testHandlers = {
            onSubmit: (user, password) => {
                return {user: user, password: password};
            },
            onLoginSuccess: () => {

            }
        };

        const spy = expect.spyOn(testHandlers, 'onSubmit');
        const spySuccess = expect.spyOn(testHandlers, 'onLoginSuccess');
        const cmp = ReactDOM.render(<LoginModal options={{animation: false}} show key="test" onLoginSuccess={testHandlers.onLoginSuccess} onSubmit={testHandlers.onSubmit}/>, document.getElementById("container"));
        expect(cmp).toExist();
        let username = document.getElementsByTagName("input")[0];
        expect(username).toExist();
        username.value = "test";
        ReactTestUtils.Simulate.change(username);

        let password = document.getElementsByTagName("input")[1];
        expect(password).toExist();
        password.value = "test";
        ReactTestUtils.Simulate.change(password);


        const submitButton = document.querySelector('button[value="user.signIn"]');
        expect(submitButton).toExist();
        ReactTestUtils.Simulate.click(submitButton);
        expect(spy.calls.length).toEqual(1);

        ReactDOM.render(
            <LoginModal options={{animation: false}} show key="test" onSubmit={testHandlers.onSubmit} onLoginSuccess={testHandlers.onLoginSuccess} user={{name: "TEST"}} />, document.getElementById("container")
        );
        expect(spySuccess.calls.length).toEqual(1);
    });
    describe('multi-providers', () => {
        it('geostore only', () => {
            const cmp = ReactDOM.render(<LoginModal show providers={[{type: "basic", provider: "geostore"}]} options={{animation: false}}/>, document.getElementById("container"));
            expect(cmp).toBeTruthy();
            expect(document.querySelector('.modal-body form')).toBeTruthy();
        });
        it('google only', () => {
            const cmp = ReactDOM.render(<LoginModal show providers={[{type: "openID", provider: "google"}]} options={{animation: false}}/>, document.getElementById("container"));
            expect(cmp).toBeTruthy();
            expect(document.querySelector('.modal-body form')).toBeFalsy();
            expect(document.querySelector('.modal-body > div > a > img')).toBeTruthy(); // google has a default image.
        });
        it('google + geostore', () => {
            const cmp = ReactDOM.render(<LoginModal show providers={[{type: "basic", provider: "geostore"}, {type: "openID", provider: "google"}]} options={{animation: false}}/>, document.getElementById("container"));
            expect(cmp).toBeTruthy();
            expect(document.querySelector('.modal-body form')).toBeTruthy();
            expect(document.querySelector('.modal-body > div > a > img')).toBeTruthy(); // google has a default image.
        });
        it('custom openID', () => {
            const cmp = ReactDOM.render(<LoginModal show providers={[{type: "openID", provider: "test", title: "test provider"}]} options={{animation: false}}/>, document.getElementById("container"));
            expect(cmp).toBeTruthy();
            expect(document.querySelector('.modal-body form')).toBeFalsy();
            const link = document.querySelector('.modal-body > div > a');
            expect(link).toBeTruthy();
            expect(link.innerHTML).toEqual("test provider");
        });
        it('custom openID with image', () => {
            const imageURL = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
            const cmp = ReactDOM.render(<LoginModal show providers={[{type: "openID", provider: "test", title: "test provider", imageURL}]} options={{animation: false}}/>, document.getElementById("container"));
            expect(cmp).toBeTruthy();
            expect(document.querySelector('.modal-body form')).toBeFalsy();
            const img = document.querySelector('.modal-body > div > a > img');
            expect(img).toBeTruthy();
            expect(img.src).toEqual(imageURL);
        });
    });
});
