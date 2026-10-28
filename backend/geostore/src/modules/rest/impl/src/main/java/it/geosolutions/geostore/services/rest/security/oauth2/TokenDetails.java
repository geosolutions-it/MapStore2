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

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;

import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;

import java.io.Serializable;

/**
 * Holds the token details. Instances of this class are meant to be stored into the SecurityContext
 * along with the corresponding Authentication instance.
 */
public class TokenDetails implements Serializable {
    private final String idToken;
    private final String provider;
    private OAuth2AccessToken accessToken;
    private OAuth2RefreshToken refreshToken;
    private DecodedJWT decodedJWT;

    /**
     * @param accessToken the accessToken instance.
     * @param idToken the JWT idToken
     * @param provider the name of the identity provider that issued the token.
     */
    public TokenDetails(OAuth2AccessToken accessToken, String idToken, String provider) {
        this(accessToken, idToken, provider, null);
    }

    /**
     * @param accessToken the accessToken instance.
     * @param idToken the JWT idToken
     * @param provider the name of the identity provider that issued the token.
     * @param refreshToken the refreshToken instance (may be null).
     */
    public TokenDetails(
            OAuth2AccessToken accessToken,
            String idToken,
            String provider,
            OAuth2RefreshToken refreshToken) {
        this.idToken = idToken;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        if (idToken != null) {
            decodedJWT = JWT.decode(idToken);
        }
        this.provider = provider;
    }

    /**
     * Get a claim by name from the idToken.
     *
     * @param claimName the name of the claim to retrieve.
     * @param binding the Class to which convert the claim value.
     * @param <T> the type of the claim value.
     * @return the claim value.
     */
    public <T> T getClaim(String claimName, Class<T> binding) {
        T result = null;
        if (decodedJWT != null) {
            Claim claim = decodedJWT.getClaim(claimName);
            if (claim != null) result = claim.as(binding);
        }
        return result;
    }

    /**
     * @return the JWT idToken.
     */
    public String getIdToken() {
        return idToken;
    }

    /**
     * @return the OAuth2AccessToken instance.
     */
    public OAuth2AccessToken getAccessToken() {
        return accessToken;
    }

    /**
     * Set the OAuth2AccessToken.
     *
     * @param accessToken the OAuth2AccessToken.
     */
    public void setAccessToken(OAuth2AccessToken accessToken) {
        this.accessToken = accessToken;
    }

    /**
     * @return the OAuth2RefreshToken instance (may be null).
     */
    public OAuth2RefreshToken getRefreshToken() {
        return refreshToken;
    }

    /**
     * Set the OAuth2RefreshToken. Used to carry over a still-valid refresh token when the identity
     * provider rotates the access token without issuing a new refresh token.
     *
     * @param refreshToken the OAuth2RefreshToken.
     */
    public void setRefreshToken(OAuth2RefreshToken refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getProvider() {
        return provider;
    }
}
