/* ====================================================================
 *
 * Copyright (C) 2025 GeoSolutions S.A.S.
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

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

import java.util.Map;

/**
 * Tests for {@link OAuth2Configuration#parseMappings(String)}, in particular the backslash escaping
 * needed for IdP role/group names that contain the {@code :} separator (e.g. Keycloak
 * permission-style roles like {@code landscape:read}).
 */
public class OAuth2ConfigurationMappingsTest {

    @Test
    void parsesSimpleMappings() {
        Map<String, String> map = OAuth2Configuration.parseMappings("admin:ADMIN,user:USER");
        assertEquals(2, map.size());
        assertEquals("ADMIN", map.get("ADMIN"));
        assertEquals("USER", map.get("USER"));
    }

    @Test
    void keysAreCaseInsensitive() {
        Map<String, String> map = OAuth2Configuration.parseMappings("Manage-Users:ADMIN");
        assertEquals("ADMIN", map.get("MANAGE-USERS"));
    }

    @Test
    void escapedColonInKey() {
        Map<String, String> map =
                OAuth2Configuration.parseMappings(
                        "landscape\\:read:landscape_con_due_punti,manage-users:manage-users");
        assertEquals(2, map.size());
        assertEquals("landscape_con_due_punti", map.get("LANDSCAPE:READ"));
        assertEquals("manage-users", map.get("MANAGE-USERS"));
    }

    @Test
    void escapedColonInValue() {
        Map<String, String> map =
                OAuth2Configuration.parseMappings("active-product\\:read:active-product\\:read");
        assertEquals(1, map.size());
        assertEquals("active-product:read", map.get("ACTIVE-PRODUCT:READ"));
    }

    @Test
    void unescapedValueKeepsTrailingColons() {
        // value is everything after the first unescaped colon
        Map<String, String> map = OAuth2Configuration.parseMappings("key:a:b");
        assertEquals("a:b", map.get("KEY"));
    }

    @Test
    void escapedCommaInKey() {
        Map<String, String> map = OAuth2Configuration.parseMappings("a\\,b:VALUE,c:D");
        assertEquals(2, map.size());
        assertEquals("VALUE", map.get("A,B"));
        assertEquals("D", map.get("C"));
    }

    @Test
    void malformedPairsAreSkipped() {
        Map<String, String> map = OAuth2Configuration.parseMappings("noseparator,ok:GOOD");
        assertEquals(1, map.size());
        assertEquals("GOOD", map.get("OK"));
    }

    @Test
    void nullAndEmptyReturnNull() {
        assertNull(OAuth2Configuration.parseMappings(null));
        assertNull(OAuth2Configuration.parseMappings("  "));
        assertNull(OAuth2Configuration.parseMappings("nopairs"));
    }

    @Test
    void mappingsRoundTripThroughSetters() {
        OAuth2Configuration config = new OAuth2Configuration();
        config.setRoleMappings("manage-users:ADMIN");
        config.setGroupMappings(
                "manage-users:manage-users,landscape\\:read:landscape_con_due_punti,default-roles-portal:infragri");
        assertEquals("ADMIN", config.getRoleMappings().get("MANAGE-USERS"));
        assertEquals("landscape_con_due_punti", config.getGroupMappings().get("LANDSCAPE:READ"));
        assertEquals("infragri", config.getGroupMappings().get("DEFAULT-ROLES-PORTAL"));
    }

    @Test
    void clientSecretIsMaskedInToString() {
        OAuth2Configuration config = new OAuth2Configuration();
        config.setClientId("client");
        config.setClientSecret("super-secret-value");
        assertFalse(
                config.toString().contains("super-secret-value"),
                "clientSecret must not appear in toString()");
    }
}
