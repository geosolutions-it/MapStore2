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

import BackgroundSelectorPlugin from '../BackgroundSelector';
import { getPluginForTest } from './pluginsTestUtils';

const BG_PLUGIN_SELECTOR = '.background-plugin-position';
const ADD_BTN_SELECTOR = `${BG_PLUGIN_SELECTOR} button`;
describe('BackgroundSelector Plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('Render plugin with layers', () => {
        const { Plugin } = getPluginForTest(BackgroundSelectorPlugin, { layers: { flat: [{ group: 'background' }] } });
        ReactDOM.render(<Plugin alwaysVisible />, document.getElementById("container"));
        expect(document.querySelector(BG_PLUGIN_SELECTOR)).toExist();
        expect(document.querySelector(ADD_BTN_SELECTOR)).toNotExist();
    });
    it('Add button present only if catalog available', () => {
        const { Plugin } = getPluginForTest(BackgroundSelectorPlugin, {
            layers: { flat: [{ group: 'background' }] },
            controls: {
                backgroundSelector: {
                    enabled: true
                }
            }});
        ReactDOM.render(<Plugin alwaysVisible/>, document.getElementById("container"));

        expect(document.querySelector(ADD_BTN_SELECTOR)).toNotExist();
        ReactDOM.render(<Plugin alwaysVisible items={[{ name: "MetadataExplorer" }]} />, document.getElementById("container"));
        expect(document.querySelector(ADD_BTN_SELECTOR)).toExist();
    });
});
