/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const SELECT_TIME = "TIMELINE:SELECT_TIME";
/**
 * Action creator for click event on timeline.
 * @memberof actions.timeline
 * @param {string} time current selected time (ISO8601)
 * @param {string} group the group of the selected time (typically the layer name)
 * @param {string} what clicked element. Can be 'timeline' or others
 * @param {object} item the effective clicked item, if any
 * @return object of type `TIMELINE:SELECT_TIME` with `time` group` `what` `item`
 */
export const selectTime = (time, group, what, item) => ({ type: SELECT_TIME, time, group, what, item});
export const RANGE_CHANGED = "TIMELINE:RANGE_CHANGE";

/**
 * Action creator for time range change event
 * @memberof actions.timeline
 * @param {object} param0 start/end object
 * @return action of type `RANGE_CHANGED` with start and end.
 */
export const onRangeChanged = ({start, end} = {}) => ({type: RANGE_CHANGED, start, end});
export const RANGE_DATA_LOADED = "TIMELINE:RANGE_DATA_LOADED";

/**
 * Action creator for time line's range data load event
 * @memberof actions.timeline
 * @param {string} layerId the layer Id
 * @param {object} range start/end object
 * @param {object} histogram an object that represents the histogram
 * @param {object} domain an object that represents domain
 */
export const rangeDataLoaded = (layerId, range, histogram, domain) => ({ type: RANGE_DATA_LOADED, layerId, range, histogram, domain});

export const LOADING = "TIMELINE:LOADING";

/**
 * Action creator to trigger loading flag for a layer time data
 * @memberof actions.timeline
 * @param {string} layerId id of the layer that is loading
 * @param {boolean} loading loading flag
 */
export const timeDataLoading = (layerId, loading) => ({ type: LOADING, layerId, loading});


export const SELECT_LAYER = "TIMELINE:SELECT_LAYER";
/**
 * Triggered when a layer is selected from the timeline
 * @param {string} layerId the id of the selected layer
 */
export const selectLayer = layerId => ({ type: SELECT_LAYER, layerId});

export const ENABLE_OFFSET = "TIMELINE:ENABLE_OFFSET";
/**
 * Toggles ranged(offset) vs single time mode
 * @param {boolean} enabled if true, enables ranged mode
 */
export const enableOffset = enabled => ({ type: ENABLE_OFFSET, enabled});

export const AUTOSELECT = "TIMELINE:AUTOSELECT";
/**
 * Triggers autoselect setup behaviour
 */
export const autoselect = () => ({ type: AUTOSELECT });

export const SET_COLLAPSED = "TIMELINE:SET_COLLAPSED";
export const setCollapsed = collapsed => ({ type: SET_COLLAPSED, collapsed});
export const SET_MAP_SYNC = 'TIMELINE:SET_MAP_SYNC';
export const setMapSync = mapSync => ({type: SET_MAP_SYNC, mapSync});

export const INIT_TIMELINE = "TIMELINE:INIT_TIMELINE";
export const initTimeline = (showHiddenLayers) => ({type: INIT_TIMELINE, showHiddenLayers});
/**
 * Actions for timeline
 * @module actions.timeline
 */
