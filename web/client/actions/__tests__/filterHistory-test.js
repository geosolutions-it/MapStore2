/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
const {
    OPEN_QUERY_BUILDER,
    openQueryBuilder,
    INIT_FILTER_HISTORY,
    initFilterHistory,
    APPLIED_FILTER,
    storeAppliedFilter,
    STORE_CURRENT_APPLIED_FILTER,
    storeCurrentFilter,
    RESTORE_CURRENT_SAVED_FILTER,
    restoreCurrentSavedFilter,
    applyFilter,
    APPLY_FILTER
} = require('../filterHistory');


describe('Test correctness of the filterHistory actions', () => {

    it('openQueryBuilder', () => {
        var retval = openQueryBuilder();
        expect(retval).toExist();
        expect(retval.type).toBe(OPEN_QUERY_BUILDER);
    });

    it('initFilterHistory', () => {
        var retval = initFilterHistory();
        expect(retval).toExist();
        expect(retval.type).toBe(INIT_FILTER_HISTORY);
    });

    it('storeAppliedFilter', () => {
        const filter = {};
        var retval = storeAppliedFilter(filter);
        expect(retval).toExist();
        expect(retval.type).toBe(APPLIED_FILTER);
        expect(retval.filter).toBe(filter);
    });

    it('storeCurrentFilter', () => {
        var retval = storeCurrentFilter();
        expect(retval).toExist();
        expect(retval.type).toBe(STORE_CURRENT_APPLIED_FILTER);
    });

    it('restoreCurrentSavedFilter', () => {
        var retval = restoreCurrentSavedFilter();
        expect(retval).toExist();
        expect(retval.type).toBe(RESTORE_CURRENT_SAVED_FILTER);
    });

    it('applyFilter', () => {
        var retval = applyFilter();
        expect(retval).toExist();
        expect(retval.type).toBe(APPLY_FILTER);
    });

});
