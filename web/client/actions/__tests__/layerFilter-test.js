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
    INIT_LAYER_FILTER,
    initLayerFilter,
    APPLIED_FILTER,
    storeAppliedFilter,
    STORE_CURRENT_APPLIED_FILTER,
    storeCurrentFilter,
    DISCARD_CURRENT_FILTER,
    discardCurrentFilter,
    applyFilter,
    APPLY_FILTER
} = require('../layerFilter');


describe('Test correctness of the layerFilter actions', () => {

    it('openQueryBuilder', () => {
        var retval = openQueryBuilder();
        expect(retval).toExist();
        expect(retval.type).toBe(OPEN_QUERY_BUILDER);
    });

    it('initLayerFilter', () => {
        var retval = initLayerFilter();
        expect(retval).toExist();
        expect(retval.type).toBe(INIT_LAYER_FILTER);
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

    it('discardCurrentFilter', () => {
        var retval = discardCurrentFilter();
        expect(retval).toExist();
        expect(retval.type).toBe(DISCARD_CURRENT_FILTER);
    });

    it('applyFilter', () => {
        var retval = applyFilter();
        expect(retval).toExist();
        expect(retval.type).toBe(APPLY_FILTER);
    });

});
