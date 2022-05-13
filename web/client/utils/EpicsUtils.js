/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {setControlProperty} from "../actions/controls";
import Rx from "rxjs";
import {OPEN_FEATURE_GRID} from "../actions/featuregrid";
import {createControlEnabledSelector} from "../selectors/controls";
import {REGISTER_EVENT_LISTENER} from "../actions/map";
import {CHANGE_DRAWING_STATUS} from "../actions/draw";
import {START_DRAWING} from "../actions/annotations";

/**
 * Default wrapper for the epics. This avoids to close all epics system for unhandled exceptions.
 * It allows also to identify the error showing in console the name of the epic that triggered the exception and the error.
 * At the end, it throws the exception again so it can be automatically intercepted in dev tools.
 * @memberof utils.EpicsUtils
 * @param {epic} the epic to wrap
 * @param {string} [key] the name of the epic
 * @returns {epic} the epic with error handling functionalities
 */
const defaultEpicWrapper = (epic, k = "--unknown--") => (...args) =>
    epic(...args).catch((error, source) => {
        // eslint-disable-next-line
        console.error(`Error in epic "${k}". Original error:`, error);
        setTimeout(() => {
            // throw anyway error
            throw error;
        }, 0);
        return source;
    });

/**
 * Wraps a key-value epics with the given wrapper.
 * @memberof utils.EpicsUtils
 * @param {object} epics the epics set to wrap
 * @param {function} wrapper the wrapper to use (by default the defaultEpicWrapper is used)
 * @return {array} the wrapped epics list as an array (usable as an input to redux-observable combineEpics function).
 */
export const wrapEpics = (epics, wrapper = defaultEpicWrapper) =>
    Object.keys(epics).map(k => wrapper(epics[k], k));


/**
 * Common part of the workflow that toggles one plugin off when another plugin intend to perform drawing action
 * @param action$
 * @param store
 * @param {string} toolName - tool name(s) that should be toggled off
 * @param {function} apply - optional function to override action triggered by default
 * @param isActiveCallback - optional function to override callback to check tool activeness
 * @returns {Observable<unknown>}
 */
export const shutdownToolOnAnotherToolDrawing = (action$, store, toolName,
    apply = (state, tool) => Rx.Observable.from([ setControlProperty(tool, "enabled", null) ]),
    isActiveCallback = (state, name) => createControlEnabledSelector(name)(state)
) =>
    action$.ofType(START_DRAWING, CHANGE_DRAWING_STATUS, REGISTER_EVENT_LISTENER, OPEN_FEATURE_GRID)
        .filter(({type, status, owner, eventName, toolName: name}) => {
            const isActive = isActiveCallback(store.getState(), toolName);
            switch (type) {
            case OPEN_FEATURE_GRID:
                return toolName !== 'featureGrid';
            case REGISTER_EVENT_LISTENER:
                return isActive && eventName === 'click' && name !== toolName;
            case CHANGE_DRAWING_STATUS:
                return isActive &&
                    (status === 'drawOrEdit' || status === 'start') && owner !== toolName;
            case START_DRAWING:
            default:
                return isActive && toolName !== 'annotations';
            }
        })
        .switchMap((action) => {
            return isActiveCallback(store.getState(), toolName) ? apply(store.getState(), toolName, action) : Rx.Observable.empty();
        });
