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
import { BackgroundSelectorAdd } from '../MetadataExplorer';

const BG_PLUGIN_SELECTOR = '.ms-background-selector';
const OPEN_BTN_SELECTOR = `${BG_PLUGIN_SELECTOR} button`;
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
        expect(document.querySelector(OPEN_BTN_SELECTOR)).toExist();
    });
    it('Add button present only if bg selector open', () => {
        const { Plugin } = getPluginForTest(BackgroundSelectorPlugin, {
            layers: { flat: [{ group: 'background' }] },
            controls: {
                backgroundSelector: {
                    enabled: true
                }
            }});
        ReactDOM.render(<Plugin alwaysVisible/>, document.getElementById("container"));

        expect(document.querySelectorAll(OPEN_BTN_SELECTOR).length).toEqual(1);
        ReactDOM.render(<Plugin alwaysVisible items={[{
            "name": "MetadataExplorer",
            "doNotHide": true,
            "priority": 1,
            "target": "background-toolbar",
            Component: BackgroundSelectorAdd,
            plugin: () => <></>,
            "cfg": {
                "wrap": true
            },
            "items": [
                {
                    "name": "SecurityPopup",
                    "target": "url-addon",
                    "cfg": {},
                    "items": [],
                    Component: () => <></>,
                    plugin: () => <></>
                }
            ]
        }]} />, document.getElementById("container"));
        expect(document.querySelectorAll('.glyphicon-plus').length).toEqual(1);
    });
});
