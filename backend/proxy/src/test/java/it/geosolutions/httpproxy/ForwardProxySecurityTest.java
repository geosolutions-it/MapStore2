package it.geosolutions.httpproxy;

import com.sun.net.httpserver.HttpServer;
import jakarta.servlet.ServletConfig;
import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** A disposable forwarding proxy returns canary text without contacting the named target. */
class ForwardProxySecurityTest {

    @TempDir
    Path tempDir;

    private String oldProxyHost;
    private String oldProxyPort;
    private String oldNonProxyHosts;

    @AfterEach
    void restoreSystemProperties() {
        restore("http.proxyHost", oldProxyHost);
        restore("http.proxyPort", oldProxyPort);
        restore("http.nonProxyHosts", oldNonProxyHosts);
    }

    private static void restore(String key, String value) {
        if (value == null) System.clearProperty(key);
        else System.setProperty(key, value);
    }

    private void configureForwardProxy(int port, String nonProxyHosts) {
        oldProxyHost = System.getProperty("http.proxyHost");
        oldProxyPort = System.getProperty("http.proxyPort");
        oldNonProxyHosts = System.getProperty("http.nonProxyHosts");
        System.setProperty("http.proxyHost", "localhost");
        System.setProperty("http.proxyPort", Integer.toString(port));
        if (nonProxyHosts == null) System.clearProperty("http.nonProxyHosts");
        else System.setProperty("http.nonProxyHosts", nonProxyHosts);
    }

    private HTTPProxy servlet() throws Exception {
        return servlet("allowedPrivateHosts=localhost\n");
    }

    private HTTPProxy servlet(String configuration) throws Exception {
        Path properties = tempDir.resolve("proxy.properties");
        Files.writeString(properties, configuration);
        ServletConfig servletConfig = mock(ServletConfig.class);
        ServletContext context = mock(ServletContext.class);
        when(servletConfig.getServletContext()).thenReturn(context);
        when(context.getInitParameter("proxyPropPath")).thenReturn(properties.toString());
        when(context.getContextPath()).thenReturn("");
        HTTPProxy proxy = new HTTPProxy();
        proxy.init(servletConfig);
        return proxy;
    }

    private HttpServletResponse fetch(HTTPProxy proxy, String target) throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        when(request.getParameterMap()).thenReturn(Map.of("url", new String[]{target}));
        when(request.getHeaderNames()).thenReturn(Collections.emptyEnumeration());
        when(request.getServletPath()).thenReturn("/proxy");
        when(request.getPathInfo()).thenReturn("/");
        when(response.getOutputStream()).thenReturn(new StubServletOutputStream());
        proxy.doGet(request, response);
        return response;
    }

    @Test
    void directPrivateTargetIsNotSentToOutboundProxy() throws Exception {
        AtomicInteger requests = new AtomicInteger();
        HttpServer forward = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        forward.createContext("/", exchange -> {
            requests.incrementAndGet();
            byte[] canary = "canary".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, canary.length);
            exchange.getResponseBody().write(canary);
            exchange.close();
        });
        forward.start();
        try {
            configureForwardProxy(forward.getAddress().getPort(), null);
            HttpServletResponse response = fetch(servlet(), "http://127.0.0.1:1/geostore/canary");
            verify(response).sendError(eq(403), anyString());
            assertEquals(0, requests.get());
        } finally {
            forward.stop(0);
        }
    }

    @Test
    void redirectedPrivateTargetIsNotSentToOutboundProxy() throws Exception {
        AtomicInteger requests = new AtomicInteger();
        HttpServer forward = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        forward.createContext("/", exchange -> {
            requests.incrementAndGet();
            byte[] canary = "canary".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, canary.length);
            exchange.getResponseBody().write(canary);
            exchange.close();
        });
        HttpServer origin = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        origin.createContext("/geostore/redirect", exchange -> {
            exchange.getResponseHeaders().set("Location", "http://127.0.0.1:1/geostore/canary");
            exchange.sendResponseHeaders(302, -1);
            exchange.close();
        });
        forward.start();
        origin.start();
        try {
            configureForwardProxy(forward.getAddress().getPort(), "localhost");
            HTTPProxy proxy = servlet();
            HttpServletResponse redirect = fetch(proxy,
                    "http://localhost:" + origin.getAddress().getPort() + "/geostore/redirect");
            verify(redirect).setStatus(302);
            verify(redirect).setHeader(eq("Location"), anyString());

            HttpServletResponse denied = fetch(proxy, "http://127.0.0.1:1/geostore/canary");
            verify(denied).sendError(eq(403), anyString());
            assertEquals(0, requests.get());
        } finally {
            origin.stop(0);
            forward.stop(0);
        }
    }

    /** A disposable outbound proxy that answers every request with canary text and counts them. */
    private static HttpServer outboundProxy(AtomicInteger requests) throws Exception {
        HttpServer forward = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        forward.createContext("/", exchange -> {
            requests.incrementAndGet();
            byte[] canary = "canary".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, canary.length);
            exchange.getResponseBody().write(canary);
            exchange.close();
        });
        forward.start();
        return forward;
    }

    @Test
    void publicTargetGoesThroughOutboundProxyByDefault() throws Exception {
        AtomicInteger requests = new AtomicInteger();
        HttpServer forward = outboundProxy(requests);
        try {
            configureForwardProxy(forward.getAddress().getPort(), null);
            // No allowedPrivateHosts: the outbound proxy on loopback is trusted because it is configured.
            HttpServletResponse response = fetch(servlet(""), "http://203.0.113.10/geostore/canary");
            verify(response).setStatus(200);
            assertEquals(1, requests.get());
        } finally {
            forward.stop(0);
        }
    }

    @Test
    void nameThatDoesNotResolveLocallyIsLeftToOutboundProxy() throws Exception {
        AtomicInteger requests = new AtomicInteger();
        HttpServer forward = outboundProxy(requests);
        try {
            configureForwardProxy(forward.getAddress().getPort(), null);
            HttpServletResponse response = fetch(servlet(""), "http://maps.example.invalid/geostore/canary");
            verify(response).setStatus(200);
            assertEquals(1, requests.get());
        } finally {
            forward.stop(0);
        }
    }

    @Test
    void outboundProxyCanBeTurnedOff() throws Exception {
        AtomicInteger requests = new AtomicInteger();
        HttpServer forward = outboundProxy(requests);
        try {
            configureForwardProxy(forward.getAddress().getPort(), null);
            // The loopback outbound proxy is allowed explicitly, so only the setting can refuse.
            HttpServletResponse response = fetch(
                    servlet("allowForwardProxy=false\nallowedPrivateHosts=localhost\n"),
                    "http://203.0.113.10/geostore/canary");
            verify(response).sendError(403, "Requests through the outbound proxy are disabled");
            assertEquals(0, requests.get());
        } finally {
            forward.stop(0);
        }
    }
}
