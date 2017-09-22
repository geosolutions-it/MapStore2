/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');

const {toggleControl, TOGGLE_CONTROL} = require('../../actions/controls');

const {closeExportDownload} = require('../wfsdownload');
const {testEpic} = require('./epicTestUtils');
describe('wfsdownload Epics', () => {
    it('close export panel', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                expect(action.type).toBe(TOGGLE_CONTROL);
                expect(action.control).toBe('wfsdownload');
            });
            done();
        };

        const state = {controls: { queryPanel: {enabled: false}, wfsdownload: {enabled: true}}};
        testEpic(closeExportDownload, 1, toggleControl("queryPanel"), epicResult, state);
    });
});
