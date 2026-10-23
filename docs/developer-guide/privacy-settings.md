# Privacy and Consent Configuration

The `Cookie` plugin supports shared privacy settings and an optional-integration lifecycle. Vanilla enables the privacy panel on the home page, map viewers, Dashboards, GeoStories and embeds. Custom applications must include the plugin in each relevant plugin registry and route configuration.

## Default configuration

The top-level `privacy` object in `configs/localConfig.json` controls the panel:

```json
{
  "privacy": {
    "enabled": true,
    "policyVersion": "vanilla-2026.03-consent-1",
    "retentionDays": 180,
    "categories": [],
    "links": {
      "cookie": "product/assets/privacy/cookie-demo.html",
      "privacy": "product/assets/privacy/privacy-demo.html",
      "terms": "product/assets/privacy/terms-demo.html"
    }
  }
}
```

An empty category list means that no optional tools are configured. The first-visit panel is informational, with a Close action. Its dismissal is distinct from consent. Do not add optional categories merely because the application requests a remote map service.

The plugin contributes an entry to `Footer` and `MapFooter`. Where neither footer exists, it provides a bottom bar. Embedded maps position `MapFooter` in the `footer` container so that its controls remain accessible above the map canvas.

## Configure optional categories

Supported optional IDs are `functional`, `statistics` and `marketing`. Configure only categories that are actually used, with descriptions of their purposes:

```json
{
  "categories": [
    {
      "id": "functional",
      "description": {
        "en-US": "Describe the optional feature and the data it uses.",
        "it-IT": "Descrivere la funzione opzionale e i dati utilizzati."
      }
    }
  ]
}
```

This object belongs inside `privacy`. Categories are off before a valid choice. Adding a category does not automatically control a plugin, script, iframe or service: its implementation must use the consent lifecycle.

## Register an optional integration

Use `registerConsentIntegration` from `web/client/utils/ConsentManager.js`. Register an inert factory, with no optional requests or storage writes at module load time. The factory runs only when its category is allowed.

```javascript
import { registerConsentIntegration } from '../utils/ConsentManager';

const unregister = registerConsentIntegration(
    'optional-feature',
    'functional',
    ({signal, isAllowed}) => {
        const feature = createOptionalFeature({signal, isAllowed});
        return () => feature.destroy();
    }
);

// Call when the integration is removed or its owning component unmounts.
unregister();
```

`createOptionalFeature` represents the application's own adapter. It must honour the `AbortSignal`, check `isAllowed()` before further work, and return a synchronous teardown. Teardown must stop timers and listeners, detach optional content and remove any storage the integration owns where technically possible. Integrations need unique IDs. Policy changes, refusal, expiry and withdrawal disable unsupported or unconsented categories.

Withdrawal cannot undo transmitted requests, remote logs or browser caches, and cannot remove cookies owned by another domain. An integration that cannot stop cleanly needs an explicit implementation and documented limits before it is enabled.

## Storage and migration

Storage keys use MapStore's application namespace:

| Key | Meaning and lifecycle |
| --- | --- |
| `mapstore.privacy.choices` | Schema 2: policy version, decision time, expiry and boolean category choices. Written after an optional choice, including refusal. |
| `mapstore.privacy.notice` | Schema 1: policy version, dismissal time and expiry for necessary-only information. It grants no optional consent. |
| `mapstore.cookie.approved`, `cookies-policy-approved` | Legacy acknowledgements. Removed when the new privacy configuration is enabled, without conversion to consent or a new dismissal. |

The baseline validity is 180 days. Invalid, expired or superseded privacy records are removed on their next read when storage permits. Optional records are removed when no optional categories are configured. Valid applicable choices and necessary-only dismissals are retained. Cleanup compares the stored value before removal to avoid deleting a newer decision from another tab.

Storage read or write failures do not enable optional tools. A storage-removal failure also leaves an invalid record inactive. The migration does not clear authentication or unrelated application storage.

Update `policyVersion` when the purposes, integrations or material notice conditions change. Review the configured retention and the choice mechanism for the actual deployment. Setting `privacy.enabled` to `false` retains the legacy cookie notice behavior; its acknowledgement is not a replacement for optional consent management.

## Policy templates and service inventory

The three English templates under `web/client/product/assets/privacy/` use the existing MapStore logo:

- `cookie-demo.html`: prefilled cookie and browser-storage inventory for the inspected Vanilla baseline, including conditional features and external demo services.
- `privacy-demo.html`: personal-data processing information, with operator-specific fields for purposes, legal bases, recipients, transfers, retention and rights.
- `terms-demo.html`: installation-specific service conditions, separate from privacy information and optional consent.

Complete the highlighted fields and verify all providers, plugins, authentication, server logs and infrastructure before publication. The software vendor is not automatically the data controller. Browser-storage durations do not establish server or provider retention policies.

GeoSolutions OSM Bright is distinct from `tile.openstreetmap.org`. The observed GeoServer `GS_FLOW_CONTROL` cookie supports technical request/load control; it is not described as statistics. Browser blocking does not mean that a service did not emit a cookie. Review actual headers and purposes for the deployed services.

## Sharing and build changes

The standard Share panel no longer mounts Social sharing or automatic counters. Link copy, QR code, permalink and embed options remain subject to their existing configuration and resource permissions. A legacy Social-tab selection falls back to Link; custom clients relying on Social must adapt.

Browser detection is served from the local Bowser asset, with its license included. Initial external font requests are removed. A scoped webpack replacement removes `dxf-parser`'s persistent diagnostic level while retaining parsing and in-memory logging. Custom builds should retain the replacement and package the local vendor assets and policy stylesheet. Docker and Helm files do not change for this feature.

## Verification

Run `npm test`, `npm run i18n`, `npm run jsdoc:build` and `npm run fe:build` using the repository's supported environment. Tests cover consent activation and teardown, migration, expiry, storage failures, sharing and embedded plugin registration.

For browser validation, exercise first entry and footer access on every configured route, necessary-only dismissal, optional refusal and granular choices, withdrawal across two tabs, reload, login/logout, saved-map sharing and embeds. Test any real optional adapter with network and storage inspection; use synthetic services during development. Do not ship a test fixture as an active optional service in the default configuration.
