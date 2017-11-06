/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {refreshAccessToken, sessionValid, logout, LOGIN_SUCCESS, LOGOUT} = require('../actions/security');
const {loadMapConfig, configureError} = require('../actions/config');
const {mapIdSelector} = require('../selectors/map');
const {initCatalog} = require('../actions/catalog');
const {pathnameSelector} = require('../selectors/routing');
const ConfigUtils = require('../utils/ConfigUtils');
const AuthenticationAPI = require('../api/GeoStoreDAO');
const Rx = require('rxjs');
const { LOCATION_CHANGE } = require('react-router-redux');
const url = require('url');
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

const reloadMapConfig = (action$, store) =>
    action$.ofType(LOGIN_SUCCESS, LOGOUT)
    .filter(() => pathnameSelector(store.getState()).indexOf("viewer") !== -1)
    .switchMap(() => {
        const urlQuery = url.parse(window.location.href, true).query;
        let mapId = mapIdSelector(store.getState());
        let config = urlQuery && urlQuery.config || null;
        const {configUrl} = ConfigUtils.getConfigUrl({mapId, config});
        return Rx.Observable.of(loadMapConfig(configUrl, mapId));
    }).catch((e) => {
        return Rx.Observable.of(configureError(e));
    });

const initCatalogOnLoginOutEpic = (action$) =>
    action$.ofType(LOGIN_SUCCESS, LOGOUT)
    .switchMap(() => {
        return Rx.Observable.of(initCatalog());
    });

/**
 * Epics for login functionality
 * @name epics.login
 * @type {Object}
 */
module.exports = {
    refreshTokenEpic,
    reloadMapConfig,
    initCatalogOnLoginOutEpic
};
