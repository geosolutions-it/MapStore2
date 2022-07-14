# MapStore Authentication - Implementation Details

In this section you can see the implementation details about the login / logout workflow implemented by MapStore.

## Standard MapStore login

```mermaid
sequenceDiagram
    autonumber
    actor Browser
    participant Backend
    participant OpenIDProvider
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
        Backend --) Browser: {access_token: <token>, refresh_token: <r_token>}
        Note over Browser: REFRESH_SUCCESS
    end
    Browser --)+ Backend: Logout
    Backend --) OpenIDProvider: Logout
    OpenIDProvider --) Backend: <res>
    Backend --)- Browser: <res>
    Note over Browser: LOGOUT

```
