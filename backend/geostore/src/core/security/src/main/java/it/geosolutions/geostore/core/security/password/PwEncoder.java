/*
 *  Copyright (C) 2007 - 2012 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.core.security.password;

import java.util.Locale;

/**
 * @author ETj <etj at geo-solutions.it>
 * @author Lorenzo Natali <lorenzo.natali at geo-solutions.it>
 */
public class PwEncoder {

    private static GeoStorePasswordEncoder encoder =
            new it.geosolutions.geostore.core.security.password.GeoStoreDigestPasswordEncoder();

    public static String encode(String msg) {
        return encoder.encodePassword(msg.toCharArray(), null);
    }

    public static String decode(String msg) {
        return encoder.decode(msg);
    }

    public static boolean isPasswordValid(String encPass, String rawPass) {
        return encoder.isPasswordValid(encPass, rawPass, null);
    }

    /**
     * Whether the pair is one of the former sample credentials, {@code admin}/{@code admin} or
     * {@code user}/{@code user}. The username is compared ignoring case and surrounding whitespace,
     * so variants that resolve to the same account are caught. The password is compared on its
     * letters and digits only, ignoring case, so variants such as {@code Admin}, {@code " ADMIN "}
     * or {@code a-d-m-i-n!} are caught as well.
     */
    public static boolean isLegacySamplePassword(String username, String rawPass) {
        if (username == null || rawPass == null) {
            return false;
        }
        String name = username.trim().toLowerCase(Locale.ROOT);
        return ("admin".equals(name) || "user".equals(name))
                && name.equals(lowerCaseLettersAndDigits(rawPass));
    }

    private static String lowerCaseLettersAndDigits(String value) {
        StringBuilder kept = new StringBuilder(value.length());
        value.codePoints()
                .filter(Character::isLetterOrDigit)
                .map(Character::toLowerCase)
                .forEach(kept::appendCodePoint);
        return kept.toString();
    }

    public static void setEncoder(GeoStorePasswordEncoder e) {
        encoder = e;
    }

    public static GeoStorePasswordEncoder getEncoder() {
        return encoder;
    }
}
