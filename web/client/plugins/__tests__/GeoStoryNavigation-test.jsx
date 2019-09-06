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

import GeoStoryNavigation from '../GeoStoryNavigation';
import { getPluginForTest } from './pluginsTestUtils';
import { createStateMocker } from '../../reducers/__tests__/reducersTestUtils';
import { Modes } from '../../utils/GeoStoryUtils';


import geostory from '../../reducers/geostory';
import { setEditing } from '../../actions/geostory';

describe('GeoStoryEditor Plugin', () => {
    const stateMocker = createStateMocker({ geostory });
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Shows GeoStoryNavigation plugin shows in view mode', () => {
        const { Plugin } = getPluginForTest(GeoStoryNavigation, stateMocker(setEditing(false)));
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        expect(document.getElementsByClassName('ms-geostory-navigation').length).toBe(1);
    });
    it('Hide GeoStoryNavigation plugin in edit mode', () => {
        const { Plugin } = getPluginForTest(GeoStoryNavigation, stateMocker(setEditing(true)));
        ReactDOM.render(<Plugin mode={Modes.EDIT} />, document.getElementById("container"));
        expect(document.getElementsByClassName('ms-geostory-navigation').length).toBe(0);
    });
});
