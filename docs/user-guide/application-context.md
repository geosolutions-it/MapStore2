# Application Context

*******************

In order to create a context, the user can click on the **Create Context** from the **Add Resource** <img src="../img/button/add_resouces.jpg" class="ms-docbutton"/> button in [Homepage](https://mapstore.geosolutionsgroup.com/mapstore/#/) and he will be addressed directly to a wizard. The wizard is composed by the following four steps:

<img src="../img/application-context/wizard.jpg" class="ms-docimage"/>

You can move through the steps of the wizard with the dedicated buttons located at the bottom right of the page.

<img src="../img/application-context/wizard2.jpg" class="ms-docimage"/>

In this way the user can:

* Move forward on the different steps through the **Next** button <img src="../img/button/next-button.jpg" class="ms-docbutton"/>

* Go back to the previous step through the **Back** button <img src="../img/button/back-button.jpg" class="ms-docbutton"/>

* Closed the context wizard through the **Close** button <img src="../img/button/close-button.jpg" class="ms-docbutton"/>

## General Settings

This first step allows to configure the **Name** and the **Window title** of the new context.

<img src="../img/application-context/stepone.jpg" class="ms-docimage"/>

!!! warning
    The name and the window title are both mandatory fields. Note that it is not allowed to choose a name that has already been assigned to another MapStore's resource (like maps, dashboards, stories): a warning message appears in this case to notify the user.

!!! note
    The **Window title** is the name of the browser window.

[MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) allows the user to **Import** an application context  by selecting the <img src="../img/button/import_button.jpg" class="ms-docbutton" /> button. The import screen appears so that it is possible to drag and drop a previously exported context file there or select it from the local machine through the <img src="../img/button/select-files.jpg" class="ms-docbutton"/> button.

<video class="ms-docimage" controls><source src="../img/application-context/import_context.mp4" /></video>

Once a valid context name is specified in *General settings*, it is possible to **Export** the context with all the configurations introduced up to that point; this is possible through the <img src="../img/button/export_button.jpg" class="ms-docbutton" /> button. The export screen appears and the user exports the context, in `JSON` format, by clicking the <img src="../img/button/export_button.jpg" class="ms-docbutton"/> button.

<video class="ms-docimage" controls><source src="../img/application-context/export_context.mp4" /></video>

!!! note
    The <img src="../img/button/import_button.jpg" class="ms-docbutton"/> button is only available on the first step of the application context wizard (the *General settings*) while the <img src="../img/button/export_button.jpg" class="ms-docbutton"/> button is always available with the only condition that a valid context name has been specified.

## Configure Map

To create the context viewer, the map configuration like the one described [here](exploring-maps.md#exploring-maps) opens so that the user can set the initial state of the context map.

<img src="../img/application-context/steptwo_part.jpg" class="ms-docimage"/>

In particular the user can configure the context map using the following MapStore tools:

* [Catalog](catalog.md#catalog-services), present in *Burger Menu* <img src="../img/button/burger.jpg" class="ms-docbutton" />, to configure the supported remote services (like CSW, TMS, WMS and WMTS) and add layers to the map.

* [Import](import.md#import-files), present in *Burger Menu* <img src="../img/button/burger.jpg" class="ms-docbutton" />, to import map files and import [vector file](import.md#import-vector-files).

* [Annotations](annotations.md#add-new-annotation), present in *Burger Menu* <img src="../img/button/burger.jpg" class="ms-docbutton" /> button, to add annotations to the map.

* [Table of Contents](toc.md#table-of-contents), through the <img src="../img/button/show-layers.jpg" class="ms-docbutton"/> button where the user can use all the available functionalities to manage context layers.

* [Background Selector](background.md#background-selector), at the bottom left of the viewer, allows the user to add, manage and remove map backgrounds

* [CRS Selector](footer.md#crs-selector), through the <img src="../img/button/crs_selector_icon.jpg" class="ms-docbutton" /> button at the bottom right of the *Footer*, to switch the Coordinate Reference System of the map

* The [Navigation Toolbar](navigation-toolbar.md), at the bottom right of the viewer, is useful to the user to explore the map.

An example of a context viewer with a new background and a layer, added to the map, can be the following:

<img src="../img/application-context/es_steptwo.jpg" class="ms-docimage"/>

## Configure Plugins

This wizard step allows to select the extensions that will be available in the context viewer: the user of a context will use only the plugins enabled by the user.
Within this wizard step, all the available plugins in MapStore are present in the left side list ready to be selected for the context . The right side list contains the list of plugins selected by the user for the context.

<img src="../img/application-context/stepthree.jpg" class="ms-docimage" style="max-width:500px;"/>

Through the central vertical bar the user can select the plugins to include in the context viewer by moving them from the **Available Plugins**  list to the **Enabled Plugins** list.

<img src="../img/application-context/stepthree-bar.jpg" class="ms-docimage" style="max-width:500px;"/>

In particular, the user can:

* Add an extension from the *Available Plugins* list to the *Enabled Plugins* list, using the **Add Extension** button <img src="../img/button/add_arrow_button.jpg" class="ms-docbutton"/>. Instead, remove an extension from the *Enabled Plugins* list using the **Remove Extension** button <img src="../img/button/remove_button.jpg" class="ms-docbutton"/>, as follows:

<video class="ms-docimage" controls><source src="../img/application-context/extension-in-out.mp4" /></video>

* Bring all extensions from one list to another using the **Add all extensions** button <img src="../img/button/add-all-button.jpg" class="ms-docbutton"/> or remove all extensions using the **Remove all extensions** button <img src="../img/button/remove-all-button.jpg" class="ms-docbutton"/>, as follows:

<video class="ms-docimage" controls><source src="../img/application-context/extensions-in-out.mp4" /></video>

To search for an extension listed, the user can use the **Search bar**.

<img src="../img/application-context/stepthree-search.jpg" class="ms-docimage" style="max-width:500px;"/>

### Add extensions to MapStore

The MapStore administrator can also install a custom plugin by using the **Add extension to MapStore** button <img src="../img/button/upload-button.jpg" class="ms-docbutton"/>, at the top right of the *Available Plugins* list.

Here the admin, in order to upload the plugin's package, can drag and drop it inside the import screen or select it from the folders of the local machine through the <img src="../img/button/select-files.jpg" class="ms-docbutton"/> button.

!!! warning
    A plugins package must be provided as .zip archives that contains:

    * An `index.json` file with a plugin definition

    * A plugin file with the extension code in `JavaScript`

    * All mandatory translations files in MapStore.

    A sample extension for testing purposes is available [here](https://github.com/geosolutions-it/mapstore-playground/raw/master/samples/SampleMapStoreExtension.zip). More extensions will be available in the future versions of MapStore.

Through the **Add** button <img src="../img/button/add_group_confirm_button.jpg" class="ms-docbutton"/> the plugin is inserted in the *Available Plugins* list.

<img src="../img/application-context/upload_plugin1.jpg" class="ms-docimage" style="max-width:500px;"/>

A plugin so installed can be included in the context viewer by moving it in the *Enabled Plugins* list or uninstalled through the **Delete** button <img src="../img/button/delete_white_button.jpg" class="ms-docbutton"/>.

<img src="../img/application-context/upload_plugin2.jpg" class="ms-docimage" style="max-width:500px;"/>

### Optional tools for enabled plugins

In the *Enabled Plugins* list, the following buttons are displayed for each extension:

<img src="../img/application-context/enabled-buttons.jpg" class="ms-docimage" style="max-width:500px;"/>

* The **Enable selection of current plugin for user** button <img src="../img/button/enable-plugin-user.jpg" class="ms-docbutton"/> allows the user to configure which extensions will be present in the [Extension Library](extension-library.md#extension-library) and not activated by default.

!!! note
    Once a plugin has been included in a context, it is active by default and available inside the viewer. The user can click on **Enable loading this plugin on startup** button <img src="../img/button/user-startup-button.jpg" class="ms-docbutton"/> to make that plugin not active by default: clicking on this button the plugin will not be available in the context viewer until explicitly activated by the end user through the *Extension Library*.

* The **Edit Plugin Configuration** button <img src="../img/button/edit-plugin.jpg" class="ms-docbutton"/> allows the user to interact with a text area to specify the plugin configuration and to override the default one.

<img src="../img/application-context/plugin-config.jpg" class="ms-docimage" style="max-width:300px;"/>

* The **Open plugin configuration documentation** button <img src="../img/button/docu-plugin.jpg" class="ms-docbutton"/> opens the [Plugins Documentation](https://mapstore.geosolutionsgroup.com/mapstore/docs/api/plugins) in another page.

### How to update extensions

Extension can be updated using two steps:

* Old extension removal.

* Uploading and installation of the new version of extension.

As previously stated, extension can be removed on "Configure Plugins" step of wizard using **Delete** button <img src="../img/button/delete_white_button.jpg" class="ms-docbutton"/>.

<img src="../img/application-context/upload_plugin2.jpg" class="ms-docimage" style="max-width:500px;"/>

At this point extension will be removed from application completely. Save context after extension removal only if you want
to be sure that extension will not be activated for the context if it's reinstalled at some point.

Do not save context and upload new version of extension right away after old version removal. Context don't need to be saved after new version installation.

With all stated above, complete workflow is:

* Open context editing and jump to the "Configure Plugins" step of the wizard.

* Delete old version of extension using **Delete** button <img src="../img/button/delete_white_button.jpg" class="ms-docbutton"/>.

* Upload and install new version of extension using the **Add extension to MapStore** button <img src="../img/button/upload-button.jpg" class="ms-docbutton"/>

* Do not save context, close wizard.

Existing configuration of extension (default or customized) will be preserved for all the contexts using extension.

## Configure Theme

The last wizard steps allows to configure the theme to use for a context. A dropdown allows to select one of the available themes (see the [Styling and Theming](../developer-guide/customize-theme.md#styling-and-theming) section of the online documentation to know how to create and include additional themes to MapStore). By default in [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) a **default** and a **dark** themes are available.

<img src="../img/application-context/step_four.jpg" class="ms-docimage"/>

### Default Theme

The **default** theme is always available for a context and it is the MapStore default one. This theme is automatically applied to the context if the *Configure Theme* wizard step is skipped during the context creation or when the theme selection drop-down is cleared. An example of a default context can be the following:

<img src="../img/application-context/default_theme.jpg" class="ms-docimage"/>

### Dark Theme

MapStore also provides by default an additional theme, the dark one, that can be selected from the drop-down menu to be used as an alternative theme for application contexts.

<img src="../img/application-context/dark_theme.jpg" class="ms-docimage" style="max-width:500px;"/>

An example of the **dark** theme applied to a context is the following one:

<img src="../img/application-context/dark_context.jpg" class="ms-docimage"/>

### Custom Theme

After selecting a theme from the drop-down, it is also possible to customize it from UI by enabling **Custom Variables**.

<img src="../img/application-context/custom_variables.jpg" class="ms-docimage" style="max-width:400px;"/>

Once **Custom Variables** is enabled, the context editor can modify main, primary and secondary colors for both backgrounds and texts (an helper clarifies the UI elements involved for each field in the form). Clicking on the *Change Color* button <img src="../img/button/color-picker.jpg" class="ms-docbutton"/> a color picker is displayed to allow the selection of the desire color, as follows:

<video class="ms-docimage" controls><source src="../img/application-context/color_picker_theme.mp4" /></video>

The colors that can be customized are the following ones:

* **Main Text Color** to choose the color used in panel or dialog texts

* **Main Background Color** to choose the color used in panel or dialog backgrounds

* **Primary Text Color** to choose the color used for icons inside toolbar, header and button texts

* **Primary Color** to choose the color used for icons inside toolbar, header and button backgrounds

* **Secondary Text Color** to choose the color used as button text when a button is active or selected

* **Secondary Color** to choose the color used as button background when a button is active or selected

!!! warning
    To ensure a good and well readable color contrast between each UI component, make sure to not use a secondary color too similar to the primary one and obviously the primary text color with its counterpart (the same applies for the other couples of colors: main, secondary).

An example of a custom context can be the following:

<img src="../img/application-context/cutom_context.jpg" class="ms-docimage"/>
