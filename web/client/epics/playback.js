/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import moment from 'moment';

import { get } from 'lodash';

import {
    PLAY,
    PAUSE,
    STOP,
    STATUS,
    SET_FRAMES,
    SET_CURRENT_FRAME,
    TOGGLE_ANIMATION_MODE,
    ANIMATION_STEP_MOVE,
    stop,
    setFrames,
    appendFrames,
    setCurrentFrame,
    framesLoading,
    updateMetadata
} from '../actions/playback';

import { moveTime, SET_CURRENT_TIME, MOVE_TIME } from '../actions/dimension';
import { selectLayer, onRangeChanged, timeDataLoading, SELECT_LAYER, SET_MAP_SYNC, SET_SNAP_TYPE } from '../actions/timeline';
import { changeLayerProperties, REMOVE_NODE } from '../actions/layers';
import { error } from '../actions/notifications';

import {
    currentTimeSelector,
    layersWithTimeDataSelector,
    layerTimeSequenceSelectorCreator
} from '../selectors/dimension';

import { LOCATION_CHANGE } from 'connected-react-router';

import {
    currentFrameSelector,
    currentFrameValueSelector,
    lastFrameSelector,
    playbackRangeSelector,
    playbackSettingsSelector,
    frameDurationSelector,
    statusSelector,
    playbackMetadataSelector
} from '../selectors/playback';

import {
    selectedLayerSelector,
    selectedLayerName,
    selectedLayerUrl,
    selectedLayerData,
    selectedLayerTimeDimensionConfiguration,
    rangeSelector,
    snapTypeSelector,
    timelineLayersSelector,
    multidimOptionsSelectorCreator
} from '../selectors/timeline';

import { getDatesInRange, getBufferedTime } from '../utils/TimeUtils';
import pausable from '../observables/pausable';
import { wrapStartStop } from '../observables/epics';
import { getDomainValues } from '../api/MultiDim';
import Rx from 'rxjs';

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
    const fromEnd = snapTypeSelector(getState()) === 'end';
    return [layerUrl, layerName, "time", {
        limit: BUFFER_SIZE, // default, can be overridden by pagination options
        time: startPlaybackTime && endPlaybackTime && shouldFilter ? toAbsoluteInterval(startPlaybackTime, endPlaybackTime) : undefined,
        fromEnd,
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
 * if we have a selected layer and time occurrences are expressed as intervals
 * it will filter out those dates that won't fall within the animation frame limit
 * will also consider only the dates of interest (start or end) chosen by the user
 * @param {function} {getState} returns the application state
 * @param {string[]} domainsArray the domain values array used to create the animation frames
 */
const getTimeIntervalDomains = (getState, domainsArray) => {
    let intervalDomains = domainsArray;
    const playbackRange = playbackRangeSelector(getState()) || {};
    const snapTo = snapTypeSelector(getState());
    const endPlaybackTime = playbackRange?.endPlaybackTime;
    const startPlaybackTime =  playbackRange?.startPlaybackTime;
    intervalDomains = snapTo && snapTo === 'end' ?  domainsArray.map(date => date.split('/')[1]) : domainsArray.map(date => date.split('/')[0]);
    return startPlaybackTime && endPlaybackTime ? getDatesInRange(intervalDomains, startPlaybackTime, endPlaybackTime) : intervalDomains;
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
        const domainValues = getDomainValues(...domainArgs(getState, options));
        return domainValues.map(res => {
            const domainsArray =  res.DomainValues.Domain.split(",");
            // if there is a selected layer check for time intervals (start/end)
            // and filter-out domain dates falling outisde the start/end playBack time
            const selectedLayer = selectedLayerSelector(getState());
            const x = selectedLayer ? getTimeIntervalDomains(getState, domainsArray) : domainsArray;
            return x;
        });
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


/**
 * When animation start, triggers the flow to retrieve the frames, buffering them:
 * The first setFrames will trigger the animation.
 * On any new animation frame, if the buffer is near to finish, this epic triggers
 * the retrieval of the next frames, until the animation ends.
 */
export const retrieveFramesForPlayback = (action$, { getState = () => { } } = {}) =>
    action$.ofType(PLAY).exhaustMap(() =>
        getAnimationFrames(getState, {
            fromValue:
                // if animation range is set, don't set from value on startup...
                (playbackRangeSelector(getState())
                    && playbackRangeSelector(getState()).startPlaybackTime
                    && playbackRangeSelector(getState()).endPlaybackTime)
                    ? undefined
                // ...otherwise, start from the current time (start animation from cursor position)
                    : currentTimeSelector(getState()),
            ...(snapTypeSelector(getState()) === 'end' ? {fromEnd: true} : {})
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
                    .switchMap(() => {
                        return getAnimationFrames(getState, {
                            fromValue: lastFrameSelector(getState()),
                            ...(snapTypeSelector(getState()) === 'end' ? {fromEnd: true} : {})
                        })
                            .map(appendFrames)
                            .let(wrapStartStop(framesLoading(true), framesLoading(false)));
                    })
            )
            .takeUntil(action$.ofType(STOP, LOCATION_CHANGE))
            // this removes loading mask even if the STOP action is triggered before frame end (empty result)
            .concat(Rx.Observable.of(timeDataLoading(false, false)))
            .let(setupAnimation(getState))
    );
/**
 * When the new animation frame is triggered, changes the current time, if the next frame is available. Otherwise stops.
 * NOTE: we don't have a count of next animation steps, so we suppose that the selector has already pre-loaded next animation steps.
 */
export const updateCurrentTimeFromAnimation = (action$, { getState = () => { } } = {}) =>
    action$.ofType(SET_CURRENT_FRAME)
        .map(() => currentFrameValueSelector(getState()))
        .map(t => t ? moveTime(t) : stop());
/**
 * When a new frame sequence is set, the animation starts.
 */
export const timeDimensionPlayback = (action$, { getState = () => { } } = {}) =>
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
        );
/**
 * Synchronizes the fixed animation step toggle with guide layer on timeline
 */
export const playbackToggleGuideLayerToFixedStep = (action$, { getState = () => { } } = {}) =>
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
        );
/**
 * Allow to move time 1 single step. TODO: evaluate to move this in timeline controls
 */
export const playbackMoveStep = (action$, { getState = () => { } } = {}) =>
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
            return getAnimationFrames(getState, { limit: 1, sort: direction > 0 ? "asc" : "desc", fromValue: currentTimeSelector(getState()), ...(snapTypeSelector(getState()) === 'end' ? {fromEnd: true} : {}) })
                .map(([t] = []) => t);
        }).filter(t => !!t)
        .map(t => {
            const time = (snapTypeSelector(getState()) === 'end' ? t.split('/')[1] : t.split('/')[0]) ?? t;
            return moveTime(time);
        });
/**
 * Pre-loads next and previous values for the current time, when change.
 * This is useful to enable/disable playback buttons in guide-layer mode. The state updated by this
 * epic is also used as a cache to load next/previous button (only when the animation is not active)
 */
export const playbackCacheNextPreviousTimes = (action$, { getState = () => { } } = {}) =>
    action$
        .ofType(SET_CURRENT_TIME, MOVE_TIME, SELECT_LAYER, STOP, SET_MAP_SYNC, SET_SNAP_TYPE)
        .filter(() => statusSelector(getState()) !== STATUS.PLAY && statusSelector(getState()) !== STATUS.PAUSE)
        .filter(() => selectedLayerSelector(getState()))
        .filter( t => !!t )
        .switchMap(({time: actionTime}) => {
            // get current time in case of SELECT_LAYER
            const time = actionTime || currentTimeSelector(getState());
            const snapType = snapTypeSelector(getState());
            return Rx.Observable.forkJoin(
                // TODO: find out a way to optimize and do only one request
                // TODO: support for local list of values (in case of missing multidim-extension)
                getDomainValues(...domainArgs(getState, { sort: "asc", fromValue: getBufferedTime(time, 0.0001, 'remove'), ...(snapType === 'end' ? {fromEnd: true} : {}) }))
                    .map(res => res.DomainValues.Domain.split(","))
                    .map(([tt]) => tt).catch(err => err && Rx.Observable.of(null)),
                getDomainValues(...domainArgs(getState, { sort: "asc", fromValue: getBufferedTime(time, 0.0001, 'add'), ...(snapType === 'end' ? {fromEnd: true} : {}) }))
                    .map(res => res.DomainValues.Domain.split(","))
                    .map(([tt]) => tt).catch(err => err && Rx.Observable.of(null))
            ).map(([next, previous]) => {
                const isTimeIntervalData = next.indexOf('/') !== -1 || previous.indexOf('/') !== -1;
                return updateMetadata({
                    forTime: time,
                    next,
                    previous,
                    timeIntervalData: isTimeIntervalData
                });
            });
        });
/**
 * During animation, on every current time change event, if the current time is out of the current range window, the timeline will shift to
 * current start-end values
 */
export const playbackFollowCursor = (action$, { getState = () => { } } = {}) =>
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
        ));

export const playbackStopWhenDeleteLayer = (action$, { getState = () => {} } = {}) =>
    action$
        .ofType(REMOVE_NODE)
        .filter( () =>
            !selectedLayerSelector(getState())
            && statusSelector(getState()) === "PLAY"
        )
        .switchMap( () => Rx.Observable.of(stop()));


export default {
    retrieveFramesForPlayback,
    updateCurrentTimeFromAnimation,
    timeDimensionPlayback,
    playbackToggleGuideLayerToFixedStep,
    playbackMoveStep,
    playbackCacheNextPreviousTimes,
    playbackFollowCursor,
    playbackStopWhenDeleteLayer
};
