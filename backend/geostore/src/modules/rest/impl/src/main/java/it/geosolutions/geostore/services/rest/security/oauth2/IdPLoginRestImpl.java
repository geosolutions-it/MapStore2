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

import it.geosolutions.geostore.services.rest.IdPLoginRest;
import it.geosolutions.geostore.services.rest.IdPLoginService;
import it.geosolutions.geostore.services.rest.exception.NotFoundWebEx;
import it.geosolutions.geostore.services.rest.model.SessionToken;
import it.geosolutions.geostore.services.rest.security.RestAuthenticationEntryPoint;
import it.geosolutions.geostore.services.rest.utils.GeoStoreContext;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.ws.rs.core.Response;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** This class provides authentication entry point to login using an OAuth2 provider. */
public class IdPLoginRestImpl implements IdPLoginRest {

    private static final Logger LOGGER = LogManager.getLogger(IdPLoginRestImpl.class);

    private final Map<String, IdPLoginService> services = new HashMap<>();

    @Override
    public void login(String provider) {
        LOGGER.info(
                "Login requested for provider '{}'. Registered providers: {}",
                provider,
                services.keySet());
        HttpServletRequest request = OAuth2Utils.getRequest();
        HttpServletResponse resp = OAuth2Utils.getResponse();
        IdPLoginService service = services.get(provider);
        if (service == null) {
            LOGGER.error(
                    "No login service registered for provider '{}'. "
                            + "Available providers: {}. "
                            + "Check that the provider is listed in oidc_providers and that "
                            + "its configuration bean was initialized without errors.",
                    provider,
                    services.keySet());
            throw new RuntimeException(
                    "No login service registered for provider: "
                            + provider
                            + ". Available: "
                            + services.keySet());
        }
        service.doLogin(request, resp, provider);
    }

    @Override
    public Response callback(String provider) throws NotFoundWebEx {
        LOGGER.info(
                "Callback requested for provider '{}'. Registered providers: {}",
                provider,
                services.keySet());
        IdPLoginService service = services.get(provider);
        if (service == null) {
            LOGGER.error("No login service registered for callback provider '{}'", provider);
            throw new NotFoundWebEx("No login service for provider: " + provider);
        }
        return surfaceAuthError(
                service.doInternalRedirect(
                        OAuth2Utils.getRequest(), OAuth2Utils.getResponse(), provider),
                provider);
    }

    /**
     * If the callback failed and the security layer recorded the actual failure reason in the
     * {@link RestAuthenticationEntryPoint#OAUTH2_AUTH_ERROR_KEY} request attribute, return a
     * response carrying that reason instead of a generic message, so the client sees the real cause
     * (e.g. token exchange rejected, userinfo 401, unresolvable principal) instead of "No access
     * token found.".
     */
    private Response surfaceAuthError(Response response, String provider) {
        if (response == null || response.getStatus() < 400) return response;
        HttpServletRequest request = OAuth2Utils.getRequest();
        if (request == null) return response;
        Object detail = request.getAttribute(RestAuthenticationEntryPoint.OAUTH2_AUTH_ERROR_KEY);
        if (!(detail instanceof String)) return response;

        Object entity = response.getEntity();
        boolean genericEntity =
                entity == null
                        || String.valueOf(entity).trim().isEmpty()
                        || "No access token found.".equals(String.valueOf(entity).trim());
        if (!genericEntity) return response;

        String message = "Authentication with provider '" + provider + "' failed: " + detail;
        LOGGER.error("{} (callback response status: {})", message, response.getStatus());
        return Response.status(response.getStatus()).entity(message).build();
    }

    @Override
    public SessionToken getTokensByTokenIdentifier(String provider, String tokenIdentifier)
            throws NotFoundWebEx {
        IdPLoginService service = services.get(provider);
        if (service == null) {
            LOGGER.error("No login service registered for provider '{}' (token lookup)", provider);
            throw new NotFoundWebEx("No login service for provider: " + provider);
        }
        return service.getTokenByIdentifier(provider, tokenIdentifier);
    }

    @Override
    public Response listProviders() {
        Map<String, OAuth2Configuration> configs = GeoStoreContext.beans(OAuth2Configuration.class);
        List<Map<String, String>> providers = new ArrayList<>();
        if (configs != null) {
            for (OAuth2Configuration config : configs.values()) {
                if (config.isEnabled()) {
                    Map<String, String> entry = new HashMap<>();
                    entry.put("name", config.getProvider());
                    entry.put("loginUrl", config.getProvider() + "/login");
                    providers.add(entry);
                }
            }
        }
        return Response.ok(providers).build();
    }

    @Override
    public void registerService(String providerName, IdPLoginService service) {
        this.services.put(providerName, service);
        LOGGER.info(
                "Registering login service for provider '{}' (class: {}). "
                        + "Providers after registration: {}",
                providerName,
                service.getClass().getSimpleName(),
                services.keySet());
    }
}
