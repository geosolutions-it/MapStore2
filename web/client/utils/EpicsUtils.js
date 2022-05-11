/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {SET_CONTROL_PROPERTY, setControlProperty, TOGGLE_CONTROL} from "../actions/controls";
import {findIndex, keys} from "lodash";
import {Observable} from "rxjs";

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
 * Common part of the workflow that toggles one plugin off when another is activated
 * @param action$
 * @param store
 * @param {array} actions - list of actions that epic will track
 * @param {string|array} toolName - tool name(s) that should be toggled off
 * @param {array} triggers - list of tools that should trigger epic when they are activated
 * @param {function} filter - optional filter to use only subset of actions for epic
 * @returns {Observable<unknown>}
 */
export const shutdownTool = (action$, store, actions, toolName, triggers, filter = () => true) =>
    action$.ofType(...actions)
        .filter(filter)
        .filter(({control, property, properties = [], type}) => {
            const state = store.getState();
            const controlState = state.controls[control].enabled;
            switch (type) {
            case SET_CONTROL_PROPERTY:
            case TOGGLE_CONTROL:
                return (property === 'enabled' || !property) && controlState && triggers.includes(control);
            default:
                return findIndex(keys(properties), prop => prop === 'enabled') > -1 && controlState && triggers.includes(control);
            }
        })
        .switchMap(() => {
            return Array.isArray(toolName)
                ? Observable.from(toolName.map(tool => setControlProperty(tool, 'enabled', null)))
                : Observable.from([setControlProperty(toolName, 'enabled', null)]);
        });
