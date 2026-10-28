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

import it.geosolutions.geostore.services.rest.security.IdPConfiguration;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

/**
 * This class represents the OAuth2/OpenID Connect configuration for GeoStore. It includes settings
 * for endpoints, client credentials, and other OAuth2 provider details. Each OAuth2 provider
 * requires a specific OAuth2Configuration bean, identified with the naming convention
 * {providerName}OAuth2Config.
 */
public class OAuth2Configuration extends IdPConfiguration {

    private static final Logger LOGGER = LogManager.getLogger(OAuth2Configuration.class);

    // Constants
    public static final String CONFIG_NAME_SUFFIX = "OAuth2Config";
    public static final String CONFIGURATION_NAME = "CONFIGURATION_NAME";

    // OAuth2 provider client details
    private String clientId;
    private String clientSecret;

    // OAuth2 URIs and endpoints
    private String accessTokenUri;
    private String authorizationUri;
    private String checkTokenEndpointUrl;
    private String logoutUri;
    private String revokeEndpoint;
    private String introspectionEndpoint;

    // Additional settings
    private boolean globalLogoutEnabled = false;
    private String scopes;
    private String idTokenUri;
    private String discoveryUrl;
    private boolean enableRedirectEntryPoint = false;
    private String principalKey;
    private String uniqueUsername;
    private String rolesClaim;
    private String groupsClaim;
    private boolean groupNamesUppercase = false;
    private Map<String, String> roleMappings;
    private Map<String, String> groupMappings;
    private boolean dropUnmapped = false;

    // Sensitive information logging
    private boolean logSensitiveInfo = false;

    // Cache configuration
    private int cacheSize = 1000;
    private int cacheExpirationMinutes = 480;

    // Smart refresh: skip IDP refresh when token is still valid
    private boolean skipRefreshIfTokenValid = true;
    private double refreshTokenLifetimeFraction = 0.8;

    // Retry and backoff configurations
    private long initialBackoffDelay = 1000; // Default: 1 second
    private double backoffMultiplier = 2.0; // Default multiplier
    private int maxRetries = 3; // Default max retries

    // HTTP timeouts (milliseconds) for back-channel calls to the IdP
    private int connectTimeout = 10_000;
    private int readTimeout = 15_000;

    /**
     * Gets the connect timeout (in milliseconds) for back-channel calls to the IdP.
     *
     * @return connectTimeout - the connect timeout in milliseconds.
     */
    public int getConnectTimeout() {
        return connectTimeout;
    }

    /**
     * Sets the connect timeout (in milliseconds) for back-channel calls to the IdP.
     *
     * @param connectTimeout - the connect timeout in milliseconds.
     */
    public void setConnectTimeout(int connectTimeout) {
        this.connectTimeout = connectTimeout;
    }

    /**
     * Gets the read timeout (in milliseconds) for back-channel calls to the IdP.
     *
     * @return readTimeout - the read timeout in milliseconds.
     */
    public int getReadTimeout() {
        return readTimeout;
    }

    /**
     * Sets the read timeout (in milliseconds) for back-channel calls to the IdP.
     *
     * @param readTimeout - the read timeout in milliseconds.
     */
    public void setReadTimeout(int readTimeout) {
        this.readTimeout = readTimeout;
    }

    /**
     * Gets the maximum number of retries allowed for refreshing tokens.
     *
     * @return maxRetries - the maximum retry attempts.
     */
    public int getMaxRetries() {
        return maxRetries;
    }

    /**
     * Sets the maximum number of retries allowed for refreshing tokens.
     *
     * @param maxRetries - the maximum retry attempts to set.
     */
    public void setMaxRetries(int maxRetries) {
        this.maxRetries = maxRetries;
    }

    /**
     * Gets the initial backoff delay (in milliseconds) for retry attempts.
     *
     * @return initialBackoffDelay - the initial delay in milliseconds.
     */
    public long getInitialBackoffDelay() {
        return initialBackoffDelay;
    }

    /**
     * Sets the initial backoff delay (in milliseconds) for retry attempts.
     *
     * @param initialBackoffDelay - the initial delay in milliseconds.
     */
    public void setInitialBackoffDelay(long initialBackoffDelay) {
        this.initialBackoffDelay = initialBackoffDelay;
    }

    /**
     * Gets the multiplier applied to backoff delay for each retry attempt.
     *
     * @return backoffMultiplier - the multiplier for exponential backoff.
     */
    public double getBackoffMultiplier() {
        return backoffMultiplier;
    }

    /**
     * Sets the multiplier for exponential backoff delay between retry attempts.
     *
     * @param backoffMultiplier - the multiplier for backoff.
     */
    public void setBackoffMultiplier(double backoffMultiplier) {
        this.backoffMultiplier = backoffMultiplier;
    }

    public boolean isSkipRefreshIfTokenValid() {
        return skipRefreshIfTokenValid;
    }

    public void setSkipRefreshIfTokenValid(boolean skipRefreshIfTokenValid) {
        this.skipRefreshIfTokenValid = skipRefreshIfTokenValid;
    }

    public double getRefreshTokenLifetimeFraction() {
        return refreshTokenLifetimeFraction;
    }

    public void setRefreshTokenLifetimeFraction(double refreshTokenLifetimeFraction) {
        this.refreshTokenLifetimeFraction = refreshTokenLifetimeFraction;
    }

    /**
     * Provides an entry point to redirect to the authorization page for authentication.
     *
     * @return the AuthenticationEntryPoint handling authorization redirection.
     */
    public AuthenticationEntryPoint getAuthenticationEntryPoint() {
        return (request, response, authException) -> {
            String loginUri = buildLoginUri();
            response.sendRedirect(loginUri);
        };
    }

    /**
     * Builds the authorization URI, adding response type, client ID, scope, and redirect URI.
     *
     * @return the complete authorization URI.
     */
    public String buildLoginUri() {
        return buildLoginUri(null, new String[] {});
    }

    /**
     * Builds the authorization URI with an optional access type.
     *
     * @param accessType - the access type, e.g., "offline" or "online"; can be null.
     * @return the complete authorization URI.
     */
    public String buildLoginUri(String accessType) {
        return buildLoginUri(accessType, new String[] {});
    }

    /**
     * Builds the authorization URI with access type and additional scopes.
     *
     * @param accessType - the type of access requested, can be null.
     * @param additionalScopes - additional scopes required beyond configured scopes.
     * @return the complete authorization URI.
     */
    public String buildLoginUri(String accessType, String... additionalScopes) {
        if (getAuthorizationUri() == null) {
            LOGGER.error(
                    "authorizationUri is NULL for this configuration. "
                            + "discoveryUrl={}, clientId={}, enabled={}. "
                            + "If discoveryUrl is set, the discovery document fetch likely failed "
                            + "(check for network errors or unreachable IdP). "
                            + "Otherwise, set authorizationUri explicitly.",
                    getDiscoveryUrl(),
                    getClientId(),
                    isEnabled());
            throw new IllegalStateException(
                    "authorizationUri is null — OIDC discovery may have failed for discoveryUrl: "
                            + getDiscoveryUrl());
        }
        StringBuilder loginUri = new StringBuilder(getAuthorizationUri());
        loginUri.append("?response_type=code")
                .append("&client_id=")
                .append(getClientId())
                .append("&scope=")
                .append(getScopes() != null ? getScopes().replace(",", "%20") : "openid");

        for (String scope : additionalScopes) {
            loginUri.append("%20").append(scope);
        }

        loginUri.append("&redirect_uri=").append(getRedirectUri());

        if (accessType != null) {
            loginUri.append("&access_type=").append(accessType);
        }

        if (isLogSensitiveInfo()) {
            LOGGER.debug("Authorization endpoint URI built: {}", loginUri);
        }
        return loginUri.toString();
    }

    /**
     * Constructs a URI to refresh the access token.
     *
     * @return the refresh token URI.
     */
    public String buildRefreshTokenURI() {
        return buildRefreshTokenURI(null);
    }

    /**
     * Constructs a URI to refresh the access token with an optional access type.
     *
     * @param accessType - access type to be appended to the URI.
     * @return the complete refresh token URI.
     */
    public String buildRefreshTokenURI(String accessType) {
        StringBuilder refreshUri =
                new StringBuilder(getAccessTokenUri())
                        .append("?client_id=")
                        .append(getClientId())
                        .append("&scope=")
                        .append(getScopes().replace(",", "%20"));

        if (accessType != null) {
            refreshUri.append("&access_type=").append(accessType);
        }

        return refreshUri.toString();
    }

    /**
     * @return the clientId.
     */
    public String getClientId() {
        return clientId;
    }

    /**
     * Set the client id.
     *
     * @param cliendId the client id.
     */
    public void setClientId(String cliendId) {
        this.clientId = cliendId;
    }

    /**
     * @return the client secret.
     */
    public String getClientSecret() {
        return clientSecret;
    }

    /**
     * Set the client secret.
     *
     * @param clientSecret the client secret.
     */
    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }

    /**
     * @return the access token uri
     */
    public String getAccessTokenUri() {
        return accessTokenUri;
    }

    /**
     * Set the access token uri
     *
     * @param accessTokenUri the access token uri.
     */
    public void setAccessTokenUri(String accessTokenUri) {
        this.accessTokenUri = accessTokenUri;
    }

    /**
     * @return the authorization URI.
     */
    public String getAuthorizationUri() {
        return authorizationUri;
    }

    /**
     * Set the authorization URI.
     *
     * @param authorizationUri the authorization URI.
     */
    public void setAuthorizationUri(String authorizationUri) {
        this.authorizationUri = authorizationUri;
    }

    /**
     * @return the check token endpoint URL.
     */
    public String getCheckTokenEndpointUrl() {
        return checkTokenEndpointUrl;
    }

    /**
     * Set the check token endpoint URL.
     *
     * @param checkTokenEndpointUrl the check token endpoint URL.
     */
    public void setCheckTokenEndpointUrl(String checkTokenEndpointUrl) {
        this.checkTokenEndpointUrl = checkTokenEndpointUrl;
    }

    /**
     * @return the logout URI.
     */
    public String getLogoutUri() {
        return logoutUri;
    }

    /**
     * Set the logout URI.
     *
     * @param logoutUri the logout URI.
     */
    public void setLogoutUri(String logoutUri) {
        this.logoutUri = logoutUri;
    }

    /**
     * @return
     */
    public boolean isGlobalLogoutEnabled() {
        return globalLogoutEnabled;
    }

    /**
     * Set th
     *
     * @param globalLogoutEnabled
     */
    public void setGlobalLogoutEnabled(boolean globalLogoutEnabled) {
        this.globalLogoutEnabled = globalLogoutEnabled;
    }

    /**
     * Get the configured scopes as a String.
     *
     * @return the scopes.
     */
    public String getScopes() {
        return scopes;
    }

    /**
     * Set the scopes.
     *
     * @param scopes the scopes.
     */
    public void setScopes(String scopes) {
        this.scopes = scopes;
    }

    /**
     * @return the id Token URI.
     */
    public String getIdTokenUri() {
        return idTokenUri;
    }

    /**
     * Set the id token URI.
     *
     * @param idTokenUri the id Token URI.
     */
    public void setIdTokenUri(String idTokenUri) {
        this.idTokenUri = idTokenUri;
    }

    /**
     * @return the Discovery URL.
     */
    public String getDiscoveryUrl() {
        return discoveryUrl;
    }

    /**
     * Set the discovery URL.
     *
     * @param discoveryUrl the discovery URL.
     */
    public void setDiscoveryUrl(String discoveryUrl) {
        this.discoveryUrl = discoveryUrl;
    }

    /**
     * Check if the configuration is valid or not. Is considered invalid if either one of client id,
     * secret, authorization, accessToke Uri was not provided.
     *
     * @return
     */
    public boolean isInvalid() {
        return clientId == null
                || clientSecret == null
                || authorizationUri == null
                || accessTokenUri == null;
    }

    /**
     * @return the revoke endpoint.
     */
    public String getRevokeEndpoint() {
        return revokeEndpoint;
    }

    /**
     * Set the revoke endpoint.
     *
     * @param revokeEndpoint the revoke endpoint.
     */
    public void setRevokeEndpoint(String revokeEndpoint) {
        this.revokeEndpoint = revokeEndpoint;
    }

    /**
     * @return the token introspection endpoint (RFC 7662).
     */
    public String getIntrospectionEndpoint() {
        return introspectionEndpoint;
    }

    /**
     * Set the token introspection endpoint.
     *
     * @param introspectionEndpoint the introspection endpoint URL.
     */
    public void setIntrospectionEndpoint(String introspectionEndpoint) {
        this.introspectionEndpoint = introspectionEndpoint;
    }

    /**
     * Get the string identifier the provider associated with the configuration.
     *
     * @return the provider name.
     */
    public String getProvider() {
        return getBeanName().replaceAll(CONFIG_NAME_SUFFIX, "");
    }

    /**
     * Appends query parameters to a URL.
     *
     * @param params - the request parameters.
     * @param url - the base URL.
     * @return the URL with appended parameters.
     */
    protected String appendParameters(MultiValueMap<String, String> params, String url) {
        return UriComponentsBuilder.fromUriString(url).queryParams(params).build().toUriString();
    }

    protected static void getLogoutRequestParams(
            String token, String clientId, MultiValueMap<String, String> params) {
        params.put("token", Collections.singletonList(token));
        if (clientId != null && !clientId.isEmpty()) {
            params.put("client_id", Collections.singletonList(clientId));
        }
    }

    /**
     * Builds the endpoint for token revocation.
     *
     * @param token - the token to be revoked.
     * @param accessToken - the access token for authorization.
     * @param configuration - OAuth2 configuration.
     * @return the configured revoke endpoint, or null if not available.
     */
    public Endpoint buildRevokeEndpoint(
            String token, String accessToken, OAuth2Configuration configuration) {
        if (revokeEndpoint == null) return null;

        HttpHeaders headers = getHttpHeaders(accessToken, configuration);
        MultiValueMap<String, String> bodyParams = new LinkedMultiValueMap<>();
        bodyParams.add("token", token);
        bodyParams.add("client_id", clientId);

        HttpEntity<MultiValueMap<String, String>> requestEntity =
                new HttpEntity<>(bodyParams, headers);
        return new Endpoint(HttpMethod.POST, revokeEndpoint, requestEntity);
    }

    private static HttpHeaders getHttpHeaders(
            String accessToken, OAuth2Configuration configuration) {
        HttpHeaders headers = getHeaders(accessToken, configuration);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        return headers;
    }

    /**
     * Builds the endpoint for logout.
     *
     * @param token - the token for the session to end.
     * @param accessToken - access token to authorize the logout.
     * @param configuration - OAuth2 configuration.
     * @return the logout endpoint with parameters appended, or null if logoutUri is null.
     */
    public Endpoint buildLogoutEndpoint(
            String token, String accessToken, OAuth2Configuration configuration) {
        if (logoutUri == null) return null;

        HttpHeaders headers = getHeaders(accessToken, configuration);
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        getLogoutRequestParams(token, clientId, params);

        return new Endpoint(
                HttpMethod.GET, appendParameters(params, logoutUri), new HttpEntity<>(headers));
    }

    private static HttpHeaders getHeaders(String accessToken, OAuth2Configuration configuration) {
        HttpHeaders headers = new HttpHeaders();
        if (configuration != null
                && configuration.clientId != null
                && configuration.clientSecret != null)
            headers.setBasicAuth(
                    configuration.clientId,
                    configuration
                            .clientSecret); // Set client ID and client secret for authentication
        else if (accessToken != null && !accessToken.isEmpty()) {
            headers.set("Authorization", "Bearer " + accessToken);
        }
        return headers;
    }

    /**
     * @return true if redirect to authorization is active always. False otherwise.
     */
    public boolean isEnableRedirectEntryPoint() {
        return enableRedirectEntryPoint;
    }

    /**
     * Set the enableRedirectEntryPoint flag.
     *
     * @param enableRedirectEntryPoint true to enable always redirection, false otherwise.
     */
    public void setEnableRedirectEntryPoint(boolean enableRedirectEntryPoint) {
        this.enableRedirectEntryPoint = enableRedirectEntryPoint;
    }

    /**
     * Get the principal key. Default is email.
     *
     * @return the principal key.
     */
    public String getPrincipalKey() {
        if (principalKey == null || principalKey.isEmpty()) return "email";
        return principalKey;
    }

    /**
     * Set the principal key.
     *
     * @param principalKey the principal key.
     */
    public void setPrincipalKey(String principalKey) {
        this.principalKey = principalKey;
    }

    /**
     * Whether we would like to use another claim to extract the actual "username" from the token
     * claims.
     *
     * @return the unique username claim key.
     */
    public String getUniqueUsername() {
        return uniqueUsername;
    }

    /**
     * Set the unique username claim key.
     *
     * @param uniqueUsername the unique username claim key.
     */
    public void setUniqueUsername(String uniqueUsername) {
        this.uniqueUsername = uniqueUsername;
    }

    /**
     * The roles claim name.
     *
     * @return the roles claim name.
     */
    public String getRolesClaim() {
        return rolesClaim != null ? rolesClaim.trim() : null;
    }

    /**
     * Set the roles claim name.
     *
     * @param rolesClaim the roles claim name.
     */
    public void setRolesClaim(String rolesClaim) {
        this.rolesClaim = rolesClaim != null && !rolesClaim.isEmpty() ? rolesClaim.trim() : null;
    }

    /**
     * @return the groups claim name.
     */
    public String getGroupsClaim() {
        return groupsClaim != null ? groupsClaim.trim() : null;
    }

    /**
     * Set the groups claim name.
     *
     * @param groupsClaim the groups claim name.
     */
    public void setGroupsClaim(String groupsClaim) {
        this.groupsClaim =
                groupsClaim != null && !groupsClaim.isEmpty() ? groupsClaim.trim() : null;
    }

    public boolean isGroupNamesUppercase() {
        return groupNamesUppercase;
    }

    public void setGroupNamesUppercase(boolean groupNamesUppercase) {
        this.groupNamesUppercase = groupNamesUppercase;
    }

    public Map<String, String> getRoleMappings() {
        return roleMappings;
    }

    public void setRoleMappings(String roleMappings) {
        this.roleMappings = parseMappings(roleMappings);
    }

    public Map<String, String> getGroupMappings() {
        return groupMappings;
    }

    public void setGroupMappings(String groupMappings) {
        this.groupMappings = parseMappings(groupMappings);
    }

    public boolean isDropUnmapped() {
        return dropUnmapped;
    }

    public void setDropUnmapped(boolean dropUnmapped) {
        this.dropUnmapped = dropUnmapped;
    }

    public int getCacheSize() {
        return cacheSize;
    }

    public void setCacheSize(int cacheSize) {
        this.cacheSize = cacheSize;
    }

    public int getCacheExpirationMinutes() {
        return cacheExpirationMinutes;
    }

    public void setCacheExpirationMinutes(int cacheExpirationMinutes) {
        this.cacheExpirationMinutes = cacheExpirationMinutes;
    }

    public boolean isLogSensitiveInfo() {
        return logSensitiveInfo;
    }

    public void setLogSensitiveInfo(boolean logSensitiveInfo) {
        this.logSensitiveInfo = logSensitiveInfo;
    }

    /**
     * Parses comma-separated {@code key:value} mappings. Literal colons or commas inside a key or
     * value can be escaped with a backslash, e.g. {@code landscape\:read:mapped-name} maps the IdP
     * role {@code landscape:read}. Note that in .properties files the backslash itself must be
     * doubled ({@code landscape\\:read}) because the properties format consumes one level of
     * escaping.
     */
    static Map<String, String> parseMappings(String mappings) {
        if (mappings == null || mappings.trim().isEmpty()) return null;
        Map<String, String> map = new HashMap<>();
        for (String pair : splitUnescaped(mappings, ',', 0)) {
            List<String> parts = splitUnescaped(pair, ':', 2);
            if (parts.size() == 2) {
                String key = unescape(parts.get(0).trim());
                String value = unescape(parts.get(1).trim());
                if (!key.isEmpty()) {
                    map.put(key.toUpperCase(Locale.ROOT), value);
                }
            }
        }
        return map.isEmpty() ? null : map;
    }

    /**
     * Splits on the separator character, honoring backslash escaping: an escaped separator does not
     * split and is kept (still escaped) in the resulting part. With {@code limit > 0} at most
     * {@code limit} parts are produced (the remainder is left unsplit, like {@code
     * String.split(regex, limit)}).
     */
    private static List<String> splitUnescaped(String input, char separator, int limit) {
        List<String> result = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean escaped = false;
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            if (escaped) {
                current.append('\\').append(c);
                escaped = false;
            } else if (c == '\\') {
                escaped = true;
            } else if (c == separator && (limit <= 0 || result.size() < limit - 1)) {
                result.add(current.toString());
                current.setLength(0);
            } else {
                current.append(c);
            }
        }
        if (escaped) current.append('\\');
        result.add(current.toString());
        return result;
    }

    /** Removes one level of backslash escaping ({@code \x} becomes {@code x}). */
    private static String unescape(String input) {
        StringBuilder sb = new StringBuilder(input.length());
        boolean escaped = false;
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            if (!escaped && c == '\\') {
                escaped = true;
                continue;
            }
            sb.append(c);
            escaped = false;
        }
        if (escaped) sb.append('\\');
        return sb.toString();
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof OAuth2Configuration)) return false;
        OAuth2Configuration that = (OAuth2Configuration) o;
        return isGlobalLogoutEnabled() == that.isGlobalLogoutEnabled()
                && isEnableRedirectEntryPoint() == that.isEnableRedirectEntryPoint()
                && isGroupNamesUppercase() == that.isGroupNamesUppercase()
                && isDropUnmapped() == that.isDropUnmapped()
                && isSkipRefreshIfTokenValid() == that.isSkipRefreshIfTokenValid()
                && Double.compare(
                                getRefreshTokenLifetimeFraction(),
                                that.getRefreshTokenLifetimeFraction())
                        == 0
                && getInitialBackoffDelay() == that.getInitialBackoffDelay()
                && Double.compare(getBackoffMultiplier(), that.getBackoffMultiplier()) == 0
                && getMaxRetries() == that.getMaxRetries()
                && getConnectTimeout() == that.getConnectTimeout()
                && getReadTimeout() == that.getReadTimeout()
                && getCacheSize() == that.getCacheSize()
                && getCacheExpirationMinutes() == that.getCacheExpirationMinutes()
                && Objects.equals(getClientId(), that.getClientId())
                && Objects.equals(getClientSecret(), that.getClientSecret())
                && Objects.equals(getAccessTokenUri(), that.getAccessTokenUri())
                && Objects.equals(getAuthorizationUri(), that.getAuthorizationUri())
                && Objects.equals(getCheckTokenEndpointUrl(), that.getCheckTokenEndpointUrl())
                && Objects.equals(getLogoutUri(), that.getLogoutUri())
                && Objects.equals(getRevokeEndpoint(), that.getRevokeEndpoint())
                && Objects.equals(getScopes(), that.getScopes())
                && Objects.equals(getIdTokenUri(), that.getIdTokenUri())
                && Objects.equals(getDiscoveryUrl(), that.getDiscoveryUrl())
                && Objects.equals(getPrincipalKey(), that.getPrincipalKey())
                && Objects.equals(getUniqueUsername(), that.getUniqueUsername())
                && Objects.equals(getRolesClaim(), that.getRolesClaim())
                && Objects.equals(getGroupsClaim(), that.getGroupsClaim())
                && Objects.equals(getRoleMappings(), that.getRoleMappings())
                && Objects.equals(getGroupMappings(), that.getGroupMappings());
    }

    @Override
    public int hashCode() {
        return Objects.hash(
                getClientId(),
                getClientSecret(),
                getAccessTokenUri(),
                getAuthorizationUri(),
                getCheckTokenEndpointUrl(),
                getLogoutUri(),
                getRevokeEndpoint(),
                isGlobalLogoutEnabled(),
                getScopes(),
                getIdTokenUri(),
                getDiscoveryUrl(),
                isEnableRedirectEntryPoint(),
                getPrincipalKey(),
                getUniqueUsername(),
                getRolesClaim(),
                getGroupsClaim(),
                isGroupNamesUppercase(),
                getRoleMappings(),
                getGroupMappings(),
                isDropUnmapped(),
                isSkipRefreshIfTokenValid(),
                getRefreshTokenLifetimeFraction(),
                getCacheSize(),
                getCacheExpirationMinutes(),
                getInitialBackoffDelay(),
                getBackoffMultiplier(),
                getMaxRetries(),
                getConnectTimeout(),
                getReadTimeout());
    }

    @Override
    public String toString() {
        return "OAuth2Configuration{"
                + "clientId='"
                + clientId
                + '\''
                + ", clientSecret='"
                + (clientSecret != null && !clientSecret.isEmpty() ? "***" : null)
                + '\''
                + ", accessTokenUri='"
                + accessTokenUri
                + '\''
                + ", authorizationUri='"
                + authorizationUri
                + '\''
                + ", checkTokenEndpointUrl='"
                + checkTokenEndpointUrl
                + '\''
                + ", logoutUri='"
                + logoutUri
                + '\''
                + ", revokeEndpoint='"
                + revokeEndpoint
                + '\''
                + ", globalLogoutEnabled="
                + globalLogoutEnabled
                + ", scopes='"
                + scopes
                + '\''
                + ", idTokenUri='"
                + idTokenUri
                + '\''
                + ", discoveryUrl='"
                + discoveryUrl
                + '\''
                + ", enableRedirectEntryPoint="
                + enableRedirectEntryPoint
                + ", principalKey='"
                + principalKey
                + '\''
                + ", uniqueUsername='"
                + uniqueUsername
                + '\''
                + ", rolesClaim='"
                + rolesClaim
                + '\''
                + ", groupsClaim='"
                + groupsClaim
                + '\''
                + ", groupNamesUppercase="
                + groupNamesUppercase
                + ", roleMappings="
                + roleMappings
                + ", groupMappings="
                + groupMappings
                + ", dropUnmapped="
                + dropUnmapped
                + ", skipRefreshIfTokenValid="
                + skipRefreshIfTokenValid
                + ", refreshTokenLifetimeFraction="
                + refreshTokenLifetimeFraction
                + ", cacheSize="
                + cacheSize
                + ", cacheExpirationMinutes="
                + cacheExpirationMinutes
                + ", initialBackoffDelay="
                + initialBackoffDelay
                + ", backoffMultiplier="
                + backoffMultiplier
                + ", maxRetries="
                + maxRetries
                + ", connectTimeout="
                + connectTimeout
                + ", readTimeout="
                + readTimeout
                + '}';
    }

    /** Represents a configurable HTTP endpoint with method and request entity. */
    public static class Endpoint {

        private final String url;
        private final HttpMethod method;
        private final HttpEntity<?> requestEntity;

        public Endpoint(HttpMethod method, String url, HttpEntity<?> requestEntity) {
            this.method = method;
            this.url = url;
            this.requestEntity = requestEntity;
        }

        /**
         * @return the url.
         */
        public String getUrl() {
            return url;
        }

        /**
         * @return the HttpMethod.
         */
        public HttpMethod getMethod() {
            return method;
        }

        /**
         * @return
         */
        public HttpEntity<?> getRequestEntity() {
            return requestEntity;
        }
    }
}
