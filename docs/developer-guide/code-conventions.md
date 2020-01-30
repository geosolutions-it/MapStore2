# Code conventions
In order to preserve quality, maintainability and testability when you develop in MapStore  you should follow the following rules and best practices.

# TL;DR

- Access to the state using state selectors
- Prefer `initialState` for initial/default configuration over plugin configuration
- Reuse components with HOCs or create stateless and context-less new components (as much as possible)
- Use axios and redux-observable for async

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

If you don't work on a core functionality, where the state is shared between many components, defining the selector directly in the plug-in is not denied (e.g. examples).

## Prefer `initialState` over plugin configuration

In the past we had a plug-in configuration and initial state.
The plug-in configuration can be used only for not-shared and constant configurations of the plugin (e.g. a flag that enables a functionality that is present only in the plugin). If you are not in one of these 2 cases, you should prefer the state.
Use the `initialState` in localConfig to configure the application.

**note**: An empty React state has to be set as NULL (null), empty objects ({}) are not valid empty states.

## Reuse components with HOCs

In order to encourage the reuse of the components into a consistent UI you should reuse the existing components as much as possible. Remap your properties with application or local state using recompose HOC.
When you have to write a new components, they should be stateless and context-less, when possible.
This is not mandatory because mapping existing libs to the one-way data binding paradigm or wrap them into components is hard and may require some state/context trick. Anyway is **strongly recommended**.

## Use axios and redux-observable for async

We are moving from redux-thunk to redux-observable. All new functionalities that require async/side effect should be implemented using the redux-observable middleware. redux-thunk usage is deprecated and will be removed soon.

Because of the authentication system management, all AJAX request should pass throw `axios`.
Using axios + RxJS means that you will have to wrap axios calls in something like:

```javascript
Rx.Observable.defer( () => axios.post(...)).map...
```

Use defer to allow the usage of RxJS retry. We still not support real AJAX cancellation at all, but we would like to provide some utility function/operator to bind `axios` cancellation functionalities into the RxJS flow in the future.
