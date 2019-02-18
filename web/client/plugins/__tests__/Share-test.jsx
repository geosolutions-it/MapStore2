/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import url from 'url';
import { join } from 'lodash';
import * as SharePlugin from '../Share';
import { getPluginForTest } from './pluginsTestUtils';
import ReactTestUtils from 'react-dom/test-utils';
import { TOGGLE_CONTROL } from '../../actions/controls';

describe('Share Plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates a Share plugin with default configuration', () => {
        const controls = {};
        const { Plugin } = getPluginForTest(SharePlugin, { controls });
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        expect(document.getElementById('share-panel-dialog')).toNotExist();
    });

    it('creates a Share plugin with share control enabled', () => {
        const controls = {
            share: {
                enabled: true
            }
        };
        const { Plugin } = getPluginForTest(SharePlugin, { controls });
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        expect(document.getElementById('share-panel-dialog')).toExist();
    });

    it('test Share plugin on close', () => {
        const controls = {
            share: {
                enabled: true
            }
        };
        const { Plugin, actions } = getPluginForTest(SharePlugin, { controls });
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        expect(document.getElementById('share-panel-dialog')).toExist();
        const closeButton = document.getElementsByClassName('share-panel-close')[0];
        ReactTestUtils.Simulate.click(closeButton);
        expect(actions[0].type).toBe(TOGGLE_CONTROL);
        setTimeout(() => {
            expect(document.getElementById('share-panel-dialog')).toNotExist();
        }, 100);
    });

    it('test Share plugin bbox params, EPSG:4326', () => {
        const controls = {
            share: {
                enabled: true,
                settings: {
                    bboxEnabled: true
                }
            }
        };
        const map = {
            bbox: {
                bounds: {
                    minx: 9,
                    miny: 45,
                    maxx: 10,
                    maxy: 46
                },
                crs: 'EPSG:4326'
            }
        };
        const { Plugin } = getPluginForTest(SharePlugin, { controls, map });
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        expect(document.getElementById('share-panel-dialog')).toExist();
        const inputLink = document.querySelector('input[type=\'text\']');
        const shareUrl = inputLink.value;
        const { query } = url.parse(shareUrl);
        expect(query).toBe('bbox=9,45,10,46');
    });

    it('test Share plugin bbox params, EPSG:3857', () => {
        const controls = {
            share: {
                enabled: true,
                settings: {
                    bboxEnabled: true
                }
            }
        };
        const map = {
            bbox: {
                bounds: {
                    maxx: 2675907,
                    maxy: 6580922,
                    minx: -865878,
                    miny: 4279250
                },
                crs: 'EPSG:3857'
            }
        };
        const { Plugin } = getPluginForTest(SharePlugin, { controls, map });
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        expect(document.getElementById('share-panel-dialog')).toExist();
        const inputLink = document.querySelector('input[type=\'text\']');
        const shareUrl = inputLink.value;
        const { query } = url.parse(shareUrl, true);
        const extent = query.bbox.split(',').map((val) => Math.floor(parseFloat(val)));
        expect(extent[0]).toBe(-8);
        expect(extent[1]).toBe(35);
        expect(extent[2]).toBe(24);
        expect(extent[3]).toBe(50);
    });

    it('test Share plugin bbox params on IDL, get wider bbox on screen, EPSG:4326', () => {

        const splitExtentLeftScreen = [
            -200,
            45,
            -180,
            46
        ];
        const splitExtentRightScreen = [
            -180,
            45,
            -130,
            46
        ];
        const controls = {
            share: {
                enabled: true,
                settings: {
                    bboxEnabled: true
                }
            }
        };
        const map = {
            bbox: {
                bounds: {
                    maxx: splitExtentRightScreen[2],
                    maxy: splitExtentRightScreen[3],
                    minx: splitExtentLeftScreen[0],
                    miny: splitExtentRightScreen[1]
                },
                crs: 'EPSG:4326'
            }
        };
        const { Plugin } = getPluginForTest(SharePlugin, { controls, map });
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        expect(document.getElementById('share-panel-dialog')).toExist();
        const inputLink = document.querySelector('input[type=\'text\']');
        const shareUrl = inputLink.value;
        const { query } = url.parse(shareUrl);
        expect(query).toBe(`bbox=${join(splitExtentRightScreen, ',')}`);
    });

});
