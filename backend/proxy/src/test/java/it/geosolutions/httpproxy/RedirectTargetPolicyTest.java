package it.geosolutions.httpproxy;

import com.sun.net.httpserver.HttpServer;
import jakarta.servlet.ServletConfig;
import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.net.InetSocketAddress;
import java.net.URLEncoder;
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

/** A redirect is handed back to the client, so the checks apply again to its target. */
class RedirectTargetPolicyTest {

    @TempDir
    Path tempDir;

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
    void redirectTargetOutsideHostnameWhitelistIsRefused() throws Exception {
        AtomicInteger targetRequests = new AtomicInteger();
        HttpServer origin = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        int port = origin.getAddress().getPort();
        String redirectTarget = "http://127.0.0.1:" + port + "/geostore/canary";
        origin.createContext("/geostore/redirect", exchange -> {
            exchange.getResponseHeaders().set("Location", redirectTarget);
            exchange.sendResponseHeaders(302, -1);
            exchange.close();
        });
        origin.createContext("/geostore/canary", exchange -> {
            targetRequests.incrementAndGet();
            byte[] canary = "canary".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, canary.length);
            exchange.getResponseBody().write(canary);
            exchange.close();
        });
        origin.start();
        try {
            // Both names pass the private-address rules; only hostnameWhitelist tells them apart.
            HTTPProxy proxy = servlet("hostnameWhitelist=localhost\nallowedPrivateHosts=localhost,127.0.0.1\n");

            HttpServletResponse redirect = fetch(proxy, "http://localhost:" + port + "/geostore/redirect");
            verify(redirect).setStatus(302);
            verify(redirect).setHeader("Location",
                    "/proxy/?url=" + URLEncoder.encode(redirectTarget, StandardCharsets.UTF_8));

            // The browser follows the Location with a new proxy request for the redirect target.
            HttpServletResponse followUp = fetch(proxy, redirectTarget);
            verify(followUp).sendError(eq(403), anyString());
            assertEquals(0, targetRequests.get());
        } finally {
            origin.stop(0);
        }
    }
}
