# Working with Extensions

The MapStore2 [plugins architecture](plugins-architecture.md#plugins-architecture) allows building your own independent modules that will integrate seamlessly into your project.

Extensions are plugins that can be distributed as a separate package (a zip file), and be installed, activated and used at runtime.
Creating an extension is similar to creating a plugin. If you are not familiar with plugins, please, read the [Plugins HowTo page](plugins-howto.md#creating-a-mapstore2-plugin) first.

## Developing an extension

The easiest way to develop an extension is to start from the [MapStoreExtension project](https://github.com/geosolutions-it/MapStoreExtension) that gives you a sandbox to create/test and build your extension.

Read [the readme of the project](https://github.com/geosolutions-it/MapStoreExtension/blob/master/README.md) to understand how to run, debug and build a new extension starting from the sampleExtension in the project.

Here you can find some details about the structure extension files, useful for development and debugging.

## An extension example

A MapStore extension is a plugin, with some additional features.

```javascript
import {connect} from "react-redux";

import Extension from "../components/Extension";
import Rx from "rxjs";
import { changeZoomLevel } from "../../../web/client/actions/map";

export default {
    name: "SampleExtension",
    component: connect(state => ({
        value: state.sampleExtension && state.sampleExtension.value
    }), {
        onIncrease: () => {
            return {
                type: 'INCREASE_COUNTER'
            };
        }, changeZoomLevel
    })(Extension),
    reducers: {
        sampleExtension: (state = { value: 1 }, action) => {
            if (action.type === 'INCREASE_COUNTER') {
                return { value: state.value + 1 };
            }
            return state;
        }
    },
    epics: {
        logCounterValue: (action$, store) => action$.ofType('INCREASE_COUNTER').switchMap(() => {
            /* eslint-disable */
            console.log('CURRENT VALUE: ' + store.getState().sampleExtension.value);
            /* eslint-enable */
            return Rx.Observable.empty();
        })
    },
    containers: {
        Toolbar: {
            name: "SampleExtension",
            position: 10,
            text: "INC",
            doNotHide: true,
            action: () => {
                return {
                    type: 'INCREASE_COUNTER'
                };
            },
            priority: 1
        }
    }
};

```

As you can see from the code, the most important difference is that you need to export the plugin descriptor **WITHOUT** invoking `createPlugin` on it (this is done in `extensions.js` in dev environment and when installed it will be done by the extensions load system).
The extension definition will import or define all the needed dependencies (components, reducers, epics) as well as the plugin configuration elements
(e.g. containers).

### Dynamic import of extension

MapStore supports dynamic import of plugins and extensions.

Dynamically imported plugins or extensions uses lazy-loading: components, reducers and epics will be loaded once plugin or extension
is in the list of plugins configured for the current page (eg. via `localConfig.json` or plugins selected to be included in a context).

!!! note

    Application context could have plugins configured to be loaded optionally using the [Extensions Library](../../user-guide/extension-library/#extension-library).
    Such plugins will be loaded only after being directly activated by the user in the extensions library UI.

Regardless if extension uses lazy-loading or not, its epics will be muted once extension is not rendered on the page.
For more details see [Epic state](../writing-epics/#epic-state-muted-unmuted).

There are few changes required to make extension loaded dynamically:

1. Create `Module.jsx` file in `js/extension/plugins/` and populate it with `js/extension/plugins/Extension.jsx` content.
2. Update content of `js/extension/plugins/Extension.jsx` to be like:

    ```jsx
    import {toModulePlugin} from "@mapstore/utils/ModulePluginsUtils";
    import { name } from '../../../config';

    export default toModulePlugin(name, () => import(/* webpackChunkName: 'extensionName' */ './Module'));
    ```

3. Update `js/extensions.js` and remove `createPlugin` wrapper from `Extension` export. File content should look like:

    ```js
    import Extension from './extension/plugins/Extension';
    import { name } from '../config';


    export default {
        [name]: Extension
    };
    ```

### Distributing your extension as an uploadable module

The sample project allow you to create the final zip file for you.

The final zip file must have this form:

* the file named `index.js` is the main entry point, for the module.
* an `index.json` file that describes the extension, an example follows
* `assets` folder, that contains additional bundles (js, css) came out from the bundle compilation. All additional files (js chunks, css ...) must stay in this folder.
* optionally, a `translations` folder with localized message files used by the extension (in one or more languages of your choice)

```text
my-extension.zip
|── index.js
├── index.json
├── assets
    ├── css
        └── 123.abcd.css
        └── ...
    └── js
        └── 456.abcd.js
        └── ...
└── translations
    └── data.en_EN.json
    └── ...
```

#### index.json

The `index.json file should contain all the information about the extension:

* An `id` that identifies the extension
* A `version` to show in UI. Semantic versioning is suggested.+

* `title` and `description` to display in UI, mnemonic hints for the administrator
* `plugins` the list of plugins that it adds to the application, with all the data useful for the context manager. Format of the JSON object for plugins is suggested [here](https://github.com/georchestra/mapstore2-georchestra/issues/15#issuecomment-564974270)

```json
{
    "id": "a_unique_extension_identifier",
    "version": "1.0.0",
    "title": "the title of the description",
    "description": "a description of the extension",
    "plugins": [{
         "name": "MYPlugin",
         "title": "extensions.a_unique_extension_identifier.title",
         "description": "",
         "defaultConfig": {},
         "...": "..."
    }]
}
```

`plugins` section contains the plugins defined in the extension, and it is needed to be configured in the context-editor. See [Context Editor Configuration](context-editor-config.md#configuration-of-application-context-manager)

### Installing Extensions

Extensions can be uploaded using the context creator UI of MapStore. The storage and configuration of the uploaded zip bundle is managed by a dedicated MapStore backend service, the ***Upload Service***.
The Upload Service is responsible for unzipping the bundle, storing javascript and the other extension assets in the extensions folder and updating the configuration files needed by MapStore to use the extension:

* `extensions.json` (the extensions registry)
* `pluginsConfig.json.patch` (the context creator plugins catalog patch file)

### Updating Extensions

Please refer to the [How to update extensions](../../user-guide/application-context/#how-to-update-extensions) section of user guide to get more information about extensions update workflow.

### Extensions and datadir

Extensions work better if you use a [datadir](externalized-configuration.md#externalized-configuration), because when a datadir is configured,
extensions are uploaded inside it, so they can ***live*** outside the application main folder (and you don't risk to overwrite them when
you upgrade MapStore to a newer version).

### Extensions for dependent projects

Extensions build in MapStore actually can run only in MapStore product. They can not be installed in dependent projects. If you have a custom project, and you want to add support for extensions, you will have to create your build system for extensions dedicated to your application, to build the Javascript with the correct paths.
Moreover, to enable extensions to work with the datadir in a dependent project (MapStore product is already configured to use it) you need to configure (or customize) the following configuration properties in your `app.jsx`:

#### Externalize the extensions configuration

Change `app.jsx` to include the following statement:

```javascript
ConfigUtils.setConfigProp("extensionsRegistry", "rest/config/load/extensions.json");
```

#### Externalize the context plugins configuration

Change `app.jsx` to include the following statement:

```javascript
ConfigUtils.setConfigProp("contextPluginsConfiguration", "rest/config/load/pluginsConfig.json");
```

#### Externalize the extensions assets folder

Change `app.jsx` to include the following statement:

```javascript
ConfigUtils.setConfigProp("extensionsFolder", "rest/config/loadasset");
```

Assets are loaded using a different service, `/rest/config/loadasset`.

## Managing drawing interactions conflict in extension

Extension could implement drawing interactions, and it's necessary to prevent a situation when multiple tools from different plugins or extensions have active drawing, otherwise it could end up in an unpredicted or buggy behavior.

There are two ways how drawing interaction can be implemented in plugin or extension:

* Using DrawSupport (e.g. Annotations plugin)

* By intercepting click on the map interactions (e.g. Measure plugin)

### Making another plugins aware of your extension starts drawing

If your extension using DrawSupport - you're on the safe side.
Extension will dispatch `CHANGE_DRAWING_STATUS` action.
This action can be traced by another plugins or extensions, and they can control their tools accordingly.

If your extension is using `CLICK_ON_MAP` action and intercepts it perform any manipulations on click - you need to make sure that your extension also dispatch `REGISTER_EVENT_LISTENER` action (see `Measure` plugin as an example) when your extension activates drawing.

It should also dispatch `UNREGISTER_EVENT_LISTENER` once drawing interaction stops.

### Making your extension aware of another plugin drawing

There is a helper utility named `shutdownToolOnAnotherToolDrawing`. This is a wrapper for a common approach to dispatch actions that will toggle off drawing interactions of your extension whenever another plugin or extension starts drawing.

extensionEpics.js:

```js
export const toggleToolOffOnDrawToolActive = (action$, store) => shutdownToolOnAnotherToolDrawing(action$, store, 'yourToolName');
```

with this code located in extension's epics your tool `yourToolName` will be closed whenever:

* feature editor is open
* another plugin or extension starts drawing.

"shutdownToolOnAnotherToolDrawing" supports passing custom callback to determine whether your tool is active (to prevent garbage action dispatching if it's already off) and custom callback to list actions to be dispatched.

## Using "ResponsiveContainer" for dock panels

Starting with MapStore v2022.02.00, layout improvements have been introduced which, in addition to other changes,
introduce a new sidebar menu to be used instead of the burger menu.

All extensions using `DockPanel` or `DockablePanel` components have to be updated
if their dock panel is rendered on the right side of the screen, next to the new sidebar menu.

Following changes should be applied (`MapTemplates` plugin can be a reference for the changes needs to be applied):

1. Make your extension aware of the map layout changes by getting corresponding state value using following selector:

    ```js
    createSelector(
        ...
        state => mapLayoutValuesSelector(state, { height: true, right: true }, true),
        ...
        (dockStyle) => ({
            dockStyle
        })
    )
    ```

    It will get offset from the right and the bottom that needs to be applied to the `ResponsiveContainer`

2. Replace `DockPanel`, `DockablePanel`, `ContainerDimensions` (if used) with the `ResponsiveContainer` and make sure
that dock content is a child of `ResponsiveContainer`:

    was:

    ```js
    return (
        <DockPanel
            open={props.active}
            position="right"
            size={props.size}
            bsStyle="primary"
            title={<Message msgId="mapTemplates.title"/>}
            style={{ height: 'calc(100% - 30px)' }}
            onClose={props.onToggleControl}>
            {!props.templatesLoaded && <div className="map-templates-loader"><Loader size={352}/></div>}
            {props.templatesLoaded && <MapTemplatesPanel
                templates={props.templates}
                onMergeTemplate={props.onMergeTemplate}
                onReplaceTemplate={props.onReplaceTemplate}
                onToggleFavourite={props.onToggleFavourite}/>}
        </DockPanel>
    )
    ```

    become:

    ```js
    return (
        <ResponsivePanel
            containerStyle={props.dockStyle}
            style={props.dockStyle}
            containerId="map-templates-container"
            containerClassName="dock-container"
            className="map-templates-dock-panel"
            open={props.active}
            position="right"
            size={props.size}
            bsStyle="primary"
            title={<Message msgId="mapTemplates.title"/>}
            onClose={props.onToggleControl}
        >
            {!props.templatesLoaded && <div className="map-templates-loader"><Loader size={352}/></div>}
            {props.templatesLoaded && <MapTemplatesPanel
                templates={props.templates}
                onMergeTemplate={props.onMergeTemplate}
                onReplaceTemplate={props.onReplaceTemplate}
                onToggleFavourite={props.onToggleFavourite}/>}
        </ResponsivePanel>
    );
    ```

    With the applied changes dock will be rendered properly both for layout with `BurgerMenu` and `SidebarMenu`.

## Making other dock panels closed automatically when extension panel is open

All the dock panels open next to the sidebar should be mutually excluded. Active dock panel should be closed whenever another panel is open.

Array at `state.maplayout.dockPanels.right` contains list of panels that can be extended or modified by extension by dispatching
`updateDockPanelsList` action.

Please note that adding dock into the list will automatically close previously active panel, so it's a good idea to
dispatch the action on app initializing or when dock panel is open. Measurement plugin can be used as a reference of
implementation, see `openMeasureEpic` & `closeMeasureEpic` in `epics/measurement.js`.
