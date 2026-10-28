/*
 *  Copyright (C) 2007 - 2011 GeoSolutions S.A.S.
 *  http://www.geo-solutions.it
 *
 *  GPLv3 + Classpath exception
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package it.geosolutions.httpproxy;

import jakarta.servlet.ServletConfig;
import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.core5.http.Header;
import org.apache.hc.core5.http.io.HttpClientResponseHandler;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.net.URL;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.any;
import static org.mockito.Mockito.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Tests for request header whitelist and blacklist filtering.
 */
class RequestHeaderFilterTest {

    Map<String, String[]> parameters = new HashMap<>();

    @BeforeEach
    void setUp() {
        // URL must match one of the reqtypeWhitelist patterns in proxy.properties
        parameters.put("url", new String[]{"http://sample.com/csw"});
    }

    /**
     * Helper to create a proxy configured with the given properties file resource.
     */
    private HTTPProxy createProxy(String propertiesResource, final HttpGet mockGetMethod,
                                  CloseableHttpClient mockHttpClient) throws Exception {
        File f = new File(getClass().getClassLoader()
                .getResource(propertiesResource).getFile());

        final ServletConfig servletConfig = mock(ServletConfig.class);
        ServletContext ctx = mock(ServletContext.class);
        when(ctx.getInitParameter("proxyPropPath")).thenReturn(f.getAbsolutePath());
        when(servletConfig.getServletContext()).thenReturn(ctx);

        HTTPProxy proxy = new HTTPProxy() {
            private static final long serialVersionUID = 1L;

            @Override
            public HttpGet getGetMethod(URL url) {
                return mockGetMethod;
            }
        };
        proxy.setHttpClient(mockHttpClient);
        proxy.init(servletConfig);
        return proxy;
    }

    /**
     * Build a mock GET that returns a 200 with the given body.
     */
    private HttpGet buildMockGet(CloseableHttpClient mockHttpClient) throws Exception {
        HttpGet mockGetMethod = mock(HttpGet.class);
        CloseableHttpResponse response = mock(CloseableHttpResponse.class);
        when(response.getCode()).thenReturn(200);
        when(response.getEntity()).thenReturn(new StringEntity("OK"));
        when(response.headerIterator()).thenReturn(Collections.<Header>emptyList().iterator());
        doAnswer(invocation -> {
            HttpClientResponseHandler<?> handler = invocation.getArgument(1);
            return handler.handleResponse(response);
        }).when(mockHttpClient).execute(eq(mockGetMethod), any(HttpClientResponseHandler.class));
        return mockGetMethod;
    }

    @Test
    void testBlacklistRemovesHeaders() throws Exception {
        CloseableHttpClient mockHttpClient = mock(CloseableHttpClient.class);
        final HttpGet mockGetMethod = buildMockGet(mockHttpClient);

        HTTPProxy proxy = createProxy("proxy.properties",
                mockGetMethod, mockHttpClient);

        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getParameterMap()).thenReturn(parameters);
        when(request.getMethod()).thenReturn("GET");

        // Simulate incoming headers: Accept, X-Secret, Cookie
        List<String> headerNames = Arrays.asList("Accept", "X-Secret", "Cookie", "Host");
        when(request.getHeaderNames()).thenReturn(Collections.enumeration(headerNames));
        for (String h : headerNames) {
            when(request.getHeaders(h)).thenReturn(
                    Collections.enumeration(Collections.singletonList("value-" + h)));
        }
        when(request.getRequestURL()).thenReturn(new StringBuffer("http://proxy.com/proxy"));

        HttpServletResponse response = mock(HttpServletResponse.class);
        StubServletOutputStream out = new StubServletOutputStream();
        when(response.getOutputStream()).thenReturn(out);

        proxy.doGet(request, response);

        // X-Secret and Cookie should NOT have been set (blacklisted)
        verify(mockGetMethod, never()).setHeader(eq("X-Secret"), anyString());
        verify(mockGetMethod, never()).setHeader(eq("Cookie"), anyString());
        // Accept should have been forwarded
        verify(mockGetMethod).setHeader("Accept", "value-Accept");
        // Host is rewritten to the target host
        verify(mockGetMethod).setHeader(eq("Host"), anyString());
    }

    @Test
    void testWhitelistOnlyForwardsAllowedHeaders() throws Exception {
        CloseableHttpClient mockHttpClient = mock(CloseableHttpClient.class);
        final HttpGet mockGetMethod = buildMockGet(mockHttpClient);

        HTTPProxy proxy = createProxy("proxy.properties",
                mockGetMethod, mockHttpClient);

        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getParameterMap()).thenReturn(parameters);
        when(request.getMethod()).thenReturn("GET");

        // Simulate incoming headers: Accept, X-Custom, Authorization, Host, Content-Type
        List<String> headerNames = Arrays.asList("Accept", "X-Custom", "Authorization", "Host", "Content-Type");
        when(request.getHeaderNames()).thenReturn(Collections.enumeration(headerNames));
        for (String h : headerNames) {
            when(request.getHeaders(h)).thenReturn(
                    Collections.enumeration(Collections.singletonList("value-" + h)));
        }
        when(request.getRequestURL()).thenReturn(new StringBuffer("http://proxy.com/proxy"));

        HttpServletResponse response = mock(HttpServletResponse.class);
        StubServletOutputStream out = new StubServletOutputStream();
        when(response.getOutputStream()).thenReturn(out);

        proxy.doGet(request, response);

        // Whitelisted: Accept, Content-Type, Host should be forwarded
        verify(mockGetMethod).setHeader("Accept", "value-Accept");
        verify(mockGetMethod).setHeader("Content-Type", "value-Content-Type");
        verify(mockGetMethod).setHeader(eq("Host"), anyString());
        // NOT whitelisted: X-Custom, Authorization should be removed
        verify(mockGetMethod, never()).setHeader(eq("X-Custom"), anyString());
        verify(mockGetMethod, never()).setHeader(eq("Authorization"), anyString());
    }

    @Test
    void testBlacklistTakesPrecedenceOverWhitelist() throws Exception {
        // proxy.properties has both whitelist (Accept,Content-Type,Host)
        // and blacklist (X-Secret,Cookie).
        // A header NOT in either list should be blocked by the whitelist.
        // A header in the blacklist should always be blocked even if it were whitelisted.
        CloseableHttpClient mockHttpClient = mock(CloseableHttpClient.class);
        final HttpGet mockGetMethod = buildMockGet(mockHttpClient);

        HTTPProxy proxy = createProxy("proxy.properties",
                mockGetMethod, mockHttpClient);

        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getParameterMap()).thenReturn(parameters);
        when(request.getMethod()).thenReturn("GET");

        // Send headers covering all cases:
        // Accept        -> whitelisted, not blacklisted -> forwarded
        // X-Secret      -> blacklisted                  -> blocked
        // Authorization -> not whitelisted               -> blocked
        List<String> headerNames = Arrays.asList("Accept", "X-Secret", "Authorization");
        when(request.getHeaderNames()).thenReturn(Collections.enumeration(headerNames));
        for (String h : headerNames) {
            when(request.getHeaders(h)).thenReturn(
                    Collections.enumeration(Collections.singletonList("value-" + h)));
        }
        when(request.getRequestURL()).thenReturn(new StringBuffer("http://proxy.com/proxy"));

        HttpServletResponse response = mock(HttpServletResponse.class);
        StubServletOutputStream out = new StubServletOutputStream();
        when(response.getOutputStream()).thenReturn(out);

        proxy.doGet(request, response);

        // Accept: whitelisted and not blacklisted -> forwarded
        verify(mockGetMethod).setHeader("Accept", "value-Accept");
        // X-Secret: blacklisted -> blocked
        verify(mockGetMethod, never()).setHeader(eq("X-Secret"), anyString());
        // Authorization: not in whitelist -> blocked
        verify(mockGetMethod, never()).setHeader(eq("Authorization"), anyString());
    }
}
