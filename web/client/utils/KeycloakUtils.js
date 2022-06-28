import Rx from 'rxjs';
import { openIDLogin, logout } from '../actions/login';

import { isLoggedIn, authProviderSelector } from '../selectors/security';
import { getCookieValue } from './CookieUtils';

/**
 * Imports the script and add it to the document.
 * @param {string} scriptURL the URL of the script to import
 * @return {Promise} a promise that resolves when the script is loaded
 */
const dynamicImportScript = (scriptURL) => {
    return new Promise((resolve, reject) => {
        var script = document.createElement('script');
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


const keycloakSSO = (Keycloak) => (ssoProvider, store) => {
    const {sso} = ssoProvider;
    const keycloak = new Keycloak({
        ...sso.config,
        // the JS API requires `clientId` and `url` while JSON contains `resource`
        url: sso?.config?.["auth-server-url"],
        clientId: sso?.config?.resource
    });
    const subject = new Rx.Subject();
    keycloak.init({
        onLoad: 'check-sso',
        adapter: {
            login() {
                // check if is not logged in or if is logging in via openid
                if (!isLoggedIn(store.getState()) && !getCookieValue('access_token') ) {
                    subject.next(openIDLogin(ssoProvider));
                }
                return new Promise(res => res());
            },
            logout() {
                // logout only if you are logged in
                if (isLoggedIn(store.getState() && authProviderSelector(store.getState) === ssoProvider.provider)) {
                    subject.next(logout());
                }
                return new Promise(res => res());
            }
        }
    });

    keycloak.onAuthSuccess = () => {
        // subject.next(tokenLogin({accessToken: keycloak.token, refreshToken: keycloak.refreshToken, authProvider: provider}));

    };
    keycloak.onAuthLogout = () => {
        subject.next(logout());
    };

    return subject.asObservable();
};


export function monitorKeycloak(ssoProvider, store) {
    const {sso} = ssoProvider;
    return Rx.Observable.defer(
        () => dynamicImportScript(/* webpackIgnore: true */ sso.jsURL ?? sso.config["auth-server-url"] ? `${sso.config["auth-server-url"]}js/keycloak.js`  :  "/js/keycloak.js"))
        .catch(e => {
            console.error("Cannot load keycloak JS API for Single sign on support", e);
            return Rx.Observable.empty(); // TODO: notification
        }).switchMap(Keycloak => keycloakSSO(Keycloak)(ssoProvider, store));
}
