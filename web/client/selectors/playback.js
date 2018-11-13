/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const { selectedLayerSelector } = require('../selectors/timeline');
const {layerDimensionDataSelectorCreator} = require('../selectors/dimension');

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
    const layerID = selectedLayerSelector(state);
    const timeRange = layerDimensionDataSelectorCreator(layerID, "time")(state);
    const dataRange = timeRange && timeRange.domain && timeRange.domain.split('--');
    return range(state) || dataRange && {
        startPlaybackTime: dataRange[0],
        endPlaybackTime: dataRange[1]
    };
};
const currentFrameValueSelector = state => (framesSelector(state) || [])[currentFrameSelector(state)];
module.exports = {
    playbackSettingsSelector,
    frameDurationSelector,
    statusSelector,
    loadingSelector,
    lastFrameSelector,
    framesSelector,
    currentFrameSelector,
    currentFrameValueSelector,
    playbackRangeSelector
};
