/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');
const {
    setGeostoriesAvailable, SET_GEOSTORIES_AVAILABLE,
    searchGeostories, SEARCH_GEOSTORIES,
    geostoriesLoading, LOADING,
    geostoriesListLoaded, GEOSTORIES_LIST_LOADED,
    deleteGeostory, DELETE_GEOSTORY,
    geostoryDeleted, GEOSTORY_DELETED,
    reloadGeostories, RELOAD
} = require('../geostories');
describe('geostories (browse) actions', () => {
    it('setGeostoriesAvailable', () => {
        const retval = setGeostoriesAvailable(true);
        expect(retval).toExist();
        expect(retval.type).toBe(SET_GEOSTORIES_AVAILABLE);
        expect(retval.available).toBe(true);

    });
    it('searchGeostories', () => {
        const retval = searchGeostories();
        expect(retval).toExist();
        expect(retval.type).toBe(SEARCH_GEOSTORIES);
    });
    it('geostoriesLoading', () => {
        const retval = geostoriesLoading(true, "test");
        expect(retval).toExist();
        expect(retval.type).toBe(LOADING);
        expect(retval.value).toBe(true);
        expect(retval.name).toBe("test");
    });
    it('geostoriesListLoaded', () => {
        const retval = geostoriesListLoaded({
            results: [{id: 1}],
            success: true,
            totalCount: 1
        }, {
            searchText: "test",
            options: "someOptions"
        });
        expect(retval).toExist();
        expect(retval.type).toBe(GEOSTORIES_LIST_LOADED);
        expect(retval.results[0].id).toBe(1);
        expect(retval.totalCount).toBe(1);
        expect(retval.success).toBe(true);
        expect(retval.searchText).toBe("test");
        expect(retval.options).toBe("someOptions");
    });
    it('deleteGeostory', () => {
        const retval = deleteGeostory(1);
        expect(retval).toExist();
        expect(retval.type).toBe(DELETE_GEOSTORY);
        expect(retval.id).toBe(1);
    });
    it( 'geostoryDeleted', () => {
        const retval =  geostoryDeleted();
        expect(retval).toExist();
        expect(retval.type).toBe(GEOSTORY_DELETED);
    });
    it('reloadGeostories', () => {
        const retval = reloadGeostories();
        expect(retval).toExist();
        expect(retval.type).toBe(RELOAD);
    });

});
