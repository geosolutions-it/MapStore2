/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import {Provider} from 'react-redux';
import configureMockStore from 'redux-mock-store';

import expect from 'expect';
import ContextCreator from '../ContextCreator';

const mockStore = configureMockStore();

describe('ContextCreator component', () => {
    let store;
    beforeEach((done) => {
        store = mockStore();
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('ContextCreator rendering with defaults', () => {
        ReactDOM.render(<ContextCreator />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.getElementsByClassName('ms2-stepper')[0]).toExist();
    });
    describe('Test ContextCreator onSave', () => {
        it('default destination', () => {
            const actions = {
                onSave: () => { }
            };
            const spyonSave = expect.spyOn(actions, 'onSave');
            ReactDOM.render(
                <Provider store={store}>
                    <ContextCreator curStepId="configure-map" onSave={actions.onSave} />
                </Provider>, document.getElementById("container"));
            // save button
            const saveBtn = document.querySelectorAll('.footer-button-toolbar button')[0];
            expect(saveBtn).toExist();
            expect(saveBtn.childNodes[0].innerHTML).toBe('save');
            ReactTestUtils.Simulate.click(saveBtn); // <-- trigger event callback
            // check destination path
            expect(spyonSave).toHaveBeenCalledWith("/context-manager");
        });
        it('custom destination', () => {
            const actions = {
                onSave: () => { }
            };
            const spyonSave = expect.spyOn(actions, 'onSave');
            ReactDOM.render(
                <Provider store={store}>
                    <ContextCreator curStepId="configure-map" saveDestLocation="MY_DESTINATION" onSave={actions.onSave} />
                </Provider>, document.getElementById("container"));
            // save button
            const saveBtn = document.querySelectorAll('.footer-button-toolbar button')[0];
            expect(saveBtn).toExist();
            expect(saveBtn.childNodes[0].innerHTML).toBe('save');
            ReactTestUtils.Simulate.click(saveBtn); // <-- trigger event callback
            // check customization of destination path
            expect(spyonSave).toHaveBeenCalledWith("MY_DESTINATION");
        });
    });
});
