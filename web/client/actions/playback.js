/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const PLAY = "PLAYBACK:START";
export const PAUSE = "PLAYBACK:PAUSE";
export const STOP = "PLAYBACK:STOP";

export const SET_FRAMES = "PLAYBACK:SET_FRAMES";
export const APPEND_FRAMES = "PLAYBACK:APPEND_FRAMES";
export const FRAMES_LOADING = "PLAYBACK:FRAMES_LOADING";
export const SET_CURRENT_FRAME = "PLAYBACK:SET_CURRENT_FRAME";
export const SELECT_PLAYBACK_RANGE = "PLAYBACK:SELECT_PLAYBACK_RANGE";
export const SET_INTERVAL_DATA = "PLAYBACK:SET_INTERVAL_DATA";

export const CHANGE_SETTING = "PLAYBACK:SETTINGS_CHANGE";
export const TOGGLE_ANIMATION_MODE = "PLAYBACK:TOGGLE_ANIMATION_MODE";
export const ANIMATION_STEP_MOVE = "PLAYBACK:ANIMATION_STEP_MOVE";
export const UPDATE_METADATA = "PLAYBACK:UPDATE_METADATA";

export const STATUS = {
    PLAY: "PLAY",
    STOP: "STOP",
    PAUSE: "PAUSE"
};

export const play = () => ({ type: PLAY});
export const pause = () => ({ type: PAUSE });
export const stop = () => ({ type: STOP });

/**
 * Starts the animation adding animation frames to the frames buffer
 * @param {string[]} frames Array of dates in ISO format
 */
export const setFrames = (frames) => ({ type: SET_FRAMES, frames});

/**
 * Set current animation frame as n-th element of the frames buffer, where n is the `frame` argument passed.
 * @param {integer} frame index of the frame
 */
export const setCurrentFrame = frame => ({ type: SET_CURRENT_FRAME, frame});

/**
 * Appends animation frames to the animation frame buffer.
 * @param {string[]} frames Array of dates in ISO format
 */
export const appendFrames = (frames) => ({ type: APPEND_FRAMES, frames});
export const framesLoading = loading => ({ type: FRAMES_LOADING, loading});

/**
 * Configures current playback range
 * @param {object} range playback range it must have this form ( or `undefined` to unset)
 * ```
 * {
 *  startPlaybackRange: ISO9601String
 *  endPlaybackRange: ISO9601String
 * }
 * ```
 */
export const selectPlaybackRange = range => ({ type: SELECT_PLAYBACK_RANGE, range});
export const changeSetting = (name, value) => ({type: CHANGE_SETTING, name, value });
export const toggleAnimationMode = () => ({type: TOGGLE_ANIMATION_MODE});

/**
 * Move the cursor one step forward or backward, depending on direction.
 * @param {string} direction `"asc"` or `"desc"`
 */
export const animationStepMove = (direction) => ({
    type: ANIMATION_STEP_MOVE,
    direction
});

export const updateMetadata = ({next, previous, forTime}) => ({
    type: UPDATE_METADATA,
    forTime,
    next,
    previous
});

export const setIntervalData = (timeIntervalData) => ({
    type: SET_INTERVAL_DATA,
    timeIntervalData
});
