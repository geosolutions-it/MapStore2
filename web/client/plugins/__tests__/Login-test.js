/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import Rx from 'rxjs';

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';


import Login from '../Login';
import OmniBar from '../OmniBar';

import { getPluginForTest } from './pluginsTestUtils';
import { createStateMocker } from '../../reducers/__tests__/reducersTestUtils';

import controls from '../../reducers/controls';
import security from '../../reducers/security';

import {loginSuccess, LOGOUT} from '../../actions/security';

import { toggleControl, setControlProperty, SET_CONTROL_PROPERTY } from '../../actions/controls';

describe('Login Plugin', () => {
    const stateMocker = createStateMocker({ controls, security });
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    describe('Login', () => {
        it('default render', () => {
            const storeState = stateMocker();
            const { Plugin } = getPluginForTest(Login, storeState);
            ReactDOM.render(<Plugin />, document.getElementById("container"));
            expect(document.querySelector('#mapstore-login-menu')).toBeTruthy();
            // permission table present by default
            expect(document.querySelector('.modal-dialog')).toBeFalsy();
        });
        it('show login modal from external action', () => {
            const storeState = stateMocker(toggleControl('LoginForm', 'enabled'));
            const { Plugin } = getPluginForTest(Login, storeState);
            ReactDOM.render(<Plugin />, document.getElementById("container"));
            expect(document.querySelector('#mapstore-login-menu')).toBeTruthy();
            // permission table present by default
            expect(document.querySelector('.modal-dialog')).toBeTruthy();
        });
        it('show login modal on click', () => {
            const storeState = stateMocker();
            const { Plugin } = getPluginForTest(Login, storeState);
            ReactDOM.render(<Plugin />, document.getElementById("container"));
            TestUtils.Simulate.click(document.querySelector('.glyphicon-log-in'));
            expect(document.querySelector('#mapstore-login-menu')).toBeTruthy();
            // permission table present by default
            expect(document.querySelector('.modal-dialog')).toBeTruthy();
        });

        it('render in OmniBar', () => {
            const storeState = stateMocker();
            // const { Plugin } = getPluginForTest(Login, storeState);
            const { Plugin: OmniBarPlugin } = getPluginForTest(OmniBar, storeState, { LoginPlugin: Login });
            ReactDOM.render(<OmniBarPlugin items={[{ ...Login.LoginPlugin.OmniBar, plugin: Plugin.LoginPlugin}]} />, document.getElementById("container"));
            expect(document.querySelector('#mapstore-navbar-container .glyphicon-user')).toBeTruthy();
        });
        it('confirm dialog on pending changes', done => {
            const storeState = stateMocker(
                loginSuccess({  User: { name: "Test", access_token: "some-token"}}),
                setControlProperty('unsavedMap', 'enabled', true),
                setControlProperty('unsavedMap', 'source', 'logout')
            );
            const { PluginImpl } = getPluginForTest(Login, storeState);
            const { Plugin: OmniBarPlugin } = getPluginForTest(OmniBar, storeState, { LoginPlugin: Login }, [
                actions$ => actions$.ofType(LOGOUT).switchMap(({redirectUrl})=> {
                    // test the confirm button click event causes logout action.
                    expect(redirectUrl).toBeFalsy();
                    done();
                    return  Rx.Observable.empty();
                })
            ], { security, controls });
            ReactDOM.render(<OmniBarPlugin items={[{ ...PluginImpl.OmniBar, plugin: PluginImpl}]} />, document.getElementById("container"));
            expect(document.querySelector('#mapstore-navbar-container .glyphicon-user')).toBeTruthy();
            // show modal
            expect(document.querySelector('.ms-resizable-modal')).toExist();
            const buttons = document.querySelectorAll('.ms-resizable-modal .modal-footer button');
            expect(buttons[0]).toBeTruthy();
            expect(buttons[1]).toBeTruthy();
            // click on confirm button
            TestUtils.Simulate.click(buttons[0]);
        });
        it('not confirm closes dialog', done => {
            const storeState = stateMocker(
                loginSuccess({ User: { name: "Test", access_token: "some-token" } }),
                setControlProperty('unsavedMap', 'enabled', true),
                setControlProperty('unsavedMap', 'source', 'logout')
                // TODO: not sure about why this is required, investigate.
            );
            const { PluginImpl } = getPluginForTest(Login, storeState);
            const { Plugin: OmniBarPlugin } = getPluginForTest(OmniBar, storeState, { LoginPlugin: Login }, [
                actions$ => actions$.ofType(SET_CONTROL_PROPERTY).switchMap(({ control, property, value }) => {
                    // test the cancel  button click event causes modal close
                    expect(control).toEqual('unsavedMap');
                    expect(property).toEqual('enabled');
                    expect(value).toEqual(false);
                    done();
                    return Rx.Observable.empty();
                })
            ], { security, controls });
            ReactDOM.render(<OmniBarPlugin items={[{ ...PluginImpl.OmniBar, plugin: PluginImpl }]} />, document.getElementById("container"));
            expect(document.querySelector('#mapstore-navbar-container .glyphicon-user')).toBeTruthy();
            // show modal
            expect(document.querySelector('.ms-resizable-modal')).toExist();
            const buttons = document.querySelectorAll('.ms-resizable-modal .modal-footer button');
            expect(buttons[0]).toBeTruthy();
            expect(buttons[1]).toBeTruthy();
            // click on confirm button
            TestUtils.Simulate.click(buttons[1]);
        });
    });

});
