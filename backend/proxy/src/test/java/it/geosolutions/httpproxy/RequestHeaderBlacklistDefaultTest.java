package it.geosolutions.httpproxy;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** The browser's cookies are not forwarded to remote hosts unless a site configures otherwise. */
class RequestHeaderBlacklistDefaultTest {

    @TempDir
    Path tempDir;

    private ProxyConfig config(String properties) throws Exception {
        Path file = tempDir.resolve("proxy.properties");
        Files.writeString(file, properties);
        return new ProxyConfig(null, file.toString());
    }

    @Test
    void cookieIsBlockedByDefault() throws Exception {
        assertEquals(Set.of("cookie"), config("").getRequestHeaderBlacklist());
        assertEquals(Set.of("cookie"), config("timeout = 30000").getRequestHeaderBlacklist());
    }

    @Test
    void anExplicitListReplacesTheDefault() throws Exception {
        Set<String> blacklist = config("requestHeaderBlacklist = X-Secret").getRequestHeaderBlacklist();
        assertEquals(Set.of("x-secret"), blacklist);
    }

    @Test
    void anEmptyValueForwardsEveryHeader() throws Exception {
        Set<String> blacklist = config("requestHeaderBlacklist =").getRequestHeaderBlacklist();
        assertFalse(blacklist.contains("cookie"));
        assertTrue(blacklist.stream().allMatch(String::isEmpty));
    }
}
