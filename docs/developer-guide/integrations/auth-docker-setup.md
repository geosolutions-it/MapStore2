# Auth Docker Setup

This page describes a quick local authentication environment for MapStore developers and environment maintainers. It extends the default Docker setup with Keycloak, OpenLDAP and an authentication-aware Nginx proxy, so you can quickly test MapStore login flows and sample user/group mappings.

The stack is intended as a starting point. For the full configuration details, see the dedicated guides for [LDAP](users/ldap.md#ldap-integration-with-mapstore), [OpenID Connect](users/openId.md#integration-with-openid-connect), [Keycloak](users/keycloak.md#keycloak-integrations), [MapStore authentication](auth.md#mapstore-authentication---implementation-details) and the available [infrastructure setups](infrastructure-setups.md#possible-setups).

!!! warning
    The provided files contain public sample credentials, sample users, a sample Keycloak realm and sample LDAP entries. They are useful only for local development and testing. They are not secrets, they are not secure defaults, and they must be changed before using this setup outside a disposable local environment.

## Services

The auth Docker setup includes:

- **MapStore**: the application container, configured with a mounted datadir.
- **PostgreSQL/PostGIS**: the GeoStore database from the base `docker-compose.yml`.
- **Nginx**: the reverse proxy exposed on `http://localhost`.
- **Keycloak**: an OpenID Connect identity provider exposed at `http://localhost/keycloak`.
- **OpenLDAP**: a sample LDAP directory used to test LDAP users, groups and roles.

The proxy exposes the applications on the same host:

- MapStore: [http://localhost/mapstore](http://localhost/mapstore)
- Keycloak: [http://localhost/keycloak/](http://localhost/keycloak/)
- Keycloak admin console: [http://localhost/keycloak/admin/](http://localhost/keycloak/admin/)

## Prerequisites

Before starting the stack, make sure you have:

- Docker and Docker Compose installed.
- A MapStore WAR available as `mapstore.war` in the repository root, or adjust the `MAPSTORE_WEBAPP_SRC` build argument in `docker/docker-compose.auth.yml`.
- A MapStore WAR built with the LDAP profile if you want to test LDAP username/password login. See [building and deploying](../building-and-deploying.md#building-and-deploying) and the [LDAP integration guide](users/ldap.md#building-mapstore-with-ldap-support).

For Keycloak OpenID login only, the sample datadir enables the Keycloak provider through `mapstore-ovr.properties`. For LDAP login, the MapStore backend must also include the LDAP security configuration.

### MapStore WAR source

The auth compose overlay builds the MapStore image with this default argument:

```yaml
MAPSTORE_WEBAPP_SRC: "mapstore.war"
```

This means Docker expects a `mapstore.war` file in the repository root. If the file is missing, the MapStore image build will fail. You can either copy your built WAR to `./mapstore.war` or edit `docker/docker-compose.auth.yml` to point `MAPSTORE_WEBAPP_SRC` to another local WAR path or a downloadable WAR URL.

## Prepare Environment Variables

Copy the sample environment file to the repository root:

```sh
cp docker/.env.auth.example .env
```

Review the values before starting the stack. The most relevant variables are:

- `KEYCLOAK_ADMIN` and `KEYCLOAK_ADMIN_PASSWORD`: credentials for the Keycloak admin console.
- `KEYCLOAK_HOSTNAME`: public Keycloak URL used in redirects. The local default is `http://localhost/keycloak`.
- `LDAP_ADMIN_PASSWORD`, `LDAP_CONFIG_PASSWORD` and `LDAP_READONLY_PASSWORD`: OpenLDAP administrative and read-only bind credentials.
- `DATADIR_PATH`: optional path to the MapStore datadir mounted in the container. If omitted, `./datadir` is used.

!!! warning
    Do not reuse the sample passwords or client secret in shared, staging or production environments. The placeholder values in this repository are intentionally guessable. Update `.env`, the Keycloak realm, LDIF files and MapStore datadir properties consistently.

## Prepare The Datadir

Create a local datadir from the provided sample:

```sh
mkdir -p datadir
cp -R docker/sample-datadir/. datadir/
```

The sample datadir contains:

- `mapstore-ovr.properties`: enables Keycloak OpenID login and configures the `mapstore-server` client.
- `ldap.properties`: sample LDAP connection, search filters and role mapping properties.
- `geostore-datasource-ovr.properties`: sample PostgreSQL datasource configuration for GeoStore.
- `configs/localConfig.json.patch`: adds Keycloak as an authentication provider in the login UI.

The sample follows the production-oriented OpenID mapping model used by GeoStore 2.6+:

- Identity-provider roles map only to MapStore roles, currently `ADMIN` or `USER`.
- Identity-provider groups map to MapStore user groups, such as `KC_ADMINS`, `KC_USERS`, `MS_ADMINS` or `MS_USERS`.
- `dropUnmapped=true` is used for sample OpenID group mappings, so only groups explicitly listed in `groupMappings` are created and assigned in MapStore.

The sample `mapstore-ovr.properties` intentionally separates the internal and public Keycloak URLs:

- Browser-facing authorization and redirect URLs use `http://localhost/...`, because the local Nginx proxy exposes both MapStore and Keycloak on that host.
- Backend-only token, userinfo, certificate, logout, revocation and introspection URLs use `http://host.docker.internal/keycloak/...`, so MapStore calls the same local proxy from inside Docker without depending on the direct Keycloak container network name.

Do not point backend-only MapStore OpenID endpoints at `http://localhost/keycloak/...` inside this Docker setup. `localhost` is also the MapStore container itself, so server-side callback operations such as token exchange and key retrieval can fail or depend on host-specific Docker networking behavior. For non-Docker deployments, replace `http://host.docker.internal/keycloak` with a Keycloak/proxy URL reachable from the MapStore backend.

The sample also enables OpenID global logout and redirects back to `http://localhost/mapstore/`, so a MapStore logout clears the Keycloak SSO session instead of silently logging the user in again on the next Keycloak login attempt.

!!! note
    The sample Keycloak realm and LDAP credentials are intended for local testing only. Keep `docker/keycloak/realm-mapstore.sample.json` and the shipped LDIF data as local test data, and replace client secrets and user passwords before using the setup on another machine or in a shared environment.

!!! note
    The sample `mapstore-ovr.properties` uses `keycloakOAuth2Config.autoCreateUser=true` so the sample Keycloak users and mapped groups are created and synchronized in a DB-backed GeoStore setup. Set it to `false` only when the WAR is built in LDAP-direct/read-only user-store mode; in that case, make sure the Keycloak usernames are already available in the external user store.

When you use a MapStore WAR built in LDAP-direct mode, `ldap.properties` must also define `ldap.memberPattern`. The shipped sample uses `^uid=([^,]+).*$`, which matches the sample OpenLDAP `member` values such as `uid=ldapadmin,ou=people,dc=acme,dc=org`.

These files are regular MapStore externalized configuration files. See [configuration files](../configuration-files.md#configuration-files) and [externalized configuration](../externalized-configuration.md#externalized-configuration) for more details about datadir-based overrides.

## Prepare Keycloak

The auth stack imports a Keycloak realm at first startup. The realm defines the `mapstore` realm, sample users, roles and the confidential OpenID Connect client used by MapStore.

Copy the sample realm into the filename expected by the compose file:

```sh
cp docker/keycloak/realm-mapstore.sample.json docker/keycloak/realm-mapstore.json
```

The sample realm configures:

- Realm: `mapstore`
- Client: `mapstore-server`
- Client secret: `changeme-mapstore-oidc-client-secret-123`
- Redirect URI: `http://localhost/mapstore/*`
- Realm roles: `admin`, `user`
- Realm groups: `kc-admins`, `kc-users`
- Client mapper: a Group Membership mapper that emits group names in the OIDC `groups` claim
- Sample users: `kcuser`, `kcadmin`

The client and secret must match the values in `datadir/mapstore-ovr.properties`. If you change the realm file, update the MapStore datadir configuration accordingly. For details about Keycloak OpenID configuration, see the [Keycloak section of the OpenID Connect guide](users/openId.md#keycloak).

The sample uses Keycloak realm roles for MapStore role mapping:

```properties
keycloakOAuth2Config.rolesClaim=realm_access.roles
keycloakOAuth2Config.roleMappings=admin:ADMIN,user:USER
```

It uses Keycloak groups for MapStore user-group mapping:

```properties
keycloakOAuth2Config.groupsClaim=groups
keycloakOAuth2Config.groupMappings=kc-admins:KC_ADMINS,kc-users:KC_USERS
keycloakOAuth2Config.dropUnmapped=true
```

This keeps the test bench close to a real customer setup: administrative authority and group membership can be changed independently in the identity provider.

### Keycloak Test Users

| Username | Password | Email | Keycloak role | Keycloak group | MapStore role | MapStore group |
| --- | --- | --- | --- | --- | --- | --- |
| `kcuser` | `changeme-kcuser-pw-123` | `kcuser@acme.org` | `user` | `kc-users` | `USER` | `KC_USERS` |
| `kcadmin` | `changeme-kcadmin-pw-123` | `kcadmin@acme.org` | `admin` | `kc-admins` | `ADMIN` | `KC_ADMINS` |

The Keycloak admin console is available at [http://localhost/keycloak/admin/](http://localhost/keycloak/admin/) with the `KEYCLOAK_ADMIN` and `KEYCLOAK_ADMIN_PASSWORD` values configured in `.env`. The admin user belongs to the Keycloak `master` realm and is used to manage Keycloak, not to log in to MapStore.

## Optional Microsoft Entra Provider

The sample `mapstore-ovr.properties` includes a commented Microsoft Entra template. It is intentionally disabled because every Entra tenant requires tenant-specific IDs and a real client secret. To enable it in a local copied datadir:

1. Change `oidc_providers=keycloak` to `oidc_providers=keycloak,microsoft`.
2. Uncomment the `microsoftOAuth2Config.*` block.
3. Fill in `clientId`, `clientSecret` and the tenant-specific `discoveryUrl`.
4. Add a Microsoft entry to `datadir/configs/localConfig.json.patch` with `"provider": "microsoft"`.
5. Register `http://localhost/mapstore/rest/geostore/openid/microsoft/callback` as a Web redirect URI in the Entra app registration.
6. Add readable user claims such as `email`, `preferred_username` and `unique_name`, then set `microsoftOAuth2Config.principalKey` to a claim that is actually present in the token returned by your tenant.

The Microsoft login entry should use the same provider name as the backend prefix:

```json
{
  "type": "openID",
  "provider": "microsoft",
  "title": "Microsoft"
}
```

For a realistic client-style setup, use **Entra App Roles** for MapStore `ADMIN` / `USER` role mapping and **Entra security groups** for MapStore user-group mapping. Avoid using the same App Role claim for both roles and groups unless you are deliberately testing a shortcut.

The sample uses `microsoftOAuth2Config.principalKey=email` because the local Microsoft Entra test token includes a readable `email` claim while `preferred_username` may be absent from the token/userinfo data used by this GeoStore 2.6 flow. For a client tenant, inspect the actual returned claims and prefer a stable readable value such as `email`, `preferred_username` or `unique_name`.

### Entra Role Mapping

In the App Registration, create app roles like these:

| Display name | Value | Allowed member types | MapStore role |
| --- | --- | --- | --- |
| `MapStore Admin` | `MapStore.Admin` | Users/Groups | `ADMIN` |
| `MapStore User` | `MapStore.User` | Users/Groups | `USER` |

Assign users or groups to these roles from **Enterprise applications** -> your application -> **Users and groups**. The token should then contain a `roles` claim. Configure MapStore with:

```properties
microsoftOAuth2Config.rolesClaim=roles
microsoftOAuth2Config.roleMappings=MapStore.Admin:ADMIN,MapStore.User:USER
microsoftOAuth2Config.authenticatedDefaultRole=USER
```

`MapStore.User` is optional when `authenticatedDefaultRole=USER` is present, but keeping it in the test bench lets you verify both explicit user and admin mappings.

### Entra Group Mapping

Create or choose Entra security groups for MapStore groups, for example:

| Entra group | MapStore group |
| --- | --- |
| `MS_ADMINS` | `MS_ADMINS` |
| `MS_USERS` | `MS_USERS` |

For the most stable production-like mapping, use the Entra group **Object ID** values in `groupMappings`:

```properties
microsoftOAuth2Config.groupsClaim=groups
microsoftOAuth2Config.groupMappings=<MS_ADMINS_GROUP_OBJECT_ID>:MS_ADMINS,<MS_USERS_GROUP_OBJECT_ID>:MS_USERS
microsoftOAuth2Config.dropUnmapped=true
```

To get the `groups` claim in the token, configure the Entra app registration to emit group claims. A practical setup is:

1. Open **App registrations** -> your app -> **Token configuration**.
2. Add a **Groups claim**.
3. Prefer groups assigned to the application when available, so the token contains only groups relevant to this app.
4. Assign the `MS_ADMINS` and `MS_USERS` groups to the Enterprise Application.

By default, Entra emits group Object IDs. That is usually the safest value to map because display names can change. If a client explicitly wants display names, configure the app manifest to emit cloud display names for app-assigned groups and use those display names in `groupMappings` instead:

```json
{
  "groupMembershipClaims": "ApplicationGroup",
  "optionalClaims": {
    "idToken": [
      {
        "name": "groups",
        "additionalProperties": ["cloud_displayname"]
      }
    ]
  }
}
```

When group claims are enabled broadly, users in many groups can hit Entra's group overage behavior and the token may omit the normal `groups` list. For this test bench, prefer app-assigned groups and `dropUnmapped=true` so the MapStore side stays deterministic.

## Prepare OpenLDAP

OpenLDAP is initialized from `docker/openldap/ldap-init.ldif` when the LDAP data volume is empty. The repository ships the complete bootstrap data in that single file, so it is the source of truth for organizational units, users, groups and roles.

The LDAP bootstrap file defines:

- Organizational units, such as `ou=people` and `ou=groups`.
- Sample users, including `ldapadmin` and `ldapuser`.
- LDAP groups and roles, including `ROLE_ADMIN`, `ROLE_USER`, `LDAP_ADMINS` and `LDAP_USERS`.

MapStore/GeoStore also assigns users to its default `everyone` group; that group is not bootstrapped from the LDAP LDIF files.

The LDIF file is mounted by the compose overlay, copied into the OpenLDAP bootstrap directory at container startup and imported only when the LDAP volumes are empty. If you edit `ldap-init.ldif` after the first startup, rebuild the LDAP image and remove the LDAP volumes before starting again.

```sh
docker compose -f docker-compose.yml -f docker/docker-compose.auth.yml down
docker volume rm mapstore2_ldap_data mapstore2_ldap_config
docker compose -f docker-compose.yml -f docker/docker-compose.auth.yml up --build
```

!!! note
    Docker Compose may use a different volume prefix depending on the project directory or `COMPOSE_PROJECT_NAME`. Run `docker volume ls` if the volume names differ.

### LDAP Test Users

| Login | Password | MapStore role | LDAP / MapStore groups |
| --- | --- | --- | --- |
| `ldapadmin` | `changeme-ldapadmin-pw-123` | `ADMIN` | `ROLE_ADMIN`, `LDAP_ADMINS`, `everyone` |
| `ldapuser` | `changeme-ldapuser-pw-123` | `USER` | `ROLE_USER`, `LDAP_USERS`, `everyone` |

Log in with the LDAP `uid`, for example `ldapadmin`, not the full DN. With `ldap.convertToUpperCase=true`, synchronized user and group names may appear uppercase in MapStore.

For a full explanation of LDAP synchronized and direct modes, see the [LDAP integration guide](users/ldap.md#ldap-integration-with-mapstore).

## Start The Stack

Start MapStore with the auth compose overlay:

```sh
docker compose -f docker-compose.yml -f docker/docker-compose.auth.yml up -d --build
```

Open [http://localhost/mapstore](http://localhost/mapstore) when the services are ready.

To stop the stack:

```sh
docker compose -f docker-compose.yml -f docker/docker-compose.auth.yml down
```

To remove containers and volumes for a clean re-import:

```sh
docker compose -f docker-compose.yml -f docker/docker-compose.auth.yml down -v
```

## Test Login

For Keycloak OpenID login:

1. Open [http://localhost/mapstore](http://localhost/mapstore).
2. Click login and choose **Keycloak**.
3. Log in with `kcuser` / `changeme-kcuser-pw-123` or `kcadmin` / `changeme-kcadmin-pw-123`.
4. Keycloak redirects back to MapStore.

For LDAP login, use the standard username/password form with one of the LDAP users, such as `ldapadmin` / `changeme-ldapadmin-pw-123`. This requires a MapStore WAR built and configured with LDAP support. See [LDAP integration with MapStore](users/ldap.md#ldap-integration-with-mapstore).

## Troubleshooting

- **Keycloak realm not imported**: Keycloak imports realm files only on first startup. Remove the `keycloak_data` volume and restart the stack.
- **LDAP users not found**: confirm `docker/openldap/ldap-init.ldif` exists before first startup. If the LDAP volume already exists, remove the LDAP volumes and restart.
- **MapStore waits for LDAP healthcheck**: the LDAP container now uses a root DSE healthcheck, so this usually points to an LDAP startup problem rather than missing sample users.
- **OIDC login returns 500 before reaching Keycloak**: check the MapStore logs for `authorizationUri is null`. In this Docker setup, `keycloakOAuth2Config.authorizationUri` must be configured explicitly and should point to the public browser URL `http://localhost/keycloak/realms/mapstore/protocol/openid-connect/auth`.
- **OIDC callback returns 500 after Keycloak login**: make sure backend-only endpoints such as `accessTokenUri`, `checkTokenEndpointUrl`, `idTokenUri`, `revokeEndpoint` and `introspectionEndpoint` point to `http://host.docker.internal/keycloak/...`, not `http://localhost/keycloak/...`.
- **Keycloak login is automatic after MapStore logout**: this means the Keycloak SSO session is still active. The sample sets `keycloakOAuth2Config.globalLogoutEnabled=true` and `keycloakOAuth2Config.postLogoutRedirectUri=http://localhost/mapstore/` so MapStore logout also asks Keycloak to end the realm session.
- **Redirect or callback errors**: check that the Keycloak redirect URI matches `http://localhost/mapstore/*` and that `keycloakOAuth2Config.redirectUri` in the datadir points to `http://localhost/mapstore/rest/geostore/openid/keycloak/callback`. In LDAP-direct mode, keep `keycloakOAuth2Config.autoCreateUser=false`; otherwise the Keycloak callback can fail while trying to sync users and groups through the LDAP-backed GeoStore DAOs.
- **502 Bad Gateway during login or callback**: the auth proxy config in `docker/mapstore.auth.conf` increases proxy buffers for Keycloak and MapStore callback responses. Restart the proxy if you edit the file.
- **LDAP LDIF edits are ignored**: LDIF bootstrap runs only on an empty LDAP volume. Rebuild the LDAP image and remove LDAP volumes before restarting.
- **LDAP login does not appear to work**: verify the WAR was built with the LDAP profile and that `ldap.properties` is available in the datadir.
