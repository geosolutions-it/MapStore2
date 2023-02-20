# Plugins Architecture

MapStore fully embraces both ReactJS and Redux concepts, enhancing them with the **plugin** concept.

A plugin in MapStore is a smart ReactJS component that is:

* **connected** to a Redux store, so that some properties are automatically wired to the standard MapStore state
* **wired** to standard actions for common events

In addition a plugin:

* declares some **reducers** that need to be added to the Redux store, if needed
* declares some **epics** that need to be added to the redux-observable middleare, if needed
* is fully **configurable** to be easily customized to a certain level

You can build an application with custom plugins based on the MapStore plugins architecture by following this documentation:

* [Setup a MapStore Project](mapstore-projects.md#mapstore-projects)
* [Create your custom plugins](plugins-howto.md)
