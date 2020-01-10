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
import ReactTestUtils from 'react-dom/test-utils';

import DrawerMenuPlugin from '../DrawerMenu';
import { getPluginForTest } from './pluginsTestUtils';

const SAMPLE_ITEM = {
    plugin: "TEST",
    name: 'toc',
    position: 1,
    glyph: "1-layer",
    icon: <div></div>,
    buttonConfig: {
        buttonClassName: "square-button no-border",
        tooltip: "toc.layers"
    },
    priority: 2
};

const mouseMove = (x, y, node) => {
    const doc = node ? node.ownerDocument : document;
    const evt = doc.createEvent('MouseEvents');
    evt.initMouseEvent('mousemove', true, true, window,
        0, 0, 0, x, y, false, false, false, false, 0, null);
    doc.dispatchEvent(evt);
    return evt;
};

const simulateMovementFromTo = (drag, fromX, fromY, toX, toY) => {
    const node = ReactDOM.findDOMNode(drag);

    ReactTestUtils.Simulate.mouseDown(node, { clientX: fromX, clientY: fromX });
    mouseMove(toX, toY, node);
    ReactTestUtils.Simulate.mouseUp(node);
};

describe('DrawerMenu Plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('doesn\'t render if empty', () => {
        const { Plugin } = getPluginForTest(DrawerMenuPlugin, {
            controls: {
                drawer: {}
            }
        });
        ReactDOM.render(<Plugin menuOptions={{ resizable: true }} />, document.getElementById("container"));
        expect(document.getElementById('mapstore-drawermenu')).toNotExist();

        ReactDOM.render(<Plugin items={[SAMPLE_ITEM]} menuOptions={{ resizable: true }} />, document.getElementById("container"));
        expect(document.getElementById('mapstore-drawermenu')).toExist();
    });
    it('creates a resizable DrawerMenu plugin', () => {
        const { Plugin, store } = getPluginForTest(DrawerMenuPlugin, { controls: {
            drawer: {}
        } });
        ReactDOM.render(<Plugin items={[SAMPLE_ITEM]} menuOptions={{resizable: true}} />, document.getElementById("container"));
        expect(document.getElementById('mapstore-drawermenu')).toExist();

        const drag = document.getElementsByClassName('react-resizable-handle')[0];
        simulateMovementFromTo(drag, 300, 100, 400, 100);
        expect(store.getState().controls.drawer.resizedWidth).toBe(400);
    });
});
