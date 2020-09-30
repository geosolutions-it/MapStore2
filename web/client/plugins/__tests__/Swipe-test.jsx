/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import expect from 'expect';
import ReactDOM from 'react-dom';

import { getPluginForTest } from './pluginsTestUtils';

import SwipePlugin from '../Swipe';

describe('SwipePlugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('shows SwipePlugin', () => {
        const { Plugin } = getPluginForTest(SwipePlugin, {});
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        expect(document.getElementById('mapstore-swipe-settings')).toExist();
    });
});
