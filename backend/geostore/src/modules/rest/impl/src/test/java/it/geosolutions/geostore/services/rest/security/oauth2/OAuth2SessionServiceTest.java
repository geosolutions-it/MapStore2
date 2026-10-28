/* ====================================================================
 *
 * Copyright (C) 2022-2025 GeoSolutions S.A.S.
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

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.containing;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.postRequestedFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlPathEqualTo;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;

import static it.geosolutions.geostore.services.rest.SessionServiceDelegate.PROVIDER_KEY;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.github.tomakehurst.wiremock.WireMockServer;

import it.geosolutions.geostore.services.rest.RESTSessionService;
import it.geosolutions.geostore.services.rest.impl.RESTSessionServiceImpl;
import it.geosolutions.geostore.services.rest.security.TokenAuthenticationCache;
import it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.OpenIdConnectConfiguration;
import it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.OpenIdConnectSessionServiceDelegate;
import it.geosolutions.geostore.services.rest.utils.GeoStoreContext;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import wiremock.org.eclipse.jetty.http.HttpStatus;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;

public class OAuth2SessionServiceTest {

    private static final String ID_TOKEN = "test.id.token";
    private static final String ACCESS_TOKEN = "access_token";

    private static OAuth2AccessToken bearer(String value) {
        return new OAuth2AccessToken(
                OAuth2AccessToken.TokenType.BEARER, value, Instant.now(), null);
    }

    @BeforeEach
    void setup() {
        SecurityContextHolder.clearContext();
        RequestContextHolder.resetRequestAttributes();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void testLogout_withParamBearer_revokesAndClearsSessionAndCache() {
        WireMockServer revokeService = new WireMockServer(wireMockConfig().dynamicPort());
        revokeService.start();
        try {
            revokeService.stubFor(
                    post(urlPathEqualTo("/revoke")).willReturn(aResponse().withStatus(200)));

            OpenIdConnectConfiguration configuration = new OpenIdConnectConfiguration();
            configuration.setEnabled(true);
            configuration.setIdTokenUri("https://www.googleapis.com/oauth2/v3/certs");
            configuration.setRevokeEndpoint("http://localhost:" + revokeService.port() + "/revoke");
            configuration.setGlobalLogoutEnabled(true);

            // principal + TokenDetails
            PreAuthenticatedAuthenticationToken authenticationToken =
                    new PreAuthenticatedAuthenticationToken("user", "", new ArrayList<>());
            OAuth2AccessToken accessToken = bearer(ACCESS_TOKEN);
            TokenDetails details = Mockito.mock(TokenDetails.class);
            when(details.getProvider()).thenReturn("oidc");
            when(details.getAccessToken()).thenReturn(accessToken);
            when(details.getIdToken()).thenReturn(ID_TOKEN);
            authenticationToken.setDetails(details);

            // cache pre-populated with the token
            TokenAuthenticationCache cache = new TokenAuthenticationCache();
            cache.putCacheEntry(ACCESS_TOKEN, authenticationToken);

            // prepare GeoStoreContext static lookups
            SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            HashMap<Object, Object> configurations = new HashMap<>();
            configurations.put("oidcOAuth2Config", configuration);

            try (MockedStatic<GeoStoreContext> ctx = Mockito.mockStatic(GeoStoreContext.class)) {
                ctx.when(() -> GeoStoreContext.beans(OAuth2Configuration.class))
                        .thenReturn(configurations);
                ctx.when(() -> GeoStoreContext.bean("oidcOAuth2Config", OAuth2Configuration.class))
                        .thenReturn(configuration);
                ctx.when(() -> GeoStoreContext.bean("oAuth2Cache", TokenAuthenticationCache.class))
                        .thenReturn(cache);

                MockHttpServletRequest request = new MockHttpServletRequest();
                request.addHeader("Authorization", "Bearer " + ACCESS_TOKEN);
                request.setUserPrincipal(authenticationToken);
                MockHttpServletResponse response = new MockHttpServletResponse();

                ServletRequestAttributes attributes =
                        new ServletRequestAttributes(request, response);
                attributes.setAttribute(PROVIDER_KEY, "oidc", 0);
                RequestContextHolder.setRequestAttributes(attributes);

                RESTSessionService sessionService = new RESTSessionServiceImpl();
                new OpenIdConnectSessionServiceDelegate(sessionService, null);

                // act
                sessionService.removeSession();

                // assert
                assertEquals(HttpStatus.OK_200, response.getStatus());
                assertNull(
                        SecurityContextHolder.getContext().getAuthentication(),
                        "SecurityContext should be cleared");
                assertNull(request.getUserPrincipal(), "request principal should be cleared");
                assertNull(cache.get(ACCESS_TOKEN), "token should be evicted from cache");
                revokeService.verify(
                        postRequestedFor(urlPathEqualTo("/revoke"))
                                .withRequestBody(containing("token=" + ACCESS_TOKEN)));
            }
        } finally {
            revokeService.stop();
        }
    }

    @Test
    void testLogout_withAuthorizationHeader_picksTokenAndClears() {
        OpenIdConnectConfiguration configuration = new OpenIdConnectConfiguration();
        configuration.setEnabled(true);
        configuration.setRevokeEndpoint("http://google.foo/revoke");

        PreAuthenticatedAuthenticationToken authenticationToken =
                new PreAuthenticatedAuthenticationToken("user", "", new ArrayList<>());
        OAuth2AccessToken accessToken = bearer(ACCESS_TOKEN);
        TokenDetails details = Mockito.mock(TokenDetails.class);
        when(details.getProvider()).thenReturn("oidc");
        when(details.getAccessToken()).thenReturn(accessToken);
        when(details.getIdToken()).thenReturn(ID_TOKEN);
        authenticationToken.setDetails(details);

        TokenAuthenticationCache cache = new TokenAuthenticationCache();
        cache.putCacheEntry(ACCESS_TOKEN, authenticationToken);

        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        HashMap<Object, Object> configurations = new HashMap<>();
        configurations.put("oidcOAuth2Config", configuration);

        try (MockedStatic<GeoStoreContext> ctx = Mockito.mockStatic(GeoStoreContext.class)) {
            ctx.when(() -> GeoStoreContext.beans(OAuth2Configuration.class))
                    .thenReturn(configurations);
            ctx.when(() -> GeoStoreContext.bean("oidcOAuth2Config", OAuth2Configuration.class))
                    .thenReturn(configuration);
            ctx.when(() -> GeoStoreContext.bean("oAuth2Cache", TokenAuthenticationCache.class))
                    .thenReturn(cache);

            MockHttpServletRequest request = new MockHttpServletRequest();
            request.addHeader("Authorization", "Bearer " + ACCESS_TOKEN);
            request.setUserPrincipal(authenticationToken);
            MockHttpServletResponse response = new MockHttpServletResponse();

            ServletRequestAttributes attributes = new ServletRequestAttributes(request, response);
            attributes.setAttribute(PROVIDER_KEY, "oidc", 0);
            RequestContextHolder.setRequestAttributes(attributes);

            RESTSessionService sessionService = new RESTSessionServiceImpl();
            new OpenIdConnectSessionServiceDelegate(sessionService, null);

            sessionService.removeSession();

            assertEquals(HttpStatus.OK_200, response.getStatus());
            assertNull(SecurityContextHolder.getContext().getAuthentication());
            assertNull(request.getUserPrincipal());
            assertNull(cache.get(ACCESS_TOKEN));
        }
    }

    @Test
    void testLogout_noRevokeEndpoint_stillClearsLocally() {
        OpenIdConnectConfiguration configuration = new OpenIdConnectConfiguration();
        configuration.setEnabled(true);
        configuration.setRevokeEndpoint(null); // ensure missing remote revoke

        PreAuthenticatedAuthenticationToken authenticationToken =
                new PreAuthenticatedAuthenticationToken("user", "", new ArrayList<>());
        OAuth2AccessToken accessToken = bearer(ACCESS_TOKEN);
        TokenDetails details = Mockito.mock(TokenDetails.class);
        when(details.getProvider()).thenReturn("oidc");
        when(details.getAccessToken()).thenReturn(accessToken);
        when(details.getIdToken()).thenReturn(ID_TOKEN);
        authenticationToken.setDetails(details);

        TokenAuthenticationCache cache = new TokenAuthenticationCache();
        cache.putCacheEntry(ACCESS_TOKEN, authenticationToken);

        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        HashMap<Object, Object> configurations = new HashMap<>();
        configurations.put("oidcOAuth2Config", configuration);

        try (MockedStatic<GeoStoreContext> ctx = Mockito.mockStatic(GeoStoreContext.class)) {
            ctx.when(() -> GeoStoreContext.beans(OAuth2Configuration.class))
                    .thenReturn(configurations);
            ctx.when(() -> GeoStoreContext.bean("oidcOAuth2Config", OAuth2Configuration.class))
                    .thenReturn(configuration);
            ctx.when(() -> GeoStoreContext.bean("oAuth2Cache", TokenAuthenticationCache.class))
                    .thenReturn(cache);

            MockHttpServletRequest request = new MockHttpServletRequest();
            request.addHeader("Authorization", "Bearer " + ACCESS_TOKEN);
            request.setUserPrincipal(authenticationToken);
            MockHttpServletResponse response = new MockHttpServletResponse();

            ServletRequestAttributes attributes = new ServletRequestAttributes(request, response);
            attributes.setAttribute(PROVIDER_KEY, "oidc", 0);
            RequestContextHolder.setRequestAttributes(attributes);

            RESTSessionService sessionService = new RESTSessionServiceImpl();
            new OpenIdConnectSessionServiceDelegate(sessionService, null);

            sessionService.removeSession();

            assertEquals(HttpStatus.OK_200, response.getStatus());
            // Note: without a revokeEndpoint, clearSession() is not called so
            // SecurityContextHolder is not cleared. The cache entry for the
            // sessionId passed to doLogout IS removed, though.
            assertNull(cache.get(ACCESS_TOKEN), "cache entry should still be removed locally");
        }
    }

    @Test
    void testLogout_providerMismatch_keepsOtherProvidersCache() {
        OpenIdConnectConfiguration configuration = new OpenIdConnectConfiguration();
        configuration.setEnabled(true);
        configuration.setRevokeEndpoint("http://google.foo/revoke");

        // token A (google) and token B (azure)
        PreAuthenticatedAuthenticationToken googleAuth =
                new PreAuthenticatedAuthenticationToken("user", "", new ArrayList<>());
        TokenDetails googleDetails = Mockito.mock(TokenDetails.class);
        when(googleDetails.getProvider()).thenReturn("google");
        when(googleDetails.getAccessToken()).thenReturn(bearer("tokenA"));
        when(googleDetails.getIdToken()).thenReturn(ID_TOKEN);
        googleAuth.setDetails(googleDetails);

        PreAuthenticatedAuthenticationToken azureAuth =
                new PreAuthenticatedAuthenticationToken("user2", "", new ArrayList<>());
        TokenDetails azureDetails = Mockito.mock(TokenDetails.class);
        when(azureDetails.getProvider()).thenReturn("azure");
        when(azureDetails.getAccessToken()).thenReturn(bearer("tokenB"));
        when(azureDetails.getIdToken()).thenReturn(ID_TOKEN);
        azureAuth.setDetails(azureDetails);

        TokenAuthenticationCache cache = new TokenAuthenticationCache();
        cache.putCacheEntry("tokenA", googleAuth);
        cache.putCacheEntry("tokenB", azureAuth);

        SecurityContextHolder.getContext().setAuthentication(googleAuth);
        HashMap<Object, Object> configurations = new HashMap<>();
        configurations.put("oidcOAuth2Config", configuration);

        try (MockedStatic<GeoStoreContext> ctx = Mockito.mockStatic(GeoStoreContext.class)) {
            ctx.when(() -> GeoStoreContext.beans(OAuth2Configuration.class))
                    .thenReturn(configurations);
            ctx.when(() -> GeoStoreContext.bean("oidcOAuth2Config", OAuth2Configuration.class))
                    .thenReturn(configuration);
            ctx.when(() -> GeoStoreContext.bean("oAuth2Cache", TokenAuthenticationCache.class))
                    .thenReturn(cache);

            MockHttpServletRequest request = new MockHttpServletRequest();
            request.addHeader("Authorization", "Bearer tokenA");
            request.setUserPrincipal(googleAuth);
            MockHttpServletResponse response = new MockHttpServletResponse();

            ServletRequestAttributes attributes = new ServletRequestAttributes(request, response);
            attributes.setAttribute(PROVIDER_KEY, "oidc", 0);
            RequestContextHolder.setRequestAttributes(attributes);

            RESTSessionService sessionService = new RESTSessionServiceImpl();
            new OpenIdConnectSessionServiceDelegate(sessionService, null);

            sessionService.removeSession();

            assertEquals(HttpStatus.OK_200, response.getStatus());
            assertNull(cache.get("tokenA"), "oidc entry evicted");
            assertNotNull(cache.get("tokenB"), "azure entry untouched");
        }
    }
}
