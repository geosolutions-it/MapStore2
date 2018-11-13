/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const { selectedLayerSelector } = require('../selectors/timeline');
const { layerDimensionRangeSelector } = require('../selectors/dimension');

const playbackSettingsSelector = state => state && state.playback && state.playback.settings;
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
    const layerID = selectedLayerSelector(state);
    const dataRange = layerDimensionRangeSelector(state, layerID);
    return range(state) || dataRange && { startPlaybackTime: dataRange.start, endPlaybackTime: dataRange.end };
};

const currentFrameValueSelector = state => (framesSelector(state) || [])[currentFrameSelector(state)];
module.exports = {
    playbackSettingsSelector,
    statusSelector,
    loadingSelector,
    lastFrameSelector,
    framesSelector,
    currentFrameSelector,
    currentFrameValueSelector,
    playbackRangeSelector
};
