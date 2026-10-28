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

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.server.resource.introspection.BadOpaqueTokenException;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.DefaultResponseErrorHandler;
import org.springframework.web.client.RestOperations;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.net.URI;
import java.util.Map;

/**
 * Provides an additional method to be able to deal with not fully standardized/check_token endpoint
 * responses.
 */
public class GeoStoreRemoteTokenServices {

    protected static final Logger LOGGER =
            LogManager.getLogger(GeoStoreRemoteTokenServices.class.getName());

    protected RestOperations restTemplate;

    protected String checkTokenEndpointUrl;

    protected String clientId;

    protected String clientSecret;

    protected GeoStoreRemoteTokenServices() {
        // constructor for subclasses that want to configure everything
    }

    protected GeoStoreRemoteTokenServices(RestOperations restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void setRestTemplate(RestOperations restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void setCheckTokenEndpointUrl(String checkTokenEndpointUrl) {
        this.checkTokenEndpointUrl = checkTokenEndpointUrl;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }

    public Map<String, Object> loadAuthentication(String accessToken)
            throws AuthenticationException, BadOpaqueTokenException {
        Map<String, Object> checkTokenResponse = checkToken(accessToken);
        verifyTokenResponse(accessToken, checkTokenResponse);
        transformNonStandardValuesToStandardValues(checkTokenResponse);
        return checkTokenResponse;
    }

    protected void verifyTokenResponse(String accessToken, Map<String, Object> checkTokenResponse) {
        if (checkTokenResponse == null || checkTokenResponse.isEmpty()) {
            LOGGER.warn("check_token returned empty response");
            throw new BadOpaqueTokenException(accessToken);
        }
        if (checkTokenResponse.containsKey("error")) {
            LOGGER.warn("check_token returned error: {}", checkTokenResponse.get("error"));
            throw new BadOpaqueTokenException(accessToken);
        }
    }

    /**
     * Subclass must override this method if values are not standardized.
     *
     * @param map the map of values to be transformed.
     */
    protected void transformNonStandardValuesToStandardValues(Map<String, Object> map) {
        // nothing to do if everything is standardized
    }

    protected Map<String, Object> checkToken(String accessToken) {
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("token", accessToken);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", getAuthorizationHeader(accessToken));

        String accessTokenUrl = checkTokenEndpointUrl + "?access_token=" + accessToken;
        return sendRequestForMap(accessTokenUrl, formData, headers, HttpMethod.POST);
    }

    protected String getAuthorizationHeader(String accessToken) {
        return "Bearer " + accessToken;
    }

    protected Map<String, Object> sendRequestForMap(
            String path,
            MultiValueMap<String, String> formData,
            HttpHeaders headers,
            HttpMethod method) {
        if (headers.getContentType() == null) {
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        }

        ParameterizedTypeReference<Map<String, Object>> map = new ParameterizedTypeReference<>() {};

        LOGGER.debug("Executing request {} form data are {}", path, formData);
        LOGGER.debug("Headers are {}", headers);

        ResponseEntity<Map<String, Object>> response =
                restTemplate.exchange(path, method, new HttpEntity<>(formData, headers), map);

        return response.getBody();
    }

    public static GeoStoreRemoteTokenServices defaultInstance(OAuth2Configuration configuration) {
        RestTemplate restTemplate = OAuth2Utils.protectedRestTemplate(configuration);
        restTemplate.setErrorHandler(
                new DefaultResponseErrorHandler() {
                    @Override
                    public boolean hasError(ClientHttpResponse response) throws IOException {
                        return response.getStatusCode().value() != 400 && super.hasError(response);
                    }

                    @Override
                    public void handleError(URI url, HttpMethod method, ClientHttpResponse response)
                            throws IOException {
                        super.handleError(url, method, response);
                    }
                });
        return new GeoStoreRemoteTokenServices(restTemplate);
    }
}
