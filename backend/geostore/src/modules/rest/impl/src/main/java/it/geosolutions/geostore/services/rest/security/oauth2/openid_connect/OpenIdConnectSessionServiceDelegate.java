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

import it.geosolutions.geostore.services.UserService;
import it.geosolutions.geostore.services.rest.RESTSessionService;
import it.geosolutions.geostore.services.rest.security.oauth2.OAuth2SessionServiceDelegate;

/** OpenID Connect implementation of the {@link OAuth2SessionServiceDelegate}. */
public class OpenIdConnectSessionServiceDelegate extends OAuth2SessionServiceDelegate {

    public OpenIdConnectSessionServiceDelegate(
            RESTSessionService restSessionService, UserService userService, String providerName) {
        super(restSessionService, providerName, userService);
    }

    public OpenIdConnectSessionServiceDelegate(
            RESTSessionService restSessionService, UserService userService) {
        this(restSessionService, userService, "oidc");
    }
}
