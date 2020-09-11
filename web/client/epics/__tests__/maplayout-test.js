/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');

const { toggleControl, setControlProperty, setControlProperties } = require('../../actions/controls');
const {UPDATE_MAP_LAYOUT} = require('../../actions/maplayout');
const {closeIdentify, purgeMapInfoResults, noQueryableLayers} = require('../../actions/mapInfo');

const {updateMapLayoutEpic} = require('../maplayout');
const {testEpic, addTimeoutEpic, TEST_TIMEOUT} = require('./epicTestUtils');
const ConfigUtils = require('../../utils/ConfigUtils');

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
                    expect(action.layout).toEqual({ left: 600, right: 330, bottom: 30, transform: 'none', height: 'calc(100% - 30px)', boundingMapRect: {
                        bottom: 30,
                        left: 600,
                        right: 330
                    }});
                });
            } catch (e) {
                done(e);
            }
            done();
        };
        const state = {controls: { metadataexplorer: {enabled: true}, queryPanel: {enabled: true}}};
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
                        left: 600, right: 330, bottom: 120, transform: 'none', height: 'calc(100% - 120px)', boundingMapRect: {
                            bottom: 120,
                            left: 600,
                            right: 330
                        }
                    });
                });
            } catch (e) {
                done(e);
            }
            done();
        };
        const state = { controls: { metadataexplorer: { enabled: true }, queryPanel: { enabled: true } } };
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
                        left: 512, right: 0, bottom: 30, transform: 'none', height: 'calc(100% - 30px)', boundingMapRect: {
                            left: 512,
                            right: 0,
                            bottom: 30
                        }
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
        const epicResult = done => actions => {
            try {
                expect(actions.length).toBe(1);
                actions.map((action) => {
                    expect(action.type).toBe(UPDATE_MAP_LAYOUT);
                    expect(action.layout).toEqual({
                        left: 0, right: 330, bottom: 30, transform: 'none', height: 'calc(100% - 30px)', boundingMapRect: {
                            bottom: 30,
                            left: 0,
                            right: 330
                        }
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
        it('annotations', (done) => {
            const state = { controls: { annotations: { enabled: true, group: "parent" } } };
            testEpic(updateMapLayoutEpic, 1, setControlProperties("annotations", "enabled", true, "group", "parent"), epicResult(done), state);
        });
        it('details', (done) => {
            const state = { controls: { details: { enabled: true, group: "parent" } } };
            testEpic(updateMapLayoutEpic, 1, setControlProperties("details", "enabled", true, "group", "parent"), epicResult(done), state);
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
});
