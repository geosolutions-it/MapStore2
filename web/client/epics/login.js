/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {refreshAccessToken, sessionValid, logout} = require('../actions/security');
const AuthenticationAPI = require('../api/GeoStoreDAO');
const Rx = require('rxjs');
const { LOCATION_CHANGE } = require('react-router-redux');
const {get} = require('lodash');

/**
 * Refresh the access_token every 5 minutes
 * @memberof epics.login
 * @return {external:Observable} emitting {@link #actions.security.refreshAccessToken} events
 */
const refreshTokenEpic = (action$, store) =>
        action$.ofType(LOCATION_CHANGE)
        .take(1)
        // do not launch the session verify is there is no stored session
        .switchMap(() => (get(store.getState(), "security.user") ?
            Rx.Observable.fromPromise(AuthenticationAPI.verifySession())
                .map(
                    (response) => sessionValid(response, AuthenticationAPI.authProviderName)
                )
                .catch(() => Rx.Observable.of(logout(null))) : Rx.Observable.empty()
            )
            .merge(Rx.Observable
            .interval(300000 /* ms */)
            .filter(() => get(store.getState(), "security.user"))
            .mapTo(refreshAccessToken()))
        );

/**
 * Epics for login functionality
 * @name epics.login
 * @type {Object}
 */
module.exports = {
    refreshTokenEpic
};
