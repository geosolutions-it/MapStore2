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

    it('creates a Share plugin with share control enabled', (done) => {
        const controls = {
            share: {
                enabled: true
            }
        };
        const { Plugin } = getPluginForTest(SharePlugin, { controls });
        setTimeout(() => {
            ReactDOM.render(<Plugin />, document.getElementById("container"));
            expect(document.getElementById('share-panel-dialog')).toExist();
            done();
        }, 100);
    });

    it('test Share plugin on close', (done) => {
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
            done();
        }, 100);
    });

    it('test Share plugin bbox params, EPSG:4326', (done) => {
        try {
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
            const props = {
                advancedSettings: {
                    bbox: true
                }
            };
            const { Plugin } = getPluginForTest(SharePlugin, { controls, map });
            ReactDOM.render(<Plugin {...props}/>, document.getElementById("container"));
            setTimeout(() => {
                expect(document.getElementById('share-panel-dialog')).toExist();
                const inputLink = document.querySelector('input[type=\'text\']');
                const shareUrl = inputLink.value;
                const splitUrl = shareUrl.split('?');
                const query = splitUrl[splitUrl.length - 1];
                expect(query).toBe('bbox=9,45,10,46');
                done();
            }, 500);
        } catch (e) {
            done(e);
        }
    });

    it('test Share plugin bbox params, EPSG:3857', (done) => {
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
        const props = {
            advancedSettings: {
                bbox: true
            }
        };
        const { Plugin } = getPluginForTest(SharePlugin, { controls, map });
        ReactDOM.render(<Plugin {...props}/>, document.getElementById("container"));

        setTimeout(() => {
            expect(document.getElementById('share-panel-dialog')).toExist();
            const inputLink = document.querySelector('input[type=\'text\']');
            const shareUrl = inputLink.value;
            const splitUrl = shareUrl.split('?');
            const query = splitUrl[splitUrl.length - 1];
            const { query: hashQuery } = url.parse(`?${query}`, true);
            const extent = hashQuery.bbox.split(',').map((val) => Math.floor(parseFloat(val)));
            expect(extent[0]).toBe(-8);
            expect(extent[1]).toBe(35);
            expect(extent[2]).toBe(24);
            expect(extent[3]).toBe(50);
            done();
        }, 500);

    });

    it('test Share plugin bbox params on IDL, get wider bbox on screen, EPSG:4326', (done) => {

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
        const props = {
            advancedSettings: {
                bbox: true
            }
        };
        const { Plugin } = getPluginForTest(SharePlugin, { controls, map });
        ReactDOM.render(<Plugin {...props}/>, document.getElementById("container"));
        setTimeout(() => {
            expect(document.getElementById('share-panel-dialog')).toExist();
            const inputLink = document.querySelector('input[type=\'text\']');
            const shareUrl = inputLink.value;
            const splitUrl = shareUrl.split('?');
            const query = splitUrl[splitUrl.length - 1];
            expect(query).toBe(`bbox=${join(splitExtentRightScreen, ',')}`);
            done();
        }, 1000);
    });

    it('test Share plugin advanced options is active by default and add bbox param checkbox is unchecked, EPSG:4326', (done) => {
        try {
            const controls = {
                share: {
                    enabled: true
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
            setTimeout(() => {
                const sharePanelDialog = document.getElementById('share-panel-dialog');
                expect(sharePanelDialog).toExist();
                const switchButton = sharePanelDialog.querySelector('.mapstore-switch-btn input[type=\'checkbox\']');
                expect(switchButton).toExist();
                expect(switchButton.checked).toBe(true);
                const bboxCheckbox = sharePanelDialog.querySelector('.panel-body .checkbox input[type=\'checkbox\']');
                expect(bboxCheckbox).toExist();
                expect(bboxCheckbox.checked).toBe(false);
                done();
            }, 500);
        } catch (e) {
            done(e);
        }
    });

});
