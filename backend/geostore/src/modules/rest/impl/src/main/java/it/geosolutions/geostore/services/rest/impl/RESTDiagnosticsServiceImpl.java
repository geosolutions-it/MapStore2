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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import it.geosolutions.geostore.services.rest.RESTDiagnosticsService;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;

import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.core.LoggerContext;
import org.apache.logging.log4j.core.config.Configurator;

import java.time.Instant;
import java.util.Collection;

/** Admin-only diagnostics endpoint for runtime observability. */
public class RESTDiagnosticsServiceImpl extends RESTServiceImpl implements RESTDiagnosticsService {

    private static final Logger LOGGER = LogManager.getLogger(RESTDiagnosticsServiceImpl.class);
    private static final String SECURITY_LOGGER_PREFIX =
            "it.geosolutions.geostore.services.rest.security";
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public Response getFullReport(SecurityContext sc) {
        try {
            ObjectNode root = MAPPER.createObjectNode();
            root.set("logging", buildLoggingNode());
            //                        root.set("cache", buildCacheNode());
            //                        root.set("configuration", buildConfigurationNode());
            root.put("timestamp", Instant.now().toString());
            return Response.ok(MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(root))
                    .type("application/json")
                    .build();
        } catch (Exception e) {
            LOGGER.error("Error building diagnostics report", e);
            return errorResponse(500, "Error building diagnostics report: " + e.getMessage());
        }
    }

    @Override
    public Response getLogging(SecurityContext sc) {
        try {
            ObjectNode root = MAPPER.createObjectNode();
            root.set("logging", buildLoggingNode());
            return Response.ok(MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(root))
                    .type("application/json")
                    .build();
        } catch (Exception e) {
            LOGGER.error("Error building logging report", e);
            return errorResponse(500, "Error building logging report: " + e.getMessage());
        }
    }

    @Override
    public Response setLogLevel(SecurityContext sc, String loggerName, String level) {
        if (!loggerName.startsWith(SECURITY_LOGGER_PREFIX)) {
            return errorResponse(
                    400,
                    "Only loggers under '"
                            + SECURITY_LOGGER_PREFIX
                            + "' can be changed. Got: "
                            + loggerName);
        }

        Level newLevel;
        try {
            newLevel = Level.valueOf(level.toUpperCase());
        } catch (IllegalArgumentException e) {
            return errorResponse(400, "Invalid log level: " + level);
        }

        Logger logger = LogManager.getLogger(loggerName);
        String previousLevel = logger.getLevel() != null ? logger.getLevel().name() : "INHERIT";

        Configurator.setLevel(loggerName, newLevel);

        try {
            ObjectNode result = MAPPER.createObjectNode();
            result.put("logger", loggerName);
            result.put("previousLevel", previousLevel);
            result.put("newLevel", newLevel.name());
            result.put("volatile", true);
            return Response.ok(MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(result))
                    .type("application/json")
                    .build();
        } catch (Exception e) {
            return errorResponse(500, "Level changed but failed to build response");
        }
    }

    @Override
    public Response getCache(SecurityContext sc) {
        //        try {
        //            ObjectNode root = MAPPER.createObjectNode();
        //            root.set("cache", buildCacheNode());
        //            return
        // Response.ok(MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(root))
        //                    .type("application/json")
        //                    .build();
        //        } catch (Exception e) {
        //            LOGGER.error("Error building cache report", e);
        //            return errorResponse(500, "Error building cache report: " + e.getMessage());
        //        }
        return null;
    }

    //    @Override
    public Response getConfiguration(SecurityContext sc) {
        //        try {
        //            ObjectNode root = MAPPER.createObjectNode();
        //            root.set("configuration", buildConfigurationNode());
        //            return
        // Response.ok(MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(root))
        //                    .type("application/json")
        //                    .build();
        //        } catch (Exception e) {
        //            LOGGER.error("Error building configuration report", e);
        //            return errorResponse(500, "Error building configuration report: " +
        // e.getMessage());
        //        }
        return null;
    }

    // ---- Logging ----

    private ObjectNode buildLoggingNode() {
        ObjectNode logging = MAPPER.createObjectNode();
        ArrayNode loggers = MAPPER.createArrayNode();

        Collection<org.apache.logging.log4j.core.Logger> allLoggers =
                ((LoggerContext) LogManager.getContext(false)).getLoggers();
        for (org.apache.logging.log4j.core.Logger logger : allLoggers) {
            if (logger.getName().startsWith(SECURITY_LOGGER_PREFIX)) {
                ObjectNode entry = MAPPER.createObjectNode();
                entry.put("name", logger.getName());
                entry.put(
                        "level", logger.getLevel() != null ? logger.getLevel().name() : "INHERIT");
                loggers.add(entry);
            }
        }

        logging.set("securityLoggers", loggers);
        logging.put(
                "note",
                "Use PUT /diagnostics/logging/{loggerName}/{level} to change. Changes are volatile.");
        return logging;
    }

    // ---- Cache ----

    //    private ObjectNode buildCacheNode() {
    //        ObjectNode cacheNode = MAPPER.createObjectNode();
    //
    //        TokenAuthenticationCache tokenCache =
    // GeoStoreContext.bean(TokenAuthenticationCache.class);
    //        if (tokenCache == null) {
    //            cacheNode.put("status", "unavailable");
    //            return cacheNode;
    //        }
    //
    //        Cache<String, Authentication> cache = tokenCache.getCache();
    //        cacheNode.put("status", "active");
    //        cacheNode.put("size", cache.estimatedSize());
    //
    //        // Cache stats (may not be enabled)
    //        try {
    //            ObjectNode stats = MAPPER.createObjectNode();
    //            stats.put("hitCount", cache.stats().hitCount());
    //            stats.put("missCount", cache.stats().missCount());
    //            stats.put("evictionCount", cache.stats().evictionCount());
    //            cacheNode.set("stats", stats);
    //        } catch (Exception e) {
    //            cacheNode.put("statsNote", "Cache statistics recording is not enabled");
    //        }
    //
    //        ArrayNode entries = MAPPER.createArrayNode();
    //        for (Map.Entry<String, Authentication> entry : cache.asMap().entrySet()) {
    //            ObjectNode entryNode = MAPPER.createObjectNode();
    //            entryNode.put("tokenPrefix", maskToken(entry.getKey()));
    //
    //            Authentication auth = entry.getValue();
    //            entryNode.put("principal", extractPrincipalName(auth));
    //            entryNode.put("role", extractRole(auth));
    //
    //            TokenDetails tokenDetails = getTokenDetails(auth);
    //            if (tokenDetails != null) {
    //                OAuth2AccessToken accessToken = tokenDetails.getAccessToken();
    //                if (accessToken != null && accessToken.getExpiration() != null) {
    //                    Instant expiry = accessToken.getExpiration().toInstant();
    //                    entryNode.put("tokenExpiry", expiry.toString());
    //                    entryNode.put("expired", accessToken.isExpired());
    //                }
    //                entryNode.put(
    //                        "provider",
    //                        tokenDetails.getProvider() != null
    //                                ? tokenDetails.getProvider()
    //                                : "unknown");
    //            }
    //
    //            ArrayNode authorities = MAPPER.createArrayNode();
    //            if (auth.getAuthorities() != null) {
    //                for (GrantedAuthority ga : auth.getAuthorities()) {
    //                    authorities.add(ga.getAuthority());
    //                }
    //            }
    //            entryNode.set("authorities", authorities);
    //
    //            entries.add(entryNode);
    //        }
    //        cacheNode.set("entries", entries);
    //        return cacheNode;
    //    }

    // ---- Configuration ----

    //    private ObjectNode buildConfigurationNode() {
    //        ObjectNode configNode = MAPPER.createObjectNode();
    //        ArrayNode providers = MAPPER.createArrayNode();
    //
    //        Map<String, OAuth2Configuration> configs =
    // GeoStoreContext.beans(OAuth2Configuration.class);
    //        if (configs != null) {
    //            for (Map.Entry<String, OAuth2Configuration> entry : configs.entrySet()) {
    //                OAuth2Configuration config = entry.getValue();
    //                ObjectNode providerNode = MAPPER.createObjectNode();
    //                providerNode.put("beanName", entry.getKey());
    //                providerNode.put("provider", config.getProvider());
    //                providerNode.put("enabled", config.isEnabled());
    //                providerNode.put("clientId", config.getClientId());
    //                providerNode.put("clientSecret", "********");
    //
    //                // Endpoints
    //                ObjectNode endpoints = MAPPER.createObjectNode();
    //                endpoints.put("authorizationUri", nullSafe(config.getAuthorizationUri()));
    //                endpoints.put("accessTokenUri", nullSafe(config.getAccessTokenUri()));
    //                endpoints.put("checkTokenEndpointUrl",
    // nullSafe(config.getCheckTokenEndpointUrl()));
    //                endpoints.put("logoutUri", nullSafe(config.getLogoutUri()));
    //                endpoints.put("revokeEndpoint", nullSafe(config.getRevokeEndpoint()));
    //                endpoints.put("introspectionEndpoint",
    // nullSafe(config.getIntrospectionEndpoint()));
    //                endpoints.put("idTokenUri", nullSafe(config.getIdTokenUri()));
    //                endpoints.put("discoveryUrl", nullSafe(config.getDiscoveryUrl()));
    //                providerNode.set("endpoints", endpoints);
    //
    //                providerNode.put("scopes", nullSafe(config.getScopes()));
    //                providerNode.put("rolesClaim", nullSafe(config.getRolesClaim()));
    //                providerNode.put("groupsClaim", nullSafe(config.getGroupsClaim()));
    //
    //                // Flags
    //                ObjectNode flags = MAPPER.createObjectNode();
    //                flags.put("autoCreateUser", config.isAutoCreateUser());
    //                flags.put("enableRedirectEntryPoint", config.isEnableRedirectEntryPoint());
    //                flags.put("globalLogoutEnabled", config.isGlobalLogoutEnabled());
    //                flags.put("groupNamesUppercase", config.isGroupNamesUppercase());
    //                flags.put("dropUnmapped", config.isDropUnmapped());
    //                providerNode.set("flags", flags);
    //
    //                // OIDC-specific fields
    //                if (config instanceof OpenIdConnectConfiguration) {
    //                    OpenIdConnectConfiguration oidc = (OpenIdConnectConfiguration) config;
    //                    ObjectNode oidcNode = MAPPER.createObjectNode();
    //                    oidcNode.put("allowBearerTokens", oidc.isAllowBearerTokens());
    //                    oidcNode.put("bearerTokenStrategy",
    // nullSafe(oidc.getBearerTokenStrategy()));
    //                    oidcNode.put("jwkURI", nullSafe(oidc.getJwkURI()));
    //                    oidcNode.put("usePKCE", oidc.isUsePKCE());
    //                    oidcNode.put("sendClientSecret", oidc.isSendClientSecret());
    //                    oidcNode.put("maxTokenAgeSecs", oidc.getMaxTokenAgeSecs());
    //                    oidcNode.put(
    //                            "postLogoutRedirectUri",
    // nullSafe(oidc.getPostLogoutRedirectUri()));
    //                    oidcNode.put("accessType", nullSafe(oidc.getAccessType()));
    //                    providerNode.set("oidc", oidcNode);
    //                }
    //
    //                providers.add(providerNode);
    //            }
    //        }
    //        configNode.set("providers", providers);
    //        return configNode;
    //    }

    // ---- Helpers ----

    //    private static String maskToken(String token) {
    //        if (token == null) return "null";
    //        if (token.length() <= 8) return "***";
    //        return token.substring(0, 8) + "...";
    //    }
    //
    //    private static String extractPrincipalName(Authentication auth) {
    //        if (auth == null || auth.getPrincipal() == null) return "unknown";
    //        Object principal = auth.getPrincipal();
    //        if (principal instanceof User) {
    //            return ((User) principal).getName();
    //        }
    //        return principal.toString();
    //    }
    //
    //    private static String extractRole(Authentication auth) {
    //        if (auth == null || auth.getPrincipal() == null) return "unknown";
    //        Object principal = auth.getPrincipal();
    //        if (principal instanceof User) {
    //            User user = (User) principal;
    //            return user.getRole() != null ? user.getRole().name() : "unknown";
    //        }
    //        return "unknown";
    //    }

    //    private static TokenDetails getTokenDetails(Authentication auth) {
    //        if (auth != null && auth.getDetails() instanceof TokenDetails) {
    //            return (TokenDetails) auth.getDetails();
    //        }
    //        return null;
    //    }

    //    private static String nullSafe(String value) {
    //        return value != null ? value : "";
    //    }

    private static Response errorResponse(int status, String message) {
        try {
            ObjectNode error = MAPPER.createObjectNode();
            error.put("error", message);
            return Response.status(status)
                    .entity(MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(error))
                    .type("application/json")
                    .build();
        } catch (Exception e) {
            return Response.status(status).entity("{\"error\":\"" + message + "\"}").build();
        }
    }
}
