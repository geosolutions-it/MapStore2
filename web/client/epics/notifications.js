/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import Rx from 'rxjs';

import { clear } from '../actions/notifications';
import { LOCATION_CHANGE } from 'connected-react-router';

/**
 * Clear all notifications on LOCATION_CHANGE.
 * @param {external:Observable} action$ manages `LOCATION_CHANGE`.
 * @memberof epics.notifications
 * @return {external:Observable}
 */
export const clearNotificationOnLocationChange = action$ =>
    action$.ofType(LOCATION_CHANGE)
        .switchMap(() => Rx.Observable.of(clear()));

/**
 * Epics for notifications
 * @name epics.notifications
 * @type {Object}
 */

export default {
    clearNotificationOnLocationChange
};
