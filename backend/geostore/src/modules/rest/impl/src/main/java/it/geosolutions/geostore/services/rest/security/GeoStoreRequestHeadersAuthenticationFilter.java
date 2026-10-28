/* ====================================================================
 *
 * Copyright (C) 2015 GeoSolutions S.A.S.
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

import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

/**
 * Authentication filter for preauthentication through request headers.
 *
 * <p>An header for username and one for credentials/password (optional) are supported.
 *
 * <p>Automatic new user creation is supported, and in the case of user creation, attributes mapping
 * from headers is supported through a userMapper of type MapExpressionUserMapper.
 *
 * @author Mauro Bartolomeoli
 */
public class GeoStoreRequestHeadersAuthenticationFilter extends GeoStoreAuthenticationFilter {
    private String userNameHeader;
    private String credentialsHeader;

    public void setUserNameHeader(String userNameHeader) {
        this.userNameHeader = userNameHeader;
    }

    public void setCredentialsHeader(String credentialsHeader) {
        this.credentialsHeader = credentialsHeader;
    }

    @Override
    protected void authenticate(HttpServletRequest req) {
        String userName = req.getHeader(userNameHeader);
        if (userName != null) {
            String credentials = null;
            if (credentialsHeader != null) {
                credentials = req.getHeader(credentialsHeader);
                if (credentials.trim().isEmpty()) {
                    credentials = null;
                }
            }
            // create auth object with given user / credentials / attributes
            SecurityContextHolder.getContext()
                    .setAuthentication(
                            createAuthenticationForUser(userName, credentials, getHeadersMap(req)));
        }
    }

    /**
     * Transform headers into a map.
     *
     * @param req
     * @return
     */
    private Object getHeadersMap(HttpServletRequest req) {
        Map<String, String> headers = new HashMap<String, String>();
        Enumeration headerNames = req.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement().toString();
            headers.put(cleanHeaderName(headerName), req.getHeader(headerName));
        }
        return headers;
    }

    private String cleanHeaderName(String headerName) {
        // create  a good SpEL identifier
        return headerName.replaceAll("[^a-zA-Z0-9_$]", "_");
    }
}
