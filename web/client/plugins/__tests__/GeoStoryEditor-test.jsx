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

import GeoStoryEditor from '../GeoStoryEditor';
import { getPluginForTest } from './pluginsTestUtils';
import { createStateMocker } from '../../reducers/__tests__/reducersTestUtils';

import geostory from '../../reducers/geostory';
import { setEditing } from '../../actions/geostory';

describe('GeoStoryEditor Plugin', () => {
    const stateMocker = createStateMocker({geostory});
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Shows GeoStoryEditor plugin hidden in view mode', () => {
        const { Plugin } = getPluginForTest(GeoStoryEditor, stateMocker(setEditing(false)));
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        expect(document.getElementsByClassName('ms-geostory-editor').length).toBe(0);
    });
    it('Hide GeoStoryEditor plugin visible in edit mode', () => {
        const { Plugin } = getPluginForTest(GeoStoryEditor, stateMocker(setEditing(true)));
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        expect(document.getElementsByClassName('ms-geostory-editor').length).toBe(1);
    });
});
