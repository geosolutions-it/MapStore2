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

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpHeaders;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Collections;
import java.util.Enumeration;

/**
 * A class that groups some constants and utility methods used to handle OAuth2 related tasks.
 * Provides functionality like retrieving tokens from the request, retrieving the {@link
 * TokenDetails} from an Authentication instance, and building the {@link RestTemplate} and {@link
 * SimpleClientHttpRequestFactory} instances used for back-channel calls to the IdP.
 */
public class OAuth2Utils {

    public static final String ID_TOKEN_PARAM = "id_token";

    public static final String ACCESS_TOKEN_PARAM = "access_token";

    public static final String REFRESH_TOKEN_PARAM = "refresh_token";

    public static final String TOKENS_KEY = "tokens_key";

    public static final String AUTH_PROVIDER = "authProvider";

    /**
     * Request-attribute key holding the raw access/ID token value for downstream readers (replaces
     * the legacy {@code OAuth2AuthenticationDetails.ACCESS_TOKEN_VALUE}).
     */
    public static final String ACCESS_TOKEN_VALUE = "OAuth2-AccessTokenValue";

    /** Request-attribute key holding the access token type (replaces the legacy constant). */
    public static final String ACCESS_TOKEN_TYPE = "OAuth2-AccessTokenType";

    /**
     * Retrieve a token either from a request param or from the Bearer.
     *
     * @param paramName the name of the request param.
     * @param request the request.
     * @return the token if found, null otherwise.
     */
    public static String tokenFromParamsOrBearer(String paramName, HttpServletRequest request) {
        String token = getParameterValue(paramName, request);
        if (token == null) {
            token = getBearerToken(request);
        }
        return token;
    }

    /**
     * A {@link RestTemplate} for back-channel calls to the IdP, configured with the provider's
     * connect/read timeouts and {@link #noKeepAliveInterceptor()}.
     *
     * @throws NullPointerException if configuration is null
     */
    public static RestTemplate protectedRestTemplate(OAuth2Configuration configuration) {
        RestTemplate template = new RestTemplate(protectedRequestFactory(configuration));
        template.setInterceptors(Collections.singletonList(noKeepAliveInterceptor()));
        return template;
    }

    /**
     * Builds a {@link SimpleClientHttpRequestFactory} using the connect/read timeouts configured
     * for the given provider, so back-channel calls to the IdP never block indefinitely.
     *
     * @throws NullPointerException if configuration is null
     * @throws IllegalArgumentException if either timeout is not a positive value.
     */
    public static SimpleClientHttpRequestFactory protectedRequestFactory(
            OAuth2Configuration configuration) {
        int connectTimeout = configuration.getConnectTimeout();
        int readTimeout = configuration.getReadTimeout();
        if (connectTimeout <= 0 || readTimeout <= 0) {
            throw new IllegalArgumentException(
                    "connectTimeout and readTimeout must be positive, got connectTimeout="
                            + connectTimeout
                            + ", readTimeout="
                            + readTimeout);
        }
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(connectTimeout);
        factory.setReadTimeout(readTimeout);
        return factory;
    }

    /**
     * Interceptor that forces "Connection: close" on the request, so the JVM never puts the
     * underlying socket back in its shared keep-alive cache. IdP-facing calls are infrequent enough
     * that connection reuse isn't worth the risk of the network path (LB/proxy/NAT) having already
     * silently torn down an idle pooled connection.
     */
    public static ClientHttpRequestInterceptor noKeepAliveInterceptor() {
        return (request, body, execution) -> {
            request.getHeaders().set(HttpHeaders.CONNECTION, "close");
            return execution.execute(request, body);
        };
    }

    /**
     * Retrieve a value from a request param.
     *
     * @param paramName the name of the request param.
     * @param request the request.
     * @return the value if found, null otherwise.
     */
    public static String getParameterValue(String paramName, HttpServletRequest request) {
        for (Enumeration<String> iterator = request.getParameterNames();
                iterator.hasMoreElements(); ) {
            final String param = iterator.nextElement();
            if (paramName.equalsIgnoreCase(param)) {
                return request.getParameter(param);
            }
        }

        return null;
    }

    /**
     * Get the bearer token from the header.
     *
     * @param request the request.
     * @return the token if found null otherwise.
     */
    public static String getBearerToken(HttpServletRequest request) {
        BearerTokenResolver resolver = new DefaultBearerTokenResolver();
        try {
            return resolver.resolve(request);
        } catch (OAuth2AuthenticationException e) {
            return null;
        }
    }

    /**
     * Get a request attribute using first a request scope then the session scope.
     *
     * @param name the name of the attribute.
     * @return the token attribute value if found.
     */
    public static String getRequestAttribute(String name) {
        String token = (String) RequestContextHolder.getRequestAttributes().getAttribute(name, 0);
        if (token == null)
            token = (String) RequestContextHolder.getRequestAttributes().getAttribute(name, 1);
        return token;
    }

    public static final String ID_TOKEN_VALUE = "OpenIdConnect-IdTokenValue";

    /**
     * Get the id token from the request attributes.
     *
     * @return the id token value if found, null otherwise.
     */
    public static String getIdToken() {
        return getRequestAttribute(ID_TOKEN_VALUE);
    }

    /**
     * Get the Access Token from the request attributes if present.
     *
     * @return the access token if found, null otherwise.
     */
    public static String getAccessToken() {
        String token = getRequestAttribute(ACCESS_TOKEN_PARAM);
        if (token == null) token = tokenFromParamsOrBearer(ACCESS_TOKEN_PARAM, getRequest());

        return token;
    }

    /**
     * Get the Refresh Token from request attributes if present.
     *
     * @return the refresh token if found, null otherwise.
     */
    public static String getRefreshAccessToken() {
        String refreshToken = getRequestAttribute(REFRESH_TOKEN_PARAM);
        if (refreshToken == null)
            refreshToken = getParameterValue(REFRESH_TOKEN_PARAM, getRequest());
        return refreshToken;
    }

    /**
     * Return the {@link TokenDetails} stored in the Authentication instance.
     *
     * @param authentication the authentication eventually holding the TokenDetails.
     * @return the token details if found. Null otherwise.
     */
    public static TokenDetails getTokenDetails(Authentication authentication) {
        TokenDetails tokenDetails = null;
        if (authentication != null) {
            Object details = authentication.getDetails();
            if (details instanceof TokenDetails) {
                tokenDetails = ((TokenDetails) details);
            }
        }
        return tokenDetails;
    }

    /**
     * Get the HttpServletRequest from the RequestContext.
     *
     * @return the current HttpServletRequest.
     */
    public static HttpServletRequest getRequest() {
        return ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes())
                .getRequest();
    }

    /**
     * Get the HttpServletResponse from the RequestContext.
     *
     * @return the current HttpServletResponse.
     */
    public static HttpServletResponse getResponse() {
        return ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes())
                .getResponse();
    }
}
