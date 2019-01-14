/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const { createSelector} = require('reselect');

const playbackSettingsSelector = state => state && state.playback && state.playback.settings;
const frameDurationSelector = state => ((playbackSettingsSelector(state) || {}).frameDuration || 5); // seconds
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
    return range(state);
};

const currentFrameValueSelector = state => (framesSelector(state) || [])[currentFrameSelector(state)];

const playbackMetadataSelector = state => state && state.playback && state.playback.metadata;

const hasPrevNextAnimationSteps = createSelector(
    framesSelector,
    currentFrameSelector,
    (frames = [], index) => ({
        hasNext: frames[index + 1],
        hasPrevious: frames[index - 1]
    })
);

module.exports = {
    playbackSettingsSelector,
    frameDurationSelector,
    statusSelector,
    loadingSelector,
    lastFrameSelector,
    framesSelector,
    currentFrameSelector,
    currentFrameValueSelector,
    playbackRangeSelector,
    playbackMetadataSelector,
    hasPrevNextAnimationSteps
};
