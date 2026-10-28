package it.geosolutions.geostore.services.rest.security.oauth2;

import static it.geosolutions.geostore.services.rest.security.oauth2.OAuth2Utils.ACCESS_TOKEN_PARAM;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserAttribute;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.UserGroupAttribute;
import it.geosolutions.geostore.core.model.enums.Role;
import it.geosolutions.geostore.services.UserGroupService;
import it.geosolutions.geostore.services.UserService;
import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;
import it.geosolutions.geostore.services.rest.security.TokenAuthenticationCache;

import jakarta.annotation.Nullable;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.server.resource.introspection.BadOpaqueTokenException;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.web.client.ResourceAccessException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * GeoStore OAuth2 authentication service.
 *
 * <p>This class handles OAuth2 authentication including user auto-creation, token caching, and
 * robust principal resolution (security principal -> introspection map -> JWT claims). It can
 * augment user role/groups from token claims.
 */
public class OAuth2GeoStoreAuthenticationService {

    private static final Logger LOGGER =
            LogManager.getLogger(OAuth2GeoStoreAuthenticationService.class);

    private static final String SOURCE_SERVICE_USER_GROUP_ATTRIBUTE_NAME = "sourceService";

    public static final String OAUTH2_ACCESS_TOKEN_CHECK_KEY = "oauth2.AccessTokenCheckResponse";

    // protected so the OpenIdConnect subclass can reuse them when overriding principal/authority
    // resolution.
    protected final TokenAuthenticationCache cache;
    protected UserService userService;
    protected UserGroupService userGroupService;
    protected final OAuth2Configuration configuration;

    public OAuth2GeoStoreAuthenticationService(
            TokenAuthenticationCache cache,
            UserService userService,
            UserGroupService userGroupService,
            OAuth2Configuration configuration) {
        this.cache = cache;
        this.userService = userService;
        this.userGroupService = userGroupService;
        this.configuration = configuration;
    }

    /** Allows the owning filter (or tests) to wire the user service after construction. */
    public void setUserService(UserService userService) {
        this.userService = userService;
    }

    /** Allows the owning filter (or tests) to wire the user-group service after construction. */
    public void setUserGroupService(UserGroupService userGroupService) {
        this.userGroupService = userGroupService;
    }

    public Authentication authenticate(
            String token, HttpServletRequest request, HttpServletResponse response) {

        Authentication authentication = cache.get(token);

        if (authentication == null) {
            // Bearer path: wrap the incoming bearer token as an OAuth2AccessToken so its claims
            // (roles/groups) are available to authority synchronization in createPreAuthentication.
            // The 2.6.x filter always authenticated bearer tokens with the access token in hand,
            // and
            // no refresh token accompanies an incoming bearer token.
            OAuth2AccessToken bearerAccessToken =
                    new OAuth2AccessToken(
                            OAuth2AccessToken.TokenType.BEARER, token, Instant.now(), null);
            return authenticateAndUpdateCache(request, response, token, bearerAccessToken, null);
        }

        TokenDetails tokenDetails = OAuth2Utils.getTokenDetails(authentication);
        if (tokenDetails != null) {
            OAuth2AccessToken accessToken = tokenDetails.getAccessToken();
            if (accessToken != null
                    && accessToken.getExpiresAt() != null
                    && accessToken.getExpiresAt().isBefore(Instant.now())) {
                return authenticateAndUpdateCache(
                        request, response, token, accessToken, tokenDetails.getRefreshToken());
            }
        }

        return refreshCachedUserRole(authentication, token);
    }

    private Authentication authenticateAndUpdateCache(
            HttpServletRequest request,
            HttpServletResponse response,
            String token,
            OAuth2AccessToken accessToken,
            OAuth2RefreshToken refreshToken) {

        Authentication authentication =
                performOAuthAuthentication(request, response, accessToken, refreshToken);

        if (authentication != null) {

            TokenDetails tokenDetails = OAuth2Utils.getTokenDetails(authentication);
            if (tokenDetails != null) {
                OAuth2AccessToken accessTokenDetails = tokenDetails.getAccessToken();
                if (accessTokenDetails != null) {
                    token = accessTokenDetails.getTokenValue();
                }
            }

            if (token != null) {
                cache.putCacheEntry(token, authentication);
            }
        }

        return authentication;
    }

    private Authentication performOAuthAuthentication(
            HttpServletRequest request,
            HttpServletResponse response,
            OAuth2AccessToken accessToken,
            OAuth2RefreshToken refreshToken) {

        LOGGER.info("About to perform remote authentication.");
        LOGGER.debug(
                "Access token received (type={}, scopes={})",
                accessToken.getTokenType().getValue(),
                accessToken.getScopes());

        String principal = null;

        try {
            LOGGER.info("Trying to get the pre-authenticated principal.");
            principal = getPreAuthenticatedPrincipal(request, response, accessToken);
        } catch (Exception e) {
            LOGGER.error("Error obtaining pre-authenticated principal: {}", e.getMessage(), e);
        }

        LOGGER.info("Pre-authenticated principal = {}, trying to authenticate", principal);

        PreAuthenticatedAuthenticationToken result = null;
        if (StringUtils.isNotBlank(principal)) {
            result =
                    createPreAuthentication(
                            principal, request, response, accessToken, refreshToken);
        }
        return result;
    }

    /**
     * Resolve the principal exactly as the 2.6.x filter did (it never consulted the Spring Security
     * context): 1) introspection / user-info call (also stashed as a request attribute so authority
     * sync can reuse it), 2) principal from the introspection/extension map (configured
     * uniqueUsername/principalKey, then common claim names), 3) JWT claims (ID Token preferred,
     * else Access Token, else bearer/param).
     */
    protected String getPreAuthenticatedPrincipal(
            HttpServletRequest req, HttpServletResponse resp, OAuth2AccessToken accessToken) {

        Map<String, Object> tokenAttributes = null;

        // 1) Introspection
        try {
            tokenAttributes = performIntrospectionOrUserInfo(accessToken);
            if (tokenAttributes != null && !tokenAttributes.isEmpty()) {
                req.setAttribute(OAUTH2_ACCESS_TOKEN_CHECK_KEY, tokenAttributes);
                LOGGER.info("Stored OAuth2 token check attributes in request");
            }
        } catch (Exception e) {
            LOGGER.warn("Unable to introspect token or retrieve user-info", e);
        }

        // 2) Principal from the introspection/extension map (the 2.6.x primary lookup, which
        //    extracted the principal from the check_token response via principalKey/uniqueUsername)
        try {
            String principal = extractPrincipalFromAttributes(tokenAttributes);
            if (StringUtils.isNotBlank(principal)) {
                LOGGER.info(
                        "Resolved pre-authenticated principal from token attributes: {}",
                        principal);
                return principal;
            }
        } catch (Exception e) {
            LOGGER.warn("Unable to resolve principal from token attributes", e);
        }

        // 4) Fallback #2: JWT claims (ID Token preferred, else Access Token, else bearer/param)
        try {
            String principal = extractPrincipalFromFallbacks(accessToken, req);
            if (StringUtils.isNotBlank(principal)) {
                LOGGER.info(
                        "Resolved pre-authenticated principal from fallback strategy: {}",
                        principal);
                return principal;
            }
        } catch (Exception e) {
            LOGGER.warn("Unable to resolve principal from fallback strategy", e);
        }

        // 5) Nothing worked
        LOGGER.warn(
                "Principal could not be resolved from security principal, introspection, or JWT claims.");
        return null;
    }

    private Map<String, Object> performIntrospectionOrUserInfo(OAuth2AccessToken accessToken) {
        if (accessToken == null || StringUtils.isBlank(accessToken.getTokenValue())) {
            LOGGER.debug("Skipping introspection/user-info because access token is missing");
            return null;
        }

        try {
            LOGGER.info("Attempting token introspection/user-info lookup");

            Map<String, Object> tokenAttributes = doIntrospectionOrUserInfoRequest(accessToken);

            if (tokenAttributes == null || tokenAttributes.isEmpty()) {
                LOGGER.warn("Introspection/user-info returned no attributes");
                return null;
            }

            Object active = tokenAttributes.get("active");
            if (active instanceof Boolean && !((Boolean) active)) {
                LOGGER.warn("Token introspection returned active=false");
                return null;
            }

            if (active instanceof String && !"true".equalsIgnoreCase((String) active)) {
                LOGGER.warn("Token introspection returned non-active token");
                return null;
            }

            LOGGER.info("Successfully retrieved token attributes from introspection/user-info");
            return tokenAttributes;
        } catch (ResourceAccessException e) {
            LOGGER.error(
                    "OAuth2 provider unreachable during introspection/user-info: {}",
                    e.getMessage(),
                    e);
            return null;
        } catch (Exception e) {
            LOGGER.warn("OAuth2 introspection/user-info failed: {}", e.getMessage(), e);
            return null;
        }
    }

    protected Map<String, Object> doIntrospectionOrUserInfoRequest(OAuth2AccessToken accessToken) {
        if (accessToken == null || StringUtils.isBlank(accessToken.getTokenValue())) {
            LOGGER.debug(
                    "Cannot perform introspection/user-info request because access token is missing");
            return null;
        }

        String introspectionUri =
                StringUtils.firstNonBlank(
                        configuration.getIntrospectionEndpoint(),
                        configuration.getCheckTokenEndpointUrl());

        if (StringUtils.isNotBlank(introspectionUri)) {
            LOGGER.debug("Using OAuth2 introspection endpoint [{}]", introspectionUri);
            return doIntrospectionRequest(accessToken, introspectionUri);
        }

        LOGGER.debug("No introspection endpoint configured; user-info fallback not available yet");
        return null;
    }

    protected Map<String, Object> doIntrospectionRequest(
            OAuth2AccessToken accessToken, String introspectionUri) {
        if (accessToken == null
                || StringUtils.isBlank(accessToken.getTokenValue())
                || StringUtils.isBlank(introspectionUri)) {
            return null;
        }

        try {
            LOGGER.info("Calling introspection endpoint [{}] for token", introspectionUri);

            GeoStoreRemoteTokenServices tokenServices =
                    GeoStoreRemoteTokenServices.defaultInstance(configuration);
            tokenServices.setCheckTokenEndpointUrl(introspectionUri);
            tokenServices.setClientId(configuration.getClientId());
            tokenServices.setClientSecret(configuration.getClientSecret());

            Map<String, Object> result =
                    tokenServices.loadAuthentication(accessToken.getTokenValue());

            if (result == null || result.isEmpty()) {
                LOGGER.warn("Introspection endpoint returned empty response for token");
                return null;
            }

            LOGGER.debug("Introspection returned attributes for token: {}", result);
            return result;
        } catch (BadOpaqueTokenException e) {
            LOGGER.warn("Introspection response indicates invalid token: {}", e.getMessage());
            return null;
        } catch (Exception e) {
            LOGGER.warn("Introspection request failed with general error: {}", e.getMessage(), e);
            return null;
        }
    }

    protected String extractPrincipalFromAttributes(Map<String, Object> attributes) {
        try {
            if (attributes == null || attributes.isEmpty()) {
                LOGGER.debug("No token attributes available to resolve principal");
                return null;
            }

            String fromAttributes =
                    coalesce(
                            findFirstIgnoreCase(attributes, configuration.getUniqueUsername()),
                            findFirstIgnoreCase(attributes, configuration.getPrincipalKey()));

            if (StringUtils.isBlank(fromAttributes)) {
                fromAttributes =
                        coalesce(
                                findFirstIgnoreCase(attributes, "upn"),
                                findFirstIgnoreCase(attributes, "preferred_username"),
                                findFirstIgnoreCase(attributes, "unique_name"),
                                findFirstIgnoreCase(attributes, "user_name"),
                                findFirstIgnoreCase(attributes, "username"),
                                findFirstIgnoreCase(attributes, "email"),
                                findFirstIgnoreCase(attributes, "sub"),
                                findFirstIgnoreCase(attributes, "oid"));
            }

            if (StringUtils.isNotBlank(fromAttributes)) {
                LOGGER.debug(
                        "Authenticated OAuth request with user (introspection) {}", fromAttributes);
                return fromAttributes;
            }

            LOGGER.debug("No supported principal attribute found in token attributes");
            return null;
        } catch (Exception e) {
            LOGGER.warn("Unable to resolve principal from token attributes", e);
            return null;
        }
    }

    private String coalesce(String... values) {
        if (values == null) return null;
        for (String v : values) {
            if (StringUtils.isNotBlank(v)) return v;
        }
        return null;
    }

    /** Case-insensitive, searches also one nested level if the map contains sub-maps. */
    @SuppressWarnings("unchecked")
    private String findFirstIgnoreCase(Map<String, Object> map, String key) {
        if (map == null || StringUtils.isBlank(key)) return null;
        for (Map.Entry<String, Object> e : map.entrySet()) {
            if (key.equalsIgnoreCase(String.valueOf(e.getKey()))) {
                return e.getValue() != null ? String.valueOf(e.getValue()) : null;
            }
        }
        for (Object v : map.values()) {
            if (v instanceof Map) {
                String found = findFirstIgnoreCase((Map<String, Object>) v, key);
                if (StringUtils.isNotBlank(found)) return found;
            }
        }
        return null;
    }

    protected String extractPrincipalFromFallbacks(
            OAuth2AccessToken accessToken, HttpServletRequest req) {
        try {
            String idToken = OAuth2Utils.getIdToken();

            if (idToken == null && accessToken != null) {
                idToken = accessToken.getTokenValue();
            }

            if (idToken == null) {
                idToken = OAuth2Utils.tokenFromParamsOrBearer(ACCESS_TOKEN_PARAM, req);
            }

            if (StringUtils.isBlank(idToken)) {
                LOGGER.debug("No JWT available for fallback principal extraction");
                return null;
            }

            JWTHelper helper = decodeAndValidateJwt(idToken);
            if (helper == null) {
                LOGGER.debug("Unable to decode or validate JWT for fallback principal extraction");
                return null;
            }

            String fromJwt =
                    coalesce(
                            getClaim(helper, configuration.getUniqueUsername()),
                            getClaim(helper, configuration.getPrincipalKey()));

            if (StringUtils.isBlank(fromJwt)) {
                fromJwt =
                        coalesce(
                                getClaim(helper, "upn"),
                                getClaim(helper, "preferred_username"),
                                getClaim(helper, "unique_name"),
                                getClaim(helper, "email"),
                                getClaim(helper, "sub"),
                                getClaim(helper, "oid"));
            }

            if (StringUtils.isNotBlank(fromJwt)) {
                LOGGER.info("Authenticated OAuth request with user (JWT claims) {}", fromJwt);
                return fromJwt;
            }

            LOGGER.debug("No supported principal claim found in JWT fallback");
            return null;
        } catch (Exception e) {
            LOGGER.warn("Unable to resolve principal from JWT fallback", e);
            return null;
        }
    }

    /**
     * Decode and validate a JWT (ID token or access token). Returns null if the token is null or
     * cannot be decoded. (Kept protected for potential subclass use.)
     */
    protected JWTHelper decodeAndValidateJwt(String jwt) {
        if (jwt == null) {
            LOGGER.warn("No JWT provided for decoding.");
            return null;
        }
        try {
            return new JWTHelper(jwt);
        } catch (Exception e) {
            LOGGER.error("Failed to decode or validate JWT", e);
            return null;
        }
    }

    private String getClaim(JWTHelper helper, String key) {
        if (helper == null || StringUtils.isBlank(key)) return null;
        try {
            return helper.getClaim(key, String.class);
        } catch (Exception e) {
            return null;
        }
    }

    public PreAuthenticatedAuthenticationToken createPreAuthentication(
            String username,
            HttpServletRequest request,
            HttpServletResponse response,
            @Nullable OAuth2AccessToken accessToken,
            @Nullable OAuth2RefreshToken refreshToken) {

        if (StringUtils.isBlank(username)) {
            LOGGER.error("Cannot create authentication: empty username");
            return null;
        }

        LOGGER.info("Retrieving user with authorities for username: {}", username);
        User user = retrieveUserWithAuthorities(username);
        if (user == null) {
            LOGGER.error("User retrieval failed for username: {}", username);
            return null;
        }

        user.setTrusted(true);

        String idToken = OAuth2Utils.getIdToken();
        String accessTokenValue = accessToken != null ? accessToken.getTokenValue() : null;
        String tokenForClaims = StringUtils.isNotBlank(idToken) ? idToken : accessTokenValue;

        LOGGER.info(
                "Token selection for claims: idToken={}, accessToken={}, using={}",
                StringUtils.isNotBlank(idToken) ? "present" : "null",
                StringUtils.isNotBlank(accessTokenValue) ? "present" : "null",
                tokenForClaims != null
                        ? (tokenForClaims.equals(idToken) ? "ID_TOKEN" : "ACCESS_TOKEN")
                        : "NONE");

        if (StringUtils.isNotBlank(tokenForClaims)
                && (StringUtils.isNotBlank(configuration.getGroupsClaim())
                        || StringUtils.isNotBlank(configuration.getRolesClaim()))) {

            @SuppressWarnings("unchecked")
            Map<String, Object> tokenAttributes =
                    (Map<String, Object>) request.getAttribute(OAUTH2_ACCESS_TOKEN_CHECK_KEY);

            addAuthoritiesFromToken(user, tokenForClaims, accessTokenValue, tokenAttributes);
        }

        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole());

        PreAuthenticatedAuthenticationToken authenticationToken =
                new PreAuthenticatedAuthenticationToken(
                        user, null, Collections.singletonList(authority));

        authenticationToken.setDetails(
                new TokenDetails(accessToken, idToken, configuration.getBeanName(), refreshToken));

        return authenticationToken;
    }

    protected User retrieveUserWithAuthorities(String username) {
        User user = null;
        if (StringUtils.isNotBlank(username) && userService != null) {
            try {
                user = userService.get(username);
                LOGGER.info(
                        "Found existing user '{}' in DB: id={}, role={}",
                        username,
                        user.getId(),
                        user.getRole());
            } catch (NotFoundServiceEx notFoundServiceEx) {
                LOGGER.info("User '{}' not found in DB, will attempt creation.", username);
            }
        }
        if (user == null) {
            try {
                user = createUser(username, "");
            } catch (BadRequestServiceEx | NotFoundServiceEx e) {
                LOGGER.error("Error while auto-creating the user: '{}'", username, e);
            }
        }
        return user;
    }

    protected User createUser(String userName, String credentials)
            throws BadRequestServiceEx, NotFoundServiceEx {
        User user = new User();
        user.setName(userName);
        user.setNewPassword(credentials != null ? credentials : "");
        user.setEnabled(true);
        UserAttribute userAttribute = new UserAttribute();
        userAttribute.setName(OAuth2Configuration.CONFIGURATION_NAME);
        userAttribute.setValue(configuration.getBeanName());
        user.setAttribute(Collections.singletonList(userAttribute));
        Set<UserGroup> groups = new HashSet<>();
        user.setGroups(groups);
        user.setRole(Role.USER);
        LOGGER.info(
                "createUser called for '{}': autoCreateUser={}, userService={}",
                userName,
                configuration.isAutoCreateUser(),
                userService != null ? "available" : "null");
        if (userService != null && configuration.isAutoCreateUser()) {
            long id = userService.insert(user);
            user = new User(user);
            user.setId(id);
            LOGGER.info("Persisted OIDC user '{}' with id {}", userName, id);
        } else if (userService == null) {
            LOGGER.warn("Cannot persist user '{}': userService is null", userName);
        } else {
            LOGGER.warn(
                    "User '{}' will NOT be persisted (autoCreateUser=false). "
                            + "Group assignments and role sync will not work.",
                    userName);
        }
        return user;
    }

    /**
     * Add authorities from token claims with optional access token and userinfo fallback. Tries the
     * primary token (usually ID token) first; if a claim is not found, falls back to the access
     * token (which in Keycloak contains realm_access, resource_access, groups, etc.), and finally
     * to the userinfo map.
     */
    @SuppressWarnings("unchecked")
    protected void addAuthoritiesFromToken(
            User user,
            String tokenString,
            String accessTokenString,
            Map<String, Object> userinfoMap) {
        LOGGER.info(
                "Syncing authorities from token claims for user '{}' (id={}, currentRole={}).",
                user.getName(),
                user.getId(),
                user.getRole());

        JWTHelper primaryHelper = null;
        try {
            primaryHelper = new JWTHelper(tokenString);
        } catch (Exception e) {
            LOGGER.warn("Primary token is not a valid JWT; will try fallbacks.", e);
        }

        // Build a separate helper for the access token (if different from the primary).
        // In Keycloak, claims like realm_access, resource_access, and groups are typically
        // only present in the access token, not in the ID token.
        JWTHelper accessHelper = buildAccessTokenHelper(tokenString, accessTokenString);

        // ----- Roles -----
        syncRoleFromClaims(user, primaryHelper, accessHelper, userinfoMap);

        // ----- Groups -----
        syncGroupsFromClaims(user, primaryHelper, accessHelper, userinfoMap);

        // ----- Persist user after role & group sync -----
        persistSynchronizedUser(user);
    }

    protected JWTHelper buildAccessTokenHelper(String tokenString, String accessTokenString) {
        if (accessTokenString == null || accessTokenString.equals(tokenString)) {
            return null;
        }

        try {
            JWTHelper accessHelper = new JWTHelper(accessTokenString);
            LOGGER.info("Access token available as fallback for claim resolution.");
            return accessHelper;
        } catch (Exception e) {
            LOGGER.warn("Access token is not a valid JWT; skipping as fallback.", e);
            return null;
        }
    }

    protected void syncRoleFromClaims(
            User user,
            JWTHelper primaryHelper,
            JWTHelper accessHelper,
            Map<String, Object> userinfoMap) {

        Role currentRole = user.getRole();
        String rolesClaimName = configuration.getRolesClaim();
        Object rawRoles = null;

        if (StringUtils.isNotBlank(rolesClaimName)) {
            rawRoles =
                    resolveClaimWithFallback(
                            primaryHelper, accessHelper, userinfoMap, rolesClaimName);
        } else {
            LOGGER.info("No rolesClaim configured.");
        }

        if (rawRoles != null) {
            List<String> oidcRoles = ClaimPathResolver.toStringList(rawRoles);
            if (oidcRoles == null) {
                oidcRoles = Collections.emptyList();
            }
            LOGGER.info(
                    "Resolved role strings from token: {} (roleMappings={})",
                    oidcRoles,
                    configuration.getRoleMappings());
            Role defaultRole = configuration.getAuthenticatedDefaultRole();
            Role newRole = computeRole(oidcRoles, defaultRole);
            user.setRole(newRole);
            LOGGER.info("User role set from token. {} -> {}", currentRole, newRole);
        } else if (StringUtils.isNotBlank(rolesClaimName)) {
            // rolesClaim is configured but missing from the token — the IdP is the
            // source of truth.  Fall back to authenticatedDefaultRole (USER by default)
            // instead of preserving whatever is in the database.
            Role defaultRole =
                    configuration.getAuthenticatedDefaultRole() != null
                            ? configuration.getAuthenticatedDefaultRole()
                            : Role.USER;
            user.setRole(defaultRole);
            LOGGER.info(
                    "Roles claim '{}' missing in token and userinfo -> "
                            + "falling back to authenticatedDefaultRole: {} (was: {})",
                    rolesClaimName,
                    defaultRole,
                    currentRole);
        } else {
            LOGGER.info("No rolesClaim configured -> preserving current role: {}", currentRole);
        }
    }

    protected Object resolveClaimWithFallback(
            JWTHelper primaryHelper,
            JWTHelper accessHelper,
            Map<String, Object> userinfoMap,
            String claimName) {

        Object value = null;

        // 1) Try primary token (usually ID token)
        if (primaryHelper != null) {
            value = primaryHelper.getClaim(claimName, Object.class);
            LOGGER.info(
                    "Roles claim '{}' from primary token: {} (type={})",
                    claimName,
                    value,
                    value != null ? value.getClass().getSimpleName() : "null");
        }

        // 2) Fallback: access token (Keycloak puts realm_access here)
        if (value == null && accessHelper != null) {
            value = accessHelper.getClaim(claimName, Object.class);
            LOGGER.info(
                    "Roles claim '{}' from access token (fallback): {} (type={})",
                    claimName,
                    value,
                    value != null ? value.getClass().getSimpleName() : "null");
        }

        // 3) Fallback: userinfo map
        if (value == null && userinfoMap != null) {
            value = ClaimPathResolver.resolveIgnoreCase(userinfoMap, claimName);
            LOGGER.info(
                    "Roles claim '{}' from userinfo: {} (type={})",
                    claimName,
                    value,
                    value != null ? value.getClass().getSimpleName() : "null");
        }

        return value;
    }

    private Role computeRole(List<String> rolesFromToken, Role defaultRole) {
        LOGGER.info(
                "computeRole: rolesFromToken={}, defaultRole={}, roleMappings={}, dropUnmapped={}",
                rolesFromToken,
                defaultRole,
                configuration.getRoleMappings(),
                configuration.isDropUnmapped());
        if (rolesFromToken == null || rolesFromToken.isEmpty()) {
            Role result = (defaultRole != null) ? defaultRole : Role.USER;
            LOGGER.info("computeRole: no roles in token -> returning {}", result);
            return result;
        }
        Map<String, String> roleMappings = configuration.getRoleMappings();
        boolean dropUnmapped = configuration.isDropUnmapped();
        Role resolved = (defaultRole != null) ? defaultRole : Role.USER;
        for (String r : rolesFromToken) {
            if (r == null) continue;
            String rr = r.trim();
            boolean wasMapped = false;
            if (roleMappings != null) {
                String mapped = roleMappings.get(rr.toUpperCase(Locale.ROOT));
                if (mapped != null) {
                    LOGGER.info("computeRole: '{}' mapped to '{}' via roleMappings", rr, mapped);
                    rr = mapped;
                    wasMapped = true;
                } else if (dropUnmapped) {
                    LOGGER.info(
                            "computeRole: '{}' not in roleMappings, dropping (dropUnmapped)", rr);
                    continue;
                } else {
                    LOGGER.info(
                            "computeRole: '{}' not in roleMappings, keeping (dropUnmapped=false)",
                            rr);
                }
            }
            // Only compare against GeoStore role names if the value was explicitly mapped
            // or if there are no roleMappings configured.  Unmapped IdP role names
            // (e.g. "guest", "admin") should not accidentally match GeoStore roles.
            if (wasMapped || roleMappings == null || roleMappings.isEmpty()) {
                if (rr.equalsIgnoreCase(Role.ADMIN.name())) {
                    LOGGER.info("computeRole: '{}' matches ADMIN -> returning ADMIN", rr);
                    return Role.ADMIN;
                }
                if (rr.equalsIgnoreCase(Role.USER.name())) {
                    LOGGER.info("computeRole: '{}' matches USER", rr);
                    resolved = Role.USER;
                    continue;
                }
                if (rr.equalsIgnoreCase(Role.GUEST.name())) {
                    LOGGER.info("computeRole: '{}' matches GUEST", rr);
                    resolved = Role.GUEST;
                }
            }
        }
        LOGGER.info("computeRole: final resolved role = {}", resolved);
        return resolved;
    }

    protected void syncGroupsFromClaims(
            User user,
            JWTHelper primaryHelper,
            JWTHelper accessHelper,
            Map<String, Object> userinfoMap) {

        List<String> oidcGroups = Collections.emptyList();
        String groupsClaimName = configuration.getGroupsClaim();

        if (groupsClaimName != null) {
            LOGGER.info("Resolving groups from claim '{}'", groupsClaimName);

            List<String> fromClaims =
                    resolveStringListClaimWithFallback(
                            primaryHelper, accessHelper, userinfoMap, groupsClaimName);

            if (fromClaims != null && !fromClaims.isEmpty()) {
                oidcGroups = fromClaims;
            }

            LOGGER.info("Groups resolved from token/userinfo: {}", oidcGroups);
        } else {
            LOGGER.info("No groupsClaim configured -> skipping group sync.");
        }

        finalizeGroupSync(user, oidcGroups);
    }

    /**
     * Applies group mappings and the always-assigned {@code defaultGroups}, then reconciles the
     * resulting remote groups onto the user. Shared by the claim-based group sync and by subclasses
     * that resolve the authoritative group list from another source (e.g. MS Graph).
     */
    protected void finalizeGroupSync(User user, List<String> oidcGroups) {
        oidcGroups = applyGroupMappings(oidcGroups);

        // Always-assigned default groups: appended to the resolved ones, not subject to
        // groupMappings/dropUnmapped. They flow through the normal reconciliation, so they are
        // created on the fly when missing, tagged with this provider as sourceService, and
        // assigned through the user-group service like any claim-derived group.
        List<String> defaultGroups = configuration.getDefaultGroups();
        if (defaultGroups != null && !defaultGroups.isEmpty()) {
            List<String> withDefaults = new ArrayList<>(oidcGroups);
            for (String defaultGroup : defaultGroups) {
                if (!withDefaults.contains(defaultGroup)) {
                    withDefaults.add(defaultGroup);
                }
            }
            oidcGroups = withDefaults;
            LOGGER.info(
                    "Adding configured defaultGroups {} to the groups to assign.", defaultGroups);
        }

        LOGGER.info(
                "Final groups to reconcile: {} (user.role={}, user.id={})",
                oidcGroups,
                user.getRole(),
                user.getId());
        reconcileRemoteGroups(user, new LinkedHashSet<>(oidcGroups));
    }

    protected List<String> resolveStringListClaimWithFallback(
            JWTHelper primaryHelper,
            JWTHelper accessHelper,
            Map<String, Object> userinfoMap,
            String claimName) {

        List<String> values = null;

        // 1) Try primary token
        if (primaryHelper != null) {
            values = primaryHelper.getClaimAsList(claimName, String.class);
            LOGGER.info("Groups from primary token claim '{}': {}", claimName, values);
        }

        // 2) Fallback: access token
        if ((values == null || values.isEmpty()) && accessHelper != null) {
            values = accessHelper.getClaimAsList(claimName, String.class);
            LOGGER.info("Groups from access token claim '{}' (fallback): {}", claimName, values);
        }

        if (values != null && !values.isEmpty()) {
            return values;
        }

        // 3) Fallback: userinfo map
        if (userinfoMap != null) {
            List<String> fromUserinfo =
                    ClaimPathResolver.resolveAsListIgnoreCase(userinfoMap, claimName);
            LOGGER.info("Groups from userinfo claim '{}': {}", claimName, fromUserinfo);
            if (fromUserinfo != null) {
                return fromUserinfo;
            }
        }

        return values;
    }

    protected List<String> applyGroupMappings(List<String> oidcGroups) {
        Map<String, String> groupMappings = configuration.getGroupMappings();
        boolean dropUnmapped = configuration.isDropUnmapped();

        if (groupMappings != null && !oidcGroups.isEmpty()) {
            List<String> mapped = new ArrayList<>();
            for (String g : oidcGroups) {
                if (g == null) {
                    continue;
                }
                String m = groupMappings.get(g.toUpperCase(Locale.ROOT));
                if (m != null) {
                    mapped.add(m);
                    LOGGER.info("Group '{}' mapped to '{}'", g, m);
                } else if (!dropUnmapped) {
                    mapped.add(g);
                } else {
                    LOGGER.info("Group '{}' dropped (unmapped, dropUnmapped=true)", g);
                }
            }
            return mapped;
        }

        return oidcGroups;
    }

    private void reconcileRemoteGroups(User user, Set<String> newGroupNamesRaw) {
        final String provider = configuration.getProvider();
        if (StringUtils.isBlank(provider)) {
            LOGGER.warn("Provider name is empty; skipping remote group reconciliation.");
            return;
        }

        LOGGER.info(
                "reconcileRemoteGroups: user='{}' (id={}, role={}), "
                        + "provider='{}', newGroupNames={}, "
                        + "currentGroups={} (type={})",
                user.getName(),
                user.getId(),
                user.getRole(),
                provider,
                newGroupNamesRaw,
                user.getGroups(),
                user.getGroups() != null ? user.getGroups().getClass().getSimpleName() : "null");

        if (user.getGroups() == null) {
            LOGGER.info("User groups is null, initializing empty set.");
            user.setGroups(new LinkedHashSet<>());
        }

        Set<String> newGroupNames =
                newGroupNamesRaw.stream()
                        .filter(Objects::nonNull)
                        .map(this::normalizeGroupName)
                        .collect(Collectors.toCollection(LinkedHashSet::new));

        Set<Long> providerRemoteIds = remoteGroupIdsForCurrentProvider();

        // 1) remove old remote groups for THIS provider that are not in the new set
        Set<UserGroup> toRemove =
                user.getGroups().stream()
                        .filter(
                                g ->
                                        g != null
                                                && g.getId() != null
                                                && providerRemoteIds.contains(g.getId()))
                        .filter(g -> !newGroupNames.contains(normalizeGroupName(g.getGroupName())))
                        .collect(Collectors.toCollection(LinkedHashSet::new));

        for (UserGroup g : toRemove) {
            try {
                userGroupService.deassignUserGroup(user.getId(), g.getId());
                LOGGER.info(
                        "Removed remote group '{}' for provider '{}' from user {}",
                        g.getGroupName(),
                        provider,
                        user.getId());
            } catch (NotFoundServiceEx e) {
                LOGGER.warn(
                        "Deassign failed for group '{}' from user {}: {}",
                        g.getGroupName(),
                        user.getId(),
                        e.getMessage());
            }
        }
        user.getGroups().removeAll(toRemove);

        // 2) ensure each new token group exists, is marked for this provider, and is assigned
        for (String groupName : newGroupNames) {
            UserGroup group = searchGroup(groupName);
            if (group == null) {
                group = createUserGroup(groupName); // sets sourceService=provider
                LOGGER.info("Created remote group '{}' (provider={})", groupName, provider);
            } else {
                updateGroupSourceServiceAttributes(group); // backfill provider tag
            }

            UserGroup finalGroup = group;
            boolean alreadyAssigned =
                    user.getGroups().stream()
                            .anyMatch(
                                    g -> {
                                        if (g == null) return false;
                                        if (finalGroup.getId() != null && g.getId() != null) {
                                            return Objects.equals(g.getId(), finalGroup.getId());
                                        }
                                        return Objects.equals(
                                                normalizeGroupName(g.getGroupName()),
                                                normalizeGroupName(finalGroup.getGroupName()));
                                    });
            if (!alreadyAssigned) {
                if (userGroupService != null && user.getId() != null && group.getId() != null) {
                    try {
                        userGroupService.assignUserGroup(user.getId(), group.getId());
                        LOGGER.info("Assigned user {} to group '{}'", user.getId(), groupName);
                    } catch (NotFoundServiceEx e) {
                        LOGGER.error(
                                "Assignment of user {} to group '{}' failed: {}",
                                user.getId(),
                                groupName,
                                e.getMessage());
                    }
                }
                user.getGroups().add(group);
            }
        }

        Map<String, UserGroup> byName = new LinkedHashMap<>();
        for (UserGroup g : user.getGroups()) {
            byName.put(normalizeGroupName(g.getGroupName()), g);
        }
        user.setGroups(new LinkedHashSet<>(byName.values()));
    }

    private String normalizeGroupName(String name) {
        if (name == null) return null;
        return configuration.isGroupNamesUppercase() ? name.toUpperCase(Locale.ROOT) : name;
    }

    private Set<Long> remoteGroupIdsForCurrentProvider() {
        if (userGroupService == null || configuration == null) return Collections.emptySet();
        final String provider = configuration.getProvider();
        Set<Long> ids = new LinkedHashSet<>();
        try {
            Collection<UserGroup> groups =
                    userGroupService.findByAttribute(
                            SOURCE_SERVICE_USER_GROUP_ATTRIBUTE_NAME,
                            Collections.singletonList(provider),
                            true);
            if (groups != null) {
                for (UserGroup g : groups) {
                    if (g != null && g.getId() != null) ids.add(g.getId());
                }
            }
        } catch (Exception e) {
            LOGGER.warn(
                    "Unable to resolve remote groups for provider '{}': {}",
                    provider,
                    e.getMessage());
        }
        return ids;
    }

    private UserGroup searchGroup(String groupName) {
        if (userGroupService == null) return null;
        if (configuration.isGroupNamesUppercase()) {
            UserGroup ug = userGroupService.get(groupName.toUpperCase());
            if (ug != null) return ug;
        }
        return userGroupService.get(groupName);
    }

    private UserGroup createUserGroup(String groupName) {
        UserGroup group = new UserGroup();
        group.setGroupName(
                configuration.isGroupNamesUppercase() ? groupName.toUpperCase() : groupName);
        group.setAttributes(
                List.of(createUserGroupSourceServiceAttribute(configuration.getProvider())));
        if (userGroupService != null) {
            try {
                long groupId = userGroupService.insert(group);
                group = userGroupService.get(groupId);
                LOGGER.info("inserted group id: {}", group.getGroupName());
            } catch (BadRequestServiceEx e) {
                LOGGER.error("Saving new group found in claims failed");
            }
        }
        return group;
    }

    private UserGroupAttribute createUserGroupSourceServiceAttribute(String remoteService) {
        UserGroupAttribute userGroupAttribute = new UserGroupAttribute();
        userGroupAttribute.setName(SOURCE_SERVICE_USER_GROUP_ATTRIBUTE_NAME);
        userGroupAttribute.setValue(remoteService);
        return userGroupAttribute;
    }

    private void updateGroupSourceServiceAttributes(UserGroup group) {
        if (group == null || group.getId() == null) return;
        try {
            userGroupService.upsertAttribute(
                    group.getId(),
                    SOURCE_SERVICE_USER_GROUP_ATTRIBUTE_NAME,
                    configuration.getProvider());
        } catch (NotFoundServiceEx | BadRequestServiceEx e) {
            LOGGER.warn(
                    "Could not upsert sourceService for group '{}': {}",
                    group.getGroupName(),
                    e.getMessage());
        }
    }

    /** Persist user after role & group sync. */
    protected void persistSynchronizedUser(User user) {
        try {
            if (userService != null) {
                LOGGER.info(
                        "Persisting user '{}' (id={}, role={}, groups={})",
                        user.getName(),
                        user.getId(),
                        user.getRole(),
                        user.getGroups());
                userService.update(user);
            }
        } catch (BadRequestServiceEx | NotFoundServiceEx e) {
            LOGGER.error(
                    "Updating user with synchronized groups found in claims failed: {}",
                    e.getMessage(),
                    e);
        } catch (DataIntegrityViolationException e) {
            LOGGER.error(
                    "Updating user with synchronized groups data integrity violation: {}",
                    e.getMessage(),
                    e);
        } catch (RuntimeException e) {
            LOGGER.error(
                    "Unexpected error persisting user '{}' with groups: {}",
                    user.getName(),
                    e.getMessage(),
                    e);
        } finally {
            LOGGER.info(
                    "User '{}' after sync: role={}, groups={}",
                    user.getName(),
                    user.getRole(),
                    user.getGroups());
        }
    }

    /**
     * Re-reads the user's current role from the database and, if it has changed since the
     * authentication was cached, rebuilds the authentication with the updated authority. This
     * ensures that role changes (promotions/demotions via admin UI or DB) take effect immediately
     * without waiting for token expiry or cache eviction.
     */
    private Authentication refreshCachedUserRole(Authentication authentication, String token) {
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof User)) {
            return authentication;
        }
        User cachedUser = (User) principal;
        String username = cachedUser.getName();
        if (username == null || userService == null) {
            return authentication;
        }
        try {
            User dbUser = userService.get(username);
            if (dbUser != null && dbUser.getRole() != cachedUser.getRole()) {
                LOGGER.info(
                        "Role changed in DB for user '{}': {} -> {}. Updating cached authentication.",
                        username,
                        cachedUser.getRole(),
                        dbUser.getRole());
                cachedUser.setRole(dbUser.getRole());
                SimpleGrantedAuthority authority =
                        new SimpleGrantedAuthority("ROLE_" + dbUser.getRole().toString());
                PreAuthenticatedAuthenticationToken updated =
                        new PreAuthenticatedAuthenticationToken(
                                cachedUser,
                                authentication.getCredentials(),
                                Collections.singletonList(authority));
                updated.setDetails(authentication.getDetails());
                cache.putCacheEntry(token, updated);
                return updated;
            }
        } catch (NotFoundServiceEx e) {
            LOGGER.debug("User '{}' not found in DB during role refresh.", username);
        }
        return authentication;
    }

    public Authentication completeInteractiveAuthentication(
            HttpServletRequest request,
            HttpServletResponse response,
            OAuth2AccessToken accessToken,
            OAuth2RefreshToken refreshToken) {
        String token = accessToken != null ? accessToken.getTokenValue() : null;
        return authenticateAndUpdateCache(request, response, token, accessToken, refreshToken);
    }
}
