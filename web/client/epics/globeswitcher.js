/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Rx from 'rxjs';

import { TOGGLE_3D } from '../actions/globeswitcher';

import { changeMapType } from '../actions/maptype';
import { last2dMapTypeSelector } from './../selectors/maptype';


/**
 * Gets every `TOGGLE_3D` event.
 * @memberof epics.globeswitcher
 * @param {external:Observable} action$ manages `TOGGLE_3D`.
 * @return {external:Observable} emitting connected-react-router push action and {@link #actions.globeswitcher.updateLast2dMapType} actions
 */
export const updateRouteOn3dSwitch = (action$, store) =>
    action$.ofType(TOGGLE_3D)
        .switchMap((action) => {
            const last2dMapType = last2dMapTypeSelector(store.getState());
            return Rx.Observable.of(changeMapType(action.originalMapType !== "cesium" ? "cesium" : last2dMapType));
        });

/**
 * Epics for 3d switcher functionality
 * @name epics.globeswitcher
 * @type {Object}
 */
export default {
    updateRouteOn3dSwitch
};
