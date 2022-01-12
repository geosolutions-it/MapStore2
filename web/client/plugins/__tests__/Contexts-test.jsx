/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import ContextsPlugin from '../Contexts';
import { getPluginForTest } from './pluginsTestUtils';

describe('Contexts Plugin', () => {

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates Contexts plugin with default configuration', () => {
        const { Plugin } = getPluginForTest(ContextsPlugin, {});
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        // eslint-disable-next-line no-console
        console.log(document.getElementById("container").innerHTML);
        const emptyStateImage = document.getElementsByClassName('empty-state-image');
        const emptyStateMainView = document.getElementsByClassName('empty-state-main-view');
        expect(emptyStateImage.length).toBe(1);
        expect(emptyStateMainView.length).toBe(1);
    });
});
