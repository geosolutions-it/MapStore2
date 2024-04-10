/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import DashboardEditorPlugin from '../DashboardEditor';
import { getPluginForTest } from './pluginsTestUtils';

describe('DashboardEditorPlugin Plugin', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="container"></div>';
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
    });
    it('test DashboardEditorPlugin plugin on mount', () => {
        const {Plugin, actions} = getPluginForTest(DashboardEditorPlugin, {});
        ReactDOM.render(<Plugin pluginCfg={{}}/>, document.getElementById("container"));

        expect(actions.length).toBeTruthy();
        const actionTypes = actions.map(a => a.type);
        expect(actionTypes.includes("DASHBOARD:INIT_PLUGIN")).toBeTruthy();
        expect(actionTypes.includes("DASHBOARD:SET_AVAILABLE")).toBeTruthy();
    });
    it('test DashboardEditorPlugin plugin on unmount', () => {
        const {Plugin, actions} = getPluginForTest(DashboardEditorPlugin, {});
        ReactDOM.render(<Plugin pluginCfg={{}}/>, document.getElementById("container"));

        ReactDOM.render(<div/>, document.getElementById("container"));
        expect(actions).toBeTruthy();
        expect(actions.find(a => a.type === "DASHBOARD:SET_AVAILABLE")).toBeTruthy();
    });
});
