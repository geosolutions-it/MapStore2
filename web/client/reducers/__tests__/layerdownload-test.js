/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
    onDownloadOptionChange,
    downloadFeatures,
    onDownloadFinished,
    onFormatOptionsFetch,
    updateFormats
} from '../../actions/layerdownload';

import layerdownload from '../layerdownload';
import expect from 'expect';

describe('Test the layerdownload reducer', () => {
    it('downloadFeatures', () => {
        const state = layerdownload({}, downloadFeatures());
        expect(state.loading).toBe(true);
    });
    it('onDownloadOptionChange', () => {
        const state = layerdownload({}, onDownloadOptionChange("selectedFormat", "csv"));
        expect(state.downloadOptions).toExist();
        expect(state.downloadOptions.selectedFormat).toBe("csv");
    });
    it('onDownloadFinished', () => {
        const state = layerdownload({loading: true}, onDownloadFinished());
        expect(state.loading).toBe(false);
    });
    it('onFormatOptionsFetch', () => {
        const state = layerdownload({formatsLoading: false, wfsFormats: [{name: "CSV", label: "CSV"}, {name: "SHAPE-FILE", label: "SHAPE-FILE"}]}, onFormatOptionsFetch());
        expect(state.formatsLoading).toBe(true);
        expect(state.wfsFormats).toEqual([]);
    });
    it('updateFormats', () => {
        const state = layerdownload({formatsLoading: true}, updateFormats());
        expect(state.formatsLoading).toBe(false);
    });

});
