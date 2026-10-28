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

import it.geosolutions.geostore.services.rest.security.oauth2.DiscoveryClient;
import it.geosolutions.geostore.services.rest.security.oauth2.OAuth2GeoStoreAuthenticationFilter;
import it.geosolutions.geostore.services.rest.security.oauth2.OAuth2Utils;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.core.endpoint.OAuth2AccessTokenResponse;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

import java.io.IOException;
import java.util.Map;

/**
 * OpenID Connect filter. Bearer-token authentication is delegated to the base filter (and the
 * {@link OpenIdConnectAuthenticationService}); the interactive authorization-code callback is
 * handled here by exchanging the code for tokens via {@link OpenIdConnectRestClient} and completing
 * the GeoStore authentication.
 */
public class OpenIdConnectFilter extends OAuth2GeoStoreAuthenticationFilter {

    private static final Logger LOGGER = LogManager.getLogger(OpenIdConnectFilter.class);

    private final OpenIdConnectAuthenticationService oidcService;
    private final OpenIdConnectRestClient restClient;

    public OpenIdConnectFilter(
            OpenIdConnectConfiguration configuration,
            OpenIdConnectAuthenticationService authenticationService,
            OpenIdConnectRestClient restClient) {
        super(configuration, authenticationService);
        if (StringUtils.hasText(configuration.getDiscoveryUrl())) {
            new DiscoveryClient(configuration.getDiscoveryUrl(), configuration)
                    .autofill(configuration);
        }
        this.oidcService = authenticationService;
        this.restClient = restClient;
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        Authentication existing = SecurityContextHolder.getContext().getAuthentication();
        if (existing == null && configuration.isEnabled() && !configuration.isInvalid()) {
            String code = OAuth2Utils.getParameterValue("code", request);
            if (StringUtils.hasText(code)) {
                handleAuthorizationCodeCallback(request, response, code);
            }
        }

        // Bearer-token authentication + request-attribute population + chaining happen in the base.
        super.doFilter(req, res, chain);
    }

    private void handleAuthorizationCodeCallback(
            HttpServletRequest request, HttpServletResponse response, String code) {
        try {
            request.setAttribute(OAUTH2_AUTHENTICATION_TYPE_KEY, OAuth2AuthenticationType.USER);

            OAuth2AccessTokenResponse tokenResponse =
                    restClient.exchangeAuthorizationCode(code, request);
            if (tokenResponse == null) {
                LOGGER.error("OIDC: authorization-code exchange returned no token response");
                return;
            }

            OAuth2AccessToken accessToken = tokenResponse.getAccessToken();
            OAuth2RefreshToken refreshToken = tokenResponse.getRefreshToken();
            String idToken = extractIdToken(tokenResponse);

            // Stash the id_token at request scope so OAuth2Utils.getIdToken() can resolve it during
            // principal extraction (the generic flow prefers the ID token for claims).
            if (idToken != null) {
                RequestAttributes attrs = RequestContextHolder.getRequestAttributes();
                if (attrs != null) {
                    attrs.setAttribute(
                            OAuth2Utils.ID_TOKEN_VALUE, idToken, RequestAttributes.SCOPE_REQUEST);
                } else {
                    request.setAttribute(OAuth2Utils.ID_TOKEN_VALUE, idToken);
                }
            }

            Authentication authentication =
                    oidcService.completeInteractiveAuthentication(
                            request, response, accessToken, refreshToken);
            if (authentication != null) {
                SecurityContextHolder.getContext().setAuthentication(authentication);
                LOGGER.info("OIDC: interactive authentication completed for the callback request");
            } else {
                LOGGER.warn("OIDC: interactive authentication produced no Authentication");
            }
        } catch (Exception e) {
            LOGGER.error("OIDC: authorization-code callback failed: {}", e.getMessage(), e);
        }
    }

    private String extractIdToken(OAuth2AccessTokenResponse tokenResponse) {
        Map<String, Object> additional = tokenResponse.getAdditionalParameters();
        if (additional != null) {
            Object idToken = additional.get(OAuth2Utils.ID_TOKEN_PARAM);
            if (idToken != null) {
                return String.valueOf(idToken);
            }
        }
        return null;
    }
}
