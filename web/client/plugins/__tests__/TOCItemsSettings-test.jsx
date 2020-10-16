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

import TOCItemsSettingsPlugin from '../TOCItemsSettings';
import { getPluginForTest } from './pluginsTestUtils';

import StyleEditor from '../StyleEditor';
import ThematicLayer from '../ThematicLayer';

import { createStateMocker } from '../../reducers/__tests__/reducersTestUtils';

import { addLayer, selectNode, showSettings, UPDATE_NODE } from '../../actions/layers';
import { INIT_STYLE_SERVICE } from '../../actions/styleeditor';

import layers from '../../reducers/layers';
import controls from '../../reducers/controls';

import { setControlProperty } from '../../actions/controls';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

import CAPABILITIES from 'raw-loader!../../test-resources/wms/GetCapabilities-1.3.0.xml';

const STYLE_EDITOR_ITEM = {
    ...StyleEditor.StyleEditorPlugin.TOCItemsSettings,
    plugin: StyleEditor.StyleEditorPlugin
};
// sample plugin with alwaysVisible = true
const THEMATIC_LAYER_ITEM = {
    ...ThematicLayer.ThematicLayerPlugin.TOCItemsSettings,
    plugin: ThematicLayer.ThematicLayerPlugin
};


const SETTINGS_SELECTOR = '.ms-side-panel';
const NAV_SELECTOR = 'ul.nav-tabs';
const TAB_INDEX_SELECTOR = `${NAV_SELECTOR} > li`;
const TAB_CONTENT_SELECTOR = 'main';
const TEST_LAYER = {
    id: "TEST_WMS",
    type: "wms",
    name: "nurc:Arc_Sample",
    url: "/geoserver/wms"
};

describe('TOCItemsSettings Plugin', () => {
    let mockAxios;
    const stateMocker = createStateMocker({ layers, controls });
    const OPEN_PANEL_ACTIONS = [addLayer(TEST_LAYER), selectNode(TEST_LAYER.id, 'layer'), showSettings(TEST_LAYER.id, "layers", { opacity: 1 })];
    const DISPLAY_PANEL_ACTIONS = [setControlProperty("layersettings", "activeTab", "display")];
    const STYLE_PANEL_ACTIONS = [setControlProperty("layersettings", "activeTab", "style")];
    const OPEN_PANEL_STATE = stateMocker(...OPEN_PANEL_ACTIONS);
    const DISPLAY_PANEL_STATE = stateMocker(...OPEN_PANEL_ACTIONS, ...DISPLAY_PANEL_ACTIONS);
    const STYLE_PANEL_STATE = stateMocker(...OPEN_PANEL_ACTIONS, ...STYLE_PANEL_ACTIONS);
    beforeEach((done) => {
        mockAxios = new MockAdapter(axios);
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        mockAxios.restore();
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates a Toolbar plugin with default configuration, general tab', () => {
        const { Plugin } = getPluginForTest(TOCItemsSettingsPlugin, OPEN_PANEL_STATE);
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        expect(document.querySelector(SETTINGS_SELECTOR)).toExist();
        const tabIndexes = document.querySelectorAll(TAB_INDEX_SELECTOR);
        expect(tabIndexes.length).toBe(4);
        expect(tabIndexes[0].className).toBe("active"); // general tab active
        expect(document.querySelectorAll(`${TAB_CONTENT_SELECTOR} div.form-group`).length).toBe(4); // check content is general settings tab.

    });
    it('display panel', () => {
        const { Plugin } = getPluginForTest(TOCItemsSettingsPlugin, DISPLAY_PANEL_STATE);
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        expect(document.querySelector(SETTINGS_SELECTOR)).toExist();
        const tabIndexes = document.querySelectorAll(TAB_INDEX_SELECTOR);
        expect(tabIndexes.length).toBe(4);
        expect(tabIndexes[1].className).toBe("active");
        expect(document.querySelectorAll(`${TAB_CONTENT_SELECTOR} div.form-group`).length).toBe(6);
    });
    it('default style selector', done => {
        mockAxios.onGet().reply(() => {
            return [200, CAPABILITIES];
        });
        const checkStylesEpic = action$ => action$
            .ofType(UPDATE_NODE)
            .filter(({ options = {} }) => !options.capabilitiesLoading) // skip loading event
            .map(action => {
                expect(action.options.availableStyles).toExist();
                expect(action.options.availableStyles.length).toBe(2);
                expect(document.querySelectorAll('.msSideGrid .items-list > div').length).toBe(2); // check layer list rendered
                done();
            }).ignoreElements();
        const { Plugin } = getPluginForTest(TOCItemsSettingsPlugin, STYLE_PANEL_STATE, undefined, checkStylesEpic);
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        expect(document.querySelector(SETTINGS_SELECTOR)).toExist();
        const tabIndexes = document.querySelectorAll(TAB_INDEX_SELECTOR);
        expect(tabIndexes.length).toBe(4);
        expect(tabIndexes[2].className).toBe("active");
    });

    it('style panel with style editor', done => {
        mockAxios.onGet().reply(() => {
            return [200, CAPABILITIES];
        });
        const checkStylesEpic = action$ => action$
            .ofType(INIT_STYLE_SERVICE)
            .map(() => {
                // TODO: continue, check GUI
                done();
            }).ignoreElements();
        const { Plugin } = getPluginForTest(TOCItemsSettingsPlugin, STYLE_PANEL_STATE, {
            StyleEditorPlugin: StyleEditor
        }, checkStylesEpic);
        ReactDOM.render(<Plugin items={[STYLE_EDITOR_ITEM]} />, document.getElementById("container"));
        const tabIndexes = document.querySelectorAll(TAB_INDEX_SELECTOR);
        expect(tabIndexes[2].className).toBe("active");
    });
    it('style panel with thematic layer', done => {
        mockAxios.onGet().reply(() => {
            return [200, CAPABILITIES];
        });
        const checkStylesEpic = action$ => action$
            .map(() => {
                done();
            });
        const { Plugin } = getPluginForTest(TOCItemsSettingsPlugin, STYLE_PANEL_STATE, { ThematicLayerPlugin: ThematicLayer }, checkStylesEpic);
        ReactDOM.render(<Plugin items={[THEMATIC_LAYER_ITEM]} />, document.getElementById("container"));
        const tabIndexes = document.querySelectorAll(TAB_INDEX_SELECTOR);
        expect(tabIndexes[2].className).toBe("active");
    });


});
