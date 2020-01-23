/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import MapSearch from '../MapSearch';

import { getPluginForTest } from './pluginsTestUtils';

import { createStateMocker } from '../../reducers/__tests__/reducersTestUtils';
import maps from '../../reducers/maps';
import {mapsSearchTextChanged, MAPS_LOAD_MAP} from '../../actions/maps';


import ReactTestUtils from 'react-dom/test-utils';
import ConfigUtils from '../../utils/ConfigUtils';

describe('MapSearch Plugin', () => {
    const stateMocker = createStateMocker({ maps: maps });
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    const DUMMY_ACTION = { type: "DUMMY_ACTION" };
    it('default rendering', () => {
        const { Plugin } = getPluginForTest(MapSearch, stateMocker(DUMMY_ACTION), {
            BurgerMenuPlugin: {}
        });
        // check container for burger menu
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        expect(document.getElementById('map-search-bar')).toExist();
    });
    describe('test search configuration', () => {
        let oldURL;
        const TEST_URL = "MY_GEOSTORE_CUSTOM_URL";
        beforeEach(() => {
            oldURL = ConfigUtils.getConfigProp('geoStoreUrl');
        });

        afterEach(() => {
            ConfigUtils.setConfigProp('geoStoreUrl', oldURL);
        });
        it('clear button uses correct config utils and params', () => {
            // simulate localConfig setup
            const storeState = stateMocker(DUMMY_ACTION, mapsSearchTextChanged("test"));
            const { Plugin, actions } = getPluginForTest(MapSearch, storeState);
            ReactDOM.render(<Plugin />, document.getElementById("container"));
            const clearButton = document.querySelector('.glyphicon-1-close');
            expect(clearButton).toExist();
            ConfigUtils.setConfigProp('geoStoreUrl', TEST_URL);
            ReactTestUtils.Simulate.click(clearButton);
            expect(actions.length).toBe(1);
            const action = actions[0];
            expect(action.type).toBe(MAPS_LOAD_MAP);
            // check the URL of GeoStore is the one set (not the default one)
            expect(action.geoStoreUrl).toBe(TEST_URL);
            // check search params are reset
            expect(action.searchText).toBe('*'); // reset text search
            expect(action.params.start).toBe(0); // reset page
        });
    });

});
