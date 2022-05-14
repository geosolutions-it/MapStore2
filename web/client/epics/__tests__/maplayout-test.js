/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import { toggleControl, setControlProperty, setControlProperties } from '../../actions/controls';
import { UPDATE_MAP_LAYOUT } from '../../actions/maplayout';
import { closeIdentify, purgeMapInfoResults, noQueryableLayers } from '../../actions/mapInfo';
import { updateMapLayoutEpic } from '../maplayout';
import { testEpic, addTimeoutEpic, TEST_TIMEOUT } from './epicTestUtils';
import ConfigUtils from '../../utils/ConfigUtils';
import { openFeatureGrid } from "../../actions/featuregrid";

describe('map layout epics', () => {
    afterEach(() => {
        ConfigUtils.setConfigProp('mapLayout', null);
    });
    it('tests layout', (done) => {
        const epicResult = actions => {
            try {
                expect(actions.length).toBe(1);
                actions.map((action) => {
                    expect(action.type).toBe(UPDATE_MAP_LAYOUT);
                    expect(action.layout).toEqual(
                        { left: 600, right: 548, bottom: 0, transform: 'none', height: 'calc(100% - 30px)',
                            boundingMapRect: {
                                bottom: 0,
                                left: 600,
                                right: 548
                            },
                            boundingSidebarRect: { right: 0, left: 0, bottom: 0 },
                            leftPanel: true,
                            rightPanel: true
                        }
                    );
                });
            } catch (e) {
                done(e);
            }
            done();
        };
        const state = {controls: { metadataexplorer: {enabled: true}, queryPanel: {enabled: true}}};
        testEpic(updateMapLayoutEpic, 1, toggleControl("queryPanel"), epicResult, state);
    });

    it('tests layout with sidebar', (done) => {
        const epicResult = actions => {
            try {
                expect(actions.length).toBe(1);
                actions.map((action) => {
                    expect(action.type).toBe(UPDATE_MAP_LAYOUT);
                    expect(action.layout).toEqual(
                        { left: 600, right: 588, bottom: 0, transform: 'none', height: 'calc(100% - 30px)',
                            boundingMapRect: {
                                bottom: 0,
                                left: 600,
                                right: 588
                            },
                            boundingSidebarRect: { right: 40, left: 0, bottom: 0 },
                            leftPanel: true,
                            rightPanel: true
                        }
                    );
                });
            } catch (e) {
                done(e);
            }
            done();
        };
        const state = {controls: { metadataexplorer: {enabled: true}, queryPanel: {enabled: true}, sidebarMenu: {enabled: true} }};
        testEpic(updateMapLayoutEpic, 1, toggleControl("queryPanel"), epicResult, state);
    });

    it('tests layout with prop', (done) => {
        ConfigUtils.setConfigProp('mapLayout', {
            left: { sm: 300, md: 500, lg: 600 },
            right: { md: 330 },
            bottom: { sm: 120 }
        });
        const epicResult = actions => {
            try {
                expect(actions.length).toBe(1);
                actions.map((action) => {
                    expect(action.type).toBe(UPDATE_MAP_LAYOUT);
                    expect(action.layout).toEqual({
                        left: 0, right: 330, bottom: 0, transform: 'none', height: 'calc(100% - 120px)',
                        boundingMapRect: {
                            bottom: 0,
                            left: 0,
                            right: 330
                        },
                        boundingSidebarRect: { right: 0, left: 0, bottom: 0 },
                        leftPanel: false,
                        rightPanel: true
                    });
                });
            } catch (e) {
                done(e);
            }
            done();
        };
        const state = { controls: { metadataexplorer: { enabled: true }, queryPanel: { enabled: false } } };
        testEpic(updateMapLayoutEpic, 1, toggleControl("queryPanel"), epicResult, state);
    });

    it('tests layout embedded', (done) => {
        const epicResult = actions => {
            try {
                expect(actions.length).toBe(1);
                actions.map((action) => {
                    expect(action.type).toBe(UPDATE_MAP_LAYOUT);
                    expect(action.layout).toEqual({ height: 'calc(100% - 30px)', boundingMapRect: {
                        bottom: undefined
                    }} );
                });
            } catch (e) {
                done(e);
            }
            done();
        };
        const state = {mode: 'embedded', controls: { drawer: {enabled: true}}};
        testEpic(updateMapLayoutEpic, 1, toggleControl("queryPanel"), epicResult, state);
    });

    it('tests on close identify', (done) => {
        const epicResult = actions => {
            try {
                expect(actions.length).toBe(1);
                actions.map((action) => {
                    expect(action.type).toBe(UPDATE_MAP_LAYOUT);
                });
            } catch (e) {
                done(e);
            }
            done();
        };
        const state = {};
        testEpic(updateMapLayoutEpic, 1, closeIdentify(), epicResult, state);
    });
    // avoid glitches with mouse click and widgets. See #3138
    it('purge map info should not trigger layout update', (done) => {
        const epicResult = actions => {
            try {
                expect(actions.length).toBe(1);
                actions.map((action) => {
                    expect(action.type).toBe(TEST_TIMEOUT);
                });
            } catch (e) {
                done(e);
            }
            done();
        };
        const state = {};
        testEpic(addTimeoutEpic(updateMapLayoutEpic, 10), 1, purgeMapInfoResults(), epicResult, state);

    });

    it('tests resizable drawer', (done) => {
        const epicResult = actions => {
            try {
                expect(actions.length).toBe(1);
                actions.map((action) => {
                    expect(action.type).toBe(UPDATE_MAP_LAYOUT);
                    expect(action.layout).toEqual({
                        left: 512, right: 0, bottom: 0, transform: 'none', height: 'calc(100% - 30px)',
                        boundingMapRect: {
                            left: 512,
                            right: 0,
                            bottom: 0
                        },
                        boundingSidebarRect: { right: 0, left: 0, bottom: 0 },
                        rightPanel: false,
                        leftPanel: true
                    });
                });
            } catch (e) {
                done(e);
            }
            done();
        };
        const state = { controls: { drawer: { enabled: true, resizedWidth: 512} } };
        testEpic(updateMapLayoutEpic, 1, setControlProperty("drawer", "resizedWidth", 512), epicResult, state);
    });

    describe('tests layout updated for right panels', () => {
        const epicResult = (done, right = 548) => actions => {
            try {
                expect(actions.length).toBe(1);
                actions.map((action) => {
                    expect(action.type).toBe(UPDATE_MAP_LAYOUT);
                    expect(action.layout).toEqual({
                        left: 0, right, bottom: 0, transform: 'none', height: 'calc(100% - 30px)',
                        boundingMapRect: {
                            bottom: 0,
                            left: 0,
                            right
                        },
                        boundingSidebarRect: { right: 0, left: 0, bottom: 0 },
                        rightPanel: !!right,
                        leftPanel: false
                    });
                });
            } catch (e) {
                done(e);
            }
            done();
        };
        it('metadataexplorer', done => {
            const state = { controls: { metadataexplorer: { enabled: true, group: "parent" } } };
            testEpic(updateMapLayoutEpic, 1, setControlProperties("metadataexplorer", "enabled", true, "group", "parent"), epicResult(done), state);
        });
        it('userExtensions', (done) => {
            const state = { controls: { userExtensions: { enabled: true, group: "parent" } } };
            testEpic(updateMapLayoutEpic, 1, setControlProperties("userExtensions", "enabled", true, "group", "parent"), epicResult(done), state);
        });
        it('details', (done) => {
            const state = { controls: { details: { enabled: true, group: "parent" } } };
            testEpic(updateMapLayoutEpic, 1, setControlProperties("details", "enabled", true, "group", "parent"), epicResult(done), state);
        });
    });

    describe('tests layout updated for left panels', () => {
        const epicResult = (done, left = 300) => actions => {
            try {
                expect(actions.length).toBe(1);
                actions.map((action) => {
                    expect(action.type).toBe(UPDATE_MAP_LAYOUT);
                    expect(action.layout).toEqual({
                        right: 0, left, bottom: 0, transform: 'none', height: 'calc(100% - 30px)',
                        boundingMapRect: {
                            bottom: 0,
                            right: 0,
                            left
                        },
                        boundingSidebarRect: { right: 0, left: 0, bottom: 0 },
                        leftPanel: true,
                        rightPanel: false
                    });
                });
            } catch (e) {
                done(e);
            }
            done();
        };
        it('annotations', (done) => {
            const state = { controls: { annotations: { enabled: true, group: "parent" } } };
            testEpic(updateMapLayoutEpic, 1, setControlProperties("annotations", "enabled", true, "group", "parent"), epicResult(done), state);
        });
    });


    it('tests layout updated on noQueryableLayers', (done) => {
        const epicResult = actions => {
            try {
                expect(actions.length).toBe(1);
                actions.map((action) => {
                    expect(action.type).toBe(UPDATE_MAP_LAYOUT);
                });
            } catch (e) {
                done(e);
            }
            done();
        };
        testEpic(updateMapLayoutEpic, 1, noQueryableLayers(), epicResult, {});
    });

    it('tests when feature grid open', (done) => {
        const epicResult = actions => {
            try {
                expect(actions.length).toBe(1);
                actions.map((action) => {
                    expect(action.type).toBe(UPDATE_MAP_LAYOUT);
                    expect(action.layout).toEqual({
                        left: 0, right: 0, bottom: '100%', dockSize: 100, transform: "translate(0, -30px)", height: "calc(100% - 30px)",
                        boundingMapRect: {bottom: "100%", dockSize: 100, left: 0, right: 0},
                        boundingSidebarRect: { right: 0, left: 0, bottom: 0 },
                        leftPanel: false,
                        rightPanel: false
                    });
                });
            } catch (e) {
                done(e);
            }
            done();
        };
        const state = {featuregrid: {open: true, dockSize: 1}};
        testEpic(updateMapLayoutEpic, 1, openFeatureGrid(), epicResult, state);
    });
});
