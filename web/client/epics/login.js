/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { refreshAccessToken, sessionValid, logout, loginPromptClosed, LOGIN_SUCCESS, LOGOUT, LOGIN_REQUIRED} = require('../actions/security');

const {loadMapConfig, configureError} = require('../actions/config');
const {mapIdSelector} = require('../selectors/map');
const {hasMapAccessLoadingError} = require('../selectors/mapInitialConfig');
const {initCatalog} = require('../actions/catalog');
const {setControlProperty, SET_CONTROL_PROPERTY} = require('../actions/controls');
const {pathnameSelector} = require('../selectors/router');
const {isLoggedIn} = require('../selectors/security');
const ConfigUtils = require('../utils/ConfigUtils');
const AuthenticationAPI = require('../api/GeoStoreDAO');
const Rx = require('rxjs');
const { LOCATION_CHANGE } = require('connected-react-router');
const url = require('url');
const {get} = require('lodash');
const {push} = require('connected-react-router');

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
    Rx.Observable.merge(
        action$.ofType(LOGIN_SUCCESS, LOGOUT)
            .filter(() => pathnameSelector(store.getState()).indexOf("viewer") !== -1)
            .filter((data) => data.type !== "LOGOUT" ?
                hasMapAccessLoadingError(store.getState()) :
                pathnameSelector(store.getState()).indexOf("new") === -1)
            .map(() => mapIdSelector(store.getState())),
        action$.ofType(LOGOUT)
            .filter(() => pathnameSelector(store.getState()).indexOf("viewer") !== -1 && pathnameSelector(store.getState()).indexOf("new") !== -1)
            .map(() => 'new')
    )
        .switchMap((mapId) => {
            if (mapId === "new" && !isLoggedIn(store.getState())) {
                return Rx.Observable.of(configureError({status: 403}));
            }
            const urlQuery = url.parse(window.location.href, true).query;
            let config = urlQuery && urlQuery.config || null;
            const { configUrl } = ConfigUtils.getConfigUrl({ mapId, config });
            return Rx.Observable.of(loadMapConfig(configUrl, mapId !== 'new' ? mapId : null ));
        }).catch((e) => {
            return Rx.Observable.of(configureError(e));
        });

const promptLoginOnMapError = (actions$, store) =>
    actions$.ofType(LOGIN_REQUIRED)
        .switchMap(() => {
            return Rx.Observable.of(setControlProperty('LoginForm', 'enabled', true))
            // send to homepage if close is pressed on login modal
                .merge(
                    actions$.ofType(SET_CONTROL_PROPERTY)
                        // login close event
                        .filter(action => action.control === 'LoginForm' && action.property === 'enabled' && action.value === false && !isLoggedIn(store.getState()))
                        .exhaustMap(() => Rx.Observable.of(loginPromptClosed()))
                        .takeUntil(actions$.ofType(LOGIN_SUCCESS, LOCATION_CHANGE))
                );
        });

const initCatalogOnLoginOutEpic = (action$) =>
    action$.ofType(LOGIN_SUCCESS, LOGOUT)
        .switchMap(() => {
            return Rx.Observable.of(initCatalog());
        });

const redirectOnLogout = action$ =>
    action$.ofType(LOGOUT)
        .filter(({ redirectUrl }) => redirectUrl)
        .switchMap(({ redirectUrl }) => Rx.Observable.of(push(redirectUrl)));

/**
 * Epics for login functionality
 * @name epics.login
 * @type {Object}
 */
module.exports = {
    refreshTokenEpic,
    reloadMapConfig,
    promptLoginOnMapError,
    initCatalogOnLoginOutEpic,
    redirectOnLogout
};
