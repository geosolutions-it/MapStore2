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

import it.geosolutions.geostore.services.rest.security.oauth2.OAuth2Configuration;

import org.springframework.context.annotation.Configuration;

/**
 * Minimal configuration class kept for backward compatibility. The legacy
 * {@code @EnableOAuth2Client} annotation does not exist in Spring Security 7; all provider-specific
 * beans (configurations, filters, rest clients, caches) are created dynamically by {@link
 * OpenIdConnectProviderRegistrar} and {@link CompositeOpenIdConnectFilter}.
 */
@Configuration("oidcSecConfig")
public class OpenIdConnectSecurityConfiguration {

    public OAuth2Configuration configuration() {
        return new OpenIdConnectConfiguration();
    }
}
