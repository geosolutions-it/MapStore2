/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import { getPluginForTest } from './pluginsTestUtils';
import featuregrid from '../../reducers/featuregrid';
import FeatureEditor from "../FeatureEditor";

describe('FeatureEditor Plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('render FeatureEditor plugin', () => {
        const {Plugin, store} = getPluginForTest(FeatureEditor, {featuregrid: {...featuregrid, open: true}});
        ReactDOM.render(<Plugin/>, document.getElementById("container"));
        const container = document.querySelector('.feature-grid-container');
        expect(container).toBeTruthy();
        const state = store.getState().featuregrid;
        expect(state.virtualScroll).toBe(true);
    });
    it('onInit FeatureEditor plugin', () => {
        const props = {
            virtualScroll: false,
            editingAllowedRoles: ['USER', 'ADMIN'],
            maxStoredPages: 5
        };
        const {Plugin, store} = getPluginForTest(FeatureEditor, {featuregrid});
        ReactDOM.render(<Plugin {...props}/>, document.getElementById("container"));
        const state = store.getState().featuregrid;
        expect(state.virtualScroll).toBeFalsy();
        expect(state.editingAllowedRoles).toEqual(props.editingAllowedRoles);
        expect(state.maxStoredPages).toBe(props.maxStoredPages);
    });
    it('onInit FeatureEditor plugin be-recalled when props change', () => {
        const props = {
            virtualScroll: false,
            editingAllowedRoles: ['ADMIN'],
            maxStoredPages: 5
        };
        const props2 = {
            editingAllowedRoles: ['USER', 'ADMIN'],
            maxStoredPages: 5
        };
        const props3 = {
            editingAllowedRoles: ['USER', 'ADMIN'],
            maxStoredPages: 5
        };
        const {Plugin, store} = getPluginForTest(FeatureEditor, {featuregrid});
        ReactDOM.render(<Plugin {...props}/>, document.getElementById("container"));
        const state = store.getState().featuregrid;
        expect(state.virtualScroll).toBeFalsy();
        expect(state.editingAllowedRoles).toEqual(props.editingAllowedRoles);
        expect(state.maxStoredPages).toBe(props.maxStoredPages);
        ReactDOM.render(<Plugin {...props2}/>, document.getElementById("container"));
        const state2 = store.getState().featuregrid;
        expect(state2.virtualScroll).toBeTruthy(); // the default
        expect(state2.editingAllowedRoles).toEqual(props2.editingAllowedRoles); // changed
        expect(state2.maxStoredPages).toBe(props2.maxStoredPages);
        ReactDOM.render(<Plugin {...props3}/>, document.getElementById("container"));
        const state3 = store.getState().featuregrid;
        expect(state2.editingAllowedRoles === state3.editingAllowedRoles).toBeTruthy(); // no double call
    });
});
