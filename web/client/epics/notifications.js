/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const Rx = require('rxjs');
const {clear} = require('../actions/notifications');
const {LOCATION_CHANGE} = require('connected-react-router');

/**
 * Clear all notifications on LOCATION_CHANGE.
 * @param {external:Observable} action$ manages `LOCATION_CHANGE`.
 * @memberof epics.notifications
 * @return {external:Observable}
 */
const clearNotificationOnLocationChange = action$ =>
    action$.ofType(LOCATION_CHANGE)
        .switchMap(() => Rx.Observable.of(clear()));

/**
 * Epics for notifications
 * @name epics.notifications
 * @type {Object}
 */

module.exports = {
    clearNotificationOnLocationChange
};
