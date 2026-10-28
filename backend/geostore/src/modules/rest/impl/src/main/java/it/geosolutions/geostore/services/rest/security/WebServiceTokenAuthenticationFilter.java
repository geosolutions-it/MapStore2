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

import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.StatusLine;
import org.apache.http.client.HttpClient;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.security.core.Authentication;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Token based authentication filter that looks for the token calling an external webservice.
 *
 * <p>The url of the service needs to be configured. A placeholder in the url will be replaced by
 * the actual token.
 *
 * <p>The result of the web service call will be parsed using given regular expression to: - check
 * if the token is valid - extract the user name from the result
 *
 * @author Mauro Bartolomeoli
 */
public class WebServiceTokenAuthenticationFilter extends TokenAuthenticationFilter {

    private static final Logger LOGGER =
            LogManager.getLogger(WebServiceTokenAuthenticationFilter.class);
    private final String url;
    // compiled user search regex
    Pattern searchUserRegex = null;
    // connection timeout to the mapper web service (in seconds)
    int connectTimeout = 5;
    // read timeout to the mapper web service (in seconds)
    int readTimeout = 10;
    HttpClientBuilder clientBuilder = HttpClientBuilder.create();
    // optional external httpClient for web service connection (used mainly for tests)
    private HttpClient httpClient = null;
    private RequestConfig connectionConfig;

    public WebServiceTokenAuthenticationFilter(String url) {
        super();
        this.url = url;
    }

    /**
     * Regular expression to extract the username from the webservice response.
     *
     * <p>The first group in the expression will be used for extraction.
     *
     * @param searchUser
     */
    public void setSearchUser(String searchUser) {
        searchUserRegex = Pattern.compile(searchUser);
    }

    public void setConnectTimeout(int connectTimeout) {
        this.connectTimeout = connectTimeout;
    }

    public void setReadTimeout(int readTimeout) {
        this.readTimeout = readTimeout;
    }

    private HttpClient getHttpClient() {
        if (httpClient == null) {
            httpClient = clientBuilder.useSystemProperties().build();
        }
        return httpClient;
    }

    /**
     * Configures the HTTPClient implementation to be used to connect to the web service.
     *
     * @param httpClient
     */
    public void setHttpClient(HttpClient httpClient) {
        this.httpClient = httpClient;
    }

    @Override
    protected Authentication checkToken(String token) {
        String webServiceUrl = url.replace("{token}", token);
        HttpClient client = getHttpClient();
        connectionConfig =
                RequestConfig.custom()
                        .setConnectionRequestTimeout(connectTimeout * 1000)
                        .setSocketTimeout(readTimeout * 1000)
                        .build();

        HttpRequestBase method = null;
        try {
            LOGGER.debug("Issuing request to webservice: " + url);
            method = new HttpGet(webServiceUrl);
            method.setConfig(connectionConfig);
            HttpResponse httpResponse = client.execute(method);

            if (getStatusCode(httpResponse) == HttpStatus.SC_OK) {
                // get response content as a single string, without new lines
                // so that is simpler to apply an extraction regular expression
                String response =
                        EntityUtils.toString(httpResponse.getEntity(), "UTF-8")
                                .replace("\r", "")
                                .replace("\n", "");
                if (response != null) {
                    if (searchUserRegex == null) {
                        return createAuthenticationForUser(response, null, "");
                    } else {
                        Matcher matcher = searchUserRegex.matcher(response);
                        if (matcher.find()) {
                            return createAuthenticationForUser(matcher.group(1), null, response);
                        } else {
                            LOGGER.warn(
                                    "Error in getting username from webservice response cannot find userName in response");
                        }
                    }
                } else {
                    LOGGER.error("No response received from webservice: " + url);
                }
            }
        } catch (IOException e) {
            LOGGER.error("Error reading data from webservice: " + url, e);
        } finally {
            if (method != null) {
                method.releaseConnection();
            }
        }
        return null;
    }

    public int getStatusCode(HttpResponse response) {
        if (response != null) {
            StatusLine statusLine = response.getStatusLine();
            return statusLine.getStatusCode();
        } else {
            return -1;
        }
    }
}
