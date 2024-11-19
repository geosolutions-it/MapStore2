# MapStore Authentication - Implementation Details

In this section you can see the implementation details about the login / logout workflow implemented by MapStore.

## Standard MapStore login

```mermaid
sequenceDiagram
    autonumber
    actor Browser
    participant Backend
    Browser ->>+ Backend: /session/login<br />(username, password)
    Note over Backend: create session
    Backend -->>- Browser: {access_token, refresh_token}
    Browser --) Backend: /users/user/details
    Backend --) Browser:  {User: <...>}
    Note over Browser: LOGIN_SUCCESS
    loop Token refresh
        Browser --) Backend: /session/refresh
        Backend --) Browser: {access_token: <token>, refresh_token: <r_token>}
        Note over Browser: REFRESH_SUCCESS
    end
    Browser --)+ Backend: Logout
    Note over Backend: delete session
    Backend --)- Browser: <res>
    Note over Browser: LOGOUT
```

### Configure session timeout

By default MapStore session token lives 24 hours and the refresh token last forever. On application reboot anyway all the tokens are cancelled. In order to change these default. the administrator can change these defaults by adding to `mapstore-ovr.properties` file the following properties:

```properties
# Session timeout
restSessionService.sessionTimeout=60 #in seconds
restSessionService.autorefresh=false
```

Where:

- `restSessionService.sessionTimeout` refers to session token expiration time (by default it’s 24 hours)
- `restSessionService.autorefresh` refers to flag configured to handle automatic refresh process in the backend, enabling/disabling the refresh token usage:
  - when set to `false`, it avoids the use of refresh token after the session token has expired, meaning, after the timeout the user will have to reconnect
  - when set to `true`, the refresh token is used and the session extends every time the session timeout is met

!!! note
    `sessionTimeout` and `autorefresh` in `mapstore.properties` are valid for the default session storage. If you are using openID or keycloak, they will not be used.

Additionally, on the client side, in order to configure the interval in which is session `refresh` action is fired, one can use the `tokenRefreshInterval` property. It can be configured via `localConfig.json -> tokenRefreshInterval`, the value is in milliseconds.

```json
  tokenRefreshInterval: 60000 // default 30 seconds
```

When the above configured `Session timeout` is in place, the client can exhibit two behaviors based on the `tokenRefreshInterval` configured on the client side,
Disabling the refresh token (setting `restSessionService.autorefresh` to `false`) the administrator can use `sessionTimeout` and `tokenRefreshInterval` to limit the session duration this way:

- when `tokenRefreshInterval` is **less than** `sessionTimeout` configured (e.g `tokenRefreshInterval` is 30 seconds and `sessionTimeout` is 24 hours)
  - when application is in use, the client performs a refresh token call before the expiring time and session is prolonged
  - when the application is closed (i.e for any reason) and reopened after `sessionTimeout` configured, the client cannot perform refresh token call within the timeout window and hence the session expires and the user is asked to reconnect
- when `tokenRefreshInterval` is **greater than** `sessionTimeout` configured
  - the session expires anyway before the refresh and the client is unable to perform the refresh activity within the configured time interval. The user will have to re-authenticate. In this case the two configuration should be nearly the same value, 30 seconds of difference, for example. This helps the client to perform the refresh activity immediately after the session expires to log out the user.

## OpenID MapStore Login

```mermaid
sequenceDiagram
    autonumber
    actor Browser
    participant Backend
    participant OpenIDProvider
    Browser ->> Backend: /openid/<OpenIDProvider>/login
    Backend -->> Browser: redirect to OpenIDProvider
    Browser ->>+ OpenIDProvider: Authenticate
    OpenIDProvider -->>- Browser: redirect to callback (Backend entry point)
    Browser ->>+ Backend:  /openid/<OpenIDProvider>/callback
    Note over Backend: Create User
    Backend -->>- Browser: redirect to homepage  <br /> (set-cookie <identifier>set-cookie <authprovider>)
    Browser --) Backend: /openid/<authProvider>/tokens?identifier=<identifier>
    Backend --) Browser:  {access_token: <token>, refresh_token: <r_token>}
    Browser --) Backend: /users/user/details
    Backend --) Browser:  {User: <...>}
    Note over Browser: LOGIN_SUCCESS
    loop Token refresh
        Browser --) Backend: /session/refresh

        loop Refresh retry 3 times max
            Backend --) OpenIDProvider: Refresh
            OpenIDProvider --) Backend: {access_token, refresh_token (optional)}
        end
        Backend --) Browser: {access_token: <token>, refresh_token: <r_token>}
        Note over Browser: REFRESH_SUCCESS
    end
    Browser --)+ Backend: Logout
    Backend --) OpenIDProvider: Logout
    OpenIDProvider --) Backend: <res>
    Backend --)- Browser: <res>
    Note over Browser: LOGOUT
```
