# Integration with OpenID connect

MapStore allows to integrate with the following OpenID providers.

- Google
- Keycloak (to be implemented)

For each of these service you will have to configure the back-end and modify `localConfig.json` adding a proper entry to the `authenticationProviders`.
By default, if `authenticationProviders` is not set, it will use classic `{"type": "basic", "provider": "geostore"}`, that represents the standard login on mapstore with username and password.

For details about the configuration for a specific service, please refer to the specific section below. For details about `authenticationProviders` optional values, refer to the documentation of the login plugin.

!!! note
    For the moment we can configure only one authentication per service.

## Google

In order to setup the openID connection you have to setup a project in Google API Console to obtain Oauth 2.0 credentials and configure them. Please follow the [Google documentation](https://developers.google.com/identity/protocols/oauth2/openid-connect) for this.

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

- Add an entry for `google` in `authenticationProviders` inside `localConfig.json` file.

```json
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

## Keycloak

 To be implemented
