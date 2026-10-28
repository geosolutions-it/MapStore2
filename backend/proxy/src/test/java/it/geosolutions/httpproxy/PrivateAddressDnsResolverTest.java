package it.geosolutions.httpproxy;

import org.apache.hc.client5.http.DnsResolver;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class PrivateAddressDnsResolverTest {

    @TempDir
    Path tempDir;

    private ProxyConfig config(String properties) throws Exception {
        Path file = tempDir.resolve("proxy.properties");
        Files.writeString(file, properties);
        return new ProxyConfig(null, file.toString());
    }

    /** A delegate that answers every lookup with the given addresses, or fails if there are none. */
    private static DnsResolver answering(byte[]... addresses) {
        return new DnsResolver() {
            @Override
            public InetAddress[] resolve(String host) throws UnknownHostException {
                if (addresses.length == 0) {
                    throw new UnknownHostException(host);
                }
                InetAddress[] answer = new InetAddress[addresses.length];
                for (int i = 0; i < addresses.length; i++) {
                    answer[i] = InetAddress.getByAddress(addresses[i]);
                }
                return answer;
            }

            @Override
            public String resolveCanonicalHostname(String host) {
                return host;
            }
        };
    }

    private PrivateAddressDnsResolver resolver(String properties, byte[]... addresses) throws Exception {
        return new PrivateAddressDnsResolver(config(properties), answering(addresses));
    }

    @Test
    void rejectsPrivateDnsResultEvenForPublicLookingHostname() throws Exception {
        PrivateAddressDnsResolver resolver = resolver("", new byte[]{10, 0, 5, 20});
        assertThrows(PrivateAddressDnsResolver.BlockedDestinationException.class,
                () -> resolver.resolve("maps.example", 8080));
    }

    @Test
    void allowsPublicDnsResultWithoutAnException() throws Exception {
        PrivateAddressDnsResolver resolver = resolver("", new byte[]{93, (byte) 184, (byte) 216, 34});
        assertEquals(1, resolver.resolve("maps.example", 443).size());
    }

    @Test
    void rejectsLinkLocalDnsResult() throws Exception {
        PrivateAddressDnsResolver resolver = resolver("", new byte[]{(byte) 169, (byte) 254, 2, 3});
        assertThrows(PrivateAddressDnsResolver.BlockedDestinationException.class,
                () -> resolver.resolve("maps.example", 80));
    }

    @Test
    void allowsExactHostAndPortButNotAnotherPort() throws Exception {
        PrivateAddressDnsResolver resolver = resolver(
                "allowedPrivateHosts=maps.example:8080", new byte[]{10, 0, 5, 20});
        assertEquals(1, resolver.resolve("maps.example", 8080).size());
        assertThrows(PrivateAddressDnsResolver.BlockedDestinationException.class,
                () -> resolver.resolve("maps.example", 8081));
    }

    @Test
    void allowsOnlyConfiguredPrivateNetwork() throws Exception {
        PrivateAddressDnsResolver resolver = resolver(
                "allowedPrivateNetworks=10.0.5.0/24", new byte[]{10, 0, 5, 20});
        assertEquals(1, resolver.resolve("maps.example", 8080).size());

        PrivateAddressDnsResolver outside = resolver(
                "allowedPrivateNetworks=10.0.6.0/24", new byte[]{10, 0, 5, 20});
        assertThrows(PrivateAddressDnsResolver.BlockedDestinationException.class,
                () -> outside.resolve("maps.example", 8080));
    }

    @Test
    void rejectsIpv6UniqueLocalAddress() throws Exception {
        byte[] ula = InetAddress.getByName("fd00::1").getAddress();
        PrivateAddressDnsResolver resolver = resolver("", ula);
        assertThrows(PrivateAddressDnsResolver.BlockedDestinationException.class,
                () -> resolver.resolve("maps.example", 8080));
    }

    @Test
    void rejectsAnswerWithBothPublicAndPrivateAddresses() throws Exception {
        PrivateAddressDnsResolver resolver = resolver("",
                new byte[]{(byte) 203, 0, 113, 10}, new byte[]{10, 0, 5, 20});
        assertThrows(PrivateAddressDnsResolver.BlockedDestinationException.class,
                () -> resolver.resolve("maps.example", 443));
    }

    @Test
    void rejectsReservedIpv4Ranges() throws Exception {
        byte[][] reserved = {
                {100, 64, 0, 1}, {100, 127, (byte) 255, (byte) 254},
                {(byte) 198, 18, 0, 1}, {(byte) 198, 19, (byte) 255, (byte) 254},
                {0, 1, 2, 3}, {(byte) 240, 0, 0, 1}};
        for (byte[] address : reserved) {
            PrivateAddressDnsResolver resolver = resolver("", address);
            assertThrows(PrivateAddressDnsResolver.BlockedDestinationException.class,
                    () -> resolver.resolve("maps.example", 80),
                    InetAddress.getByAddress(address).getHostAddress());
        }
    }

    @Test
    void allowPrivateDestinationsSwitchesTheChecksOff() throws Exception {
        PrivateAddressDnsResolver resolver = resolver(
                "allowPrivateDestinations=true", new byte[]{10, 0, 5, 20});
        assertEquals(1, resolver.resolve("maps.example", 8080).size());
        assertDoesNotThrow(() -> resolver.checkForwardedDestination("maps.example", 8080));
    }

    @Test
    void invalidNetworkEntriesAreReportedAndIgnored() throws Exception {
        PrivateAddressDnsResolver resolver = resolver(
                "allowedPrivateNetworks=172.26.0.0/33,10.0.5.0/24", new byte[]{10, 0, 5, 20});
        assertEquals(Set.of("172.26.0.0/33"), resolver.invalidNetworks());
        assertEquals(1, resolver.resolve("maps.example", 8080).size());
    }

    @Test
    void forwardedDestinationIsCheckedWhenItResolvesLocally() throws Exception {
        PrivateAddressDnsResolver resolver = resolver("", new byte[]{10, 0, 5, 20});
        assertThrows(PrivateAddressDnsResolver.BlockedDestinationException.class,
                () -> resolver.checkForwardedDestination("maps.example", 80));

        PrivateAddressDnsResolver publicName = resolver("", new byte[]{(byte) 203, 0, 113, 10});
        assertDoesNotThrow(() -> publicName.checkForwardedDestination("maps.example", 80));
    }

    @Test
    void forwardedDestinationThatDoesNotResolveLocallyIsLeftToTheOutboundProxy() throws Exception {
        PrivateAddressDnsResolver resolver = resolver("");
        assertDoesNotThrow(() -> resolver.checkForwardedDestination("maps.example", 80));
    }

    @Test
    void configuredOutboundProxyIsTrustedAsConnectionTarget() throws Exception {
        PrivateAddressDnsResolver resolver = new PrivateAddressDnsResolver(config(""),
                answering(new byte[]{10, 0, 0, 5}), Set.of("Proxy.Corp.Local:3128"));
        assertEquals(1, resolver.resolve("proxy.corp.local", 3128).size());
        assertEquals(1, resolver.resolve("proxy.corp.local").length);
        assertThrows(PrivateAddressDnsResolver.BlockedDestinationException.class,
                () -> resolver.resolve("proxy.corp.local", 8080));
        assertThrows(PrivateAddressDnsResolver.BlockedDestinationException.class,
                () -> resolver.resolve("other.corp.local", 3128));
        // trusted as the next hop only: requesting the outbound proxy itself is still refused
        assertThrows(PrivateAddressDnsResolver.BlockedDestinationException.class,
                () -> resolver.checkForwardedDestination("proxy.corp.local", 3128));
    }
}
