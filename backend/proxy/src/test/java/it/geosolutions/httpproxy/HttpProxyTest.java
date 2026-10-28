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
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.core5.http.HttpEntity;
import org.apache.hc.core5.http.io.HttpClientResponseHandler;
import org.apache.hc.core5.http.protocol.HttpContext;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.apache.hc.core5.http.message.BasicHeader;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.net.URL;
import java.net.URI;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * HttpProxyTest class. Test Cases for the HTTPProxy servlet.
 *
 * @author Lorenzo Natali at lorenzo.natali@geo-solutions.it
 */
class HttpProxyTest {

    final ServletConfig servletConfig = mock(ServletConfig.class);
    ServletContext ctx = mock(ServletContext.class);
    Map<String, String[]> parameters = new HashMap<>();
    private List<String> headers = new ArrayList<>();

    CloseableHttpClient mockHttpClient;
    HTTPProxy proxy;
    String fakeLocation;

    @BeforeEach
    void setUp() {
        File f = new File(getClass().getClassLoader()
                .getResource("test-proxy.properties").getFile());
        when(ctx.getInitParameter("proxyPropPath")).thenReturn(
                f.getAbsolutePath());
        when(servletConfig.getServletContext()).thenReturn(ctx);
        when(ctx.getContextPath()).thenReturn("/http-proxy");

        // setup base parameters
        parameters.put("url", new String[]{"http://sample.com/"});

    }

    @Test
    void testRedirectGet() throws Exception {

        // mock redirect response
        final HttpGet mockGetMethod = mock(HttpGet.class);
        when(mockGetMethod.getUri()).thenReturn(new URI("http://sample.com/"));
        CloseableHttpResponse response = mock(CloseableHttpResponse.class);
        when(response.getCode()).thenReturn(302);

        mockHttpClient = mock(CloseableHttpClient.class);
        doAnswer(invocation -> {
            HttpClientResponseHandler<?> handler = invocation.getArgument(2);
            return handler.handleResponse(response);
        }).when(mockHttpClient).execute(eq(mockGetMethod), any(HttpContext.class), any(HttpClientResponseHandler.class));
        fakeLocation = "http://newURL.com/";

        when(response.getFirstHeader(Utils.LOCATION_HEADER))
                .thenReturn(new BasicHeader("Location", fakeLocation));

        proxy = new HTTPProxy() {
            private static final long serialVersionUID = 1L;

            @Override
            public HttpGet getGetMethod(URL url) {
                return mockGetMethod;
            }
        };
        proxy.setHttpClient(mockHttpClient);
        proxy.init(servletConfig);

        // mock http request to proxy
        HttpServletRequest getRequest = mock(HttpServletRequest.class);
        when(getRequest.getParameterMap()).thenReturn(parameters);
        when(getRequest.getHeaderNames()).thenReturn(
                Collections.enumeration(headers));
        when(getRequest.getServletPath()).thenReturn("/proxy");
        // mock http response object
        HttpServletResponse getResponse = mock(HttpServletResponse.class);
        final StubServletOutputStream servletOutputStream = new StubServletOutputStream();
        when(getResponse.getOutputStream()).thenReturn(servletOutputStream);

        proxy.doGet(getRequest, getResponse);
        // path-relative, so the browser keeps the scheme and host it used
        verify(getResponse).setStatus(302);
        verify(getResponse).setHeader(Utils.LOCATION_HEADER,
                "/http-proxy/proxy?url=" + URLEncoder.encode(fakeLocation, "UTF-8"));
        final byte[] data = servletOutputStream.baos.toByteArray();
        assertNotNull(data);
        assertEquals(0, data.length);
    }

    /** A remote host that does not answer in time is reported as 504, not as an empty 200. */
    @Test
    void testRemoteTimeoutIsAGatewayTimeout() throws Exception {
        final HttpGet mockGetMethod = mock(HttpGet.class);
        when(mockGetMethod.getUri()).thenReturn(new URI("http://sample.com/"));
        mockHttpClient = mock(CloseableHttpClient.class);
        doThrow(new java.net.SocketTimeoutException("Read timed out"))
                .when(mockHttpClient).execute(eq(mockGetMethod), any(HttpContext.class), any(HttpClientResponseHandler.class));

        proxy = new HTTPProxy() {
            private static final long serialVersionUID = 1L;

            @Override
            public HttpGet getGetMethod(URL url) {
                return mockGetMethod;
            }
        };
        proxy.setHttpClient(mockHttpClient);
        proxy.init(servletConfig);

        HttpServletRequest getRequest = mock(HttpServletRequest.class);
        when(getRequest.getParameterMap()).thenReturn(parameters);
        when(getRequest.getHeaderNames()).thenReturn(Collections.enumeration(headers));
        HttpServletResponse getResponse = mock(HttpServletResponse.class);

        proxy.doGet(getRequest, getResponse);

        verify(getResponse).sendError(eq(504), anyString());
    }

    @Test
    void testRedirectGet307() throws Exception {

        // 307 Temporary Redirect must be handled as a redirect as well
        final HttpGet mockGetMethod = mock(HttpGet.class);
        when(mockGetMethod.getUri()).thenReturn(new URI("http://sample.com/"));
        CloseableHttpResponse response = mock(CloseableHttpResponse.class);
        when(response.getCode()).thenReturn(307);

        mockHttpClient = mock(CloseableHttpClient.class);
        doAnswer(invocation -> {
            HttpClientResponseHandler<?> handler = invocation.getArgument(2);
            return handler.handleResponse(response);
        }).when(mockHttpClient).execute(eq(mockGetMethod), any(HttpContext.class), any(HttpClientResponseHandler.class));
        fakeLocation = "http://newURL.com/";

        // the Location header is read from the response, not the request
        when(response.getFirstHeader(Utils.LOCATION_HEADER))
                .thenReturn(new BasicHeader("Location", fakeLocation));

        proxy = new HTTPProxy() {
            private static final long serialVersionUID = 1L;

            @Override
            public HttpGet getGetMethod(URL url) {
                return mockGetMethod;
            }
        };
        proxy.setHttpClient(mockHttpClient);
        proxy.init(servletConfig);

        HttpServletRequest getRequest = mock(HttpServletRequest.class);
        when(getRequest.getParameterMap()).thenReturn(parameters);
        when(getRequest.getHeaderNames()).thenReturn(
                Collections.enumeration(headers));
        when(getRequest.getServletPath()).thenReturn("/proxy");
        HttpServletResponse getResponse = mock(HttpServletResponse.class);
        final StubServletOutputStream servletOutputStream = new StubServletOutputStream();
        when(getResponse.getOutputStream()).thenReturn(servletOutputStream);

        proxy.doGet(getRequest, getResponse);
        // 307 must reach the browser as 307, so that a POST is repeated as a POST
        verify(getResponse).setStatus(307);
        verify(getResponse).setHeader(Utils.LOCATION_HEADER,
                "/http-proxy/proxy?url=" + URLEncoder.encode(fakeLocation, "UTF-8"));
    }

    /**
     * The redirect back to the proxy uses the context path the application is deployed under, not
     * the one the request reports, which follows what the client sent.
     */
    @Test
    void testRedirectUsesConfiguredContextPath() throws Exception {
        HttpServletRequest getRequest = mock(HttpServletRequest.class);
        when(getRequest.getContextPath()).thenReturn("/http-proxy;jsessionid=0123");
        when(getRequest.getServletPath()).thenReturn("/proxy");

        HttpServletResponse getResponse = redirectedGet(getRequest);

        verify(getResponse).setStatus(302);
        verify(getResponse).setHeader(Utils.LOCATION_HEADER,
                "/http-proxy/proxy?url=" + URLEncoder.encode(fakeLocation, "UTF-8"));
    }

    /** MapStore calls the proxy as ".../proxy/?url=", and the redirect keeps that form. */
    @Test
    void testRedirectKeepsTrailingSlashOfProxyPath() throws Exception {
        HttpServletRequest getRequest = mock(HttpServletRequest.class);
        when(getRequest.getServletPath()).thenReturn("/proxy");
        when(getRequest.getPathInfo()).thenReturn("/");

        HttpServletResponse getResponse = redirectedGet(getRequest);

        verify(getResponse).setStatus(302);
        verify(getResponse).setHeader(Utils.LOCATION_HEADER,
                "/http-proxy/proxy/?url=" + URLEncoder.encode(fakeLocation, "UTF-8"));
    }

    /**
     * Sends the request through the proxy while the remote host answers 302 and returns the
     * response the proxy wrote.
     */
    private HttpServletResponse redirectedGet(HttpServletRequest getRequest) throws Exception {
        final HttpGet mockGetMethod = mock(HttpGet.class);
        when(mockGetMethod.getUri()).thenReturn(new URI("http://sample.com/"));
        CloseableHttpResponse response = mock(CloseableHttpResponse.class);
        when(response.getCode()).thenReturn(302);
        fakeLocation = "http://newURL.com/";
        when(response.getFirstHeader(Utils.LOCATION_HEADER))
                .thenReturn(new BasicHeader("Location", fakeLocation));

        mockHttpClient = mock(CloseableHttpClient.class);
        doAnswer(invocation -> {
            HttpClientResponseHandler<?> handler = invocation.getArgument(2);
            return handler.handleResponse(response);
        }).when(mockHttpClient).execute(eq(mockGetMethod), any(HttpContext.class), any(HttpClientResponseHandler.class));

        proxy = new HTTPProxy() {
            private static final long serialVersionUID = 1L;

            @Override
            public HttpGet getGetMethod(URL url) {
                return mockGetMethod;
            }
        };
        proxy.setHttpClient(mockHttpClient);
        proxy.init(servletConfig);

        when(getRequest.getParameterMap()).thenReturn(parameters);
        when(getRequest.getHeaderNames()).thenReturn(Collections.enumeration(headers));
        HttpServletResponse getResponse = mock(HttpServletResponse.class);
        when(getResponse.getOutputStream()).thenReturn(new StubServletOutputStream());

        proxy.doGet(getRequest, getResponse);
        return getResponse;
    }

    @Test
    void testPost() throws Exception {

        // mock post response
        final HttpPost mockPostMethod = mock(HttpPost.class);
        CloseableHttpResponse response = mock(CloseableHttpResponse.class);
        when(response.getCode()).thenReturn(200);

        HttpEntity stringEntity = new StringEntity("user created");
        when(response.getEntity()).thenReturn(stringEntity);
        when(response.headerIterator()).thenReturn(Collections.<org.apache.hc.core5.http.Header>emptyList().iterator());
        mockHttpClient = mock(CloseableHttpClient.class);
        doAnswer(invocation -> {
            HttpClientResponseHandler<?> handler = invocation.getArgument(2);
            return handler.handleResponse(response);
        }).when(mockHttpClient).execute(eq(mockPostMethod), any(HttpContext.class), any(HttpClientResponseHandler.class));

        proxy = new HTTPProxy() {
            private static final long serialVersionUID = 1L;

            @Override
            public HttpPost getPostMethod(URL url) {
                return mockPostMethod;
            }
        };
        proxy.setHttpClient(mockHttpClient);
        proxy.init(servletConfig);

        // mock http request to proxy
        HttpServletRequest postRequest = mock(HttpServletRequest.class);
        when(postRequest.getQueryString()).thenReturn("url=https://jsonplaceholder.typicode.com/test/createUser");
        when(postRequest.getMethod()).thenReturn("post");

        Enumeration<String> enumeration = Collections.enumeration(Collections.emptyList());
        when(postRequest.getHeaderNames()).thenReturn(enumeration);

        ServletInputStream stream = mock(ServletInputStream.class);
        when(postRequest.getInputStream()).thenReturn(stream);

        // mock http response object
        HttpServletResponse getResponse = mock(HttpServletResponse.class);
        final StubServletOutputStream servletOutputStream = new StubServletOutputStream();
        when(getResponse.getOutputStream()).thenReturn(servletOutputStream);

        proxy.doPost(postRequest, getResponse);
        verify(getResponse).setStatus(200);
        final byte[] data = servletOutputStream.baos.toByteArray();
        assertNotNull(data);
        assertNotEquals(0, data.length);
    }
}
