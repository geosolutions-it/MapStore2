/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import SearchServicesConfigPlugin from '../SearchServicesConfig';
import { getPluginForTest } from './pluginsTestUtils';

describe('SearchServicesConfig Plugin', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="container"></div>';
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
    });

    it('creates a SearchServicesConfig plugin with default configuration', () => {
        const {Plugin} = getPluginForTest(SearchServicesConfigPlugin, {});
        ReactDOM.render(<Plugin/>, document.getElementById("container"));
        expect(document.getElementById('search-services-config-editor')).toBeFalsy();
    });
    it('creates a SearchServicesConfig plugin with searchconfig null', () => {
        const state = {controls: {searchservicesconfig: {enabled: true}}, searchconfig: null};
        const {Plugin} = getPluginForTest(SearchServicesConfigPlugin, state);
        ReactDOM.render(<Plugin/>, document.getElementById("container"));
        expect(document.getElementById('search-services-config-editor')).toBeTruthy();
        expect(document.getElementsByClassName('services-config-editor')[0]).toBeTruthy();
    });
});
