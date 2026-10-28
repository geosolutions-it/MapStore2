/* ====================================================================
 *
 * Copyright (C) 2017 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.services.rest.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.www.BasicAuthenticationEntryPoint;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

/**
 * This Class wrap the AuthenticationEntryPoint to reply with forbidden for the /users/user/details
 * path. It is used to emulate the login without showing a WWW-Authenticate window in the browser
 *
 * @author Lorenzo Natali (lorenzo.natali at geo-solutions.it)
 */
public class RestAuthenticationEntryPoint extends BasicAuthenticationEntryPoint {
    private static final String LOGIN_PATH = "users/user/details";
    private static final String SESSION_LOGIN_PATH = "session/";
    private static final Logger LOGGER = LogManager.getLogger(RestAuthenticationEntryPoint.class);

    public static final String OAUTH2_AUTH_ERROR_KEY = "oauth2.AuthError";

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException)
            throws IOException {
        URI url = null;
        try {
            url = new URI(request.getRequestURI());
        } catch (URISyntaxException e) {
            // TODO Auto-generated catch block
            LOGGER.error("Invalid URI:" + request.getRequestURI());
            super.commence(request, response, authException);
            return;
        }
        if (url == null) {
            super.commence(request, response, authException);
            return;
        }
        if (url.getPath().contains(LOGIN_PATH) || url.getPath().contains(SESSION_LOGIN_PATH)) {
            response.setHeader("WWW-Authenticate", "FormBased");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");

            String errorDetail = null;
            Object attrVal = request.getAttribute(OAUTH2_AUTH_ERROR_KEY);
            if (attrVal instanceof String) {
                errorDetail = (String) attrVal;
            }
            String message =
                    (errorDetail != null)
                            ? errorDetail
                            : (authException != null && authException.getMessage() != null)
                                    ? authException.getMessage()
                                    : "Authentication failed";

            LOGGER.warn("Authentication failed for {}: {}", url.getPath(), message);

            response.getWriter()
                    .write(
                            "{\"error\":\"unauthorized\",\"message\":\""
                                    + message.replace("\"", "\\\"")
                                    + "\"}");
            response.getWriter().flush();
        } else {
            super.commence(request, response, authException);
        }
    }
}
