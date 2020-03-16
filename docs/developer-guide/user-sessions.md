# Implementing User Sessions
MapStore allows to integrate user sessions into your project.
The base support gives you:
 * actions to trigger saving a session (saveUserSession in actions/usersessions)
 * an epic creator to configure and enable your own savesession workflow (saveUserSessionEpicCreator in epics/usersessions)
 * an epic creator to configure and enable your own savesession scheduler (autoSaveSessionEpicCreator in epics/usersessions)

TODO: retrieving a user session

## An example of usage
```javascript
// we use the context name concatenated with the user name
// as the session name
const nameSelector = state => (state?.context?.name ?? "default") + "." + (state?.security?.user?.name ?? "anonymous");
// we save the current map status (center, zoom, etc.)
const sessionSelector = state => state?.map?.present ?? {};
// we store the current session id so that we can update the current
const idSelector = state => state?.usersession?.current?.id ?? null;
const saveUserSessionEpic = saveUserSessionEpicCreator(
    nameSelector,
    sessionSelector,
    idSelector
);
// we save every minute
const autoSaveScheduler = autoSaveSessionEpicCreator('START_SAVE_SESSION',
    'END_SAVE_SESSION', 60 * 1000);

// we must enable the two epics, either as a plugin configuration, or in the
// list of app epics
```
