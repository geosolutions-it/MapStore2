/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {refreshAccessToken, sessionValid, logout, LOGIN_SUCCESS, LOGOUT} = require('../actions/security');
const {DASHBOARD_LOAD_ERROR} = require('../actions/dashboard');
const {loadMapConfig, configureError, MAP_CONFIG_LOAD_ERROR} = require('../actions/config');
const {mapIdSelector} = require('../selectors/map');
const {hasMapAccessLoadingError} = require('../selectors/mapInitialConfig');
const {initCatalog} = require('../actions/catalog');
const {setControlProperty, SET_CONTROL_PROPERTY} = require('../actions/controls');
const {pathnameSelector} = require('../selectors/routing');
const {isLoggedIn} = require('../selectors/security');
const ConfigUtils = require('../utils/ConfigUtils');
const AuthenticationAPI = require('../api/GeoStoreDAO');
const Rx = require('rxjs');
const { LOCATION_CHANGE, push } = require('react-router-redux');
const url = require('url');
const {get} = require('lodash');
const {feedbackMaskLoading} = require('../actions/feedbackMask');

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
    .filter((data) => data.type !== "LOGOUT" ? hasMapAccessLoadingError(store.getState()) : true)
    .switchMap(() => {
        const urlQuery = url.parse(window.location.href, true).query;
        let mapId = mapIdSelector(store.getState());
        let config = urlQuery && urlQuery.config || null;
        const {configUrl} = ConfigUtils.getConfigUrl({mapId, config});
        return Rx.Observable.of(loadMapConfig(configUrl, mapId));
    }).catch((e) => {
        return Rx.Observable.of(configureError(e));
    });

const promtLoginOnMapError = (actions$, store) =>
    actions$.ofType(MAP_CONFIG_LOAD_ERROR, DASHBOARD_LOAD_ERROR)
    .filter( (action) => action.error && action.error.status === 403 && !isLoggedIn(store.getState()))
    .switchMap(() => {
        return Rx.Observable.of(setControlProperty('LoginForm', 'enabled', true))
        // send to homepage if close is pressed on login modal
        .merge(
            actions$.ofType(SET_CONTROL_PROPERTY)
                .filter(actn => actn.control === 'LoginForm' && actn.property === 'enabled' && actn.value === false && !isLoggedIn(store.getState()))
                .exhaustMap(() => Rx.Observable.of(feedbackMaskLoading(), push('/')))
                .takeUntil(actions$.ofType(LOGIN_SUCCESS))
        );
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
    promtLoginOnMapError,
    initCatalogOnLoginOutEpic
};
