/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const screenfull = require('screenfull');
const {head, last} = require('lodash');
const {setControlProperty} = require('../actions/controls');
const {TOGGLE_FULLSCREEN} = require('../actions/fullscreen');
const ConfigUtils = require('../utils/ConfigUtils');
const Rx = require('rxjs');

const getFullScreenEvent = () => {
    let candidates = [
        ['exitFullscreen', 'fullscreenchange'],
        ['webkitExitFullscreen', 'webkitfullscreenchange'],
        ['webkitCancelFullScreen', 'webkitfullscreenchange'],
        ['mozCancelFullScreen', 'mozfullscreenchange'],
        ['msExitFullscreen', 'MSFullscreenChange']
    ];
    return last(head(candidates.filter((c) => document[c[0]])));
};
/**
 * Gets every `TOGGLE_FULLSCREEN` event.
 * Dispatches the fullscreen toggle event toggles the fullscreen itself.
 * Intercept all events for fullscreen and properly syncronizes the button state.
 * and updates every time the user toggles fullscreen (also hitting Esc)
 * @param {external:Observable} action$ manages `TOGGLE_FULLSCREEN`.
 * @memberof epics.fullscreen
 * @return {external:Observable} emitting {@link #actions.controls.setControlProperty} events
 */
const toggleFullscreenEpic = action$ =>
    action$.ofType(TOGGLE_FULLSCREEN).switchMap(action => {
        const element = document.querySelector(action && action.querySelector || '.' + (ConfigUtils.getConfigProp('themePrefix') || 'ms2') + " > div");
        if (element && action.enable && screenfull.enabled) {
            screenfull.request(element);

        } else if (element && !action.enable) {
            screenfull.exit();
        }
        return Rx.Observable.merge(
            Rx.Observable.fromEvent(document, getFullScreenEvent())
                .filter(() => screenfull.element !== element)
                .map( () => setControlProperty("fullscreen", "enabled", false) ),
            Rx.Observable.of(setControlProperty("fullscreen", "enabled", action.enable)),
            Rx.Observable.fromEvent(window, "hashchange")
                .do(() => screenfull.exit())
                .map( () => setControlProperty("fullscreen", "enabled", false) )
        );
    });
/**
 * Epics for fullscreen functionality
 * @name epics.fullscreen
 * @type {Object}
 */
module.exports = {
    toggleFullscreenEpic
};
