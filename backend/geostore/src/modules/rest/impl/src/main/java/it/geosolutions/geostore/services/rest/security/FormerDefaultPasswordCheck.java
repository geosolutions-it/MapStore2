/*
 *  Copyright (C) 2026 GeoSolutions S.A.S.
 *  http://www.geo-solutions.it
 *
 *  GPLv3 + Classpath exception
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package it.geosolutions.geostore.services.rest.security;

import it.geosolutions.geostore.core.security.password.PwEncoder;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

/**
 * Refuses logins with the former default credentials {@code admin}/{@code admin} and {@code
 * user}/{@code user}, which are publicly known, including variants of the password that differ only
 * in case, spaces or punctuation (see {@link PwEncoder#isLegacySamplePassword(String, String)}).
 */
public final class FormerDefaultPasswordCheck {

    private static final Logger LOGGER = LogManager.getLogger(FormerDefaultPasswordCheck.class);

    /**
     * Environment variable holding the password GeoStore gives the {@code admin} account at startup
     * when that account is missing or still has its former default password.
     */
    public static final String INITIAL_ADMIN_PASSWORD_ENV = "INITIAL_ADMIN_PASSWORD";

    private FormerDefaultPasswordCheck() {}

    /**
     * Whether the login of {@code username}, whose password has just been verified as {@code
     * rawPassword}, must be refused because it is a former default password. Each refusal is logged
     * as a security error saying how to fix the account.
     */
    public static boolean refusesLogin(String username, String rawPassword) {
        if (!PwEncoder.isLegacySamplePassword(username, rawPassword)) {
            return false;
        }
        String name = username.trim();
        if ("admin".equalsIgnoreCase(name)) {
            LOGGER.error(
                    "SECURITY: login refused. A default password has been recognized for the user '{}'. Set the {} environment variable and restart GeoStore to initialize it correctly, or reset a correct password for '{}' in the database.",
                    name,
                    INITIAL_ADMIN_PASSWORD_ENV,
                    name);
        } else {
            LOGGER.error(
                    "SECURITY: login refused. A default password has been recognized for the user '{}'. Log in as an administrator (the {} environment variable initializes 'admin') and set a new password for '{}', or reset a correct password for it in the database.",
                    name,
                    INITIAL_ADMIN_PASSWORD_ENV,
                    name);
        }
        return true;
    }
}
