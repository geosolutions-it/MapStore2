/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import expect from 'expect';
import CAPABILITIES from 'raw-loader!../../test-resources/wms/GetCapabilities-1.3.0.xml';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import { waitFor } from '@testing-library/react';

import { setControlProperty } from '../../actions/controls';
import { UPDATE_NODE, addLayer, selectNode, showSettings } from '../../actions/layers';
import { SHOW_NOTIFICATION } from '../../actions/notifications';
import { INIT_STYLE_SERVICE } from '../../actions/styleeditor';
import { createStateMocker } from '../../reducers/__tests__/reducersTestUtils';
import controls from '../../reducers/controls';
import layers from '../../reducers/layers';
import StyleEditor from '../StyleEditor';
import ThematicLayer from '../ThematicLayer';
import TOCItemsSettingsPlugin from '../TOCItemsSettings';
import { getPluginForTest } from './pluginsTestUtils';

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
const TAB_CONTENT_SELECTOR = '.ms2-border-layout-content';
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
        expect(document.querySelectorAll(`${TAB_CONTENT_SELECTOR} div.form-group`).length).toBe(7); // check content is general settings tab.

    });
    it('shows the layer name error notification when pre-validation fails', (done) => {
        mockAxios.onGet().reply(404);
        const wfsLayer = {
            id: 'TEST_WFS',
            type: 'wfs',
            name: 'workspace:old',
            url: '/geoserver/wfs'
        };
        const wfsPanelState = stateMocker(
            addLayer(wfsLayer),
            selectNode(wfsLayer.id, 'layer'),
            showSettings(wfsLayer.id, 'layers', {opacity: 1})
        );
        const { Plugin, actions } = getPluginForTest(TOCItemsSettingsPlugin, wfsPanelState);
        ReactDOM.render(<Plugin />, document.getElementById('container'));

        const getInput = () => document.querySelector('[data-qa="layer-properties-name"]');
        const getEditButton = () => getInput().parentElement.querySelector('.input-group-addon');
        ReactTestUtils.Simulate.click(getEditButton());
        ReactTestUtils.Simulate.change(getInput(), {target: {value: 'workspace:missing'}});
        ReactTestUtils.Simulate.click(getEditButton());

        waitFor(() => {
            const notification = actions.find(({type}) => type === SHOW_NOTIFICATION);
            expect(notification).toExist();
            expect(notification.level).toBe('error');
            expect(notification.title).toBe('layerNameChangeError.title');
            expect(notification.message).toBe('layerNameChangeError.message');
        }).then(() => done()).catch(done);
    });
    it('display panel', () => {
        const { Plugin } = getPluginForTest(TOCItemsSettingsPlugin, DISPLAY_PANEL_STATE);
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        expect(document.querySelector(SETTINGS_SELECTOR)).toExist();
        const tabIndexes = document.querySelectorAll(TAB_INDEX_SELECTOR);
        expect(tabIndexes.length).toBe(4);
        expect(tabIndexes[1].className).toBe("active");
        expect(document.querySelectorAll(`${TAB_CONTENT_SELECTOR} div.form-group`).length).toBe(8);
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
