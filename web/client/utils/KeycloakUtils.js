import Rx from 'rxjs';
import { openIDLogin, onLogout } from '../actions/login';
import {getToken, getRefreshToken} from '../utils/SecurityUtils';

import { isLoggedIn, authProviderSelector } from '../selectors/security';
import { getCookieValue } from './CookieUtils';
import { LOGIN_SUCCESS, LOGOUT, refreshAccessToken, REFRESH_SUCCESS } from '../actions/security';

export const CLOSE_KEYCLOAK_MONITOR = "__CLOSE_KEYCLOAK_MONITOR__";
/**
 * Imports the script and add it to the document.
 * @param {string} scriptURL the URL of the script to import
 * @return {Promise} a promise that resolves when the script is loaded
 */
export const dynamicImportScript = (scriptURL) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.setAttribute('id', 'keycloak-script');
        script.onload = function() {
            resolve(window.Keycloak);
        };
        script.onerror = function(e) {
            reject(new Error(`Error loading script at URL ${scriptURL}`, {cause: e}));
        };
        script.src = scriptURL;

        document.head.appendChild(script);
    });
};

const clearKeycloakSession = (keycloak) => {
    // The retry system implemented in the keycloak library is not working well.
    // in particular, when I re-init the client, the session is not properly cleared
    // forcing keycloak.sessionId="" avoids the "check-sso" to trigger a login and allows the login/logout monitoring to work.
    keycloak.clearToken();
    if (keycloak.sessionId) {
        keycloak.sessionId = "";
    }
};
// cache client for reuse
let clients = {};

/**
 * Debug log utility function.
 * @param  {...any} args args to pass to console.log
 */
const logger = (/* ...args */) => {
    /** uncomment to enable logging */
    // console.log(...args); // eslint-disable-line
};

/**
 *
 * @param {object} provider the SSO provider object (e.g. {provider: "keycloak", url: "http://localhost:8080/auth"})
 * @returns {Promise <object>} a promise that resolves with the keycloak instance
 */
export const getKeycloakClient = (provider) => {
    if (!clients[provider.provider]) {
        return dynamicImportScript(provider.jsURL ?? provider.config["auth-server-url"] ? `${provider.config["auth-server-url"]}js/keycloak.js`  :  "/js/keycloak.js")
            .then((Keycloak) => {
                clients[provider.provider] = new Keycloak({
                    ...provider.config,
                    // the JS API requires `clientId` and `url` while JSON contains `resource`
                    url: provider?.config?.["auth-server-url"],
                    clientId: provider?.config?.resource
                });
                return clients[provider.provider];
            });
    }
    return Promise.resolve(clients[provider.provider]);
};
export const clearClients = function() {
    clients = {};
};
const isLoggingIn = () => !!getCookieValue('authProvider'); // temporary token is set here when logging in with OpenID via GeoStore.
const isLoggedInWithSSOProvider = (store, ssoProvider) => isLoggedIn(store.getState()) && authProviderSelector(store.getState()) === ssoProvider.provider;

/**
 * A function that initializes a Keycloak instance and returns an observable that emits
 * when keycloak lib notifies that the user is logged in or logged out.
 * @param {object} keycloak the keycloak instance
 * @returns {Observable} an observable that emits the commands for "login", "logout", "syncToken", "noSessionFound", "scheduleRefresh":
 *  - login: toggles the login for MapStore
 *  - logout: toggles the logout for MapStore
 *  - syncToken: forces re-init the keycloak client to reload token (on first login)
 *  - noSessionFound: No client session found
 *  - scheduleRefresh: there is a session with expire token, so we need to schedule a refresh before it expires
 */
const initKeycloakSSO = (keycloak) => (ssoProvider, store) => {
    const commandSubject = new Rx.Subject();
    const token = getToken();
    const refreshToken = getRefreshToken();
    logger("initializing keycloak sso, cause", ssoProvider.cause?.type ?? ssoProvider.cause.toString());

    keycloak.init({
        token,
        refreshToken,
        onLoad: 'check-sso',
        // Adapter for GeoStore.
        adapter: {
            login() {
                // check if is not logged in or if is logging in via openid
                if (!isLoggedIn(store.getState()) && !isLoggingIn()) {
                    commandSubject.next("login");
                // token for keycloak is not initialized. Reinit the client to set the token.
                } else if (!keycloak.authenticated && isLoggedInWithSSOProvider(store, ssoProvider) ) {
                    commandSubject.next("syncToken"); // TODO: this should be triggered only once, or find a different way.
                }
                return Promise.resolve();
            },
            logout() {
                // logout only if you are logged in
                if (isLoggedInWithSSOProvider(store, ssoProvider)) {
                    clearKeycloakSession(keycloak);
                    commandSubject.next("logout");

                }
                return Promise.resolve();
            },
            redirectUri(options) {
                if (options && options.redirectUri) {
                    return options.redirectUri;
                } else if (keycloak.redirectUri) {
                    return keycloak.redirectUri;
                }
                return location.href;
            }
        }
    }).then(() => {
        if (keycloak.authenticated) {
            if (isLoggedInWithSSOProvider(store, ssoProvider) && keycloak?.tokenParsed?.exp && keycloak?.refreshTokenParsed?.exp) {
                logger("[Keycloak] Scheduling refresh token");
                commandSubject.next("scheduleRefresh");
            }
        // not logged in keycloak or in MapStore session, schedule login monitoring.
        } else if (!keycloak.authenticated && !isLoggedIn(store.getState())) {
            commandSubject.next("noSessionFound");
        }
    })
        .catch((e) => {
            console.error("Error initializing keycloak SSO", e);
            clearKeycloakSession(keycloak);
            commandSubject.next("logout");
        });


    keycloak.onAuthLogout = () => {
        clearKeycloakSession(keycloak);
        commandSubject.next("logout");
    };
    return commandSubject.asObservable();
};

/**
 * Monitors the SSO login status of the user using the Keycloak library.
 * @param {object} ssoProvider the sso provider
 * @param {object} store the redux store
 * @returns {Observable} the observable that emits the login/logout redux actions
 */
export const monitorKeycloak = (ssoProvider) => (action$, store) => {
    const initSubject = new Rx.Subject(); // commands emitted here are "retry" and "syncToken"
    return Rx.Observable.of(ssoProvider)
        // re-init on login success to set up the token
        .merge(
            action$.ofType(LOGIN_SUCCESS)
                .filter(({authProvider}) => authProvider === ssoProvider.provider)
        )
        .merge(
            action$.ofType(REFRESH_SUCCESS) // refresh auth provider is geostore. So we don't filter by provider
        )
        .merge(
            initSubject
                .asObservable()
                .filter(command =>
                    // flags to skip the retry / authoSync in case of problems.
                    command === "retry" && (ssoProvider?.sso?.autoRetry ?? true) // allow disable retry TODO: document
                    || command === "syncToken" && (ssoProvider?.sso?.autoSyncToken ?? true) // allow disable syncToken TODO: document
                )
        )
        .map( cause => ({...ssoProvider, cause}))
        .combineLatest(
            // Initial preload of Keycloak client lib
            Rx.Observable.defer(
                () => getKeycloakClient(ssoProvider)
            ).catch(e => {
                console.error("Cannot load keycloak JS API for Single sign on support", e);
                return Rx.Observable.empty(); // TODO: notification
            }),
            (provider, keycloak) => ({provider, keycloak})
        )
        // prevent refresh bombing that may cause logout, because of kc lib bugs.
        .debounceTime(ssoProvider.debounceTime ?? 1000) // useful for testing
        .switchMap(({provider, keycloak}) =>
            initKeycloakSSO(keycloak)(provider, store)
                .switchMap((command) => {
                    switch (command) {
                    case "login":
                        return Rx.Observable.of(openIDLogin(ssoProvider, ssoProvider.goToPage)); // loginOpts are useful for mock testing
                    case "logout":
                        // on logout schedule, toggle logout and schedule a retry after a while
                        // to restart to monitor login events.
                        Rx.Observable.timer(keycloak.messageReceiveTimeout ?? 10000).takeUntil(action$.ofType(LOGIN_SUCCESS, REFRESH_SUCCESS, LOGOUT)).subscribe(() => { initSubject.next("retry"); });
                        if (isLoggedInWithSSOProvider(store, ssoProvider)) {
                            return Rx.Observable.of(onLogout(ssoProvider));
                        }
                        return Rx.Observable.empty();
                    case "syncToken":
                        // When logged in but token was not applied on init, re-init the keycloak client
                        initSubject.next("syncToken");
                        return Rx.Observable.empty();
                    case "noSessionFound":
                        // scheduling a re-init to emulate login monitoring.
                        Rx.Observable.timer(keycloak.messageReceiveTimeout ?? 10000).takeUntil(action$.ofType(LOGIN_SUCCESS, REFRESH_SUCCESS, LOGOUT)).subscribe(() => { initSubject.next("retry"); });
                        return Rx.Observable.empty();
                    case "scheduleRefresh":
                        // schedule refresh token from normal epic
                        const exp = new Date(keycloak.tokenParsed.exp * 1000);
                        const now = new Date();
                        const refreshExp = new Date(keycloak.refreshTokenParsed.exp * 1000);
                        if (refreshExp > now) {
                            if (exp < now) {
                                logger("Token expired, scheduling refresh");
                                return Rx.Observable.of(refreshAccessToken());
                            }
                            // refreshInterval is useful for testing
                            const nextRefreshTime = ssoProvider.refreshInterval ?? Math.max(((exp - now) / 2), 10);
                            logger("Token will expire in", (exp - now) / 1000, "seconds, scheduling refresh in", nextRefreshTime / 1000, "seconds");
                            return Rx.Observable.timer(nextRefreshTime).takeUntil(action$.ofType(LOGIN_SUCCESS, REFRESH_SUCCESS, LOGOUT)).mapTo(refreshAccessToken()).do(() => {
                                logger("refreshing token");
                            });
                        }
                        // if also refresh token is expired (logout not necessary, because it is already done by MapStore)
                        return Rx.Observable.empty();
                    default:
                        console.error("Unknown command", command);
                        return Rx.Observable.empty();
                    }
                }).merge(
                    // this IFRAME creation forces on logout the keycloak session update, to prevent
                    // login on next page reload because of keycloak js api find session cookie changed.
                    action$.ofType(LOGOUT).do(() => {
                        const iframe = document.createElement("iframe");
                        const src = keycloak.createLoginUrl({prompt: 'none'});
                        iframe.setAttribute("src", src);
                        iframe.style.display = "none";
                        document.body.appendChild(iframe);
                        setTimeout(() => {
                            document.body.removeChild(iframe);
                        }, 5000);
                    }).ignoreElements()
                // this is necessary to close it in the test environment.
                ).takeUntil(
                    action$.ofType(CLOSE_KEYCLOAK_MONITOR).do(() => {
                        initSubject.complete();
                    })
                )
        );
};
