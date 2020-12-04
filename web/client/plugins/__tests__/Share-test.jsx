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
import { join, toNumber } from 'lodash';
import * as SharePlugin from '../Share';
import { getPluginForTest } from './pluginsTestUtils';
import ReactTestUtils from 'react-dom/test-utils';
import { TOGGLE_CONTROL } from '../../actions/controls';
import { PURGE_MAPINFO_RESULTS, HIDE_MAPINFO_MARKER } from '../../actions/mapInfo';

describe('Share Plugin', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="container"></div>';
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
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
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        expect(document.getElementById('share-panel-dialog')).toExist();
        done();
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
        expect(actions[1].type).toBe(HIDE_MAPINFO_MARKER);
        expect(actions[2].type).toBe(PURGE_MAPINFO_RESULTS);
        expect(document.getElementById('share-panel-dialog')).toNotExist();
        done();
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
            expect(document.getElementById('share-panel-dialog')).toExist();
            const inputLink = document.querySelector('input[type=\'text\']');
            const shareUrl = inputLink.value;
            const splitUrl = shareUrl.split('?');
            const query = splitUrl[splitUrl.length - 1];
            expect(query).toBe('bbox=9,45,10,46');
            done();
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
        expect(document.getElementById('share-panel-dialog')).toExist();
        const inputLink = document.querySelector('input[type=\'text\']');
        const shareUrl = inputLink.value;
        const splitUrl = shareUrl.split('?');
        const query = splitUrl[splitUrl.length - 1];
        expect(query).toBe(`bbox=${join(splitExtentRightScreen, ',')}`);
        done();
    });

    it('test Share plugin advanced options is active by default and add bbox param or center and zoom param checkbox is unchecked', (done) => {
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
            const sharePanelDialog = document.getElementById('share-panel-dialog');
            expect(sharePanelDialog).toExist();
            const switchButton = sharePanelDialog.querySelector('.mapstore-switch-btn input[type=\'checkbox\']');
            expect(switchButton).toExist();
            expect(switchButton.checked).toBe(true);
            const checkBoxes = sharePanelDialog.querySelectorAll('.panel-body .checkbox input[type=\'checkbox\']');
            const bboxCheckbox = checkBoxes[0];
            const centerAndZoomCheckbox = checkBoxes[1];
            expect(bboxCheckbox).toExist();
            expect(centerAndZoomCheckbox).toExist();
            expect(bboxCheckbox.checked).toBe(false);
            expect(centerAndZoomCheckbox.checked).toBe(false);
            done();
        } catch (e) {
            done(e);
        }
    });

    it('test Share plugin only one param option is checked at a time', (done) => {
        try {
            let controls = {
                share: {
                    enabled: true,
                    settings: {
                        bboxEnabled: true
                    }
                }
            };
            const map = {
                bbox: { bounds: {}, crs: 'EPSG:4326'},
                center: {x: 0, y: 0, crs: 'EPSG:4326'},
                zoom: 5
            };
            const { Plugin } = getPluginForTest(SharePlugin, { controls, map });
            ReactDOM.render(<Plugin />, document.getElementById("container"));
            let sharePanelDialog = document.getElementById('share-panel-dialog');
            expect(sharePanelDialog).toExist();
            let switchButton = sharePanelDialog.querySelector('.mapstore-switch-btn input[type=\'checkbox\']');
            expect(switchButton).toExist();
            expect(switchButton.checked).toBe(true);
            let checkBoxes = sharePanelDialog.querySelectorAll('.panel-body .checkbox input[type=\'checkbox\']');
            let bboxCheckbox = checkBoxes[0];
            let centerAndZoomCheckbox = checkBoxes[1];
            expect(bboxCheckbox).toExist();
            expect(centerAndZoomCheckbox).toExist();
            expect(bboxCheckbox.checked).toBe(true);
            expect(centerAndZoomCheckbox.checked).toBe(false);

            controls = {
                share: {
                    enabled: true,
                    settings: {
                        centerAndZoomEnabled: true
                    }
                }
            };
            const { Plugin: PluginModified } = getPluginForTest(SharePlugin, { controls, map });
            ReactDOM.render(<PluginModified />, document.getElementById("container"));
            sharePanelDialog = document.getElementById('share-panel-dialog');
            expect(sharePanelDialog).toExist();
            switchButton = sharePanelDialog.querySelector('.mapstore-switch-btn input[type=\'checkbox\']');
            expect(switchButton).toExist();
            expect(switchButton.checked).toBe(true);
            checkBoxes = sharePanelDialog.querySelectorAll('.panel-body .checkbox input[type=\'checkbox\']');
            bboxCheckbox = checkBoxes[0];
            centerAndZoomCheckbox = checkBoxes[1];
            expect(bboxCheckbox).toExist();
            expect(centerAndZoomCheckbox).toExist();
            expect(bboxCheckbox.checked).toBe(false);
            expect(centerAndZoomCheckbox.checked).toBe(true);
            done();
        } catch (e) {
            done(e);
        }
    });

    it('test Share plugin center and zoom params', (done) => {
        const controls = {
            share: {
                enabled: true,
                settings: {
                    centerAndZoomEnabled: true
                }
            }
        };
        const map = {
            center: {crs: "EPSG:4326",
                x: -86.25,
                y: 38.07
            },
            zoom: 5
        };
        const props = {
            advancedSettings: {
                centerAndZoom: true
            }
        };
        const { Plugin } = getPluginForTest(SharePlugin, { controls, map });
        ReactDOM.render(<Plugin {...props}/>, document.getElementById("container"));

        expect(document.getElementById('share-panel-dialog')).toExist();
        const inputLink = document.querySelector('input[type=\'text\']');
        const shareUrl = inputLink.value;
        const splitUrl = shareUrl.split('?');
        const query = splitUrl[splitUrl.length - 1];
        const { query: hashQuery } = url.parse(`?${query}`, true);
        const center = hashQuery.center.split(',').map((val) => Math.floor(parseFloat(val)));
        const zoom = hashQuery.zoom;
        expect(center[0]).toBe(-87);
        expect(center[1]).toBe(38);
        expect(zoom).toBe("5");
        done();

    });

    it('test Share plugin marker param', (done) => {
        const controls = {
            share: {
                enabled: true,
                settings: {
                    centerAndZoomEnabled: true,
                    markerEnabled: true
                }
            }
        };

        const map = {
            center: {
                crs: "EPSG:4326",
                x: -86.25,
                y: 38.07
            },
            zoom: 5
        };
        const props = {
            advancedSettings: {
                centerAndZoom: true
            }
        };
        const {Plugin} = getPluginForTest(SharePlugin, {controls, map});
        ReactDOM.render(<Plugin {...props}/>, document.getElementById("container"));

        expect(document.getElementById('share-panel-dialog')).toExist();
        const inputLink = document.querySelector('input[type=\'text\']');
        const shareUrl = inputLink.value;
        const splitUrl = shareUrl.split('?');
        const query = splitUrl[splitUrl.length - 1];
        const {query: hashQuery} = url.parse(`?${query}`, true);
        const marker = hashQuery.marker.split(',').map((val) => Math.floor(parseFloat(val)));
        const zoom = hashQuery.zoom;
        expect(marker[0]).toBe(-87);
        expect(marker[1]).toBe(38);
        expect(zoom).toBe("5");
        done();
    });

    it('test Share plugin center and zoom field validation', (done) => {
        const controls = {
            share: {
                enabled: true,
                settings: {
                    centerAndZoomEnabled: true
                }
            }
        };
        const map = {
            center: {crs: "EPSG:4326",
                x: -86.25,
                y: 38.07
            },
            zoom: 5
        };
        const props = {
            advancedSettings: {
                centerAndZoom: true
            }
        };
        const { Plugin } = getPluginForTest(SharePlugin, { controls, map });
        ReactDOM.render(<Plugin {...props}/>, document.getElementById("container"));

        expect(document.getElementById('share-panel-dialog')).toExist();
        const inputLink = document.querySelectorAll('input.form-control');
        let lat = inputLink[1];
        let lon = inputLink[2];
        let zoom = inputLink[3];
        expect(toNumber(lat.value)).toBe(38.07);
        expect(toNumber(lon.value)).toBe(-86.25);
        expect(toNumber(zoom.value)).toBe(5);
        let inputText = document.querySelector('input[type=\'text\']');
        let shareUrl = inputText.value;
        let splitUrl = shareUrl.split('?');
        let query = splitUrl[splitUrl.length - 1];
        const {query: hashQuery1} = url.parse(`?${query}`, true);
        let center = hashQuery1.center.split(',').map((val) => Math.floor(parseFloat(val)));
        expect(center[0]).toBe(-87);
        expect(center[1]).toBe(38);
        ReactTestUtils.Simulate.focus(lat);
        ReactTestUtils.Simulate.change(lat, {target: {value: 42.01}});
        ReactTestUtils.Simulate.focus(lon);
        ReactTestUtils.Simulate.change(lon, {target: {value: -89.01}});
        const button = document.querySelectorAll('button');
        ReactTestUtils.Simulate.click(button[3]);
        const inputLinks = document.querySelectorAll('input.form-control');
        expect(toNumber(inputLinks[1].value)).toBe(42.01);
        expect(toNumber(inputLinks[2].value)).toBe(-89.01);
        done();
    });

});
