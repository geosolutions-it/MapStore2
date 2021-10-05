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
});
