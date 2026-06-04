# Auth Docker Setup

This page describes a quick local authentication environment for MapStore developers and environment maintainers. It extends the default Docker setup with Keycloak, OpenLDAP and an authentication-aware Nginx proxy, so you can quickly test MapStore login flows and sample user/group mappings.

The stack is intended as a starting point. For the full configuration details, see the dedicated guides for [LDAP](users/ldap.md#ldap-integration-with-mapstore), [OpenID Connect](users/openId.md#integration-with-openid-connect), [Keycloak](users/keycloak.md#keycloak-integrations), [MapStore authentication](auth.md#mapstore-authentication---implementation-details) and the available [infrastructure setups](infrastructure-setups.md#possible-setups).

!!! warning
    The provided files contain sample credentials, sample users, a sample Keycloak realm and sample LDAP entries. They are useful for local development and testing, but they must be replaced or reviewed before using this setup in production.

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
    Do not reuse the sample passwords in shared, staging or production environments. Update `.env`, the Keycloak realm, LDIF files and MapStore datadir properties consistently.

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
- Client secret: `mapstore-server-secret`
- Redirect URI: `http://localhost/mapstore/*`
- Realm roles: `admin`, `user`
- Sample users: `kcuser`, `kcadmin`

The client and secret must match the values in `datadir/mapstore-ovr.properties`. If you change the realm file, update the MapStore datadir configuration accordingly. For details about Keycloak OpenID configuration, see the [Keycloak section of the OpenID Connect guide](users/openId.md#keycloak).

### Keycloak Test Users

| Username | Password | Email | Keycloak role | MapStore role |
| --- | --- | --- | --- | --- |
| `kcuser` | `kcuser123` | `kcuser@acme.org` | `user` | `USER` |
| `kcadmin` | `kcadmin123` | `kcadmin@acme.org` | `admin` | `ADMIN` |

The Keycloak admin console is available at [http://localhost/keycloak/admin/](http://localhost/keycloak/admin/) with the `KEYCLOAK_ADMIN` and `KEYCLOAK_ADMIN_PASSWORD` values configured in `.env`. The admin user belongs to the Keycloak `master` realm and is used to manage Keycloak, not to log in to MapStore.

## Prepare OpenLDAP

OpenLDAP is initialized from LDIF files in `docker/openldap/ldif/` when the LDAP data volume is empty. The repository keeps the sample users in `docker/openldap/ldif.sample/02-users.ldif` so you can review or customize them before importing.

To use the provided test users, copy the sample users LDIF into the active bootstrap directory before the first startup:

```sh
cp docker/openldap/ldif.sample/02-users.ldif docker/openldap/ldif/02-users.ldif
```

The LDAP bootstrap files define:

- Organizational units, such as `ou=people` and `ou=groups`.
- Sample users, if `02-users.ldif` is copied into `docker/openldap/ldif/`.
- Groups and roles, including `ROLE_ADMIN`, `mapstore-users` and `mapstore-devs`.

The LDIF files are copied into the OpenLDAP image at build time and imported only when the LDAP volumes are empty. If you edit LDIF files after the first startup, rebuild the LDAP image and remove the LDAP volumes before starting again.

```sh
docker compose -f docker-compose.yml -f docker/docker-compose.auth.yml down
docker volume rm mapstore2_ldap_data mapstore2_ldap_config
docker compose -f docker-compose.yml -f docker/docker-compose.auth.yml up --build
```

!!! note
    Docker Compose may use a different volume prefix depending on the project directory or `COMPOSE_PROJECT_NAME`. Run `docker volume ls` if the volume names differ.

### LDAP Test Users

| Login | Password | MapStore role | LDAP groups |
| --- | --- | --- | --- |
| `msadmin` | `admin123` | `ADMIN` | `ROLE_ADMIN`, `mapstore-users` |
| `msuser` | `user123` | `USER` | `mapstore-users` |
| `msdev` | `dev123` | `USER` | `mapstore-users`, `mapstore-devs` |

Log in with the LDAP `uid`, for example `msadmin`, not the full DN. With `ldap.convertToUpperCase=true`, synchronized user and group names may appear uppercase in MapStore.

For a full explanation of LDAP synchronized and direct modes, see the [LDAP integration guide](users/ldap.md#ldap-integration-with-mapstore).

## Start The Stack

Start MapStore with the auth compose overlay:

```sh
docker compose -f docker-compose.yml -f docker/docker-compose.auth.yml up --build
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
3. Log in with `kcuser` / `kcuser123` or `kcadmin` / `kcadmin123`.
4. Keycloak redirects back to MapStore.

For LDAP login, use the standard username/password form with one of the LDAP users, such as `msadmin` / `admin123`. This requires a MapStore WAR built and configured with LDAP support. See [LDAP integration with MapStore](users/ldap.md#ldap-integration-with-mapstore).

## Troubleshooting

- **Keycloak realm not imported**: Keycloak imports realm files only on first startup. Remove the `keycloak_data` volume and restart the stack.
- **LDAP users not found**: confirm `docker/openldap/ldif/02-users.ldif` exists before first startup. If the LDAP volume already exists, remove the LDAP volumes and restart.
- **MapStore waits for LDAP healthcheck**: the LDAP healthcheck searches for `msadmin`, so the sample user LDIF must be active or the healthcheck must be adapted to your custom users.
- **Redirect or callback errors**: check that the Keycloak redirect URI matches `http://localhost/mapstore/*` and that `keycloakOAuth2Config.redirectUri` in the datadir points to `http://localhost/mapstore/rest/geostore/openid/keycloak/callback`.
- **502 Bad Gateway during login or callback**: the auth proxy config in `docker/mapstore.auth.conf` increases proxy buffers for Keycloak and MapStore callback responses. Restart the proxy if you edit the file.
- **LDAP LDIF edits are ignored**: LDIF bootstrap runs only on an empty LDAP volume. Rebuild the LDAP image and remove LDAP volumes before restarting.
- **LDAP login does not appear to work**: verify the WAR was built with the LDAP profile and that `ldap.properties` is available in the datadir.
