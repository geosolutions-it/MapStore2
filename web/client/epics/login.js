/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
    refreshAccessToken,
    sessionValid,
    loginSuccess,
    logout,
    loginPromptClosed,
    LOGIN_SUCCESS,
    LOGOUT,
    LOGIN_REQUIRED
} from '../actions/security';

import { loadMapConfig, configureError } from '../actions/config';
import { mapIdSelector } from '../selectors/map';
import { hasMapAccessLoadingError } from '../selectors/mapInitialConfig';
import { initCatalog } from '../actions/catalog';
import { setControlProperty, SET_CONTROL_PROPERTY } from '../actions/controls';
import { monitorKeycloak } from '../utils/KeycloakUtils';

import { pathnameSelector } from '../selectors/router';
import { isLoggedIn } from '../selectors/security';
import ConfigUtils from '../utils/ConfigUtils';
import {getCookieValue, eraseCookie} from '../utils/CookieUtils';
import AuthenticationAPI from '../api/GeoStoreDAO';
import Rx from 'rxjs';
import { push, LOCATION_CHANGE } from 'connected-react-router';
import url from 'url';
import { get } from 'lodash';
import { LOCAL_CONFIG_LOADED } from '../actions/localConfig';

/**
 * Refresh the access_token every 5 minutes
 * @memberof epics.login
 * @return {external:Observable} emitting {@link #actions.security.refreshAccessToken} events
 */
export const refreshTokenEpic = (action$, store) =>
    action$.ofType(LOCATION_CHANGE)
        .take(1)
        // do not launch the session verify is there is no stored session
        .switchMap(() => (get(store.getState(), "security.user") ?
            Rx.Observable.fromPromise(AuthenticationAPI.verifySession())
                .map(
                    (response) => sessionValid(response, AuthenticationAPI.authProviderName)
                )
                // try to refresh the token if the session is still valid
                .catch(() => Rx.Observable.of(refreshAccessToken())) : Rx.Observable.empty()
        )
            .merge(Rx.Observable
                .interval(ConfigUtils.getConfigProp("tokenRefreshInterval") ?? 30000 /* ms */)
                .filter(() => get(store.getState(), "security.user"))
                .mapTo(refreshAccessToken()))
        );


export const reloadMapConfig = (action$, store) =>
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

export const promptLoginOnMapError = (actions$, store) =>
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

export const initCatalogOnLoginOutEpic = (action$) =>
    action$.ofType(LOGIN_SUCCESS, LOGOUT)
        .switchMap(() => {
            return Rx.Observable.of(initCatalog());
        });

export const redirectOnLogout = action$ =>
    action$.ofType(LOGOUT)
        .filter(({ redirectUrl }) => redirectUrl)
        .switchMap(({ redirectUrl }) => Rx.Observable.of(push(redirectUrl)));

/**
 * Verifies the session from the cookie.
 * This is present if login has been done using OpenID.
 * @memberof epics.login
 * @return {external:Observable} emitting login success or logout events if the cookie is valid.
 */
export const verifyOpenIdSessionCookie = (action$, {getState = () => {}}) => {
    return action$.ofType(LOCATION_CHANGE).take(1).switchMap( () => {
        if (isLoggedIn(getState())) {
            return Rx.Observable.empty();
        }
        const tokensKey = getCookieValue("tokens_key");
        const authProvider = getCookieValue('authProvider'); // This is set by login tool.
        if (!tokensKey || !authProvider) {
            return Rx.Observable.empty();
        }
        return Rx.Observable.defer(() => {
            return AuthenticationAPI.getTokens(authProvider, tokensKey);
        }).switchMap(({access_token: accessToken, refresh_token: refreshToken, expires: expires }) => {
            return Rx.Observable.defer(() => AuthenticationAPI.getUserDetails({access_token: accessToken}))
                .switchMap( userDetails => { // check user detail to confirm login success
                    return Rx.Observable.of(loginSuccess({...userDetails, access_token: accessToken, refresh_token: refreshToken, expires: expires, authProvider}));
                });
        })
            .catch(() => { // call failure means that the session expired, so logout at all
                return Rx.Observable.of(logout(null));
            })
            .concat(Rx.Observable.of(1).switchMap(() => {
                // clean up the cookie
                eraseCookie('tokens_key');
                eraseCookie('authProvider');
                return Rx.Observable.empty();
            }));

    });
};

export const checkSSO = ( action$, store ) => {
    return action$.ofType(LOCAL_CONFIG_LOADED).take(1).switchMap(() => {
        const providers = ConfigUtils.getConfigProp("authenticationProviders");
        // get the first SSO system configured (only one supported)
        const ssoProvider = (providers ?? []).filter(({sso}) => sso)?.[0];
        if (ssoProvider) {
            // monitor SSO
            const {sso} = ssoProvider;
            // only keycloak implementation is supported
            if (sso.type !== "keycloak") {
                return Rx.Observable.empty();
            }

            return monitorKeycloak(ssoProvider)(action$, store);
        }
        return Rx.Observable.empty();
    });
};

/**
 * Epics for login functionality
 * @name epics.login
 * @type {Object}
 */
export default {
    checkSSO,
    refreshTokenEpic,
    reloadMapConfig,
    promptLoginOnMapError,
    initCatalogOnLoginOutEpic,
    verifyOpenIdSessionCookie,
    redirectOnLogout
};
