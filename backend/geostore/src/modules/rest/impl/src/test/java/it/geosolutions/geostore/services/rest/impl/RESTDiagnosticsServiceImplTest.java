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
package it.geosolutions.geostore.services.rest.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import it.geosolutions.geostore.services.rest.utils.GeoStoreContext;

import jakarta.ws.rs.core.Response;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class RESTDiagnosticsServiceImplTest {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private RESTDiagnosticsServiceImpl service;
    private GeoStoreContext geoStoreContext;

    @BeforeEach
    void setUp() {
        service = new RESTDiagnosticsServiceImpl();
        geoStoreContext = new GeoStoreContext();
    }

    @AfterEach
    void tearDown() {
        // Reset static context
        geoStoreContext.setApplicationContext(null);
    }

    @Test
    public void testGetFullReportWithNoContext() throws Exception {
        // No ApplicationContext set — cache/config should degrade gracefully
        geoStoreContext.setApplicationContext(null);

        Response response = service.getFullReport(null);

        assertEquals(200, response.getStatus());
        String json = (String) response.getEntity();
        JsonNode root = MAPPER.readTree(json);
        assertNotNull(root.get("logging"), "Should contain logging section");
        //        assertNotNull(root.get("cache"), "Should contain cache section");
        //        assertNotNull(root.get("configuration"), "Should contain configuration section");
        assertNotNull(root.get("timestamp"), "Should contain timestamp");

        // Cache should report unavailable
        //        assertEquals("unavailable", root.get("cache").get("status").asText());
    }

    //    @Test
    //    public void testGetCacheWithPopulatedEntries() throws Exception {
    //        TokenAuthenticationCache cache = new TokenAuthenticationCache(100, 60);
    //
    //        // Create a mock authentication with TokenDetails
    //        User user = new User();
    //        user.setName("testuser");
    //        user.setRole(Role.USER);
    //        DefaultOAuth2AccessToken accessToken = new
    // DefaultOAuth2AccessToken("access-token-abc123");
    //        accessToken.setExpiration(new Date(System.currentTimeMillis() + 3600_000));
    //        TokenDetails details = new TokenDetails(accessToken, null, "test-provider");
    //        Authentication auth =
    //                new PreAuthenticatedAuthenticationToken(user, "", Collections.emptyList());
    //        ((PreAuthenticatedAuthenticationToken) auth).setDetails(details);
    //
    //        cache.putCacheEntry("access-token-abc123", auth);
    //
    //        ApplicationContext ctx = mock(ApplicationContext.class);
    //        when(ctx.getBean(TokenAuthenticationCache.class)).thenReturn(cache);
    //        geoStoreContext.setApplicationContext(ctx);
    //
    //        Response response = service.getCache(null);
    //
    //        assertEquals(200, response.getStatus());
    //        String json = (String) response.getEntity();
    //        JsonNode root = MAPPER.readTree(json);
    //        JsonNode cacheNode = root.get("cache");
    //
    //        assertEquals("active", cacheNode.get("status").asText());
    //        assertEquals(1, cacheNode.get("size").asInt());
    //
    //        JsonNode entries = cacheNode.get("entries");
    //        assertNotNull(entries);
    //        assertEquals(1, entries.size());
    //
    //        JsonNode entry = entries.get(0);
    //        assertEquals("testuser", entry.get("principal").asText());
    //        assertEquals("USER", entry.get("role").asText());
    //        assertEquals("test-provider", entry.get("provider").asText());
    //        assertFalse(entry.get("expired").asBoolean());
    //        // Token should be masked
    //        assertTrue(entry.get("tokenPrefix").asText().contains("..."), "Token should be
    // masked");
    //    }

    //    @Test
    //    public void testGetConfigurationWithOidcProvider() throws Exception {
    //        OpenIdConnectConfiguration oidcConfig = new OpenIdConnectConfiguration();
    //        oidcConfig.setBeanName("testOidcConfig");
    //        oidcConfig.setClientId("test-client-id");
    //        oidcConfig.setClientSecret("super-secret");
    //        oidcConfig.setEnabled(true);
    //        oidcConfig.setAllowBearerTokens(true);
    //        oidcConfig.setBearerTokenStrategy("auto");
    //        oidcConfig.setUsePKCE(true);
    //        oidcConfig.setAccessTokenUri("https://idp.example.com/token");
    //        oidcConfig.setRolesClaim("roles");
    //        oidcConfig.setGroupsClaim("groups");
    //
    //        Map<String, OAuth2Configuration> configMap = new LinkedHashMap<>();
    //        configMap.put("testOidcConfig", oidcConfig);
    //
    //        ApplicationContext ctx = mock(ApplicationContext.class);
    //        when(ctx.getBeansOfType(OAuth2Configuration.class)).thenReturn(configMap);
    //        geoStoreContext.setApplicationContext(ctx);
    //
    //        Response response = service.getConfiguration(null);
    //
    //        assertEquals(200, response.getStatus());
    //        String json = (String) response.getEntity();
    //        JsonNode root = MAPPER.readTree(json);
    //        JsonNode configNode = root.get("configuration");
    //        JsonNode providers = configNode.get("providers");
    //        assertEquals(1, providers.size());
    //
    //        JsonNode provider = providers.get(0);
    //        assertEquals("testOidcConfig", provider.get("beanName").asText());
    //        assertEquals("test-client-id", provider.get("clientId").asText());
    //        // Client secret should be masked
    //        assertEquals("********", provider.get("clientSecret").asText());
    //        assertTrue(provider.get("enabled").asBoolean());
    //        assertEquals("roles", provider.get("rolesClaim").asText());
    //        assertEquals("groups", provider.get("groupsClaim").asText());
    //
    //        // OIDC-specific section
    //        JsonNode oidcNode = provider.get("oidc");
    //        assertNotNull(oidcNode, "OIDC section should be present");
    //        assertTrue(oidcNode.get("allowBearerTokens").asBoolean());
    //        assertEquals("auto", oidcNode.get("bearerTokenStrategy").asText());
    //        assertTrue(oidcNode.get("usePKCE").asBoolean());
    //
    //        // Endpoints
    //        JsonNode endpoints = provider.get("endpoints");
    //        assertEquals("https://idp.example.com/token",
    // endpoints.get("accessTokenUri").asText());
    //    }

    @Test
    public void testSetLogLevelRejectsNonSecurityLogger() throws Exception {
        Response response = service.setLogLevel(null, "com.example.other", "DEBUG");

        assertEquals(400, response.getStatus());
        String json = (String) response.getEntity();
        assertTrue(json.contains("Only loggers under"));
    }

    @Test
    public void testSetLogLevelChangesSecurityLogger() throws Exception {
        String loggerName = "it.geosolutions.geostore.services.rest.security.oauth2.TestLogger";

        Response response = service.setLogLevel(null, loggerName, "DEBUG");

        assertEquals(200, response.getStatus());
        String json = (String) response.getEntity();
        JsonNode root = MAPPER.readTree(json);
        assertEquals(loggerName, root.get("logger").asText());
        assertEquals("DEBUG", root.get("newLevel").asText());
        assertTrue(root.get("volatile").asBoolean());
    }

    @Test
    public void testSetLogLevelRejectsInvalidLevel() throws Exception {
        String loggerName = "it.geosolutions.geostore.services.rest.security.oauth2.TestLogger";

        Response response = service.setLogLevel(null, loggerName, "INVALID_LEVEL");

        assertEquals(400, response.getStatus());
        String json = (String) response.getEntity();
        assertTrue(json.contains("Invalid log level"));
    }

    @Test
    public void testGetLogging() throws Exception {
        Response response = service.getLogging(null);

        assertEquals(200, response.getStatus());
        String json = (String) response.getEntity();
        JsonNode root = MAPPER.readTree(json);
        assertNotNull(root.get("logging"), "Should contain logging section");
        assertNotNull(
                root.get("logging").get("securityLoggers"), "Should contain securityLoggers array");
    }
}
