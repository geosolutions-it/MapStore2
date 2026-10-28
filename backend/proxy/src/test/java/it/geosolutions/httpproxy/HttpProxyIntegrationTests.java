package it.geosolutions.httpproxy;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;
import com.github.tomakehurst.wiremock.junit5.WireMockExtension;
import org.eclipse.jetty.ee10.webapp.WebAppContext;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.classic.methods.HttpPut;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.junit.jupiter.api.Assertions.*;

class HttpProxyIntegrationTests {

    private final int localPort = 8080;

    private static final org.slf4j.Logger LOGGER = LoggerFactory.getLogger(HttpProxyIntegrationTests.class);

    @RegisterExtension
    static WireMockExtension wireMockRule = WireMockExtension.newInstance()
            .options(WireMockConfiguration.options().dynamicPort())
            .build();

    @RegisterExtension
    static WireMockExtension wireMockRule1 = WireMockExtension.newInstance()
            .options(WireMockConfiguration.options().dynamicPort())
            .build();

    static WireMockServer wireMockServer;

    static Server jettyServer = null;

    private static String proxyHost;
    private static String proxyPort;

    @BeforeAll
    static void startHttpProxyServer() {

        try {
            // store system proxy config
            storeProxyConfig();

            wireMockServer = new WireMockServer(WireMockConfiguration.wireMockConfig().dynamicPort());
            wireMockServer.start();

            jettyServer = new Server();
            ServerConnector connector = new ServerConnector(jettyServer);
            connector.setPort(8080);
            jettyServer.addConnector(connector);

            WebAppContext webapp = new WebAppContext();
            webapp.setContextPath("/http_proxy");
            webapp.setWar(new File("src/main/webapp").getAbsolutePath());
            webapp.setTempDirectory(new File("target/work"));
            jettyServer.setHandler(webapp);

            jettyServer.start();

        } catch (Exception e1) {
            LOGGER.error("Could not start HTTP Proxy Server: {}", e1.getMessage(), e1);
            if (jettyServer != null) {
                try {
                    jettyServer.stop();
                } catch (Exception e2) {
                    LOGGER.error("Could not stop HTTP Proxy Server: {}", e2.getMessage(), e2);
                }
            }
        }

    }

    /**
     * store the system proxy host and port values
     */
    private static void storeProxyConfig() {
        proxyHost = System.getProperty("http.proxyHost");
        proxyPort = System.getProperty("http.proxyPort");
    }

    /**
     * Validates that HTTP GET requests is correctly handled by the HTTP Proxy
     */
    @Test
    void testGETUsingWireMock() throws IOException {

        wireMockRule.stubFor(
                get(urlEqualTo("/geostore/users"))
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader("Content-Type", "text/xml")
                                        .withBody("<response>Some content</response>")));

        String url = "http://localhost:" + wireMockRule.getPort() + "/geostore/users";
        String proxyURL = "http://localhost:" + localPort + "/http_proxy/proxy?url=" + url;
        HttpGet httpGet = new HttpGet(proxyURL);
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            httpClient.execute(httpGet, response -> {
                assertEquals(200, response.getCode());
                return null;
            });
            wireMockRule.verify(getRequestedFor(urlEqualTo("/geostore/users")));
        }
    }

    @Test
    void testRejectsLoopbackDestinationByDefault() throws IOException {
        wireMockRule.stubFor(get(urlEqualTo("/geostore/canary"))
                .willReturn(aResponse().withStatus(200).withBody("canary")));

        String target = "http://127.0.0.1:" + wireMockRule.getPort() + "/geostore/canary";
        String proxyURL = "http://localhost:" + localPort + "/http_proxy/proxy?url="
                + URLEncoder.encode(target, StandardCharsets.UTF_8);
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            client.execute(new HttpGet(proxyURL), response -> {
                assertEquals(403, response.getCode());
                return null;
            });
        }
        wireMockRule.verify(0, getRequestedFor(urlEqualTo("/geostore/canary")));
    }

    @Test
    void testRedirectCannotReachBlockedLoopbackDestination() throws IOException {
        String target = "http://127.0.0.1:" + wireMockRule.getPort() + "/geostore/canary";
        wireMockRule.stubFor(get(urlEqualTo("/geostore/redirect"))
                .willReturn(aResponse().withStatus(302).withHeader("Location", target)));
        wireMockRule.stubFor(get(urlEqualTo("/geostore/canary"))
                .willReturn(aResponse().withStatus(200).withBody("canary")));

        String allowedTarget = "http://localhost:" + wireMockRule.getPort() + "/geostore/redirect";
        String proxyURL = "http://localhost:" + localPort + "/http_proxy/proxy?url="
                + URLEncoder.encode(allowedTarget, StandardCharsets.UTF_8);
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            client.execute(new HttpGet(proxyURL), response -> {
                assertEquals(403, response.getCode());
                return null;
            });
        }
        wireMockRule.verify(0, getRequestedFor(urlEqualTo("/geostore/canary")));
    }

    @Test
    void testProxiedHtmlCannotExecuteOnApplicationOrigin() throws IOException {
        wireMockRule.stubFor(get(urlEqualTo("/geostore/canary"))
                .willReturn(aResponse().withStatus(200)
                        .withHeader("Content-Type", "text/html")
                        .withHeader("Content-Security-Policy", "default-src *")
                        .withBody("<p>canary</p>")));

        String target = "http://localhost:" + wireMockRule.getPort() + "/geostore/canary";
        String proxyURL = "http://localhost:" + localPort + "/http_proxy/proxy?url="
                + URLEncoder.encode(target, StandardCharsets.UTF_8);
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            client.execute(new HttpGet(proxyURL), response -> {
                assertEquals(200, response.getCode());
                assertEquals("sandbox; default-src 'none'",
                        response.getFirstHeader("Content-Security-Policy").getValue());
                assertEquals("nosniff", response.getFirstHeader("X-Content-Type-Options").getValue());
                return null;
            });
        }
    }

    @Test
    void testRelativeRedirectStillReachesAllowedService() throws IOException {
        wireMockRule.stubFor(get(urlEqualTo("/geostore/from"))
                .willReturn(aResponse().withStatus(302).withHeader("Location", "next")));
        wireMockRule.stubFor(get(urlEqualTo("/geostore/next"))
                .willReturn(aResponse().withStatus(200).withBody("canary")));

        String target = "http://localhost:" + wireMockRule.getPort() + "/geostore/from";
        String proxyURL = "http://localhost:" + localPort + "/http_proxy/proxy?url="
                + URLEncoder.encode(target, StandardCharsets.UTF_8);
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            client.execute(new HttpGet(proxyURL), response -> {
                assertEquals(200, response.getCode());
                return null;
            });
        }
        wireMockRule.verify(getRequestedFor(urlEqualTo("/geostore/next")));
    }

    @Test
    void testBrowserNavigationIsRefusedButFetchIsProxied() throws IOException {
        wireMockRule.stubFor(get(urlEqualTo("/geostore/page"))
                .willReturn(aResponse().withStatus(200).withBody("canary")));

        String target = "http://localhost:" + wireMockRule.getPort() + "/geostore/page";
        String proxyURL = "http://localhost:" + localPort + "/http_proxy/proxy?url="
                + URLEncoder.encode(target, StandardCharsets.UTF_8);
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpGet navigation = new HttpGet(proxyURL);
            navigation.setHeader("Sec-Fetch-Mode", "navigate");
            client.execute(navigation, response -> {
                assertEquals(403, response.getCode());
                return null;
            });
            wireMockRule.verify(0, getRequestedFor(urlEqualTo("/geostore/page")));

            HttpGet fetch = new HttpGet(proxyURL);
            fetch.setHeader("Sec-Fetch-Mode", "cors");
            client.execute(fetch, response -> {
                assertEquals(200, response.getCode());
                return null;
            });
        }
    }

    @Test
    void testUpstreamRedirectIsReturnedToTheClient() throws IOException {
        wireMockRule.stubFor(get(urlEqualTo("/geostore/moved"))
                .willReturn(aResponse().withStatus(302).withHeader("Location", "/geostore/target")));
        wireMockRule.stubFor(get(urlEqualTo("/geostore/target"))
                .willReturn(aResponse().withStatus(200).withBody("canary")));

        String target = "http://localhost:" + wireMockRule.getPort() + "/geostore/moved";
        String proxyURL = "http://localhost:" + localPort + "/http_proxy/proxy?url="
                + URLEncoder.encode(target, StandardCharsets.UTF_8);
        try (CloseableHttpClient client = HttpClients.custom().disableRedirectHandling().build()) {
            client.execute(new HttpGet(proxyURL), response -> {
                assertEquals(302, response.getCode());
                // path-relative, pointing back at the proxy with the resolved target
                assertEquals("/http_proxy/proxy?url=" + URLEncoder.encode(
                                "http://localhost:" + wireMockRule.getPort() + "/geostore/target",
                                StandardCharsets.UTF_8),
                        response.getFirstHeader("Location").getValue());
                return null;
            });
        }
        // the proxy hands the redirect back instead of following it, so the next hop is checked again
        wireMockRule.verify(0, getRequestedFor(urlEqualTo("/geostore/target")));
    }

    @Test
    void testOriginScopedResponseHeadersAreDropped() throws IOException {
        wireMockRule.stubFor(get(urlEqualTo("/geostore/state"))
                .willReturn(aResponse().withStatus(200)
                        .withHeader("Set-Cookie", "session=remote; Path=/")
                        .withHeader("Clear-Site-Data", "\"storage\"")
                        .withHeader("Strict-Transport-Security", "max-age=31536000")
                        .withHeader("X-Remote", "kept")
                        .withBody("canary")));

        String target = "http://localhost:" + wireMockRule.getPort() + "/geostore/state";
        String proxyURL = "http://localhost:" + localPort + "/http_proxy/proxy?url="
                + URLEncoder.encode(target, StandardCharsets.UTF_8);
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            client.execute(new HttpGet(proxyURL), response -> {
                assertEquals(200, response.getCode());
                assertNull(response.getFirstHeader("Set-Cookie"));
                assertNull(response.getFirstHeader("Clear-Site-Data"));
                assertNull(response.getFirstHeader("Strict-Transport-Security"));
                assertEquals("kept", response.getFirstHeader("X-Remote").getValue());
                return null;
            });
        }
    }

    @Test
    void testTemporaryRedirectOfPostKeepsItsStatus() throws IOException {
        wireMockRule.stubFor(post(urlEqualTo("/geostore/post-moved"))
                .willReturn(aResponse().withStatus(307).withHeader("Location", "/geostore/post-target")));

        String target = "http://localhost:" + wireMockRule.getPort() + "/geostore/post-moved";
        String proxyURL = "http://localhost:" + localPort + "/http_proxy/proxy?url="
                + URLEncoder.encode(target, StandardCharsets.UTF_8);
        try (CloseableHttpClient client = HttpClients.custom().disableRedirectHandling().build()) {
            HttpPost post = new HttpPost(proxyURL);
            post.setHeader("Content-Type", "text/xml");
            post.setEntity(new StringEntity("<transaction/>"));
            client.execute(post, response -> {
                assertEquals(307, response.getCode());
                return null;
            });
        }
    }

    /**
     * Validates that HTTP POST request is correctly handled by the HTTP Proxy using text/xml content type
     */
    @Test
    void testPOSTUsingWireMockXML() throws IOException {

        String requestBody = "<user><userId>5</userId><userName>Jane Doe</userName></user>";
        wireMockRule1.stubFor(
                post(urlEqualTo("/geostore/users/create"))
                        .withRequestBody(equalToXml(requestBody))
                        .willReturn(
                                aResponse()
                                        .withStatus(201)
                                        .withHeader("Content-Type", "text/xml")
                                        .withBody("<response>5</response>")));

        String url = "http://localhost:" + wireMockRule1.getPort() + "/geostore/users/create";
        String proxyURL = "http://localhost:" + localPort + "/http_proxy/proxy?url=" + url;
        HttpPost httpPost = new HttpPost(proxyURL);
        StringEntity stringEntity = new StringEntity(requestBody);
        httpPost.setEntity(stringEntity);

        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            httpClient.execute(httpPost, response -> {
                assertEquals("text/xml", response.getFirstHeader("Content-Type").getValue());
                assertEquals(201, response.getCode());
                return null;
            });
            wireMockRule1.verify(postRequestedFor(urlEqualTo("/geostore/users/create")));
        }
    }

    /**
     * Validates that HTTP POST request is correctly handled by the HTTP Proxy using application/json content type
     */
    @Test
    void testPOSTUsingWireMockJSON() throws IOException {

        String requestBody = """
                {
                  "user": {
                    "userId": 5,
                    "userName": "Jane Doe"
                  }
                }""";
        wireMockRule1.stubFor(
                post(urlEqualTo("/geostore/users/create"))
                        .withRequestBody(equalToJson(requestBody))
                        .willReturn(
                                aResponse()
                                        .withStatus(201)
                                        .withHeader("Content-Type", "application/json")
                                        .withBody("""
                                                {
                                                  "response": 5
                                                }""")));

        String url = "http://localhost:" + wireMockRule1.getPort() + "/geostore/users/create";
        String proxyURL = "http://localhost:" + localPort + "/http_proxy/proxy?url=" + url;
        HttpPost httpPost = new HttpPost(proxyURL);
        StringEntity stringEntity = new StringEntity(requestBody);
        httpPost.setEntity(stringEntity);

        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            httpClient.execute(httpPost, response -> {
                assertEquals("application/json", response.getFirstHeader("Content-Type").getValue());
                assertEquals(201, response.getCode());
                return null;
            });
            wireMockRule1.verify(postRequestedFor(urlEqualTo("/geostore/users/create")));
        }
    }

    /**
     * Validates that HTTP PUT request is correctly handled by the HTTP Proxy
     */
    @Test
    void testPUTUsingWireMock() throws IOException {

        String requestBody = "<user><userId>5</userId><userName>John Doe</userName></user>";
        wireMockRule.stubFor(
                put(urlEqualTo("/geostore/users/5"))
                        .withRequestBody(equalToXml(requestBody))
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader("Content-Type", "text/xml")
                                        .withBody("<response>5</response>")));

        String url = "http://localhost:" + wireMockRule.getPort() + "/geostore/users/5";
        String proxyURL = "http://localhost:" + localPort + "/http_proxy/proxy?url=" + url;
        HttpPut httpPut = new HttpPut(proxyURL);
        StringEntity stringEntity = new StringEntity(requestBody);
        httpPut.setEntity(stringEntity);

        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            httpClient.execute(httpPut, response -> {
                assertEquals(200, response.getCode());
                return null;
            });
            wireMockRule.verify(putRequestedFor(urlEqualTo("/geostore/users/5")));
        }
    }

    /**
     * Test the request for Empty (i.e. Null) proxy configuration
     */
    @Test
    void testNullProxyConfig() throws IOException {

        // remove the proxy config
        System.setProperty("http.proxyHost", "");
        System.setProperty("http.proxyPort", "");

        wireMockRule.stubFor(
                get(urlEqualTo("/geostore/resources"))
                        .willReturn(
                                aResponse()
                                        .withStatus(200)));

        String url = "http://localhost:" + wireMockRule.getPort() + "/geostore/resources";
        String proxyURL = "http://localhost:" + localPort + "/http_proxy/proxy?url=" + url;
        HttpGet httpGet = new HttpGet(proxyURL);
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            httpClient.execute(httpGet, response -> {
                assertEquals(200, response.getCode());
                return null;
            });
            wireMockRule.verify(getRequestedFor(urlEqualTo("/geostore/resources")));
        }
    }

    /**
     * Validates that HTTP URL pot set to 80 if no port is specified
     */
    @Test
    void testHttpDefaultPort() throws IOException {
        String urlStr = "http://localhost/geoserver/wms?service=wms%26version=1.3.0&request=GetCapabilities";
        URL url = Utils.buildURL(urlStr);
        assertEquals(Utils.DEFAULT_HTTP_PORT, url.getPort());
        assertEquals("http", url.getProtocol());
        assertEquals("localhost", url.getHost());
        assertEquals("/geoserver/wms?service=wms%26version=1.3.0&request=GetCapabilities", url.getFile());
    }

    /**
     * Validates that HTTP URL pot set to 80 if no port is specified
     */
    @Test
    void testHttpsDefaultPort() throws IOException {
        String urlStr = "https://georchestra.geo-solutions.it/geoserver/wms?service=WMS%26version=1.3.0&request=GetCapabilities";
        URL url = Utils.buildURL(urlStr);
        assertEquals(Utils.DEFAULT_HTTPS_PORT, url.getPort());
        assertEquals("https", url.getProtocol());
        assertEquals("georchestra.geo-solutions.it", url.getHost());
        assertEquals("/geoserver/wms?service=WMS%26version=1.3.0&request=GetCapabilities", url.getFile());
    }


    /**
     * One proxy serves every user: a cookie that an upstream sets for one client must not be sent
     * upstream on another client's request.
     */
    @Test
    void testUpstreamCookieIsNotReusedForAnotherClient() throws IOException {
        wireMockRule.stubFor(get(urlEqualTo("/geostore/cookie-set"))
                .willReturn(aResponse().withStatus(200)
                        .withHeader("Set-Cookie", "leak=from-client-a; Path=/")
                        .withBody("set")));
        wireMockRule.stubFor(get(urlEqualTo("/geostore/cookie-echo"))
                .willReturn(aResponse().withStatus(200).withBody("echo")));

        String set = proxied(wireMockRule.getPort(), "/geostore/cookie-set");
        String echo = proxied(wireMockRule.getPort(), "/geostore/cookie-echo");
        try (CloseableHttpClient clientA = HttpClients.createDefault();
             CloseableHttpClient clientB = HttpClients.createDefault()) {
            clientA.execute(new HttpGet(set), response -> {
                assertEquals(200, response.getCode());
                return null;
            });
            clientB.execute(new HttpGet(echo), response -> {
                assertEquals(200, response.getCode());
                return null;
            });
        }
        wireMockRule.verify(getRequestedFor(urlEqualTo("/geostore/cookie-echo")).withoutHeader("Cookie"));
    }

    /**
     * Basic credentials passed to the proxy with user/password apply to that request and its
     * target only: a later request without credentials, to the same or another upstream, must
     * not authenticate.
     */
    @Test
    void testBasicCredentialsAreScopedToTheRequestAndItsOrigin() throws IOException {
        for (WireMockExtension upstream : new WireMockExtension[] {wireMockRule, wireMockRule1}) {
            upstream.stubFor(get(urlEqualTo("/geostore/secure")).atPriority(1)
                    .withBasicAuth("alice", "s3cret")
                    .willReturn(aResponse().withStatus(200).withBody("secret")));
            upstream.stubFor(get(urlEqualTo("/geostore/secure")).atPriority(5)
                    .willReturn(aResponse().withStatus(401)
                            .withHeader("WWW-Authenticate", "Basic realm=\"test\"")));
        }
        String withCredentials = proxied(wireMockRule.getPort(), "/geostore/secure")
                + "&user=alice&password=s3cret";

        try (CloseableHttpClient clientA = HttpClients.createDefault();
             CloseableHttpClient clientB = HttpClients.createDefault()) {
            clientA.execute(new HttpGet(withCredentials), response -> {
                assertEquals(200, response.getCode());
                return null;
            });
            clientB.execute(new HttpGet(proxied(wireMockRule.getPort(), "/geostore/secure")), response -> {
                assertEquals(401, response.getCode());
                return null;
            });
            clientB.execute(new HttpGet(proxied(wireMockRule1.getPort(), "/geostore/secure")), response -> {
                assertEquals(401, response.getCode());
                return null;
            });
        }
        wireMockRule1.verify(0, getRequestedFor(urlEqualTo("/geostore/secure"))
                .withHeader("Authorization", matching(".*")));
    }

    /**
     * Credentials go out with the first request, so a POST body that is streamed from the client
     * reaches an upstream that requires authentication, and nothing needs to be sent twice.
     */
    @Test
    void testBasicCredentialsAreSentWithTheFirstRequestOfAPost() throws IOException {
        wireMockRule.stubFor(post(urlEqualTo("/geostore/secure")).atPriority(1)
                .withBasicAuth("alice", "s3cret")
                .willReturn(aResponse().withStatus(200).withHeader("Content-Type", "text/xml").withBody("<ok/>")));
        wireMockRule.stubFor(post(urlEqualTo("/geostore/secure")).atPriority(5)
                .willReturn(aResponse().withStatus(401)
                        .withHeader("WWW-Authenticate", "Basic realm=\"test\"")));

        HttpPost request = new HttpPost(proxied(wireMockRule.getPort(), "/geostore/secure")
                + "&user=alice&password=s3cret");
        request.setEntity(new StringEntity("<Transaction/>", org.apache.hc.core5.http.ContentType.TEXT_XML));
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            client.execute(request, response -> {
                assertEquals(200, response.getCode());
                return null;
            });
        }
        wireMockRule.verify(1, postRequestedFor(urlEqualTo("/geostore/secure"))
                .withRequestBody(equalTo("<Transaction/>")));
    }

    /** A remote host that cannot be reached is reported as a gateway error, not as an empty 200. */
    @Test
    void testUnreachableRemoteHostIsABadGateway() throws IOException {
        int closedPort;
        try (java.net.ServerSocket socket = new java.net.ServerSocket(0)) {
            closedPort = socket.getLocalPort();
        }
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            client.execute(new HttpGet(proxied(closedPort, "/geostore/wms")), response -> {
                assertEquals(502, response.getCode());
                return null;
            });
        }
    }

    /**
     * The content-type check looks at the remote response: a type outside mimetypeWhitelist is
     * refused with 403 before any of it reaches the client.
     */
    @Test
    void testRemoteResponseWithDisallowedContentTypeIsRefused() throws IOException {
        wireMockRule.stubFor(get(urlEqualTo("/geostore/binary"))
                .willReturn(aResponse().withStatus(200)
                        .withHeader("Content-Type", "application/x-msdownload")
                        .withBody("MZ-payload")));

        try (CloseableHttpClient client = HttpClients.createDefault()) {
            client.execute(new HttpGet(proxied(wireMockRule.getPort(), "/geostore/binary")), response -> {
                assertEquals(403, response.getCode());
                String body = response.getEntity() == null ? "" : new String(response.getEntity().getContent().readAllBytes(), StandardCharsets.UTF_8);
                assertFalse(body.contains("MZ-payload"), "the refused body must not reach the client");
                return null;
            });
        }
    }

    /** The request's own Content-Type is not what the whitelist checks. */
    @Test
    void testRequestContentTypeIsNotCheckedAgainstTheResponseWhitelist() throws IOException {
        wireMockRule.stubFor(post(urlEqualTo("/geostore/upload"))
                .willReturn(aResponse().withStatus(200).withHeader("Content-Type", "text/xml").withBody("<ok/>")));

        HttpPost request = new HttpPost(proxied(wireMockRule.getPort(), "/geostore/upload"));
        request.setEntity(new StringEntity("data", org.apache.hc.core5.http.ContentType.create("application/octet-stream")));
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            client.execute(request, response -> {
                assertEquals(200, response.getCode());
                return null;
            });
        }
    }

    /** A 304 lets the browser reuse its cached copy, so it carries the same content policy. */
    @Test
    void testNotModifiedResponseCarriesTheContentPolicy() throws IOException {
        wireMockRule.stubFor(get(urlEqualTo("/geostore/cached"))
                .willReturn(aResponse().withStatus(304).withHeader("ETag", "\"v1\"")));

        HttpGet request = new HttpGet(proxied(wireMockRule.getPort(), "/geostore/cached"));
        request.addHeader("If-None-Match", "\"v1\"");
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            client.execute(request, response -> {
                assertEquals(304, response.getCode());
                assertEquals("sandbox; default-src 'none'", response.getFirstHeader("Content-Security-Policy").getValue());
                assertEquals("nosniff", response.getFirstHeader("X-Content-Type-Options").getValue());
                return null;
            });
        }
    }

    /** The timeout in proxy.properties (3 s in the test configuration) applies to remote calls. */
    @Test
    void testRemoteHostSlowerThanTheTimeoutIsAGatewayTimeout() throws IOException {
        wireMockRule.stubFor(get(urlEqualTo("/geostore/slow"))
                .willReturn(aResponse().withStatus(200).withFixedDelay(5000)
                        .withHeader("Content-Type", "text/plain").withBody("late")));

        long start = System.currentTimeMillis();
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            client.execute(new HttpGet(proxied(wireMockRule.getPort(), "/geostore/slow")), response -> {
                assertEquals(504, response.getCode());
                return null;
            });
        }
        assertTrue(System.currentTimeMillis() - start < 5000, "the proxy must give up before the remote host answers");
    }

    private String proxied(int upstreamPort, String path) {
        String target = "http://localhost:" + upstreamPort + path;
        return "http://localhost:" + localPort + "/http_proxy/proxy?url="
                + URLEncoder.encode(target, StandardCharsets.UTF_8);
    }

    @AfterAll
    static void stopServer() {
        try {

            // restore system proxy config
            restoreProxyConfig();

            wireMockServer.stop();
            jettyServer.stop();
        } catch (Exception e) {
            LOGGER.error("Could not stop HTTP Proxy Server: {}", e.getMessage(), e);
        }
    }

    /**
     * restore the system proxy config
     */
    private static void restoreProxyConfig() {
        if (proxyHost == null) System.clearProperty("http.proxyHost");
        else System.setProperty("http.proxyHost", proxyHost);
        if (proxyPort == null) System.clearProperty("http.proxyPort");
        else System.setProperty("http.proxyPort", proxyPort);
    }
}
