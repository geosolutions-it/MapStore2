/* ====================================================================
 *
 * Copyright (C) 2022-2025 GeoSolutions S.A.S.
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

import static it.geosolutions.geostore.services.rest.SessionServiceDelegate.PROVIDER_KEY;
import static it.geosolutions.geostore.services.rest.security.oauth2.OAuth2Utils.ACCESS_TOKEN_PARAM;
import static it.geosolutions.geostore.services.rest.security.oauth2.OAuth2Utils.ID_TOKEN_PARAM;
import static it.geosolutions.geostore.services.rest.security.oauth2.OAuth2Utils.REFRESH_TOKEN_PARAM;

import it.geosolutions.geostore.services.UserGroupService;
import it.geosolutions.geostore.services.UserService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.core.config.Configurator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.web.filter.GenericFilterBean;

import java.io.IOException;

/** GeoStore OAuth2 authentication filter. */
public abstract class OAuth2GeoStoreAuthenticationFilter extends GenericFilterBean {

    private static final Logger LOGGER =
            LogManager.getLogger(OAuth2GeoStoreAuthenticationFilter.class);

    public static final String OAUTH2_AUTHENTICATION_TYPE_KEY = "oauth2.authenticationType";

    /** Enum representing the type of OAuth2 authentication. */
    public enum OAuth2AuthenticationType {
        /** Bearer token authentication (existing access token in request headers) */
        BEARER,
        /** Interactive OAuth2 login authentication */
        USER;
    }

    private static final String SECURITY_LOGGER_NAME =
            "it.geosolutions.geostore.services.rest.security";

    private final OAuth2GeoStoreAuthenticationService authenticationService;
    private volatile boolean sensitiveLoggingConfigured = false;

    @Autowired protected UserService userService;
    @Autowired protected UserGroupService userGroupService;
    protected OAuth2Configuration configuration;

    protected OAuth2GeoStoreAuthenticationFilter(
            OAuth2Configuration configuration,
            OAuth2GeoStoreAuthenticationService authenticationService) {
        this.configuration = configuration;
        this.authenticationService = authenticationService;
    }

    public UserService getUserService() {
        return userService;
    }

    public void setUserService(UserService userService) {
        this.userService = userService;
    }

    public UserGroupService getUserGroupService() {
        return userGroupService;
    }

    public void setUserGroupService(UserGroupService userGroupService) {
        this.userGroupService = userGroupService;
    }

    public OAuth2Configuration getConfiguration() {
        return configuration;
    }

    public void setConfiguration(OAuth2Configuration configuration) {
        this.configuration = configuration;
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        configureSensitiveLogging();

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (configuration.isEnabled() && !configuration.isInvalid() && authentication == null) {

            String token = OAuth2Utils.tokenFromParamsOrBearer(ACCESS_TOKEN_PARAM, request);

            if (token != null) {
                request.setAttribute(
                        OAUTH2_AUTHENTICATION_TYPE_KEY, OAuth2AuthenticationType.BEARER);

                Authentication oauth2Authentication =
                        authenticationService.authenticate(token, request, response);

                if (oauth2Authentication != null) {
                    SecurityContextHolder.getContext().setAuthentication(oauth2Authentication);
                    authentication = oauth2Authentication;
                }
            } else {
                request.setAttribute(OAUTH2_AUTHENTICATION_TYPE_KEY, OAuth2AuthenticationType.USER);
                LOGGER.debug("No bearer token found in request; skipping bearer authentication");
            }
        }

        if (request != null) {
            addRequestAttributes(request, authentication);
        }

        if (configuration.isEnabled() && configuration.isInvalid()) {
            LOGGER.info(
                    "Skipping configured OAuth2 authentication. One or more mandatory properties are missing (clientId, clientSecret, authorizationUri, tokenUri).");
        }
        chain.doFilter(req, res);
    }

    private void configureSensitiveLogging() {
        if (!sensitiveLoggingConfigured && configuration.isLogSensitiveInfo()) {
            sensitiveLoggingConfigured = true;
            Configurator.setLevel(SECURITY_LOGGER_NAME, Level.DEBUG);
            LOGGER.warn(
                    "logSensitiveInfo is ENABLED for provider '{}'. "
                            + "Security logger '{}' set to DEBUG. "
                            + "Token contents and credentials may appear in logs. "
                            + "Do NOT use in production.",
                    configuration.getProvider(),
                    SECURITY_LOGGER_NAME);
        }
    }

    private void addRequestAttributes(HttpServletRequest request, Authentication authentication) {
        if (authentication != null) {

            TokenDetails tokenDetails = OAuth2Utils.getTokenDetails(authentication);

            if (tokenDetails != null && tokenDetails.getAccessToken() != null) {

                OAuth2AccessToken accessToken = tokenDetails.getAccessToken();

                request.setAttribute(ACCESS_TOKEN_PARAM, accessToken.getTokenValue());

                if (tokenDetails.getIdToken() != null) {
                    request.setAttribute(ID_TOKEN_PARAM, tokenDetails.getIdToken());
                }

                if (tokenDetails.getRefreshToken() != null) {
                    request.setAttribute(
                            REFRESH_TOKEN_PARAM, tokenDetails.getRefreshToken().getTokenValue());
                }

                request.setAttribute(PROVIDER_KEY, configuration.getProvider());
            }
        }
    }
}
