# Threat model

The scanner reads this file before it starts. It covers MapStore on the `master` branch. Our
disclosure policy is in [SECURITY.md](../SECURITY.md).

## What this project does and where untrusted input enters

MapStore is a WebGIS framework: a React/Redux single page application (`web/client/`) and a Java 17
web application (`java/`, packaged by `product/` as `mapstore.war`) that bundles
[GeoStore](https://github.com/geosolutions-it/geostore) (storage of maps, dashboards, stories, contexts,
users and permissions) and the [HTTP Proxy](https://github.com/geosolutions-it/http-proxy). Public
instances serve anonymous visitors; logged-in users create and share content; administrators configure
contexts, extensions and users. GeoStore and the HTTP Proxy have their own scans and threat models: here
their code is in scope only through how MapStore configures and calls them.

Untrusted input:

- **URLs a victim opens**: the hash routes (`#/viewer/<id>`, `#/context/...`, `#/dashboard/...`,
  `#/geostory/...`), query parameters (`map=`, `config=`, `center`, `zoom`, `bbox`, `actions`, `featureinfo`,
  `addLayers`, ...), permalinks and shared links, the embedded pages (`embedded.html`,
  `dashboard-embedded.html`, `geostory-embedded.html`, `api.html`) and the `/rest/config/setParams` POST
  handler that redirects into the application.
- **Content saved by other users** in GeoStore and rendered for the viewer: map configurations, layer
  options, feature info templates, dashboard widgets (text, charts, tables), GeoStory sections (rich text,
  media, embedded web pages), context configurations, resource names, descriptions, attributes, comments.
- **Responses of remote services** the user or a shared map points to: WMS/WMTS/WFS/CSW capabilities and
  GetFeatureInfo (HTML, text, JSON), feature attributes, catalog records, vector files (GeoJSON, KML, KMZ,
  Shapefile), 3D tilesets, and anything fetched through `/proxy/`.
- **Uploaded files**: vector and map imports in the browser; extension zip archives uploaded by
  administrators (`/rest/config/uploadPlugin`).
- **Anonymous HTTP requests** to the backend: `/configs/*`, `/rest/config/load/*`, `/rest/config/loadasset/*`,
  `/extensions/*`, `/proxy/*`, `/pdf/*` (MapFish Print), `/rest/geostore/*`.

Trusted: the data directory (`datadir.location`) and its JSON/properties overrides, `localConfig.json`
and its patches, the deployed extensions (after upload), the servlet container and the reverse proxy.

### Security goals

1. **No script execution from data.** Content from other users, remote services, files and URL parameters
   must not run script in the MapStore origin. MapStore sanitizes HTML (`utils/HtmlSanitizer.js`), restricts
   template expressions (`utils/TemplateUtils.js`) and URLs in links (`utils/URLUtils.js`). Bypasses of these,
   and rendering paths that skip them (`dangerouslySetInnerHTML`, `innerHTML`, `href`/`src` with `javascript:`
   or `data:`, iframes, OpenLayers/Leaflet/Cesium popups and labels, Markdown) are in scope.
2. **Credential containment.** Credentials MapStore adds to requests (GeoStore session and access tokens,
   `authenticationRules` in `SecurityUtils.js`: bearer, basic, `authkey`) must go only to the services the
   rules target.
3. **No open redirect or navigation hijack** from URL parameters, `setParams` `page`, login/logout flows.
4. **Backend paths stay inside their roots.** `/configs/*`, `/rest/config/load*` and `/extensions/*` serve only
   allowed files from the data directory or the webapp; extension upload and uninstall are ADMIN only and
   must not write outside the extensions folder (zip slip, JSP or server-side files).
5. **Printing.** `/pdf/*` (MapFish Print) must not read local files or reach destinations the configuration
   forbids.

## Components that matter most / least

Highest priority:

- `web/client/utils/` (`HtmlSanitizer.js`, `TemplateUtils.js`, `URLUtils.js`, `SecurityUtils.js`,
  `PrintUtils.js`), `web/client/libs/ajax.js` (proxy and authentication interceptors),
  `web/client/api/` (service clients that parse remote responses).
- Plugins that render remote or user HTML: Identify/feature info, GeoStory, Dashboard text widgets,
  Details/resource descriptions, Catalog, TOC layer metadata, Annotations, Share/Permalink, Map import.
- URL handling: `web/client/epics/queryparams.js`, `utils/QueryParamsUtils.js`, the routers in
  `web/client/product/`.
- Backend: `java/services/src/main/java/it/geosolutions/mapstore/controllers/` (configs, assets, extensions,
  `SetParamsController`, `UploadPluginController`), `java/web/src/main/webapp/WEB-INF/web.xml` and the
  Spring configuration in `java/web/src/main/resources/` (with the GeoStore security context it loads).

Lower priority: `docs/`, `utility/`, `build/`, `binary/`, test resources and `*-test.js(x)` files (out of
scope).

`project/` holds the templates a new downstream project is created from. They are meant to reproduce the
product (`product/`, `java/web/`): report them only where they are not aligned with it, for example a
template that lacks a protection the product configuration has.

Working rules: a test that asserts a behaviour marks it as deliberate. Read the code and probe the running
instance: some defects (URL parsing, redirects, encoded paths, header handling by the container) only show
up by sending requests, so use the instance to explore as well as to confirm. Once a root cause has a
reproducer and a patch, write it up rather than listing variants.

## How to exercise it

- Frontend tests (Karma + headless Chromium, `CHROME_BIN` is set): `npm test` runs all of them and is slow
  on two CPUs. To run a subset, change the regular expression in `build/tests-firefox.webpack.js` (the file
  `npm test` loads, despite its name) so that it matches only the test files you need, for example
  `/utils\/__tests__\/.*-test\.jsx?$/` for the tests of `web/client/utils/`, and run `npm test`.
- Backend tests: `mvn -o test -Pprinting` from `/src`.
- Running instance, offline:
  `INITIAL_ADMIN_PASSWORD=<password> CATALINA_OPTS=-XX:-UseBASE64Intrinsics /opt/tomcat/bin/catalina.sh run`, then
  `http://localhost:8080/mapstore/`. The application loads OpenStreetMap tiles and other remote services by
  default; without network those requests fail, which does not affect the security checks. Create a second
  `USER` account through `/mapstore/rest/geostore/users` as admin to test content shared between users.
  A small local service (`python3 -m http.server`) can play the remote WMS/WFS server.
- The documentation is in `docs/`; its index is the `nav` section of `mkdocs.yml` at the repository root.

## How we rate severity

Rate against a default deployment. Name the role the attacker starts with and what they gain.

- **Critical**: unauthenticated code execution on the server; script execution in the MapStore origin that
  needs no user interaction beyond opening a MapStore link and that leads to an admin account takeover.
- **High**: stored XSS from content a `USER` can save and others open (maps, dashboards, stories, contexts);
  reflected or DOM XSS through a MapStore link; leak of session tokens or stored credentials
  to a third party; path traversal reading files outside the allowed roots; zip slip in
  extension upload.
- **Medium**: XSS that needs the victim to add an attacker's service or file themselves (catalog URL,
  imported file) or to click inside the map after opening it; open redirect; content injection without
  script execution; SSRF through printing to public hosts only.
- **Low**: missing hardening headers that the default deployment sets elsewhere, information disclosure
  without impact, self-XSS.
- A script blocked by the deployed Content Security Policy still counts if the payload reaches an
  executable sink, but at one level lower.
- Admin-only issues (localConfig, context or extension content written by an administrator) are not findings
  unless they reach the server host or other administrators' credentials.

## Anything to leave alone

- Dependabot and CodeQL already scan this project: do not report dependency CVEs or plain CodeQL patterns
  unless you show they are reachable and exploitable. Focus on logic flaws: authorization, sanitizer
  bypasses, credential leaks, path handling.
- Findings only in tests, docs, examples or build scripts.
- GeoStore and HTTP Proxy internals (scanned separately); report here only a wrong use from MapStore.
