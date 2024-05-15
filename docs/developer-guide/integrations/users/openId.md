# Integration with OpenID connect

MapStore allows to integrate and login using some common [OpenID connect](https://openid.net/connect/) services. Having this support properly configured, you can make MapStore users able to login with the given OpenID service.

## Customizing logo an text in Login Form

For details about the configuration for a specific service, please refer to the specific section below. For details about `authenticationProviders` optional values (e.g. to customize icon and/or text to show), refer to the documentation of the [LoginPlugin](https://mapstore.geosolutionsgroup.com/mapstore/docs/api/plugins#plugins.Login).

By default `authenticationProviders` is `{"type": "basic", "provider": "geostore"}`, that represents the standard login on **MapStore** with username and password. With the default configuration, when the user try to login, MapStore will show the classic login form.

It is possible to add other providers to the list (e.g. `openid`) and they will be added as options to the login window.
You can remove the `geostore` entry from `authenticationProviders` list to remove the login form from the possible login systems.

!!! note
    If only one OpenID entry is present in `authenticationProviders` (and no `geostore` entry available), clicking on login in the login menu will not show any intermediate window and you will be redirected directly to the OpenID provider configured. If more than one entry is present in `authenticationProviders` list, the user will have to choose one of them to be authenticated.

## Supported OpenID services

MapStore allows to integrate with the following OpenID providers.

- OpenID Connect (generic)
- Google
- Keycloak

For each service you want to add you have to:

- properly configure the backend
- modify `localConfig.json` adding a proper entry to the `authenticationProviders`.

!!! note
    For the moment we can configure only one authentication per service type (only one for `oidc`, one for `google`, one for `keycloak` ...).

### OpenID connect (generic)

MapStore allows to configure a generic OpenID Connect provider. This is useful when you have to configure a provider that is not directly supported by MapStore.
In order to configure the generic OpenID provider you have to:

- Configure and get the information from your OpenID provider (generically configure the valid redirect URI and get the `discoveryUrl`, `clientId`, `clientSecret`).
- create/edit `mapstore-ovr.properties` file (in data-dir or class path) to configure the generic provider
- add an entry for `oidc` in `authenticationProviders` inside `localConfig.json` file.

#### Configure and get the information from your OpenID provider

This depends on the specific OpenID provider you are using. Here we show an example with Microsoft Azure.

##### Example with Microsoft Azure

Microsoft Azure provides OpenID Connect support. This is an example of how to configure MapStore to use Microsoft Azure as an OpenID provider. The same steps can be applied to other OpenID providers. Please refer to the specific documentation of the OpenID provider you are using.

Here a quick summary of the steps to configure Microsoft Azure as an OpenID provider and get the information needed to configure MapStore:

1. Create a new application ![Create azure application](img/azure-1.jpg)
2. Set the proper valid redirect URLs ![set redirect URL](img/azure-2.jpg) to: `https://<your-domain>/mapstore/rest/geostore/openid/oidc/callback`
3. Create and copy client secret ![Create and copy client secret](img/azure-3.jpg)
4. Add optional claims if needed ![Add optional claims](img/azure-4.jpg)
5. Copy endpoints and data to configure MapStore ![Copy endpoints](img/azure-5.jpg)

These steps are based on the [Microsoft Azure documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app).
Please refer the official documentation for any detail or additional configuration.

Here also some sample configurations for MapStore (see the following sections for details):

`mapstore-ovr.properties`:

```properties
# enables the keycloak OpenID Connect filter
oidcOAuth2Config.enabled=true

# note: this is the client id you have created in Keycloak
oidcOAuth2Config.clientId=<CLIENT_ID>
oidcOAuth2Config.clientSecret=<CLIENT_SECRET>

# DISCOVERY_URL something like https://login.microsoftonline.com/abc-dfe-ghi-123-345-567-789/v2.0/.well-known/openid-configuration
oidcOAuth2Config.discoveryUrl=<DISCOVERY_URL>
oidcOAuth2Config.sendClientSecret=true
# create the user if not present
oidcOAuth2Config.autoCreateUser=true
# Here you have to set your redirect URI (here is configured for localhost)
oidcOAuth2Config.redirectUri=http://localhost:8080/mapstore/rest/geostore/openid/oidc/callback
# Internal redirect URI (you can set it to relative path like this `../../..` to make this config work across domain)
oidcOAuth2Config.internalRedirectUri=http://localhost:8080/mapstore
```

`localConfig.json.patch` ( *with a custom title and an image with the Microsoft logo* to show in the login form)

```json
    {
        "authenticationProviders" [
                {
                    "type": "openID",
                    "provider": "oidc",
                    "title": "Microsoft",
                    "imageURL": "data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgdmlld0JveD0iMCAwIDI1IDI1IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGl0ZW1wcm9wPSJsb2dvIiBpdGVtc2NvcGU9Iml0ZW1zY29wZSI+CgkJCTxwYXRoIGQ9Ik0xMS41MjE2IDAuNUgwVjExLjkwNjdIMTEuNTIxNlYwLjVaIiBmaWxsPSIjZjI1MDIyIj48L3BhdGg+CgkJCTxwYXRoIGQ9Ik0yNC4yNDE4IDAuNUgxMi43MjAyVjExLjkwNjdIMjQuMjQxOFYwLjVaIiBmaWxsPSIjN2ZiYTAwIj48L3BhdGg+CgkJCTxwYXRoIGQ9Ik0xMS41MjE2IDEzLjA5MzNIMFYyNC41SDExLjUyMTZWMTMuMDkzM1oiIGZpbGw9IiMwMGE0ZWYiPjwvcGF0aD4KCQkJPHBhdGggZD0iTTI0LjI0MTggMTMuMDkzM0gxMi43MjAyVjI0LjVIMjQuMjQxOFYxMy4wOTMzWiIgZmlsbD0iI2ZmYjkwMCI+PC9wYXRoPgoJCTwvc3ZnPgo="
                },
                {
                    "type": "basic",
                    "provider": "geostore"
                }
            ]

    }
```

#### Configure MapStore back-end for OIDC OpenID

In order to configure the generic OpenID provider you have to:

- create/edit `mapstore-ovr.properties` file (in data-dir or class path) to configure the generic provider this way:

```properties
# enables the keycloak OpenID Connect filter
oidcOAuth2Config.enabled=true

# note: this is the client id have to be present on the OpenID provider
oidcOAuth2Config.clientId=mapstore-server
oidcOAuth2Config.clientSecret=<THE_CLIENT_SECRET>
# the discovery URL
oidcOAuth2Config.discoveryUrl=http://keycloak:8080/auth/realms/mapstore/.well-known/openid-configuration
oidcOAuth2Config.sendClientSecret=true
# create the user if not present
oidcOAuth2Config.autoCreateUser=true
oidcOAuth2Config.redirectUri=http://localhost:8080/mapstore/rest/geostore/openid/oidc/callback
# Internal redirect URI (you can set it to relative path like this `../../..` to make this config work across domain)
oidcOAuth2Config.internalRedirectUri=http://localhost:8080/mapstore
# user name attribute (default is `email`)
# oidcOAuth2Config.principalKey=email
# Optional role claims, if a claim contains roles, you can map them to MapStore roles. (roles can be only ADMIN or USER)
# oidcOAuth2Config.rolesClaim=roles
# Optional group claims, if a claim contains groups, you can map them to MapStore groups.
# oidcOAuth2Config.groupsClaim=groups
# Enables global logout from SSO, if properly confugred. false by default
# oidcOAuth2Config.globalLogoutEnabled=true

```

- `oidcOAuth2Config.clientId`: the client id. This is the client id that have to be present on the OpenID provider
- `oidcOAuth2Config.clientSecret`: the client secret. This is the client secret for the client id on the OpenID provider
- `oidcOAuth2Config.discoveryUrl`: the discovery URL. This is the URL that contains all the information for the specific service.
- `oidcOAuth2Config.sendClientSecret`: if `true`, the client secret will be sent to the OpenID provider. If `false`, the client secret will not be sent.
- `oidcOAuth2Config.autoCreateUser`: if `true`, the user will be created if not present in the MapStore database. If `false`, the user will not be created ( useful if the user is managed by an external service like Keycloak or LDAP).
- `oidcOAuth2Config.redirectUri`: the redirect URI. This is the URI that the OpenID provider, and it must be the effective URI of the MapStore application, with the path `/rest/geostore/openid/oidc/callback`.
- `oidcOAuth2Config.internalRedirectUri`: the internal redirect URI. This is the URI that the MapStore will redirect to after the login. It must be the effective URI of the MapStore application.
- `oidcOAuth2Config.principalKey`: (*optional*) the user name attribute. This is the attribute that will be used as the user name. The default is `email`.
- `oidcOAuth2Config.rolesClaim`: (*optional*) the role claims. If a claim contains roles, you can map them to MapStore roles. The roles can be only `ADMIN` or `USER`. If the claim is not present, the default role will be `USER`.
- `oidcOAuth2Config.groupsClaim`: (*optional*) the group claims. If a claim contains groups, you can map them to MapStore groups. If the claim is not present, no group will be assigned (except the default `everyone` group).
- `oidcOAuth2Config.globalLogoutEnabled`: (*optional*): if true (and the server supports it) invokes global logout on MapStore logout

!!! note
    The `rolesClaim` and `groupsClaim` are optional. If you don't need to map roles or groups, you can omit them. At the moment, there is no mapping for roles and groups for the generic OIDC provider. If you need to map roles and groups, you can use the `keycloak` provider.

#### Configure MapStore front-end for OIDC OpenID

- Add an entry for `oidc` in `authenticationProviders` inside `localConfig.json` file.

```json
{
    "authenticationProviders": [
      {
        "type": "openID",
        "provider": "oidc",
        "title": "My custom identity provider"
      },
      {
        "type": "basic",
        "provider": "geostore"
      }
    ]
}
```

You can customize the `title` to show in the login form, add an `imageURL` or use only one `authenticationProviders`, removing the `geostore` entry, if you want to use only the OpenID provider. In this case the user will be redirected directly to the OpenID provider without showing the login form.

### Google

#### Create Oauth 2.0 credentials on Google Console

In order to setup the openID connection you have to setup a project in Google API Console to obtain Oauth 2.0 credentials and configure them.

- Open Google developer console and, from credentials section, create a new credential of type **Oauth client ID**

<img src="../img/google-create-credentials.jpg" class="ms-docimage"  style="max-width:500px;"/>

- Set the **Application Type** to **Web Application**, name it as you prefer and configure the root of the application as an authorized redirect URI. Then click on **Create**

<img src="../img/google-create-oauth2.jpg" class="ms-docimage"  style="max-width:500px;"/>

- After creation you will obtain **ClientID** and **Client Secret** to use to configure MapStore.

Please follow the [Google documentation](https://developers.google.com/identity/protocols/oauth2/openid-connect) for any detail or additional configuration.

#### Configure MapStore back-end for Google OpenID

After the setup, you will have to:

- create/edit `mapstore-ovr.properties` file (in data-dir or class path) to configure the google provider this way:

```properties

# enables the google OpenID Connect filter
googleOAuth2Config.enabled=true

#clientId and clientSecret
googleOAuth2Config.clientId=<the_client_id_from_google_dev_console>
googleOAuth2Config.clientSecret=<the_client_secret_from_google_dev_console>

# create the user if not present
googleOAuth2Config.autoCreateUser=true

# Redirect URL
googleOAuth2Config.redirectUri=https://<your-appliction-domain>/mapstore/rest/geostore/openid/google/callback
# Internal redirect URI (you can set it to relative path like this `../../..` to make this config work across domain)
googleOAuth2Config.internalRedirectUri=https://<your-appliction-domain>/mapstore/

## discoveryUrl: contains all the information for the specific service.
googleOAuth2Config.discoveryUrl=https://accounts.google.com/.well-known/openid-configuration
```

#### Configure MapStore front-end for Google OpenID

- Add an entry for `google` in `authenticationProviders` inside `localConfig.json` file.

```json
{
    "authenticationProviders": [
      {
        "type": "openID",
        "provider": "google"
      },
      {
        "type": "basic",
        "provider": "geostore"
      }
    ]
}
```

### Keycloak

[Keycloak](https://www.keycloak.org/) is an open source identity and access management application widely used. MapStore has the ability to integrate with keycloak:

- Using the standard OpenID Connect (OIDC) protocol to login/logout in MapStore
- Supporting Single Sign On (SSO) with other applications.
- Mapping keycloak roles to MapStore groups, as well as for ldap.

In this section you can see how to configure keycloak as a standard OpenID provider. For other advanced functionalities, you can see the [dedicated section of the documentation](keycloak.md#keycloak-integrations)

#### Configure keycloak Client

Create a new Client on keycloak. In this guide we will name it `mapstore-server` (because if you need to configure SSO, we may need another key to call `mapstore-client`)

<img src="../img/kc-create-client.jpg" class="ms-docimage"  style="max-width:500px;"/>
<img src="../img/kc-create-mapstore-server.jpg" class="ms-docimage"  style="max-width:500px;"/>

- Configure it as `Confidential` setting the Redirect-URL with your MapStore base root, with a `*` at the end (e.g. `https://my.mapstore.site.com/mapstore/*`)

<img src="../img/kc-configure-mapstore-server.jpg" class="ms-docimage"  style="max-width:500px;"/>

- Click on Save button, then open the *Installation* tab, select the `Keycloak OIDC JSON` format, and copy the JSON displayed below.

<img src="../img/kc-copy-config-server.jpg" class="ms-docimage"  style="max-width:500px;"/>

### Configure MapStore back-end for Keycloak OpenID

Create/edit `mapstore-ovr.properties` file (in data-dir or class path) to configure the keycloak provider this way:

```properties
# enables the keycloak OpenID Connect filter
keycloakOAuth2Config.enabled=true

# Configuration
keycloakOAuth2Config.jsonConfig=<copy-here-the-json-config-from-keycloak-removing-all-the-spaces>


# Redirect URLs
# - Redirect URL: need to be configured to point to your application at the path <base-app-url>/rest/geostore/openid/keycloak/callback
# e.g. `https://my.mapstore.site.com/mapstore/mapstore/rest/geostore/openid/keycloak/callback`
keycloakOAuth2Config.redirectUri=https://my.mapstore.site.com/mapstore/rest/geostore/openid/keycloak/callback
# - Internal redirect URL when logged in (typically the home page of MapStore, can be relative)
keycloakOAuth2Config.internalRedirectUri=https://my.mapstore.site.com/mapstore/

# Create user (if you are using local database, this should be set to true)
keycloakOAuth2Config.autoCreateUser=true

# Comma separated list of <keycloak-role>:<geostore-role>
keycloakOAuth2Config.roleMappings=admin:ADMIN,user:USER

# Comma separated list of <keycloak-role>:<geostore-group>
keycloakOAuth2Config.groupMappings=MY_KEYCLOAK_ROLE:MY_MAPSTORE_GROUP,MY_KEYCLOAK_ROLE2:MY_MAPSTORE_GROUP2

# Default role, when no mapping has matched
keycloakOAuth2Config.authenticatedDefaultRole=USER
```

- `keycloakOAuth2Config.jsonConfig`: insert the JSON copied, removing all the spaces
- `keycloakOAuth2Config.redirectUri`: need to be configured to point to your application at the path `<base-app-url>/rest/geostore/openid/keycloak/callback`, e.g. `https://my.mapstore.site.com/mapstore/rest/geostore/openid/keycloak/callback`
- `keycloakOAuth2Config.internalRedirectUri` can be set to your application root, e.g. `https://my.mapstore.site.com/mapstore/`
- `keycloakOAuth2Config.autoCreateUser`: true if you want MapStore to insert a Keycloak authenticated user on the DB. UserGroups will be inserted as well and kept in synch with the roles defined for the user in Keycloak. The option **must be set to false if MapStore is using a read-only external service for users and groups** (i.e. Keycloak or LDAP).
- `keycloakOAuth2Config.forceConfiguredRedirectURI`: optional, if `true`, forces the redirect URI for callback to be equal to teh redirect URI. This is useful if you have problems logging in behind a proxy, or in dev mode.
- `keycloakOAuth2Config.roleMappings`: comma separated list of mappings with the following format ``keycloak_admin_role:ADMIN,keycloak_user_role:USER``. These mappings will be used to map Keycloak roles to MapStore roles. Allowed values `USER` or `ADMIN`.
- `keycloakOAuth2Config.authenticatedDefaultRole`: where the role has not been assigned by the mappings above, the role here will be used. Allowed values `USER` or `ADMIN`.
- `keycloakOAuth2Config.groupMappings`: comma separated list of mappings with the following format ``keycloak_role_name:mapstore_group_name,keycloak_role_name2:mapstore_group_name2``. These mappings will be used to map Keycloak roles to MapStore groups.
- `keycloakOAuth2Config.dropUnmapped`: when set to false, MapStore will drop Keycloak roles that are not matched by any mapping role and group mapping. When set to true all the unmatched Keycloak roles will be added as MapStore UserGroups.

#### Configure MapStore front-end for Keycloak OpenID

- Add an entry for `keycloak` in `authenticationProviders` inside `localConfig.json` file.

```json
{
    "authenticationProviders": [
      {
        "type": "openID",
        "provider": "keycloak"
      },
      {
        "type": "basic",
        "provider": "geostore"
      }
    ]
}
```
