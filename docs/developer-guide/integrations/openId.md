# Integration with OpenID connect

MapStore allows to integrate and login using some common [OpenID connect](https://openid.net/connect/) services. With these configurations, you can add to the login form some buttons to login with the given service.


## Customizing logo an text in Login Form

For details about the configuration for a specific service, please refer to the specific section below. For details about `authenticationProviders` optional values (e.g. to customize icon and/or text to show), refer to the documentation of the LoginPlugin.

## Supported OpenID services

MapStore allows to integrate with the following OpenID providers.

- Google
- Keycloak (to be implemented)

For each of service you want to add you have to:

- properly configure the backend
- modify `localConfig.json` adding a proper entry to the `authenticationProviders`.
By default, if `authenticationProviders` is not set, it will use classic `{"type": "basic", "provider": "geostore"}`, that represents the standard login on mapstore with username and password.

!!! note
    For the moment we can configure only one authentication per service.

### Google

#### Create Oauth 2.0 credentials on Google Console

In order to setup the openID connection you have to setup a project in Google API Console to obtain Oauth 2.0 credentials and configure them. Please follow the [Google documentation](https://developers.google.com/identity/protocols/oauth2/openid-connect) for this.

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
#If the `discoveryUrl` has not been specified, you can manually configure the following options.
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

- Using the standard OpenID protocol
- Supporting  (not yet implemented)
- Integrating with users and roles, as well as for ldap. (not yet implemented)

In this section you can see how to configure keycloak as a standard OpenID provider

#### Configure keycloak Client

Configure a client in your keycloak instance with the following settings:

### Configure MapStore back-end for Keycloak OpenID

- create/edit `mapstore-ovr.properties` file (in data-dir or class path) to configure the google provider this way:

```properties
# enables the google OpenID Connect filter for keycloak
keycloakOAuth2Config.enabled=false

# Configuration
keycloakOAuth2Config.jsonConfig=<copy-here-the-json-config-from-keycloak>


# Redirect URLs
# - Redirect URL: need to be configured to point to your application at the path <base-app-url>/rest/geostore/openid/keycloak/callback
keycloakOAuth2Config.redirectUri=http://localhost:9191/mapstore/rest/geostore/openid/keycloak/callback
# - Internal redirect URL when logged in (typically the home page of MapStore, can be relative)
keycloakOAuth2Config.internalRedirectUri=../../../

# Create user (if you are using local database, this should be set to true)
keycloakOAuth2Config.autoCreateUser=true

```

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
