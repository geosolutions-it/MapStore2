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
    "cfg": {
       ...
    }
  },
  ...
  ]
}
```
Look at each plugin documentation page for a list of available configuration properties.

# Plugins List:
 * [Map](map-plugin)
