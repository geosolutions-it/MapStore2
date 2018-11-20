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
    PLAY, PAUSE, STOP, STATUS, SET_FRAMES, SET_CURRENT_FRAME, TOGGLE_ANIMATION_MODE, ANIMATION_STEP_MOVE,
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

/**
 * Generates the argument to pass to the getDomainValues service.
 * @param {function} getState return the state
 * @param {object} paginationOptions additional options to send to the service. (e.g. `fromValue`)
 */
const domainArgs = (getState, paginationOptions = {}) => {
    // const timeData = timeDataSelector(getState()) || {};
    const layerName = selectedLayerName(getState());
    const layerUrl = selectedLayerUrl(getState());
    const { startPlaybackTime, endPlaybackTime } = playbackRangeSelector(getState()) || {};
    return [layerUrl, layerName, "time", {
        limit: BUFFER_SIZE, // default, can be overridden by pagination options
        time: startPlaybackTime && endPlaybackTime ? toAbsoluteInterval(startPlaybackTime, endPlaybackTime) : undefined,
        ...paginationOptions
    }];
};

/**
 * Emulates the getDomainValues when user wants to animate with fixed step (e.g. 1 hour)
 * Returns the stream that emits an array containing the animation steps.
 *
 * @param {function} getState returns the state
 * @param {objects} param1 the options to use. May contain `fromValue`
 */
const createAnimationValues = (getState, { fromValue, limit = BUFFER_SIZE, sort = "asc" } = {}) => {
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
    for (let i = 0; i < limit; i++) {
        currentTime = moment(currentTime).add(sort === "asc" ? interval : -1 * interval);
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
const filterAnimationValues = (values, getState, {fromValue, limit = BUFFER_SIZE} = {}) => {
    const playbackRange = playbackRangeSelector(getState()) || {};
    const startPlaybackTime = playbackRange.startPlaybackTime;
    const endPlaybackTime = playbackRange.endPlaybackTime;
    return Rx.Observable.of(values
        // remove times before out of playback range
        .filter(v => startPlaybackTime && endPlaybackTime ? moment(v).isSameOrAfter(startPlaybackTime) && moment(v).isSameOrBefore(endPlaybackTime) : true)
        // Remove values before fromValue
        .filter(v => fromValue ? moment(v).isAfter(fromValue) : true)
        // limit size to BUFFER_SIZE
        .slice(0, limit));
};

/**
 * Returns an observable that emit an array of time frames, based of the current configuration:
 *  - If configured as fixed steps, it returns the list of next animation frame calculating them
 *  - If there is a selected layer and there is the Multidim extension, then use it (in favour of static values configured)
 *  - If there are values in the dimension configuration, and the Multidim extension is not present, use them to animate
 */
const getAnimationFrames = (getState, options) => {
    if (selectedLayerName(getState())) {
        const values = layerTimeSequenceSelectorCreator(selectedLayerData(getState()))(getState());
        const timeDimConfig = selectedLayerTimeDimensionConfiguration(getState());
        // check if multidim extension is available. It has priority to local values
        if (get(timeDimConfig, "source.type") !== "multidim-extension" && values && values.length > 0) {
            return filterAnimationValues(values, getState, options);
        }
        return getDomainValues(...domainArgs(getState, options))
            .map(res => res.DomainValues.Domain.split(","));
    }
    return createAnimationValues(getState, options);
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
    /**
     * When animation start, triggers the flow to retrieve the frames, buffering them:
     * The first setFrames will trigger the animation.
     * On any new animation frame, if the buffer is near to finish, this epic triggers
     * the retrieval of the next frames, until the animation ends.
     */
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
    /**
     * When the new animation frame is triggered, changes the current time, if the next frame is available. Otherwise stops.
     * NOTE: we don't have a count of next animation steps, so we suppose that the selector has already pre-loaded next animation steps.
     */
    updateCurrentTimeFromAnimation: (action$, { getState = () => { } } = {}) =>
        action$.ofType(SET_CURRENT_FRAME)
            .map(() => currentFrameValueSelector(getState()))
            .map(t => t ? moveTime(t) : stop()),
    /**
     * When a new frame sequence is set, the animation starts.
     */
    timeDimensionPlayback: (action$, { getState = () => { } } = {}) =>
        action$.ofType(SET_FRAMES)
            .exhaustMap(() =>
                Rx.Observable.interval(frameDurationSelector(getState()) * 1000)
                    .startWith(0) // start immediately
                    .let(pausable(
                        action$
                            .ofType(PLAY, PAUSE)
                            .map(a => a.type === PLAY)
                    ))
                    // pause is with loss, so the count of timer is not correct.
                    // the following scan emit a for every event emitted effectively, with correct count
                    // TODO: in case of loop, we can reset to 0 on load end.
                    .map(() => setCurrentFrame(currentFrameSelector(getState()) + 1))
                    .merge( action$.ofType(ANIMATION_STEP_MOVE)
                        .map(({direction}) =>
                            setCurrentFrame(
                                Math.max(0, currentFrameSelector(getState()) + direction)))
                    )
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
     * Allow to move time 1 single step. TODO: evaluate to move this in timeline controls
     */
    playbackMoveStep: (action$, { getState = () => { } } = {}) =>
        action$
            .ofType(ANIMATION_STEP_MOVE)
            .filter(() => statusSelector(getState()) !== STATUS.PLAY) // if is playing, the animation manages this event
            .switchMap(({ direction = 1 }) =>
                getAnimationFrames(getState, {limit: 1, sort: direction > 0 ? "asc" : "desc", fromValue: currentTimeSelector(getState()) })
                    .map(([t] = []) => t)
                    .filter(t => !!t)
                    .map(t => moveTime(t))
        ),
    /**
     * During animation, on every current time change event, if the current time is out of the current range window, the timeline will shift to
     * current start-end values
     */
    playbackFollowCursor: (action$, { getState = () => { } } = {}) =>
        action$
            .ofType(SET_CURRENT_TIME, MOVE_TIME, SET_OFFSET_TIME)
            .filter(() => statusSelector(getState()) === STATUS.PLAY && isOutOfRange(currentTimeSelector(getState()), rangeSelector(getState())))
            .filter(() => get(playbackSettingsSelector(getState()), "following") )
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
