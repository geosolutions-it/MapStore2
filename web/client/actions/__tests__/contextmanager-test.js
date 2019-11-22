/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

const {
    searchContexts, SEARCH_CONTEXTS,
    contextsLoading, LOADING,
    contextsListLoaded, CONTEXTS_LIST_LOADED,
    deleteContext, DELETE_CONTEXT,
    contextDeleted, CONTEXT_DELETED,
    reloadContexts, RELOAD_CONTEXTS
} = require('../contextmanager');

describe('contextmanager actions', () => {
    it('searchContexts', () => {
        const retval = searchContexts();
        expect(retval).toExist();
        expect(retval.type).toBe(SEARCH_CONTEXTS);
    });
    it('contextLoading', () => {
        const retval = contextsLoading(true, "test");
        expect(retval).toExist();
        expect(retval.type).toBe(LOADING);
        expect(retval.value).toBe(true);
        expect(retval.name).toBe("test");
    });
    it('contextsListLoaded', () => {
        const retval = contextsListLoaded({
            results: [{id: 1}],
            success: true,
            totalCount: 1
        }, "test", "someOptions");
        expect(retval).toExist();
        expect(retval.type).toBe(CONTEXTS_LIST_LOADED);
        expect(retval.results[0].id).toBe(1);
        expect(retval.totalCount).toBe(1);
        expect(retval.success).toBe(true);
        expect(retval.searchText).toBe("test");
        expect(retval.searchOptions).toBe("someOptions");
    });
    it('deleteContext', () => {
        const retval = deleteContext(1);
        expect(retval).toExist();
        expect(retval.type).toBe(DELETE_CONTEXT);
        expect(retval.id).toBe(1);
    });
    it('contextDeleted', () => {
        const retval = contextDeleted();
        expect(retval).toExist();
        expect(retval.type).toBe(CONTEXT_DELETED);
    });
    it('reloadContexts', () => {
        const retval = reloadContexts();
        expect(retval).toExist();
        expect(retval.type).toBe(RELOAD_CONTEXTS);
    });
});
