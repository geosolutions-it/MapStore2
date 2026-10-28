package it.geosolutions.httpproxy;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class ResponseHeaderBlacklistTest {

    @TempDir
    Path tempDir;

    private ProxyConfig config(String properties) throws Exception {
        Path file = tempDir.resolve("proxy.properties");
        Files.writeString(file, properties);
        return new ProxyConfig(null, file.toString());
    }

    @Test
    void defaultsToHeadersThatActOnTheApplicationOrigin() throws Exception {
        assertEquals(Set.of("set-cookie", "set-cookie2", "clear-site-data", "strict-transport-security"),
                config("").getResponseHeaderBlacklist());
    }

    @Test
    void canBeReplaced() throws Exception {
        assertEquals(Set.of("set-cookie", "x-internal"),
                config("responseHeaderBlacklist = Set-Cookie, X-Internal").getResponseHeaderBlacklist());
    }

    @Test
    void emptyValuePassesEveryHeaderThrough() throws Exception {
        assertFalse(config("responseHeaderBlacklist =").getResponseHeaderBlacklist().contains("set-cookie"));
    }
}
