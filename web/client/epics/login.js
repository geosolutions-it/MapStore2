/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {refreshAccessToken} = require('../actions/security');
const Rx = require('rxjs');

/**
 * Refresh the access_token every 5 minutes
 * @memberof epics.login
 * @return {external:Observable} emitting {@link #actions.security.refreshAccessToken} events
 */
const refreshTokenEpic = () => Rx.Observable
        .interval(300000 /* ms */)
        // .timeInterval()
        // .let(o=>fullscreenEpic(o))
        .switchMap(() => Rx.Observable.of(refreshAccessToken()));

/**
 * Epics for login functionality
 * @name epics.login
 * @type {Object}
 */
module.exports = {
    refreshTokenEpic
};
