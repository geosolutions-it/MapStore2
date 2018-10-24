/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const { currentTimeSelector } = require('../selectors/dimension');
const moment = require('moment');

const statusSelector = state => state && state.playback && state.playback.status;
const framesSelector = state => state && state.playback && state.playback.frames;
const lastFrameSelector = state => {
    const frames = framesSelector(state) || [];
    return frames[frames.length - 1];
};
const loadingSelector = state => state && state.playback && state.playback.framesLoading;

const currentFrameSelector = state => state && state.playback && state.playback.currentFrame;
const range = state => state && state.playback && state.playback.playbackRange;
const playbackRangeSelector = state => {
    const currentFrame = currentTimeSelector(state);
    return range(state) || {
        startPlaybackTime: moment(currentFrame).subtract(6, 'month'),
        endPlaybackTime: moment(currentFrame).add(6, 'month')
    };
};
const currentFrameValueSelector = state => (framesSelector(state) || [])[currentFrameSelector(state)];
module.exports = {
    statusSelector,
    loadingSelector,
    lastFrameSelector,
    framesSelector,
    currentFrameSelector,
    currentFrameValueSelector,
    playbackRangeSelector
};
