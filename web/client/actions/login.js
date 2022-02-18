import ConfigUtils from '../utils/ConfigUtils';
import { setControlProperty } from './controls';
import { logoutWithReload } from './security';
import { setCookie } from '../utils/CookieUtils';
import AuthorizationAPI from '../api/GeoStoreDAO';

// ADD to security selectors
export const authProviderSelector = state => state.security && state.security.authProvider;


// NEW ACTION

export function openIDLogin(provider) {
    return () => {
        setCookie("authProvider", provider?.provider, 1000 * 60 * 5); // expires in 5 minutes
        location.href = provider?.url ?? `${ ConfigUtils.getConfigProp("geoStoreUrl")}openid/${provider.provider}/login`;
    };
}

/**
 * Action triggered by the login tool to start login procedure.
 * @param {object[]} providers the list of providers available.
 * @returns {function|object} the action to trigger or the thunk to execute, to show the prompt or redirect to the proper login service.
 */
export function onShowLogin(providers = [{type: "basic", provider: "geostore"}]) {
    if (providers?.length > 1) {
        return setControlProperty( "LoginForm", "enabled", true, true); // SHOW Login form
    }
    // only one provider does automatically redirect or show login form
    const provider = providers?.[0];
    switch (provider?.type) {
    case "openID":
        return openIDLogin(provider);
    case "basic":
        return setControlProperty( "LoginForm", "enabled", true, true);
    default:
        console.warn("login provider not configured correctly");
        return setControlProperty( "LoginForm", "enabled", true, true);
    }
}

export function onLogout() {
    return (dispatch) => {

        AuthorizationAPI.logout()
            .then(() => dispatch(logoutWithReload()))
            .catch(() => dispatch(logoutWithReload()));

    };
}
