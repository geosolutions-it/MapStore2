/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import { createSelector } from 'reselect';
import { registerCustomSaveHandler } from './mapsave';

export const playbackSettingsSelector = state => state && state.playback && state.playback.settings;
export const frameDurationSelector = state => ((playbackSettingsSelector(state) || {}).frameDuration || 5); // seconds
export const statusSelector = state => state && state.playback && state.playback.status;
export const framesSelector = state => state && state.playback && state.playback.frames;
export const lastFrameSelector = state => {
    const frames = framesSelector(state) || [];
    return frames[frames.length - 1];
};
export const loadingSelector = state => state && state.playback && state.playback.framesLoading;

export const currentFrameSelector = state => state && state.playback && state.playback.currentFrame;
export const range = state => state && state.playback && state.playback.playbackRange;
export const playbackRangeSelector = state => {
    return range(state);
};

export const currentFrameValueSelector = state => (framesSelector(state) || [])[currentFrameSelector(state)];

export const playbackMetadataSelector = state => state && state.playback && state.playback.metadata;

export const hasPrevNextAnimationSteps = createSelector(
    framesSelector,
    currentFrameSelector,
    (frames = [], index) => ({
        hasNext: frames[index + 1],
        hasPrevious: frames[index - 1]
    })
);

export const playbackSelector = state => state.playback;

registerCustomSaveHandler('playback', playbackSelector);
