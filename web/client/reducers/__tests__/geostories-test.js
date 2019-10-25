/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');

var geostories = require('../geostories');
const {
    setGeostoriesAvailable,
    geostoriesListLoaded,
    geostoriesLoading
} = require('../../actions/geostories');


describe('Test the geostories reducer', () => {
    it('geostories setGeostoriesAvailable', () => {
        const action = setGeostoriesAvailable(true);
        const state = geostories( undefined, action);
        expect(state).toExist();
        expect(state.available).toBe(true);
    });
    it('geostories geostoriesListLoaded', () => {
        const action = geostoriesListLoaded({
            results: ""
        }, {
            searchText: "TEST"
        });
        const state = geostories( undefined, action);
        expect(state).toExist();
        expect(state.results.length).toBe(0);
        expect(state.searchText).toBe("TEST");
    });
    it('geostories geostoriesLoading', () => {
        const action = geostoriesLoading(true);
        const state = geostories( undefined, action);
        expect(state).toExist();
        expect(state.loading).toBe(true);
    });
    it('geostories geostoriesLoading save', () => {
        const action = geostoriesLoading(true, "saving");
        const state = geostories(undefined, action);
        expect(state).toExist();
        expect(state.loading).toBe(true);
        expect(state.loadFlags.saving).toBe(true);
    });
});
