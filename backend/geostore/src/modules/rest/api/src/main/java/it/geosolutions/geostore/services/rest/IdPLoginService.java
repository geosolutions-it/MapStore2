package it.geosolutions.geostore.services.rest;

import it.geosolutions.geostore.services.rest.model.SessionToken;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.ws.rs.core.Response;

/**
 * Extension point to customize the login and redirect after login performed from the {@link
 * IdPLoginRest};
 */
public interface IdPLoginService {

    /**
     * Perform the login to an external IdP.
     *
     * @param request the request.
     * @param response the response.
     * @param provider the provider name.
     */
    void doLogin(HttpServletRequest request, HttpServletResponse response, String provider);

    /**
     * Perform a redirect to an application url. Useful if the external IdP redirect to an app url
     * when login is successful.
     *
     * @param request the request.
     * @param response the response.
     * @param provider the provider name.
     * @return a {@link Response instance}.
     */
    Response doInternalRedirect(
            HttpServletRequest request, HttpServletResponse response, String provider);

    /**
     * Return the SessionToken if any exists for the provided key.
     *
     * @param provider the auth provider
     * @param tokenIdentifier the token identifier to use to retrieve stored tokens.
     * @return the {@link SessionToken} if found, null otherwise.
     */
    SessionToken getTokenByIdentifier(String provider, String tokenIdentifier);
}
