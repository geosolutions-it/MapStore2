/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {
    onDownloadOptionChange, downloadFeatures, onDownloadFinished, onFormatOptionsFetch, updateFormats} = require('../../actions/wfsdownload');
const wfsdownload = require('../wfsdownload');

const expect = require('expect');

describe('Test the wfsdownload reducer', () => {
    it('downloadFeatures', () => {
        const state = wfsdownload({}, downloadFeatures());
        expect(state.loading).toBe(true);
    });
    it('onDownloadOptionChange', () => {
        const state = wfsdownload({}, onDownloadOptionChange("selectedFormat", "csv"));
        expect(state.downloadOptions).toExist();
        expect(state.downloadOptions.selectedFormat).toBe("csv");
    });
    it('onDownloadFinished', () => {
        const state = wfsdownload({loading: true}, onDownloadFinished());
        expect(state.loading).toBe(false);
    });
    it('onFormatOptionsFetch', () => {
        const state = wfsdownload({formatsLoading: false, wfsFormats: [{name: "CSV", label: "CSV"}, {name: "SHAPE-FILE", label: "SHAPE-FILE"}]}, onFormatOptionsFetch());
        expect(state.formatsLoading).toBe(true);
        expect(state.wfsFormats).toEqual([]);
    });
    it('updateFormats', () => {
        const state = wfsdownload({formatsLoading: true}, updateFormats());
        expect(state.formatsLoading).toBe(false);
    });

});
