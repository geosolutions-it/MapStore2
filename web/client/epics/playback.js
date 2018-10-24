/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
    PLAY, PAUSE, STOP, SET_FRAMES, SET_CURRENT_FRAME,
    stop, setFrames, appendFrames, setCurrentFrame,
    framesLoading
} = require('../actions/playback');
const {
    setCurrentTime
} = require('../actions/dimension');
const { LOCATION_CHANGE } = require('react-router-redux');

const { currentFrameSelector, currentFrameValueSelector, lastFrameSelector} = require('../selectors/playback');
const {selectedLayerName, selectedLayerUrl} = require('../selectors/timeline');

const pausable = require('../observables/pausable');
const { wrapStartStop } = require('../observables/epics');

const {getDomainValues} = require('../api/MultiDim');

const Rx = require('rxjs');
const INTERVAL = 2000;

const BUFFER_SIZE = 20;
const PRELOAD_BEFORE = 10;
const domainArgs = (getState, paginationOptions = {}) => {
    // const timeData = timeDataSelector(getState()) || {};
    const layerName = selectedLayerName(getState());
    const layerUrl = selectedLayerUrl(getState());

    return [layerUrl, layerName, "time", {
        limit: BUFFER_SIZE,
        ...paginationOptions
    }];
};
module.exports = {
    retrieveFramesForPlayback: (action$, { getState = () => { } } = {}) =>
        action$.ofType(PLAY).exhaustMap( () =>
            getDomainValues(...domainArgs(getState))
                .map(res => res.DomainValues.Domain.split(","))
                .map((frames) => setFrames(frames))
                .let(wrapStartStop(framesLoading(true), framesLoading(false)))
                .concat(
                    action$
                        .ofType(SET_CURRENT_FRAME)
                        .filter(({ frame }) => frame % BUFFER_SIZE === ((BUFFER_SIZE - PRELOAD_BEFORE) ))
                        .switchMap(() =>
                            getDomainValues(...domainArgs(getState, {
                                fromValue: lastFrameSelector(getState())
                            }))
                            .map(res => res.DomainValues.Domain.split(","))
                            .map(appendFrames)
                            .let(wrapStartStop(framesLoading(true), framesLoading(false)))
                        )
            )
            .takeUntil(action$.ofType(STOP, LOCATION_CHANGE))
        ),
    updateCurrentTimeFromAnimation: (action$, { getState = () => { } } = {}) =>
        action$.ofType(SET_CURRENT_FRAME)
            .map( () => currentFrameValueSelector(getState()))
            .map(t => t ? setCurrentTime(t) : stop()),
    timeDimensionPlayback: (action$, {getState = () => {}} = {}) =>
        action$.ofType(PLAY).exhaustMap( () =>
                action$.ofType(SET_FRAMES)
                .switchMap( () =>
                    Rx.Observable.interval(INTERVAL)
                )
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
        )
};
