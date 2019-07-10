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
    timeDataLoading,
    ENABLE_OFFSET,
    enableOffset,
    SET_COLLAPSED,
    setCollapsed,
    SET_MAP_SYNC,
    setMapSync
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
    it('enableOffset', () => {
        const retval = enableOffset(true);
        expect(retval).toExist();
        expect(retval.type).toBe(ENABLE_OFFSET);
        expect(retval.enabled).toBe(true);
    });
    it('setCollapsed', () => {
        const retval = setCollapsed(true);
        expect(retval).toExist();
        expect(retval.type).toBe(SET_COLLAPSED);
        expect(retval.collapsed).toBe(true);
    });
    it('setMapSync', () => {
        const retval = setMapSync(true);
        expect(retval).toExist();
        expect(retval.type).toBe(SET_MAP_SYNC);
        expect(retval.mapSync).toBe(true);
    });
});
