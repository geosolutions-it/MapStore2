/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const UPDATE_LAYER_DIMENSION_DATA = "DIMENSION:UPDATE_LAYER_DIMENSION_DATA";
const SET_CURRENT_TIME = "TIME_MANAGER:SET_CURRENT_TIME";
const SET_OFFSET_TIME = "TIME_MANAGER:SET_OFFSET_TIME";

/**
 *
 * @param {object} data Sets the time data for a layer
 */
const updateLayerDimensionData = (layerId, dimension, data) => ({ type: UPDATE_LAYER_DIMENSION_DATA, dimension, layerId, data });

/**
 * Set the current time state entry
 * @param {string|date} time the current time to set
 */
const setCurrentTime = time => ({ type: SET_CURRENT_TIME, time });
const setCurrentOffset = offsetTime => ({ type: SET_OFFSET_TIME, offsetTime });


module.exports = {
    updateLayerDimensionData,
    UPDATE_LAYER_DIMENSION_DATA,
    setCurrentTime,
    SET_CURRENT_TIME,
    setCurrentOffset,
    SET_OFFSET_TIME

};
