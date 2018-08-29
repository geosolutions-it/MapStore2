/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
const {
    RANGE_CHANGED,
    onRangeChanged,
    SELECT_TIME,
    selectTime,
    RANGE_DATA_LOADED,
    rangeDataLoaded,
    LOADING,
    timeDataLoading
 } = require('../timeline');

describe('timeline actions', () => {
    it('onRangeChanged', () => {
        const retVal = onRangeChanged();
        expect(retVal).toExist();
        expect(retVal.type).toBe(RANGE_CHANGED);
    });
    it('selectTime', () => {
        const retVal = selectTime();
        expect(retVal).toExist();
        expect(retVal.type).toBe(SELECT_TIME);
    });
    it('rangeDataLoaded', () => {
        const retVal = rangeDataLoaded();
        expect(retVal).toExist();
        expect(retVal.type).toBe(RANGE_DATA_LOADED);
    });
    it('timeDataLoading', () => {
        const retVal = timeDataLoading();
        expect(retVal).toExist();
        expect(retVal.type).toBe(LOADING);
    });
});
