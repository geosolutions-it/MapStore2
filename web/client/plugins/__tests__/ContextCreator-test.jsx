/**
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
import { getPluginForTest } from './pluginsTestUtils';
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
    it('default', () => {
        const { Plugin, actions } = getPluginForTest(ContextCreator, {});
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        // save button
        const button = document.querySelectorAll('.footer-button-toolbar-div button')[1];
        ReactTestUtils.Simulate.click(button); // <-- trigger event callback
        // check destination path
        expect(actions.length).toBe(1);
        expect(actions[0].destLocation).toBe("/context-manager");
    });
    it('custom destination', () => {
        const { Plugin, actions } = getPluginForTest(ContextCreator, {});
        ReactDOM.render(<Plugin saveDestLocation="MY_DESTINATION" />, document.getElementById("container"));
        // save button
        const button = document.querySelectorAll('.footer-button-toolbar-div button')[1];
        ReactTestUtils.Simulate.click(button); // <-- trigger event callback
        // check customization of destination path
        expect(actions.length).toBe(1);
        expect(actions[0].destLocation).toBe("MY_DESTINATION");
    });
});
