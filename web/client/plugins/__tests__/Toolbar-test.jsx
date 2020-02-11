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

import plugin from '../Toolbar';
import { getPluginForTest } from './pluginsTestUtils';
const toPluginCmp = plugin.ToolbarPlugin;
const ToolbarPlugin = {
    ...plugin,
    ToolbarPlugin: toPluginCmp('toolbar')
};
import Expander from '../Expander';
import ZoomIn from '../ZoomIn';
import ZoomOut from '../ZoomOut';
import FullScreen from '../FullScreen';

const ZOOM_IN_ITEM = {
    ...ZoomIn.ZoomInPlugin.Toolbar,
    plugin: ZoomIn.ZoomInPlugin
};
const ZOOM_OUT_ITEM = {
    ...ZoomOut.ZoomOutPlugin.Toolbar,
    plugin: ZoomOut.ZoomOutPlugin
};
const EXPANDER_ITEM = {
    ...Expander.ExpanderPlugin.Toolbar,
    plugin: Expander.ExpanderPlugin
};
// sample plugin with alwaysVisible = true
const FULL_SCREEN_ITEM = {
    ...FullScreen.FullScreenPlugin.Toolbar,
    plugin: FullScreen.FullScreenPlugin
};

describe('Toolbar Plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates a Toolbar plugin with default configuration', () => {
        const { Plugin } = getPluginForTest(ToolbarPlugin, { controls: { toolbar: { expanded: false } } }, {ExpanderPlugin: Expander, ZoomInPlugin: ZoomIn});
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        expect(document.querySelector('#mapstore-toolbar')).toExist();
    });
    it('items rendering', () => {
        const { Plugin } = getPluginForTest(ToolbarPlugin, { controls: { toolbar: { expanded: false } }});
        // ONLY ONE BUTTON TO HIDE, EXPANDER DO NOT SHOW, button is directly visible
        ReactDOM.render(<Plugin disableAnimation items={[ZOOM_IN_ITEM, EXPANDER_ITEM]} />, document.getElementById("container"));
        expect(document.querySelector('#mapstore-toolbar')).toExist();
        expect(document.querySelector('#zoomin-btn')).toExist();
        expect(document.querySelectorAll('#mapstore-toolbar button').length).toBe(1);
        let expander = document.querySelector('#mapstore-toolbar button .glyphicon-option-horizontal');
        expect(expander).toNotExist();
        // TWO BUTTONS TO HIDE, EXPANDER SHOWS, all buttons are hidden
        ReactDOM.render(<Plugin disableAnimation items={[ZOOM_IN_ITEM, ZOOM_OUT_ITEM, EXPANDER_ITEM]} />, document.getElementById("container"));
        expect(document.querySelectorAll('#mapstore-toolbar button').length).toBe(1);
        expect(document.querySelector('#mapstore-toolbar')).toExist();
        expect(document.querySelector('#zoomin-btn')).toNotExist();
        expander = document.querySelector('#mapstore-toolbar button .glyphicon-option-horizontal');
        expect(expander).toExist();
        expect(document.querySelector('#mapstore-toolbar button.btn-success .glyphicon-option-horizontal')).toNotExist(); // btn-success means active, it should be collapsed because state contains {expanded: false}
        // Buttons with alwaysVisible = true always shown (FULL SCREEN)
        ReactDOM.render(<Plugin disableAnimation items={[ZOOM_IN_ITEM, ZOOM_OUT_ITEM, FULL_SCREEN_ITEM, EXPANDER_ITEM]} />, document.getElementById("container"));
        expect(document.querySelectorAll('#mapstore-toolbar button').length).toBe(2);
        expect(document.querySelector('#mapstore-toolbar')).toExist();
        expect(document.querySelector('#zoomin-btn')).toNotExist();
        expect(document.querySelector('#fullscreen-btn')).toExist();
        expander = document.querySelector('#mapstore-toolbar button .glyphicon-option-horizontal');
        expect(expander).toExist();
        expect(document.querySelector('#mapstore-toolbar button.btn-success .glyphicon-option-horizontal')).toNotExist(); // btn-success means active, it should be collapsed because state contains {expanded: false}
        // SIMULATE EXPANDER OPEN, all buttons are visible, expander active
        expander.click();
        expect(document.querySelectorAll('#mapstore-toolbar button').length).toBe(4);
        expect(document.querySelector('#zoomin-btn')).toExist();
        expect(document.querySelector('#zoomout-btn')).toExist();
        expect(document.querySelector('#mapstore-toolbar')).toExist();
        expect(document.querySelector('#fullscreen-btn')).toExist();
        expander = document.querySelector('#mapstore-toolbar button.btn-success .glyphicon-option-horizontal'); // btn-success means active
        expect(expander).toExist();
    });

});
