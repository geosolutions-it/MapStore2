/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import contextmanager from '../contextmanager';
import {
    searchTextChanged,
    contextsListLoaded,
    contextsLoading
} from '../../actions/contextmanager';


describe('contextmanager reducer', () => {
    it('searchTextChanged', () => {
        const action = searchTextChanged('searchtext');
        const state = contextmanager(undefined, action);
        expect(state).toExist();
        expect(state.searchText).toBe('searchtext');
    });
    it('contextsListLoaded', () => {
        const action = contextsListLoaded({
            results: ""
        }, "TEST");
        const state = contextmanager(undefined, action);
        expect(state).toExist();
        expect(state.results.length).toBe(0);
        expect(state.searchText).toBe("TEST");
    });
    it('contextsLoading', () => {
        const action = contextsLoading(true);
        const state = contextmanager(undefined, action);
        expect(state).toExist();
        expect(state.loading).toBe(true);
    });
    it('contextsLoading save', () => {
        const action = contextsLoading(true, "saving");
        const state = contextmanager(undefined, action);
        expect(state).toExist();
        expect(state.loading).toBe(true);
        expect(state.loadFlags.saving).toBe(true);
    });
});
