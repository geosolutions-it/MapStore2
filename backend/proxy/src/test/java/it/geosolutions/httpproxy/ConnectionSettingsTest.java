package it.geosolutions.httpproxy;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** The connection settings in proxy.properties are read into their own fields. */
class ConnectionSettingsTest {

    @TempDir
    Path tempDir;

    private ProxyConfig config(String properties) throws Exception {
        Path file = tempDir.resolve("proxy.properties");
        Files.writeString(file, properties);
        return new ProxyConfig(null, file.toString());
    }

    @Test
    void eachSettingKeepsItsOwnValue() throws Exception {
        ProxyConfig config = config("timeout = 1234\nconnection_timeout = 2345\n"
                + "max_total_connections = 60\ndefault_max_connections_per_host = 6\n");
        assertEquals(1234, config.getSoTimeout());
        assertEquals(2345, config.getConnectionTimeout());
        assertEquals(60, config.getMaxTotalConnections());
        assertEquals(6, config.getDefaultMaxConnectionsPerHost());
    }
}
