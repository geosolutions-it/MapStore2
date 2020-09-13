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
import ContextCreator, { contextCreatorSelector } from '../ContextCreator';

describe('ContextCreator plugin', () => {
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
        const plugins = [
            {enabled: true, title: 'title', pluginConfig: {cfg: {}}},
            {enabled: false, title: 'title', pluginConfig: {cfg: {}}}
        ];
        const { Plugin, actions } = getPluginForTest(ContextCreator, {
            contextcreator: {
                stepId: 'configure-plugins',
                newContext: {},
                plugins
            },
            map: {}
        });
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        // save button
        const button = document.querySelectorAll('.footer-button-toolbar button')[0];
        expect(button).toExist();
        expect(button.childNodes[0].innerHTML).toBe('save');
        ReactTestUtils.Simulate.click(button); // <-- trigger event callback
        // check destination path
        expect(actions.length).toBeGreaterThanOrEqualTo(1);
        expect(actions[1].destLocation).toBe("/context-manager");
    });
    it('custom destination', () => {
        const plugins = [
            {enabled: true, title: 'title', pluginConfig: {cfg: {}}},
            {enabled: false, title: 'title', pluginConfig: {cfg: {}}}
        ];
        const { Plugin, actions } = getPluginForTest(ContextCreator, {
            contextcreator: {
                stepId: 'configure-plugins',
                plugins
            },
            map: {}
        });
        ReactDOM.render(<Plugin saveDestLocation="MY_DESTINATION" />, document.getElementById("container"));
        // save button
        const button = document.querySelectorAll('.footer-button-toolbar button')[0];
        expect(button).toExist();
        expect(button.childNodes[0].innerHTML).toBe('save');
        ReactTestUtils.Simulate.click(button); // <-- trigger event callback
        // check customization of destination path
        expect(actions.length).toBeGreaterThanOrEqualTo(1);
        expect(actions[1].destLocation).toBe("MY_DESTINATION");
    });
});
describe('contextCreatorSelector', () => {
    const ADMIN_LOGGED_STATE = {
        security: {
            user: {
                attribute: [
                ],
                enabled: true,
                groups: {
                    group: [
                        {
                            description: 'description',
                            enabled: true,
                            groupName: 'everyone',
                            id: 479
                        }
                    ]
                },
                id: 3,
                name: 'admin',
                role: 'ADMIN'
            }
        }
    };
    // MapTemplates
    it('user is passed as prop to provide role and so API to use to SaveModal', () => {
        const props = contextCreatorSelector(ADMIN_LOGGED_STATE);
        expect(props.user).toBe(ADMIN_LOGGED_STATE.security.user);
    });
});
