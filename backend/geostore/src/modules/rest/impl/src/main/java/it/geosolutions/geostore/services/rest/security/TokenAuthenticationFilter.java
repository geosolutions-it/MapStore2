/* ====================================================================
 *
 * Copyright (C) 2015 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.services.rest.security;

import com.google.common.base.Optional;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;

import jakarta.servlet.http.HttpServletRequest;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

/**
 * Base Token based authentication filter.
 *
 * <p>Authenticates a user reading an authentication token from a configured header (defaults to
 * Authorization).
 *
 * <p>The token can have a prefix that needs to be present in the header value (defaults to Bearer,
 * to be compatible with OAuth 2.0 tokens).
 *
 * <p>Each implementation can verify the validity of a token (and the user bounded to it) using a
 * different methodology.
 *
 * <p>A cache is internally used to avoid continuous token testing.
 *
 * <p>Cache expiration time and size can be configured.
 *
 * @author Mauro Bartolomeoli
 */
public abstract class TokenAuthenticationFilter extends GeoStoreAuthenticationFilter {

    private static final Logger LOGGER = LogManager.getLogger(TokenAuthenticationFilter.class);

    protected LoadingCache<String, Optional<Authentication>> cache;

    private String tokenHeader = "Authorization";
    private String tokenPrefix = "Bearer ";

    private int cacheSize = 1000;
    private int cacheExpiration = 60;

    /**
     * Header to check for token (defaults to Authorization).
     *
     * @param tokenHeader
     */
    public void setTokenHeader(String tokenHeader) {
        this.tokenHeader = tokenHeader;
    }

    /**
     * Static prefix to look for in the header value. Only if the prefix is found, the rest of the
     * header is checked as a Token.
     *
     * <p>Defaults to Bearer (OAuth 2.0 compatible).
     *
     * @param tokenPrefix
     */
    public void setTokenPrefix(String tokenPrefix) {
        this.tokenPrefix = tokenPrefix;
    }

    /**
     * Max number of cached entries (defaults to 1000).
     *
     * @param cacheSize
     */
    public void setCacheSize(int cacheSize) {
        this.cacheSize = cacheSize;
    }

    /**
     * Cached entries expiration time, in seconds (defaults to 60s).
     *
     * @param cacheExpiration
     */
    public void setCacheExpiration(int cacheExpiration) {
        this.cacheExpiration = cacheExpiration;
    }

    protected LoadingCache<String, Optional<Authentication>> getCache() {
        if (cache == null) {

            cache =
                    CacheBuilder.newBuilder()
                            .maximumSize(cacheSize)
                            .refreshAfterWrite(cacheExpiration, TimeUnit.SECONDS)
                            .build(
                                    new CacheLoader<String, Optional<Authentication>>() {
                                        public Optional<Authentication> load(String token) {
                                            return Optional.fromNullable(checkToken(token));
                                        }
                                    });
        }
        return cache;
    }

    public void setCache(LoadingCache<String, Optional<Authentication>> cache) {
        this.cache = cache;
    }

    protected void authenticate(HttpServletRequest req) {
        String authHeader = req.getHeader(tokenHeader);

        if (authHeader != null
                && authHeader.trim().toUpperCase().startsWith(tokenPrefix.toUpperCase())) {
            String token = authHeader.substring(tokenPrefix.length()).trim();
            Authentication auth;
            try {
                auth = getCache().get(token).orNull();
                if (auth != null) {
                    LOGGER.info("User authenticated using token: " + auth.getName());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (ExecutionException e) {
                LOGGER.error("Error authenticating token", e);
            }
        }
    }

    /**
     * Phisically checks the validity of the given token and returns an Authentication object for
     * the corresponding principal.
     *
     * @param token
     * @return
     */
    protected abstract Authentication checkToken(String token);
}
