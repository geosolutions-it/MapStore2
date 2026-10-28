/* ====================================================================
 *
 * Copyright (C) 2024-2025 GeoSolutions S.A.S.
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

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class ClaimPathResolverTest {

    // ----- toJsonPath -----

    @Test
    public void testToJsonPathDotNotation() {
        assertEquals("$.realm_access.roles", ClaimPathResolver.toJsonPath("realm_access.roles"));
    }

    @Test
    public void testToJsonPathAlreadyJsonPath() {
        assertEquals("$.realm_access.roles", ClaimPathResolver.toJsonPath("$.realm_access.roles"));
    }

    @Test
    public void testToJsonPathSimpleClaim() {
        assertEquals("$.roles", ClaimPathResolver.toJsonPath("roles"));
    }

    @Test
    public void testToJsonPathNull() {
        assertNull(ClaimPathResolver.toJsonPath(null));
    }

    // ----- resolve with dot-notation -----

    @Test
    public void testResolveDotNotationNested() {
        Map<String, Object> doc = new HashMap<>();
        Map<String, Object> realmAccess = new HashMap<>();
        realmAccess.put("roles", Arrays.asList("ADMIN", "user"));
        doc.put("realm_access", realmAccess);

        Object result = ClaimPathResolver.resolve(doc, "realm_access.roles");
        assertNotNull(result);
        assertTrue(result instanceof List);
        assertEquals(Arrays.asList("ADMIN", "user"), result);
    }

    @Test
    public void testResolveDotNotationDeeplyNested() {
        Map<String, Object> doc = new HashMap<>();
        Map<String, Object> resourceAccess = new HashMap<>();
        Map<String, Object> geostore = new HashMap<>();
        geostore.put("groups", Arrays.asList("analysts", "editors"));
        resourceAccess.put("geostore", geostore);
        doc.put("resource_access", resourceAccess);

        Object result = ClaimPathResolver.resolve(doc, "resource_access.geostore.groups");
        assertNotNull(result);
        assertTrue(result instanceof List);
        assertEquals(Arrays.asList("analysts", "editors"), result);
    }

    @Test
    public void testResolveTopLevel() {
        Map<String, Object> doc = new HashMap<>();
        doc.put("roles", Arrays.asList("USER"));

        Object result = ClaimPathResolver.resolve(doc, "roles");
        assertNotNull(result);
        assertEquals(Arrays.asList("USER"), result);
    }

    // ----- resolve with explicit JsonPath -----

    @Test
    public void testResolveExplicitJsonPath() {
        Map<String, Object> doc = new HashMap<>();
        Map<String, Object> realmAccess = new HashMap<>();
        realmAccess.put("roles", Arrays.asList("ADMIN", "user"));
        doc.put("realm_access", realmAccess);

        Object result = ClaimPathResolver.resolve(doc, "$.realm_access.roles");
        assertNotNull(result);
        assertEquals(Arrays.asList("ADMIN", "user"), result);
    }

    @Test
    public void testResolveArrayIndex() {
        Map<String, Object> doc = new HashMap<>();
        doc.put("roles", Arrays.asList("ADMIN", "USER", "GUEST"));

        Object result = ClaimPathResolver.resolve(doc, "$.roles[0]");
        assertEquals("ADMIN", result);
    }

    @Test
    public void testResolveWildcard() {
        Map<String, Object> doc = new HashMap<>();
        Map<String, Object> resourceAccess = new LinkedHashMap<>();

        Map<String, Object> app1 = new HashMap<>();
        app1.put("roles", Arrays.asList("role_a"));
        resourceAccess.put("app1", app1);

        Map<String, Object> app2 = new HashMap<>();
        app2.put("roles", Arrays.asList("role_b"));
        resourceAccess.put("app2", app2);

        doc.put("resource_access", resourceAccess);

        List<String> result = ClaimPathResolver.resolveAsList(doc, "$.resource_access.*.roles");
        assertNotNull(result);
        assertTrue(result.contains("role_a"), "Should contain role_a");
        assertTrue(result.contains("role_b"), "Should contain role_b");
    }

    @Test
    public void testResolveFilter() {
        Map<String, Object> doc = new HashMap<>();
        Map<String, Object> realmAccess = new HashMap<>();
        realmAccess.put("roles", Arrays.asList("ADMIN", "user", "offline_access"));
        doc.put("realm_access", realmAccess);

        Object result = ClaimPathResolver.resolve(doc, "$.realm_access.roles[?(@=='ADMIN')]");
        assertNotNull(result);
        assertTrue(result instanceof List);
        List<?> filtered = (List<?>) result;
        assertEquals(1, filtered.size());
        assertEquals("ADMIN", filtered.get(0));
    }

    // ----- resolveAsList -----

    @Test
    public void testResolveAsListFromList() {
        Map<String, Object> doc = new HashMap<>();
        doc.put("groups", Arrays.asList("analysts", "editors"));

        List<String> result = ClaimPathResolver.resolveAsList(doc, "groups");
        assertNotNull(result);
        assertEquals(Arrays.asList("analysts", "editors"), result);
    }

    @Test
    public void testResolveAsListFromSingleValue() {
        Map<String, Object> doc = new HashMap<>();
        doc.put("role", "ADMIN");

        List<String> result = ClaimPathResolver.resolveAsList(doc, "role");
        assertNotNull(result);
        assertEquals(Collections.singletonList("ADMIN"), result);
    }

    @Test
    public void testResolveAsListNull() {
        Map<String, Object> doc = new HashMap<>();
        doc.put("other", "value");

        List<String> result = ClaimPathResolver.resolveAsList(doc, "missing");
        assertNull(result);
    }

    // ----- case-insensitive -----

    @Test
    public void testResolveIgnoreCase() {
        Map<String, Object> doc = new HashMap<>();
        Map<String, Object> realmAccess = new HashMap<>();
        realmAccess.put("Roles", Arrays.asList("ADMIN"));
        doc.put("Realm_Access", realmAccess);

        Object result = ClaimPathResolver.resolveIgnoreCase(doc, "realm_access.roles");
        assertNotNull(result);
        assertTrue(result instanceof List);
        assertEquals(Arrays.asList("ADMIN"), result);
    }

    @Test
    public void testResolveAsListIgnoreCase() {
        Map<String, Object> doc = new HashMap<>();
        doc.put("Groups", Arrays.asList("dev", "ops"));

        List<String> result = ClaimPathResolver.resolveAsListIgnoreCase(doc, "groups");
        assertNotNull(result);
        assertEquals(Arrays.asList("dev", "ops"), result);
    }

    // ----- edge cases -----

    @Test
    public void testResolveNullDocument() {
        assertNull(ClaimPathResolver.resolve(null, "roles"));
    }

    @Test
    public void testResolveNullPath() {
        Map<String, Object> doc = new HashMap<>();
        doc.put("roles", "ADMIN");
        assertNull(ClaimPathResolver.resolve(doc, null));
    }

    @Test
    public void testResolveEmptyPath() {
        Map<String, Object> doc = new HashMap<>();
        doc.put("roles", "ADMIN");
        assertNull(ClaimPathResolver.resolve(doc, ""));
    }

    @Test
    public void testResolveMissingKey() {
        Map<String, Object> doc = new HashMap<>();
        doc.put("roles", "ADMIN");
        assertNull(ClaimPathResolver.resolve(doc, "groups"));
    }

    @Test
    public void testResolveEmptyDocument() {
        assertNull(ClaimPathResolver.resolve(new HashMap<>(), "roles"));
    }

    // ----- toStringList edge cases -----

    @Test
    public void testToStringListNull() {
        assertNull(ClaimPathResolver.toStringList(null));
    }

    @Test
    public void testToStringListEmptyList() {
        List<String> result = ClaimPathResolver.toStringList(Collections.emptyList());
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    public void testToStringListIntegerValues() {
        List<String> result = ClaimPathResolver.toStringList(Arrays.asList(1, 2, 3));
        assertNotNull(result);
        assertEquals(Arrays.asList("1", "2", "3"), result);
    }
}
