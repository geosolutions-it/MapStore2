/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const moment = require('moment');
const { get } = require('lodash');
const {
    PLAY, PAUSE, STOP, STATUS, SET_FRAMES, SET_CURRENT_FRAME, TOGGLE_ANIMATION_MODE,
    stop, setFrames, appendFrames, setCurrentFrame,
    framesLoading
} = require('../actions/playback');
const {
    moveTime, SET_CURRENT_TIME, MOVE_TIME, SET_OFFSET_TIME
} = require('../actions/dimension');
const {
    selectLayer,
    onRangeChanged
} = require('../actions/timeline');

const { changeLayerProperties } = require('../actions/layers');

const { error } = require('../actions/notifications');

const { currentTimeSelector, layersWithTimeDataSelector, layerTimeSequenceSelectorCreator } = require('../selectors/dimension');

const { LOCATION_CHANGE } = require('react-router-redux');

const { currentFrameSelector, currentFrameValueSelector, lastFrameSelector, playbackRangeSelector, playbackSettingsSelector, frameDurationSelector, statusSelector } = require('../selectors/playback');
const { selectedLayerName, selectedLayerUrl, selectedLayerData, selectedLayerTimeDimensionConfiguration, rangeSelector } = require('../selectors/timeline');

const pausable = require('../observables/pausable');
const { wrapStartStop } = require('../observables/epics');

const { getDomainValues } = require('../api/MultiDim');

const Rx = require('rxjs');

const BUFFER_SIZE = 20;
const PRELOAD_BEFORE = 10;
const toAbsoluteInterval = (start, end) => `${start}/${end}`;

const domainArgs = (getState, paginationOptions = {}) => {
    // const timeData = timeDataSelector(getState()) || {};
    const layerName = selectedLayerName(getState());
    const layerUrl = selectedLayerUrl(getState());

    return [layerUrl, layerName, "time", {
        limit: BUFFER_SIZE,
        time: toAbsoluteInterval(playbackRangeSelector(getState()).startPlaybackTime, playbackRangeSelector(getState()).endPlaybackTime),
        ...paginationOptions
    }];
};
const createAnimationValues = (getState, { fromValue } = {}) => {
    const {
        timeStep,
        stepUnit
    } = playbackSettingsSelector(getState());
    const interval = moment.duration(timeStep, stepUnit);
    const playbackRange = playbackRangeSelector(getState()) || {};
    const startPlaybackTime = playbackRange.startPlaybackTime;
    const endPlaybackTime = playbackRange.endPlaybackTime;
    let currentTime = fromValue !== undefined ? fromValue : startPlaybackTime || currentTimeSelector(getState()) || (new Date()).toString();
    const values = [];
    if (currentTime !== fromValue) {
        values.push(moment(currentTime).toISOString());
    }
    for (let i = 0; i < BUFFER_SIZE; i++) {
        currentTime = moment(currentTime).add(interval);
        if (!endPlaybackTime || currentTime.isBefore(endPlaybackTime)) {
            values.push(currentTime.toISOString());
        } else {
            break;
        }
    }
    return Rx.Observable.of(values);
};

/**
 * Gets the static list of times to animate
 */
const filterAnimationValues = (values, getState, {fromValue} = {}) => {
    const playbackRange = playbackRangeSelector(getState()) || {};
    const startPlaybackTime = playbackRange.startPlaybackTime;
    const endPlaybackTime = playbackRange.endPlaybackTime;
    return Rx.Observable.of(values
        // remove times before out of playback range
        .filter(v => startPlaybackTime && endPlaybackTime ? moment(v).isSameOrAfter(startPlaybackTime) && moment(v).isSameOrBefore(endPlaybackTime) : true)
        // Remove values before fromValue
        .filter(v => fromValue ? moment(v).isAfter(fromValue) : true)
        // limit size to BUFFER_SIZE
        .slice(0, BUFFER_SIZE));
};

/**
 * Returns an observable that emit an array of time frames, based of the current configuration:
 *  - If configured as fixed steps, it returns the list of next animation frame calculating them
 *  - If there is a selected layer and there is the Multidim extension, then use it (in favour of static values configured)
 *  - If there are values in the dimension configuration, and the Multidim extension is not present, use them to animate
 */
const getAnimationFrames = (getState, { fromValue } = {}) => {
    if (selectedLayerName(getState())) {
        const values = layerTimeSequenceSelectorCreator(selectedLayerData(getState()))(getState());
        const timeDimConfig = selectedLayerTimeDimensionConfiguration(getState());
        // check if multidim extension is available. It has priority to local values
        if (get(timeDimConfig, "source.type") !== "multidim-extension" && values && values.length > 0) {
            return filterAnimationValues(values, getState, {fromValue});
        }
        return getDomainValues(...domainArgs(getState, {
            fromValue: fromValue
        }))
            .map(res => res.DomainValues.Domain.split(","));
    }
    return createAnimationValues(getState, {
        fromValue: fromValue
    });
};

/**
 * Setup animation adding some action before and after the animationEventsStream$
 * Function returns a a function that operates on the stream (aka pipe-able aka let-table operator)
 * @param {function} getState returns the current state
 */
const setupAnimation = (getState = () => ({})) => animationEventsStream$ => {
    const layers = layersWithTimeDataSelector(getState());
    return Rx.Observable.from(
            layers.map(l => changeLayerProperties(l.id, {singleTile: true}))
        ).concat(animationEventsStream$)
        // restore original singleTile configuration
        .concat(Rx.Observable.from(
            layers.map(l => changeLayerProperties(l.id, { singleTile: l.singleTile }))
        ));
};
/**
 * Check if a time is in out of the defined range. If range start or end are not defined, returns false.
 */
const isOutOfRange = (time, { start, end } = {}) =>
    start && end && ( moment(time).isBefore(start) || moment(time).isAfter(end));


module.exports = {
    retrieveFramesForPlayback: (action$, { getState = () => { } } = {}) =>
        action$.ofType(PLAY).exhaustMap(() =>
            getAnimationFrames(getState)
                .map((frames) => setFrames(frames))
                .let(wrapStartStop(framesLoading(true), framesLoading(false)), () => Rx.Observable.of(
                    error({
                        title: "There was an error retriving animation", // TODO: localize
                        message: "Please contact the administrator" // TODO: localize
                    }),
                    stop()
                ))
                .concat(
                    action$
                        .ofType(SET_CURRENT_FRAME)
                        .filter(({ frame }) => frame % BUFFER_SIZE === ((BUFFER_SIZE - PRELOAD_BEFORE)))
                        .switchMap(() =>
                            getAnimationFrames(getState, {
                                fromValue: lastFrameSelector(getState())
                            })
                                .map(appendFrames)
                                .let(wrapStartStop(framesLoading(true), framesLoading(false)))
                        )
                )
                .takeUntil(action$.ofType(STOP, LOCATION_CHANGE))
                .let(setupAnimation(getState))
        ),
    updateCurrentTimeFromAnimation: (action$, { getState = () => { } } = {}) =>
        action$.ofType(SET_CURRENT_FRAME)
            .map(() => currentFrameValueSelector(getState()))
            .map(t => t ? moveTime(t) : stop()),
    timeDimensionPlayback: (action$, { getState = () => { } } = {}) =>
        action$.ofType(SET_FRAMES)
            .exhaustMap(() =>
                Rx.Observable.interval(frameDurationSelector(getState()) * 1000).startWith(0) // start immediately
                    .let(pausable(
                        action$
                            .ofType(PLAY, PAUSE)
                            .map(a => a.type === PLAY)
                    ))
                    // pause is with loss, so the count of timer is not correct.
                    // the following scan emit a for every event emitted effectively, with correct count
                    // TODO: in case of loop, we can reset to 0 on load end.
                    .map(() => setCurrentFrame(currentFrameSelector(getState()) + 1))
                    .concat(Rx.Observable.of(stop()))
                    .takeUntil(action$.ofType(STOP, LOCATION_CHANGE))
        ),
    /**
     * Synchronizes the fixed animation step toggle with guide layer on timeline
     */
    playbackToggleGuideLayerToFixedStep: (action$, { getState = () => { } } = {}) =>
        action$
            .ofType(TOGGLE_ANIMATION_MODE)
            .exhaustMap(() =>
                selectedLayerName(getState())
                    // need to deselect
                    ? Rx.Observable.of(selectLayer(undefined))
                    // need to select first
                    : Rx.Observable.of(
                        selectLayer(
                            get(layersWithTimeDataSelector(getState()), "[0].id")
                        )
                    )
            ),
    /**
     * During animation, on every current time change event, if the current time is out of the current range window, the timeline will shift to
     * current start-end values
     */
    playbackFollowCursor: (action$, { getState = () => { } } = {}) =>
        action$
            .ofType(SET_CURRENT_TIME, MOVE_TIME, SET_OFFSET_TIME)
            .filter(() => statusSelector(getState()) === STATUS.PLAY && isOutOfRange(currentTimeSelector(getState()), rangeSelector(getState())))
            .switchMap(() => Rx.Observable.of(
                onRangeChanged(
                    (() => {
                        const currentTime = currentTimeSelector(getState());
                        const {start, end} = rangeSelector(getState());
                        const difference = moment(end).diff(moment(start));
                        const nextEnd = moment(currentTime).add(difference).toISOString();
                        return {
                            start: currentTime,
                            end: nextEnd
                        };
                    })()
                )
            ))
};
