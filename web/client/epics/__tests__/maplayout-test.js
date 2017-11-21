/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');

const {toggleControl} = require('../../actions/controls');
const {UPDATE_MAP_LAYOUT} = require('../../actions/maplayout');
const {updateMapLayoutEpic} = require('../maplayout');
const {testEpic} = require('./epicTestUtils');

describe('map layout epics', () => {
    it('tests layout', (done) => {
        const epicResult = actions => {
            try {
                expect(actions.length).toBe(1);
                actions.map((action) => {
                    expect(action.type).toBe(UPDATE_MAP_LAYOUT);
                    expect(action.layout).toEqual({ left: 600, right: 658, bottom: 30, transform: 'none', height: 'calc(100% - 30px)' } );
                });
            } catch(e) {
                done(e);
            }
            done();
        };
        const state = {controls: { metadataexplorer: {enabled: true}, queryPanel: {enabled: true}}};
        testEpic(updateMapLayoutEpic, 1, toggleControl("queryPanel"), epicResult, state);
    });

    it('tests layout embedded', (done) => {
        const epicResult = actions => {
            try {
                expect(actions.length).toBe(1);
                actions.map((action) => {
                    expect(action.type).toBe(UPDATE_MAP_LAYOUT);
                    expect(action.layout).toEqual({ height: 'calc(100% - 30px)' } );
                });
            } catch(e) {
                done(e);
            }
            done();
        };
        const state = {mode: 'embedded', controls: { drawer: {enabled: true}}};
        testEpic(updateMapLayoutEpic, 1, toggleControl("queryPanel"), epicResult, state);
    });
});
