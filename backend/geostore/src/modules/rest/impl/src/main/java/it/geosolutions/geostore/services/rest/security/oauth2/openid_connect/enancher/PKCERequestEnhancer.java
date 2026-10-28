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
package it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.enancher;

import it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.OpenIdConnectConfiguration;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.security.oauth2.core.endpoint.PkceParameterNames;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;

import java.util.Collections;

/**
 * Enhances authorization-code token requests with the previously generated {@code code_verifier}
 * (PKCE) and, when {@code sendClientSecret} is enabled, the {@code client_secret}. The verifier is
 * the one stored in the HTTP session by the PKCE authentication entry point (see {@link
 * OpenIdConnectConfiguration#getAuthenticationEntryPoint()}).
 */
public class PKCERequestEnhancer {

    private static final Logger LOGGER = LogManager.getLogger(PKCERequestEnhancer.class);

    private final OpenIdConnectConfiguration config;

    public PKCERequestEnhancer(OpenIdConnectConfiguration oidcConfig) {
        this.config = oidcConfig;
    }

    public void enhance(MultiValueMap<String, String> form, HttpServletRequest request) {
        if (config.isSendClientSecret() && StringUtils.hasText(config.getClientSecret())) {
            form.put(
                    ClientSecretRequestEnhancer.CLIENT_SECRET,
                    Collections.singletonList(config.getClientSecret()));
        }
        if (config.isUsePKCE()) {
            String codeVerifier = retrieveVerifierFromSession(request);
            LOGGER.debug(
                    "PKCE: code_verifier {} in session, {} to token request",
                    StringUtils.hasText(codeVerifier) ? "found" : "NOT FOUND",
                    StringUtils.hasText(codeVerifier) ? "adding" : "NOT adding");
            if (StringUtils.hasText(codeVerifier)) {
                form.put(PkceParameterNames.CODE_VERIFIER, Collections.singletonList(codeVerifier));
            }
        }
    }

    private String retrieveVerifierFromSession(HttpServletRequest request) {
        try {
            if (request == null) return null;
            HttpSession session = request.getSession(false);
            if (session == null) return null;
            String verifier =
                    (String)
                            session.getAttribute(
                                    OpenIdConnectConfiguration.PKCE_CODE_VERIFIER_SESSION_ATTR);
            if (verifier != null) {
                session.removeAttribute(OpenIdConnectConfiguration.PKCE_CODE_VERIFIER_SESSION_ATTR);
                return verifier;
            }
        } catch (Exception e) {
            LOGGER.debug("Could not retrieve PKCE code_verifier from session", e);
        }
        return null;
    }
}
