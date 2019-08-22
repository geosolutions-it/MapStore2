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

import MediaEditor from '../MediaEditor';
import { getPluginForTest } from './pluginsTestUtils';

describe('MediaEditor Plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Shows MediaEditor plugin', () => {
        const { Plugin } = getPluginForTest(MediaEditor, {mediaEditor: {open: true}});
        ReactDOM.render(<Plugin open/>, document.getElementById("container"));
        expect(document.getElementsByClassName('ms-mediaEditor').length).toBe(1);
    });
});
