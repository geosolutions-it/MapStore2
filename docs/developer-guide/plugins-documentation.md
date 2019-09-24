# Configuring plugins
To configure the plugins used by your application, a dedicated section is available in the **localConfig.json** configuration file:

```js
"plugins": {
  ...
}
```

Inside the **plugins** section, several modes can be configured (e.g. desktop or mobile), each one with its own list of plugins:


```js
"plugins": {
  "mobile": [...],
  "desktop": [...]
}
```

Each plugin can be simply listed (and the default configuration is used):

```js
"plugins": {
  ...
  "desktop": ["Map", "MousePosition", "Toolbar", "TOC"]
}
```

or fully configured:

```js
"plugins": {
  ...
  "desktop": [{
    "name": "Map",
       ...
    }
  },
  ...
  ]
}
```

## Dynamic configuration
Configuration properties of plugins can use expressions, so that they are dynamically bound to the
application state.

An expression is anything between curly brackets ({...}) that is a javascript expression,
where the **monitored state** of the application is available as a set of variables.

To define the monitored state, you have to add a **monitorState** property in **localConfig.json**.

```js
{
  ...
  "monitorState": [{"name": "mapType", "path": "mapType.mapType"}]
  ...
}
```

Where:
 * **name** is the name of the variable that can be used in expressions
 * **path** is a javascript object path to the state fragment to be monitored (e.g. map.present.zoom)

When you have a monitored state, you can use it in configuration properties this way:
Be sure to write a valid javascript expression.
```js
"cfg": {
  ...
  "myProp": "{state('mapType') === 'openlayers' ? 1 : 2}"
  ...
}
```

Expressions are supported in **cfg** properties and in **hideFrom** and **showIn** sections.

In addition to monitored state also the **page request parameters** are available as variables to be
used in expressions.

Look at the [plugin reference page](https://mapstore.geo-solutions.it/mapstore/docs/api/plugins) for a list of available configuration properties.
