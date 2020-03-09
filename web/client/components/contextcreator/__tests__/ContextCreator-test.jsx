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
import Localized from '../../I18N/Localized';
import { isEqual } from 'lodash';


import expect from 'expect';
import ContextCreator, { pluginsFilterOverride } from '../ContextCreator';

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
            const eng = {
                "locale": "en-US",
                "messages": {
                    "aboutLbl": "About"
                }
            };
            const actions = {
                onSave: () => { }
            };
            const spyonSave = expect.spyOn(actions, 'onSave');
            const allAvailablePlugins = [
                {enabled: true, title: 'title', pluginConfig: {cfg: {}}},
                {enabled: false, title: 'title', pluginConfig: {cfg: {}}}
            ];
            ReactDOM.render(
                <Localized messages={eng.messages} locale="en-US">
                    <Provider store={store}>
                        <ContextCreator
                            isCfgValidated
                            allAvailablePlugins={allAvailablePlugins}
                            curStepId="configure-plugins"
                            onSave={actions.onSave} />
                    </Provider>
                </Localized>, document.getElementById("container"));
            // save button
            const saveBtn = document.querySelectorAll('.footer-button-toolbar button')[0];
            expect(saveBtn).toExist();
            expect(saveBtn.childNodes[0].innerHTML).toBe('save');
            ReactTestUtils.Simulate.click(saveBtn); // <-- trigger event callback
            // check destination path
            expect(spyonSave).toHaveBeenCalledWith("/context-manager");
        });
        it('custom destination', () => {
            const eng = {
                "locale": "en-US",
                "messages": {
                    "aboutLbl": "About"
                }
            };
            const actions = {
                onSave: () => { }
            };
            const spyonSave = expect.spyOn(actions, 'onSave');
            const allAvailablePlugins = [
                {enabled: true, title: 'title', pluginConfig: {cfg: {}}},
                {enabled: false, title: 'title', pluginConfig: {cfg: {}}}
            ];
            ReactDOM.render(
                <Localized messages={eng.messages} locale="en-US">
                    <Provider store={store}>
                        <ContextCreator
                            isCfgValidated
                            allAvailablePlugins={allAvailablePlugins}
                            curStepId="configure-plugins"
                            saveDestLocation="MY_DESTINATION"
                            onSave={actions.onSave} />
                    </Provider>
                </Localized>, document.getElementById("container"));
            // save button
            const saveBtn = document.querySelectorAll('.footer-button-toolbar button')[0];
            expect(saveBtn).toExist();
            expect(saveBtn.childNodes[0].innerHTML).toBe('save');
            ReactTestUtils.Simulate.click(saveBtn); // <-- trigger event callback
            // check customization of destination path
            expect(spyonSave).toHaveBeenCalledWith("MY_DESTINATION");
        });
    });
    describe('viewerPlugins filtering', () => {
        it('filter plugins accordingly', () => {
            expect(isEqual(pluginsFilterOverride(["P1", "P2"], ["P1"]), ["P1"]));
        });
        it('apply plugins overrides', () => {
            // add cfg where missing
            expect(isEqual(
                pluginsFilterOverride(["P1", "P2"], [{
                    "name": "P1",
                    "overrides": {
                        "cfg": { test: "newValue" }
                    }
                }]),
                [{
                    "name": "P1",
                    "cfg": { test: "newValue" }
                }]
            )).toBeTruthy();
            // not modifies the existing cfg
            expect(isEqual(pluginsFilterOverride(["P1", { name: "P2", "cfg": { test: "value1", test2: "value2" } }], [{
                "name": "P2",
                "overrides": {
                    "cfg": { test: "newValue" }
                }
            }]), [{
                "name": "P2",
                "cfg": { test: "newValue", test2: "value2" }
            }])).toBeTruthy();
        });

    });
});
