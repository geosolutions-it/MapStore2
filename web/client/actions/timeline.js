/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const SELECT_TIME = "TIMELINE:SELECT_TIME";
/**
 * Action creator for click event on timeline.
 * @memberof actions.timeline
 * @param {Date} time current selected time
 * @param {string} group the group of the selected time (tipically the layer name)
 * @param {string} what clicked element. Can be 'timeline' or others
 * @param {object} item the effective clicked item, if any
 * @return object of type `TIMELINE:SELECT_TIME` with `time` group` `what` `item`
 */
const selectTime = (time, group, what, item) => ({ type: SELECT_TIME, time, group, what, item});
const RANGE_CHANGED = "TIMELINE:RANGE_CHANGE";

/**
 * Action creator for time range change event
 * @memberof actions.timeline
 * @param {object} param0 start/end object
 * @return action of type `RANGE_CHANGED` with start and end.
 */
const onRangeChanged = ({start, end} = {}) => ({type: RANGE_CHANGED, start, end});
const RANGE_DATA_LOADED = "TIMELINE:RANGE_DATA_LOADED";

/**
 * Action creator for time line's range data load event
 * @memberof actions.timeline
 * @param {string} layerId the layer Id
 * @param {object} range start/end object
 * @param {object} histogram an object that represents the histogram
 * @param {object} domain an object that represents domain
 */
const rangeDataLoaded = (layerId, range, histogram, domain) => ({ type: RANGE_DATA_LOADED, layerId, range, histogram, domain});

const LOADING = "TIMELINE:LOADING";

/**
 * Action creator to trigger loading flag for a layer time data
 * @memberof actions.timeline
 * @param {string} layerId id of the layer that is loading
 * @param {boolean} loading loading flag
 */
const timeDataLoading = (layerId, loading) => ({ type: LOADING, layerId, loading});
module.exports = {
    RANGE_CHANGED,
    onRangeChanged,
    SELECT_TIME,
    selectTime,
    RANGE_DATA_LOADED,
    rangeDataLoaded,
    LOADING,
    timeDataLoading
};
