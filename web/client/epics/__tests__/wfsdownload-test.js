/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');

const {toggleControl, TOGGLE_CONTROL} = require('../../actions/controls');
const {download} = require('../../actions/layers');
const { DOWNLOAD_OPTIONS_CHANGE } = require('../../actions/wfsdownload');
const { QUERY_CREATE } = require('../../actions/wfsquery');
const { closeExportDownload, openDownloadTool} = require('../wfsdownload');
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
    it('downloads a layer', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(3);
            actions.map((action) => {
                switch (action.type) {
                    case TOGGLE_CONTROL:
                        expect(action.control).toBe('wfsdownload');
                        break;
                    case DOWNLOAD_OPTIONS_CHANGE:
                        expect(action.key).toBe('singlePage');
                        expect(action.value).toBe(false);
                        break;
                    case QUERY_CREATE:
                        expect(action.searchUrl).toBe('myurl');
                        expect(action.filterObj.featureTypeName).toBe('mylayer');
                        break;
                    default:
                        break;
                }
            });
            done();
        };

        const state = { controls: { wfsdownload: { enabled: false, downloadOptions: {}} } };
        testEpic(openDownloadTool, 3, download({name: 'mylayer', url: 'myurl'}), epicResult, state);
    });
});
