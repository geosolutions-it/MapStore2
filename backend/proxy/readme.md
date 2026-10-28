# HTTP proxy

http-proxy is a simple Java based HTTP proxy that can be used to make cross origin calls from JavaScript based web applications. In MapStore it serves the `/proxy` endpoint; see the [proxy configuration](../../docs/developer-guide/proxy-configuration.md) page of the developer guide.

It used to live in its own repository, [geosolutions-it/http-proxy](https://github.com/geosolutions-it/http-proxy), which keeps its history and the maintenance branches of the releases before MapStore 2027.01.00. It is now part of MapStore, and built, versioned and released with it. Its Maven coordinates are `it.geosolutions.proxy:http_proxy` (formerly `proxy:http_proxy`).

## Build

The proxy is a module of MapStore's Maven reactor: dependency versions are managed in MapStore's root `pom.xml`. From the root of the MapStore repository:

```bash
mvn clean install -f backend/proxy/pom.xml
```

It produces the `http_proxy` WAR, used as an overlay by MapStore's webapp, and a jar with the same coordinates.

## License

The HTTP proxy is free and Open Source software, released under the [GPL v3](https://www.gnu.org/licenses/gpl-3.0.html) license (see [LICENSE](LICENSE)). Note that the rest of MapStore is released under the BSD 2-Clause license.
