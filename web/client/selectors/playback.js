/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {get} = require('lodash');
const statusSelector = state => get(state, 'playback.status');
const framesSelector = state => get(state, 'playback.frames');
const lastFrameSelector = state => {
    const frames = framesSelector(state) || [];
    return frames[frames.length - 1];
};
const loadingSelector = state => get(state, 'playback.framesLoading');

const currentFrameSelector = state => get(state, 'playback.currentFrame');
const currentFrameValueSelector = state => (framesSelector(state) || [])[currentFrameSelector(state)];
module.exports = {
    statusSelector,
    loadingSelector,
    lastFrameSelector,
    framesSelector,
    currentFrameSelector,
    currentFrameValueSelector
};
