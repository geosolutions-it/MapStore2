package it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.bearer;

import it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.OpenIdConnectConfiguration;

import java.util.Map;

/**
 * Bearer tokens should be checked to make sure they are applicable to this application (to prevent
 * token reuse from another application)
 */
public interface OpenIdTokenValidator {

    /**
     * @param accessTokenClaims - map of claims in the Access Token
     * @param userInfoClaims - map of claims from the oidc "userInfo" endpoint
     * @throws Exception - if there is a problem, throw an exception.
     */
    void verifyToken(OpenIdConnectConfiguration config, Map accessTokenClaims, Map userInfoClaims)
            throws Exception;
}
