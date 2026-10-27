# Privacy and Consent Configuration

The `Cookie` plugin supports shared privacy settings and an optional-integration lifecycle. Vanilla enables the privacy panel on the home page, Maps, Dashboards, GeoStories and embedded resources. Custom applications must include the plugin in each relevant plugin registry and route configuration.

## Default configuration

The top-level `privacy` object in `configs/localConfig.json` controls the panel:

```json
{
  "privacy": {
    "enabled": true,
    "policyVersion": "vanilla-2026.03-consent-1",
    "retentionDays": 180,
    "categories": []
  }
}
```

The default configuration does not configure `privacy.links`, so the panel links the template pages shipped with MapStore. Each template page says that it is not the policy of the installation. The panel shows a warning to every user, with a link to this documentation, and the plugin writes a warning in the browser console. The warning disappears when the installation configures its own pages or disables the panel with `"enabled": false`. Replace them with the pages of the installation, as described in [Policy pages](#policy-pages).

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

This object belongs to `privacy`. Categories are off before a valid choice. Adding a category does not automatically control a plugin, script, iframe or service: its implementation must use the consent lifecycle, with `registerConsentIntegration` in MapStore code or with the `SET_PRIVACY_CHOICE` action in an extension (see [Optional integrations in an extension](#optional-integrations-in-an-extension)).

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

Storage read or write failures do not enable optional tools. When a choice cannot be saved, the panel stays open with the error and optional tools stay off on the page, even if an older consent can still be read; MapStore also tries to remove that older record. A storage-removal failure also leaves an invalid record inactive.

Update `policyVersion` when the purposes, integrations or material notice conditions change. Review the configured retention and the choice mechanism for the actual deployment. Setting `privacy.enabled` to `false` hides the panel and its footer entry: MapStore shows no cookie or privacy notice. Without the `privacy` section the panel is hidden too, unless an installed extension enables it.

## Policy pages

The panel links up to three pages: Cookie Policy, Privacy Policy and Terms of Use. Each installation must provide its own pages, because their content depends on who operates it and on the services it uses.

The panel takes the links from the first of these sources that configures at least one page:

1. `privacy.links` in `localConfig.json`, see [Configure the links](#configure-the-links).
2. An installed privacy settings extension, see [Privacy settings extension](#privacy-settings-extension).
3. The template pages shipped with MapStore, in `product/assets/privacy`. They are in English and describe the cookies and browser storage of MapStore with the default configuration. A notice at the top of each page says that it is a template and links this section. Use them as a starting point, never as the published policy.

### Which pages to provide

| Key | Page | When it is needed |
| --- | --- | --- |
| `cookie` | Cookie Policy: cookies and browser storage used by the installation, their purpose and duration | Every installation, because MapStore always uses technical browser storage (authentication, privacy choices, user settings). |
| `privacy` | Privacy Policy: personal data processed by the operator, purposes, legal bases, recipients, retention and rights | When the installation processes personal data, for example user accounts, saved content or server logs. Usually it is needed. |
| `terms` | Terms of Use: conditions of the service | Optional. Leave it out when the installation has no specific conditions. |

Every link is optional: the panel shows only the links that are configured, and a missing key does not break the panel. A page can also be a single document that covers more topics, for example one page for both the Cookie Policy and the Privacy Policy: link the same url, or link it only once. The content of the pages is the responsibility of the operator of the installation; **the templates are a starting point, not legal advice**.

### Configure the links

Each link is a url, relative to the MapStore application or absolute. It can be a single url, used for every language, or an object of urls by locale for pages translated in more languages. The keys of the object are the locale codes of MapStore, for example `en-US` and `it-IT`. When the current locale has no url, the panel uses the first one configured, so a page in one language is enough.

```json
{
  "privacy": {
    "links": {
      "cookie": {
        "en-US": "extensions/PrivacySettings/assets/en-US/cookie.html",
        "it-IT": "extensions/PrivacySettings/assets/it-IT/cookie.html"
      },
      "privacy": "https://www.example.com/privacy-policy",
      "terms": "extensions/PrivacySettings/assets/en-US/terms.html"
    }
  }
}
```

### Where to keep the pages

- **External pages**: when the operator already publishes its policies, for example on its corporate website, link their absolute urls. No file is added to MapStore.
- **MapStore project**: version the pages in the project assets, for example `assets/privacy/cookie.html`, and link them in the project `localConfig.json`.
- **MapStore product installation**: publish the pages with the privacy settings extension and upload it from the context creator. No configuration file needs to change, and the pages are kept when MapStore is upgraded, because extensions are stored in the [data directory](externalized-configuration.md).

### Privacy settings extension

The [mapstore-privacy-settings-extension](https://github.com/geosolutions-it/mapstore-privacy-settings-extension) repository is an extension template for privacy settings. Create a repository from it for each operator: it contains the pages to complete a `privacy.config.json` with the privacy configuration and a build that checks them and creates the zip to upload. Its pages can also be copied into the assets of a project.

The pages of the template are in English, in `assets/en-US`, with the MapStore logo in `assets/logo.png`:

- `cookie.html`: prefilled cookie and browser-storage inventory for the inspected Vanilla baseline, including conditional features and external demo services.
- `privacy.html`: personal-data processing information, with operator-specific fields for purposes, legal bases, recipients, transfers, retention and rights.
- `terms.html`: installation-specific service conditions, separate from privacy information and optional consent.

To publish the pages in more languages, list the locales in `locales` of `privacy.config.json` and add one folder for each locale in `assets`, with the same pages, for example `assets/it-IT/cookie.html`. The build checks that every locale has all the pages. The extension links the page of the current language of MapStore, and the page of the first locale of the list when that language has no pages.

```json
{
  "locales": ["en-US", "it-IT"],
  "pages": ["cookie", "privacy", "terms"]
}
```

Complete the highlighted fields and verify all providers, plugins, authentication, server logs and infrastructure before publication: the build refuses pages that still contain them. The software vendor is not automatically the data controller. Browser-storage durations do not establish server or provider retention policies.

GeoSolutions OSM Bright is distinct from `tile.openstreetmap.org`. The observed GeoServer `GS_FLOW_CONTROL` cookie supports technical request/load control; it is not described as statistics. Browser blocking does not mean that a service did not emit a cookie. Review actual headers and purposes for the deployed services.

### Configuration from an extension

MapStore loads every installed extension when the application starts, before the first render. An extension can set the privacy configuration by dispatching at that moment:

```javascript
setControlProperty('privacy', 'defaults', {
    enabled: true,
    policyVersion: 'operator-1',
    retentionDays: 180,
    categories: [],
    links: {
        cookie: {'en-US': 'extensions/PrivacySettings/assets/en-US/cookie.html'},
        privacy: {'en-US': 'extensions/PrivacySettings/assets/en-US/privacy.html'},
        terms: {'en-US': 'extensions/PrivacySettings/assets/en-US/terms.html'}
    }
});
```

The `Cookie` plugin uses this configuration only when `localConfig.json` does not configure `privacy.links`: when it does, the operator manages the privacy configuration in `localConfig.json` and the extension is ignored. Otherwise:

| Key | Effect |
| --- | --- |
| `links`, `policyVersion`, `retentionDays`, `categories` | Replace the values of `localConfig.json`. |
| `enabled` | Used only when `localConfig.json` has no `privacy` section. |

Change `policyVersion` every time the content of the pages changes, so that users are asked for their choices again. Removing the extension restores the configuration of `localConfig.json`.

To link other pages without changing the extension, add `privacy.links` to the `localConfig.json.patch` of the data directory:

```json
[{
  "op": "add",
  "path": "/privacy/links",
  "value": {
    "cookie": "extensions/PrivacySettings/assets/en-US/cookie.html",
    "privacy": "https://www.example.com/privacy-policy"
  }
}]
```

### Optional integrations in an extension

`registerConsentIntegration` is not available to extensions, which do not share the modules of MapStore. An extension follows the consent of the user through the `SET_PRIVACY_CHOICE` action instead: MapStore dispatches it every time the choice changes (start, save, withdrawal, another tab, expiry, new policy version), with the validated choice or `null`, and keeps the last one in `state.cookie.privacyChoice`.

```javascript
// epic of an extension: starts the integration with the consent to "statistics", stops it otherwise
action$.ofType('SET_PRIVACY_CHOICE')
    .map(({choice}) => choice?.categories?.statistics === true)
    .distinctUntilChanged()
    .do(allowed => allowed ? start() : stop())
    .filter(() => false);
```

The template of the privacy settings extension implements this in its `src/integrations.js`.

### Texts of the panel

The texts of the panel are the `privacySettings` messages of the MapStore translation files. They can be replaced from the extension or from the configuration, with `data.<locale>.json` files that contain only the messages to change, for example:

```json
{
  "locale": "en-US",
  "messages": {
    "privacySettings": {
      "required": "Authentication, security and your privacy settings. See the Cookie Policy for details."
    }
  }
}
```

- **Extension**: put the files in the `translations` folder of the extension. The messages of extensions are applied after the ones of MapStore.
- **Configuration**: put the files in a folder of the [data directory](externalized-configuration.md), for example `extensions/customizations/translations`, and add the folder to `translationsPath` with the `localConfig.json.patch` of the data directory. The folders are read in order, so the messages of the last one replace the previous ones.

```json
[{
  "op": "add",
  "path": "/translationsPath",
  "value": ["translations", "extensions/customizations/translations"]
}]
```

In a MapStore project, add the folder of the project to `translationsPath` in the same way, as described in [Customize configuration, assets and translations](advanced-project-customization.md#customize-configuration-assets-and-translations).

In both cases, languages without a file keep the MapStore texts.

## Verification

Run `npm test`, `npm run i18n`, `npm run jsdoc:build` and `npm run fe:build` using the repository's supported environment. Tests cover consent activation and teardown, migration, expiry, storage failures, sharing and embedded plugin registration.

For browser validation, exercise first entry and footer access on every configured route, necessary-only dismissal, optional refusal and granular choices, withdrawal across two tabs, reload, login/logout, saved-map sharing and embeds. Test any real optional adapter with network and storage inspection; use synthetic services during development. Do not ship a test fixture as an active optional service in the default configuration.
