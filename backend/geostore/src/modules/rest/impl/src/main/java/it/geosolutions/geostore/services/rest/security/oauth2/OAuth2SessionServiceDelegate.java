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

import static it.geosolutions.geostore.services.rest.security.oauth2.OAuth2Utils.*;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.security.password.SecurityUtils;
import it.geosolutions.geostore.services.UserService;
import it.geosolutions.geostore.services.rest.RESTSessionService;
import it.geosolutions.geostore.services.rest.SessionServiceDelegate;
import it.geosolutions.geostore.services.rest.exception.NotFoundWebEx;
import it.geosolutions.geostore.services.rest.model.SessionToken;
import it.geosolutions.geostore.services.rest.security.TokenAuthenticationCache;
import it.geosolutions.geostore.services.rest.utils.GeoStoreContext;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.FormHttpMessageConverter;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.core.endpoint.OAuth2AccessTokenResponse;
import org.springframework.security.oauth2.core.http.converter.OAuth2AccessTokenResponseHttpMessageConverter;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;

import java.io.IOException;
import java.time.Instant;
import java.util.Arrays;
import java.util.Date;
import java.util.Map;
import java.util.Optional;

/** Abstract implementation of an OAuth2 SessionServiceDelegate. */
public abstract class OAuth2SessionServiceDelegate implements SessionServiceDelegate {

    private static final Logger LOGGER = LogManager.getLogger(OAuth2SessionServiceDelegate.class);

    private static final long CLOCK_SKEW_ALLOWANCE_MILLIS = 5 * 60 * 1000; // 5 minutes

    // Force a real IdP refresh when the refresh token itself is this close to its own
    // (fixed) expiry: IdP refresh tokens only slide when a refresh grant is performed.
    private static final long REFRESH_TOKEN_EXPIRY_SAFETY_WINDOW_MILLIS = 2 * 60 * 1000;

    protected UserService userService;
    protected final String delegateName;

    /**
     * @param restSessionService the session service to which register this delegate.
     * @param delegateName this delegate name eg. google or GitHub etc...
     */
    public OAuth2SessionServiceDelegate(
            RESTSessionService restSessionService, String delegateName, UserService userService) {
        restSessionService.registerDelegate(delegateName, this);
        this.delegateName = delegateName;
        this.userService = userService;
    }

    public OAuth2SessionServiceDelegate(
            RestTemplate restTemplate, OAuth2Configuration configuration) {
        this.delegateName = null;
    }

    @Override
    public SessionToken refresh(String refreshToken, String accessToken) {
        String errorMessage = "";
        String warningMessage = "";
        HttpServletRequest request = getRequest();

        // Ensure accessToken is available
        if (accessToken == null || accessToken.isEmpty()) {
            accessToken = OAuth2Utils.tokenFromParamsOrBearer(ACCESS_TOKEN_PARAM, request);
        }
        if (accessToken == null || accessToken.isEmpty()) {
            throw new NotFoundWebEx("Either the accessToken or the refresh token are missing");
        }

        OAuth2AccessToken currentToken = retrieveAccessToken(accessToken, null);

        // Determine refreshTokenToUse: prefer the cached refresh token, then the supplied one,
        // then a request parameter, then the HttpOnly cookie.
        String refreshTokenToUse =
                Optional.ofNullable(refreshTokenFromCache(accessToken))
                        .filter(value -> !value.isEmpty())
                        .orElse(refreshToken);

        if (refreshTokenToUse == null || refreshTokenToUse.isEmpty()) {
            refreshTokenToUse = getParameterValue(REFRESH_TOKEN_PARAM, request);
        }

        if (refreshTokenToUse == null || refreshTokenToUse.isEmpty()) {
            refreshTokenToUse = getRefreshTokenFromCookie(request);
        }

        SessionToken sessionToken = null;
        OAuth2Configuration configuration = configuration();

        if (configuration != null
                && shouldSkipRefresh(currentToken, refreshTokenToUse, configuration)) {
            LOGGER.debug("Token still has sufficient validity; skipping IDP refresh.");
            warningMessage = "Token still valid; refresh skipped.";
        } else if (refreshTokenToUse == null || refreshTokenToUse.isEmpty()) {
            // No refresh token available (e.g. bearer-token auth without auth code flow, or the IdP
            // did not issue a refresh token because offline_access was not requested). Skip the
            // refresh attempt and return the current token if still valid.
            LOGGER.info(
                    "No refresh token available; skipping token refresh and returning current token.");
            warningMessage = "No refresh token available; using existing access token.";
        } else if (configuration != null && configuration.isEnabled()) {
            LOGGER.info("Attempting to refresh the token.");
            try {
                sessionToken = doRefresh(refreshTokenToUse, accessToken, configuration);
                if (sessionToken != null) {
                    currentToken =
                            retrieveAccessToken(
                                    sessionToken.getAccessToken(), sessionToken.getExpires());
                }
            } catch (Exception e) {
                errorMessage = "An error occurred during token refresh: " + e.getMessage();
                LOGGER.error(errorMessage, e);
            }
        } else {
            LOGGER.warn("Configuration is null or disabled; skipping token refresh.");
        }

        if (sessionToken == null) {
            if (isTokenExpired(currentToken)) {
                errorMessage = "Token is invalid or expired, and refresh failed.";
                LOGGER.error(errorMessage);
                handleRefreshFailure(accessToken, refreshTokenToUse, configuration);
                return null;
            } else {
                if (warningMessage.isEmpty()) warningMessage = "Using existing access token.";
                sessionToken =
                        sessionToken(accessToken, refreshTokenToUse, currentToken.getExpiresAt());
            }
        }

        if (!warningMessage.isEmpty()) {
            sessionToken.setWarning(warningMessage);
        }
        if (!errorMessage.isEmpty()) {
            sessionToken.setError(errorMessage);
        }

        request.setAttribute(OAuth2Utils.ACCESS_TOKEN_VALUE, sessionToken.getAccessToken());
        request.setAttribute(OAuth2Utils.ACCESS_TOKEN_TYPE, sessionToken.getTokenType());

        // Set updated refresh token as HttpOnly cookie and remove it from the JSON response.
        HttpServletResponse response = getResponse();
        if (response != null && sessionToken.getRefreshToken() != null) {
            setRefreshTokenCookie(response, sessionToken.getRefreshToken(), request.isSecure());
            sessionToken.setRefreshToken(null);
        }

        return sessionToken;
    }

    /** Reads the refresh token (if any) cached alongside the given access token. */
    private String refreshTokenFromCache(String accessToken) {
        Authentication authentication = cache() != null ? cache().get(accessToken) : null;
        TokenDetails details = OAuth2Utils.getTokenDetails(authentication);
        if (details != null && details.getRefreshToken() != null) {
            return details.getRefreshToken().getTokenValue();
        }
        return null;
    }

    private boolean isTokenExpired(OAuth2AccessToken token) {
        if (token == null || token.getTokenValue().isEmpty()) {
            return true;
        }

        Date expiration = token.getExpiresAt() != null ? Date.from(token.getExpiresAt()) : null;

        if (expiration == null) {
            expiration = getExpirationDateFromToken(token.getTokenValue());
            if (expiration == null) {
                return true;
            }
        }

        long now = System.currentTimeMillis();
        long adjustedExpirationTime = expiration.getTime() + CLOCK_SKEW_ALLOWANCE_MILLIS;

        return adjustedExpirationTime <= now;
    }

    private Date getExpirationDateFromToken(String token) {
        try {
            Map<String, Object> claims = new JWTHelper(token).getPayloadAsMap();
            Object exp = claims.get("exp");
            if (exp != null) {
                return new Date(toEpochSeconds(exp) * 1000);
            }
            return null;
        } catch (Exception e) {
            LOGGER.error("Failed to parse JWT token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Whether the refresh token (when it is a JWT carrying an {@code exp} claim, as Keycloak's are)
     * is within the safety window of its own expiry. Opaque refresh tokens carry no expiry
     * information and keep the legacy behavior.
     */
    private boolean isRefreshTokenNearExpiry(String refreshToken) {
        if (refreshToken == null || refreshToken.isEmpty()) {
            return false;
        }
        Date expiration = getExpirationDateQuietly(refreshToken);
        if (expiration == null) {
            return false;
        }
        long remaining = expiration.getTime() - System.currentTimeMillis();
        return remaining <= REFRESH_TOKEN_EXPIRY_SAFETY_WINDOW_MILLIS;
    }

    /**
     * Like {@link #getExpirationDateFromToken(String)} but silent: meant for tokens that may
     * legitimately be opaque (non-JWT), where a parse failure is expected and must not log.
     */
    private Date getExpirationDateQuietly(String token) {
        try {
            Map<String, Object> claims = new JWTHelper(token).getPayloadAsMap();
            Object exp = claims.get("exp");
            if (exp == null) {
                return null;
            }
            return new Date(toEpochSeconds(exp) * 1000);
        } catch (Exception e) {
            return null;
        }
    }

    private Date getIssuedAtFromToken(String token) {
        try {
            Map<String, Object> claims = new JWTHelper(token).getPayloadAsMap();
            Object iat = claims.get("iat");
            if (iat != null) {
                return new Date(toEpochSeconds(iat) * 1000);
            }
            return null;
        } catch (Exception e) {
            LOGGER.debug("Failed to parse 'iat' from JWT token: {}", e.getMessage());
            return null;
        }
    }

    private long toEpochSeconds(Object value) {
        if (value instanceof Integer) {
            return ((Integer) value).longValue();
        } else if (value instanceof Long) {
            return (Long) value;
        } else if (value instanceof Number) {
            return ((Number) value).longValue();
        } else if (value instanceof String) {
            return Long.parseLong((String) value);
        }
        throw new IllegalArgumentException("Cannot parse epoch-seconds claim from token");
    }

    protected boolean shouldSkipRefresh(
            OAuth2AccessToken token, String refreshToken, OAuth2Configuration config) {
        if (!config.isSkipRefreshIfTokenValid()) {
            return false;
        }

        // Never skip when the refresh token itself is close to its own expiry: IdP refresh
        // tokens (e.g. Keycloak refresh_expires_in / session idle, 30 minutes by default)
        // only slide when a refresh grant is actually performed. Skipping past that window
        // leaves an unrefreshable session even though the access token still looks healthy,
        // and the session dies at the first real refresh attempt.
        if (isRefreshTokenNearExpiry(refreshToken)) {
            LOGGER.info(
                    "Refresh token close to its expiry; performing a real IdP refresh "
                            + "even though the access token is still valid.");
            return false;
        }

        Date expiration = token.getExpiresAt() != null ? Date.from(token.getExpiresAt()) : null;
        if (expiration == null) {
            expiration = getExpirationDateFromToken(token.getTokenValue());
        }
        if (expiration == null) {
            return false;
        }

        long now = System.currentTimeMillis();
        if (expiration.getTime() <= now) {
            return false;
        }

        Date issuedAt = getIssuedAtFromToken(token.getTokenValue());
        if (issuedAt != null) {
            long totalLifetime = expiration.getTime() - issuedAt.getTime();
            long elapsed = now - issuedAt.getTime();
            double fraction = config.getRefreshTokenLifetimeFraction();
            return elapsed < totalLifetime * fraction;
        }

        // Fallback: skip if more than 5 minutes remaining
        long remaining = expiration.getTime() - now;
        return remaining > CLOCK_SKEW_ALLOWANCE_MILLIS;
    }

    /**
     * Invokes the refresh endpoint to get a new session token with updated token details.
     *
     * <p>Attempts to refresh the session by exchanging the provided refresh token for a new access
     * token. If the refresh token is invalid or the request fails after several retries, the
     * session is cleared and the user is redirected to the login page.
     *
     * @param refreshToken the refresh token to use for obtaining new access and refresh tokens
     * @param accessToken the current access token
     * @param configuration the OAuth2Configuration containing client credentials and endpoint URI
     * @return a SessionToken containing the new token details, or null if the refresh process
     *     failed
     */
    protected SessionToken doRefresh(
            String refreshToken, String accessToken, OAuth2Configuration configuration) {
        SessionToken sessionToken = null;
        int attempt = 0;
        String errorMessage = "";

        // Use a plain RestTemplate (with the OAuth2 token-response converter) for the refresh
        // request body shaping; this mirrors the legacy behavior where the client secret is always
        // sent on refresh, independent of any sendClientSecret toggle.
        RestTemplate plainRestTemplate = createRefreshRestTemplate(configuration);
        HttpHeaders headers = getHttpHeaders(accessToken, configuration);
        MultiValueMap<String, String> requestBody = new LinkedMultiValueMap<>();
        requestBody.add("grant_type", "refresh_token");
        requestBody.add("refresh_token", refreshToken);
        requestBody.add("client_secret", configuration.getClientSecret());
        requestBody.add("client_id", configuration.getClientId());
        if (configuration.getScopes() != null && !configuration.getScopes().isEmpty()) {
            requestBody.add("scope", configuration.getScopes().replace(",", " "));
        }
        HttpEntity<MultiValueMap<String, String>> requestEntity =
                new HttpEntity<>(requestBody, headers);

        long backoffDelay = configuration.getInitialBackoffDelay();
        int maxRetries = configuration.getMaxRetries() > 0 ? configuration.getMaxRetries() : 1;

        while (attempt < maxRetries) {
            attempt++;
            LOGGER.info("Attempting to refresh token, attempt {} of {}", attempt, maxRetries);

            try {
                ResponseEntity<OAuth2AccessTokenResponse> response =
                        plainRestTemplate.exchange(
                                configuration.getAccessTokenUri(),
                                HttpMethod.POST,
                                requestEntity,
                                OAuth2AccessTokenResponse.class);

                if (response.getStatusCode().is2xxSuccessful()) {
                    OAuth2AccessTokenResponse tokenResponse = response.getBody();
                    OAuth2AccessToken newToken =
                            tokenResponse != null ? tokenResponse.getAccessToken() : null;
                    if (newToken != null && !isTokenExpired(newToken)) {
                        OAuth2RefreshToken newRefreshToken = tokenResponse.getRefreshToken();
                        OAuth2RefreshToken refreshTokenToUse =
                                (newRefreshToken != null && newRefreshToken.getTokenValue() != null)
                                        ? newRefreshToken
                                        : new OAuth2RefreshToken(refreshToken, null);

                        updateAuthToken(accessToken, newToken, refreshTokenToUse, configuration);
                        sessionToken =
                                sessionToken(
                                        newToken.getTokenValue(),
                                        refreshTokenToUse.getTokenValue(),
                                        newToken.getExpiresAt());

                        LOGGER.info("Token refreshed successfully on attempt {}", attempt);
                        break;
                    } else {
                        LOGGER.warn("Received invalid or expired token on attempt {}", attempt);
                    }
                } else if (response.getStatusCode().is4xxClientError()) {
                    LOGGER.error(
                            "Client error occurred: {}. Stopping further attempts.",
                            response.getStatusCode());
                    break;
                } else {
                    LOGGER.warn("Server error occurred: {}. Retrying...", response.getStatusCode());
                }
            } catch (RestClientException ex) {
                LOGGER.error("Attempt {}: Error refreshing token: {}", attempt, ex.getMessage());
                if (ex instanceof HttpStatusCodeException) {
                    // Surface the IdP error payload (e.g. invalid_grant vs invalid_client):
                    // it pinpoints whether the refresh token expired or the client
                    // credentials are wrong, which is otherwise invisible at this level.
                    LOGGER.warn(
                            "Token refresh rejected by the identity provider: {}",
                            ((HttpStatusCodeException) ex).getResponseBodyAsString());
                }
                if (attempt == maxRetries) {
                    errorMessage = "Max retries reached. Unable to refresh token.";
                    LOGGER.error(errorMessage);
                    break;
                }
            }

            // Apply backoff delay before the next retry, unless it's the last attempt
            if (attempt < maxRetries) {
                try {
                    LOGGER.info("Waiting for {} ms before next retry.", backoffDelay);
                    Thread.sleep(backoffDelay);
                } catch (InterruptedException e) {
                    LOGGER.warn("Backoff delay interrupted", e);
                    Thread.currentThread().interrupt();
                }
                backoffDelay *= configuration.getBackoffMultiplier();
            }
        }

        // Only call handleRefreshFailure if sessionToken is null after all attempts and errors
        if (sessionToken == null) {
            try {
                handleRefreshFailure(accessToken, refreshToken, configuration);
            } catch (Exception e) {
                errorMessage =
                        "Could not successfully perform the 'doLogout' procedure due to an internal error.";
                LOGGER.error(errorMessage, e);
            }
        }
        return sessionToken;
    }

    /**
     * Handles the refresh failure by clearing the session, logging out remotely, and redirecting to
     * login.
     *
     * @param accessToken the current access token
     * @param refreshToken the current refresh token
     * @param configuration the OAuth2Configuration with endpoint details
     */
    public void handleRefreshFailure(
            String accessToken, String refreshToken, OAuth2Configuration configuration) {
        LOGGER.info(
                "Unable to refresh token after max retries. Clearing the session and reporting "
                        + "the failure to the client.");
        HttpServletResponse response = getResponse();
        if (response != null) {
            clearRefreshTokenCookie(response);
        }
        doLogout(null);

        // This endpoint is invoked via XHR: never redirect. The 302 to the login page cannot
        // be followed by the client (observed live as a 302 -> 404 chain through the
        // front-end proxy that wiped the session). Report a clean 401 with the login URL so
        // the client can start a new authorization flow itself. The committed check keeps the
        // body from being written twice: handleRefreshFailure may be reached both from
        // doRefresh and from the expired-token path.
        HttpServletResponse failureResponse = getResponse();
        if (failureResponse != null && !failureResponse.isCommitted()) {
            try {
                String loginUrl = null;
                if (configuration != null && configuration.getProvider() != null) {
                    loginUrl =
                            "../../openid/" + configuration.getProvider().toLowerCase() + "/login";
                }
                failureResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                failureResponse.setContentType(MediaType.APPLICATION_JSON_VALUE);
                StringBuilder body =
                        new StringBuilder(
                                "{\"error\":\"session_expired\","
                                        + "\"message\":\"Token refresh failed; a new login is required.\"");
                if (loginUrl != null) {
                    body.append(",\"loginUrl\":\"").append(loginUrl).append("\"");
                }
                body.append("}");
                failureResponse.getWriter().write(body.toString());
                failureResponse.getWriter().flush();
            } catch (IOException e) {
                LOGGER.error("Error while writing the refresh-failure response: ", e);
            }
        }
    }

    private static HttpHeaders getHttpHeaders(
            String accessToken, OAuth2Configuration configuration) {
        HttpHeaders headers = new HttpHeaders();
        if (configuration != null
                && configuration.getClientId() != null
                && configuration.getClientSecret() != null) {
            // Set client ID and client secret for authentication.
            headers.setBasicAuth(configuration.getClientId(), configuration.getClientSecret());
        } else if (accessToken != null && !accessToken.isEmpty()) {
            headers.set("Authorization", "Bearer " + accessToken);
        }
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        return headers;
    }

    private SessionToken sessionToken(String accessToken, String refreshToken, Instant expires) {
        SessionToken sessionToken = new SessionToken();
        if (expires != null) sessionToken.setExpires(expires.toEpochMilli());
        sessionToken.setAccessToken(accessToken);
        sessionToken.setRefreshToken(refreshToken);
        sessionToken.setTokenType("bearer");
        return sessionToken;
    }

    // Builds an authentication instance out of the passed values and sets it both to the cache and
    // to the SecurityContext to be sure the new token is updated.
    protected void updateAuthToken(
            String oldToken,
            OAuth2AccessToken newToken,
            OAuth2RefreshToken refreshToken,
            OAuth2Configuration conf) {
        Authentication authentication = cache().get(oldToken);
        if (authentication == null)
            authentication = SecurityContextHolder.getContext().getAuthentication();

        LOGGER.info("Updating the cache and the SecurityContext with new Auth details");
        if (authentication != null && !(authentication instanceof AnonymousAuthenticationToken)) {
            TokenDetails details = OAuth2Utils.getTokenDetails(authentication);
            String idToken = details != null ? details.getIdToken() : null;
            cache().removeEntry(oldToken);
            PreAuthenticatedAuthenticationToken updated =
                    new PreAuthenticatedAuthenticationToken(
                            authentication.getPrincipal(),
                            authentication.getCredentials(),
                            authentication.getAuthorities());
            LOGGER.info(
                    "Creating new details. AccessToken: {} IdToken: {}",
                    newToken.getTokenValue(),
                    idToken);
            updated.setDetails(
                    new TokenDetails(newToken, idToken, conf.getBeanName(), refreshToken));
            cache().putCacheEntry(newToken.getTokenValue(), updated);
            SecurityContextHolder.getContext().setAuthentication(updated);
        }
    }

    protected OAuth2AccessToken retrieveAccessToken(String accessToken, Long expires) {
        Authentication authentication = cache() != null ? cache().get(accessToken) : null;
        OAuth2AccessToken result = null;
        if (authentication != null) {
            TokenDetails details = OAuth2Utils.getTokenDetails(authentication);
            if (details != null) result = details.getAccessToken();
        }
        if (result == null) {
            Instant expiresAt =
                    (expires != null && expires > 0) ? Instant.ofEpochMilli(expires) : null;
            result =
                    new OAuth2AccessToken(
                            OAuth2AccessToken.TokenType.BEARER,
                            accessToken,
                            Instant.now(),
                            expiresAt);
        }
        return result;
    }

    protected HttpServletRequest getRequest() {
        return OAuth2Utils.getRequest();
    }

    protected HttpServletResponse getResponse() {
        return OAuth2Utils.getResponse();
    }

    @Override
    public void doLogout(String sessionId) {
        HttpServletRequest request = getRequest();
        HttpServletResponse response = getResponse();
        OAuth2Configuration configuration = configuration();

        if (request == null || response == null || configuration == null) {
            LOGGER.warn(
                    "Request, response, or configuration is null, unable to proceed with logout.");
            return;
        }

        String token = null;
        String accessToken = null;
        if (sessionId != null) {
            TokenAuthenticationCache cache = cache();
            Authentication authentication = cache.get(sessionId);
            TokenDetails tokenDetails = OAuth2Utils.getTokenDetails(authentication);
            if (tokenDetails != null) {
                token = tokenDetails.getIdToken();
                if (tokenDetails.getAccessToken() != null) {
                    accessToken = tokenDetails.getAccessToken().getTokenValue();
                }
            }
            cache.removeEntry(sessionId);
        }

        if (token == null) {
            token = OAuth2Utils.getParameterValue(REFRESH_TOKEN_PARAM, request);
            if (token == null && RequestContextHolder.getRequestAttributes() != null) {
                token =
                        (String)
                                RequestContextHolder.getRequestAttributes()
                                        .getAttribute(REFRESH_TOKEN_PARAM, 0);
            }
        }

        if (accessToken == null) {
            accessToken = OAuth2Utils.getParameterValue(ACCESS_TOKEN_PARAM, request);
            if (accessToken == null && RequestContextHolder.getRequestAttributes() != null) {
                accessToken =
                        (String)
                                RequestContextHolder.getRequestAttributes()
                                        .getAttribute(ACCESS_TOKEN_PARAM, 0);
            }
        }

        if (configuration.isEnabled()) {
            if (token != null
                    && accessToken != null
                    && !token.isEmpty()
                    && !accessToken.isEmpty()) {
                if (configuration.isGlobalLogoutEnabled())
                    doLogoutInternal(token, configuration, accessToken);
                if (configuration.getRevokeEndpoint() != null) clearSession(request);
            } else {
                LOGGER.debug("Unable to retrieve access token. Remote logout was not executed.");
            }
            if (response != null) clearCookies(request, response);
        }
    }

    // Clears any session state.
    private void clearSession(HttpServletRequest request) {
        try {
            request.logout();
        } catch (ServletException e) {
            LOGGER.error("Error happened while doing request logout: ", e);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    /**
     * Call the revoke/logout endpoint of the OAuth2 provider.
     *
     * @param token the access token.
     * @param configuration the OAuth2Configuration
     */
    protected void doLogoutInternal(
            Object token, OAuth2Configuration configuration, String accessToken) {
        String tokenValue = null;
        if (token instanceof OAuth2AccessToken) {
            tokenValue = ((OAuth2AccessToken) token).getTokenValue();
        } else if (token instanceof String) {
            tokenValue = (String) token;
        }
        if (tokenValue == null) return;

        // Revoke the token if a revocation endpoint is available.
        if (configuration.getRevokeEndpoint() != null) {
            LOGGER.debug("Revoking token at revocation endpoint");
            callRevokeEndpoint(accessToken);
        }

        // Call the remote logout endpoint (end_session_endpoint) independently
        LOGGER.debug("Performing remote logout");
        callRemoteLogout(tokenValue, accessToken);
    }

    protected void callRevokeEndpoint(String accessToken) {
        OAuth2Configuration configuration = configuration();
        if (configuration != null && configuration.isEnabled()) {
            // accessToken is both the token to revoke and the Authorization: Bearer
            // fallback buildRevokeEndpoint uses when no client secret is configured.
            OAuth2Configuration.Endpoint revokeEndpoint =
                    configuration.buildRevokeEndpoint(accessToken, accessToken, configuration);
            if (revokeEndpoint != null) {
                RestTemplate template = protectedRestTemplate(configuration);
                try {
                    ResponseEntity<String> responseEntity =
                            template.exchange(
                                    revokeEndpoint.getUrl(),
                                    revokeEndpoint.getMethod(),
                                    revokeEndpoint.getRequestEntity(),
                                    String.class);
                    if (responseEntity.getStatusCode().value() != 200) {
                        logRevokeErrors(responseEntity.getBody());
                    }
                } catch (Exception e) {
                    logRevokeErrors(e);
                }
            }
        }
    }

    protected void callRemoteLogout(String token, String accessToken) {
        OAuth2Configuration configuration = configuration();
        if (configuration != null && configuration.isEnabled()) {
            OAuth2Configuration.Endpoint logoutEndpoint =
                    configuration.buildLogoutEndpoint(token, accessToken, configuration);
            if (logoutEndpoint != null) {
                RestTemplate template = protectedRestTemplate(configuration);
                ResponseEntity<String> responseEntity =
                        template.exchange(
                                logoutEndpoint.getUrl(),
                                logoutEndpoint.getMethod(),
                                logoutEndpoint.getRequestEntity(),
                                String.class);
                if (responseEntity.getStatusCode().value() != 200) {
                    logRevokeErrors(responseEntity.getBody());
                }
            }
        }
    }

    protected void clearCookies(HttpServletRequest request, HttpServletResponse response) {
        Cookie[] allCookies = request.getCookies();
        if (allCookies != null)
            for (Cookie toDelete : allCookies) {
                if (deleteCookie(toDelete)) {
                    // Max-Age must be 0 (-1 means "session cookie" and would RE-INSTATE the
                    // cookie with its current value: observed live as a logout response
                    // carrying both the clearing Set-Cookie and a full refresh_token one).
                    toDelete.setValue("");
                    toDelete.setMaxAge(0);
                    toDelete.setPath("/");
                    toDelete.setComment("EXPIRING COOKIE at " + System.currentTimeMillis());
                    if (toDelete.getName().equalsIgnoreCase(REFRESH_TOKEN_PARAM)) {
                        toDelete.setHttpOnly(true);
                        toDelete.setSecure(request.isSecure());
                    }
                    response.addCookie(toDelete);
                }
            }
    }

    protected boolean deleteCookie(Cookie c) {
        return c.getName().equalsIgnoreCase("JSESSIONID")
                || c.getName().equalsIgnoreCase(ACCESS_TOKEN_PARAM)
                || c.getName().equalsIgnoreCase(REFRESH_TOKEN_PARAM);
    }

    protected String getRefreshTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (REFRESH_TOKEN_PARAM.equalsIgnoreCase(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    protected void setRefreshTokenCookie(
            HttpServletResponse response, String refreshToken, boolean secure) {
        Cookie cookie = new Cookie(REFRESH_TOKEN_PARAM, refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(secure);
        cookie.setPath("/");
        cookie.setMaxAge(604800); // 7 days
        response.addCookie(cookie);
    }

    protected void clearRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(REFRESH_TOKEN_PARAM, "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    protected TokenAuthenticationCache cache() {
        return GeoStoreContext.bean("oAuth2Cache", TokenAuthenticationCache.class);
    }

    /**
     * Get the OAuth2Configuration. Prefers the provider-specific bean ({delegateName}OAuth2Config)
     * and falls back to iterating all enabled configurations.
     *
     * @return the OAuth2Configuration.
     */
    protected OAuth2Configuration configuration() {
        // Try provider-specific bean first
        if (delegateName != null) {
            OAuth2Configuration specific =
                    GeoStoreContext.bean(
                            delegateName + OAuth2Configuration.CONFIG_NAME_SUFFIX,
                            OAuth2Configuration.class);
            if (specific != null && specific.isEnabled()) {
                return specific;
            }
        }
        // Fallback: iterate all configurations
        Map<String, OAuth2Configuration> configurations =
                GeoStoreContext.beans(OAuth2Configuration.class);
        if (configurations != null) {
            Optional<OAuth2Configuration> enabledConfig =
                    configurations.values().stream()
                            .filter(OAuth2Configuration::isEnabled)
                            .findFirst();

            if (enabledConfig.isPresent()) {
                return enabledConfig.get();
            }
        } else {
            LOGGER.error("OAuth2Configuration is not initialized properly.");
            throw new IllegalStateException("Configuration is required but not initialized.");
        }
        return null;
    }

    /**
     * Creates a plain RestTemplate for token refresh requests, configured with the OAuth2 token
     * response converter so the token-endpoint JSON deserializes into an {@link
     * OAuth2AccessTokenResponse}.
     */
    protected RestTemplate createRefreshRestTemplate(OAuth2Configuration configuration) {
        RestTemplate restTemplate = protectedRestTemplate(configuration);
        restTemplate.setMessageConverters(
                Arrays.asList(
                        new FormHttpMessageConverter(),
                        new OAuth2AccessTokenResponseHttpMessageConverter()));
        return restTemplate;
    }

    @Override
    public User getUser(String sessionId, boolean refresh, boolean autorefresh) {
        String username = getUserName(sessionId, refresh, autorefresh);
        if (username != null) {
            User user;
            try {
                user = userService.get(username);
            } catch (Exception e) {
                LOGGER.warn("Issue while retrieving user. Will return just the username.", e);
                user = new User();
                user.setName(username);
            }
            return user;
        }
        return null;
    }

    @Override
    public String getUserName(String sessionId, boolean refresh, boolean autorefresh) {
        TokenAuthenticationCache cache = cache();
        Authentication authentication = cache.get(sessionId);
        if (refresh)
            LOGGER.warn(
                    "Refresh was set to true but this delegate is "
                            + "not supporting refreshing token when retrieving the user...");
        if (authentication != null) {
            Object o = authentication.getPrincipal();
            if (o != null) return SecurityUtils.getUsername(o);
        }
        return null;
    }

    private static void logRevokeErrors(Object cause) {
        LOGGER.error("Error while revoking authorization. Error is: {}", cause);
    }
}
