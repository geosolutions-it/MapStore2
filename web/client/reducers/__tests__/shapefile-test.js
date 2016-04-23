/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');

const shapefile = require('../shapefile');
const {
    ON_SHAPE_CHOOSEN,
    ON_SHAPE_ERROR,
    SHAPE_LOADING
} = require('../../actions/shapefile');

describe('Test the shapefile reducer', () => {
    it('shepefile defaults', () => {
        const state = shapefile(undefined, {
            type: ''
        });
        expect(state.files).toBe(null);
        expect(state.error).toBe(null);
        expect(state.loading).toBe(false);

    });
    it('shepefile choosen', () => {
        const state = shapefile(undefined, {
            type: ON_SHAPE_CHOOSEN,
            files: 'test'
        });
        expect(state.files).toBe('test');
    });

    it('shepefile error', () => {
        const state = shapefile(undefined, {
            type: ON_SHAPE_ERROR,
            message: 'error'
        });
        expect(state.error).toBe('error');
    });

    it('shepefile loading', () => {
        const state = shapefile(undefined, {
            type: SHAPE_LOADING,
            status: true
        });
        expect(state.loading).toBe(true);
    });
});
