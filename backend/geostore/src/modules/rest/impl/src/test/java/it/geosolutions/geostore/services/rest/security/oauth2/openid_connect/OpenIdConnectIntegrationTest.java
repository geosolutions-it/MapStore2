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

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;

import static org.junit.jupiter.api.Assertions.*;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.github.tomakehurst.wiremock.common.ConsoleNotifier;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.RSAEncrypter;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jwt.EncryptedJWT;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.enums.Role;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;
import it.geosolutions.geostore.services.rest.security.TokenAuthenticationCache;
import it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.bearer.AudienceAccessTokenValidator;
import it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.bearer.JwksRsaKeyProvider;
import it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.bearer.MultiTokenValidator;
import it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.bearer.SubjectTokenValidator;
import it.geosolutions.geostore.services.rest.utils.MockedUserService;

import jakarta.servlet.ServletException;

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
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.KeyStore;
import java.security.cert.X509Certificate;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;
import java.util.Date;
import java.util.Set;
import java.util.stream.Collectors;

public class OpenIdConnectIntegrationTest {

    private static final String CLIENT_ID = "kbyuFDidLLm280LIwVFiazOqjO3ty8KH";
    private static final String CLIENT_SECRET =
            "60Op4HFM0I8ajz0WdiStAbziZ-VFQttXuxixHHs2R7r7-CW8GR79l-mmLqMhc-Sa";
    private static final String CODE = "R-2CqM7H1agwc7Cx";
    private static final String TEST_KID = "test-key-1";

    private static WireMockServer openIdConnectService;
    private static RSAPublicKey rsaPublicKey;
    private static RSAPrivateKey rsaPrivateKey;
    private static Algorithm rsaAlgorithm;

    private String authService;
    private OpenIdConnectFilter filter;
    private OpenIdConnectConfiguration configuration;
    private TokenAuthenticationCache cache;
    private OpenIdConnectAuthenticationService service;

    @BeforeAll
    static void beforeClass() throws Exception {
        // Generate RSA key pair for signing test JWTs
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
        keyGen.initialize(2048);
        KeyPair keyPair = keyGen.generateKeyPair();
        rsaPublicKey = (RSAPublicKey) keyPair.getPublic();
        rsaPrivateKey = (RSAPrivateKey) keyPair.getPrivate();
        rsaAlgorithm = Algorithm.RSA256(rsaPublicKey, rsaPrivateKey);

        // Build JWKS JSON from the generated public key
        String jwksJson = buildJwksJson(rsaPublicKey, TEST_KID);

        // Build a properly signed id_token matching the userinfo.json test data.
        // Bearer JWT validation (OpenIdConnectAuthenticationService + JwksRsaKeyProvider) verifies
        // the signature against the JWKS endpoint, so this must be signed with our test key.
        long now = System.currentTimeMillis() / 1000;
        String idToken =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("100301874944276879963462152")
                        .withClaim("email", "ritter@erdukunde.de")
                        .withClaim("email_verified", true)
                        .withClaim("name", "Karl Ritter")
                        .withClaim("hd", "geosolutionsgroup.com")
                        .withIssuedAt(new Date(now * 1000))
                        .withExpiresAt(new Date((now + 86400) * 1000))
                        .sign(rsaAlgorithm);

        String tokenResponseJson =
                "{\"access_token\":\"CPURR33RUz-gGhjwODTd9zXo5JkQx4wS\","
                        + "\"id_token\":\""
                        + idToken
                        + "\","
                        + "\"scope\":\"openid profile email phone address\","
                        + "\"expires_in\":86400,"
                        + "\"token_type\":\"Bearer\"}";

        openIdConnectService =
                new WireMockServer(
                        wireMockConfig()
                                .dynamicPort()
                                // uncomment the following to get wiremock logging
                                .notifier(new ConsoleNotifier(true)));
        openIdConnectService.start();

        openIdConnectService.stubFor(
                WireMock.get(urlEqualTo("/certs"))
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader(
                                                "Content-Type", MediaType.APPLICATION_JSON_VALUE)
                                        .withBody(jwksJson)));

        openIdConnectService.stubFor(
                WireMock.post(urlPathEqualTo("/token"))
                        .withRequestBody(containing("grant_type=authorization_code"))
                        .withRequestBody(containing("client_id=" + CLIENT_ID))
                        .withRequestBody(containing("code=" + CODE))
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader(
                                                "Content-Type", MediaType.APPLICATION_JSON_VALUE)
                                        .withBody(tokenResponseJson)));
        openIdConnectService.stubFor(
                WireMock.get(urlPathEqualTo("/userinfo"))
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader(
                                                "Content-Type", MediaType.APPLICATION_JSON_VALUE)
                                        .withBodyFile(
                                                "userinfo.json"))); // disallow query parameters

        // Microsoft Graph API stubs
        openIdConnectService.stubFor(
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
        openIdConnectService.stubFor(
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
        openIdConnectService.stubFor(
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

    @BeforeEach
    void before() {
        // prepare mock server base path
        authService = "http://localhost:" + openIdConnectService.port();
        OpenIdConnectConfiguration configuration = new OpenIdConnectConfiguration();
        configuration.setClientId(CLIENT_ID);
        configuration.setClientSecret(CLIENT_SECRET);
        configuration.setRevokeEndpoint(authService + "/revoke");
        configuration.setAccessTokenUri(authService + "/token");
        configuration.setAuthorizationUri(authService + "/authorize");
        configuration.setCheckTokenEndpointUrl(authService + "/userinfo");
        configuration.setEnabled(true);
        configuration.setAutoCreateUser(true);
        configuration.setIdTokenUri(authService + "/certs");
        configuration.setBeanName("oidcOAuth2Config");
        configuration.setEnableRedirectEntryPoint(true);
        configuration.setRedirectUri("../../../geostore/rest/users/user/details");
        configuration.setScopes("openId,email");
        configuration.setSendClientSecret(true);
        this.configuration = configuration;
        OpenIdConnectRestClient restClient = new OpenIdConnectRestClient(configuration);
        JwksRsaKeyProvider jwksKeyProvider =
                new JwksRsaKeyProvider(authService + "/certs", configuration);
        this.cache =
                new TokenAuthenticationCache(
                        configuration.getCacheSize(), configuration.getCacheExpirationMinutes());
        MultiTokenValidator validator =
                new MultiTokenValidator(
                        java.util.Arrays.asList(
                                new AudienceAccessTokenValidator(), new SubjectTokenValidator()));
        this.service =
                new OpenIdConnectAuthenticationService(
                        this.cache, null, null, configuration, validator, jwksKeyProvider);
        this.filter = new OpenIdConnectFilter(configuration, this.service, restClient);
    }

    @AfterEach
    void afterTest() {
        SecurityContextHolder.clearContext();
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    public void testRedirect() throws IOException, ServletException {
        MockHttpServletRequest request = createRequest("oidc/login");
        MockHttpServletResponse response = new MockHttpServletResponse();
        // SS7 port: the interactive login redirect is owned by the configuration's authentication
        // entry point (invoked by the IdPLoginRest CXF endpoint), not the bearer filter.
        configuration.getAuthenticationEntryPoint().commence(request, response, null);
        assertEquals(302, response.getStatus());
        assertEquals(response.getRedirectedUrl(), configuration.buildLoginUri());
    }

    @Test
    public void testAuthentication() throws IOException, ServletException {
        MockHttpServletRequest request = createRequest("oidc/login");
        request.setParameter("code", CODE);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();
        filter.doFilter(request, response, chain);
        assertEquals(200, response.getStatus());
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        assertEquals("ritter@erdukunde.de", user.getName());
        assertEquals(Role.USER, user.getRole());
    }

    @Test
    public void testGroupsAndRolesFromToken() throws IOException, ServletException {
        configuration.setGroupsClaim("hd");
        MockHttpServletRequest request = createRequest("oidc/login");
        request.setParameter("code", CODE);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();
        filter.doFilter(request, response, chain);
        assertEquals(200, response.getStatus());
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        assertEquals("ritter@erdukunde.de", user.getName());
        assertEquals(Role.USER, user.getRole());
        UserGroup group = user.getGroups().stream().findAny().get();
        assertEquals("geosolutionsgroup.com", group.getGroupName());
    }

    @Test
    public void testBearerTokenAuthentication() throws IOException, ServletException {
        configuration.setAllowBearerTokens(true);

        // Build a properly signed JWT bearer token
        String jwt = createSignedJwt("ritter@erdukunde.de", "test-sub-123", CLIENT_ID);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertEquals(200, response.getStatus());
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication, "Bearer token should produce an authenticated user");
        User user = (User) authentication.getPrincipal();
        assertEquals("ritter@erdukunde.de", user.getName());
        assertEquals(Role.USER, user.getRole());
    }

    @Test
    public void testBearerTokenDisallowed() throws IOException, ServletException {
        configuration.setAllowBearerTokens(false);

        String jwt = createSignedJwt("ritter@erdukunde.de", "test-sub-123", CLIENT_ID);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNull(
                authentication,
                "Bearer token should not authenticate when bearer tokens are disallowed");
    }

    @Test
    public void testBearerTokenWithPrincipalKey() throws IOException, ServletException {
        configuration.setAllowBearerTokens(true);
        configuration.setPrincipalKey("preferred_username");

        long now = System.currentTimeMillis() / 1000;
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("test-sub-456")
                        .withClaim("preferred_username", "karl.ritter")
                        .withClaim("email", "ritter@erdukunde.de")
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
        assertNotNull(authentication);
        User user = (User) authentication.getPrincipal();
        // principalKey is "preferred_username", so it should use that claim
        assertEquals("karl.ritter", user.getName());
    }

    @Test
    public void testBearerTokenRolesAndGroups() throws IOException, ServletException {
        configuration.setAllowBearerTokens(true);
        configuration.setRolesClaim("roles");
        configuration.setGroupsClaim("groups");

        long now = System.currentTimeMillis() / 1000;
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("test-sub-789")
                        .withClaim("email", "admin@example.com")
                        .withArrayClaim("roles", new String[] {"ADMIN"})
                        .withArrayClaim("groups", new String[] {"analysts", "editors"})
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
        assertNotNull(authentication, "Bearer token with roles/groups should authenticate");
        User user = (User) authentication.getPrincipal();
        assertEquals("admin@example.com", user.getName());
        assertEquals(Role.ADMIN, user.getRole());

        // Verify groups were extracted from the bearer token claims
        assertNotNull(user.getGroups(), "Groups should be populated from bearer token");
        Set<String> groupNames =
                user.getGroups().stream().map(UserGroup::getGroupName).collect(Collectors.toSet());
        assertTrue(groupNames.contains("analysts"), "Should have 'analysts' group");
        assertTrue(groupNames.contains("editors"), "Should have 'editors' group");
    }

    @Test
    public void testBearerTokenExpired() throws IOException, ServletException {
        configuration.setAllowBearerTokens(true);

        long now = System.currentTimeMillis() / 1000;
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("test-sub-expired")
                        .withClaim("email", "expired@example.com")
                        .withIssuedAt(new Date((now - 7200) * 1000))
                        .withExpiresAt(new Date((now - 3600) * 1000))
                        .sign(rsaAlgorithm);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNull(authentication, "Expired bearer token should not authenticate");
    }

    @Test
    public void testBearerTokenWrongAudience() throws IOException, ServletException {
        configuration.setAllowBearerTokens(true);

        // JWT signed with correct key but wrong audience
        String jwt = createSignedJwt("ritter@erdukunde.de", "test-sub-aud", "wrong-client-id");

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNull(authentication, "Bearer token with wrong audience should not authenticate");
    }

    @Test
    public void testBearerTokenMalformed() throws IOException, ServletException {
        configuration.setAllowBearerTokens(true);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer not-a-valid-jwt");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNull(authentication, "Malformed bearer token should not authenticate");
    }

    @Test
    public void testBearerTokenBadSignature() throws Exception {
        configuration.setAllowBearerTokens(true);

        // Generate a different RSA key pair and sign with it
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
        keyGen.initialize(2048);
        KeyPair wrongKeyPair = keyGen.generateKeyPair();
        Algorithm wrongAlgorithm =
                Algorithm.RSA256(
                        (RSAPublicKey) wrongKeyPair.getPublic(),
                        (RSAPrivateKey) wrongKeyPair.getPrivate());

        long now = System.currentTimeMillis() / 1000;
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("test-sub-bad-sig")
                        .withClaim("email", "ritter@erdukunde.de")
                        .withIssuedAt(new Date(now * 1000))
                        .withExpiresAt(new Date((now + 3600) * 1000))
                        .sign(wrongAlgorithm);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNull(authentication, "Bearer token signed with wrong key should not authenticate");
    }

    @Test
    public void testRoleMappings() throws IOException, ServletException {
        configuration.setAllowBearerTokens(true);
        configuration.setRolesClaim("roles");
        configuration.setRoleMappings("idp_admin:ADMIN,idp_viewer:GUEST");

        long now = System.currentTimeMillis() / 1000;
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("test-sub-role-map")
                        .withClaim("email", "mapped@example.com")
                        .withArrayClaim("roles", new String[] {"idp_admin"})
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
        assertNotNull(authentication, "Role-mapped bearer token should authenticate");
        User user = (User) authentication.getPrincipal();
        assertEquals(Role.ADMIN, user.getRole(), "idp_admin should map to ADMIN");
    }

    @Test
    public void testGroupMappings() throws IOException, ServletException {
        configuration.setAllowBearerTokens(true);
        configuration.setGroupsClaim("groups");
        configuration.setGroupMappings("devs:developers,ops:operations");

        long now = System.currentTimeMillis() / 1000;
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("test-sub-group-map")
                        .withClaim("email", "groupmap@example.com")
                        .withArrayClaim("groups", new String[] {"devs", "ops"})
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
        assertNotNull(authentication);
        User user = (User) authentication.getPrincipal();
        Set<String> groupNames =
                user.getGroups().stream().map(UserGroup::getGroupName).collect(Collectors.toSet());
        assertTrue(groupNames.contains("developers"), "devs should map to developers");
        assertTrue(groupNames.contains("operations"), "ops should map to operations");
    }

    @Test
    public void testDropUnmapped() throws IOException, ServletException {
        configuration.setAllowBearerTokens(true);
        configuration.setGroupsClaim("groups");
        configuration.setGroupMappings("devs:developers");
        configuration.setDropUnmapped(true);

        long now = System.currentTimeMillis() / 1000;
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("test-sub-drop")
                        .withClaim("email", "drop@example.com")
                        .withArrayClaim("groups", new String[] {"devs", "unmapped_group"})
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
        assertNotNull(authentication);
        User user = (User) authentication.getPrincipal();
        Set<String> groupNames =
                user.getGroups().stream().map(UserGroup::getGroupName).collect(Collectors.toSet());
        assertTrue(groupNames.contains("developers"), "devs should map to developers");
        assertFalse(
                groupNames.contains("unmapped_group"),
                "unmapped_group should be dropped when dropUnmapped=true");
    }

    @Test
    public void testPkceAuthorizationUrl() {
        configuration.setUsePKCE(true);

        MockHttpServletRequest request = createRequest("oidc/login");
        request.getSession(true); // ensure session exists
        MockHttpServletResponse response = new MockHttpServletResponse();

        assertDoesNotThrow(
                () ->
                        configuration
                                .getAuthenticationEntryPoint()
                                .commence(request, response, null));

        assertEquals(302, response.getStatus());
        String redirectUrl = response.getRedirectedUrl();
        assertNotNull(redirectUrl, "Redirect URL should not be null");
        assertTrue(
                redirectUrl.contains("code_challenge="),
                "PKCE redirect URL should contain code_challenge");
        assertTrue(
                redirectUrl.contains("code_challenge_method=S256"),
                "PKCE redirect URL should contain code_challenge_method=S256");

        // Verify code_verifier was stored in session
        String verifier =
                (String)
                        request.getSession()
                                .getAttribute(
                                        OpenIdConnectConfiguration.PKCE_CODE_VERIFIER_SESSION_ATTR);
        assertNotNull(verifier, "PKCE code_verifier should be stored in session");
        assertFalse(verifier.isEmpty(), "PKCE code_verifier should not be empty");
    }

    @Test
    public void testArrayPrincipalClaim() throws IOException, ServletException {
        configuration.setAllowBearerTokens(true);
        configuration.setPrincipalKey("emails");

        long now = System.currentTimeMillis() / 1000;
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("test-sub-array")
                        .withArrayClaim(
                                "emails", new String[] {"first@example.com", "second@example.com"})
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
        assertNotNull(authentication, "Array claim bearer token should authenticate");
        User user = (User) authentication.getPrincipal();
        assertEquals(
                "first@example.com",
                user.getName(),
                "Should use first element of array-type principal claim");
    }

    @Test
    public void testIatValidation() throws IOException, ServletException {
        configuration.setAllowBearerTokens(true);
        configuration.setMaxTokenAgeSecs(60); // max 60 seconds old

        long now = System.currentTimeMillis() / 1000;
        // Token issued 2 hours ago
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("test-sub-iat")
                        .withClaim("email", "old@example.com")
                        .withIssuedAt(new Date((now - 7200) * 1000))
                        .withExpiresAt(new Date((now + 3600) * 1000))
                        .sign(rsaAlgorithm);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNull(
                authentication,
                "Token with old iat should be rejected when maxTokenAgeSecs is set");
    }

    @Test
    public void testCacheConfiguration() {
        // Sanity check: parameterized constructor works and doesn't throw
        TokenAuthenticationCache cache = new TokenAuthenticationCache(500, 120);
        assertNotNull(cache);
        assertNull(cache.get("non-existent-token"));

        // Default constructor
        TokenAuthenticationCache defaultCache = new TokenAuthenticationCache();
        assertNotNull(defaultCache);
    }

    @Test
    public void testBearerTokenIntrospection() throws IOException, ServletException {
        configuration.setAllowBearerTokens(true);
        configuration.setBearerTokenStrategy("introspection");
        configuration.setIntrospectionEndpoint(authService + "/introspect");

        // Stub the introspection endpoint to return active=true with claims
        openIdConnectService.stubFor(
                WireMock.post(urlPathEqualTo("/introspect"))
                        .withRequestBody(containing("token=opaque-test-token-12345"))
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader(
                                                "Content-Type", MediaType.APPLICATION_JSON_VALUE)
                                        .withBody(
                                                "{\"active\":true,\"sub\":\"test-sub-opaque\","
                                                        + "\"email\":\"opaque@example.com\","
                                                        + "\"preferred_username\":\"opaque_user\"}")));

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer opaque-test-token-12345");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertEquals(200, response.getStatus());
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication, "Opaque bearer token should authenticate via introspection");
        User user = (User) authentication.getPrincipal();
        assertEquals("opaque@example.com", user.getName());
    }

    @Test
    public void testBearerTokenIntrospectionInactive() throws IOException, ServletException {
        configuration.setAllowBearerTokens(true);
        configuration.setBearerTokenStrategy("introspection");
        configuration.setIntrospectionEndpoint(authService + "/introspect");

        // Stub the introspection endpoint to return active=false
        openIdConnectService.stubFor(
                WireMock.post(urlPathEqualTo("/introspect"))
                        .withRequestBody(containing("token=revoked-token-99999"))
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader(
                                                "Content-Type", MediaType.APPLICATION_JSON_VALUE)
                                        .withBody("{\"active\":false}")));

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer revoked-token-99999");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNull(authentication, "Inactive token should not authenticate via introspection");
    }

    @Test
    public void testBearerTokenAutoStrategyJwtSuccess() throws IOException, ServletException {
        configuration.setAllowBearerTokens(true);
        configuration.setBearerTokenStrategy("auto");
        configuration.setIntrospectionEndpoint(authService + "/introspect");

        // Build a valid signed JWT — auto strategy should succeed with JWT, no introspection needed
        String jwt = createSignedJwt("auto-jwt@example.com", "test-sub-auto", CLIENT_ID);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertEquals(200, response.getStatus());
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication, "Auto strategy should authenticate valid JWT");
        User user = (User) authentication.getPrincipal();
        assertEquals("auto-jwt@example.com", user.getName());
    }

    @Test
    public void testBearerTokenAutoStrategyFallbackToIntrospection()
            throws IOException, ServletException {
        configuration.setAllowBearerTokens(true);
        configuration.setBearerTokenStrategy("auto");
        configuration.setIntrospectionEndpoint(authService + "/introspect");

        // Stub the introspection endpoint for the opaque token fallback
        openIdConnectService.stubFor(
                WireMock.post(urlPathEqualTo("/introspect"))
                        .withRequestBody(containing("token=not-a-jwt-opaque-token"))
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader(
                                                "Content-Type", MediaType.APPLICATION_JSON_VALUE)
                                        .withBody(
                                                "{\"active\":true,\"sub\":\"test-sub-fallback\","
                                                        + "\"email\":\"fallback@example.com\"}")));

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer not-a-jwt-opaque-token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertEquals(200, response.getStatus());
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(
                authentication,
                "Auto strategy should fall back to introspection for non-JWT tokens");
        User user = (User) authentication.getPrincipal();
        assertEquals("fallback@example.com", user.getName());
    }

    @Test
    public void testNestedClaimRoles() throws IOException, ServletException {
        configuration.setAllowBearerTokens(true);
        // Keycloak-style nested claim path
        configuration.setRolesClaim("realm_access.roles");

        long now = System.currentTimeMillis() / 1000;
        // Build JWT with nested realm_access.roles claim (Keycloak format)
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("test-sub-nested")
                        .withClaim("email", "nested@example.com")
                        .withClaim(
                                "realm_access",
                                java.util.Collections.singletonMap(
                                        "roles", java.util.Arrays.asList("ADMIN", "user")))
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
        assertNotNull(authentication, "Nested claim path should resolve roles");
        User user = (User) authentication.getPrincipal();
        assertEquals("nested@example.com", user.getName());
        assertEquals(
                Role.ADMIN,
                user.getRole(),
                "realm_access.roles containing ADMIN should resolve to ADMIN role");
    }

    @Test
    public void testNestedClaimGroups() throws IOException, ServletException {
        configuration.setAllowBearerTokens(true);
        configuration.setGroupsClaim("resource_access.geostore.groups");

        long now = System.currentTimeMillis() / 1000;
        // Build JWT with deeply nested groups claim
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("test-sub-nested-groups")
                        .withClaim("email", "nested-groups@example.com")
                        .withClaim(
                                "resource_access",
                                java.util.Collections.singletonMap(
                                        "geostore",
                                        java.util.Collections.singletonMap(
                                                "groups",
                                                java.util.Arrays.asList("analysts", "editors"))))
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
        assertNotNull(authentication, "Nested claim path should resolve groups");
        User user = (User) authentication.getPrincipal();
        assertEquals("nested-groups@example.com", user.getName());
        Set<String> groupNames =
                user.getGroups().stream().map(UserGroup::getGroupName).collect(Collectors.toSet());
        assertTrue(groupNames.contains("analysts"), "Should have 'analysts' from nested path");
        assertTrue(groupNames.contains("editors"), "Should have 'editors' from nested path");
    }

    @Test
    public void testJsonPathRoles() throws IOException, ServletException {
        configuration.setAllowBearerTokens(true);
        // Explicit JsonPath expression for roles
        configuration.setRolesClaim("$.realm_access.roles");

        long now = System.currentTimeMillis() / 1000;
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("test-sub-jsonpath")
                        .withClaim("email", "jsonpath@example.com")
                        .withClaim(
                                "realm_access",
                                java.util.Collections.singletonMap(
                                        "roles", java.util.Arrays.asList("ADMIN", "user")))
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
        assertNotNull(authentication, "JsonPath roles expression should resolve");
        User user = (User) authentication.getPrincipal();
        assertEquals("jsonpath@example.com", user.getName());
        assertEquals(
                Role.ADMIN,
                user.getRole(),
                "$.realm_access.roles containing ADMIN should resolve to ADMIN role");
    }

    @Test
    public void testJsonPathGroupsWithWildcard() throws IOException, ServletException {
        configuration.setAllowBearerTokens(true);
        // Wildcard JsonPath for groups across all resource_access entries
        configuration.setGroupsClaim("$.resource_access.*.groups");

        long now = System.currentTimeMillis() / 1000;
        java.util.Map<String, Object> resourceAccess = new java.util.LinkedHashMap<>();
        resourceAccess.put(
                "app1",
                java.util.Collections.singletonMap("groups", java.util.Arrays.asList("analysts")));
        resourceAccess.put(
                "app2",
                java.util.Collections.singletonMap("groups", java.util.Arrays.asList("editors")));

        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("test-sub-wildcard")
                        .withClaim("email", "wildcard@example.com")
                        .withClaim("resource_access", resourceAccess)
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
        assertNotNull(authentication, "Wildcard JsonPath should resolve groups");
        User user = (User) authentication.getPrincipal();
        Set<String> groupNames =
                user.getGroups().stream().map(UserGroup::getGroupName).collect(Collectors.toSet());
        assertTrue(groupNames.contains("analysts"), "Should have 'analysts' from wildcard path");
        assertTrue(groupNames.contains("editors"), "Should have 'editors' from wildcard path");
    }

    @Test
    public void testJsonPathArrayIndex() throws IOException, ServletException {
        configuration.setAllowBearerTokens(true);
        // Array index JsonPath to get the first role
        configuration.setRolesClaim("$.roles[0]");

        long now = System.currentTimeMillis() / 1000;
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("test-sub-index")
                        .withClaim("email", "index@example.com")
                        .withArrayClaim("roles", new String[] {"ADMIN", "USER"})
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
        assertNotNull(authentication, "Array index JsonPath should resolve");
        User user = (User) authentication.getPrincipal();
        assertEquals("index@example.com", user.getName());
        assertEquals(
                Role.ADMIN, user.getRole(), "$.roles[0] should extract ADMIN as first element");
    }

    @Test
    public void testBearerTokenJweRsaOaep() throws Exception {
        configuration.setAllowBearerTokens(true);

        // Create a PKCS12 keystore with the RSA key pair for JWE decryption
        File keystoreFile = createTestKeystore();
        try {
            configuration.setJweKeyStoreFile(keystoreFile.getAbsolutePath());
            configuration.setJweKeyStorePassword("changeit");
            configuration.setJweKeyStoreType("PKCS12");
            configuration.setJweKeyAlias("jwekey");
            configuration.setJweKeyPassword("changeit");

            // Recreate filter so it picks up the JWE config
            recreateFilter();

            // Create a signed JWT, then encrypt it inside a JWE
            String jweToken =
                    createSignedJweToken("jwe-user@example.com", "test-sub-jwe", CLIENT_ID);

            MockHttpServletRequest request = createRequest("rest/resources");
            request.addHeader("Authorization", "Bearer " + jweToken);
            MockHttpServletResponse response = new MockHttpServletResponse();
            MockFilterChain chain = new MockFilterChain();

            filter.doFilter(request, response, chain);

            assertEquals(200, response.getStatus());
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            assertNotNull(authentication, "JWE bearer token should authenticate successfully");
            User user = (User) authentication.getPrincipal();
            assertEquals("jwe-user@example.com", user.getName());
        } finally {
            keystoreFile.delete();
        }
    }

    @Test
    public void testBearerTokenJweWithRolesAndGroups() throws Exception {
        configuration.setAllowBearerTokens(true);
        configuration.setRolesClaim("roles");
        configuration.setGroupsClaim("groups");

        File keystoreFile = createTestKeystore();
        try {
            configuration.setJweKeyStoreFile(keystoreFile.getAbsolutePath());
            configuration.setJweKeyStorePassword("changeit");
            configuration.setJweKeyStoreType("PKCS12");
            configuration.setJweKeyAlias("jwekey");
            configuration.setJweKeyPassword("changeit");

            recreateFilter();

            // Create JWE with roles and groups in the inner JWT
            long now = System.currentTimeMillis() / 1000;
            JWTClaimsSet innerClaims =
                    new JWTClaimsSet.Builder()
                            .subject("test-sub-jwe-roles")
                            .issuer("https://test.issuer/")
                            .audience(CLIENT_ID)
                            .claim("email", "jwe-admin@example.com")
                            .claim("roles", java.util.Arrays.asList("ADMIN"))
                            .claim("groups", java.util.Arrays.asList("analysts", "editors"))
                            .issueTime(new Date(now * 1000))
                            .expirationTime(new Date((now + 3600) * 1000))
                            .build();

            SignedJWT signedJWT =
                    new SignedJWT(
                            new JWSHeader.Builder(JWSAlgorithm.RS256).keyID(TEST_KID).build(),
                            innerClaims);
            signedJWT.sign(new RSASSASigner(rsaPrivateKey));

            JWEHeader jweHeader =
                    new JWEHeader.Builder(JWEAlgorithm.RSA_OAEP_256, EncryptionMethod.A256GCM)
                            .contentType("JWT")
                            .build();
            JWEObject jweObject = new JWEObject(jweHeader, new Payload(signedJWT));
            jweObject.encrypt(new RSAEncrypter(rsaPublicKey));
            String jweToken = jweObject.serialize();

            MockHttpServletRequest request = createRequest("rest/resources");
            request.addHeader("Authorization", "Bearer " + jweToken);
            MockHttpServletResponse response = new MockHttpServletResponse();
            MockFilterChain chain = new MockFilterChain();

            filter.doFilter(request, response, chain);

            assertEquals(200, response.getStatus());
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            assertNotNull(authentication, "JWE token with roles/groups should authenticate");
            User user = (User) authentication.getPrincipal();
            assertEquals("jwe-admin@example.com", user.getName());
            assertEquals(Role.ADMIN, user.getRole());

            Set<String> groupNames =
                    user.getGroups().stream()
                            .map(UserGroup::getGroupName)
                            .collect(Collectors.toSet());
            assertTrue(groupNames.contains("analysts"), "Should have 'analysts' group from JWE");
            assertTrue(groupNames.contains("editors"), "Should have 'editors' group from JWE");
        } finally {
            keystoreFile.delete();
        }
    }

    @Test
    public void testBearerTokenJweFallsBackToJws() throws Exception {
        configuration.setAllowBearerTokens(true);

        // Configure JWE keystore — but send a plain JWS token
        File keystoreFile = createTestKeystore();
        try {
            configuration.setJweKeyStoreFile(keystoreFile.getAbsolutePath());
            configuration.setJweKeyStorePassword("changeit");
            configuration.setJweKeyStoreType("PKCS12");
            configuration.setJweKeyAlias("jwekey");
            configuration.setJweKeyPassword("changeit");

            recreateFilter();

            // Send a plain JWS token (3 parts) — should bypass JWE decryption and work normally
            String jwt = createSignedJwt("jws-fallback@example.com", "test-sub-jws", CLIENT_ID);

            MockHttpServletRequest request = createRequest("rest/resources");
            request.addHeader("Authorization", "Bearer " + jwt);
            MockHttpServletResponse response = new MockHttpServletResponse();
            MockFilterChain chain = new MockFilterChain();

            filter.doFilter(request, response, chain);

            assertEquals(200, response.getStatus());
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            assertNotNull(
                    authentication, "Plain JWS token should still work when JWE is configured");
            User user = (User) authentication.getPrincipal();
            assertEquals("jws-fallback@example.com", user.getName());
        } finally {
            keystoreFile.delete();
        }
    }

    @Test
    public void testBearerTokenJweNotConfigured() throws Exception {
        configuration.setAllowBearerTokens(true);
        // No JWE keystore configured — JWE tokens should fail validation
        // (they look like malformed JWTs to the JWS pipeline)

        // Create a JWE token
        long now = System.currentTimeMillis() / 1000;
        JWTClaimsSet claims =
                new JWTClaimsSet.Builder()
                        .subject("test-sub-jwe-noconfig")
                        .issuer("https://test.issuer/")
                        .audience(CLIENT_ID)
                        .claim("email", "jwe-noconfig@example.com")
                        .issueTime(new Date(now * 1000))
                        .expirationTime(new Date((now + 3600) * 1000))
                        .build();

        JWEHeader header =
                new JWEHeader.Builder(JWEAlgorithm.RSA_OAEP_256, EncryptionMethod.A256GCM).build();
        EncryptedJWT encryptedJWT = new EncryptedJWT(header, claims);
        encryptedJWT.encrypt(new RSAEncrypter(rsaPublicKey));
        String jweToken = encryptedJWT.serialize();

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jweToken);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNull(
                authentication,
                "JWE token should not authenticate when no JWE keystore is configured");
    }

    @Test
    public void testBearerTokenGroupsOverageResolvesViaGraph()
            throws IOException, ServletException {
        configuration.setAllowBearerTokens(true);
        configuration.setGroupsClaim("groups");
        configuration.setMsGraphEnabled(true);
        configuration.setMsGraphEndpoint(authService + "/graph");
        recreateFilter();

        // Build JWT with groups overage indicator (_claim_names containing "groups")
        long now = System.currentTimeMillis() / 1000;
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("test-sub-overage")
                        .withClaim("email", "overage@example.com")
                        .withClaim(
                                "_claim_names",
                                java.util.Collections.singletonMap("groups", "src1"))
                        .withClaim(
                                "_claim_sources",
                                java.util.Collections.singletonMap(
                                        "src1",
                                        java.util.Collections.singletonMap(
                                                "endpoint",
                                                "https://graph.microsoft.com/v1.0/me/memberOf")))
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
        assertNotNull(authentication, "Bearer token with overage should authenticate");
        User user = (User) authentication.getPrincipal();
        assertEquals("overage@example.com", user.getName());

        // Verify groups were resolved from Graph
        assertNotNull(user.getGroups(), "Groups should be populated from Graph");
        Set<String> groupNames =
                user.getGroups().stream().map(UserGroup::getGroupName).collect(Collectors.toSet());
        assertTrue(groupNames.contains("GIS Analysts"), "Should have 'GIS Analysts' from Graph");
        assertTrue(groupNames.contains("Map Editors"), "Should have 'Map Editors' from Graph");
    }

    @Test
    public void testBearerTokenGroupsOverageWithMappings() throws IOException, ServletException {
        configuration.setAllowBearerTokens(true);
        configuration.setGroupsClaim("groups");
        configuration.setGroupMappings("GIS ANALYSTS:analysts_mapped,MAP EDITORS:editors_mapped");
        configuration.setMsGraphEnabled(true);
        configuration.setMsGraphEndpoint(authService + "/graph");
        recreateFilter();

        long now = System.currentTimeMillis() / 1000;
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("test-sub-overage-map")
                        .withClaim("email", "overage-map@example.com")
                        .withClaim(
                                "_claim_names",
                                java.util.Collections.singletonMap("groups", "src1"))
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
        assertNotNull(authentication, "Bearer token with overage + mappings should authenticate");
        User user = (User) authentication.getPrincipal();

        // Verify groups were resolved from Graph AND then mapped
        Set<String> groupNames =
                user.getGroups().stream().map(UserGroup::getGroupName).collect(Collectors.toSet());
        assertTrue(
                groupNames.contains("analysts_mapped"),
                "Graph group 'GIS Analysts' should map to 'analysts_mapped'");
        assertTrue(
                groupNames.contains("editors_mapped"),
                "Graph group 'Map Editors' should map to 'editors_mapped'");
    }

    @Test
    public void testBearerTokenGroupsOverageGraphUnavailable()
            throws IOException, ServletException {
        configuration.setAllowBearerTokens(true);
        configuration.setGroupsClaim("groups");
        configuration.setMsGraphEnabled(true);
        // Use a non-existent graph endpoint path to simulate Graph unavailability
        configuration.setMsGraphEndpoint(authService + "/graph-unavailable");
        recreateFilter();

        // Stub a 503 for the unavailable endpoint
        openIdConnectService.stubFor(
                WireMock.get(urlPathEqualTo("/graph-unavailable/me/memberOf"))
                        .willReturn(aResponse().withStatus(503).withBody("Service Unavailable")));

        long now = System.currentTimeMillis() / 1000;
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("test-sub-overage-503")
                        .withClaim("email", "overage-503@example.com")
                        .withClaim(
                                "_claim_names",
                                java.util.Collections.singletonMap("groups", "src1"))
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
        assertNotNull(authentication, "User should still authenticate when Graph is unavailable");
        User user = (User) authentication.getPrincipal();
        assertEquals("overage-503@example.com", user.getName());
        // Groups may be empty since Graph failed, but user should still authenticate
    }

    @Test
    public void testBearerTokenGroupsNoOverageSkipsGraph() throws IOException, ServletException {
        configuration.setAllowBearerTokens(true);
        configuration.setGroupsClaim("groups");
        configuration.setMsGraphEnabled(true);
        configuration.setMsGraphEndpoint(authService + "/graph");
        recreateFilter();

        // JWT with inline groups (no overage) — Graph should NOT be called
        long now = System.currentTimeMillis() / 1000;
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("test-sub-no-overage")
                        .withClaim("email", "no-overage@example.com")
                        .withArrayClaim("groups", new String[] {"inline-group-A", "inline-group-B"})
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
        assertNotNull(authentication, "Bearer token with inline groups should authenticate");
        User user = (User) authentication.getPrincipal();

        // Verify inline groups were used (not Graph groups)
        Set<String> groupNames =
                user.getGroups().stream().map(UserGroup::getGroupName).collect(Collectors.toSet());
        assertTrue(groupNames.contains("inline-group-A"), "Should have inline group A");
        assertTrue(groupNames.contains("inline-group-B"), "Should have inline group B");
        assertFalse(
                groupNames.contains("GIS Analysts"), "Should NOT have Graph group when no overage");
    }

    @Test
    public void testBearerTokenAlwaysResolveGroupsViaGraph() throws IOException, ServletException {
        configuration.setAllowBearerTokens(true);
        configuration.setGroupsClaim("groups");
        configuration.setMsGraphEnabled(true);
        configuration.setMsGraphEndpoint(authService + "/graph");
        // The new flag: resolve names via Graph on every login, not only on overage.
        configuration.setMsGraphAlwaysResolveGroups(true);
        recreateFilter();

        // JWT with inline groups and NO overage indicator: Graph must still be queried and
        // its display names must REPLACE the inline (GUID-style) claim values.
        long now = System.currentTimeMillis() / 1000;
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("test-sub-always-graph")
                        .withClaim("email", "always-graph@example.com")
                        .withArrayClaim("groups", new String[] {"guid-aaa", "guid-bbb"})
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
        assertNotNull(authentication, "Bearer token should authenticate");
        User user = (User) authentication.getPrincipal();

        Set<String> groupNames =
                user.getGroups().stream().map(UserGroup::getGroupName).collect(Collectors.toSet());
        // Graph display names are used...
        assertTrue(groupNames.contains("GIS Analysts"), "Graph group 'GIS Analysts' expected");
        assertTrue(groupNames.contains("Map Editors"), "Graph group 'Map Editors' expected");
        // ...replacing the inline GUID-style claim values.
        assertFalse(groupNames.contains("guid-aaa"), "Inline GUID groups must be replaced");
        assertFalse(groupNames.contains("guid-bbb"), "Inline GUID groups must be replaced");
    }

    @Test
    public void testBearerTokenMsGraphRoles() throws IOException, ServletException {
        configuration.setAllowBearerTokens(true);
        configuration.setRolesClaim("roles");
        configuration.setMsGraphEnabled(true);
        configuration.setMsGraphRolesEnabled(true);
        configuration.setMsGraphEndpoint(authService + "/graph");
        recreateFilter();

        long now = System.currentTimeMillis() / 1000;
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("test-sub-graph-roles")
                        .withClaim("email", "graph-roles@example.com")
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
        assertNotNull(authentication, "Bearer token with Graph roles should authenticate");
        User user = (User) authentication.getPrincipal();
        assertEquals("graph-roles@example.com", user.getName());
        // The Graph stubs return "Admin" and "Viewer" roles
        assertEquals(Role.ADMIN, user.getRole(), "Graph app role 'Admin' should resolve to ADMIN");
    }

    @Test
    public void testBearerTokenMsGraphDisabledIgnoresOverage()
            throws IOException, ServletException {
        configuration.setAllowBearerTokens(true);
        configuration.setGroupsClaim("groups");
        configuration.setMsGraphEnabled(false);
        recreateFilter();

        // JWT with overage but MS Graph disabled — groups overage should be ignored
        long now = System.currentTimeMillis() / 1000;
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("test-sub-disabled")
                        .withClaim("email", "disabled@example.com")
                        .withClaim(
                                "_claim_names",
                                java.util.Collections.singletonMap("groups", "src1"))
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
        assertNotNull(
                authentication, "User should authenticate even with overage when Graph disabled");
        User user = (User) authentication.getPrincipal();
        assertEquals("disabled@example.com", user.getName());
        // No Graph groups should be present since MS Graph is disabled
        if (user.getGroups() != null) {
            Set<String> groupNames =
                    user.getGroups().stream()
                            .map(UserGroup::getGroupName)
                            .collect(Collectors.toSet());
            assertFalse(
                    groupNames.contains("GIS Analysts"),
                    "Should NOT have Graph groups when msGraphEnabled=false");
        }
    }

    @Test
    public void testLogSensitiveInfoEnablesDebugLogging() throws IOException, ServletException {
        configuration.setLogSensitiveInfo(true);
        configuration.setAllowBearerTokens(true);
        recreateFilter();

        String jwt = createSignedJwt("sensitive-test@example.com", "sub-sensitive", CLIENT_ID);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        // Verify authentication succeeded
        assertEquals(200, response.getStatus());
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication, "User should authenticate with logSensitiveInfo enabled");
        User user = (User) authentication.getPrincipal();
        assertEquals("sensitive-test@example.com", user.getName());

        // Verify the security logger is now at DEBUG level
        org.apache.logging.log4j.Logger securityLogger =
                org.apache.logging.log4j.LogManager.getLogger(
                        "it.geosolutions.geostore.services.rest.security");
        assertTrue(
                securityLogger.isDebugEnabled(),
                "Security logger should be at DEBUG when logSensitiveInfo=true");
    }

    @Test
    public void testLogSensitiveInfoDisabledByDefault() throws IOException, ServletException {
        // logSensitiveInfo defaults to false
        assertFalse(configuration.isLogSensitiveInfo());
    }

    // ── Tests for trusted flag and auth code callback flow ──────────────────

    @Test
    public void testBearerTokenUserIsTrusted() throws IOException, ServletException {
        configuration.setAllowBearerTokens(true);

        String jwt = createSignedJwt("ritter@erdukunde.de", "test-sub-trusted", CLIENT_ID);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication, "Bearer token should produce an authenticated user");
        User user = (User) authentication.getPrincipal();
        assertEquals("ritter@erdukunde.de", user.getName());
        assertTrue(
                user.isTrusted(),
                "OIDC-authenticated user should be marked as trusted so that "
                        + "getAuthUserDetails() does not require a DB lookup");
    }

    @Test
    public void testBearerTokenWithRolesUserIsTrusted() throws IOException, ServletException {
        configuration.setAllowBearerTokens(true);
        configuration.setRolesClaim("roles");
        configuration.setGroupsClaim("groups");

        long now = System.currentTimeMillis() / 1000;
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("test-sub-trusted-admin")
                        .withClaim("email", "admin-trusted@example.com")
                        .withArrayClaim("roles", new String[] {"ADMIN"})
                        .withArrayClaim("groups", new String[] {"team-alpha", "team-beta"})
                        .withIssuedAt(new Date(now * 1000))
                        .withExpiresAt(new Date((now + 3600) * 1000))
                        .sign(rsaAlgorithm);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication);
        User user = (User) authentication.getPrincipal();
        assertEquals("admin-trusted@example.com", user.getName());
        assertEquals(Role.ADMIN, user.getRole());
        assertTrue(
                user.isTrusted(),
                "User with role and groups from token should still be marked trusted");
        assertNotNull(user.getGroups());
        Set<String> groupNames =
                user.getGroups().stream().map(UserGroup::getGroupName).collect(Collectors.toSet());
        assertTrue(groupNames.contains("team-alpha"));
        assertTrue(groupNames.contains("team-beta"));
    }

    @Test
    public void testAuthCodeCallbackPopulatesAccessTokenRequest()
            throws IOException, ServletException {
        // Simulate an auth code callback request with a code parameter.
        // The filter should populate the AccessTokenRequest and skip clearState().
        MockHttpServletRequest request = createRequest("openid/oidc/callback");
        request.addParameter("code", CODE);

        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        // The token exchange will use the code to obtain tokens from WireMock.
        filter.doFilter(request, response, chain);

        // After successful callback, the user should be authenticated
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication, "Auth code callback should produce an authenticated user");
        User user = (User) authentication.getPrincipal();
        assertNotNull(user.getName(), "User should have a name extracted from userinfo");
        assertTrue(user.isTrusted(), "Auth code flow user should be marked as trusted");
    }

    @Test
    public void testCallbackRequestSkipsClearState() throws IOException, ServletException {
        // Verify that a callback request with a code does not trigger clearState(),
        // which would destroy the authorization code before the token exchange.
        MockHttpServletRequest request = createRequest("openid/oidc/callback");
        request.addParameter("code", CODE);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        // If clearState() ran, the code would be wiped and authentication would fail.
        // Success means clearState() was correctly skipped.
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(
                authentication,
                "Callback with code should authenticate (clearState must be skipped)");
    }

    /**
     * Creates a PKCS12 keystore file containing the test RSA key pair for JWE decryption testing.
     */
    private File createTestKeystore() throws Exception {
        KeyStore keyStore = KeyStore.getInstance("PKCS12");
        keyStore.load(null, "changeit".toCharArray());

        // Create a self-signed certificate for the key pair
        X509Certificate cert = generateSelfSignedCert(rsaPublicKey, rsaPrivateKey);
        keyStore.setKeyEntry(
                "jwekey",
                rsaPrivateKey,
                "changeit".toCharArray(),
                new java.security.cert.Certificate[] {cert});

        File tempFile = File.createTempFile("geostore-test-jwe-", ".p12");
        try (FileOutputStream fos = new FileOutputStream(tempFile)) {
            keyStore.store(fos, "changeit".toCharArray());
        }
        return tempFile;
    }

    /**
     * Generates a minimal self-signed X.509 certificate for test purposes using DER encoding
     * directly (no sun.security.x509 dependency).
     */
    private static X509Certificate generateSelfSignedCert(
            RSAPublicKey pubKey, RSAPrivateKey privKey) throws Exception {
        // Build a self-signed cert by constructing the DER TBSCertificate manually,
        // signing it, and parsing it back via CertificateFactory.
        byte[] subjectBytes =
                derSequence(
                        derSet(
                                derSequence(
                                        derOid(new int[] {2, 5, 4, 3}), // OID for CN
                                        derUtf8String("GeoStore Test JWE"))));

        long now = System.currentTimeMillis();
        byte[] notBefore = derUtcTime(new Date(now));
        byte[] notAfter = derUtcTime(new Date(now + 365L * 24 * 60 * 60 * 1000));
        byte[] validity = derSequence(notBefore, notAfter);

        // SHA256withRSA OID: 1.2.840.113549.1.1.11
        byte[] sha256WithRsa =
                derSequence(derOid(new int[] {1, 2, 840, 113549, 1, 1, 11}), derNull());

        byte[] serialNumber =
                derInteger(new java.math.BigInteger(64, new java.security.SecureRandom()));
        byte[] version = derExplicit(0, derInteger(java.math.BigInteger.valueOf(2))); // v3

        byte[] subjectPublicKeyInfo = pubKey.getEncoded();

        byte[] tbsCertificate =
                derSequence(
                        version,
                        serialNumber,
                        sha256WithRsa,
                        subjectBytes,
                        validity,
                        subjectBytes,
                        subjectPublicKeyInfo);

        java.security.Signature sig = java.security.Signature.getInstance("SHA256withRSA");
        sig.initSign(privKey);
        sig.update(tbsCertificate);
        byte[] signature = sig.sign();

        byte[] signatureBits = derBitString(signature);
        byte[] certificate = derSequence(tbsCertificate, sha256WithRsa, signatureBits);

        java.security.cert.CertificateFactory cf =
                java.security.cert.CertificateFactory.getInstance("X.509");
        return (X509Certificate)
                cf.generateCertificate(new java.io.ByteArrayInputStream(certificate));
    }

    // --- Minimal DER encoding helpers for self-signed cert generation ---

    private static byte[] derSequence(byte[]... items) {
        return derTagged(0x30, concat(items));
    }

    private static byte[] derSet(byte[]... items) {
        return derTagged(0x31, concat(items));
    }

    private static byte[] derOid(int[] components) {
        java.io.ByteArrayOutputStream buf = new java.io.ByteArrayOutputStream();
        buf.write(40 * components[0] + components[1]);
        for (int i = 2; i < components.length; i++) {
            encodeOidComponent(buf, components[i]);
        }
        byte[] content = buf.toByteArray();
        return derTagged(0x06, content);
    }

    private static void encodeOidComponent(java.io.ByteArrayOutputStream buf, int value) {
        if (value < 128) {
            buf.write(value);
        } else {
            // Multi-byte encoding
            byte[] bytes = new byte[5];
            int pos = 4;
            bytes[pos] = (byte) (value & 0x7F);
            value >>= 7;
            while (value > 0) {
                pos--;
                bytes[pos] = (byte) ((value & 0x7F) | 0x80);
                value >>= 7;
            }
            buf.write(bytes, pos, 5 - pos);
        }
    }

    private static byte[] derUtf8String(String s) {
        return derTagged(0x0C, s.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    private static byte[] derNull() {
        return new byte[] {0x05, 0x00};
    }

    private static byte[] derInteger(java.math.BigInteger value) {
        byte[] content = value.toByteArray();
        return derTagged(0x02, content);
    }

    private static byte[] derBitString(byte[] data) {
        byte[] content = new byte[data.length + 1];
        content[0] = 0; // no unused bits
        System.arraycopy(data, 0, content, 1, data.length);
        return derTagged(0x03, content);
    }

    private static byte[] derUtcTime(Date date) {
        java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyMMddHHmmss'Z'");
        sdf.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
        byte[] content = sdf.format(date).getBytes(java.nio.charset.StandardCharsets.US_ASCII);
        return derTagged(0x17, content);
    }

    private static byte[] derExplicit(int tag, byte[] content) {
        return derTagged(0xA0 | tag, content);
    }

    private static byte[] derTagged(int tag, byte[] content) {
        java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
        out.write(tag);
        writeLength(out, content.length);
        out.write(content, 0, content.length);
        return out.toByteArray();
    }

    private static void writeLength(java.io.ByteArrayOutputStream out, int length) {
        if (length < 128) {
            out.write(length);
        } else if (length < 256) {
            out.write(0x81);
            out.write(length);
        } else {
            out.write(0x82);
            out.write(length >> 8);
            out.write(length & 0xFF);
        }
    }

    private static byte[] concat(byte[][]... arrays) {
        int total = 0;
        for (byte[][] arr : arrays) {
            for (byte[] b : arr) {
                total += b.length;
            }
        }
        byte[] result = new byte[total];
        int pos = 0;
        for (byte[][] arr : arrays) {
            for (byte[] b : arr) {
                System.arraycopy(b, 0, result, pos, b.length);
                pos += b.length;
            }
        }
        return result;
    }

    /** Creates a JWE token wrapping a signed JWT (nested JWS in JWE). */
    private String createSignedJweToken(String email, String sub, String aud) throws Exception {
        long now = System.currentTimeMillis() / 1000;

        JWTClaimsSet innerClaims =
                new JWTClaimsSet.Builder()
                        .subject(sub)
                        .issuer("https://test.issuer/")
                        .audience(aud)
                        .claim("email", email)
                        .issueTime(new Date(now * 1000))
                        .expirationTime(new Date((now + 3600) * 1000))
                        .build();

        SignedJWT signedJWT =
                new SignedJWT(
                        new JWSHeader.Builder(JWSAlgorithm.RS256).keyID(TEST_KID).build(),
                        innerClaims);
        signedJWT.sign(new RSASSASigner(rsaPrivateKey));

        JWEHeader jweHeader =
                new JWEHeader.Builder(JWEAlgorithm.RSA_OAEP_256, EncryptionMethod.A256GCM)
                        .contentType("JWT")
                        .build();
        JWEObject jweObject = new JWEObject(jweHeader, new Payload(signedJWT));
        jweObject.encrypt(new RSAEncrypter(rsaPublicKey));
        return jweObject.serialize();
    }

    /**
     * Integration test: when a user's role is changed in the DB, the next bearer token request
     * (even with a cached, non-expired token) must reflect the new role.
     */
    @Test
    public void testCachedBearerTokenRoleSyncOnDbChange() throws Exception {
        configuration.setAllowBearerTokens(true);
        MockedUserService userService = new MockedUserService();
        recreateFilter();
        service.setUserService(userService);

        // First request: authenticate with bearer token (auto-creates user as USER)
        String jwt = createSignedJwt("role-sync@example.com", "sub-role-sync", CLIENT_ID);

        MockHttpServletRequest request1 = createRequest("rest/resources");
        request1.addHeader("Authorization", "Bearer " + jwt);
        filter.doFilter(request1, new MockHttpServletResponse(), new MockFilterChain());

        Authentication auth1 = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth1, "First bearer request should authenticate");
        User user = (User) auth1.getPrincipal();
        assertEquals("role-sync@example.com", user.getName());
        assertEquals(Role.USER, user.getRole(), "Auto-created user should have USER role");
        assertNotNull(cache.get(jwt), "Token should be in cache after first request");

        // Simulate admin promoting the user to ADMIN in the DB
        User dbUser = userService.get("role-sync@example.com");
        dbUser.setRole(Role.ADMIN);
        userService.update(dbUser);

        // Second request with same bearer token — should pick up the role change
        SecurityContextHolder.clearContext();
        MockHttpServletRequest request2 = createRequest("rest/resources");
        request2.addHeader("Authorization", "Bearer " + jwt);
        filter.doFilter(request2, new MockHttpServletResponse(), new MockFilterChain());

        Authentication auth2 = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth2, "Second bearer request should authenticate from cache");
        User user2 = (User) auth2.getPrincipal();
        assertEquals(
                Role.ADMIN,
                user2.getRole(),
                "Role should be ADMIN after DB promotion, even with cached token");
        assertTrue(
                auth2.getAuthorities().stream()
                        .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority())),
                "Granted authority should be ROLE_ADMIN after promotion");
    }

    /** Integration test: demotion from ADMIN to USER via DB change is reflected immediately. */
    @Test
    public void testCachedBearerTokenDemotionReflected() throws Exception {
        configuration.setAllowBearerTokens(true);
        configuration.setRolesClaim("roles");
        MockedUserService userService = new MockedUserService();
        recreateFilter();
        service.setUserService(userService);

        // Authenticate as ADMIN via roles claim in JWT
        long now = System.currentTimeMillis() / 1000;
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("sub-demote")
                        .withClaim("email", "demote@example.com")
                        .withArrayClaim("roles", new String[] {"ADMIN"})
                        .withIssuedAt(new Date(now * 1000))
                        .withExpiresAt(new Date((now + 3600) * 1000))
                        .sign(rsaAlgorithm);

        MockHttpServletRequest request1 = createRequest("rest/resources");
        request1.addHeader("Authorization", "Bearer " + jwt);
        filter.doFilter(request1, new MockHttpServletResponse(), new MockFilterChain());

        Authentication auth1 = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth1);
        assertEquals(Role.ADMIN, ((User) auth1.getPrincipal()).getRole());

        // Demote user to USER in DB (simulates admin action)
        User dbUser = userService.get("demote@example.com");
        dbUser.setRole(Role.USER);
        userService.update(dbUser);

        // Second request — should reflect demotion
        SecurityContextHolder.clearContext();
        MockHttpServletRequest request2 = createRequest("rest/resources");
        request2.addHeader("Authorization", "Bearer " + jwt);
        filter.doFilter(request2, new MockHttpServletResponse(), new MockFilterChain());

        Authentication auth2 = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth2, "Second request should still authenticate");
        assertEquals(
                Role.USER,
                ((User) auth2.getPrincipal()).getRole(),
                "Role should be demoted to USER after DB change");
    }

    /**
     * Integration test: autoCreateUser creates the user in DB on first bearer token authentication.
     */
    @Test
    public void testAutoCreateUserOnBearerToken() throws Exception {
        configuration.setAllowBearerTokens(true);
        configuration.setAutoCreateUser(true);
        MockedUserService userService = new MockedUserService();
        recreateFilter();
        service.setUserService(userService);

        String jwt = createSignedJwt("newuser@example.com", "sub-autocreate", CLIENT_ID);

        // Verify user does not exist yet
        try {
            userService.get("newuser@example.com");
            fail("User should not exist before first authentication");
        } catch (NotFoundServiceEx expected) {
            // expected
        }

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication, "Bearer token should authenticate via auto-create");
        User user = (User) authentication.getPrincipal();
        assertEquals("newuser@example.com", user.getName());
        assertEquals(Role.USER, user.getRole(), "Auto-created user should default to USER role");
        assertTrue(user.isEnabled(), "Auto-created user should be enabled");

        // Verify user was persisted in the service
        User persisted = userService.get("newuser@example.com");
        assertNotNull(persisted, "User should be persisted after auto-create");
        assertEquals(Role.USER, persisted.getRole());
    }

    /**
     * Integration test: when autoCreateUser=false, OIDC-authenticated users are NOT persisted to
     * the DB. They can still authenticate but won't appear in the admin UI.
     */
    @Test
    public void testAutoCreateUserDisabledDoesNotPersist() throws Exception {
        configuration.setAllowBearerTokens(true);
        configuration.setAutoCreateUser(false);
        MockedUserService userService = new MockedUserService();
        recreateFilter();
        service.setUserService(userService);

        String jwt = createSignedJwt("transient@example.com", "sub-transient", CLIENT_ID);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            // User should NOT be persisted
            try {
                userService.get("transient@example.com");
                fail("User should not be persisted when autoCreateUser is false");
            } catch (NotFoundServiceEx expected) {
                // expected — transient user only
            }
        }
    }

    /**
     * Integration test: when rolesClaim is configured but the JWT does not contain that claim, an
     * existing DB user with ADMIN role should be downgraded to authenticatedDefaultRole (USER).
     * This simulates the Azure AD scenario where the JWT has no "roles" claim.
     */
    @Test
    public void testMissingRolesClaimFallsBackToDefaultRole() throws Exception {
        configuration.setAllowBearerTokens(true);
        configuration.setRolesClaim("roles");
        configuration.setAuthenticatedDefaultRole("USER");
        MockedUserService userService = new MockedUserService();

        // Pre-create user as ADMIN in the DB (simulates a previously promoted user)
        User existingUser = new User();
        existingUser.setName("admin-user@example.com");
        existingUser.setRole(Role.ADMIN);
        existingUser.setEnabled(true);
        existingUser.setNewPassword("");
        userService.insert(existingUser);

        recreateFilter();
        service.setUserService(userService);

        // JWT with NO "roles" claim (like Azure AD tokens)
        String jwt = createSignedJwt("admin-user@example.com", "sub-no-roles", CLIENT_ID);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth, "Bearer request should authenticate");
        User principal = (User) auth.getPrincipal();
        assertEquals(
                Role.USER,
                principal.getRole(),
                "Existing ADMIN user should be downgraded to USER when roles claim is missing");
        assertTrue(
                auth.getAuthorities().stream().anyMatch(a -> "ROLE_USER".equals(a.getAuthority())),
                "Granted authority should be ROLE_USER");

        // Verify the role change was persisted to the DB
        User dbUser = userService.get("admin-user@example.com");
        assertEquals(
                Role.USER,
                dbUser.getRole(),
                "DB role should be updated to USER after login without roles claim");
    }

    /**
     * Integration test: when rolesClaim is configured AND the JWT contains the claim with ADMIN, an
     * existing DB user with USER role should be promoted to ADMIN.
     */
    @Test
    public void testRolesClaimPresent_PromotesToAdmin() throws Exception {
        configuration.setAllowBearerTokens(true);
        configuration.setRolesClaim("roles");
        configuration.setAuthenticatedDefaultRole("USER");
        MockedUserService userService = new MockedUserService();

        // Pre-create user as USER in the DB
        User existingUser = new User();
        existingUser.setName("promote@example.com");
        existingUser.setRole(Role.USER);
        existingUser.setEnabled(true);
        existingUser.setNewPassword("");
        userService.insert(existingUser);

        recreateFilter();
        service.setUserService(userService);

        // JWT WITH "roles" claim containing ADMIN
        long now = System.currentTimeMillis() / 1000;
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("sub-promote")
                        .withClaim("email", "promote@example.com")
                        .withArrayClaim("roles", new String[] {"ADMIN"})
                        .withIssuedAt(new Date(now * 1000))
                        .withExpiresAt(new Date((now + 3600) * 1000))
                        .sign(rsaAlgorithm);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth, "Bearer request should authenticate");
        User principal = (User) auth.getPrincipal();
        assertEquals(
                Role.ADMIN,
                principal.getRole(),
                "USER should be promoted to ADMIN when roles claim contains ADMIN");
        assertTrue(
                auth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority())),
                "Granted authority should be ROLE_ADMIN");
    }

    /**
     * When authenticatedDefaultRole is GUEST and the token contains a role that maps to USER via
     * roleMappings, the user should be elevated to USER (not left as GUEST). This tests that
     * computeRole has an explicit USER branch.
     */
    @Test
    public void testRoleMappingToUser_OverridesGuestDefault() throws Exception {
        configuration.setAllowBearerTokens(true);
        configuration.setRolesClaim("realm_access.roles");
        configuration.setAuthenticatedDefaultRole("GUEST");
        configuration.setRoleMappings("demo:USER,realm_admin:ADMIN");
        MockedUserService userService = new MockedUserService();

        recreateFilter();
        service.setUserService(userService);

        // JWT with nested realm_access.roles containing "demo" (maps to USER)
        long now = System.currentTimeMillis() / 1000;
        java.util.Map<String, Object> realmAccess = new java.util.HashMap<>();
        realmAccess.put(
                "roles",
                java.util.Arrays.asList(
                        "default-roles-ams2", "offline_access", "uma_authorization", "demo"));
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("sub-demo-user")
                        .withClaim("email", "demo-user@example.com")
                        .withClaim("realm_access", realmAccess)
                        .withIssuedAt(new Date(now * 1000))
                        .withExpiresAt(new Date((now + 3600) * 1000))
                        .sign(rsaAlgorithm);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth, "Bearer request should authenticate");
        User principal = (User) auth.getPrincipal();
        assertEquals(
                Role.USER,
                principal.getRole(),
                "demo role mapped to USER should override GUEST default");
    }

    /**
     * When roleMappings are configured, unmapped IdP role names should NOT be compared against
     * GeoStore role names. An IdP role literally named "admin" (without a mapping) should not grant
     * ADMIN access.
     */
    @Test
    public void testUnmappedIdpRoleNamedAdmin_DoesNotGrantAdmin() throws Exception {
        configuration.setAllowBearerTokens(true);
        configuration.setRolesClaim("roles");
        configuration.setAuthenticatedDefaultRole("USER");
        // Only map "realm_admin" to ADMIN — a raw "admin" role should be ignored
        configuration.setRoleMappings("realm_admin:ADMIN");
        MockedUserService userService = new MockedUserService();

        recreateFilter();
        service.setUserService(userService);

        // JWT with a role literally named "admin" but NOT in roleMappings
        long now = System.currentTimeMillis() / 1000;
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("sub-sneaky")
                        .withClaim("email", "sneaky@example.com")
                        .withArrayClaim("roles", new String[] {"admin", "viewer"})
                        .withIssuedAt(new Date(now * 1000))
                        .withExpiresAt(new Date((now + 3600) * 1000))
                        .sign(rsaAlgorithm);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth, "Bearer request should authenticate");
        User principal = (User) auth.getPrincipal();
        assertEquals(
                Role.USER,
                principal.getRole(),
                "Unmapped IdP role named 'admin' should NOT grant ADMIN when roleMappings are set");
    }

    /**
     * Deeply nested role claim: resource_access.account.roles — a 3-level Keycloak structure.
     * Verifies that role mapping to USER works through a deeply nested path.
     */
    @Test
    public void testDeeplyNestedRoles_ResourceAccessAccountRoles() throws Exception {
        configuration.setAllowBearerTokens(true);
        configuration.setRolesClaim("resource_access.account.roles");
        configuration.setAuthenticatedDefaultRole("GUEST");
        configuration.setRoleMappings("manage-account:USER,manage-realm:ADMIN");
        MockedUserService userService = new MockedUserService();

        recreateFilter();
        service.setUserService(userService);

        long now = System.currentTimeMillis() / 1000;
        // Mirrors real Keycloak token: resource_access.account.roles
        java.util.Map<String, Object> accountAccess = new java.util.HashMap<>();
        accountAccess.put(
                "roles",
                java.util.Arrays.asList("manage-account", "manage-account-links", "view-profile"));
        java.util.Map<String, Object> resourceAccess = new java.util.HashMap<>();
        resourceAccess.put("account", accountAccess);

        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("sub-deep-roles")
                        .withClaim("email", "deep-roles@example.com")
                        .withClaim("resource_access", resourceAccess)
                        .withIssuedAt(new Date(now * 1000))
                        .withExpiresAt(new Date((now + 3600) * 1000))
                        .sign(rsaAlgorithm);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth, "Bearer request should authenticate");
        User principal = (User) auth.getPrincipal();
        assertEquals(
                Role.USER,
                principal.getRole(),
                "manage-account mapped to USER should override GUEST default "
                        + "via resource_access.account.roles");
    }

    /**
     * Deeply nested role claim resolving to ADMIN: resource_access.app.roles with a role that maps
     * to ADMIN. Verifies ADMIN promotion through a 3-level path.
     */
    @Test
    public void testDeeplyNestedRoles_ResourceAccessApp_AdminPromotion() throws Exception {
        configuration.setAllowBearerTokens(true);
        configuration.setRolesClaim("resource_access.myapp.roles");
        configuration.setAuthenticatedDefaultRole("USER");
        configuration.setRoleMappings("app-admin:ADMIN,app-viewer:GUEST");
        MockedUserService userService = new MockedUserService();

        recreateFilter();
        service.setUserService(userService);

        long now = System.currentTimeMillis() / 1000;
        java.util.Map<String, Object> appAccess = new java.util.HashMap<>();
        appAccess.put("roles", java.util.Arrays.asList("app-admin", "app-viewer"));
        java.util.Map<String, Object> resourceAccess = new java.util.HashMap<>();
        resourceAccess.put("myapp", appAccess);

        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("sub-deep-admin")
                        .withClaim("email", "deep-admin@example.com")
                        .withClaim("resource_access", resourceAccess)
                        .withIssuedAt(new Date(now * 1000))
                        .withExpiresAt(new Date((now + 3600) * 1000))
                        .sign(rsaAlgorithm);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth, "Bearer request should authenticate");
        User principal = (User) auth.getPrincipal();
        assertEquals(
                Role.ADMIN,
                principal.getRole(),
                "app-admin mapped to ADMIN should promote via resource_access.myapp.roles");
    }

    /**
     * Deeply nested groups claim: resource_access.geostore.groups with group mappings. Verifies
     * groups are extracted from a 3-level path and mapped correctly.
     */
    @Test
    public void testDeeplyNestedGroups_WithMappings() throws Exception {
        configuration.setAllowBearerTokens(true);
        configuration.setGroupsClaim("resource_access.geostore.groups");
        configuration.setGroupMappings("devs:developers,ops:operations");
        MockedUserService userService = new MockedUserService();

        recreateFilter();
        service.setUserService(userService);

        long now = System.currentTimeMillis() / 1000;
        java.util.Map<String, Object> geostoreAccess = new java.util.HashMap<>();
        geostoreAccess.put("groups", java.util.Arrays.asList("devs", "ops", "external"));
        java.util.Map<String, Object> resourceAccess = new java.util.HashMap<>();
        resourceAccess.put("geostore", geostoreAccess);

        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("sub-deep-groups")
                        .withClaim("email", "deep-groups@example.com")
                        .withClaim("resource_access", resourceAccess)
                        .withIssuedAt(new Date(now * 1000))
                        .withExpiresAt(new Date((now + 3600) * 1000))
                        .sign(rsaAlgorithm);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth, "Bearer request should authenticate");
        User principal = (User) auth.getPrincipal();
        Set<String> groupNames =
                principal.getGroups().stream()
                        .map(UserGroup::getGroupName)
                        .collect(Collectors.toSet());
        assertTrue(groupNames.contains("developers"), "devs should be mapped to developers");
        assertTrue(groupNames.contains("operations"), "ops should be mapped to operations");
        assertTrue(
                groupNames.contains("external"),
                "external should pass through (dropUnmapped=false)");
    }

    /** Deeply nested groups claim with dropUnmapped=true: only mapped groups survive. */
    @Test
    public void testDeeplyNestedGroups_DropUnmapped() throws Exception {
        configuration.setAllowBearerTokens(true);
        configuration.setGroupsClaim("resource_access.geostore.groups");
        configuration.setGroupMappings("devs:developers");
        configuration.setDropUnmapped(true);
        MockedUserService userService = new MockedUserService();

        recreateFilter();
        service.setUserService(userService);

        long now = System.currentTimeMillis() / 1000;
        java.util.Map<String, Object> geostoreAccess = new java.util.HashMap<>();
        geostoreAccess.put("groups", java.util.Arrays.asList("devs", "unmapped-group"));
        java.util.Map<String, Object> resourceAccess = new java.util.HashMap<>();
        resourceAccess.put("geostore", geostoreAccess);

        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("sub-drop-groups")
                        .withClaim("email", "drop-groups@example.com")
                        .withClaim("resource_access", resourceAccess)
                        .withIssuedAt(new Date(now * 1000))
                        .withExpiresAt(new Date((now + 3600) * 1000))
                        .sign(rsaAlgorithm);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth, "Bearer request should authenticate");
        User principal = (User) auth.getPrincipal();
        Set<String> groupNames =
                principal.getGroups().stream()
                        .map(UserGroup::getGroupName)
                        .collect(Collectors.toSet());
        assertTrue(groupNames.contains("developers"), "devs should be mapped to developers");
        assertFalse(
                groupNames.contains("unmapped-group"),
                "unmapped-group should be dropped when dropUnmapped=true");
    }

    /**
     * Combined test: deeply nested roles AND groups from the same token, with role mapping to USER.
     * Mirrors a real Keycloak token structure with both realm_access.roles and a custom groups
     * claim.
     */
    @Test
    public void testCombinedNestedRolesAndGroups_UserRole() throws Exception {
        configuration.setAllowBearerTokens(true);
        configuration.setRolesClaim("realm_access.roles");
        configuration.setGroupsClaim("resource_access.geostore.groups");
        configuration.setAuthenticatedDefaultRole("GUEST");
        configuration.setRoleMappings("demo:USER,realm_admin:ADMIN");
        configuration.setGroupMappings("analysts:gis-analysts");
        MockedUserService userService = new MockedUserService();

        recreateFilter();
        service.setUserService(userService);

        long now = System.currentTimeMillis() / 1000;
        // Build a realistic Keycloak-like JWT
        java.util.Map<String, Object> realmAccess = new java.util.HashMap<>();
        realmAccess.put(
                "roles",
                java.util.Arrays.asList(
                        "default-roles-ams2", "offline_access", "uma_authorization", "demo"));
        java.util.Map<String, Object> geostoreAccess = new java.util.HashMap<>();
        geostoreAccess.put("groups", java.util.Arrays.asList("analysts", "editors"));
        java.util.Map<String, Object> resourceAccess = new java.util.HashMap<>();
        resourceAccess.put("geostore", geostoreAccess);

        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("sub-combined")
                        .withClaim("email", "combined@example.com")
                        .withClaim("realm_access", realmAccess)
                        .withClaim("resource_access", resourceAccess)
                        .withIssuedAt(new Date(now * 1000))
                        .withExpiresAt(new Date((now + 3600) * 1000))
                        .sign(rsaAlgorithm);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth, "Bearer request should authenticate");
        User principal = (User) auth.getPrincipal();

        // Role: "demo" maps to USER, overriding GUEST default
        assertEquals(
                Role.USER,
                principal.getRole(),
                "demo mapped to USER should override GUEST default");

        // Groups: "analysts" mapped to "gis-analysts", "editors" passes through
        Set<String> groupNames =
                principal.getGroups().stream()
                        .map(UserGroup::getGroupName)
                        .collect(Collectors.toSet());
        assertTrue(groupNames.contains("gis-analysts"), "analysts should map to gis-analysts");
        assertTrue(groupNames.contains("editors"), "editors should pass through unmapped");
    }

    /**
     * Wildcard JsonPath for roles: $.resource_access.*.roles collects roles across all resource
     * clients. Verifies that a role mapped to USER is found even when spread across clients.
     */
    @Test
    public void testWildcardJsonPathRoles_UserMapping() throws Exception {
        configuration.setAllowBearerTokens(true);
        configuration.setRolesClaim("$.resource_access.*.roles");
        configuration.setAuthenticatedDefaultRole("GUEST");
        configuration.setRoleMappings("view-profile:USER,manage-realm:ADMIN");
        MockedUserService userService = new MockedUserService();

        recreateFilter();
        service.setUserService(userService);

        long now = System.currentTimeMillis() / 1000;
        java.util.Map<String, Object> accountAccess = new java.util.HashMap<>();
        accountAccess.put("roles", java.util.Arrays.asList("manage-account", "view-profile"));
        java.util.Map<String, Object> appAccess = new java.util.HashMap<>();
        appAccess.put("roles", java.util.Arrays.asList("app-reader"));
        java.util.Map<String, Object> resourceAccess = new java.util.HashMap<>();
        resourceAccess.put("account", accountAccess);
        resourceAccess.put("myapp", appAccess);

        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("sub-wildcard-user")
                        .withClaim("email", "wildcard-user@example.com")
                        .withClaim("resource_access", resourceAccess)
                        .withIssuedAt(new Date(now * 1000))
                        .withExpiresAt(new Date((now + 3600) * 1000))
                        .sign(rsaAlgorithm);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth, "Bearer request should authenticate");
        User principal = (User) auth.getPrincipal();
        assertEquals(
                Role.USER,
                principal.getRole(),
                "view-profile mapped to USER via wildcard path should override GUEST default");
    }

    // -----------------------------------------------------------------------
    // Issue-specific regression tests
    // -----------------------------------------------------------------------

    /**
     * Regression: an existing ADMIN user must still receive groups from the token. The reported bug
     * is "se sei admin non ti aggiunge i gruppi" — groups are not synced for ADMIN users.
     */
    @Test
    public void testAdminUser_GroupsStillSynced() throws Exception {
        configuration.setAllowBearerTokens(true);
        configuration.setRolesClaim("realm_access.roles");
        configuration.setGroupsClaim("groups");
        configuration.setAuthenticatedDefaultRole("USER");
        MockedUserService userService = new MockedUserService();

        // Pre-create an ADMIN user in the DB (simulates an existing admin)
        User adminUser = new User();
        adminUser.setName("admin@example.com");
        adminUser.setRole(Role.ADMIN);
        adminUser.setEnabled(true);
        adminUser.setNewPassword("");
        adminUser.setGroups(new java.util.HashSet<>());
        userService.insert(adminUser);

        recreateFilter();
        service.setUserService(userService);

        long now = System.currentTimeMillis() / 1000;
        java.util.Map<String, Object> realmAccess = new java.util.HashMap<>();
        realmAccess.put("roles", java.util.Arrays.asList("ADMIN"));
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("sub-admin-groups")
                        .withClaim("email", "admin@example.com")
                        .withClaim("realm_access", realmAccess)
                        .withClaim(
                                "groups",
                                java.util.Arrays.asList("analysts", "editors", "managers"))
                        .withIssuedAt(new Date(now * 1000))
                        .withExpiresAt(new Date((now + 3600) * 1000))
                        .sign(rsaAlgorithm);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth, "Bearer request should authenticate");
        User principal = (User) auth.getPrincipal();
        assertEquals(Role.ADMIN, principal.getRole(), "User should remain ADMIN");

        Set<String> groupNames =
                principal.getGroups().stream()
                        .map(UserGroup::getGroupName)
                        .collect(Collectors.toSet());
        assertTrue(
                groupNames.contains("analysts"),
                "ADMIN user should have 'analysts' group from token");
        assertTrue(
                groupNames.contains("editors"),
                "ADMIN user should have 'editors' group from token");
        assertTrue(
                groupNames.contains("managers"),
                "ADMIN user should have 'managers' group from token");
        assertEquals(3, groupNames.size(), "ADMIN user should have exactly 3 groups from token");
    }

    /**
     * Regression: an existing ADMIN user with nested roles (realm_access.roles) AND nested groups
     * (resource_access.geostore.groups) must get both role and groups synced.
     */
    @Test
    public void testAdminUser_NestedRolesAndGroups() throws Exception {
        configuration.setAllowBearerTokens(true);
        configuration.setRolesClaim("realm_access.roles");
        configuration.setGroupsClaim("resource_access.geostore.groups");
        configuration.setAuthenticatedDefaultRole("USER");
        configuration.setRoleMappings("realm_admin:ADMIN");
        MockedUserService userService = new MockedUserService();

        // Pre-create ADMIN user
        User adminUser = new User();
        adminUser.setName("nested-admin@example.com");
        adminUser.setRole(Role.ADMIN);
        adminUser.setEnabled(true);
        adminUser.setNewPassword("");
        adminUser.setGroups(new java.util.HashSet<>());
        userService.insert(adminUser);

        recreateFilter();
        service.setUserService(userService);

        long now = System.currentTimeMillis() / 1000;
        java.util.Map<String, Object> realmAccess = new java.util.HashMap<>();
        realmAccess.put("roles", java.util.Arrays.asList("realm_admin", "offline_access"));
        java.util.Map<String, Object> geostoreAccess = new java.util.HashMap<>();
        geostoreAccess.put("groups", java.util.Arrays.asList("gis-team", "data-admins"));
        java.util.Map<String, Object> resourceAccess = new java.util.HashMap<>();
        resourceAccess.put("geostore", geostoreAccess);

        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("sub-nested-admin")
                        .withClaim("email", "nested-admin@example.com")
                        .withClaim("realm_access", realmAccess)
                        .withClaim("resource_access", resourceAccess)
                        .withIssuedAt(new Date(now * 1000))
                        .withExpiresAt(new Date((now + 3600) * 1000))
                        .sign(rsaAlgorithm);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth, "Bearer request should authenticate");
        User principal = (User) auth.getPrincipal();
        assertEquals(Role.ADMIN, principal.getRole(), "realm_admin should map to ADMIN");

        Set<String> groupNames =
                principal.getGroups().stream()
                        .map(UserGroup::getGroupName)
                        .collect(Collectors.toSet());
        assertTrue(
                groupNames.contains("gis-team"),
                "ADMIN user should have 'gis-team' from nested groups");
        assertTrue(
                groupNames.contains("data-admins"),
                "ADMIN user should have 'data-admins' from nested groups");
    }

    /**
     * Regression: rolesClaim=resource_access.account.roles should resolve roles from the deeply
     * nested Keycloak client-scoped roles. Tests with a realistic Keycloak token structure where
     * resource_access contains multiple clients.
     */
    @Test
    public void testResourceAccessAccountRoles_RealisticKeycloakToken() throws Exception {
        configuration.setAllowBearerTokens(true);
        configuration.setRolesClaim("resource_access.account.roles");
        configuration.setAuthenticatedDefaultRole("USER");
        // Map Keycloak's client-level "manage-account" role to ADMIN
        configuration.setRoleMappings("manage-account:ADMIN");
        MockedUserService userService = new MockedUserService();

        recreateFilter();
        service.setUserService(userService);

        long now = System.currentTimeMillis() / 1000;
        // Realistic Keycloak token structure with multiple resource_access clients
        java.util.Map<String, Object> accountRoles = new java.util.HashMap<>();
        accountRoles.put(
                "roles",
                java.util.Arrays.asList("manage-account", "manage-account-links", "view-profile"));
        java.util.Map<String, Object> realmMgmtRoles = new java.util.HashMap<>();
        realmMgmtRoles.put("roles", java.util.Arrays.asList("view-realm", "view-users"));
        java.util.Map<String, Object> resourceAccess = new java.util.HashMap<>();
        resourceAccess.put("account", accountRoles);
        resourceAccess.put("realm-management", realmMgmtRoles);

        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("sub-resource-access")
                        .withClaim("email", "resource-user@example.com")
                        .withClaim("resource_access", resourceAccess)
                        .withIssuedAt(new Date(now * 1000))
                        .withExpiresAt(new Date((now + 3600) * 1000))
                        .sign(rsaAlgorithm);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth, "Bearer request should authenticate");
        User principal = (User) auth.getPrincipal();
        assertEquals(
                Role.ADMIN,
                principal.getRole(),
                "manage-account from resource_access.account.roles should map to ADMIN");
    }

    /**
     * Regression: resource_access.account.roles with no matching role mappings should fall back to
     * authenticatedDefaultRole. Verifies that the deeply nested path resolves correctly even when
     * no role matches.
     */
    @Test
    public void testResourceAccessAccountRoles_NoMatchFallsBackToDefault() throws Exception {
        configuration.setAllowBearerTokens(true);
        configuration.setRolesClaim("resource_access.account.roles");
        configuration.setAuthenticatedDefaultRole("USER");
        // Only map something that is NOT in the token
        configuration.setRoleMappings("super-admin:ADMIN");
        MockedUserService userService = new MockedUserService();

        recreateFilter();
        service.setUserService(userService);

        long now = System.currentTimeMillis() / 1000;
        java.util.Map<String, Object> accountRoles = new java.util.HashMap<>();
        accountRoles.put(
                "roles",
                java.util.Arrays.asList("manage-account", "manage-account-links", "view-profile"));
        java.util.Map<String, Object> resourceAccess = new java.util.HashMap<>();
        resourceAccess.put("account", accountRoles);

        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("sub-resource-default")
                        .withClaim("email", "resource-default@example.com")
                        .withClaim("resource_access", resourceAccess)
                        .withIssuedAt(new Date(now * 1000))
                        .withExpiresAt(new Date((now + 3600) * 1000))
                        .sign(rsaAlgorithm);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth, "Bearer request should authenticate");
        User principal = (User) auth.getPrincipal();
        assertEquals(
                Role.USER,
                principal.getRole(),
                "No matching role mapping should fall back to USER default");
    }

    /**
     * Regression: combined test with resource_access.account.roles for roles AND a separate groups
     * claim. Verifies both work together correctly, including for ADMIN users.
     */
    @Test
    public void testResourceAccessAccountRoles_WithGroupsCombined() throws Exception {
        configuration.setAllowBearerTokens(true);
        configuration.setRolesClaim("resource_access.account.roles");
        configuration.setGroupsClaim("groups");
        configuration.setAuthenticatedDefaultRole("USER");
        configuration.setRoleMappings("manage-account:ADMIN");
        MockedUserService userService = new MockedUserService();

        recreateFilter();
        service.setUserService(userService);

        long now = System.currentTimeMillis() / 1000;
        java.util.Map<String, Object> accountRoles = new java.util.HashMap<>();
        accountRoles.put(
                "roles",
                java.util.Arrays.asList("manage-account", "manage-account-links", "view-profile"));
        java.util.Map<String, Object> resourceAccess = new java.util.HashMap<>();
        resourceAccess.put("account", accountRoles);

        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("sub-combined-resource")
                        .withClaim("email", "combined-resource@example.com")
                        .withClaim("resource_access", resourceAccess)
                        .withClaim("groups", java.util.Arrays.asList("team-a", "team-b"))
                        .withIssuedAt(new Date(now * 1000))
                        .withExpiresAt(new Date((now + 3600) * 1000))
                        .sign(rsaAlgorithm);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth, "Bearer request should authenticate");
        User principal = (User) auth.getPrincipal();
        assertEquals(Role.ADMIN, principal.getRole(), "manage-account should map to ADMIN");

        Set<String> groupNames =
                principal.getGroups().stream()
                        .map(UserGroup::getGroupName)
                        .collect(Collectors.toSet());
        assertTrue(
                groupNames.contains("team-a"),
                "ADMIN from resource_access claim should still get groups");
        assertTrue(
                groupNames.contains("team-b"),
                "ADMIN from resource_access claim should still get groups");
    }

    /**
     * Regression: a newly auto-created ADMIN user (not pre-existing in DB) must receive groups.
     * This tests the createUser → addAuthoritiesFromToken flow end-to-end.
     */
    @Test
    public void testNewAdminUser_AutoCreatedWithGroups() throws Exception {
        configuration.setAllowBearerTokens(true);
        configuration.setRolesClaim("realm_access.roles");
        configuration.setGroupsClaim("groups");
        configuration.setAuthenticatedDefaultRole("USER");
        configuration.setAutoCreateUser(true);
        MockedUserService userService = new MockedUserService();

        recreateFilter();
        service.setUserService(userService);

        // User does NOT pre-exist in DB — will be auto-created
        long now = System.currentTimeMillis() / 1000;
        java.util.Map<String, Object> realmAccess = new java.util.HashMap<>();
        realmAccess.put("roles", java.util.Arrays.asList("ADMIN"));
        String jwt =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("sub-new-admin")
                        .withClaim("email", "new-admin@example.com")
                        .withClaim("realm_access", realmAccess)
                        .withClaim("groups", java.util.Arrays.asList("ops", "infra"))
                        .withIssuedAt(new Date(now * 1000))
                        .withExpiresAt(new Date((now + 3600) * 1000))
                        .sign(rsaAlgorithm);

        MockHttpServletRequest request = createRequest("rest/resources");
        request.addHeader("Authorization", "Bearer " + jwt);
        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth, "Bearer request should authenticate");
        User principal = (User) auth.getPrincipal();
        assertEquals(Role.ADMIN, principal.getRole(), "New user should be ADMIN from token");

        Set<String> groupNames =
                principal.getGroups().stream()
                        .map(UserGroup::getGroupName)
                        .collect(Collectors.toSet());
        assertTrue(groupNames.contains("ops"), "Auto-created ADMIN should have 'ops' group");
        assertTrue(groupNames.contains("infra"), "Auto-created ADMIN should have 'infra' group");
    }

    // -----------------------------------------------------------------------
    // Keycloak split-token tests: ID token vs access token claim resolution
    // In real Keycloak, the ID token does NOT contain realm_access,
    // resource_access, or groups — only the access token does.
    // -----------------------------------------------------------------------

    /** Helper: creates a minimal Keycloak-like ID token (no realm_access, no groups). */
    private String createKeycloakIdToken(String email) {
        long now = System.currentTimeMillis() / 1000;
        return JWT.create()
                .withKeyId(TEST_KID)
                .withIssuer("https://test.issuer/")
                .withAudience(CLIENT_ID)
                .withSubject("sub-" + email)
                .withClaim("email", email)
                .withClaim("preferred_username", email)
                .withClaim("name", "Test User")
                .withClaim("given_name", "Test")
                .withClaim("family_name", "User")
                // NO realm_access, NO resource_access, NO groups
                .withIssuedAt(new Date(now * 1000))
                .withExpiresAt(new Date((now + 3600) * 1000))
                .sign(rsaAlgorithm);
    }

    /**
     * Helper: creates a Keycloak-like access token WITH realm_access, resource_access, and groups.
     */
    private String createKeycloakAccessToken(
            String email,
            java.util.List<String> realmRoles,
            java.util.Map<String, Object> resourceAccess,
            java.util.List<String> groups) {
        long now = System.currentTimeMillis() / 1000;
        com.auth0.jwt.JWTCreator.Builder builder =
                JWT.create()
                        .withKeyId(TEST_KID)
                        .withIssuer("https://test.issuer/")
                        .withAudience(CLIENT_ID)
                        .withSubject("sub-" + email)
                        .withClaim("preferred_username", email)
                        .withIssuedAt(new Date(now * 1000))
                        .withExpiresAt(new Date((now + 3600) * 1000));
        if (realmRoles != null) {
            java.util.Map<String, Object> realmAccess = new java.util.HashMap<>();
            realmAccess.put("roles", realmRoles);
            builder = builder.withClaim("realm_access", realmAccess);
        }
        if (resourceAccess != null) {
            builder = builder.withClaim("resource_access", resourceAccess);
        }
        if (groups != null) {
            builder = builder.withClaim("groups", groups);
        }
        return builder.sign(rsaAlgorithm);
    }

    /**
     * Scenario 1a: rolesClaim=realm_access.roles, NO roleMappings. Keycloak ID token does NOT
     * contain realm_access → falls back to access token. Access token has realm_access.roles =
     * [default-roles-ams2, offline_access, ...]. Without roleMappings, none of these match
     * ADMIN/USER/GUEST → user stays at defaultRole=USER. Groups claim (groups) is also only in
     * access token.
     *
     * <p>Expected: USER role, but groups SHOULD still be synced from access token. This reproduces
     * "sarai user e non avrai gruppi" — before the fix, both realm_access.roles and groups would
     * resolve to null because only the ID token was checked.
     */
    @Test
    public void testKeycloakSplitToken_NoRoleMappings_UserWithGroups() throws Exception {
        configuration.setRolesClaim("realm_access.roles");
        configuration.setGroupsClaim("groups");
        configuration.setAuthenticatedDefaultRole("USER");
        // No roleMappings configured
        configuration.setRoleMappings(null);
        MockedUserService userService = new MockedUserService();

        recreateFilter();
        service.setUserService(userService);

        // Create a user first (simulating auto-create)
        User user = new User();
        user.setName("keycloak-user@example.com");
        user.setRole(Role.USER);
        user.setEnabled(true);
        user.setNewPassword("");
        user.setGroups(new java.util.HashSet<>());
        userService.insert(user);

        // Simulate what createPreAuthentication does: ID token primary, access token fallback
        String idToken = createKeycloakIdToken("keycloak-user@example.com");
        String accessToken =
                createKeycloakAccessToken(
                        "keycloak-user@example.com",
                        java.util.Arrays.asList(
                                "default-roles-ams2", "offline_access", "uma_authorization"),
                        null,
                        java.util.Arrays.asList("analysts", "editors"));

        // Retrieve the user as the filter would
        User dbUser = userService.get("keycloak-user@example.com");

        // Call addAuthoritiesFromToken with split tokens (the fix)
        service.addAuthoritiesFromToken(dbUser, idToken, accessToken, null);

        assertEquals(
                Role.USER,
                dbUser.getRole(),
                "No roleMappings → unmapped Keycloak roles should not match → USER");

        Set<String> groupNames =
                dbUser.getGroups().stream()
                        .map(UserGroup::getGroupName)
                        .collect(Collectors.toSet());
        assertTrue(
                groupNames.contains("analysts"),
                "Groups from access token should be synced even when user is USER");
        assertTrue(
                groupNames.contains("editors"),
                "Groups from access token should be synced even when user is USER");
    }

    /**
     * Scenario 1b: rolesClaim=realm_access.roles, WITH roleMappings=default-roles-ams2:ADMIN.
     * Keycloak ID token does NOT contain realm_access → falls back to access token. Access token
     * has realm_access.roles = [default-roles-ams2, ...]. With the mapping, default-roles-ams2 →
     * ADMIN.
     *
     * <p>Expected: ADMIN role AND groups synced. This reproduces "se metti la riga
     * roleMappings=default-roles-ams2:ADMIN, sarai admin e avrai i gruppi".
     */
    @Test
    public void testKeycloakSplitToken_WithRoleMappings_AdminWithGroups() throws Exception {
        configuration.setRolesClaim("realm_access.roles");
        configuration.setGroupsClaim("groups");
        configuration.setAuthenticatedDefaultRole("USER");
        configuration.setRoleMappings("default-roles-ams2:ADMIN");
        MockedUserService userService = new MockedUserService();

        recreateFilter();
        service.setUserService(userService);

        User user = new User();
        user.setName("keycloak-admin@example.com");
        user.setRole(Role.USER);
        user.setEnabled(true);
        user.setNewPassword("");
        user.setGroups(new java.util.HashSet<>());
        userService.insert(user);

        String idToken = createKeycloakIdToken("keycloak-admin@example.com");
        String accessToken =
                createKeycloakAccessToken(
                        "keycloak-admin@example.com",
                        java.util.Arrays.asList(
                                "default-roles-ams2", "offline_access", "uma_authorization"),
                        null,
                        java.util.Arrays.asList("analysts", "editors", "managers"));

        User dbUser = userService.get("keycloak-admin@example.com");
        service.addAuthoritiesFromToken(dbUser, idToken, accessToken, null);

        assertEquals(
                Role.ADMIN,
                dbUser.getRole(),
                "default-roles-ams2 mapped to ADMIN via roleMappings");

        Set<String> groupNames =
                dbUser.getGroups().stream()
                        .map(UserGroup::getGroupName)
                        .collect(Collectors.toSet());
        assertTrue(groupNames.contains("analysts"), "ADMIN should have groups from access token");
        assertTrue(groupNames.contains("editors"), "ADMIN should have groups from access token");
        assertTrue(groupNames.contains("managers"), "ADMIN should have groups from access token");
    }

    /**
     * Scenario 2: rolesClaim=resource_access.account.roles, WITH roleMappings=manage-account:ADMIN.
     * The comment "Questo non funziona" in the config refers to this. Keycloak ID token does NOT
     * contain resource_access → must fall back to access token.
     *
     * <p>Expected: ADMIN role (manage-account mapped to ADMIN).
     */
    @Test
    public void testKeycloakSplitToken_ResourceAccessAccountRoles() throws Exception {
        configuration.setRolesClaim("resource_access.account.roles");
        configuration.setAuthenticatedDefaultRole("USER");
        configuration.setRoleMappings("manage-account:ADMIN");
        MockedUserService userService = new MockedUserService();

        recreateFilter();
        service.setUserService(userService);

        User user = new User();
        user.setName("resource-user@example.com");
        user.setRole(Role.USER);
        user.setEnabled(true);
        user.setNewPassword("");
        user.setGroups(new java.util.HashSet<>());
        userService.insert(user);

        // ID token: NO resource_access
        String idToken = createKeycloakIdToken("resource-user@example.com");
        // Access token: HAS resource_access.account.roles
        java.util.Map<String, Object> accountRoles = new java.util.HashMap<>();
        accountRoles.put(
                "roles",
                java.util.Arrays.asList("manage-account", "manage-account-links", "view-profile"));
        java.util.Map<String, Object> resourceAccess = new java.util.HashMap<>();
        resourceAccess.put("account", accountRoles);

        String accessToken =
                createKeycloakAccessToken("resource-user@example.com", null, resourceAccess, null);

        User dbUser = userService.get("resource-user@example.com");
        service.addAuthoritiesFromToken(dbUser, idToken, accessToken, null);

        assertEquals(
                Role.ADMIN,
                dbUser.getRole(),
                "resource_access.account.roles with manage-account:ADMIN mapping "
                        + "should resolve from access token fallback");
    }

    /**
     * Scenario 2b: rolesClaim=resource_access.account.roles, WITHOUT roleMappings. Even though
     * resource_access.account.roles resolves, none of the values (manage-account,
     * manage-account-links, view-profile) match GeoStore roles.
     *
     * <p>Expected: falls back to authenticatedDefaultRole=USER.
     */
    @Test
    public void testKeycloakSplitToken_ResourceAccessAccountRoles_NoMapping() throws Exception {
        configuration.setRolesClaim("resource_access.account.roles");
        configuration.setAuthenticatedDefaultRole("USER");
        configuration.setRoleMappings(null);
        MockedUserService userService = new MockedUserService();

        recreateFilter();
        service.setUserService(userService);

        User user = new User();
        user.setName("resource-nomatch@example.com");
        user.setRole(Role.USER);
        user.setEnabled(true);
        user.setNewPassword("");
        user.setGroups(new java.util.HashSet<>());
        userService.insert(user);

        String idToken = createKeycloakIdToken("resource-nomatch@example.com");
        java.util.Map<String, Object> accountRoles = new java.util.HashMap<>();
        accountRoles.put(
                "roles",
                java.util.Arrays.asList("manage-account", "manage-account-links", "view-profile"));
        java.util.Map<String, Object> resourceAccess = new java.util.HashMap<>();
        resourceAccess.put("account", accountRoles);

        String accessToken =
                createKeycloakAccessToken(
                        "resource-nomatch@example.com", null, resourceAccess, null);

        User dbUser = userService.get("resource-nomatch@example.com");
        service.addAuthoritiesFromToken(dbUser, idToken, accessToken, null);

        assertEquals(
                Role.USER,
                dbUser.getRole(),
                "No roleMappings and Keycloak client roles don't match GeoStore roles → USER");
    }

    /**
     * Scenario 3: Verify that when ONLY the ID token is provided (no access token fallback),
     * realm_access.roles resolves to null — confirming the pre-fix behavior. This proves the access
     * token fallback is essential.
     */
    @Test
    public void testKeycloakIdTokenOnly_RealmAccessNotFound() throws Exception {
        configuration.setRolesClaim("realm_access.roles");
        configuration.setGroupsClaim("groups");
        configuration.setAuthenticatedDefaultRole("USER");
        configuration.setRoleMappings("default-roles-ams2:ADMIN");
        MockedUserService userService = new MockedUserService();

        recreateFilter();
        service.setUserService(userService);

        User user = new User();
        user.setName("idtoken-only@example.com");
        user.setRole(Role.USER);
        user.setEnabled(true);
        user.setNewPassword("");
        user.setGroups(new java.util.HashSet<>());
        userService.insert(user);

        // Only pass ID token, NO access token fallback (simulates the pre-fix behavior)
        String idToken = createKeycloakIdToken("idtoken-only@example.com");

        User dbUser = userService.get("idtoken-only@example.com");
        service.addAuthoritiesFromToken(dbUser, idToken, null, null);

        // Without access token fallback, realm_access.roles is not in ID token → USER
        assertEquals(
                Role.USER,
                dbUser.getRole(),
                "ID token alone should NOT contain realm_access → falls back to USER");
        assertTrue(
                dbUser.getGroups().isEmpty(), "ID token alone should NOT contain groups → empty");
    }

    /** Recreates the filter with current configuration (picks up JWE config changes). */
    private void recreateFilter() {
        OpenIdConnectRestClient restClient = new OpenIdConnectRestClient(configuration);
        JwksRsaKeyProvider jwksKeyProvider =
                new JwksRsaKeyProvider(authService + "/certs", configuration);
        this.cache =
                new TokenAuthenticationCache(
                        configuration.getCacheSize(), configuration.getCacheExpirationMinutes());
        MultiTokenValidator validator =
                new MultiTokenValidator(
                        java.util.Arrays.asList(
                                new AudienceAccessTokenValidator(), new SubjectTokenValidator()));
        this.service =
                new OpenIdConnectAuthenticationService(
                        this.cache, null, null, configuration, validator, jwksKeyProvider);
        this.filter = new OpenIdConnectFilter(configuration, this.service, restClient);
    }

    /** Creates a properly RSA-signed JWT with email, sub, and aud claims. */
    private String createSignedJwt(String email, String sub, String aud) {
        long now = System.currentTimeMillis() / 1000;
        return JWT.create()
                .withKeyId(TEST_KID)
                .withIssuer("https://test.issuer/")
                .withAudience(aud)
                .withSubject(sub)
                .withClaim("email", email)
                .withIssuedAt(new Date(now * 1000))
                .withExpiresAt(new Date((now + 3600) * 1000))
                .sign(rsaAlgorithm);
    }

    /** Builds a JWKS JSON string from the given RSA public key with the specified kid. */
    private static String buildJwksJson(RSAPublicKey publicKey, String kid) {
        Base64.Encoder encoder = Base64.getUrlEncoder().withoutPadding();
        String n = encoder.encodeToString(publicKey.getModulus().toByteArray());
        String e = encoder.encodeToString(publicKey.getPublicExponent().toByteArray());
        return "{\"keys\":[{"
                + "\"kty\":\"RSA\","
                + "\"use\":\"sig\","
                + "\"alg\":\"RS256\","
                + "\"kid\":\""
                + kid
                + "\","
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
