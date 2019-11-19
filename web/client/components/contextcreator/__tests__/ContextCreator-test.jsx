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

import expect from 'expect';
import ContextCreator from '../ContextCreator';

describe('ContextCreator component', () => {
    beforeEach((done) => {
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
            ReactDOM.render(<ContextCreator onSave={actions.onSave} />, document.getElementById("container"));
            // save button
            const button = document.querySelectorAll('.footer-button-toolbar-div button')[1];
            ReactTestUtils.Simulate.click(button); // <-- trigger event callback
            // check customization of destination path
            expect(spyonSave).toHaveBeenCalledWith("/context-manager");
        });
        it('custom destination', () => {
            const actions = {
                onSave: () => { }
            };
            const spyonSave = expect.spyOn(actions, 'onSave');
            ReactDOM.render(<ContextCreator onSaveDestLocation="MY_DESTINATION" onSave={actions.onSave} />, document.getElementById("container"));
            // save button
            const button = document.querySelectorAll('.footer-button-toolbar-div button')[1];
            ReactTestUtils.Simulate.click(button); // <-- trigger event callback
            // check customization of destination path
            expect(spyonSave).toHaveBeenCalledWith("MY_DESTINATION");
        });
    });
});
