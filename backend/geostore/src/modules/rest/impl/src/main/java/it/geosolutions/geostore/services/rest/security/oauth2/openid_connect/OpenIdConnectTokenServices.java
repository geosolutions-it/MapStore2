/* ====================================================================
 *
 * Copyright (C) 2024 GeoSolutions S.A.S.
 * http://www.geo-solutions.it
 *
 * GPLv3 + Classpath exception
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.
 *
 * ====================================================================
 *
 * This software consists of voluntary contributions made by developers
 * of GeoSolutions.  For more information on GeoSolutions, please see
 * <http://www.geo-solutions.it/>.
 *
 */
package it.geosolutions.geostore.services.rest.security.oauth2.openid_connect;

import it.geosolutions.geostore.services.rest.security.oauth2.GeoStoreRemoteTokenServices;
import it.geosolutions.geostore.services.rest.security.oauth2.OAuth2Configuration;
import it.geosolutions.geostore.services.rest.security.oauth2.OAuth2Utils;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;

import java.util.Collections;
import java.util.Map;

/** Calls the OIDC userinfo endpoint to resolve token claims. */
public class OpenIdConnectTokenServices extends GeoStoreRemoteTokenServices {

    public OpenIdConnectTokenServices(String principalKey, OAuth2Configuration configuration) {
        // principalKey is retained for call-site compatibility; principal resolution from the
        // userinfo/introspection claims is performed by OAuth2GeoStoreAuthenticationService using
        // the provider OAuth2Configuration. A protected RestTemplate mirrors the legacy
        // RemoteTokenServices behavior (the CompositeOpenIdConnectFilter may override it).
        super(OAuth2Utils.protectedRestTemplate(configuration));
        LOGGER.info("Instantiating OpenIdConnectTokenServices with principalKey: {}", principalKey);
    }

    @Override
    protected Map<String, Object> checkToken(String accessToken) {
        if (checkTokenEndpointUrl == null || checkTokenEndpointUrl.trim().isEmpty()) {
            LOGGER.debug("No userinfo endpoint configured; skipping userinfo call.");
            return Collections.emptyMap();
        }
        LOGGER.debug("Checking token via userinfo endpoint");
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", getAuthorizationHeader(accessToken));
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        Map<String, Object> results =
                sendRequestForMap(
                        checkTokenEndpointUrl,
                        new LinkedMultiValueMap<>(),
                        headers,
                        HttpMethod.GET);
        LOGGER.debug("Got userinfo results: {}", results);
        return results;
    }
}
