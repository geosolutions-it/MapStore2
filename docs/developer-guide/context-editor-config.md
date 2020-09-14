# Configuration of Application Context Manager

The Application Context Manager can be configured editing the `pluginsConfig.json` file.

The configuration file has this shape:

```javascript
{
 "plugins": [
    {
        "name": "Map",
        "mandatory": true, // <-- mandatory should not be shown in editor OR not movable and directly added to the right list.
    }, {
        "name": "Notifications",
        "mandatory": true, // <-- mandatory should not be shown in editor OR not movable and directly added to the right list.
              "hidden": true, // some plugins are only support, so maybe showing them in the UI is superfluous.
    }, {
        "name": "TOC",
       "symbol": "layers",
        "title": "plugins.TOC.title",
        "description": "plugins.TOC.description",
        "defaultConfig": {},
        "children": ["TOCItemSettings", "FeatureEditor"]
    }, {
        "name": "FeatureEditor",
        "defaultConfig":  {}
    }, {
        "name": "TOCItemSettings",
        "...": "..."
    }, {
        "name": "MyPlugin" // <-- this is typically an extension
    }, {
       "name": "Footer",
       "children": ["MousePosition", "CRSSelector",  "ScaleBox"]
    }, {
       "name": "Widgets",
      "children": ["WidgetsBuilderPlugin", "WidgetsTrayPlugin"],
      "dependencies": ["WidgetsBuilderPlugin"], // some plugins may be mandatory only if parent is added.
    }, {
      "name": "WidgetsTrayPlugin"
    },  {
      "name": "WidgetsBuilderPlugin",
      "hidden": true // <-- This is a child. In this case it will be added automatically,
                     // without showing if the parent is added
}]
}
```

The configuration contains the list of available plugins to display in the plugins selector.
Each entry of `plugins` array is an object that describes the plugin, it's dependencies and it's properties.
These are the properties allowed for the plugin entry object:

* `name`: `{string}` the name (ID) of the plugin
* `title`: `{string}` the title string OR messageId (from localization file)
* `description`: `{string}`: the description string OR messageId (from localization file)
* `symbol`: {string}`: icon (or image) symbol for the plugin
* `defaultConfig` `{object}`: optional object containing the default configuration to pass to the context-creator.
* `mandatory` `{boolean}`: if true, the plugin must be added to the map, so not possible to remove (but can be customized)
* `hidden` `{boolean}`: if true, the plugin should not be shown in UI. If mandatory, is added without showing.
* `children` `{string[]}`: list of the plugins names (ID) that should be shown as children in the UI
* `dependencies`: The difference between mandatory and dependencies is the "if the parent is present" condition.). Plugins that can not be disabled (or if are hidden, added by default) and are added ONLY if the parent plugin is added. (e.g. containers like toolbar, omnibar, footer or DrawerMenu, and other dependencies like Widgets that must contain WidgetsBuilder and so on)
