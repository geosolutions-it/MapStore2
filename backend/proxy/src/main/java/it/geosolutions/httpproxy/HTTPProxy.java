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
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.commons.fileupload2.core.DiskFileItemFactory;
import org.apache.commons.fileupload2.core.FileItem;
import org.apache.commons.fileupload2.core.FileUploadException;
import org.apache.commons.fileupload2.jakarta.servlet6.JakartaServletFileUpload;
import org.apache.hc.client5.http.HttpRoute;
import org.apache.hc.client5.http.SystemDefaultDnsResolver;
import org.apache.hc.client5.http.auth.AuthScope;
import org.apache.hc.client5.http.config.ConnectionConfig;
import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.auth.Credentials;
import org.apache.hc.client5.http.auth.CredentialsProvider;
import org.apache.hc.client5.http.auth.UsernamePasswordCredentials;
import org.apache.hc.client5.http.classic.methods.HttpDelete;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.classic.methods.HttpPut;
import org.apache.hc.client5.http.classic.methods.HttpUriRequestBase;
import org.apache.hc.client5.http.entity.mime.ContentBody;
import org.apache.hc.client5.http.entity.mime.MultipartEntityBuilder;
import org.apache.hc.client5.http.impl.auth.BasicAuthCache;
import org.apache.hc.client5.http.impl.auth.BasicCredentialsProvider;
import org.apache.hc.client5.http.impl.auth.BasicScheme;
import org.apache.hc.client5.http.impl.auth.SystemDefaultCredentialsProvider;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClientBuilder;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManager;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManagerBuilder;
import org.apache.hc.client5.http.protocol.HttpClientContext;
import org.apache.hc.client5.http.routing.HttpRoutePlanner;
import org.apache.hc.core5.http.ClassicHttpResponse;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.HttpEntity;
import org.apache.hc.core5.http.HttpException;
import org.apache.hc.core5.http.HttpHost;
import org.apache.hc.core5.http.io.entity.InputStreamEntity;
import org.apache.hc.core5.http.protocol.HttpContext;
import org.apache.hc.core5.util.Timeout;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InterruptedIOException;
import java.io.InputStream;
import java.net.URL;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * HTTPProxy class.
 *
 * @author Alessio Fabiani at alessio.fabiani@geo-solutions.it
 * @author Tobia Di Pisa at tobia.dipisa@geo-solutions.it
 * @author Simone Giannecchini, GeoSolutions SAS
 */
public class HTTPProxy extends HttpServlet {

    /**
     * Serialization UID.
     */
    private static final long serialVersionUID = -4770692886388850680L;

    private static final org.slf4j.Logger LOGGER = LoggerFactory.getLogger(HTTPProxy.class);


    /**
     * An Apache commons HTTP client backed by a multithreaded connection manager that allows to reuse connections to the backing server and to limit
     * the max number of concurrent connections.
     */
    private PoolingHttpClientConnectionManager connectionManager;

    HttpClientBuilder clientBuilder = HttpClientBuilder.create();
    /**
     * An HTTP "user-agent", containing an HTTP state and one or more HTTP connections, to which HTTP methods can be applied.
     */
    private CloseableHttpClient httpClient;

    private HttpHost outboundHttpProxy;
    private HttpHost outboundHttpsProxy;

    /** The destination policy applied to every connection the client opens. */
    private PrivateAddressDnsResolver destinationPolicy;

    /** Whether requests may go through the JVM outbound proxy; read once, like the policy. */
    private boolean allowForwardProxy;


    /**
     * The proxy configuration.
     */
    private ProxyConfig proxyConfig;

    /**
     * The proxy collbacks to provide checks.
     */
    private List<ProxyCallback> callbacks;

    /**
     * Initialize the <code>ProxyServlet</code>
     *
     * @param servletConfig The Servlet configuration passed in by the servlet conatiner
     */
    @Override
    public void init(ServletConfig servletConfig) throws ServletException {
        super.init(servletConfig);

        ServletContext context = getServletContext();
        String proxyPropPath = context.getInitParameter("proxyPropPath");

        proxyConfig = new ProxyConfig(getServletContext(), proxyPropPath);

        // Requests sent through the outbound proxy connect to the proxy itself, which is often on
        // a private network: trust the configured proxy as a connection target.
        allowForwardProxy = proxyConfig.isAllowForwardProxy();
        Set<String> trustedProxies = new HashSet<>();
        if (allowForwardProxy) {
            addProxy(trustedProxies, getHost("http.proxyHost", "http.proxyPort"));
            addProxy(trustedProxies, getHost("https.proxyHost", "https.proxyPort"));
        }
        destinationPolicy = new PrivateAddressDnsResolver(
                proxyConfig, SystemDefaultDnsResolver.INSTANCE, trustedProxies);

        // timeout, connection_timeout, max_total_connections and default_max_connections_per_host
        // from proxy.properties.
        connectionManager = PoolingHttpClientConnectionManagerBuilder.create()
                .setDnsResolver(destinationPolicy)
                .setDefaultConnectionConfig(ConnectionConfig.custom()
                        .setConnectTimeout(Timeout.ofMilliseconds(proxyConfig.getConnectionTimeout()))
                        .setSocketTimeout(Timeout.ofMilliseconds(proxyConfig.getSoTimeout()))
                        .build())
                .setMaxConnTotal(proxyConfig.getMaxTotalConnections())
                .setMaxConnPerRoute(proxyConfig.getDefaultMaxConnectionsPerHost())
                .build();

        httpClient = createHttpClient();
        logDestinationPolicy();

        // //////////////////////////////////////////
        // Setup the callbacks (in the future this
        // will be a pluggable lookup).
        // //////////////////////////////////////////

        callbacks = new ArrayList<>();
        callbacks.add(new MimeTypeChecker(proxyConfig));
        callbacks.add(new HostNameChecker(proxyConfig));
        callbacks.add(new RequestTypeChecker(proxyConfig));
        callbacks.add(new MethodsChecker(proxyConfig));
        callbacks.add(new HostChecker(proxyConfig));
    }

    /**
     * Creates the HttpClient
     * @return HttpClient
     */
    public CloseableHttpClient createHttpClient() {
        if (httpClient != null)
            return httpClient;

        outboundHttpProxy = getHost("http.proxyHost", "http.proxyPort");
        LOGGER.debug("HTTP proxy host: {}", outboundHttpProxy);
        outboundHttpsProxy = getHost("https.proxyHost", "https.proxyPort");
        LOGGER.debug("HTTPS proxy host: {}", outboundHttpsProxy);

        HttpRoutePlanner routePlanner = getRoutePlanner(outboundHttpProxy, outboundHttpsProxy);

        clientBuilder.setRoutePlanner(routePlanner);
        if (proxyConfig != null) {
            clientBuilder.setDefaultRequestConfig(RequestConfig.custom()
                    .setResponseTimeout(Timeout.ofMilliseconds(proxyConfig.getSoTimeout()))
                    .build());
        }
        clientBuilder.disableRedirectHandling();
        // One client serves every user: a shared cookie store would replay a cookie set by one
        // user's upstream response on every other user's requests to that host.
        clientBuilder.disableCookieManagement();
        clientBuilder.useSystemProperties();
        clientBuilder.setConnectionManager(connectionManager);

        LOGGER.info("HTTP Client created");
        return clientBuilder.build();
    }

    private HttpHost getHost(String proxyHostKey, String proxyPortKey) {
        HttpHost httpHost = null;
        String proxyHost = System.getProperty(proxyHostKey);
        if (proxyHost != null && !proxyHost.isEmpty()) {
            int proxyPort = 80;
            proxyPort = (System.getProperty(proxyPortKey) != null ?
                    Integer.parseInt(System.getProperty(proxyPortKey)) : proxyPort);
            httpHost = new HttpHost(proxyHost, proxyPort);
        }
        return httpHost;
    }

    private static void addProxy(Set<String> proxies, HttpHost proxy) {
        if (proxy != null) {
            proxies.add(proxy.getHostName() + ":" + proxy.getPort());
        }
    }

    private void logDestinationPolicy() {
        LOGGER.warn(destinationPolicy.describe());
        if (outboundHttpProxy == null && outboundHttpsProxy == null) {
            return;
        }
        if (allowForwardProxy) {
            LOGGER.warn("Requests to hosts outside http.nonProxyHosts go through the outbound proxy"
                    + " (http: {}, https: {}): a destination is checked here only when its name"
                    + " resolves locally, the outbound proxy's own rules apply to the rest",
                    outboundHttpProxy, outboundHttpsProxy);
        } else {
            LOGGER.warn("allowForwardProxy is false: requests to hosts outside http.nonProxyHosts are refused");
        }
    }

    /**
     * Returns the HttpRoutePlanner based on the target host http scheme
     * @param httpHost
     * @param httpsHost
     * @return HttpRoutePlanner
     */
    private HttpRoutePlanner getRoutePlanner(final HttpHost httpHost, final HttpHost httpsHost) {
        return new HttpRoutePlanner() {
            public HttpRoute determineRoute(
                    HttpHost target,
                    HttpContext context) throws HttpException {
                LOGGER.info("HTTP proxy target host: {}", target);
                if (isNonProxyHost(target.getHostName())) {
                    LOGGER.info("Returning direct route");
                    // Return direct route
                    return new HttpRoute(target);
                } else {
                    // Return the proxy route
                    LOGGER.info("Returning proxy route");

                    return getProxyRoute(target);
                }
            }

            private HttpRoute getProxyRoute(HttpHost target) {
                if (target.getSchemeName().equals("http")) {
                    LOGGER.debug("Setting http scheme");
                    if (httpHost == null)
                        return new HttpRoute(target);
                    else
                        return new HttpRoute(target, null, httpHost,
                                false);
                } else {
                    LOGGER.debug("Setting https scheme");
                    if (httpsHost == null)
                        return new HttpRoute(target, null, true);
                    else
                        return new HttpRoute(target, null, httpsHost,
                                true);
                }
            }
        };
    }

    private boolean isNonProxyHost(String host) {
        boolean isNonProxyHost = false;
        String nonProxyHostProp = System.getProperty("http.nonProxyHosts");
        if (nonProxyHostProp != null) {
            if (nonProxyHostProp.startsWith("\"")) {
                nonProxyHostProp = nonProxyHostProp.substring(1);
            }
            if (nonProxyHostProp.endsWith("\"")) {
                nonProxyHostProp = nonProxyHostProp.substring(0, nonProxyHostProp.length() - 1);
            }
            LOGGER.info("http.nonProxyHosts value: {}", nonProxyHostProp);
            for (String token : nonProxyHostProp.split("\\|")) {
                String str = token.trim();
                str = str.replace("*", "[\\w-]*");
                Pattern pattern = Pattern.compile(str);
                Matcher matcher = pattern.matcher(host);
                if (matcher.matches()) {
                    LOGGER.info("Non proxy host matched for: {}", str);
                    isNonProxyHost = true;
                    break;
                }
            }
        }
        return isNonProxyHost;
    }

    /**
     * @param request
     * @param response
     * @throws IOException
     */
    void onInit(HttpServletRequest request, HttpServletResponse response, URL url)
            throws IOException {
        // A browser navigation has no legitimate reason to render an upstream document here.
        // Browsers send Fetch Metadata only over HTTPS and to localhost, so this backs up the
        // sandbox CSP set on every proxied response rather than replacing it.
        if ("navigate".equalsIgnoreCase(request.getHeader("Sec-Fetch-Mode"))) {
            throw new HttpErrorException(403, "Browser navigation to proxy is not allowed");
        }
        // A forwarding proxy resolves the requested target on its own side, so the connection
        // check sees only the proxy. Check the target here as well when it resolves locally.
        boolean forwarded = !isNonProxyHost(url.getHost())
                && (("http".equalsIgnoreCase(url.getProtocol()) && outboundHttpProxy != null)
                || ("https".equalsIgnoreCase(url.getProtocol()) && outboundHttpsProxy != null));
        if (forwarded) {
            if (!allowForwardProxy) {
                throw new HttpErrorException(403, "Requests through the outbound proxy are disabled");
            }
            try {
                destinationPolicy.checkForwardedDestination(url.getHost(), url.getPort());
            } catch (PrivateAddressDnsResolver.BlockedDestinationException blocked) {
                LOGGER.warn(blocked.getMessage());
                throw new HttpErrorException(403, "Private destination is not allowed");
            }
        }
        for (ProxyCallback callback : callbacks) {
            callback.onRequest(request, response, url);
        }
    }

    /**
     * @param method
     * @throws IOException
     */
    void onRemoteResponse(HttpUriRequestBase method, ClassicHttpResponse response) throws IOException {
        for (ProxyCallback callback : callbacks) {
            callback.onRemoteResponse(method, response);
        }
    }

    /**
     * @throws IOException
     */
    void onFinish() throws IOException {
        for (ProxyCallback callback : callbacks) {
            callback.onFinish();
        }
    }

    /**
     * Performs an HTTP GET request
     *
     * @param httpServletRequest  The {@link HttpServletRequest} object passed in by the servlet engine representing the client request to be proxied
     * @param httpServletResponse The {@link HttpServletResponse} object by which we can send a proxied response to the client
     */
    @Override
    public void doGet(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse)
            throws IOException, ServletException {

        try {

            URL url = null;
            String user = null;
            String password = null;

            Set<Map.Entry<String, String[]>> entrySet = httpServletRequest.getParameterMap().entrySet();

            for (Map.Entry<String, String[]> header : entrySet) {
                String key = header.getKey();
                String value = header.getValue()[0];

                if ("user".equals(key)) {
                    user = value;
                } else if ("password".equals(key)) {
                    password = value;
                } else if ("url".equals(key)) {
                    url = Utils.buildURL(value);
                }
            }

            if (url != null) {
                if (!isHostWhitelisted(url)) {
                    throw new HttpErrorException(403, "Target host is not allowed");
                }

                onInit(httpServletRequest, httpServletResponse, url);

                // //////////////////////////////
                // Create a GET request
                // //////////////////////////////

                HttpGet getMethodProxyRequest = getGetMethod(url);

                // //////////////////////////////
                // Forward the request headers
                // //////////////////////////////

                setProxyRequestHeaders(url, httpServletRequest, getMethodProxyRequest);

                // //////////////////////////////
                // Execute the proxy request
                // //////////////////////////////

                this.executeProxyRequest(getMethodProxyRequest, httpServletRequest,
                        httpServletResponse, user, password);
            }

        } catch (HttpErrorException ex) {
            httpServletResponse.sendError(ex.getCode(), ex.getMessage());
        } finally {
            onFinish();
        }
    }

    private boolean isHostWhitelisted(URL url) {
        if (url == null || url.getHost() == null) {
            return false;
        }
        if (whiteListHosts == null || whiteListHosts.isEmpty()) {
            return false;
        }
        return whiteListHosts.contains(url.getHost().trim().toLowerCase(Locale.ROOT));
    }

    protected HttpGet getGetMethod(URL url) {
        return new HttpGet(url.toExternalForm());
    }

    /**
     * Performs an HTTP POST request
     *
     * @param httpServletRequest  The {@link HttpServletRequest} object passed in by the servlet engine representing the client request to be proxied
     * @param httpServletResponse The {@link HttpServletResponse} object by which we can send a proxied response to the client
     */
    @Override
    public void doPost(HttpServletRequest httpServletRequest,
                       HttpServletResponse httpServletResponse) throws IOException, ServletException {
        try {

            URL url = null;
            String user = null;
            String password = null;
            //Parse the queryString to not read the request body calling getParameter from httpServletRequest
            // so the method can simply forward the request body
            Map<String, String> pars = splitQuery(httpServletRequest.getQueryString());

            for (String key : pars.keySet()) {

                String value = pars.get(key);

                if ("user".equals(key)) {
                    user = value;
                } else if ("password".equals(key)) {
                    password = value;
                } else if ("url".equals(key)) {
                    url = Utils.buildURL(value);
                }
            }

            if (url != null) {

                onInit(httpServletRequest, httpServletResponse, url);

                // /////////////////////////////////
                // Create a standard POST request
                // /////////////////////////////////

                HttpPost postMethodProxyRequest = getPostMethod(url);

                // //////////////////////////////
                // Forward the request headers
                // //////////////////////////////

                setProxyRequestHeaders(url, httpServletRequest, postMethodProxyRequest);


                // //////////////////////////////////////////////////
                // Check if this is a mulitpart (file upload) POST
                // //////////////////////////////////////////////////

                if (JakartaServletFileUpload.isMultipartContent(httpServletRequest)) {
                    this.handleMultipart(postMethodProxyRequest, httpServletRequest);
                } else {
                    this.handleStandard(postMethodProxyRequest, httpServletRequest);
                }

                // ///////////////////////////////
                // Execute the proxy request
                // ///////////////////////////////
                this.executeProxyRequest(postMethodProxyRequest, httpServletRequest,
                        httpServletResponse, user, password);

            }

        } catch (HttpErrorException ex) {
            httpServletResponse.sendError(ex.getCode(), ex.getMessage());
        } finally {
            onFinish();
        }
    }

    protected HttpPost getPostMethod(URL url) {
        return new HttpPost(url.toExternalForm());
    }

    /**
     * Performs an HTTP PUT request
     *
     * @param httpServletRequest  The {@link HttpServletRequest} object passed in by the servlet engine representing the client request to be proxied
     * @param httpServletResponse The {@link HttpServletResponse} object by which we can send a proxied response to the client
     */
    @Override
    public void doPut(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse)
            throws IOException, ServletException {

        try {

            URL url = null;
            String user = null;
            String password = null;
            //Parse the queryString to not read the request body calling getParameter from httpServletRequest
            // so the method can simply forward the request body
            Map<String, String> pars = splitQuery(httpServletRequest.getQueryString());

            for (String key : pars.keySet()) {

                String value = pars.get(key);

                if ("user".equals(key)) {
                    user = value;
                } else if ("password".equals(key)) {
                    password = value;
                } else if ("url".equals(key)) {
                    url = Utils.buildAndValidateURL(value);
                }
            }
            if (url != null) {

                onInit(httpServletRequest, httpServletResponse, url);

                // ////////////////////////////////
                // Create a standard PUT request
                // ////////////////////////////////

                HttpPut putMethodProxyRequest = new HttpPut(url.toExternalForm());

                // //////////////////////////////
                // Forward the request headers
                // //////////////////////////////

                setProxyRequestHeaders(url, httpServletRequest, putMethodProxyRequest);

                // //////////////////////////////////////////////////
                // Check if this is a mulitpart (file upload) PUT
                // //////////////////////////////////////////////////

                if (JakartaServletFileUpload.isMultipartContent(httpServletRequest)) {
                    this.handleMultipart(putMethodProxyRequest, httpServletRequest);
                } else {
                    this.handleStandard(putMethodProxyRequest, httpServletRequest);
                }

                // ////////////////////////////////
                // Execute the proxy request
                // ////////////////////////////////

                this.executeProxyRequest(putMethodProxyRequest, httpServletRequest,
                        httpServletResponse, user, password);

            }

        } catch (HttpErrorException ex) {
            httpServletResponse.sendError(ex.getCode(), ex.getMessage());
        } finally {
            onFinish();
        }

    }

    /**
     * Performs an HTTP DELETE request
     *
     * @param httpServletRequest  The {@link HttpServletRequest} object passed in by the servlet engine representing the client request to be proxied
     * @param httpServletResponse The {@link HttpServletResponse} object by which we can send a proxied response to the client
     */
    @Override
    public void doDelete(HttpServletRequest httpServletRequest,
                         HttpServletResponse httpServletResponse) throws IOException, ServletException {

        try {
            URL url = null;
            String user = null;
            String password = null;

            //Parse the queryString to not read the request body calling getParameter from httpServletRequest
            Map<String, String> pars = splitQuery(httpServletRequest.getQueryString());

            for (String key : pars.keySet()) {

                String value = pars.get(key);

                if ("user".equals(key)) {
                    user = value;
                } else if ("password".equals(key)) {
                    password = value;
                } else if ("url".equals(key)) {
                    url = Utils.buildURL(value);
                }
            }

            if (url != null) {
                if (!isUrlAllowed(url)) {
                    throw new HttpErrorException(403, "Target URL is not allowed");
                }

                onInit(httpServletRequest, httpServletResponse, url);

                // ////////////////////////////////
                // Create a standard DELETE request
                // ////////////////////////////////

                HttpDelete deleteMethodProxyRequest = new HttpDelete(url.toExternalForm());

                // //////////////////////////////
                // Forward the request headers
                // //////////////////////////////

                setProxyRequestHeaders(url, httpServletRequest, deleteMethodProxyRequest);

                // ////////////////////////////////
                // Execute the proxy request
                // ////////////////////////////////

                this.executeProxyRequest(deleteMethodProxyRequest, httpServletRequest,
                        httpServletResponse, user, password);

            }

        } catch (HttpErrorException ex) {
            httpServletResponse.sendError(ex.getCode(), ex.getMessage());
        } finally {
            onFinish();
        }
    }

    /**
     * Sets up the given {@link HttpUriRequestBase} to send the same multipart POST data as was sent in the given {@link HttpServletRequest}
     *
     * @param methodProxyRequest The {@link HttpUriRequestBase} that we are configuring to send a multipart POST request
     * @param httpServletRequest     The {@link HttpServletRequest} that contains the mutlipart POST data to be sent via the {@link HttpUriRequestBase}
     * @throws IOException
     */
    private void handleMultipart(HttpUriRequestBase methodProxyRequest,
                                 HttpServletRequest httpServletRequest) throws ServletException, IOException {

        // ////////////////////////////////////////////
        // Create a factory for disk-based file items
        // ////////////////////////////////////////////

        DiskFileItemFactory diskFileItemFactory = DiskFileItemFactory.builder()
                .setBufferSize(this.getMaxFileUploadSize())
                .setPath(Utils.DEFAULT_FILE_UPLOAD_TEMP_DIRECTORY.toPath())
                .get();

        // //////////////////////////////////
        // Create a new file upload handler
        // //////////////////////////////////

        JakartaServletFileUpload servletFileUpload = new JakartaServletFileUpload(diskFileItemFactory);

        // //////////////////////////
        // Parse the request
        // //////////////////////////

        try {

            // /////////////////////////////////////
            // Get the multipart items as a list
            // /////////////////////////////////////

            List<FileItem> listFileItems = servletFileUpload
                    .parseRequest(httpServletRequest);

            // /////////////////////////////////////////
            // Iterate the multipart items list
            // /////////////////////////////////////////

            MultipartEntityBuilder multipartEntityBuilder = MultipartEntityBuilder.create();

            for (FileItem fileItemCurrent : listFileItems) {


                // If the current Item is form field
                if (fileItemCurrent.isFormField()) {

                    multipartEntityBuilder = multipartEntityBuilder.addTextBody(fileItemCurrent.getFieldName(), fileItemCurrent.getString());

                } else {
                    // If the current Item is file upload
                    multipartEntityBuilder = multipartEntityBuilder.addPart("file", (ContentBody) fileItemCurrent);
                }
            }

            HttpEntity entity = multipartEntityBuilder.build();

            if (methodProxyRequest instanceof HttpPost httpPost) {
                httpPost.setEntity(entity);
            } else if (methodProxyRequest instanceof HttpPut httpPut) {
                httpPut.setEntity(entity);
            }

            // ////////////////////////////////////////////////////////////////////////
            // The current content-type header (received from the client) IS of
            // type "multipart/form-data", but the content-type header also
            // contains the chunk boundary string of the chunks. Currently, this
            // header is using the boundary of the client request, since we
            // blindly copied all headers from the client request to the proxy
            // request. However, we are creating a new request with a new chunk
            // boundary string, so it is necessary that we re-set the
            // content-type string to reflect the new chunk boundary string
            // ////////////////////////////////////////////////////////////////////////

            String contentType = entity.getContentType();
            if (contentType != null) {
                methodProxyRequest.setHeader("Content-Type", contentType);
            }

        } catch (FileUploadException fileUploadException) {
            throw new ServletException(fileUploadException);
        }
    }

    /**
     * Sets up the given {@link PostMethod} to send the same standard POST data as was sent in the given {@link HttpServletRequest}
     *
     * @param postMethodProxyRequest The {@link PostMethod} that we are configuring to send a standard POST request
     * @param httpServletRequest     The {@link HttpServletRequest} that contains the POST data to be sent via the {@link PostMethod}
     * @throws IOException
     */
    private void handleStandard(HttpUriRequestBase methodProxyRequest,
                                HttpServletRequest httpServletRequest) throws IOException {
        String incomingCT = httpServletRequest.getContentType();
        ContentType contentType = incomingCT != null
                ? ContentType.parse(incomingCT)
                : ContentType.DEFAULT_BINARY;

        if (methodProxyRequest instanceof HttpPost httpPost) {
            httpPost.setEntity(new InputStreamEntity(httpServletRequest.getInputStream(), contentType));
        } else if (methodProxyRequest instanceof HttpPut httpPut) {
            httpPut.setEntity(new InputStreamEntity(httpServletRequest.getInputStream(), contentType));
        }
    }

    /**
     * Executes the {@link HttpMethod} passed in and sends the proxy response back to the client via the given {@link HttpServletResponse}
     *
     * @param httpMethodProxyRequest An object representing the proxy request to be made
     * @param httpServletResponse    An object by which we can send the proxied response back to the client
     * @param digest
     */
    private void executeProxyRequest(HttpUriRequestBase httpMethodProxyRequest,
                                     HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse,
                                     String user, String password) {

        HttpClientContext context =
                requestContext(httpMethodProxyRequest, user, password, outboundProxies());

        try {
            httpClient.execute(httpMethodProxyRequest, context, response -> {

                onRemoteResponse(httpMethodProxyRequest, response);

                // ////////////////////////////////////////////////////////////////////////////////
                // Check if the proxy response is a redirect
                // The following code is adapted from
                // org.tigris.noodle.filters.CheckForRedirect
                // Hooray for open source software
                // ////////////////////////////////////////////////////////////////////////////////

                int statusCode = getStatusCode(response);
                if ((statusCode >= HttpServletResponse.SC_MULTIPLE_CHOICES /* 300 */
                        && statusCode <= HttpServletResponse.SC_SEE_OTHER /* 303 */)
                        || statusCode == HttpServletResponse.SC_TEMPORARY_REDIRECT /* 307 */
                        || statusCode == 308 /* Permanent Redirect (no servlet-api constant) */) {

                    String stringStatusCode = Integer.toString(statusCode);
                    var locationHeader = response.getFirstHeader(Utils.LOCATION_HEADER);
                    String stringLocation = locationHeader != null ? locationHeader.getValue() : null;

                    if (stringLocation == null) {
                        throw new IOException("Received status code: " + stringStatusCode
                                + " but no " + Utils.LOCATION_HEADER
                                + " header was found in the response");
                    }

                    // /////////////////////////////////////////////
                    // Modify the redirect to go to this proxy
                    // servlet rather that the proxied host
                    // /////////////////////////////////////////////

                    String absoluteLocation;
                    try {
                        absoluteLocation = httpMethodProxyRequest.getUri().resolve(stringLocation).toString();
                    } catch (URISyntaxException | IllegalArgumentException invalidLocation) {
                        throw new IOException("Invalid upstream redirect Location", invalidLocation);
                    }
                    // Point the redirect back at this proxy with the context path the application is
                    // deployed under: the request's own context path follows what the client sent
                    // (Tomcat keeps path parameters in it). MapStore calls the proxy as
                    // ".../proxy/?url=", so a trailing slash is kept; other path info is not used.
                    // A path-relative Location keeps the scheme and host the browser used, which a
                    // TLS front end hides from us, and the upstream status keeps 307/308 requests
                    // from being repeated as GET.
                    String selfPath = getServletContext().getContextPath() + "/proxy";
                    if ("/".equals(httpServletRequest.getPathInfo())) {
                        selfPath += "/";
                    }
                    String redirectURL = selfPath + "?url="
                            + URLEncoder.encode(absoluteLocation, StandardCharsets.UTF_8);
                    httpServletResponse.setStatus(statusCode);
                    httpServletResponse.setHeader(Utils.LOCATION_HEADER, redirectURL);
                    LOGGER.info("redirected to: {}", redirectURL);
                    return null;

                } else if (statusCode == HttpServletResponse.SC_NOT_MODIFIED) {

                    // ///////////////////////////////////////////////////////////////
                    // 304 needs special handling. See:
                    // http://www.ics.uci.edu/pub/ietf/http/rfc1945.html#Code304
                    // We get a 304 whenever passed an 'If-Modified-Since'
                    // header and the data on disk has not changed; server
                    // responds w/ a 304 saying I'm not going to send the
                    // body because the file has not changed.
                    // ///////////////////////////////////////////////////////////////

                    httpServletResponse.setIntHeader(Utils.CONTENT_LENGTH_HEADER_NAME, 0);
                    httpServletResponse.setStatus(HttpServletResponse.SC_NOT_MODIFIED);
                    // The browser reuses its cached copy, so the 304 carries the same policy.
                    applyContentPolicy(httpServletResponse);
                    return null;
                }

                // /////////////////////////////////////////////
                // Pass the response code back to the client
                // /////////////////////////////////////////////

                httpServletResponse.setStatus(statusCode);

                // /////////////////////////////////////////////
                // Pass response headers back to the client
                // /////////////////////////////////////////////

                // Headers such as Set-Cookie would act on this application's origin, not on the
                // remote host that sent them.
                Set<String> droppedHeaders = proxyConfig.getResponseHeaderBlacklist();
                var headerIt = response.headerIterator();
                while (headerIt.hasNext()) {
                    var header = headerIt.next();

                    // /////////////////////////
                    // Skip GZIP Responses
                    // /////////////////////////

                    if (header.getName().equalsIgnoreCase(Utils.HTTP_HEADER_ACCEPT_ENCODING)
                            && header.getValue().toLowerCase().contains("gzip"))
                        continue;
                    else if (header.getName().equalsIgnoreCase(Utils.HTTP_HEADER_CONTENT_ENCODING)
                            && header.getValue().toLowerCase().contains("gzip"))
                        continue;
                    else if (header.getName().equalsIgnoreCase(Utils.HTTP_HEADER_TRANSFER_ENCODING))
                        continue;
                    else if (droppedHeaders.contains(header.getName().toLowerCase(Locale.ROOT)))
                        continue;
                    else
                        httpServletResponse.setHeader(header.getName(), header.getValue());
                }

                // Upstream headers must not relax the policy on documents served by our origin.
                applyContentPolicy(httpServletResponse);

                // ///////////////////////////////////
                // Send the content to the client
                // ///////////////////////////////////

                try (InputStream inputStreamServerResponse = response.getEntity().getContent()) {
                    if (inputStreamServerResponse != null) {
                        byte[] b = new byte[proxyConfig.getDefaultStreamByteSize()];

                        int read;
                        ServletOutputStream out = httpServletResponse.getOutputStream();
                        while ((read = inputStreamServerResponse.read(b)) > 0) {
                            out.write(b, 0, read);
                        }
                    }
                }

                return null;
            });
        } catch (Exception e) {
            int status;
            String message;
            PrivateAddressDnsResolver.BlockedDestinationException blocked = blockedDestination(e);
            HttpErrorException refused = causeOf(e, HttpErrorException.class);
            if (blocked != null) {
                // An expected outcome of the destination policy, not an error.
                LOGGER.warn(blocked.getMessage());
                status = 403;
                message = "Private destination is not allowed";
            } else if (refused != null) {
                // A check on the remote response, such as the content type, refused it.
                LOGGER.warn(refused.getMessage());
                status = refused.getCode();
                message = refused.getMessage();
            } else if (causeOf(e, InterruptedIOException.class) != null) {
                LOGGER.error("Timed out waiting for the remote host", e);
                status = HttpServletResponse.SC_GATEWAY_TIMEOUT;
                message = "The remote host did not answer in time";
            } else {
                LOGGER.error("Error executing HTTP method", e);
                status = HttpServletResponse.SC_BAD_GATEWAY;
                message = "Could not get a response from the remote host";
            }
            // Without a status the client would receive an empty 200.
            if (!httpServletResponse.isCommitted()) {
                try {
                    httpServletResponse.sendError(status, message);
                } catch (IOException responseError) {
                    LOGGER.error("Could not send the proxy error response", responseError);
                }
            }
        }
    }

    /**
     * Proxied content is served from this application's origin: sandbox it and stop the browser
     * from guessing a more powerful content type than the one declared.
     */
    private static void applyContentPolicy(HttpServletResponse response) {
        response.setHeader("Content-Security-Policy", "sandbox; default-src 'none'");
        response.setHeader("X-Content-Type-Options", "nosniff");
    }

    private static <T extends Throwable> T causeOf(Throwable error, Class<T> type) {
        for (Throwable cause = error; cause != null; cause = cause.getCause()) {
            if (type.isInstance(cause)) {
                return type.cast(cause);
            }
        }
        return null;
    }

    private static PrivateAddressDnsResolver.BlockedDestinationException blockedDestination(Throwable error) {
        for (Throwable cause = error; cause != null; cause = cause.getCause()) {
            if (cause instanceof PrivateAddressDnsResolver.BlockedDestinationException blocked) {
                return blocked;
            }
        }
        return null;
    }

    int getStatusCode(ClassicHttpResponse response) {
        if (response != null) {
            return response.getCode();
        } else {
            return -1;
        }
    }

    /**
     * Credentials the client uses when a request carries none of its own: the JVM settings
     * (java.net.Authenticator, http(s).proxyUser and http(s).proxyPassword), which is how an
     * outbound proxy is usually authenticated.
     */
    private static final CredentialsProvider SYSTEM_CREDENTIALS = new SystemDefaultCredentialsProvider();

    /**
     * Builds the execution context of a single proxied request. Credentials passed with the
     * request apply to that request only, and only to the origin it targets, so they are never
     * reused for another user or another host. Any other challenge on the same request, such as
     * one from the outbound proxy, is still answered from the JVM settings.
     *
     * <p>The credentials are sent with the first request instead of after a 401 challenge: the
     * body of a POST or PUT is streamed from the client and cannot be sent a second time.
     */
    static HttpClientContext requestContext(HttpUriRequestBase request, String user, String password) {
        return requestContext(request, user, password, Collections.emptyList());
    }

    /**
     * As {@link #requestContext(HttpUriRequestBase, String, String)}, and when the JVM settings hold
     * credentials for one of the outbound proxies, they are also sent with the first request to that
     * proxy: a 407 challenge would otherwise need the streamed POST or PUT body a second time. The
     * client only uses that entry when the request is routed through the proxy.
     */
    static HttpClientContext requestContext(
            HttpUriRequestBase request, String user, String password, Collection<HttpHost> outboundProxies) {
        HttpClientContext context = HttpClientContext.create();
        BasicAuthCache preemptive = new BasicAuthCache();
        boolean anyPreemptive = false;
        for (HttpHost proxy : outboundProxies) {
            Credentials proxyCredentials = SYSTEM_CREDENTIALS.getCredentials(new AuthScope(proxy), context);
            if (proxyCredentials != null) {
                BasicScheme proxyScheme = new BasicScheme();
                proxyScheme.initPreemptive(proxyCredentials);
                preemptive.put(proxy, proxyScheme);
                anyPreemptive = true;
            }
        }
        if (user != null && password != null) {
            HttpHost origin = targetOrigin(request);
            UsernamePasswordCredentials requestCredentials =
                    new UsernamePasswordCredentials(user, password.toCharArray());
            BasicCredentialsProvider forTarget = new BasicCredentialsProvider();
            forTarget.setCredentials(new AuthScope(origin), requestCredentials);
            context.setCredentialsProvider((scope, httpContext) -> {
                Credentials credentials = forTarget.getCredentials(scope, httpContext);
                return credentials != null ? credentials : SYSTEM_CREDENTIALS.getCredentials(scope, httpContext);
            });

            BasicScheme basic = new BasicScheme();
            basic.initPreemptive(requestCredentials);
            preemptive.put(origin, basic);
            anyPreemptive = true;
        }
        if (anyPreemptive) {
            context.setAuthCache(preemptive);
        }
        return context;
    }

    /** The configured outbound proxies (http.proxyHost and https.proxyHost), if any. */
    private List<HttpHost> outboundProxies() {
        List<HttpHost> proxies = new ArrayList<>(2);
        if (outboundHttpProxy != null) proxies.add(outboundHttpProxy);
        if (outboundHttpsProxy != null && !outboundHttpsProxy.equals(outboundHttpProxy)) proxies.add(outboundHttpsProxy);
        return proxies;
    }

    private static HttpHost targetOrigin(HttpUriRequestBase request) {
        try {
            java.net.URI uri = request.getUri();
            String scheme = uri.getScheme() == null ? "http" : uri.getScheme().toLowerCase(Locale.ROOT);
            int port = uri.getPort() != -1 ? uri.getPort() : ("https".equals(scheme) ? 443 : 80);
            return new HttpHost(scheme, uri.getHost(), port);
        } catch (java.net.URISyntaxException e) {
            throw new IllegalArgumentException("Invalid proxy target", e);
        }
    }

    /**
     * Retrieves all of the headers from the servlet request and sets them on the proxy request
     *
     * @param httpServletRequest     The request object representing the client's request to the servlet engine
     * @param httpMethodProxyRequest The request that we are about to send to the proxy host
     * @return ProxyInfo
     */
    private ProxyInfo setProxyRequestHeaders(URL url, HttpServletRequest httpServletRequest,
                                             HttpUriRequestBase httpMethodProxyRequest) {

        final String proxyHost = url.getHost();
        final int proxyPort = url.getPort();
        final String proxyPath = url.getPath();
        final ProxyInfo proxyInfo = new ProxyInfo(proxyHost, proxyPath, proxyPort);

        // ////////////////////////////////////////
        // Get an Enumeration of all the header
        // names sent by the client.
        // ////////////////////////////////////////

        // ////////////////////////////////////////
        // Load header whitelist/blacklist for
        // filtering forwarded request headers.
        // ////////////////////////////////////////

        Set<String> headerWhitelist = proxyConfig.getRequestHeaderWhitelist();
        Set<String> headerBlacklist = proxyConfig.getRequestHeaderBlacklist();

        for (String stringHeaderName : Collections.list(httpServletRequest.getHeaderNames())) {

            if (stringHeaderName.equalsIgnoreCase(Utils.CONTENT_LENGTH_HEADER_NAME))
                continue;

            // ////////////////////////////////////////
            // Apply header blacklist: always reject
            // ////////////////////////////////////////

            if (headerBlacklist != null && !headerBlacklist.isEmpty()) {
                if (headerBlacklist.contains(stringHeaderName.toLowerCase())) {
                    continue;
                }
            }

            // ////////////////////////////////////////
            // Apply header whitelist: if set, only
            // allow headers in the whitelist
            // ////////////////////////////////////////

            if (headerWhitelist != null && !headerWhitelist.isEmpty()) {
                if (!headerWhitelist.contains(stringHeaderName.toLowerCase())) {
                    continue;
                }
            }

            // ////////////////////////////////////////////////////////////////////////
            // As per the Java Servlet API 2.5 documentation:
            // Some headers, such as Accept-Language can be sent by clients
            // as several headers each with a different value rather than
            // sending the header as a comma separated list.
            // Thus, we get an Enumeration of the header values sent by the client
            // ////////////////////////////////////////////////////////////////////////

            for (String stringHeaderValue : Collections.list(httpServletRequest.getHeaders(stringHeaderName))) {

                // ////////////////////////////////////////////////////////////////
                // In case the proxy host is running multiple virtual servers,
                // rewrite the Host header to ensure that we get content from
                // the correct virtual server
                // ////////////////////////////////////////////////////////////////

                if (stringHeaderName.equalsIgnoreCase(Utils.HOST_HEADER_NAME)) {
                    stringHeaderValue = Utils.getProxyHostAndPort(proxyInfo);
                }

                // ////////////////////////
                // Skip GZIP Responses
                // ////////////////////////

                if (stringHeaderName.equalsIgnoreCase(Utils.HTTP_HEADER_ACCEPT_ENCODING)
                        && stringHeaderValue.toLowerCase().contains("gzip"))
                    continue;
                if (stringHeaderName.equalsIgnoreCase(Utils.HTTP_HEADER_CONTENT_ENCODING)
                        && stringHeaderValue.toLowerCase().contains("gzip"))
                    continue;
                if (stringHeaderName.equalsIgnoreCase(Utils.HTTP_HEADER_TRANSFER_ENCODING))
                    continue;

                // /////////////////////////////////////////////
                // Set the same header on the proxy request
                // /////////////////////////////////////////////

                httpMethodProxyRequest.setHeader(stringHeaderName, stringHeaderValue);

            }
        }

        return proxyInfo;
    }

    private boolean isUrlAllowed(URL url) {
        if (url == null || url.getHost() == null) {
            return false;
        }
        if (whiteListHosts == null || whiteListHosts.isEmpty()) {
            return false;
        }
        String host = url.getHost().trim().toLowerCase(Locale.ROOT);
        return whiteListHosts.contains(host);
    }

    private Map<String, String> splitQuery(String query) {
        Map<String, String> query_pairs = new LinkedHashMap<>();

        for (String pair : query.split("&")) {
            int idx = pair.indexOf("=");
            query_pairs.put(
                URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8),
                URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8)
            );
        }
        return query_pairs;
    }

    /**
     * @return int the maximum file upload size.
     */
    public int getMaxFileUploadSize() {
        return Utils.DEFAULT_MAX_FILE_UPLOAD_SIZE;
    }

    /**
     * @return the client
     */
    public CloseableHttpClient getHttpClient() {
        return httpClient;
    }

    /**
     * set the httpClient
     *
     * @param httpClient the client to set
     */
    public void setHttpClient(CloseableHttpClient httpClient) {
        this.httpClient = httpClient;
    }
}
