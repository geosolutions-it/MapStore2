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
    framesLoading, updateMetadata
} = require('../actions/playback');
const {
    moveTime, SET_CURRENT_TIME, MOVE_TIME
} = require('../actions/dimension');
const {
    selectLayer,
    onRangeChanged,
    timeDataLoading,
    SELECT_LAYER,
    SET_MAP_SYNC
} = require('../actions/timeline');

const { changeLayerProperties, REMOVE_NODE } = require('../actions/layers');

const { error } = require('../actions/notifications');

const { currentTimeSelector, layersWithTimeDataSelector, layerTimeSequenceSelectorCreator } = require('../selectors/dimension');

const { LOCATION_CHANGE } = require('connected-react-router');

const { currentFrameSelector, currentFrameValueSelector, lastFrameSelector, playbackRangeSelector, playbackSettingsSelector, frameDurationSelector, statusSelector, playbackMetadataSelector } = require('../selectors/playback');

const { selectedLayerSelector, selectedLayerName, selectedLayerUrl, selectedLayerData, selectedLayerTimeDimensionConfiguration, rangeSelector, timelineLayersSelector, multidimOptionsSelectorCreator } = require('../selectors/timeline');

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
    const id = selectedLayerSelector(getState());
    const layerName = selectedLayerName(getState());
    const layerUrl = selectedLayerUrl(getState());
    const { startPlaybackTime, endPlaybackTime } = playbackRangeSelector(getState()) || {};
    const shouldFilter = statusSelector(getState()) === STATUS.PLAY || statusSelector(getState()) === STATUS.PAUSE;
    return [layerUrl, layerName, "time", {
        limit: BUFFER_SIZE, // default, can be overridden by pagination options
        time: startPlaybackTime && endPlaybackTime && shouldFilter ? toAbsoluteInterval(startPlaybackTime, endPlaybackTime) : undefined,
        ...paginationOptions
    },
    multidimOptionsSelectorCreator(id)(getState())
    ];
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
 * @param {function} getState returns the application state
 * @param {object} options the options that normally match the getDomainValues options
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
 * @param {string|Date} time the time to check
 * @param {Object} interval the interval where the time should stay `{start: ISODate|Date, end: ISODate|Date}
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
            getAnimationFrames(getState, {
                fromValue:
                    // if animation range is set, don't set from value on startup...
                    (playbackRangeSelector(getState())
                        && playbackRangeSelector(getState()).startPlaybackTime
                        && playbackRangeSelector(getState()).endPlaybackTime)
                        ? undefined
                    // ...otherwise, start from the current time (start animation from cursor position)
                        : currentTimeSelector(getState())
            })
                .map((frames) => setFrames(frames))
                .let(wrapStartStop(framesLoading(true), framesLoading(false)), () => Rx.Observable.of(
                    error({
                        title: "There was an error retrieving animation", // TODO: localize
                        message: "Please contact the administrator" // TODO: localize
                    }),
                    stop()
                ))
                // show loading mask
                .let(wrapStartStop(timeDataLoading(false, true), timeDataLoading(false, false)))
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
                // this removes loading mask even if the STOP action is triggered before frame end (empty result)
                .concat(Rx.Observable.of(timeDataLoading(false, false)))
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
                            get(timelineLayersSelector(getState()), "[0].id")
                        )
                    )
            ),
    /**
     * Allow to move time 1 single step. TODO: evaluate to move this in timeline controls
     */
    playbackMoveStep: (action$, { getState = () => { } } = {}) =>
        action$
            .ofType(ANIMATION_STEP_MOVE)
            .filter(() => statusSelector(getState()) !== STATUS.PLAY /* && statusSelector(getState()) !== STATUS.PAUSE*/) // if is playing, the animation manages this event
            .switchMap(({ direction = 1 }) => {
                const md = playbackMetadataSelector(getState()) || {};
                const currentTime = currentTimeSelector(getState());
                // check if the next/prev value is present in the state (by `playbackCacheNextPreviousTimes`)
                if (currentTime && md.forTime === currentTime) {
                    return Rx.Observable.of(direction > 0 ? md.next : md.previous);
                }
                // if not downloaded yet, download it
                return getAnimationFrames(getState, { limit: 1, sort: direction > 0 ? "asc" : "desc", fromValue: currentTimeSelector(getState()) })
                    .map(([t] = []) => t);
            }).filter(t => !!t)
            .map(t => moveTime(t)),
    /**
     * Pre-loads next and previous values for the current time, when change.
     * This is useful to enable/disable playback buttons in guide-layer mode. The state updated by this
     * epic is also used as a cache to load next/previous button (only when the animation is not active)
     */
    playbackCacheNextPreviousTimes: (action$, { getState = () => { } } = {}) =>
        action$
            .ofType(SET_CURRENT_TIME, MOVE_TIME, SELECT_LAYER, STOP, SET_MAP_SYNC )
            .filter(() => statusSelector(getState()) !== STATUS.PLAY && statusSelector(getState()) !== STATUS.PAUSE)
            .filter(() => selectedLayerSelector(getState()))
            .filter( t => !!t )
            .switchMap(({time: actionTime}) => {
                // get current time in case of SELECT_LAYER
                const time = actionTime || currentTimeSelector(getState());
                return Rx.Observable.forkJoin(
                    // TODO: find out a way to optimize and do only one request
                    // TODO: support for local list of values (in case of missing multidim-extension)
                    getDomainValues(...domainArgs(getState, { sort: "asc", limit: 1, fromValue: time }))
                        .map(res => res.DomainValues.Domain.split(","))
                        .map(([tt]) => tt).catch(err => err && Rx.Observable.of(null)),
                    getDomainValues(...domainArgs(getState, { sort: "desc", limit: 1, fromValue: time }))
                        .map(res => res.DomainValues.Domain.split(","))
                        .map(([tt]) => tt).catch(err => err && Rx.Observable.of(null))
                ).map(([next, previous]) =>
                    updateMetadata({
                        forTime: time,
                        next,
                        previous
                    })
                );
            }),
    /**
     * During animation, on every current time change event, if the current time is out of the current range window, the timeline will shift to
     * current start-end values
     */
    playbackFollowCursor: (action$, { getState = () => { } } = {}) =>
        action$
            .ofType(MOVE_TIME)
            .filter(({type}) =>
                (type === MOVE_TIME || statusSelector(getState()) === STATUS.PLAY )
                && isOutOfRange(currentTimeSelector(getState()), rangeSelector(getState())))
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
            )),

    playbackStopWhenDeleteLayer: (action$, { getState = () => {} } = {}) =>
        action$
            .ofType(REMOVE_NODE)
            .filter( () =>
                !selectedLayerSelector(getState())
                && statusSelector(getState()) === "PLAY"
            )
            .switchMap( () => Rx.Observable.of(stop()))


};
