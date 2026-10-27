# Proxy Configuration

MapStore includes a small HTTP proxy, available at `/proxy/?url=`, that the front-end uses to reach services that do not support CORS. The front-end decides when to use it through the `proxyUrl` entry of `localConfig.json` (see [Application Configuration](local-config.md)): services listed in `useCORS` are called directly, every other request goes through the proxy.

The proxy is configured with the `proxy.properties` file. In source code it is located in `java/web/src/main/resources` (in a MapStore project, `web/src/main/resources`); in the `mapstore.war` it is under `/WEB-INF/classes`. A `proxy.properties` file placed in the [data directory](externalized-configuration.md#externalized-configuration) is read after the one in the package, so its values take precedence: use it to keep your settings across updates.

## Enabling the proxy

The `proxy.properties` shipped with MapStore keeps the proxy disabled: `hostnameWhitelist` contains only `none.invalid`, a name that does not exist, so every request is refused with `403`.

To enable the proxy, replace `none.invalid` with the host names of the services your users need to reach without CORS:

```properties
hostnameWhitelist = demo.example.com,maps.example.org
```

Host names are compared exactly with the host of the requested URL (without port). An empty `hostnameWhitelist` lets the proxy reach any public host: this is not recommended, because anyone who can reach MapStore can then use it to download content from any host.

## Destinations

The proxy refuses non-public destinations: private networks, loopback (`localhost`, `127.0.0.1`), link-local addresses and the like. The check applies to the address the host name resolves to. Redirects returned by the remote host are sent back through the proxy and checked again.

To reach a service on your internal network through the proxy, list it explicitly:

| Property | Description |
|---|---|
| `allowedPrivateHosts` | Comma-separated hosts (optionally `host:port`) on non-public addresses that the proxy can reach, e.g. `geoserver.intranet.local,10.0.5.20:8080` |
| `allowedPrivateNetworks` | Comma-separated networks in CIDR notation that the proxy can reach, e.g. `10.0.5.0/24` |
| `allowPrivateDestinations` | `true` switches the destination check off. Default `false`. Not recommended |

A host listed in `allowedPrivateHosts` must also be in `hostnameWhitelist`. Changes to these properties take effect after a restart.

## Outbound proxy

When MapStore reaches the internet through a corporate proxy configured with the `http.proxyHost` / `https.proxyHost` Java system properties (see [Corporate proxy settings](configuration-files.md#corporate-proxy-settings)), the requests to hosts outside `http.nonProxyHosts` go through that outbound proxy.

| Property | Description |
|---|---|
| `allowForwardProxy` | `true` sends those requests through the outbound proxy. The outbound proxy resolves the final host, so the destination check above applies only when the host name also resolves locally. `false` refuses them. The `proxy.properties` shipped with MapStore sets it to `false` |

## Headers

| Property | Description |
|---|---|
| `requestHeaderWhitelist` | When set, only these request headers are sent to the remote host (comma-separated, case-insensitive) |
| `requestHeaderBlacklist` | Request headers never sent to the remote host. Default `Cookie`: the browser cookies belong to MapStore, not to the remote host. It takes precedence over the whitelist |
| `responseHeaderBlacklist` | Response headers from the remote host never passed back to the browser. Default `Set-Cookie,Set-Cookie2,Clear-Site-Data,Strict-Transport-Security` |

An empty value for a blacklist sends or passes every header.

Every response of the proxy is served with `Content-Security-Policy: sandbox; default-src 'none'` and `X-Content-Type-Options: nosniff`. These headers do not affect the requests made by MapStore, which read the content through scripts. Opening a proxy URL directly in a browser tab is refused.

## Other filters

| Property | Description |
|---|---|
| `methodsWhitelist` | HTTP methods accepted, e.g. `GET,POST,PUT` |
| `mimetypeWhitelist` | Content types accepted from the remote host, checked only when `checkResponseContentType` is `true` |
| `checkResponseContentType` | `true` refuses remote responses whose content type is not in `mimetypeWhitelist`. Default `false`. Enable it only with a list that names every content type your services return |
| `hostsWhitelist` | Client IP addresses allowed to use the proxy. Empty means every client |
| `reqtypeWhitelist.<name>` | Regular expressions on the requested URL: when at least one is defined, the URL must match one of them |

## Connection settings

| Property | Description |
|---|---|
| `timeout` | Socket timeout in milliseconds: maximum inactivity between two data packets |
| `connection_timeout` | Timeout in milliseconds to establish the connection |
| `max_total_connections` | Maximum number of connections |
| `default_max_connections_per_host` | Maximum number of connections per host |
| `defaultStreamByteSize` | Size of the buffer used to stream the response |
