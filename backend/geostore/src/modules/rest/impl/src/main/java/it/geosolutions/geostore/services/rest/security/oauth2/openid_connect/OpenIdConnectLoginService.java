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

import static it.geosolutions.geostore.services.rest.SessionServiceDelegate.PROVIDER_KEY;
import static it.geosolutions.geostore.services.rest.security.oauth2.OAuth2Utils.*;

import it.geosolutions.geostore.services.rest.IdPLoginRest;
import it.geosolutions.geostore.services.rest.security.oauth2.Oauth2LoginService;
import it.geosolutions.geostore.services.rest.security.oauth2.TokenDetails;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.ws.rs.core.Response;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

/**
 * Extension point to customize the login and redirect after login performed from the {@link
 * IdPLoginRest};
 */
public class OpenIdConnectLoginService extends Oauth2LoginService {

    public OpenIdConnectLoginService(IdPLoginRest loginRest, String providerName) {
        loginRest.registerService(providerName, this);
    }

    public OpenIdConnectLoginService(IdPLoginRest loginRest) {
        this(loginRest, "oidc");
    }

    /**
     * @param request the request.
     * @param response the response.
     * @param provider the provider name.
     * @return
     */
    @Override
    public Response doInternalRedirect(
            HttpServletRequest request, HttpServletResponse response, String provider) {
        String token = getAccessToken();
        String refreshToken = getRefreshAccessToken();
        RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();
        if (token == null
                && SecurityContextHolder.getContext() != null
                && requestAttributes != null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null
                    && auth.getDetails() != null
                    && auth.getDetails() instanceof TokenDetails) {
                TokenDetails tokenDetails = ((TokenDetails) auth.getDetails());
                OAuth2AccessToken accessTokenDetails = tokenDetails.getAccessToken();
                if (accessTokenDetails != null) {
                    token = accessTokenDetails.getTokenValue();
                    requestAttributes.setAttribute(ACCESS_TOKEN_PARAM, accessTokenDetails, 0);
                    requestAttributes.setAttribute(ACCESS_TOKEN_VALUE, token, 0);
                    if (tokenDetails.getRefreshToken() != null) {
                        refreshToken = tokenDetails.getRefreshToken().getTokenValue();
                        requestAttributes.setAttribute(REFRESH_TOKEN_PARAM, refreshToken, 0);
                    }
                }
                if (tokenDetails.getIdToken() != null) {
                    requestAttributes.setAttribute(ID_TOKEN_PARAM, tokenDetails.getIdToken(), 0);
                    requestAttributes.setAttribute(
                            ACCESS_TOKEN_VALUE, tokenDetails.getIdToken(), 0);
                }
            }
        }
        assert requestAttributes != null;
        requestAttributes.setAttribute(PROVIDER_KEY, provider, 0);
        return buildCallbackResponse(response, token, refreshToken, provider);
    }
}
