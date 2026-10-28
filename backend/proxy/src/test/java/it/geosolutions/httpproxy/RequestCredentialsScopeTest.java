package it.geosolutions.httpproxy;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.apache.hc.client5.http.auth.AuthScope;
import org.apache.hc.client5.http.auth.Credentials;
import org.apache.hc.client5.http.auth.CredentialsProvider;
import org.apache.hc.client5.http.auth.UsernamePasswordCredentials;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.protocol.HttpClientContext;
import org.apache.hc.core5.http.HttpHost;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

/** Credentials passed with one proxied request answer only for that request's origin. */
class RequestCredentialsScopeTest {

    private static final String[] PROXY_PROPERTIES = {
        "http.proxyHost", "http.proxyPort", "http.proxyUser", "http.proxyPassword"
    };

    private final Map<String, String> saved = new HashMap<>();

    @AfterEach
    void restoreProxyProperties() {
        for (String key : PROXY_PROPERTIES) {
            if (saved.containsKey(key)) {
                String value = saved.get(key);
                if (value == null) System.clearProperty(key);
                else System.setProperty(key, value);
            }
        }
    }

    private void setProperty(String key, String value) {
        if (!saved.containsKey(key)) saved.put(key, System.getProperty(key));
        System.setProperty(key, value);
    }

    private static Credentials lookup(HttpClientContext context, String scheme, String host, int port) {
        CredentialsProvider provider = context.getCredentialsProvider();
        return provider.getCredentials(new AuthScope(new HttpHost(scheme, host, port)), context);
    }

    private static void assertRequestCredentials(Credentials credentials) {
        assertNotNull(credentials);
        UsernamePasswordCredentials basic = (UsernamePasswordCredentials) credentials;
        assertEquals("alice", basic.getUserName());
        assertArrayEquals("s3cret".toCharArray(), basic.getUserPassword());
    }

    @Test
    void noCredentialsLeavesTheClientDefault() {
        HttpClientContext context = HTTPProxy.requestContext(new HttpGet("http://gs.example/wms"), null, null);
        assertNull(context.getCredentialsProvider());
    }

    @Test
    void credentialsApplyToTheTargetOriginOnly() {
        HttpClientContext context =
                HTTPProxy.requestContext(new HttpGet("https://gs.example/geoserver/wms"), "alice", "s3cret");

        assertRequestCredentials(lookup(context, "https", "gs.example", 443));
        assertNull(lookup(context, "https", "gs.example", 8443));
        assertNull(lookup(context, "https", "other.example", 443));
    }

    @Test
    void defaultHttpPortIsMadeExplicit() {
        HttpClientContext context =
                HTTPProxy.requestContext(new HttpGet("http://gs.example/geoserver/wms"), "alice", "s3cret");

        assertRequestCredentials(lookup(context, "http", "gs.example", 80));
        assertNull(lookup(context, "http", "gs.example", 8080));
    }

    @Test
    void outboundProxyChallengeIsStillAnsweredFromTheJvmSettings() {
        setProperty("http.proxyHost", "egress.example");
        setProperty("http.proxyPort", "3128");
        setProperty("http.proxyUser", "proxy-user");
        setProperty("http.proxyPassword", "proxy-secret");

        HttpClientContext context =
                HTTPProxy.requestContext(new HttpGet("http://gs.example/geoserver/wms"), "alice", "s3cret");

        assertRequestCredentials(lookup(context, "http", "gs.example", 80));
        UsernamePasswordCredentials proxy =
                (UsernamePasswordCredentials) lookup(context, "http", "egress.example", 3128);
        assertNotNull(proxy);
        assertEquals("proxy-user", proxy.getUserName());
    }

    @Test
    void outboundProxyCredentialsFromTheJvmSettingsAreSentUpFront() {
        setProperty("http.proxyHost", "egress.example");
        setProperty("http.proxyPort", "3128");
        setProperty("http.proxyUser", "proxy-user");
        setProperty("http.proxyPassword", "proxy-secret");
        HttpHost egress = new HttpHost("http", "egress.example", 3128);

        // also for a request without credentials of its own
        HttpClientContext context = HTTPProxy.requestContext(
                new HttpGet("http://gs.example/geoserver/wms"), null, null, java.util.List.of(egress));

        assertNotNull(context.getAuthCache());
        assertNotNull(context.getAuthCache().get(egress));
        assertNull(context.getAuthCache().get(new HttpHost("http", "gs.example", 80)));
    }

    @Test
    void noOutboundProxyCredentialsMeansNothingIsSentUpFront() {
        HttpHost egress = new HttpHost("http", "egress.example", 3128);

        HttpClientContext context = HTTPProxy.requestContext(
                new HttpGet("http://gs.example/geoserver/wms"), null, null, java.util.List.of(egress));

        assertNull(context.getAuthCache());
    }
}
