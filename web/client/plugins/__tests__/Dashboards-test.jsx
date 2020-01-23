/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import DashboardsPlugin from '../Dashboards';
import { getPluginForTest } from './pluginsTestUtils';
import security from '../../reducers/security';

describe('Dashboards Plugin', () => {

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates Dashboards plugin with default configuration', () => {
        const { Plugin } = getPluginForTest(DashboardsPlugin, {});
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(0);
    });

    it('creates Dashboards plugin with default configuration, with no Dashboards', () => {
        const initialState = {
            dashboards: {
                results: [],
                loading: false
            },
            security: {
                user: {
                    role: "USER",
                    name: "user"
                }
            }
        };
        const { Plugin } = getPluginForTest({...DashboardsPlugin, reducers: {
            ...DashboardsPlugin.reducers,
            security
        }}, initialState );
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(1);
        expect(buttons[0].innerText.indexOf("createANewOne") === -1).toBe(false);
    });

    it('creates Dashboards plugin with default configuration, without Dashboards and createANewOne button', () => {
        const initialState = {
            dashboards: {
                results: [],
                loading: false
            },
            security: {
                user: {
                    role: "USER",
                    name: "user"
                }
            }
        };
        const { Plugin } = getPluginForTest({
            ...DashboardsPlugin,
            reducers: {
                ...DashboardsPlugin.reducers,
                security
            }}, initialState );
        ReactDOM.render(<Plugin showCreateButton={false} />, document.getElementById("container"));
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(0);
    });
});
