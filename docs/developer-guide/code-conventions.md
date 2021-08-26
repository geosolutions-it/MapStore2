# Code conventions

In order to preserve quality, maintainability and testability when you develop in MapStore  you should follow the following rules and best practices.

## TL;DR

- Access to the state using state selectors
- Prefer plugins `cfg` over `initialState` for plugins configurations
- Use `web/client/libs/ajax` in your hooks or in redux-observable for async

## Access to the state using state selectors

Is **strongly recommended** to not access to the state directly inside the `mapStateToProps` function of `react-redux` .
Use (or define) selectors in the `selectors` directory. This provides the following advantages:

- Selectors can be reused in epics.
- Ready to use optimization with reselect
- Simplify future refactoring
- Easy unit testing and bug identification

Wrapping all the access to the state inside well-defined selector makes easier to add functionalities and will increase code maintainability. You should always reuse existing selectors (or create new ones) to access to the application state for core application functionalities.
It will help also future refactoring because any change to the state structure (from the reducer point of view) or data source (from the components point of view) requires only changes to the interested selectors.

A selector should be placed into the proper `selectors/<state-slice>.js` file with the same name of the relative reducer.
When a selector retrieves data from more than one state slices, you should place it in the selector nearest by concern. For instance `isFeatureGridOpen` should be placed into `featuregrid`

If you don't work on a core functionality, where the state is shared between many components, defining the selector directly in the plug-in is not denied.

## Prefer plugin configuration over `initialState` 

In order to create self contained plugins that can be reused you should prefer to configure the plugins using `cfg`. Using `initialState` should be considered deprecated. When the configuration is needed at an higher level (e.g. application state, for epics or to share this information), you should properly initialize the state of the plugin on your own triggering an action on mount/unmont. (`cfg` are passed to the plugin as react props). 


## Use custom axios version for async requests

Using `web/client/libs/ajax` (a customized axios with some interceptors)  for AJAX request contains interceptors to support `proxyUrl` and `authenticationRules` settings specified in `localConfig.json`,so you should prefer to use this enhanced version of axios.

Using axios + RxJS means that you will have to wrap axios calls in something like:

```javascript
Rx.Observable.defer( () => axios.post(...)).map...
```

Use defer to allow the usage of RxJS retry. We still not support real AJAX cancellation at all, but we would like to provide some utility function/operator to bind `axios` cancellation functionalities into the RxJS flow in the future.
