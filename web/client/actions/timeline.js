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

export const INIT_SELECT_LAYER = "TIMELINE:INIT_SELECT_LAYER";

export const initializeSelectLayer = layerId => { return {type: INIT_SELECT_LAYER, layerId}; };

export const SELECT_LAYER = "TIMELINE:SELECT_LAYER";
/**
 * Triggered when a layer is selected from the timeline
 * @param {string} layerId the id of the selected layer
 */
export const selectLayer = layerId => { return {type: SELECT_LAYER, layerId}; };

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

export const SET_SNAP_TYPE = "TIMELINE:SET_SNAP_TYPE";
/**
 * Set snap to type (start, end) for dimensions with interval values
 * @param {string} snapType "start" or "end" where in time the interval snapping should happen
 */
export const setTimelineSnapType = snapType => ({type: SET_SNAP_TYPE, snapType});

export const SET_END_VALUES_SUPPORT = "TIMELINE:SET_END_VALUES_SUPPORT";
/**
 * Set the state of the end values support, if snap to end interval is supported by the backend
 * @param {Boolean} endValuesSupport true false or undefined, if end values support is supported or initial state undefined
 */
export const setEndValuesSupport = endValuesSupport =>  ({type: SET_END_VALUES_SUPPORT, endValuesSupport});

export const SET_COLLAPSED = "TIMELINE:SET_COLLAPSED";
export const setCollapsed = collapsed => ({ type: SET_COLLAPSED, collapsed});
export const SET_MAP_SYNC = 'TIMELINE:SET_MAP_SYNC';
export const setMapSync = mapSync => ({type: SET_MAP_SYNC, mapSync});

export const INIT_TIMELINE = "TIMELINE:INIT_TIMELINE";
/**
 * Action that is called upon Timeline plugin initialization,
 * the action sets up the component plugin with the default settings values
 * @param {Boolean} showHiddenLayers default false switch to show/hide layers on the timeline even if not visible on the TOC
 * @param {Number} expandLimit default 20 the number of occurences (instants or start/end points)
 * after which the visualisation of such time occurrences changes from histogram to points/bars and viceversa
 * @param {String} snapType default "start" where in time the interval snapping should happen (start or end)
 * @param {Boolean} endValuesSupport default undefined if time line plugin supports or not interval end snapping
 */
export const initTimeline = (showHiddenLayers, expandLimit, snapType, endValuesSupport) => ({type: INIT_TIMELINE, showHiddenLayers, expandLimit, snapType, endValuesSupport});
/**
 * Actions for timeline
 * @module actions.timeline
 */
