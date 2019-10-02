/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { withHandlers} = require('recompose');
const {trim} = require('lodash');
const moment = require('moment');

const isValidOffset = (start, end) => moment(end).diff(start) > 0;
const { getStartEnd } = require('../../../utils/TimeUtils');


/**
 * Enhancer for timeline. Handles click events to correctly manage dragging
 * when timeline contains the data range.
 * It also disables auto-move on click, when range is enabled.
 *
 */
module.exports = withHandlers({
    /**
     * manages click on group label or on timeline (to select current time with one click)
     *
     */
    clickHandler: ({
        selectedLayer,
        offsetEnabled,
        status,
        setCurrentTime = () => { },
        selectGroup = () => { }
    }) => ({ time, group, what, event } = {}) => {
        if (status === "PLAY") {
            return;
        }
        switch (what) {
        // case "axis":
        case "group-label": {
            if (group && status !== "PLAY") selectGroup(group);
            break;
        }
        default: {
            const target = event && event.target && event.target.closest('.vis-custom-time');
            const className = target && target.getAttribute('class');
            const timeId = className && trim(className.replace('vis-custom-time', ''));
            if (time && !offsetEnabled && timeId !== "startPlaybackTime" && timeId !== "endPlaybackTime") {
                setCurrentTime(time.toISOString(), selectedLayer);
            }
            break;
        }
        }
    },
    /**
     * Manages customTimes (cursors) events.
     * TODO: split the functionality for every custom time, to separate behaviors for playback and range cursors
     */
    timechangedHandler: ({
        currentTime,
        setOffset = () => { },
        setCurrentTime = () => { },
        currentTimeRange = {},
        playbackRange,
        setPlaybackRange = () => { },
        selectedLayer
    }) => ({ time, id } = {}) => {
        // playback range change
        if (id === 'startPlaybackTime' || id === 'endPlaybackTime') {
            const range = { ...playbackRange, [id]: time.toISOString() };
            let { start, end } = getStartEnd(range.startPlaybackTime, range.endPlaybackTime);
            if (isValidOffset(start, end)) {
                setPlaybackRange({
                    startPlaybackTime: start,
                    endPlaybackTime: end
                });
            }
            return;
        }

        if (id === 'currentTime' ) {
            if (!currentTimeRange.end) {
                setCurrentTime(time.toISOString(), selectedLayer);
            } else if (isValidOffset(time, currentTimeRange.end)) {
                setCurrentTime(time.toISOString(), null);
            } else {
                // switch times
                setCurrentTime(currentTimeRange.end);
                setOffset(time.toISOString());
            }
        }

        if (id === 'offsetTime') {
            if (isValidOffset(currentTime, time)) {
                setOffset(time.toISOString());
            } else {
                // switch times
                setCurrentTime(time.toISOString());
                setOffset(currentTime);
            }
        }
    }
});
