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

import it.geosolutions.geostore.services.rest.security.oauth2.OAuth2Utils;
import it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.enancher.ClientSecretRequestEnhancer;
import it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.enancher.PKCERequestEnhancer;

import jakarta.servlet.http.HttpServletRequest;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.FormHttpMessageConverter;
import org.springframework.security.oauth2.core.endpoint.OAuth2AccessTokenResponse;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.security.oauth2.core.http.converter.OAuth2AccessTokenResponseHttpMessageConverter;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;

/**
 * Per-provider OAuth2 HTTP client for OpenID Connect. Performs the authorization-code token
 * exchange and the refresh-token grant against the provider token endpoint.
 *
 * <p>Replaces the legacy {@code spring-security-oauth2} {@code OAuth2RestTemplate} / {@code
 * GeoStoreOAuthRestTemplate} machinery. The token-endpoint JSON is deserialized into a Spring
 * Security 7 {@link OAuth2AccessTokenResponse} via {@link
 * OAuth2AccessTokenResponseHttpMessageConverter} (the {@code id_token} is exposed in {@link
 * OAuth2AccessTokenResponse#getAdditionalParameters()}).
 */
public class OpenIdConnectRestClient {

    private static final Logger LOGGER = LogManager.getLogger(OpenIdConnectRestClient.class);

    private final OpenIdConnectConfiguration config;
    private final RestTemplate restTemplate;
    private final PKCERequestEnhancer pkceEnhancer;
    private final ClientSecretRequestEnhancer clientSecretEnhancer;

    public OpenIdConnectRestClient(OpenIdConnectConfiguration config) {
        this.config = config;
        this.restTemplate = buildRestTemplate(config);
        this.pkceEnhancer = new PKCERequestEnhancer(config);
        this.clientSecretEnhancer = new ClientSecretRequestEnhancer();
    }

    private static RestTemplate buildRestTemplate(OpenIdConnectConfiguration config) {
        RestTemplate rt = OAuth2Utils.protectedRestTemplate(config);
        rt.setMessageConverters(
                Arrays.asList(
                        new FormHttpMessageConverter(),
                        new OAuth2AccessTokenResponseHttpMessageConverter()));
        return rt;
    }

    /**
     * Exchanges an authorization code for tokens at the provider token endpoint.
     *
     * @param code the authorization code returned on the callback.
     * @param request the current request (used to recover the PKCE code_verifier from the session).
     * @return the token response.
     */
    public OAuth2AccessTokenResponse exchangeAuthorizationCode(
            String code, HttpServletRequest request) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add(OAuth2ParameterNames.GRANT_TYPE, "authorization_code");
        form.add(OAuth2ParameterNames.CODE, code);
        if (StringUtils.hasText(config.getRedirectUri())) {
            form.add(OAuth2ParameterNames.REDIRECT_URI, config.getRedirectUri());
        }
        if (StringUtils.hasText(config.getClientId())) {
            form.add(OAuth2ParameterNames.CLIENT_ID, config.getClientId());
        }
        // Mirror the legacy enhancer chain: with PKCE add code_verifier (+ client_secret iff
        // sendClientSecret); otherwise add client_secret iff sendClientSecret.
        if (config.isUsePKCE()) {
            pkceEnhancer.enhance(form, request);
        } else if (config.isSendClientSecret()) {
            clientSecretEnhancer.enhance(form, config.getClientSecret());
        }
        LOGGER.debug("Exchanging authorization code at {}", config.getAccessTokenUri());
        return postForToken(form);
    }

    /**
     * Refreshes an access token using a refresh token. The legacy {@code OAuth2RestTemplate} always
     * sent the client secret on refresh (independent of {@code sendClientSecret}); that behavior is
     * preserved here.
     *
     * @param refreshToken the refresh token value.
     * @return the token response.
     */
    public OAuth2AccessTokenResponse refreshAccessToken(String refreshToken) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add(OAuth2ParameterNames.GRANT_TYPE, "refresh_token");
        form.add(OAuth2ParameterNames.REFRESH_TOKEN, refreshToken);
        if (StringUtils.hasText(config.getClientId())) {
            form.add(OAuth2ParameterNames.CLIENT_ID, config.getClientId());
        }
        if (StringUtils.hasText(config.getClientSecret())) {
            form.add(ClientSecretRequestEnhancer.CLIENT_SECRET, config.getClientSecret());
        }
        LOGGER.debug("Refreshing access token at {}", config.getAccessTokenUri());
        return postForToken(form);
    }

    private OAuth2AccessTokenResponse postForToken(MultiValueMap<String, String> form) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(form, headers);
        ResponseEntity<OAuth2AccessTokenResponse> response =
                restTemplate.exchange(
                        config.getAccessTokenUri(),
                        HttpMethod.POST,
                        entity,
                        OAuth2AccessTokenResponse.class);
        return response.getBody();
    }

    public OpenIdConnectConfiguration getConfiguration() {
        return config;
    }
}
