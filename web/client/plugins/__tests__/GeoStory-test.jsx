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

import GeoStory from '../GeoStory';
import { getPluginForTest } from './pluginsTestUtils';
import { createStateMocker } from '../../reducers/__tests__/reducersTestUtils';

import geostory from '../../reducers/geostory';

describe('GeoStory Plugin', () => {
    const stateMocker = createStateMocker({geostory}, ({type: "DUMMY_ACTION"}));
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Shows GeoStory plugin', () => {
        const { Plugin } = getPluginForTest(GeoStory, stateMocker({geostory}));
        ReactDOM.render(<Plugin webFont={{load: () => {}}} />, document.getElementById("container"));
        expect(document.getElementsByClassName('ms-geostory').length).toBe(1);
    });
    it('Dispatches update action and sets fontFamilies', () => {
        const { Plugin, actions, store } = getPluginForTest(GeoStory, stateMocker({geostory}));
        const fontFamilies = [{family: "test", src: "test"}];
        ReactDOM.render(<Plugin webFont={{load: () => {}}} fontFamilies={fontFamilies} />, document.getElementById("container"));

        // expect to have dispatched update action once from useEffect(callback, [])
        expect(actions.length).toEqual(1);
        expect(store.getState().geostory.currentStory.settings.theme.fontFamilies).toEqual(fontFamilies);
    });
});
