# Implementing User Sessions

MapStore allows automatically saving / retrieving user sessions for every map.
When user sessions are enabled some information is automatically saved, so that it can be restored the next time
a user visits the same map.

User sessions persistence can be configured to use different stores. The default implementation is based on localStorage,
so the session is saved on the user's browser.

It is also possible to save the session on a database, so it can be shared on different browsers / devices.

The user session workflow works this way:

* a session is identified by the combination of the current map and user identifiers (so that a session exists for each user / map combination)
* a session is loaded from the store and if it exists, it overrides the standard map configuration partially; by default current map centering and zoom are overridden
* the session is automatically saved at a configurable interval
* a Burger Menu item allows restoring the session to the default map configuration

## Configuring user sessions

Since user session handling works very low level, its basic features needs to be configured at the `localConfig.json` level.
Then including or not including the plugin `UserSession` in your application context will determine the possibility to save (and so restore) the session.

A *userSessions* property is available for this. This is an object with the following properties:

* `enabled`: false / true
* `saveFrequency`: interval (in milliseconds) between saves
* `provider`: the name of the storage provider to use (defaults to browser)
* `contextOnly`: true / false, when true each MapStore context will share only one session, if false each context submap will have its own session

MapStore includes 3 different providers you can set in `userSession.provider`:

* `browser`: default localStorage based
* `server`: database storage (based on MapStore backend services)
* `serverbackup`: combination of browser and server, with a configurable backupFrequency interval, so that browser saving it's more frequent than server one

You can also implement your own, by defining its API and registering it on the Providers object:

```javascript
import {Providers} from "api/usersession"
Providers.mystorage = {
    getSession: ...,
    writeSession: ...,
    removeSession: ...
}
```

