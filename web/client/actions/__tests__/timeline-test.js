/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {
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
    setMapSync,
    setTimelineSnapType,
    setEndValuesSupport,
    SET_SNAP_TYPE,
    INIT_TIMELINE,
    initTimeline,
    SELECT_LAYER,
    selectLayer,
    INIT_SELECT_LAYER,
    initializeSelectLayer,
    SET_END_VALUES_SUPPORT,
    setSnapRadioButtonEnabled,
    SET_SNAP_RADIO_BUTTON_ENABLED,
    initializeRange,
    SET_RANGE_INIT,
    setTimeLayers,
    SET_TIME_LAYERS,
    updateTimeLayersSetting,
    UPDATE_TIME_LAYERS_SETTINGS
} from '../timeline';

describe('timeline actions', () => {
    it('selectLayer', () => {
        const retVal = selectLayer();
        expect(retVal).toExist();
        expect(retVal.type).toBe(SELECT_LAYER);
    });
    it('initializeSelectLayer', () => {
        const retVal = initializeSelectLayer();
        expect(retVal).toExist();
        expect(retVal.type).toBe(INIT_SELECT_LAYER);
    });
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
    it('setTimelineSnapType', () => {
        const retval = setTimelineSnapType("start");
        expect(retval).toExist();
        expect(retval.type).toBe(SET_SNAP_TYPE);
        expect(retval.snapType).toBe("start");
    });
    it('setEndValuesSupport', () => {
        const retval = setEndValuesSupport(true);
        expect(retval).toExist();
        expect(retval.type).toBe(SET_END_VALUES_SUPPORT);
        expect(retval.endValuesSupport).toBe(true);
    });
    it('initTimeline', () => {
        const retval = initTimeline({showHiddenLayers: true, expandLimit: 20, snapType: "end"});
        expect(retval).toBeTruthy();
        expect(retval.type).toBe(INIT_TIMELINE);
        expect(retval.config).toBeTruthy();
        const config = retval.config;
        expect(config.showHiddenLayers).toBe(true);
        expect(config.expandLimit).toBe(20);
        expect(config.snapType).toBe("end");
    });
    it('setSnapRadioButtonEnabled', () => {
        const retval = setSnapRadioButtonEnabled(true);
        expect(retval).toExist();
        expect(retval.type).toBe(SET_SNAP_RADIO_BUTTON_ENABLED);
        expect(retval.snapRadioButtonEnabled).toBe(true);
    });
    it('initializeRange', () => {
        const retval = initializeRange("now");
        expect(retval).toExist();
        expect(retval.type).toBe(SET_RANGE_INIT);
        expect(retval.value).toBe("now");
    });
    it('setTimeLayers', () => {
        const layers = [{
            id: "TEST", title: "Test1", checked: true
        }];
        const retval = setTimeLayers(layers);
        expect(retval).toExist();
        expect(retval.type).toBe(SET_TIME_LAYERS);
        expect(retval.layers).toBe(layers);
    });
    it('updateTimeLayersSetting', () => {
        const retval = updateTimeLayersSetting("TEST", true);
        expect(retval).toExist();
        expect(retval.type).toBe(UPDATE_TIME_LAYERS_SETTINGS);
        expect(retval.id).toBe("TEST");
        expect(retval.checked).toBe(true);
    });
});
