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

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.services.UserGroupService;
import it.geosolutions.geostore.services.UserService;
import it.geosolutions.geostore.services.rest.security.TokenAuthenticationCache;
import it.geosolutions.geostore.services.rest.security.oauth2.JWTHelper;
import it.geosolutions.geostore.services.rest.security.oauth2.OAuth2Configuration;
import it.geosolutions.geostore.services.rest.security.oauth2.OAuth2GeoStoreAuthenticationFilter;
import it.geosolutions.geostore.services.rest.security.oauth2.OAuth2GeoStoreAuthenticationFilter.OAuth2AuthenticationType;
import it.geosolutions.geostore.services.rest.security.oauth2.OAuth2GeoStoreAuthenticationService;
import it.geosolutions.geostore.services.rest.security.oauth2.OAuth2Utils;
import it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.bearer.JweTokenDecryptor;
import it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.bearer.JwksRsaKeyProvider;
import it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.bearer.MicrosoftGraphClient;
import it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.bearer.OpenIdTokenValidator;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.io.FileInputStream;
import java.lang.reflect.Array;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * OpenID Connect authentication service. Extends the generic {@link
 * OAuth2GeoStoreAuthenticationService} to add OIDC-specific behavior:
 *
 * <ul>
 *   <li>direct Bearer-token validation (JWT signature via JWKS, JWE decryption, RFC 7662
 *       introspection, audience/subject validation) bypassing the generic introspection flow;
 *   <li>Microsoft Graph enrichment for group/role overage.
 * </ul>
 *
 * <p>This is the service-side equivalent of the 2.6.x {@code OpenIdConnectFilter} overrides; it was
 * moved into the service to fit the Spring Security 7 thin-filter + service split.
 */
public class OpenIdConnectAuthenticationService extends OAuth2GeoStoreAuthenticationService {

    private static final Logger LOGGER =
            LogManager.getLogger(OpenIdConnectAuthenticationService.class);

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final OpenIdTokenValidator bearerTokenValidator;
    private final JwksRsaKeyProvider jwksKeyProvider;
    private volatile JweTokenDecryptor jweDecryptor;
    private volatile boolean jweDecryptorInitialized = false;
    private volatile MicrosoftGraphClient graphClient;
    private volatile boolean graphClientInitialized = false;

    /** userinfo-map key under which MS Graph-resolved group names are stashed for this request. */
    private static final String MSGRAPH_RESOLVED_GROUPS_KEY = "__geostore_msgraph_groups__";

    public OpenIdConnectAuthenticationService(
            TokenAuthenticationCache cache,
            UserService userService,
            UserGroupService userGroupService,
            OAuth2Configuration configuration,
            OpenIdTokenValidator bearerTokenValidator,
            JwksRsaKeyProvider jwksKeyProvider) {
        super(cache, userService, userGroupService, configuration);
        this.bearerTokenValidator = bearerTokenValidator;
        this.jwksKeyProvider = jwksKeyProvider;
    }

    private OpenIdConnectConfiguration oidcConfig() {
        return (OpenIdConnectConfiguration) configuration;
    }

    /**
     * For OIDC, user attributes are fetched from the userinfo endpoint (GET + Bearer), not from the
     * RFC 7662 introspection endpoint (POST). The introspection endpoint is used only for opaque
     * bearer token validation via {@code bearerTokenStrategy=introspection}.
     */
    @Override
    protected Map<String, Object> doIntrospectionOrUserInfoRequest(OAuth2AccessToken accessToken) {
        String userInfoUri = configuration.getCheckTokenEndpointUrl();
        if (!StringUtils.hasText(userInfoUri)) {
            LOGGER.debug("OIDC: no userinfo endpoint configured, skipping userinfo lookup");
            return null;
        }
        return doIntrospectionRequest(accessToken, userInfoUri);
    }

    /**
     * Fetches user attributes from the given URI using GET and a Bearer token header, via {@link
     * OpenIdConnectTokenServices}. In the OIDC context this is always the userinfo endpoint, passed
     * by {@link #doIntrospectionOrUserInfoRequest}.
     */
    @Override
    protected Map<String, Object> doIntrospectionRequest(
            OAuth2AccessToken accessToken, String userInfoUri) {
        if (accessToken == null
                || !StringUtils.hasText(accessToken.getTokenValue())
                || !StringUtils.hasText(userInfoUri)) {
            return null;
        }
        try {
            OpenIdConnectTokenServices tokenServices =
                    new OpenIdConnectTokenServices(configuration.getPrincipalKey(), configuration);
            tokenServices.setCheckTokenEndpointUrl(userInfoUri);
            tokenServices.setClientId(configuration.getClientId());
            tokenServices.setClientSecret(configuration.getClientSecret());
            Map<String, Object> result =
                    tokenServices.loadAuthentication(accessToken.getTokenValue());
            if (result == null || result.isEmpty()) {
                return null;
            }
            return result;
        } catch (Exception e) {
            LOGGER.warn("OIDC: userinfo/introspection request failed: {}", e.getMessage());
            return null;
        }
    }

    @Override
    protected String getPreAuthenticatedPrincipal(
            HttpServletRequest req, HttpServletResponse resp, OAuth2AccessToken accessToken) {

        OAuth2AuthenticationType type =
                (OAuth2AuthenticationType)
                        req.getAttribute(
                                OAuth2GeoStoreAuthenticationFilter.OAUTH2_AUTHENTICATION_TYPE_KEY);

        // For BEARER tokens with a validator configured, validate directly and extract the
        // principal from claims, skipping the generic introspection-based flow which can fail with
        // OIDC-only providers.
        if (type == OAuth2AuthenticationType.BEARER && bearerTokenValidator != null) {
            if (!oidcConfig().isAllowBearerTokens()) {
                LOGGER.warn(
                        "OIDC: received an attached Bearer token, but Bearer tokens aren't allowed!");
                throw new RuntimeException(
                        "OIDC: received an attached Bearer token, but Bearer tokens aren't allowed!");
            }

            String token = resolveTokenValue(req, accessToken);
            if (!StringUtils.hasText(token)) {
                LOGGER.error("OIDC: Bearer token validation requested but no token was found");
                throw new RuntimeException("Attached Bearer Token is missing");
            }

            String strategy =
                    StringUtils.hasText(oidcConfig().getBearerTokenStrategy())
                            ? oidcConfig().getBearerTokenStrategy()
                            : "jwt";
            Map<String, Object> bearerClaims = resolveBearerClaims(token, strategy);
            if (bearerClaims == null) {
                LOGGER.warn(
                        "OIDC: Bearer token could not be validated with strategy '{}'", strategy);
                throw new RuntimeException("Attached Bearer Token is invalid");
            }

            String principal =
                    coalesceClaimValue(
                            bearerClaims,
                            configuration.getUniqueUsername(),
                            configuration.getPrincipalKey());
            if (principal == null) {
                principal =
                        coalesceClaimValue(
                                bearerClaims,
                                "upn",
                                "preferred_username",
                                "unique_name",
                                "user_name",
                                "username",
                                "email",
                                "sub",
                                "oid");
            }

            if (StringUtils.hasText(principal)) {
                LOGGER.info(
                        "Authenticated OIDC Bearer token for user ({}): {}", strategy, principal);
                // Store bearer claims so addAuthoritiesFromToken() can read roles/groups from them.
                req.setAttribute(OAUTH2_ACCESS_TOKEN_CHECK_KEY, bearerClaims);
                return principal;
            }

            LOGGER.warn(
                    "OIDC: Bearer token validated but no principal could be resolved from claims");
            return null;
        }

        // USER auth type, or BEARER without a validator: use the generic flow.
        return super.getPreAuthenticatedPrincipal(req, resp, accessToken);
    }

    /**
     * Resolves the bearer token value from the access token, request attributes, or the request.
     */
    private String resolveTokenValue(HttpServletRequest req, OAuth2AccessToken accessToken) {
        String token = null;
        if (accessToken != null && StringUtils.hasText(accessToken.getTokenValue())) {
            token = accessToken.getTokenValue();
        }
        if (token == null) {
            Object fromValue = req.getAttribute(OAuth2Utils.ACCESS_TOKEN_VALUE);
            if (fromValue instanceof String) token = (String) fromValue;
        }
        if (token == null) {
            Object fromParam = req.getAttribute(OAuth2Utils.ACCESS_TOKEN_PARAM);
            if (fromParam instanceof String) token = (String) fromParam;
        }
        if (token == null) {
            token = OAuth2Utils.tokenFromParamsOrBearer(OAuth2Utils.ACCESS_TOKEN_PARAM, req);
        }
        return token;
    }

    private Map<String, Object> resolveBearerClaims(String token, String strategy) {
        if ("introspection".equalsIgnoreCase(strategy)) {
            return introspectToken(token);
        } else if ("auto".equalsIgnoreCase(strategy)) {
            try {
                return validateBearerJwt(token);
            } catch (Exception e) {
                LOGGER.info(
                        "OIDC: JWT validation failed, falling back to introspection: {}",
                        e.getMessage());
                return introspectToken(token);
            }
        } else {
            return validateBearerJwt(token);
        }
    }

    /**
     * Validates a bearer token as a JWT: optional JWE decryption, signature verification via JWKS,
     * exp/iat checks, and the configured token validator.
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> validateBearerJwt(String token) {
        Map<String, Object> accessTokenClaims;
        try {
            JweTokenDecryptor decryptor = getJweDecryptor();
            if (decryptor != null && JweTokenDecryptor.isJweToken(token)) {
                LOGGER.debug("Detected JWE token (5 parts), attempting decryption");
                token = decryptor.decrypt(token);
            }
            if (jwksKeyProvider != null) {
                String kid = extractKidFromHeader(token);
                RSAPublicKey key = jwksKeyProvider.getKey(kid);
                if (key == null) {
                    throw new RuntimeException("No JWK key found for kid: " + kid);
                }
                // Verify the RSA signature; throws if invalid.
                JWT.require(Algorithm.RSA256(key, null)).build().verify(token);
            } else {
                LOGGER.warn(
                        "OIDC: No JWKS key provider configured — decoding bearer token WITHOUT"
                                + " signature verification");
            }
            accessTokenClaims = new JWTHelper(token).getPayloadAsMap();
        } catch (Exception e) {
            LOGGER.error("OIDC: Could not decode/verify bearer token", e);
            throw new RuntimeException("Attached Bearer Token is invalid (decoding failed)", e);
        }

        Object expObj = accessTokenClaims.get("exp");
        if (expObj != null) {
            long expSeconds = parseEpochSeconds(expObj, "exp");
            if (System.currentTimeMillis() / 1000 > expSeconds) {
                LOGGER.warn("OIDC: Bearer token has expired (exp={})", expSeconds);
                throw new RuntimeException("Attached Bearer Token has expired");
            }
        }

        int maxTokenAgeSecs = oidcConfig().getMaxTokenAgeSecs();
        if (maxTokenAgeSecs > 0) {
            Object iatObj = accessTokenClaims.get("iat");
            if (iatObj != null) {
                long iatSeconds = parseEpochSeconds(iatObj, "iat");
                long age = System.currentTimeMillis() / 1000 - iatSeconds;
                if (age > maxTokenAgeSecs) {
                    LOGGER.warn(
                            "OIDC: Bearer token is too old (iat={}, age={}s, max={}s)",
                            iatSeconds,
                            age,
                            maxTokenAgeSecs);
                    throw new RuntimeException("Attached Bearer Token is too old");
                }
            }
        }

        try {
            bearerTokenValidator.verifyToken(oidcConfig(), accessTokenClaims, null);
        } catch (Exception e) {
            LOGGER.warn("OIDC: Bearer token validator rejected the token: {}", e.getMessage());
            throw new RuntimeException("Attached Bearer Token is invalid: " + e.getMessage(), e);
        }

        return accessTokenClaims;
    }

    private long parseEpochSeconds(Object value, String claimName) {
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        try {
            return Long.parseLong(String.valueOf(value));
        } catch (NumberFormatException nfe) {
            throw new RuntimeException("Bearer token '" + claimName + "' claim is not a number");
        }
    }

    /** Validates a bearer token via RFC 7662 Token Introspection. */
    @SuppressWarnings("unchecked")
    private Map<String, Object> introspectToken(String token) {
        String introspectionUrl = configuration.getIntrospectionEndpoint();
        if (!StringUtils.hasText(introspectionUrl)) {
            throw new RuntimeException(
                    "Bearer token introspection requested but no introspection endpoint is"
                            + " configured");
        }

        MultiValueMap<String, String> formParams = new LinkedMultiValueMap<>();
        formParams.add("token", token);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        String clientId = configuration.getClientId();
        String clientSecret = configuration.getClientSecret();
        if (StringUtils.hasText(clientId) && StringUtils.hasText(clientSecret)) {
            String credentials = clientId + ":" + clientSecret;
            String encoded =
                    Base64.getEncoder()
                            .encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
            headers.set("Authorization", "Basic " + encoded);
        }

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(formParams, headers);

        try {
            RestTemplate rt = OAuth2Utils.protectedRestTemplate(configuration);
            Map<String, Object> response = rt.postForObject(introspectionUrl, request, Map.class);
            if (response == null) {
                LOGGER.warn("OIDC: Token introspection returned null response");
                return null;
            }
            Object active = response.get("active");
            boolean isActive =
                    Boolean.TRUE.equals(active)
                            || (active instanceof String
                                    && "true".equalsIgnoreCase((String) active));
            if (!isActive) {
                LOGGER.warn("OIDC: Token introspection returned active=false");
                return null;
            }
            LOGGER.info("OIDC: Token introspection successful (active=true)");
            return response;
        } catch (Exception e) {
            LOGGER.error("OIDC: Token introspection failed", e);
            throw new RuntimeException("Token introspection failed", e);
        }
    }

    /** Extracts the "kid" (key ID) from a JWT's header segment. */
    private String extractKidFromHeader(String token) {
        try {
            int firstDot = token.indexOf('.');
            if (firstDot < 0) return "";
            String headerSegment = token.substring(0, firstDot);
            String headerJson =
                    new String(
                            Base64.getUrlDecoder().decode(headerSegment), StandardCharsets.UTF_8);
            JsonNode header = OBJECT_MAPPER.readTree(headerJson);
            return header.path("kid").asText();
        } catch (Exception e) {
            LOGGER.debug("Could not extract kid from JWT header", e);
            return "";
        }
    }

    /** Lazily initializes the JWE token decryptor from the keystore configuration. */
    private JweTokenDecryptor getJweDecryptor() {
        if (jweDecryptorInitialized) {
            return jweDecryptor;
        }
        synchronized (this) {
            if (jweDecryptorInitialized) {
                return jweDecryptor;
            }
            try {
                OpenIdConnectConfiguration oidcConfig = oidcConfig();
                String keystoreFile = oidcConfig.getJweKeyStoreFile();
                if (!StringUtils.hasText(keystoreFile)) {
                    LOGGER.debug("JWE not configured (no jweKeyStoreFile)");
                    jweDecryptor = null;
                    jweDecryptorInitialized = true;
                    return null;
                }

                String keystorePassword =
                        oidcConfig.getJweKeyStorePassword() != null
                                ? oidcConfig.getJweKeyStorePassword()
                                : "";
                String keystoreType =
                        oidcConfig.getJweKeyStoreType() != null
                                ? oidcConfig.getJweKeyStoreType()
                                : "PKCS12";
                String keyAlias = oidcConfig.getJweKeyAlias();
                String keyPassword =
                        oidcConfig.getJweKeyPassword() != null
                                ? oidcConfig.getJweKeyPassword()
                                : keystorePassword;

                KeyStore keyStore = KeyStore.getInstance(keystoreType);
                try (FileInputStream fis = new FileInputStream(keystoreFile)) {
                    keyStore.load(fis, keystorePassword.toCharArray());
                }

                if (!StringUtils.hasText(keyAlias)) {
                    keyAlias = keyStore.aliases().nextElement();
                }

                PrivateKey privateKey =
                        (PrivateKey) keyStore.getKey(keyAlias, keyPassword.toCharArray());
                if (privateKey == null) {
                    LOGGER.error(
                            "JWE keystore '{}' does not contain a private key with alias '{}'",
                            keystoreFile,
                            keyAlias);
                    jweDecryptor = null;
                    jweDecryptorInitialized = true;
                    return null;
                }

                jweDecryptor = new JweTokenDecryptor(privateKey);
                LOGGER.info(
                        "JWE token decryptor initialized with key alias '{}' from '{}'",
                        keyAlias,
                        keystoreFile);
            } catch (Exception e) {
                LOGGER.error("Failed to initialize JWE token decryptor: {}", e.getMessage(), e);
                jweDecryptor = null;
            }
            jweDecryptorInitialized = true;
            return jweDecryptor;
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    protected void addAuthoritiesFromToken(
            User user,
            String tokenString,
            String accessTokenString,
            Map<String, Object> userinfoMap) {
        OpenIdConnectConfiguration oidcConfig = oidcConfig();
        if (oidcConfig.isMsGraphEnabled()) {
            MicrosoftGraphClient client = getGraphClient();
            String accessToken =
                    StringUtils.hasText(accessTokenString) ? accessTokenString : tokenString;
            if (client != null && accessToken != null) {
                Map<String, Object> enriched =
                        (userinfoMap != null) ? new HashMap<>(userinfoMap) : new HashMap<>();

                if (oidcConfig.isMsGraphGroupsEnabled()
                        && configuration.getGroupsClaim() != null
                        && (oidcConfig.isMsGraphAlwaysResolveGroups()
                                || isGroupsOverage(tokenString, configuration.getGroupsClaim()))) {
                    // Either always-resolve is on, or the token signalled a groups overage.
                    // Resolve display names via Graph and stash them under a dedicated key so
                    // syncGroupsFromClaims (overridden below) treats them as the authoritative
                    // source — overriding even an inline (GUID-valued) groups claim. On Graph
                    // failure nothing is stashed and the normal claim resolution applies.
                    List<String> graphGroups = client.fetchMemberOfGroups(accessToken);
                    if (!graphGroups.isEmpty()) {
                        enriched.put(MSGRAPH_RESOLVED_GROUPS_KEY, graphGroups);
                    }
                }

                if (oidcConfig.isMsGraphRolesEnabled() && configuration.getRolesClaim() != null) {
                    List<MicrosoftGraphClient.AppRoleAssignment> assignments =
                            client.fetchAppRoleAssignments(accessToken);
                    if (!assignments.isEmpty()) {
                        List<String> roleNames =
                                client.resolveAppRoleNames(accessToken, assignments);
                        if (!roleNames.isEmpty()) {
                            enriched.put(configuration.getRolesClaim(), roleNames);
                        }
                    }
                }

                userinfoMap = enriched;
            }
        }
        super.addAuthoritiesFromToken(user, tokenString, accessTokenString, userinfoMap);
    }

    /**
     * When MS Graph has resolved the authoritative group names (always-resolve or overage), they
     * are stashed under {@link #MSGRAPH_RESOLVED_GROUPS_KEY} and take precedence over any inline
     * groups claim in the token. Otherwise the standard claim-based resolution applies.
     */
    @Override
    @SuppressWarnings("unchecked")
    protected void syncGroupsFromClaims(
            User user,
            JWTHelper primaryHelper,
            JWTHelper accessHelper,
            Map<String, Object> userinfoMap) {
        if (userinfoMap != null && userinfoMap.get(MSGRAPH_RESOLVED_GROUPS_KEY) instanceof List) {
            List<String> graphGroups = (List<String>) userinfoMap.get(MSGRAPH_RESOLVED_GROUPS_KEY);
            LOGGER.info(
                    "Using {} MS Graph-resolved group(s) as the authoritative group source.",
                    graphGroups.size());
            finalizeGroupSync(user, graphGroups);
        } else {
            super.syncGroupsFromClaims(user, primaryHelper, accessHelper, userinfoMap);
        }
    }

    /** Whether the JWT payload indicates an Azure AD groups overage condition. */
    boolean isGroupsOverage(String tokenString, String groupsClaim) {
        if (!StringUtils.hasText(tokenString)) return false;
        try {
            String[] parts = tokenString.split("\\.");
            if (parts.length < 2) return false;
            String payloadJson =
                    new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            JsonNode payload = OBJECT_MAPPER.readTree(payloadJson);

            if (payload.path("hasgroups").asBoolean()) {
                LOGGER.info("MS Graph: groups overage detected (hasgroups=true)");
                return true;
            }

            JsonNode claimNames = payload.path("_claim_names");
            if (claimNames.isObject() && claimNames.has(groupsClaim)) {
                LOGGER.info(
                        "MS Graph: groups overage detected (_claim_names contains '{}')",
                        groupsClaim);
                return true;
            }
            return false;
        } catch (Exception e) {
            LOGGER.debug("Could not check for groups overage in JWT", e);
            return false;
        }
    }

    /** Lazily initializes the Microsoft Graph client. */
    private MicrosoftGraphClient getGraphClient() {
        if (graphClientInitialized) {
            return graphClient;
        }
        synchronized (this) {
            if (graphClientInitialized) {
                return graphClient;
            }
            try {
                OpenIdConnectConfiguration oidcConfig = oidcConfig();
                if (!oidcConfig.isMsGraphEnabled()) {
                    LOGGER.debug("MS Graph not enabled");
                    graphClient = null;
                    graphClientInitialized = true;
                    return null;
                }
                graphClient = new MicrosoftGraphClient(oidcConfig.getMsGraphEndpoint(), oidcConfig);
                LOGGER.info(
                        "MS Graph client initialized with endpoint '{}'",
                        oidcConfig.getMsGraphEndpoint());
            } catch (Exception e) {
                LOGGER.error("Failed to initialize MS Graph client: {}", e.getMessage(), e);
                graphClient = null;
            }
            graphClientInitialized = true;
            return graphClient;
        }
    }

    /** First non-blank claim value among the given keys (case-insensitive, unwraps arrays). */
    private String coalesceClaimValue(Map<String, Object> claims, String... keys) {
        if (claims == null) return null;
        for (String key : keys) {
            if (!StringUtils.hasText(key)) continue;
            Object value = claims.get(key);
            if (value == null) {
                for (Map.Entry<String, Object> e : claims.entrySet()) {
                    if (key.equalsIgnoreCase(e.getKey())) {
                        value = e.getValue();
                        break;
                    }
                }
            }
            if (value != null) {
                if (value instanceof Collection) {
                    Collection<?> coll = (Collection<?>) value;
                    if (!coll.isEmpty()) value = coll.iterator().next();
                } else if (value.getClass().isArray() && Array.getLength(value) > 0) {
                    value = Array.get(value, 0);
                }
                String str = String.valueOf(value);
                if (!str.isEmpty()) return str;
            }
        }
        return null;
    }
}
