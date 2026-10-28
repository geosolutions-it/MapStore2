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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import it.geosolutions.geostore.services.rest.model.SessionToken;
import it.geosolutions.geostore.services.rest.security.TokenAuthenticationCache;
import it.geosolutions.geostore.services.rest.security.oauth2.OAuth2Configuration;
import it.geosolutions.geostore.services.rest.security.oauth2.OAuth2SessionServiceDelegate;
import it.geosolutions.geostore.services.rest.security.oauth2.TokenDetails;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.junit.jupiter.api.*;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.*;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.core.endpoint.OAuth2AccessTokenResponse;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;

/** Test class for OAuth2SessionServiceDelegate token refresh. */
class RefreshTokenServiceTest {

    private TestOAuth2SessionServiceDelegate serviceDelegate;
    private OAuth2Configuration configuration;
    private RestTemplate restTemplate;
    private MockHttpServletRequest mockRequest;
    private MockHttpServletResponse mockResponse;
    private OAuth2AccessToken mockOAuth2AccessToken;

    @Mock private TokenAuthenticationCache authenticationCache;

    /** Builds an immutable Spring Security 7 access token with the given value and expiry. */
    private static OAuth2AccessToken accessToken(String value, long expiresInMillisFromNow) {
        Instant expiresAt = Instant.now().plusMillis(expiresInMillisFromNow);
        // issuedAt must be strictly before expiresAt (SS7 constraint), even for expired tokens.
        Instant issuedAt = expiresAt.minusSeconds(3600);
        return new OAuth2AccessToken(
                OAuth2AccessToken.TokenType.BEARER, value, issuedAt, expiresAt);
    }

    /** Builds an OAuth2AccessTokenResponse as deserialized from a token-endpoint reply. */
    private static OAuth2AccessTokenResponse tokenResponse(
            String access, String refresh, long expiresInSeconds) {
        OAuth2AccessTokenResponse.Builder b =
                OAuth2AccessTokenResponse.withToken(access)
                        .tokenType(OAuth2AccessToken.TokenType.BEARER)
                        .expiresIn(expiresInSeconds);
        if (refresh != null) {
            b.refreshToken(refresh);
        }
        return b.build();
    }

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        configuration = mock(OAuth2Configuration.class);
        restTemplate = mock(RestTemplate.class);
        authenticationCache = mock(TokenAuthenticationCache.class);

        serviceDelegate = spy(new TestOAuth2SessionServiceDelegate());
        serviceDelegate.setRefreshRestTemplate(restTemplate);
        serviceDelegate.setConfiguration(configuration);
        serviceDelegate.authenticationCache = authenticationCache;

        mockRequest = new MockHttpServletRequest();
        mockResponse = new MockHttpServletResponse();
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(mockRequest));

        when(configuration.isEnabled()).thenReturn(true);
        when(configuration.getMaxRetries()).thenReturn(3);
        when(configuration.getClientId()).thenReturn("testClientId");
        when(configuration.getClientSecret()).thenReturn("testClientSecret");
        when(configuration.getAccessTokenUri()).thenReturn("https://example.com/oauth2/token");
        when(configuration.getInitialBackoffDelay()).thenReturn(1000L);
        when(configuration.getBackoffMultiplier()).thenReturn(2.0);
        when(configuration.getProvider()).thenReturn("oidc");

        // Current cached access token (the refresh token is supplied separately, as a
        // param/cookie).
        mockOAuth2AccessToken = accessToken("providedAccessToken", 3600 * 1000);
        serviceDelegate.currentAccessToken = mockOAuth2AccessToken;

        Authentication mockAuthentication = mock(Authentication.class);
        TokenDetails mockTokenDetails = mock(TokenDetails.class);
        when(mockTokenDetails.getIdToken()).thenReturn("mockIdToken");
        // The existing refresh token is carried on the cached TokenDetails (SS7 keeps it separate
        // from the access token, where 2.6.x stored it).
        when(mockTokenDetails.getRefreshToken())
                .thenReturn(new OAuth2RefreshToken("existingRefreshToken", null));
        when(mockAuthentication.getDetails()).thenReturn(mockTokenDetails);
        when(authenticationCache.get("providedAccessToken")).thenReturn(mockAuthentication);

        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(mockAuthentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        RequestContextHolder.resetRequestAttributes();
        // Clear the SecurityContext set in setUp so this test does not leak a mock authentication
        // into other test classes sharing the same JVM fork (the token/header filters skip
        // authentication when a context authentication is already present).
        SecurityContextHolder.clearContext();
    }

    @Test
    void testRefreshWithValidTokens() {
        String refreshToken = "providedRefreshToken";
        String accessToken = "providedAccessToken";

        ResponseEntity<OAuth2AccessTokenResponse> responseEntity =
                new ResponseEntity<>(
                        tokenResponse("newAccessToken", "newRefreshToken", 7200), HttpStatus.OK);

        when(restTemplate.exchange(
                        anyString(),
                        eq(HttpMethod.POST),
                        any(HttpEntity.class),
                        eq(OAuth2AccessTokenResponse.class)))
                .thenReturn(responseEntity);

        when(serviceDelegate.getRequest()).thenReturn(mockRequest);
        when(serviceDelegate.getResponse()).thenReturn(mockResponse);

        SessionToken sessionToken = serviceDelegate.refresh(refreshToken, accessToken);

        assertNotNull(sessionToken, "SessionToken should not be null");
        assertEquals(
                "newAccessToken", sessionToken.getAccessToken(), "Access token should be updated");
        assertNull(
                sessionToken.getRefreshToken(),
                "Refresh token should not be in the JSON response body");
        assertTrue(
                sessionToken.getExpires() > System.currentTimeMillis(),
                "Token expiration should be in the future");
        assertEquals("bearer", sessionToken.getTokenType(), "Token type should be 'bearer'");

        Cookie refreshCookie = getRefreshTokenCookie(mockResponse);
        assertNotNull(refreshCookie, "Refresh token cookie should be set");
        assertEquals("newRefreshToken", refreshCookie.getValue());
        assertTrue(refreshCookie.isHttpOnly(), "Cookie should be HttpOnly");
        assertEquals("/", refreshCookie.getPath());
        assertEquals(604800, refreshCookie.getMaxAge());

        verify(authenticationCache).putCacheEntry(eq("newAccessToken"), any(Authentication.class));
        verify(serviceDelegate, never())
                .handleRefreshFailure(anyString(), anyString(), any(OAuth2Configuration.class));
    }

    @Test
    void testRefreshWithInvalidRefreshToken() {
        String refreshToken = "invalidRefreshToken";
        String accessToken = "providedAccessToken";

        when(restTemplate.exchange(
                        anyString(),
                        eq(HttpMethod.POST),
                        any(HttpEntity.class),
                        eq(OAuth2AccessTokenResponse.class)))
                .thenThrow(new HttpClientErrorException(HttpStatus.BAD_REQUEST));

        SessionToken sessionToken = serviceDelegate.refresh(refreshToken, accessToken);

        assertNotNull(sessionToken, "SessionToken should not be null even when refresh fails");
        assertEquals(
                "providedAccessToken",
                sessionToken.getAccessToken(),
                "Access token should remain unchanged");
        assertNull(sessionToken.getRefreshToken(), "Refresh token should not be in JSON body");
        Cookie refreshCookie = getRefreshTokenCookie(mockResponse);
        assertNotNull(refreshCookie, "Refresh token cookie should be set");
        assertEquals("existingRefreshToken", refreshCookie.getValue());
        assertTrue(refreshCookie.isHttpOnly(), "Cookie should be HttpOnly");
        assertNotNull(sessionToken.getWarning(), "Warning message should be set");
        assertTrue(
                sessionToken.getWarning().contains("Using existing access token."),
                "Expected warning message in SessionToken");
    }

    @Test
    void testRefreshWithServerError() {
        String refreshToken = "providedRefreshToken";
        String accessToken = "providedAccessToken";

        when(restTemplate.exchange(
                        anyString(),
                        eq(HttpMethod.POST),
                        any(HttpEntity.class),
                        eq(OAuth2AccessTokenResponse.class)))
                .thenThrow(new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR));

        SessionToken sessionToken = serviceDelegate.refresh(refreshToken, accessToken);

        assertNotNull(sessionToken, "SessionToken should not be null even when refresh fails");
        assertEquals(
                "providedAccessToken",
                sessionToken.getAccessToken(),
                "Access token should remain unchanged after server error");
        assertNull(sessionToken.getRefreshToken(), "Refresh token should not be in JSON body");
        Cookie refreshCookie = getRefreshTokenCookie(mockResponse);
        assertNotNull(refreshCookie, "Refresh token cookie should be set");
        assertEquals("existingRefreshToken", refreshCookie.getValue());
        assertNotNull(sessionToken.getWarning(), "Warning message should be set");
        assertTrue(
                sessionToken.getWarning().contains("Using existing access token."),
                "Expected warning message in SessionToken");
        verify(restTemplate, times(3))
                .exchange(
                        anyString(),
                        eq(HttpMethod.POST),
                        any(HttpEntity.class),
                        eq(OAuth2AccessTokenResponse.class));
    }

    @Test
    void testRefreshWithNullResponse() {
        String refreshToken = "providedRefreshToken";
        String accessToken = "providedAccessToken";

        ResponseEntity<OAuth2AccessTokenResponse> responseEntity =
                new ResponseEntity<>((OAuth2AccessTokenResponse) null, HttpStatus.OK);
        when(restTemplate.exchange(
                        anyString(),
                        eq(HttpMethod.POST),
                        any(HttpEntity.class),
                        eq(OAuth2AccessTokenResponse.class)))
                .thenReturn(responseEntity);

        SessionToken sessionToken = serviceDelegate.refresh(refreshToken, accessToken);

        assertNotNull(sessionToken, "SessionToken should not be null even when response is null");
        assertEquals(
                "providedAccessToken",
                sessionToken.getAccessToken(),
                "Access token should remain unchanged");
        assertNull(sessionToken.getRefreshToken(), "Refresh token should not be in JSON body");
        Cookie refreshCookie = getRefreshTokenCookie(mockResponse);
        assertNotNull(refreshCookie, "Refresh token cookie should be set");
        assertEquals("existingRefreshToken", refreshCookie.getValue());
        assertNotNull(sessionToken.getWarning(), "Warning message should be set");
        assertTrue(
                sessionToken.getWarning().contains("Using existing access token."),
                "Expected warning message in SessionToken");
    }

    @Test
    void testRefreshWhenConfigurationDisabled() {
        String refreshToken = "providedRefreshToken";
        String accessToken = "providedAccessToken";

        when(configuration.isEnabled()).thenReturn(false);

        SessionToken sessionToken = serviceDelegate.refresh(refreshToken, accessToken);

        assertNotNull(
                sessionToken, "SessionToken should not be null when configuration is disabled");
        assertEquals(
                "providedAccessToken",
                sessionToken.getAccessToken(),
                "Access token should remain unchanged");
        assertNull(sessionToken.getRefreshToken(), "Refresh token should not be in JSON body");
        Cookie refreshCookie = getRefreshTokenCookie(mockResponse);
        assertNotNull(refreshCookie, "Refresh token cookie should be set");
        assertEquals("existingRefreshToken", refreshCookie.getValue());
        verify(restTemplate, never())
                .exchange(
                        anyString(),
                        any(HttpMethod.class),
                        any(HttpEntity.class),
                        eq(OAuth2AccessTokenResponse.class));
    }

    @Test
    void testRefreshWithMissingAccessToken() {
        String refreshToken = "providedRefreshToken";
        String accessToken = null;

        Exception exception =
                assertThrows(
                        RuntimeException.class,
                        () -> serviceDelegate.refresh(refreshToken, accessToken));

        assertTrue(
                exception
                        .getMessage()
                        .contains("Either the accessToken or the refresh token are missing"),
                "Expected exception message");
    }

    @Test
    void testRefreshWhenCacheReturnsNullAuthentication() {
        String refreshToken = "providedRefreshToken";
        String accessToken = "providedAccessToken";

        when(authenticationCache.get("providedAccessToken")).thenReturn(null);

        SessionToken sessionToken = serviceDelegate.refresh(refreshToken, accessToken);

        assertNotNull(
                sessionToken,
                "SessionToken should not be null even when authentication is not found in cache");
        assertEquals(
                "providedAccessToken",
                sessionToken.getAccessToken(),
                "Access token should remain unchanged");
        assertNull(sessionToken.getRefreshToken(), "Refresh token should not be in JSON body");
        Cookie refreshCookie = getRefreshTokenCookie(mockResponse);
        assertNotNull(refreshCookie, "Refresh token cookie should be set");
        // No cached session -> the supplied param refresh token is used (SS7 sources the existing
        // refresh token from the cached TokenDetails, which is absent here).
        assertEquals("providedRefreshToken", refreshCookie.getValue());
    }

    @Test
    void testRefreshWhenAuthenticationIsAnonymous() {
        String refreshToken = "providedRefreshToken";
        String accessToken = "providedAccessToken";

        Authentication anonymousAuthentication =
                mock(
                        org.springframework.security.authentication.AnonymousAuthenticationToken
                                .class);
        when(authenticationCache.get("providedAccessToken")).thenReturn(anonymousAuthentication);

        SessionToken sessionToken = serviceDelegate.refresh(refreshToken, accessToken);

        assertNotNull(
                sessionToken,
                "SessionToken should not be null even when authentication is anonymous");
        assertEquals(
                "providedAccessToken",
                sessionToken.getAccessToken(),
                "Access token should remain unchanged");
        assertNull(sessionToken.getRefreshToken(), "Refresh token should not be in JSON body");
        Cookie refreshCookie = getRefreshTokenCookie(mockResponse);
        assertNotNull(refreshCookie, "Refresh token cookie should be set");
        // Anonymous/un-cached session -> the supplied param refresh token is used.
        assertEquals("providedRefreshToken", refreshCookie.getValue());
    }

    @Test
    void testRefreshWithExpiredAccessToken() {
        String refreshToken = "providedRefreshToken";
        String accessToken = "expiredAccessToken";

        // Current access token expired in the past.
        serviceDelegate.currentAccessToken = accessToken("providedAccessToken", -1000);

        ResponseEntity<OAuth2AccessTokenResponse> responseEntity =
                new ResponseEntity<>(
                        tokenResponse("newAccessToken", "newRefreshToken", 7200), HttpStatus.OK);
        when(restTemplate.exchange(
                        anyString(),
                        eq(HttpMethod.POST),
                        any(HttpEntity.class),
                        eq(OAuth2AccessTokenResponse.class)))
                .thenReturn(responseEntity);

        SessionToken sessionToken = serviceDelegate.refresh(refreshToken, accessToken);

        assertNotNull(sessionToken, "SessionToken should not be null");
        assertEquals(
                "newAccessToken", sessionToken.getAccessToken(), "Access token should be updated");
        assertNull(sessionToken.getRefreshToken(), "Refresh token should not be in JSON body");
        Cookie refreshCookie = getRefreshTokenCookie(mockResponse);
        assertNotNull(refreshCookie, "Refresh token cookie should be set");
        assertEquals("newRefreshToken", refreshCookie.getValue());
        assertTrue(refreshCookie.isHttpOnly(), "Cookie should be HttpOnly");
        assertTrue(
                sessionToken.getExpires() > System.currentTimeMillis(),
                "Token expiration should be in the future");
    }

    @Test
    void testRefreshWithExpiredTokenAndUnsuccessfulRefresh() {
        String refreshToken = "expiredRefreshToken";
        String accessToken = "expiredAccessToken";

        // Current access token expired 5 minutes ago.
        serviceDelegate.currentAccessToken = accessToken("providedAccessToken", -5 * 60 * 1000);

        when(restTemplate.exchange(
                        anyString(),
                        eq(HttpMethod.POST),
                        any(HttpEntity.class),
                        eq(OAuth2AccessTokenResponse.class)))
                .thenThrow(new HttpClientErrorException(HttpStatus.UNAUTHORIZED));

        SessionToken sessionToken = serviceDelegate.refresh(refreshToken, accessToken);

        assertNull(
                sessionToken,
                "SessionToken should be null when the token is expired and cannot be refreshed");
        verify(restTemplate, times(3))
                .exchange(
                        anyString(),
                        eq(HttpMethod.POST),
                        any(HttpEntity.class),
                        eq(OAuth2AccessTokenResponse.class));
    }

    @Test
    void testRefreshUpdatesChangedAccessToken() {
        String oldAccessToken = "oldAccessToken";
        String refreshToken = "validRefreshToken";

        serviceDelegate.currentAccessToken = accessToken(oldAccessToken, 3600 * 1000);

        Authentication mockAuthentication = mock(Authentication.class);
        when(authenticationCache.get(oldAccessToken)).thenReturn(mockAuthentication);

        String refreshedAccessTokenValue = "completelyNewAccessToken";
        ResponseEntity<OAuth2AccessTokenResponse> responseEntity =
                new ResponseEntity<>(
                        tokenResponse(refreshedAccessTokenValue, "brandNewRefreshToken", 7200),
                        HttpStatus.OK);
        when(restTemplate.exchange(
                        anyString(),
                        eq(HttpMethod.POST),
                        any(HttpEntity.class),
                        eq(OAuth2AccessTokenResponse.class)))
                .thenReturn(responseEntity);

        SessionToken sessionToken = serviceDelegate.refresh(refreshToken, oldAccessToken);

        assertNotNull(sessionToken, "SessionToken should not be null after a successful refresh.");
        assertEquals(
                refreshedAccessTokenValue,
                sessionToken.getAccessToken(),
                "The SessionToken's accessToken must be updated to the new value.");
        assertNull(sessionToken.getRefreshToken(), "Refresh token should not be in JSON body");
        Cookie refreshCookie = getRefreshTokenCookie(mockResponse);
        assertNotNull(refreshCookie, "Refresh token cookie should be set");
        assertEquals(
                "brandNewRefreshToken",
                refreshCookie.getValue(),
                "Cookie must contain the new refresh token value.");
        assertTrue(refreshCookie.isHttpOnly(), "Cookie should be HttpOnly");

        verify(authenticationCache).removeEntry(eq(oldAccessToken));
        verify(authenticationCache)
                .putCacheEntry(eq(refreshedAccessTokenValue), any(Authentication.class));

        assertEquals(
                refreshedAccessTokenValue,
                serviceDelegate.currentAccessToken.getTokenValue(),
                "Service delegate must store the new access token internally.");
        assertEquals(
                "brandNewRefreshToken",
                serviceDelegate.currentRefreshToken.getTokenValue(),
                "Service delegate must store the new refresh token internally.");
    }

    @Test
    void testRefreshReadsCookieWhenNoRefreshTokenInParams() {
        String accessToken = "providedAccessToken";

        // No refresh token cached for this token -> the delegate must read it from the cookie.
        when(authenticationCache.get("providedAccessToken")).thenReturn(mock(Authentication.class));

        // Refresh token only present as a cookie.
        mockRequest.setCookies(new Cookie("refresh_token", "cookieRefreshToken"));

        ResponseEntity<OAuth2AccessTokenResponse> responseEntity =
                new ResponseEntity<>(
                        tokenResponse("newAccessToken", "newRefreshToken", 7200), HttpStatus.OK);
        when(restTemplate.exchange(
                        anyString(),
                        eq(HttpMethod.POST),
                        any(HttpEntity.class),
                        eq(OAuth2AccessTokenResponse.class)))
                .thenReturn(responseEntity);

        when(serviceDelegate.getRequest()).thenReturn(mockRequest);
        when(serviceDelegate.getResponse()).thenReturn(mockResponse);

        SessionToken sessionToken = serviceDelegate.refresh(null, accessToken);

        assertNotNull(sessionToken, "SessionToken should not be null");
        assertEquals("newAccessToken", sessionToken.getAccessToken());
        assertNull(sessionToken.getRefreshToken(), "Refresh token should not be in JSON body");

        Cookie refreshCookie = getRefreshTokenCookie(mockResponse);
        assertNotNull(refreshCookie, "Refresh token cookie should be set on response");
        assertEquals("newRefreshToken", refreshCookie.getValue());
        assertTrue(refreshCookie.isHttpOnly(), "Cookie should be HttpOnly");
    }

    @Test
    void testRefreshSkippedWhenTokenStillValid() {
        long now = System.currentTimeMillis();
        long iat = (now - 60_000) / 1000; // 1 minute ago
        long exp = (now + 9 * 60_000) / 1000; // 9 minutes from now
        String jwtToken = buildFakeJwt(iat, exp);

        serviceDelegate.currentAccessToken = accessToken(jwtToken, 9 * 60_000);

        when(configuration.isSkipRefreshIfTokenValid()).thenReturn(true);
        when(configuration.getRefreshTokenLifetimeFraction()).thenReturn(0.8);

        SessionToken sessionToken = serviceDelegate.refresh(null, jwtToken);

        assertNotNull(sessionToken);
        assertEquals(jwtToken, sessionToken.getAccessToken());
        assertNotNull(sessionToken.getWarning());
        assertTrue(sessionToken.getWarning().contains("Token still valid; refresh skipped."));

        verify(restTemplate, never())
                .exchange(
                        anyString(),
                        any(HttpMethod.class),
                        any(HttpEntity.class),
                        eq(OAuth2AccessTokenResponse.class));
    }

    @Test
    void testRefreshProceedsWhenTokenNearExpiry() {
        String refreshToken = "providedRefreshToken";
        long now = System.currentTimeMillis();
        long iat = (now - 9 * 60_000) / 1000; // 9 minutes ago
        long exp = (now + 60_000) / 1000; // 1 minute from now
        String jwtToken = buildFakeJwt(iat, exp);

        serviceDelegate.currentAccessToken = accessToken(jwtToken, 60_000);

        when(configuration.isSkipRefreshIfTokenValid()).thenReturn(true);
        when(configuration.getRefreshTokenLifetimeFraction()).thenReturn(0.8);

        ResponseEntity<OAuth2AccessTokenResponse> responseEntity =
                new ResponseEntity<>(
                        tokenResponse("newAccessToken", "newRefreshToken", 7200), HttpStatus.OK);
        when(restTemplate.exchange(
                        anyString(),
                        eq(HttpMethod.POST),
                        any(HttpEntity.class),
                        eq(OAuth2AccessTokenResponse.class)))
                .thenReturn(responseEntity);

        SessionToken sessionToken = serviceDelegate.refresh(refreshToken, jwtToken);

        assertNotNull(sessionToken);
        assertEquals("newAccessToken", sessionToken.getAccessToken());

        verify(restTemplate, atLeastOnce())
                .exchange(
                        anyString(),
                        eq(HttpMethod.POST),
                        any(HttpEntity.class),
                        eq(OAuth2AccessTokenResponse.class));
    }

    @Test
    void testRefreshSkipDisabledByConfig() {
        String refreshToken = "providedRefreshToken";
        long now = System.currentTimeMillis();
        long iat = (now - 60_000) / 1000;
        long exp = (now + 9 * 60_000) / 1000;
        String jwtToken = buildFakeJwt(iat, exp);

        serviceDelegate.currentAccessToken = accessToken(jwtToken, 9 * 60_000);

        when(configuration.isSkipRefreshIfTokenValid()).thenReturn(false);

        ResponseEntity<OAuth2AccessTokenResponse> responseEntity =
                new ResponseEntity<>(
                        tokenResponse("newAccessToken", "newRefreshToken", 7200), HttpStatus.OK);
        when(restTemplate.exchange(
                        anyString(),
                        eq(HttpMethod.POST),
                        any(HttpEntity.class),
                        eq(OAuth2AccessTokenResponse.class)))
                .thenReturn(responseEntity);

        SessionToken sessionToken = serviceDelegate.refresh(refreshToken, jwtToken);

        assertNotNull(sessionToken);
        assertEquals("newAccessToken", sessionToken.getAccessToken());
        verify(restTemplate, atLeastOnce())
                .exchange(
                        anyString(),
                        eq(HttpMethod.POST),
                        any(HttpEntity.class),
                        eq(OAuth2AccessTokenResponse.class));
    }

    @Test
    void testRefreshSkipFallbackWithoutIat() {
        long now = System.currentTimeMillis();
        long exp = (now + 10 * 60_000) / 1000; // 10 minutes from now
        String jwtToken = buildFakeJwtExpOnly(exp);

        serviceDelegate.currentAccessToken = accessToken(jwtToken, 10 * 60_000);

        when(configuration.isSkipRefreshIfTokenValid()).thenReturn(true);
        when(configuration.getRefreshTokenLifetimeFraction()).thenReturn(0.8);

        SessionToken sessionToken = serviceDelegate.refresh(null, jwtToken);

        assertNotNull(sessionToken);
        assertEquals(jwtToken, sessionToken.getAccessToken());
        assertNotNull(sessionToken.getWarning());
        assertTrue(sessionToken.getWarning().contains("Token still valid; refresh skipped."));
        verify(restTemplate, never())
                .exchange(
                        anyString(),
                        any(HttpMethod.class),
                        any(HttpEntity.class),
                        eq(OAuth2AccessTokenResponse.class));
    }

    @Test
    void testRefreshFailureRespondsWith401InsteadOfRedirect() throws Exception {
        // The access token is already expired and the IdP rejects the refresh: the XHR
        // client must receive a clean 401 (a 302 to the login page cannot be followed by the
        // client and was observed live as a 302 -> 404 chain that wiped the session).
        serviceDelegate.currentAccessToken = accessToken("providedAccessToken", -10 * 60 * 1000);
        when(restTemplate.exchange(
                        anyString(),
                        eq(HttpMethod.POST),
                        any(HttpEntity.class),
                        eq(OAuth2AccessTokenResponse.class)))
                .thenThrow(new HttpClientErrorException(HttpStatus.BAD_REQUEST));

        SessionToken sessionToken =
                serviceDelegate.refresh("expiredRefreshToken", "providedAccessToken");

        assertNull(sessionToken, "A failed refresh of an expired session returns no token");
        assertEquals(401, mockResponse.getStatus(), "The client must receive a 401");
        assertNull(mockResponse.getRedirectedUrl(), "The refresh endpoint must never redirect");
        String content = mockResponse.getContentAsString();
        assertTrue(content.contains("session_expired"), "The error code is reported: " + content);
        assertTrue(
                content.contains("/openid/oidc/login"),
                "The login URL is reported so the client can start a new flow: " + content);
        Cookie refreshCookie = getRefreshTokenCookie(mockResponse);
        assertNotNull(refreshCookie, "The refresh token cookie is cleared");
        assertEquals(0, refreshCookie.getMaxAge());
    }

    @Test
    void testShouldSkipRefreshFalseWhenRefreshTokenNearExpiry() {
        when(configuration.isSkipRefreshIfTokenValid()).thenReturn(true);
        long nowSeconds = System.currentTimeMillis() / 1000;

        // Access token still fresh for one hour: the legacy logic alone would skip.
        OAuth2AccessToken freshToken = accessToken("opaque-at", 3600 * 1000);

        // Refresh token (JWT, as Keycloak's) expiring within the safety window: refresh
        // tokens only slide when actually used, so the skip must be bypassed.
        String nearExpiryRt = buildFakeJwtExpOnly(nowSeconds + 60);
        assertFalse(
                serviceDelegate.callShouldSkipRefresh(freshToken, nearExpiryRt, configuration),
                "A refresh token close to its own expiry must force a real IdP refresh");

        // A long-lived refresh token keeps the legacy skip behavior.
        String longLivedRt = buildFakeJwtExpOnly(nowSeconds + 1800);
        assertTrue(
                serviceDelegate.callShouldSkipRefresh(freshToken, longLivedRt, configuration),
                "A healthy refresh token keeps the skip in place");

        // An opaque (non-JWT) refresh token carries no expiry info: legacy behavior.
        assertTrue(
                serviceDelegate.callShouldSkipRefresh(
                        freshToken, "opaque-refresh-token", configuration),
                "Opaque refresh tokens keep the legacy skip behavior");
    }

    @Test
    void testClearCookiesExpiresRefreshTokenCookie() {
        // Max-Age 0 actually deletes the cookie: the previous -1 ("session cookie")
        // RE-INSTATED the refresh token on the logout response (observed live as a logout
        // carrying both the clearing Set-Cookie and a full refresh_token one).
        mockRequest.setCookies(
                new Cookie("refresh_token", "leftoverRt"), new Cookie("JSESSIONID", "xyz"));

        serviceDelegate.callClearCookies(mockRequest, mockResponse);

        Cookie cleared = getRefreshTokenCookie(mockResponse);
        assertNotNull(cleared, "The refresh token cookie must be re-emitted for deletion");
        assertEquals(0, cleared.getMaxAge(), "Max-Age must be 0 (deletion), not -1 (session)");
        assertEquals("", cleared.getValue(), "The cookie value must be blanked");
    }

    /** Builds a fake unsigned JWT with iat and exp claims (decodable by JWTHelper). */
    private String buildFakeJwt(long iatEpochSeconds, long expEpochSeconds) {
        String header = "{\"alg\":\"none\",\"typ\":\"JWT\"}";
        String payload =
                "{\"sub\":\"testuser\",\"iat\":"
                        + iatEpochSeconds
                        + ",\"exp\":"
                        + expEpochSeconds
                        + "}";
        return Base64.getUrlEncoder()
                        .withoutPadding()
                        .encodeToString(header.getBytes(StandardCharsets.UTF_8))
                + "."
                + Base64.getUrlEncoder()
                        .withoutPadding()
                        .encodeToString(payload.getBytes(StandardCharsets.UTF_8))
                + ".";
    }

    /** Builds a fake unsigned JWT with only an exp claim (no iat). */
    private String buildFakeJwtExpOnly(long expEpochSeconds) {
        String header = "{\"alg\":\"none\",\"typ\":\"JWT\"}";
        String payload = "{\"sub\":\"testuser\",\"exp\":" + expEpochSeconds + "}";
        return Base64.getUrlEncoder()
                        .withoutPadding()
                        .encodeToString(header.getBytes(StandardCharsets.UTF_8))
                + "."
                + Base64.getUrlEncoder()
                        .withoutPadding()
                        .encodeToString(payload.getBytes(StandardCharsets.UTF_8))
                + ".";
    }

    private Cookie getRefreshTokenCookie(MockHttpServletResponse response) {
        Cookie[] cookies = response.getCookies();
        Cookie result = null;
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refresh_token".equalsIgnoreCase(cookie.getName())) {
                    result = cookie;
                }
            }
        }
        return result;
    }

    /** Test subclass of OAuth2SessionServiceDelegate for testing purposes. */
    class TestOAuth2SessionServiceDelegate extends OAuth2SessionServiceDelegate {

        private RestTemplate refreshRestTemplate;
        private OAuth2Configuration configuration;
        private OAuth2AccessToken currentAccessToken;
        private OAuth2RefreshToken currentRefreshToken;
        protected TokenAuthenticationCache authenticationCache;

        public TestOAuth2SessionServiceDelegate() {
            super(null, null); // Mocked dependencies
        }

        public void setRefreshRestTemplate(RestTemplate refreshRestTemplate) {
            this.refreshRestTemplate = refreshRestTemplate;
        }

        public void setConfiguration(OAuth2Configuration configuration) {
            this.configuration = configuration;
        }

        // Bridges for protected superclass members living in a different package.
        boolean callShouldSkipRefresh(
                OAuth2AccessToken token, String refreshToken, OAuth2Configuration config) {
            return shouldSkipRefresh(token, refreshToken, config);
        }

        void callClearCookies(HttpServletRequest request, HttpServletResponse response) {
            clearCookies(request, response);
        }

        @Override
        protected RestTemplate createRefreshRestTemplate(OAuth2Configuration configuration) {
            return refreshRestTemplate;
        }

        @Override
        protected OAuth2Configuration configuration() {
            return configuration;
        }

        @Override
        protected HttpServletRequest getRequest() {
            return mockRequest;
        }

        @Override
        protected HttpServletResponse getResponse() {
            return mockResponse;
        }

        @Override
        protected OAuth2AccessToken retrieveAccessToken(String accessToken, Long expires) {
            return currentAccessToken;
        }

        @Override
        protected TokenAuthenticationCache cache() {
            return authenticationCache; // Return the mocked cache
        }

        @Override
        protected void updateAuthToken(
                String oldAccessToken,
                OAuth2AccessToken newAccessToken,
                OAuth2RefreshToken newRefreshToken,
                OAuth2Configuration configuration) {
            // Track the new tokens internally (the real implementation stores them on
            // TokenDetails).
            this.currentAccessToken = newAccessToken;
            this.currentRefreshToken = newRefreshToken;

            authenticationCache.removeEntry(oldAccessToken);
            authenticationCache.putCacheEntry(
                    newAccessToken.getTokenValue(), mock(Authentication.class));
        }
    }
}
