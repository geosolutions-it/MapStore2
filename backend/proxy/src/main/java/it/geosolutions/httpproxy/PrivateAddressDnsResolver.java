package it.geosolutions.httpproxy;

import org.apache.hc.client5.http.DnsResolver;
import org.apache.hc.client5.http.SystemDefaultDnsResolver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/** Rejects private destinations at the DNS result used by the HTTP connection. */
final class PrivateAddressDnsResolver implements DnsResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(PrivateAddressDnsResolver.class);

    private final Set<String> allowedPrivateHosts;
    private final Set<String> allowedPrivateNetworks;
    private final Set<String> invalidNetworks;
    private final Set<String> trustedProxies;
    private final Set<String> trustedProxyHosts;
    private final boolean disabled;
    private final DnsResolver delegate;

    PrivateAddressDnsResolver(ProxyConfig config) {
        this(config, SystemDefaultDnsResolver.INSTANCE, Set.of());
    }

    PrivateAddressDnsResolver(ProxyConfig config, DnsResolver delegate) {
        this(config, delegate, Set.of());
    }

    /**
     * @param trustedProxies outbound proxies ({@code host:port}) that requests may be sent
     *     through; the connection goes to the proxy, which resolves the final target itself
     */
    PrivateAddressDnsResolver(ProxyConfig config, DnsResolver delegate, Set<String> trustedProxies) {
        // Keep the policy fixed for the lifetime of the connection pool. A configuration
        // change requires a servlet restart so an already pooled connection cannot bypass it.
        this.allowedPrivateHosts = Set.copyOf(config.getAllowedPrivateHosts());
        Set<String> networks = new LinkedHashSet<>();
        Set<String> invalid = new LinkedHashSet<>();
        for (String entry : config.getAllowedPrivateNetworks()) {
            String cidr = entry.trim();
            if (isValidCidr(cidr)) {
                networks.add(cidr);
            } else {
                invalid.add(cidr);
                LOGGER.warn("Ignoring allowedPrivateNetworks entry that is not a valid CIDR range: {}", cidr);
            }
        }
        this.allowedPrivateNetworks = Set.copyOf(networks);
        this.invalidNetworks = Set.copyOf(invalid);
        Set<String> proxies = new LinkedHashSet<>();
        Set<String> proxyHosts = new LinkedHashSet<>();
        for (String proxy : trustedProxies) {
            String normalized = proxy.toLowerCase(Locale.ROOT);
            proxies.add(normalized);
            proxyHosts.add(normalized.substring(0, normalized.lastIndexOf(':')));
        }
        this.trustedProxies = Set.copyOf(proxies);
        this.trustedProxyHosts = Set.copyOf(proxyHosts);
        this.disabled = config.isAllowPrivateDestinations();
        this.delegate = delegate;
    }

    @Override
    public InetAddress[] resolve(String host) throws UnknownHostException {
        return checked(host, -1, true);
    }

    @Override
    public List<InetSocketAddress> resolve(String host, int port) throws UnknownHostException {
        return Arrays.stream(checked(host, port, true))
                .map(address -> new InetSocketAddress(address, port)).toList();
    }

    @Override
    public String resolveCanonicalHostname(String host) throws UnknownHostException {
        return delegate.resolveCanonicalHostname(host);
    }

    /**
     * Checks a destination that will be reached through an outbound proxy. The outbound proxy
     * resolves the name itself, so the check here applies only when the name also resolves
     * locally; a name that does not resolve here is left to the outbound proxy's own rules.
     *
     * @throws BlockedDestinationException if the name resolves locally to a non-public address
     *     that is not allowed
     */
    void checkForwardedDestination(String host, int port) throws BlockedDestinationException {
        if (disabled) {
            return;
        }
        try {
            // The outbound proxy is trusted only as the next hop, never as a requested destination.
            checked(host, port, false);
        } catch (BlockedDestinationException blocked) {
            throw blocked;
        } catch (UnknownHostException notResolvedLocally) {
            LOGGER.debug("{} does not resolve locally, leaving it to the outbound proxy", host);
        }
    }

    /** One-line description of the active policy, for the startup log. */
    String describe() {
        if (disabled) {
            return "allowPrivateDestinations is true: proxy destinations are not checked";
        }
        return "Proxy destinations in the loopback, link-local, private, unique-local, multicast and"
                + " reserved address ranges are refused; allowedPrivateHosts=" + allowedPrivateHosts
                + ", allowedPrivateNetworks=" + allowedPrivateNetworks;
    }

    /** The allowedPrivateNetworks entries that were ignored because they are not valid CIDR ranges. */
    Set<String> invalidNetworks() {
        return invalidNetworks;
    }

    private InetAddress[] checked(String host, int port, boolean connectionTarget)
            throws UnknownHostException {
        InetAddress[] addresses = delegate.resolve(host);
        if (addresses.length == 0) {
            throw new UnknownHostException(host);
        }
        if (disabled || (connectionTarget && isTrustedProxy(host, port))) {
            return addresses;
        }
        for (InetAddress address : addresses) {
            if (isPrivate(address) && !hostAllowed(host, port)
                    && !networkAllowed(address)) {
                throw new BlockedDestinationException(host);
            }
        }
        return addresses;
    }

    private boolean isTrustedProxy(String host, int port) {
        String normalized = host.toLowerCase(Locale.ROOT);
        // The single-argument resolve carries no port: match the proxy host name alone then.
        return port >= 0
                ? trustedProxies.contains(normalized + ":" + port)
                : trustedProxyHosts.contains(normalized);
    }

    private boolean hostAllowed(String host, int port) {
        String normalized = host.toLowerCase(Locale.ROOT);
        for (String entry : allowedPrivateHosts) {
            String allowed = entry.trim().toLowerCase(Locale.ROOT);
            if (allowed.equals(normalized)
                    || (port >= 0 && allowed.equals(normalized + ":" + port))
                    || (port >= 0 && allowed.equals("[" + normalized + "]:" + port))) {
                return true;
            }
        }
        return false;
    }

    private boolean networkAllowed(InetAddress address) {
        for (String cidr : allowedPrivateNetworks) {
            if (inNetwork(address, cidr)) {
                return true;
            }
        }
        return false;
    }

    static boolean isValidCidr(String cidr) {
        String[] parts = cidr.split("/", -1);
        if (parts.length != 2 || !parts[0].matches("[0-9a-fA-F:.]+")) {
            return false;
        }
        try {
            int length = InetAddress.getByName(parts[0]).getAddress().length;
            int bits = Integer.parseInt(parts[1]);
            return bits >= 0 && bits <= length * 8;
        } catch (Exception invalidCidr) {
            return false;
        }
    }

    static boolean inNetwork(InetAddress address, String cidr) {
        String[] parts = cidr.split("/", -1);
        if (parts.length != 2 || !parts[0].matches("[0-9a-fA-F:.]+")) {
            return false;
        }
        try {
            byte[] network = InetAddress.getByName(parts[0]).getAddress();
            byte[] candidate = address.getAddress();
            int bits = Integer.parseInt(parts[1]);
            if (network.length != candidate.length || bits < 0 || bits > network.length * 8) {
                return false;
            }
            for (int i = 0; i < network.length; i++) {
                int mask = Math.min(8, bits) == 0 ? 0 : 0xff << (8 - Math.min(8, bits));
                if ((network[i] & mask) != (candidate[i] & mask)) {
                    return false;
                }
                bits -= Math.min(8, bits);
            }
            return true;
        } catch (Exception invalidCidr) {
            return false;
        }
    }

    static boolean isPrivate(InetAddress address) {
        if (address.isAnyLocalAddress() || address.isLoopbackAddress()
                || address.isLinkLocalAddress() || address.isSiteLocalAddress()
                || address.isMulticastAddress()) {
            return true;
        }
        byte[] bytes = address.getAddress();
        if (bytes.length == 16) {
            // IPv6 unique-local addresses (fc00::/7).
            return (bytes[0] & 0xfe) == 0xfc;
        }
        int first = bytes[0] & 0xff;
        int second = bytes[1] & 0xff;
        // Shared address space, benchmarking space and reserved IPv4 ranges.
        return first == 0 || first >= 240
                || (first == 100 && second >= 64 && second <= 127)
                || (first == 198 && (second == 18 || second == 19));
    }

    static final class BlockedDestinationException extends UnknownHostException {
        BlockedDestinationException(String host) {
            super("Private destination is not allowed: " + host);
        }
    }
}
