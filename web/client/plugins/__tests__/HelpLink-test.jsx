/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import { getPluginForTest } from './pluginsTestUtils';
import HelpLinkPlugin from '../HelpLink';

describe('HelpLink Plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('HelpLink plugin with default documentations url', () => {
        const { Plugin, containers } = getPluginForTest(HelpLinkPlugin);
        expect(Object.keys(containers)).toContain('BurgerMenu');
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        expect(containers.BurgerMenu.selector()).toEqual({ href: 'https://mapstore.readthedocs.io/en/latest/', target: 'blank' });
    });

    it('HelpLink plugin with custom documentations url', () => {
        const { Plugin, containers } = getPluginForTest(HelpLinkPlugin);
        expect(Object.keys(containers)).toContain('BurgerMenu');
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        expect(containers.BurgerMenu.selector(null, {docsUrl: 'https://google.com'})).toEqual({ href: 'https://google.com', target: 'blank' });
    });
});
