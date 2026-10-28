/* ====================================================================
 *
 * Copyright (C) 2022 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.services.rest.security.oauth2;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * DiscoveryClient to perform a discovery request and set the value to the OAuth2Configuration
 * instance.
 */
public class DiscoveryClient {
    private static final Logger LOGGER = LogManager.getLogger(DiscoveryClient.class);
    private static final String PROVIDER_END_PATH = "/.well-known/openid-configuration";
    private static final String AUTHORIZATION_ENDPOINT_ATTR_NAME = "authorization_endpoint";
    private static final String TOKEN_ENDPOINT_ATTR_NAME = "token_endpoint";
    private static final String USERINFO_ENDPOINT_ATTR_NAME = "userinfo_endpoint";
    private static final String END_SESSION_ENDPOINT = "end_session_endpoint";
    private static final String JWK_SET_URI_ATTR_NAME = "jwks_uri";
    private static final String SCOPES_SUPPORTED = "scopes_supported";
    private static final String REVOCATION_ENDPOINT = "revocation_endpoint";
    private static final String INTROSPECTION_ENDPOINT = "introspection_endpoint";

    private final RestTemplate restTemplate;
    private String location;

    public DiscoveryClient(String location, OAuth2Configuration configuration) {
        setLocation(location);
        this.restTemplate = OAuth2Utils.protectedRestTemplate(configuration);
    }

    private static String appendPath(String... pathComponents) {
        StringBuilder result = new StringBuilder(pathComponents[0]);
        for (int i = 1; i < pathComponents.length; i++) {
            String component = pathComponents[i];
            boolean endsWithSlash = result.charAt(result.length() - 1) == '/';
            boolean startsWithSlash = component.startsWith("/");
            if (endsWithSlash && startsWithSlash) {
                result.setLength(result.length() - 1);
            } else if (!endsWithSlash && !startsWithSlash) {
                result.append("/");
            }
            result.append(component);
        }

        return result.toString();
    }

    private void setLocation(String location) {
        if (!location.endsWith(PROVIDER_END_PATH)) {
            location = appendPath(location, PROVIDER_END_PATH);
        }
        this.location = location;
    }

    /**
     * Fill the OAuth2Configuration instance with the values found in the discovery response.
     *
     * @param conf the OAuth2Configuration.
     */
    public void autofill(OAuth2Configuration conf) {
        if (location == null) {
            LOGGER.warn("Discovery location is null; skipping autofill");
            return;
        }
        try {
            LOGGER.info("Fetching OIDC discovery document from {}", location);
            Map response = restTemplate.getForObject(this.location, Map.class);
            if (response == null) {
                LOGGER.error(
                        "OIDC discovery returned null from {}. Endpoints will not be auto-configured.",
                        location);
                return;
            }
            LOGGER.info(
                    "Discovery document received from {} with {} keys: {}",
                    location,
                    response.size(),
                    response.keySet());
            Optional.ofNullable(response.get(getAuthorizationEndpointAttrName()))
                    .ifPresent(
                            uri -> {
                                LOGGER.info("  authorization_endpoint = {}", uri);
                                conf.setAuthorizationUri((String) uri);
                            });
            Optional.ofNullable(response.get(getTokenEndpointAttrName()))
                    .ifPresent(
                            uri -> {
                                LOGGER.info("  token_endpoint = {}", uri);
                                conf.setAccessTokenUri((String) uri);
                            });
            Optional.ofNullable(response.get(getUserinfoEndpointAttrName()))
                    .ifPresent(
                            uri -> {
                                LOGGER.info("  userinfo_endpoint = {}", uri);
                                conf.setCheckTokenEndpointUrl((String) uri);
                            });
            Optional.ofNullable(response.get(getJwkSetUriAttrName()))
                    .ifPresent(
                            uri -> {
                                LOGGER.info("  jwks_uri = {}", uri);
                                conf.setIdTokenUri((String) uri);
                            });
            Optional.ofNullable(response.get(getEndSessionEndpoint()))
                    .ifPresent(
                            uri -> {
                                LOGGER.info("  end_session_endpoint = {}", uri);
                                conf.setLogoutUri((String) uri);
                            });
            Optional.ofNullable(response.get(getRevocationEndpoint()))
                    .ifPresent(
                            s -> {
                                LOGGER.info("  revocation_endpoint = {}", s);
                                conf.setRevokeEndpoint((String) s);
                            });
            Optional.ofNullable(response.get(getIntrospectionEndpoint()))
                    .ifPresent(
                            s -> {
                                LOGGER.info("  introspection_endpoint = {}", s);
                                conf.setIntrospectionEndpoint((String) s);
                            });
            if (conf.getScopes() == null || conf.getScopes().isEmpty()) {
                Optional.ofNullable(response.get(getScopesSupported()))
                        .ifPresent(
                                s -> {
                                    @SuppressWarnings("unchecked")
                                    List<String> scopes = (List<String>) s;
                                    conf.setScopes(collectScopes(scopes));
                                    LOGGER.info("  scopes_supported = {}", scopes);
                                });
            }
            LOGGER.info("OIDC discovery successful from {}", location);
        } catch (Exception e) {
            LOGGER.error(
                    "Failed to fetch OIDC discovery document from {}: {}. "
                            + "Endpoints (authorizationUri, accessTokenUri, etc.) will remain null. "
                            + "Login will fail with NullPointerException.",
                    location,
                    e.getMessage(),
                    e);
        }
    }

    private String collectScopes(List<String> scopes) {
        return String.join(",", scopes);
    }

    protected String getUserinfoEndpointAttrName() {
        return USERINFO_ENDPOINT_ATTR_NAME;
    }

    protected String getEndSessionEndpoint() {
        return END_SESSION_ENDPOINT;
    }

    protected String getJwkSetUriAttrName() {
        return JWK_SET_URI_ATTR_NAME;
    }

    protected String getProviderEndPath() {
        return PROVIDER_END_PATH;
    }

    protected String getAuthorizationEndpointAttrName() {
        return AUTHORIZATION_ENDPOINT_ATTR_NAME;
    }

    protected String getTokenEndpointAttrName() {
        return TOKEN_ENDPOINT_ATTR_NAME;
    }

    protected String getScopesSupported() {
        return SCOPES_SUPPORTED;
    }

    protected String getRevocationEndpoint() {
        return REVOCATION_ENDPOINT;
    }

    protected String getIntrospectionEndpoint() {
        return INTROSPECTION_ENDPOINT;
    }
}
