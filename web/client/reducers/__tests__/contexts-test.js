/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import contexts from '../contexts';
import {
    setContextsAvailable,
    contextsListLoaded,
    contextsLoading
} from '../../actions/contexts';


describe('contexts reducer', () => {
    it('setContextsAvailable', () => {
        const action = setContextsAvailable(true);
        const state = contexts(undefined, action);
        expect(state).toExist();
        expect(state.available).toBe(true);
    });
    it('contextsListLoaded', () => {
        const action = contextsListLoaded({
            results: ""
        }, {
            searchText: "TEST"
        });
        const state = contexts(undefined, action);
        expect(state).toExist();
        expect(state.results.length).toBe(0);
        expect(state.searchText).toBe("TEST");
    });
    it('contextsLoading', () => {
        const action = contextsLoading(true);
        const state = contexts(undefined, action);
        expect(state).toExist();
        expect(state.loading).toBe(true);
    });
    it('contextsLoading save', () => {
        const action = contextsLoading(true, "saving");
        const state = contexts(undefined, action);
        expect(state).toExist();
        expect(state.loading).toBe(true);
        expect(state.loadFlags.saving).toBe(true);
    });
});
