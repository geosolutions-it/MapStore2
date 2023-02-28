# Plugins Architecture

The architecture of MapStore based on the concept of **plugins**. Every tool of MapStore is a plugin, that are the main building blocks of the application.

A plugin in MapStore an entity that can be:

- **rendered** in the application (via a React components)
- **connected** to a Redux store, so that some properties are automatically wired to the standard MapStore state
- **wired** to standard actions for common events to trigger

In addition a plugin:

- declares some **reducers** that adds some parts to the global state, if needed
- declares some **epics** that need to be added to the redux-observable middleare, if needed
- inject in other plugin react components to be rendered (for communication, extensions, etc.)
- is fully **configurable** to be easily customized to a certain level

The plugins are managed by `PluginContainer` (typically a `Page`, but not necessarily) that is a React component that renders the plugins in the application and handle proper dependencies.

Plugins are used in different contexts:

- **Standard plugins** Plugins that are used in the standard MapStore application and that are part of the framework.
- **Custom plugins** Plugins developed in a custom MapStore project ( see [Setup a MapStore Project](mapstore-projects.md#mapstore-projects))
- **Extensions**: Plugins that can be build and installed in an existing instance of MapStore (see [Extensions](extensions.md))

For more information about how to create a plugin, see [Create your plugins](plugins-howto.md)
