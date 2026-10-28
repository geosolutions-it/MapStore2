/* ====================================================================
 *
 * Copyright (C) 2022 GeoSolutions S.A.S.
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

import jakarta.ws.rs.core.Cookie;
import jakarta.ws.rs.core.NewCookie;

import java.util.Date;

/** Cookie class to allow an easy setting of the SameSite cookie part. */
public class AccessCookie extends NewCookie {

    private final String sameSite;

    public AccessCookie(
            Cookie cookie, String comment, int maxAge, boolean secure, String sameSite) {
        super(cookie, comment, maxAge, secure);
        this.sameSite = sameSite;
    }

    public AccessCookie(
            Cookie cookie,
            String comment,
            int maxAge,
            Date expiry,
            boolean secure,
            boolean httpOnly,
            String sameSite) {
        super(cookie, comment, maxAge, expiry, secure, httpOnly);
        this.sameSite = sameSite;
    }

    @Override
    public String toString() {
        String cookie = super.toString();
        if (sameSite != null) cookie = cookie.concat(";").concat("SameSite=").concat(sameSite);
        return cookie;
    }
}
