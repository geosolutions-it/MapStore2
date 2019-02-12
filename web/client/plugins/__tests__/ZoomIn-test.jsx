/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import ZoomInPlugin from '../ZoomIn';
import { getPluginForTest } from './pluginsTestUtils';

const map = {
    center: {
        x: 13.0,
        y: 43.0
    },
    zoom: 10
};

describe('ZoomIn Plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates a ZoomIn plugin with default configuration', () => {
        const { Plugin } = getPluginForTest(ZoomInPlugin, { map });
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        expect(document.getElementById('zoomin-btn')).toExist();
    });

    it('Checks ZoomIn supported containers', () => {
        const { containers } = getPluginForTest(ZoomInPlugin, { map }, {
            ToolbarPlugin: {}
        });
        expect(Object.keys(containers)).toContain('Toolbar');
    });
});
