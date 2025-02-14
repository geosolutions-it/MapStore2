/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const SELECT_TIME = "TIMELINE:SELECT_TIME";
export const RANGE_CHANGED = "TIMELINE:RANGE_CHANGE";
export const RANGE_DATA_LOADED = "TIMELINE:RANGE_DATA_LOADED";
export const LOADING = "TIMELINE:LOADING";
export const INIT_SELECT_LAYER = "TIMELINE:INIT_SELECT_LAYER";
export const SELECT_LAYER = "TIMELINE:SELECT_LAYER";
export const ENABLE_OFFSET = "TIMELINE:ENABLE_OFFSET";
export const AUTOSELECT = "TIMELINE:AUTOSELECT";
export const SET_SNAP_TYPE = "TIMELINE:SET_SNAP_TYPE";
export const SET_END_VALUES_SUPPORT = "TIMELINE:SET_END_VALUES_SUPPORT";
export const SET_COLLAPSED = "TIMELINE:SET_COLLAPSED";
export const SET_MAP_SYNC = 'TIMELINE:SET_MAP_SYNC';
export const INIT_TIMELINE = "TIMELINE:INIT_TIMELINE";
export const RESET_TIMELINE = "TIMELINE:RESET_TIMELINE";
export const SET_RANGE_INIT = "TIMELINE:SET_RANGE_INIT";
export const SET_SNAP_RADIO_BUTTON_ENABLED = "TIMELINE:SNAP_RADIO_BUTTON_ENABLED";
export const SET_TIME_LAYERS = "TIMELINE:SET_LAYERS";
export const UPDATE_TIME_LAYERS_SETTINGS = "TIMELINE:UPDATE_LAYERS_SETTINGS";

/**
 * Action creator for click event on timeline.
 * @memberof actions.timeline
 * @param {string} time current selected time (ISO8601)
 * @param {string} group the group of the selected time (typically the layer name)
 * @param {string} [what] clicked element. Can be 'timeline' or others
 * @param {object} [item] the effective clicked item, if any
 * @return {object} object of type `TIMELINE:SELECT_TIME` with `time` group` `what` `item`
 */
export const selectTime = (time, group, what, item) => ({ type: SELECT_TIME, time, group, what, item});

/**
 * Action creator for time range change event
 * @memberof actions.timeline
 * @param {object} param0 start/end object
 * @return {object} action of type `RANGE_CHANGED` with start and end.
 */
export const onRangeChanged = ({start, end} = {}) => ({type: RANGE_CHANGED, start, end});

/**
 * Action creator for time line's range data load event
 * @memberof actions.timeline
 * @param {string} layerId the layer Id
 * @param {object} range start/end object
 * @param {object} histogram an object that represents the histogram
 * @param {object} domain an object that represents domain
 */
export const rangeDataLoaded = (layerId, range, histogram, domain) => ({ type: RANGE_DATA_LOADED, layerId, range, histogram, domain});

/**
 * Action creator to trigger loading flag for a layer time data
 * @memberof actions.timeline
 * @param {string} layerId id of the layer that is loading
 * @param {boolean} loading loading flag
 */
export const timeDataLoading = (layerId, loading) => ({ type: LOADING, layerId, loading});

/**
 * Initialize selected layer
 * @memberof actions.timeline
 * @param {string} layerId id of the layer that is loading
 * @param {boolean} snap skip/allow to snap time
 */
export const initializeSelectLayer = (layerId, snap = true) => ({type: INIT_SELECT_LAYER, layerId, snap});

/**
 * Triggered when a layer is selected from the timeline
 * @param {string} layerId the id of the selected layer
 * @param {boolean} snap skip/allow to snap time
 */
export const selectLayer = (layerId, snap = true) => ({type: SELECT_LAYER, layerId, snap});

/**
 * Toggles ranged(offset) vs single time mode
 * @param {boolean} enabled if true, enables ranged mode
 */
export const enableOffset = enabled => ({ type: ENABLE_OFFSET, enabled});


/**
 * Triggers autoselect setup behaviour
 */
export const autoselect = () => ({ type: AUTOSELECT });

/**
 * Set snap to type (start, end) for dimensions with interval values
 * @param {string} snapType "start" or "end" where in time the interval snapping should happen
 */
export const setTimelineSnapType = snapType => ({type: SET_SNAP_TYPE, snapType});

/**
 * Set the state of the end values support, if snap to end interval is supported by the backend
 * @param {Boolean} endValuesSupport true false or undefined, if end values support is supported or initial state undefined
 */
export const setEndValuesSupport = endValuesSupport =>  ({type: SET_END_VALUES_SUPPORT, endValuesSupport});

export const setCollapsed = collapsed => ({ type: SET_COLLAPSED, collapsed});

export const setMapSync = mapSync => ({type: SET_MAP_SYNC, mapSync});

/**
 * Action that is called upon Timeline plugin initialization,
 * the action sets up the component plugin with the default settings values
 * @param {Boolean} config.showHiddenLayers default false switch to show/hide layers on the timeline even if not visible on the TOC
 * @param {Number} config.expandLimit default 20 the number of occurences (instants or start/end points)
 * after which the visualisation of such time occurrences changes from histogram to points/bars and viceversa
 * @param {String} config.snapType default "start" where in time the interval snapping should happen (start or end)
 * @param {Boolean} config.endValuesSupport default undefined if timeline plugin supports or not interval end snapping
 * @param {String} config.initialMode initial mode of the timeline. One of 'single|range'
 * @param {String} config.initialSnap intial snap type of timeline. One of 'now|fullRange'
 */
export const initTimeline = (config) => ({type: INIT_TIMELINE, config});

/**
 * Toggle reset timeline action
 */
export const resetTimeline = () => ({type: RESET_TIMELINE});

/**
 * Initialize the range to be applied on timeline for the layer
 * @param value type of range `now|fullRange`
 */
export const initializeRange = (value) => ({type: SET_RANGE_INIT, value});

/**
 * Set snap radio button state
 * @param {boolean} snapRadioButtonEnabled
 */
export const setSnapRadioButtonEnabled = (snapRadioButtonEnabled) => ({type: SET_SNAP_RADIO_BUTTON_ENABLED, snapRadioButtonEnabled});

/**
 * Set time layers with settings data
 * @param {object[]} layers with settings data
 */
export const setTimeLayers = (layers) => ({ type: SET_TIME_LAYERS, layers});

/**
 * Update time layer setting
 * @param {string} layer to be updated
 * @param {boolean} checked status of the layer in timeline setting
 */
export const updateTimeLayersSetting = (layer, checked) => ({ type: UPDATE_TIME_LAYERS_SETTINGS, id: layer, checked});
