/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {setControlProperty} from "../actions/controls";
import Rx from "rxjs";
import {createControlEnabledSelector} from "../selectors/controls";
import {START_DRAWING} from "../actions/annotations";
import {CHANGE_DRAWING_STATUS} from "../actions/draw";
import {REGISTER_EVENT_LISTENER} from "../actions/map";
import {OPEN_FEATURE_GRID} from "../actions/featuregrid";

export const EXPORT_CONTEXT = "export-context";

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
    apply = (state, tool) => Rx.Observable.from([setControlProperty(tool, "enabled", null)]),
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
