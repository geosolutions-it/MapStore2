/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';

import { SELECT_NODE } from '../actions/layers';
import {
    setActive
} from '../actions/swipe';

import { LOCATION_CHANGE } from 'connected-react-router';
import { layerSwipeSettingsSelector } from '../selectors/swipe';

/**
 * Ensures that swipeSettings active is changed back to false when a layer is deselected in TOC or group is selected
 * @memberof epics.swipe
 * @param {external:Observable} action$ manages `SELECT_NODE`
 * @return {external:Observable}
 */
export const resetLayerSwipeSettingsEpic = (action$, store) =>
    action$.ofType(SELECT_NODE)
        .switchMap(({nodeType}) => {
            const state = store.getState();
            const swipeSettings = layerSwipeSettingsSelector(state);
            return (
                swipeSettings.active && nodeType === 'group')
                ? Rx.Observable.of(setActive(false))
                : Rx.Observable.empty();
        });

export const deactivateSwipeToolOnSwitchMaps = (action$, store) =>
    action$.ofType(LOCATION_CHANGE)
        .switchMap(() => {
            const swipeSettings = layerSwipeSettingsSelector(store.getState());
            return swipeSettings.active
                ? Rx.Observable.of(setActive(false))
                : Rx.Observable.empty();
        });

/**
 * Deactivates the swipe tool when maps are switched
 * @memberof epics.swipe
 * @param {external:Observable} action$ manages ``
 * @return {external:Observable}
 */
export default {
    resetLayerSwipeSettingsEpic,
    deactivateSwipeToolOnSwitchMaps
};
