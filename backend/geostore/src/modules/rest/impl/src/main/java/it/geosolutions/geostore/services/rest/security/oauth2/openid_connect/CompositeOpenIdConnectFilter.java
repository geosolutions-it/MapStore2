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

import static it.geosolutions.geostore.services.rest.security.oauth2.OAuth2Configuration.CONFIG_NAME_SUFFIX;
import static it.geosolutions.geostore.services.rest.security.oauth2.OAuth2Utils.ACCESS_TOKEN_PARAM;

import it.geosolutions.geostore.services.UserGroupService;
import it.geosolutions.geostore.services.UserService;
import it.geosolutions.geostore.services.rest.IdPLoginRest;
import it.geosolutions.geostore.services.rest.RESTSessionService;
import it.geosolutions.geostore.services.rest.security.TokenAuthenticationCache;
import it.geosolutions.geostore.services.rest.security.oauth2.OAuth2Utils;
import it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.bearer.AudienceAccessTokenValidator;
import it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.bearer.JwksRsaKeyProvider;
import it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.bearer.MultiTokenValidator;
import it.geosolutions.geostore.services.rest.security.oauth2.openid_connect.bearer.SubjectTokenValidator;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.GenericFilterBean;

import java.io.IOException;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Composite filter that routes requests to per-provider {@link OpenIdConnectFilter} instances.
 *
 * <p>On startup ({@link #afterPropertiesSet()}), discovers all {@link OpenIdConnectConfiguration}
 * beans and creates per-provider filters, authentication services, rest clients, validators, and
 * caches programmatically.
 *
 * <p>Request routing:
 *
 * <ul>
 *   <li><b>Already authenticated:</b> skip, chain through
 *   <li><b>Callback URL:</b> route to the matching provider's filter
 *   <li><b>Bearer token:</b> iterate all enabled providers; first success wins
 *   <li><b>No match:</b> chain through to other auth mechanisms
 * </ul>
 */
public class CompositeOpenIdConnectFilter extends GenericFilterBean
        implements ApplicationContextAware {

    private static final Logger LOGGER = LogManager.getLogger(CompositeOpenIdConnectFilter.class);

    private static final Pattern CALLBACK_PATTERN = Pattern.compile("/openid/([^/]+)/callback");
    private static final Pattern LOGIN_PATTERN = Pattern.compile("/openid/([^/]+)/login");

    private ApplicationContext applicationContext;
    private final Map<String, OpenIdConnectFilter> providerFilters = new LinkedHashMap<>();

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }

    @Override
    public void afterPropertiesSet() throws ServletException {
        super.afterPropertiesSet();
        if (applicationContext == null) {
            LOGGER.warn(
                    "ApplicationContext not available; no provider filters will be initialized");
            return;
        }

        UserService userService = lookupOptional("userService", UserService.class);
        UserGroupService userGroupService =
                lookupOptional("userGroupService", UserGroupService.class);

        Map<String, OpenIdConnectConfiguration> configs =
                applicationContext.getBeansOfType(OpenIdConnectConfiguration.class);

        // Single, shared token authentication cache
        TokenAuthenticationCache sharedCache = null;

        for (Map.Entry<String, OpenIdConnectConfiguration> entry : configs.entrySet()) {
            OpenIdConnectConfiguration config = entry.getValue();
            String beanName = entry.getKey();

            // Derive provider name from bean name (e.g. "oidcOAuth2Config" -> "oidc")
            String providerName = beanName.replace(CONFIG_NAME_SUFFIX, "");

            if (!config.isEnabled()) {
                LOGGER.info(
                        "Provider '{}' is disabled (bean={}); skipping filter creation",
                        providerName,
                        beanName);
                continue;
            }

            LOGGER.info(
                    "Initializing OpenID Connect filter for provider '{}' (bean={})",
                    providerName,
                    beanName);

            // Per-provider OAuth2 HTTP client (authorization-code exchange + refresh).
            OpenIdConnectRestClient restClient = new OpenIdConnectRestClient(config);

            // The authentication cache is wired with the ApplicationContext so
            // token-revoke on eviction can resolve the provider configuration bean.
            if (sharedCache == null) {
                sharedCache =
                        new TokenAuthenticationCache(
                                config.getCacheSize(), config.getCacheExpirationMinutes());
                sharedCache.setApplicationContext(applicationContext);
            }
            TokenAuthenticationCache cache = sharedCache;

            JwksRsaKeyProvider jwksKeyProvider = null;
            String jwksUri = config.getIdTokenUri();
            if (jwksUri == null || jwksUri.isEmpty()) {
                jwksUri = config.getJwkURI();
            }
            if (jwksUri != null && !jwksUri.isEmpty()) {
                jwksKeyProvider = new JwksRsaKeyProvider(jwksUri, config);
            }

            MultiTokenValidator validator =
                    new MultiTokenValidator(
                            Arrays.asList(
                                    new AudienceAccessTokenValidator(),
                                    new SubjectTokenValidator()));

            OpenIdConnectAuthenticationService service =
                    new OpenIdConnectAuthenticationService(
                            cache,
                            userService,
                            userGroupService,
                            config,
                            validator,
                            jwksKeyProvider);

            OpenIdConnectFilter filter = new OpenIdConnectFilter(config, service, restClient);

            LOGGER.info(
                    "Provider '{}' config after discovery: authorizationUri={}, accessTokenUri={}, "
                            + "discoveryUrl={}, clientId={}, redirectUri={}, scopes={}, "
                            + "isInvalid={}",
                    providerName,
                    config.getAuthorizationUri(),
                    config.getAccessTokenUri(),
                    config.getDiscoveryUrl(),
                    config.getClientId(),
                    config.getRedirectUri(),
                    config.getScopes(),
                    config.isInvalid());

            if (config.isInvalid()) {
                LOGGER.error(
                        "Provider '{}' configuration is INVALID after discovery. "
                                + "This provider will not work correctly. "
                                + "Ensure discoveryUrl is reachable or set endpoints manually.",
                        providerName);
            }

            // Validate that redirectUri contains the correct provider name in the path.
            String redirectUri = config.getRedirectUri();
            if (redirectUri != null) {
                String expectedPathSegment = "/openid/" + providerName + "/callback";
                if (!redirectUri.contains(expectedPathSegment)) {
                    LOGGER.warn(
                            "Provider '{}' has redirectUri='{}' which does not contain '{}'. "
                                    + "The callback URL path must include the provider name so "
                                    + "the correct configuration is used. "
                                    + "Expected pattern: .../openid/{}/callback",
                            providerName,
                            redirectUri,
                            expectedPathSegment,
                            providerName);
                }
            }

            providerFilters.put(providerName, filter);
            LOGGER.info("Provider '{}' filter initialized successfully", providerName);

            // Register the programmatically-created rest client and cache as Spring beans so that
            // session service delegates (which look up beans by name) can find them.
            registerSingletonBean(
                    providerName + "OpenIdRestTemplate", restClient, "OpenIdConnectRestClient");
            registerSingletonBean("oAuth2Cache", cache, "TokenAuthenticationCache");

            // Register per-provider session delegate and login service for non-default providers.
            // The default "oidc" provider's delegate and login service are defined in
            // applicationContext.xml.
            if (!"oidc".equals(providerName)) {
                registerPerProviderServices(providerName);
            }
        }

        if (providerFilters.isEmpty()) {
            LOGGER.info("No enabled OpenID Connect providers found");
        } else {
            LOGGER.info(
                    "Composite filter initialized with {} provider(s): {}",
                    providerFilters.size(),
                    providerFilters.keySet());
        }
    }

    private <T> T lookupOptional(String beanName, Class<T> type) {
        try {
            return applicationContext.getBean(beanName, type);
        } catch (Exception e) {
            LOGGER.warn(
                    "{} bean not found; related functionality will be limited: {}",
                    beanName,
                    e.getMessage());
            return null;
        }
    }

    private void registerPerProviderServices(String providerName) {
        try {
            RESTSessionService restSessionService =
                    applicationContext.getBean("restSessionService", RESTSessionService.class);
            UserService userService = applicationContext.getBean("userService", UserService.class);
            new OpenIdConnectSessionServiceDelegate(restSessionService, userService, providerName);
            LOGGER.info("Registered session delegate for provider '{}'", providerName);
        } catch (Exception e) {
            LOGGER.warn(
                    "Could not register session delegate for provider '{}': {}",
                    providerName,
                    e.getMessage());
        }

        try {
            IdPLoginRest idpLoginRest =
                    applicationContext.getBean("idpLoginRest", IdPLoginRest.class);
            new OpenIdConnectLoginService(idpLoginRest, providerName);
            LOGGER.info("Registered login service for provider '{}'", providerName);
        } catch (Exception e) {
            LOGGER.warn(
                    "Could not register login service for provider '{}': {}",
                    providerName,
                    e.getMessage());
        }
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;

        // Already authenticated -> skip
        Authentication existingAuth = SecurityContextHolder.getContext().getAuthentication();
        if (existingAuth != null) {
            chain.doFilter(req, res);
            return;
        }

        // No providers configured -> skip
        if (providerFilters.isEmpty()) {
            chain.doFilter(req, res);
            return;
        }

        String uri = request.getRequestURI();

        // Callback URL: /openid/{provider}/callback
        Matcher callbackMatcher = CALLBACK_PATTERN.matcher(uri);
        if (callbackMatcher.find()) {
            String provider = callbackMatcher.group(1);
            OpenIdConnectFilter filter = providerFilters.get(provider);
            if (filter != null) {
                LOGGER.debug("Routing callback to provider '{}'", provider);
                filter.doFilter(req, res, chain);
                return;
            }
            LOGGER.warn("Callback for unknown provider '{}'; passing through", provider);
            chain.doFilter(req, res);
            return;
        }

        // Login URL: /openid/{provider}/login
        Matcher loginMatcher = LOGIN_PATTERN.matcher(uri);
        if (loginMatcher.find()) {
            String provider = loginMatcher.group(1);
            OpenIdConnectFilter filter = providerFilters.get(provider);
            if (filter != null) {
                LOGGER.debug("Routing login to provider '{}'", provider);
                filter.doFilter(req, res, chain);
                return;
            }
            LOGGER.warn("Login for unknown provider '{}'; passing through", provider);
            chain.doFilter(req, res);
            return;
        }

        // Bearer token: try each enabled provider. Use a no-op chain for each attempt because each
        // provider's filter always calls chain.doFilter() internally; call the real chain once.
        String bearerToken = OAuth2Utils.tokenFromParamsOrBearer(ACCESS_TOKEN_PARAM, request);
        if (bearerToken != null) {
            FilterChain noOpChain = (r, s) -> {};
            for (Map.Entry<String, OpenIdConnectFilter> entry : providerFilters.entrySet()) {
                String providerName = entry.getKey();
                OpenIdConnectFilter filter = entry.getValue();
                LOGGER.debug("Trying bearer token with provider '{}'", providerName);
                try {
                    filter.doFilter(req, res, noOpChain);
                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    if (auth != null) {
                        LOGGER.debug("Bearer token authenticated by provider '{}'", providerName);
                        chain.doFilter(req, res);
                        return;
                    }
                } catch (Exception e) {
                    LOGGER.debug(
                            "Bearer token rejected by provider '{}': {}",
                            providerName,
                            e.getMessage());
                    SecurityContextHolder.clearContext();
                }
            }
            chain.doFilter(req, res);
            return;
        }

        // No bearer token and not a login/callback URL: chain through. The
        // AnonymousAuthenticationFilter (later in the Spring Security chain) sets an anonymous
        // token if needed.
        chain.doFilter(req, res);
    }

    private void registerSingletonBean(String name, Object bean, String label) {
        if (applicationContext instanceof ConfigurableApplicationContext) {
            ConfigurableListableBeanFactory factory =
                    ((ConfigurableApplicationContext) applicationContext).getBeanFactory();
            if (!factory.containsSingleton(name)) {
                factory.registerSingleton(name, bean);
                LOGGER.info("Registered {} bean as '{}'", label, name);
            }
        }
    }

    public Map<String, OpenIdConnectFilter> getProviderFilters() {
        return providerFilters;
    }
}
