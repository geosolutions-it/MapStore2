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

import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;

import java.util.Collections;

/**
 * Adds the {@code client_secret} parameter to an authorization-code token request form. Replaces
 * the legacy {@code spring-security-oauth2} {@code RequestEnhancer} implementation; the token
 * exchange is now a direct form POST performed by {@code OpenIdConnectRestClient}.
 */
public class ClientSecretRequestEnhancer {

    /** {@code client_secret} - used in Token Request. */
    public static final String CLIENT_SECRET = "client_secret";

    public void enhance(MultiValueMap<String, String> form, String clientSecret) {
        if (StringUtils.hasText(clientSecret)) {
            form.put(CLIENT_SECRET, Collections.singletonList(clientSecret));
        }
    }
}
