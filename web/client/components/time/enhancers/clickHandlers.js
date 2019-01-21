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
const getStartEnd = (startTime, endTime) => {
    const diff = moment(startTime).diff(endTime);
    return {
        start: diff >= 0 ? endTime : startTime,
        end: diff >= 0 ? startTime : endTime
    };
};

/**
 * Enhancer for timeline. Handles click events to correctly manage dragging
 * when timeline contains the data range.
 * It also disables auto-move on click, when range is enabled.
 *
 */
module.exports = withHandlers({
    mouseDownHandler: ({
        offsetEnabled,
        status,
        setMouseData = () => { }
    }) => ({ time, event } = {}) => {
        if (status === "PLAY") {
            return;
        }
        // initialize dragging range event
        let target = event && event.target && event.target.closest('.ms-current-range');
        if (offsetEnabled && target) {
            const startEvent = {
                clientX: event.clientX,
                clientY: event.clientY
            };
            setMouseData({ dragging: true, startTime: time.toISOString(), startEvent });
        } else {
            target = event && event.target && event.target.closest('.vis-custom-time');
            const className = target && target.getAttribute('class');
            const timeId = className && trim(className.replace('vis-custom-time', ''));
            if (timeId) setMouseData({ dragging: false, borderID: timeId, startTime: time.toISOString() });
        }

    },
    mouseMoveHandler: ({ mouseEventProps = {}}) =>
    ({ event } = {}) => {
        if (mouseEventProps.dragging) {
            event.stopPropagation();
            let target = event && event.target && event.target.closest('.ms-current-range');
            if (target && mouseEventProps.startEvent && mouseEventProps.startEvent.clientX) {
                const deltaX = event.clientX - mouseEventProps.startEvent.clientX;
                target.style.transform = `translateX(${deltaX}px)`;
                target.style.zIndex = 100;
            }
        }
    },
    clickHandler: ({
        selectedLayer,
        offsetEnabled,
        status,
        setCurrentTime = () => { },
        selectGroup = () => { },
        mouseEventProps = {}
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
                if (!mouseEventProps.timeId && time && !offsetEnabled && timeId !== "startPlaybackTime" && timeId !== "endPlaybackTime") {
                    setCurrentTime(time.toISOString(), group || selectedLayer);
                }
                break;
            }
        }
    },
    mouseUpHandler: ({
        currentTime,
        status,
        setOffset = () => { },
        setCurrentTime = () => { },
        currentTimeRange = {},
        mouseEventProps = {},
        offsetEnabled,
        playbackRange,
        setTimeLineRange = () => { },
        setMouseData = () => { },
        setPlaybackRange = () => { }
    }) => ({ time, event } = {}) => {
        if (status === "PLAY") {
            return;
        }
        let target = event && event.target && event.target.closest('.vis-center');
        const border = mouseEventProps.borderID;
        // sets the playbackRange range
        if (!mouseEventProps.dragging && border === 'startPlaybackTime' || border === 'endPlaybackTime') {
            const range = { ...playbackRange, [border]: time.toISOString() };
            let { start, end } = getStartEnd(range.startPlaybackTime, range.endPlaybackTime);
            if (isValidOffset(start, end)) {
                setPlaybackRange({
                    startPlaybackTime: start,
                    endPlaybackTime: end
                });
            }
        }
        if (offsetEnabled) {
            // range dragging
            if (mouseEventProps.dragging && target) {
                const off = moment(time).diff(mouseEventProps.startTime);

                const startRangeShift = moment(currentTimeRange.start).add(off);
                const endRangeShift = moment(currentTimeRange.end).add(off);
                // no snap for range borders
                setCurrentTime(startRangeShift.toISOString(), null);
                setOffset(endRangeShift.toISOString());
                const newRange = { start: startRangeShift, end: endRangeShift };
                setTimeLineRange(newRange);

            } else {
                // changing the rang by moving currentTime or offsetTime
                if (border === 'currentTime' && isValidOffset(time, currentTimeRange.endTimeLineRange)) {
                    setCurrentTime(time.toISOString(), null);
                } else if (border === 'offsetTime' && isValidOffset(currentTime, time)) {
                    setOffset(time.toISOString());
                }
                const id = border === 'currentTime' && 'start' || border === 'offsetTime' && 'end';
                const TimeRange = { ...currentTimeRange, [id]: time.toISOString() };
                let { start, end } = getStartEnd(TimeRange.start, TimeRange.end);
                if (isValidOffset(start, end)) {
                    setTimeLineRange({
                        start: start,
                        end: end
                    });
                }
            }
            // normal click event
        }
        // resetting the mouse event data
        if (Object.keys(mouseEventProps).length > 0) setMouseData({});
    }
    /*
    timechangedHandler: ({
        currentTime,
        status,
        setOffset = () => { },
        setCurrentTime = () => { },
        currentTimeRange = {},
        mouseEventProps = {},
        offsetEnabled,
        playbackRange,
        setTimeLineRange = () => { },
        setMouseData = () => { },
        setPlaybackRange = () => { }
    }) => ({ time, event, id } = {})  => {
        console.log(args);
    }
    */
});
