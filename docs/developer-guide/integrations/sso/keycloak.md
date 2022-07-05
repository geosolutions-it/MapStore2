# Keycloak Single Sign On integration

MapStore allows an integration with keycloak SSO system.
This integration will automatically login/logout from MapStore when you login/logout to keycloak, or one of the applications connected to keycloak.

In order to enable the SSO in keycloak you have to:

- Configure the [openID integration](../../users/openId#keycloak).
- Create a keycloak client in the same realm of openID integration above.
- Configure SSO in MapStore's `localConfig.json`

## Configure the OpenID integration

- See here [openID integration](../../users/openId#keycloak).

## Configure keycloak Client

After configuring the open [openID integration](../../users/openId#keycloak), you will have a keycloak client called `mapstore-server`.
In order to enable SSO you have to create **another** new Client on keycloak. In this guide we will name it `mapstore-client`.

<img src="../img/kc-create-client.jpg" class="ms-docimage"  style="max-width:500px;"/>
<img src="../img/kc-create-mapstore-client.jpg" class="ms-docimage"  style="max-width:500px;"/>

- Configure it as `Public`
- Insert in  **"Valid Redirect URIs"** your MapStore base root, with a `*` at the end (e.g. `https://my.mapstore.site.com/mapstore/*`)
- Insert in **"Web Origins"** your MapStore base domain name. (e.g. `https://my.mapstore.site.com`)

<img src="../img/configure-mapstore-client.jpg" class="ms-docimage"  style="max-width:500px;"/>

- Click on Save button, then open the *Installation* tab, select the `Keycloak OIDC JSON` format, and copy the JSON displayed below.

<img src="../img/copy-mapstore-client-config.jpg" class="ms-docimage"  style="max-width:500px;"/>

## Configure SSO in MapSTore

After configuring the open [openID integration](../../users/openId#keycloak), you will have an entry named `keycloak` in `authenticationProviders`.
In this entry, you will have to add `"sso":{"type":"keycloak"}` and `config: "<configuration coped from keycloak>"`.

e.g.

```json
{
       "authenticationProviders": [
      {
        "type": "openID",
        "provider": "keycloak",
        "config": {
          "realm": "master",
          "auth-server-url": "http://localhost:8080",
          "ssl-required": "external",
          "resource": "mapstore-client",
          "public-client": true,
          "confidential-port": 0
        },
        "sso": {
          "type": "keycloak"
        }
      }
    ],
}
```

Here implementation details about [keycloak login workflow](../keycloak-impl/).
