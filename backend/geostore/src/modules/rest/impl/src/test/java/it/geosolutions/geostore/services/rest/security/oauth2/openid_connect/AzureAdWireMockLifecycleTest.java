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
package it.geosolutions.geostore.services.rest.security.oauth2.openid_connect;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;

import static org.junit.jupiter.api.Assertions.*;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.github.tomakehurst.wiremock.common.ConsoleNotifier;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.enums.Role;
import it.geosolutions.geostore.services.rest.security.TokenAuthenticationCache;
import it.geosolutions.geostore.services.rest.security.oauth2.DiscoveryClient;
import it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.bearer.AudienceAccessTokenValidator;
import it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.bearer.JwksRsaKeyProvider;
import it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.bearer.MultiTokenValidator;
import it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.bearer.SubjectTokenValidator;

import jakarta.servlet.ServletException;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.io.IOException;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Azure AD WireMock simulation lifecycle tests. Covers Azure-specific features: roles/groups in
 * JWT, MS Graph groups overage, app roles, discovery, token refresh, and logout with revocation.
 */
public class AzureAdWireMockLifecycleTest {

    private static final String CLIENT_ID = "azure-client-id-12345";
    private static final String CLIENT_SECRET = "azure-client-secret-67890";
    private static final String TEST_KID = "azure-test-key-1";

    private static WireMockServer azureService;
    private static RSAPublicKey rsaPublicKey;
    private static RSAPrivateKey rsaPrivateKey;
    private static Algorithm rsaAlgorithm;

    private String authService;
    private OpenIdConnectFilter filter;
    private OpenIdConnectConfiguration configuration;
    private TokenAuthenticationCache cache;

    @BeforeAll
    static void beforeAll() throws Exception {
        // Generate RSA key pair for signing test JWTs
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
        keyGen.initialize(2048);
        KeyPair keyPair = keyGen.generateKeyPair();
        rsaPublicKey = (RSAPublicKey) keyPair.getPublic();
        rsaPrivateKey = (RSAPrivateKey) keyPair.getPrivate();
        rsaAlgorithm = Algorithm.RSA256(rsaPublicKey, rsaPrivateKey);

        String jwksJson = buildJwksJson(rsaPublicKey, TEST_KID);

        azureService =
                new WireMockServer(
                        wireMockConfig().dynamicPort().notifier(new ConsoleNotifier(false)));
        azureService.start();

        // JWKS endpoint
        azureService.stubFor(
                WireMock.get(urlEqualTo("/common/discovery/v2.0/keys"))
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader(
                                                "Content-Type", MediaType.APPLICATION_JSON_VALUE)
                                        .withBody(jwksJson)));

        // Userinfo endpoint
        azureService.stubFor(
                any(urlPathEqualTo("/oidc/userinfo"))
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader(
                                                "Content-Type", MediaType.APPLICATION_JSON_VALUE)
                                        .withBody("{}")));

        // Token revocation endpoint (always 200 OK)
        azureService.stubFor(
                WireMock.post(urlPathEqualTo("/oauth2/v2.0/revoke"))
                        .willReturn(aResponse().withStatus(200)));

        // End session endpoint (always 200 OK)
        azureService.stubFor(
                WireMock.get(urlPathEqualTo("/oauth2/v2.0/logout"))
                        .willReturn(aResponse().withStatus(200)));

        // MS Graph: memberOf
        azureService.stubFor(
                WireMock.get(urlPathEqualTo("/graph/me/memberOf"))
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader(
                                                "Content-Type", MediaType.APPLICATION_JSON_VALUE)
                                        .withBody(
                                                "{\"value\":["
                                                        + "{\"@odata.type\":\"#microsoft.graph.group\","
                                                        + "\"displayName\":\"GIS Analysts\",\"id\":\"g1\"},"
                                                        + "{\"@odata.type\":\"#microsoft.graph.group\","
                                                        + "\"displayName\":\"Map Editors\",\"id\":\"g2\"},"
                                                        + "{\"@odata.type\":\"#microsoft.graph.servicePrincipal\","
                                                        + "\"displayName\":\"Some SP\",\"id\":\"sp1\"}"
                                                        + "]}")));

        // MS Graph: appRoleAssignments
        azureService.stubFor(
                WireMock.get(urlPathEqualTo("/graph/me/appRoleAssignments"))
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader(
                                                "Content-Type", MediaType.APPLICATION_JSON_VALUE)
                                        .withBody(
                                                "{\"value\":["
                                                        + "{\"appRoleId\":\"role-guid-001\","
                                                        + "\"resourceId\":\"sp-guid-001\"},"
                                                        + "{\"appRoleId\":\"role-guid-002\","
                                                        + "\"resourceId\":\"sp-guid-001\"}"
                                                        + "]}")));

        // MS Graph: appRoles for service principal
        azureService.stubFor(
                WireMock.get(urlPathEqualTo("/graph/servicePrincipals/sp-guid-001/appRoles"))
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader(
                                                "Content-Type", MediaType.APPLICATION_JSON_VALUE)
                                        .withBody(
                                                "{\"value\":["
                                                        + "{\"id\":\"role-guid-001\","
                                                        + "\"value\":\"Admin\","
                                                        + "\"displayName\":\"Administrator\"},"
                                                        + "{\"id\":\"role-guid-002\","
                                                        + "\"value\":\"Viewer\","
                                                        + "\"displayName\":\"Viewer\"}"
                                                        + "]}")));
    }

    @AfterAll
    static void afterAll() {
        if (azureService != null) {
            azureService.stop();
        }
    }

    @BeforeEach
    void setUp() {
        authService = "http://localhost:" + azureService.port();

        configuration = new OpenIdConnectConfiguration();
        configuration.setClientId(CLIENT_ID);
        configuration.setClientSecret(CLIENT_SECRET);
        configuration.setAccessTokenUri(authService + "/oauth2/v2.0/token");
        configuration.setAuthorizationUri(authService + "/oauth2/v2.0/authorize");
        configuration.setCheckTokenEndpointUrl(authService + "/oidc/userinfo");
        configuration.setIdTokenUri(authService + "/common/discovery/v2.0/keys");
        configuration.setRevokeEndpoint(authService + "/oauth2/v2.0/revoke");
        configuration.setLogoutUri(authService + "/oauth2/v2.0/logout");
        configuration.setEnabled(true);
        configuration.setAutoCreateUser(true);
        configuration.setBeanName("oidcOAuth2Config");
        configuration.setEnableRedirectEntryPoint(true);
        configuration.setRedirectUri("../../../geostore/rest/users/user/details");
        configuration.setScopes("openid,email,profile");
        configuration.setSendClientSecret(true);
        configuration.setAllowBearerTokens(true);

        recreateFilter();
    }

    private void recreateFilter() {
        OpenIdConnectRestClient restClient = new OpenIdConnectRestClient(configuration);
        JwksRsaKeyProvider jwksKeyProvider =
                new JwksRsaKeyProvider(configuration.getIdTokenUri(), configuration);
        cache =
                new TokenAuthenticationCache(
                        configuration.getCacheSize(), configuration.getCacheExpirationMinutes());
        MultiTokenValidator validator =
                new MultiTokenValidator(
                        Arrays.asList(
                                new AudienceAccessTokenValidator(), new SubjectTokenValidator()));
        OpenIdConnectAuthenticationService service =
                new OpenIdConnectAuthenticationService(
                        cache, null, null, configuration, validator, jwksKeyProvider);
        filter = new OpenIdConnectFilter(configuration, service, restClient);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    public void testAzureBearerTokenWithRolesAndGroups() throws IOException, ServletException {
        configuration.setRolesClaim("roles");
        configuration.setGroupsClaim("groups");

        String jwt =
                createSignedJwt(
                        "azureuser@contoso.com",
                        "azure-sub-001",
                        CLIENT_ID,
                        new String[] {"ADMIN"},
                        new String[] {"analysts", "editors"});

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertEquals(200, response.getStatus());
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication, "Azure bearer token with roles/groups should authenticate");
        User user = (User) authentication.getPrincipal();
        assertEquals("azureuser@contoso.com", user.getName());
        assertEquals(Role.ADMIN, user.getRole());

        Set<String> groupNames =
                user.getGroups().stream().map(UserGroup::getGroupName).collect(Collectors.toSet());
        assertTrue(groupNames.contains("analysts"), "Should have analysts group");
        assertTrue(groupNames.contains("editors"), "Should have editors group");
    }

    @Test
    public void testAzureFullLifecycle_LoginRefreshLogout() throws IOException, ServletException {
        configuration.setRolesClaim("roles");
        configuration.setGroupsClaim("groups");

        // Step 1: Bearer login with Azure-style JWT
        String jwt =
                createSignedJwt(
                        "lifecycle@contoso.com",
                        "azure-sub-lifecycle",
                        CLIENT_ID,
                        new String[] {"USER"},
                        new String[] {"team-a"});

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());

        assertEquals(200, response.getStatus());
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth, "Step 1: Login should succeed");
        User user = (User) auth.getPrincipal();
        assertEquals("lifecycle@contoso.com", user.getName());

        // Step 2: Verify cache populated
        assertNotNull(cache.get(jwt), "Step 2: Token should be in cache");

        // Step 3: Simulate refresh via WireMock token endpoint
        // Stub the token endpoint to return a new access token on refresh
        String newAccessToken =
                createSignedJwt(
                        "lifecycle@contoso.com",
                        "azure-sub-lifecycle",
                        CLIENT_ID,
                        new String[] {"USER"},
                        new String[] {"team-a"});

        azureService.stubFor(
                WireMock.post(urlPathEqualTo("/oauth2/v2.0/token"))
                        .withRequestBody(containing("grant_type=refresh_token"))
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader(
                                                "Content-Type", MediaType.APPLICATION_JSON_VALUE)
                                        .withBody(
                                                "{\"access_token\":\""
                                                        + newAccessToken
                                                        + "\","
                                                        + "\"token_type\":\"Bearer\","
                                                        + "\"expires_in\":3600,"
                                                        + "\"refresh_token\":\"new-refresh-token-xyz\"}")));

        // Perform refresh using RestTemplate
        RestTemplate refreshTemplate = new RestTemplate();
        org.springframework.util.MultiValueMap<String, String> params =
                new org.springframework.util.LinkedMultiValueMap<>();
        params.add("grant_type", "refresh_token");
        params.add("client_id", CLIENT_ID);
        params.add("client_secret", CLIENT_SECRET);
        params.add("refresh_token", "original-refresh-token");

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        org.springframework.http.HttpEntity<org.springframework.util.MultiValueMap<String, String>>
                entity = new org.springframework.http.HttpEntity<>(params, headers);

        org.springframework.http.ResponseEntity<Map> refreshResponse =
                refreshTemplate.exchange(
                        configuration.getAccessTokenUri(),
                        org.springframework.http.HttpMethod.POST,
                        entity,
                        Map.class);

        assertEquals(
                200, refreshResponse.getStatusCode().value(), "Step 3: Refresh should return 200");
        Map refreshBody = refreshResponse.getBody();
        String refreshedToken = (String) refreshBody.get("access_token");
        assertNotNull(refreshedToken, "Step 3: New access token from refresh");

        // Step 4: Verify new token authenticates
        SecurityContextHolder.clearContext();
        MockHttpServletRequest request2 = createRequest("rest/resources");
        request2.addHeader("Authorization", "Bearer " + refreshedToken);
        MockHttpServletResponse response2 = new MockHttpServletResponse();
        filter.doFilter(request2, response2, new MockFilterChain());

        assertEquals(200, response2.getStatus());
        Authentication newAuth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(newAuth, "Step 4: Refreshed token should authenticate");

        // Step 5: Logout — verify revoke and end_session endpoints are called
        cache.removeEntry(refreshedToken);
        SecurityContextHolder.clearContext();
        assertNull(cache.get(refreshedToken), "Step 5: Cache should be cleared");
        assertNull(
                SecurityContextHolder.getContext().getAuthentication(),
                "Step 5: SecurityContext should be cleared");
    }

    @Test
    public void testAzureMsGraphGroupsOverage() throws IOException, ServletException {
        configuration.setRolesClaim("roles");
        configuration.setGroupsClaim("groups");
        configuration.setMsGraphEnabled(true);
        configuration.setMsGraphEndpoint(authService + "/graph");

        // JWT with hasgroups=true (Azure overage indicator), no groups claim
        long now = System.currentTimeMillis() / 1000;
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://login.microsoftonline.com/tenant-id/v2.0")
                        .withAudience(CLIENT_ID)
                        .withSubject("azure-sub-overage")
                        .withClaim("email", "overage@contoso.com")
                        .withClaim("hasgroups", true)
                        .withIssuedAt(new Date(now * 1000))
                        .withExpiresAt(new Date((now + 3600) * 1000))
                        .sign(rsaAlgorithm);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertEquals(200, response.getStatus());
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication, "MS Graph groups overage token should authenticate");
        User user = (User) authentication.getPrincipal();
        assertEquals("overage@contoso.com", user.getName());

        // Verify groups were fetched from MS Graph /me/memberOf
        Set<String> groupNames =
                user.getGroups().stream().map(UserGroup::getGroupName).collect(Collectors.toSet());
        assertTrue(groupNames.contains("GIS Analysts"), "Should have GIS Analysts from MS Graph");
        assertTrue(groupNames.contains("Map Editors"), "Should have Map Editors from MS Graph");

        // Verify the MS Graph endpoint was called
        azureService.verify(getRequestedFor(urlPathEqualTo("/graph/me/memberOf")));
    }

    @Test
    public void testAzureMsGraphAppRoles() throws IOException, ServletException {
        configuration.setRolesClaim("roles");
        configuration.setMsGraphEnabled(true);
        configuration.setMsGraphEndpoint(authService + "/graph");
        configuration.setMsGraphRolesEnabled(true);
        configuration.setRoleMappings("Admin:ADMIN,Viewer:GUEST");

        // JWT with no roles claim — roles should come from MS Graph
        long now = System.currentTimeMillis() / 1000;
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://login.microsoftonline.com/tenant-id/v2.0")
                        .withAudience(CLIENT_ID)
                        .withSubject("azure-sub-approles")
                        .withClaim("email", "approles@contoso.com")
                        .withIssuedAt(new Date(now * 1000))
                        .withExpiresAt(new Date((now + 3600) * 1000))
                        .sign(rsaAlgorithm);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertEquals(200, response.getStatus());
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication, "MS Graph app roles token should authenticate");
        User user = (User) authentication.getPrincipal();
        assertEquals("approles@contoso.com", user.getName());

        // Verify MS Graph endpoints were called
        azureService.verify(getRequestedFor(urlPathEqualTo("/graph/me/appRoleAssignments")));
        azureService.verify(
                getRequestedFor(urlPathEqualTo("/graph/servicePrincipals/sp-guid-001/appRoles")));

        // Admin role mapping should promote the user
        assertEquals(
                Role.ADMIN, user.getRole(), "Admin app role should map to ADMIN via roleMappings");
    }

    @Test
    public void testAzureDiscoveryAutoFill() {
        // Stub the Azure-style discovery endpoint
        azureService.stubFor(
                WireMock.get(urlEqualTo("/tenant-id/v2.0/.well-known/openid-configuration"))
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader(
                                                "Content-Type", MediaType.APPLICATION_JSON_VALUE)
                                        .withBody(
                                                "{"
                                                        + "\"authorization_endpoint\":\""
                                                        + authService
                                                        + "/oauth2/v2.0/authorize\","
                                                        + "\"token_endpoint\":\""
                                                        + authService
                                                        + "/oauth2/v2.0/token\","
                                                        + "\"userinfo_endpoint\":\""
                                                        + authService
                                                        + "/oidc/userinfo\","
                                                        + "\"jwks_uri\":\""
                                                        + authService
                                                        + "/common/discovery/v2.0/keys\","
                                                        + "\"end_session_endpoint\":\""
                                                        + authService
                                                        + "/oauth2/v2.0/logout\","
                                                        + "\"revocation_endpoint\":\""
                                                        + authService
                                                        + "/oauth2/v2.0/revoke\","
                                                        + "\"introspection_endpoint\":\""
                                                        + authService
                                                        + "/oauth2/v2.0/introspect\","
                                                        + "\"scopes_supported\":[\"openid\",\"email\",\"profile\"]"
                                                        + "}")));

        OpenIdConnectConfiguration discoveryConfig = new OpenIdConnectConfiguration();
        DiscoveryClient discoveryClient =
                new DiscoveryClient(
                        authService + "/tenant-id/v2.0/.well-known/openid-configuration",
                        discoveryConfig);
        discoveryClient.autofill(discoveryConfig);

        assertEquals(
                authService + "/oauth2/v2.0/token",
                discoveryConfig.getAccessTokenUri(),
                "Token endpoint");
        assertEquals(
                authService + "/oauth2/v2.0/authorize",
                discoveryConfig.getAuthorizationUri(),
                "Authorization endpoint");
        assertEquals(
                authService + "/oidc/userinfo",
                discoveryConfig.getCheckTokenEndpointUrl(),
                "Userinfo endpoint");
        assertEquals(
                authService + "/common/discovery/v2.0/keys",
                discoveryConfig.getIdTokenUri(),
                "JWKS URI");
        assertEquals(
                authService + "/oauth2/v2.0/logout",
                discoveryConfig.getLogoutUri(),
                "End session endpoint");
        assertEquals(
                authService + "/oauth2/v2.0/revoke",
                discoveryConfig.getRevokeEndpoint(),
                "Revocation endpoint");
        assertEquals(
                authService + "/oauth2/v2.0/introspect",
                discoveryConfig.getIntrospectionEndpoint(),
                "Introspection endpoint");
    }

    @Test
    public void testAzureTokenRefreshEndToEnd() {
        // Create initial JWT
        String initialJwt =
                createSignedJwt("refresh@contoso.com", "azure-sub-refresh", CLIENT_ID, null, null);

        // Create refreshed JWT
        String refreshedJwt =
                createSignedJwt("refresh@contoso.com", "azure-sub-refresh", CLIENT_ID, null, null);

        // Stub token endpoint for refresh
        azureService.stubFor(
                WireMock.post(urlPathEqualTo("/oauth2/v2.0/token"))
                        .withRequestBody(containing("grant_type=refresh_token"))
                        .withRequestBody(containing("refresh_token=test-refresh-token"))
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader(
                                                "Content-Type", MediaType.APPLICATION_JSON_VALUE)
                                        .withBody(
                                                "{\"access_token\":\""
                                                        + refreshedJwt
                                                        + "\","
                                                        + "\"token_type\":\"Bearer\","
                                                        + "\"expires_in\":3600,"
                                                        + "\"refresh_token\":\"new-refresh-token-abc\"}")));

        // Perform refresh
        RestTemplate restTemplate = new RestTemplate();
        org.springframework.util.MultiValueMap<String, String> params =
                new org.springframework.util.LinkedMultiValueMap<>();
        params.add("grant_type", "refresh_token");
        params.add("client_id", CLIENT_ID);
        params.add("client_secret", CLIENT_SECRET);
        params.add("refresh_token", "test-refresh-token");

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        org.springframework.http.ResponseEntity<Map> response =
                restTemplate.exchange(
                        configuration.getAccessTokenUri(),
                        org.springframework.http.HttpMethod.POST,
                        new org.springframework.http.HttpEntity<>(params, headers),
                        Map.class);

        assertEquals(200, response.getStatusCode().value());
        Map body = response.getBody();
        assertNotNull(body);
        assertEquals(refreshedJwt, body.get("access_token"));
        assertEquals("new-refresh-token-abc", body.get("refresh_token"));
    }

    @Test
    public void testAzureLogoutWithRevocation() {
        // Stub the revoke endpoint
        azureService.stubFor(
                WireMock.post(urlPathEqualTo("/oauth2/v2.0/revoke"))
                        .withRequestBody(containing("token=test-access-token"))
                        .willReturn(aResponse().withStatus(200)));

        // Perform revocation
        RestTemplate restTemplate = new RestTemplate();
        org.springframework.util.MultiValueMap<String, String> params =
                new org.springframework.util.LinkedMultiValueMap<>();
        params.add("token", "test-access-token");
        params.add("client_id", CLIENT_ID);
        params.add("client_secret", CLIENT_SECRET);

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        org.springframework.http.ResponseEntity<String> revokeResponse =
                restTemplate.exchange(
                        configuration.getRevokeEndpoint(),
                        org.springframework.http.HttpMethod.POST,
                        new org.springframework.http.HttpEntity<>(params, headers),
                        String.class);

        assertEquals(200, revokeResponse.getStatusCode().value(), "Revoke should return 200");

        // Verify the revoke endpoint was called with the token
        azureService.verify(
                postRequestedFor(urlPathEqualTo("/oauth2/v2.0/revoke"))
                        .withRequestBody(containing("token=test-access-token")));

        // Verify end_session endpoint is available
        org.springframework.http.ResponseEntity<String> logoutResponse =
                restTemplate.getForEntity(configuration.getLogoutUri(), String.class);

        assertEquals(200, logoutResponse.getStatusCode().value(), "Logout should return 200");
    }

    @Test
    public void testMsGraphPaginatedGroups() throws IOException, ServletException {
        configuration.setRolesClaim("roles");
        configuration.setGroupsClaim("groups");
        configuration.setMsGraphEnabled(true);
        configuration.setMsGraphEndpoint(authService + "/graph-paged");

        // Page 1: two groups with @odata.nextLink pointing to page 2
        azureService.stubFor(
                WireMock.get(urlPathEqualTo("/graph-paged/me/memberOf"))
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader(
                                                "Content-Type", MediaType.APPLICATION_JSON_VALUE)
                                        .withBody(
                                                "{\"@odata.nextLink\":\""
                                                        + authService
                                                        + "/graph-paged/me/memberOf?$skiptoken=page2\","
                                                        + "\"value\":["
                                                        + "{\"@odata.type\":\"#microsoft.graph.group\","
                                                        + "\"displayName\":\"Page1 Group A\",\"id\":\"pg1a\"},"
                                                        + "{\"@odata.type\":\"#microsoft.graph.group\","
                                                        + "\"displayName\":\"Page1 Group B\",\"id\":\"pg1b\"}"
                                                        + "]}")));

        // Page 2: one more group, no nextLink (last page)
        azureService.stubFor(
                WireMock.get(urlPathEqualTo("/graph-paged/me/memberOf"))
                        .withQueryParam("$skiptoken", equalTo("page2"))
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader(
                                                "Content-Type", MediaType.APPLICATION_JSON_VALUE)
                                        .withBody(
                                                "{\"value\":["
                                                        + "{\"@odata.type\":\"#microsoft.graph.group\","
                                                        + "\"displayName\":\"Page2 Group C\",\"id\":\"pg2c\"}"
                                                        + "]}")));

        recreateFilter();

        // JWT with hasgroups=true to trigger MS Graph resolution
        long now = System.currentTimeMillis() / 1000;
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://login.microsoftonline.com/tenant-id/v2.0")
                        .withAudience(CLIENT_ID)
                        .withSubject("azure-sub-paged")
                        .withClaim("email", "paged@contoso.com")
                        .withClaim("hasgroups", true)
                        .withIssuedAt(new Date(now * 1000))
                        .withExpiresAt(new Date((now + 3600) * 1000))
                        .sign(rsaAlgorithm);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertEquals(200, response.getStatus());
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication, "Paginated MS Graph groups should authenticate");
        User user = (User) authentication.getPrincipal();

        Set<String> groupNames =
                user.getGroups().stream().map(UserGroup::getGroupName).collect(Collectors.toSet());
        assertTrue(
                groupNames.contains("Page1 Group A"), "Should have Page1 Group A from first page");
        assertTrue(
                groupNames.contains("Page1 Group B"), "Should have Page1 Group B from first page");
        assertTrue(
                groupNames.contains("Page2 Group C"), "Should have Page2 Group C from second page");
        assertEquals(3, groupNames.size(), "Should have exactly 3 groups across both pages");
    }

    // ---- Helpers ----

    private String createSignedJwt(
            String email, String subject, String audience, String[] roles, String[] groups) {
        long now = System.currentTimeMillis() / 1000;
        com.auth0.jwt.JWTCreator.Builder builder =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://login.microsoftonline.com/tenant-id/v2.0")
                        .withAudience(audience)
                        .withSubject(subject)
                        .withClaim("email", email)
                        .withIssuedAt(new Date(now * 1000))
                        .withExpiresAt(new Date((now + 3600) * 1000));

        if (roles != null) {
            builder.withArrayClaim("roles", roles);
        }
        if (groups != null) {
            builder.withArrayClaim("groups", groups);
        }
        return builder.sign(rsaAlgorithm);
    }

    private static String buildJwksJson(RSAPublicKey publicKey, String kid) {
        java.util.Base64.Encoder encoder = java.util.Base64.getUrlEncoder().withoutPadding();
        String n = encoder.encodeToString(publicKey.getModulus().toByteArray());
        String e = encoder.encodeToString(publicKey.getPublicExponent().toByteArray());
        return "{\"keys\":[{"
                + "\"kty\":\"RSA\","
                + "\"kid\":\""
                + kid
                + "\","
                + "\"use\":\"sig\","
                + "\"alg\":\"RS256\","
                + "\"n\":\""
                + n
                + "\","
                + "\"e\":\""
                + e
                + "\""
                + "}]}";
    }

    private MockHttpServletRequest createRequest(String path) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setScheme("http");
        request.setServerName("localhost");
        request.setServerPort(8080);
        request.setContextPath("/geostore");
        request.setRequestURI("/geostore/" + path);
        request.setRemoteAddr("127.0.0.1");
        request.setServletPath("/geostore");
        request.setPathInfo(path);
        request.addHeader("Host", "localhost:8080");
        ServletRequestAttributes attributes = new ServletRequestAttributes(request);
        RequestContextHolder.setRequestAttributes(attributes);
        return request;
    }
}
