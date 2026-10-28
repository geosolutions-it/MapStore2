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
package it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.enancher;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

public class ClientSecretRequestEnhancerTest {

    @Test
    public void testEnhanceAddsClientSecret() {
        ClientSecretRequestEnhancer enhancer = new ClientSecretRequestEnhancer();
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();

        enhancer.enhance(form, "my-secret-value");

        assertTrue(form.containsKey("client_secret"), "Form should contain client_secret");
        assertEquals(
                "my-secret-value",
                form.getFirst("client_secret"),
                "client_secret should match the supplied secret");
    }

    @Test
    public void testEnhanceOverwritesExistingSecret() {
        ClientSecretRequestEnhancer enhancer = new ClientSecretRequestEnhancer();
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("client_secret", "old-secret");

        enhancer.enhance(form, "new-secret");

        assertEquals(
                1, form.get("client_secret").size(), "Should have exactly one client_secret value");
        assertEquals(
                "new-secret",
                form.getFirst("client_secret"),
                "client_secret should be overwritten with the new value");
    }

    @Test
    public void testEnhanceSkipsBlankSecret() {
        ClientSecretRequestEnhancer enhancer = new ClientSecretRequestEnhancer();
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();

        enhancer.enhance(form, null);
        enhancer.enhance(form, "");

        assertFalse(
                form.containsKey("client_secret"),
                "client_secret should not be added for a blank secret");
    }
}
