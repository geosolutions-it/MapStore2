# Application Context
*******************

In order to create a context, the *Admin* can click on the **New Context** button <img src="../img/button/new-context-button.jpg" class="ms-docbutton"/> in the [Contexts page](managing-contexts.md) and he will be addressed directly to a wizard. The wizard is composed by the following three steps:

<img src="../img/application-context/wizard.jpg" class="ms-docimage"/>

You can move through the steps of the wizard with the dedicated buttons located at the bottom right of the page.

<img src="../img/application-context/wizard2.jpg" class="ms-docimage"/>

In this way the admin can:

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

## Configure Map

To create the context viewer, the map configuration (like the one described [here](exploring-maps.md) opens so that the admin can set the initial state of the context map.

<img src="../img/application-context/steptwo_part.jpg" class="ms-docimage"/>

In particular the admin can configure the context map using the following MapStore tools:

* [Catalog](catalog.md), present in *Burger Menu* <img src="../img/button/burger.jpg" class="ms-docbutton" />, to configure the supported remote services (like CSW, TMS, WMS and WMTS) and add layers to the map.

* [Import](import.md), present in *Burger Menu* <img src="../img/button/burger.jpg" class="ms-docbutton" />, to import map files and import [vector file](import.md#import-vector-files).

* [Annotations](annotations.md), present in *Burger Menu* <img src="../img/button/burger.jpg" class="ms-docbutton" /> button, to add annotations to the map.

* [Table of Contents](toc.md), through the <img src="../img/button/show-layers.jpg" class="ms-docbutton"/> button where the admin can use all the available functionalities to manage context layers.

* [Background Selector](background.md), at the bottom left of the viewer, allows the user to add, manage and remove map backgrounds

* [CRS Selector](footer.md#crs-selector), through the <img src="../img/button/crs_selector_icon.jpg" class="ms-docbutton" /> button at the bottom right of the *Footer*, to switch the Coordinate Reference System of the map

* The [Side Bar](side-bar.md), at the bottom right of the viewer, is useful to the admin to explore the map.

An example of a context viewer with a new background and a layer, added to the map, can be the following:

<img src="../img/application-context/es_steptwo.jpg" class="ms-docimage"/>

## Configure Plugins

This wizard step allows to select the extensions that will be available in the context viewer: the user of a context will use only the plugins enabled by the administrator.
Within this wizard step, all the available plugins in MapStore are present in the left side list ready to be selected for the context . The right side list contains the list of plugins selected by the administrator for the context.

<img src="../img/application-context/stepthree.jpg" class="ms-docimage" style="max-width:500px;"/>

Through the central vertical bar the administrator can select the plugins to include in the context viewer by moving them from the **Available Plugins**  list to the **Enabled Plugins** list.

<img src="../img/application-context/stepthree-bar.jpg" class="ms-docimage" style="max-width:500px;"/>

In particular, the admin can:

* Add an extension from the *Available Plugins* list to the *Enabled Plugins* list, using the **Add Extension** button <img src="../img/button/add_arrow_button.jpg" class="ms-docbutton"/>. Instead, remove an extension from the *Enabled Plugins* list using the **Remove Extension** button <img src="../img/button/remove_button.jpg" class="ms-docbutton"/>, as follows:

<img src="../img/application-context/extension-in-out.gif" class="ms-docimage"/>

* Bring all extensions from one list to another using the **Add all extensions** button <img src="../img/button/add-all-button.jpg" class="ms-docbutton"/> or remove all extensions using the **Remove all extensions** button <img src="../img/button/remove-all-button.jpg" class="ms-docbutton"/>, as follows:

<img src="../img/application-context/extensions-in-out.gif" class="ms-docimage"/>

To search for an extension listed, the admin can use the **Search bar**.

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

* The **Enable selection of current plugin for user** button <img src="../img/button/enable-plugin-user.jpg" class="ms-docbutton"/> allows the admin to configure which extensions will be present in the [Extension Library](extension-library.md) and not activated by default.

!!! note
    Once a plugin has been included in a context, it is active by default and available inside the viewer. The administrator can click on **Enable loading this plugin on startup** button <img src="../img/button/user-startup-button.jpg" class="ms-docbutton"/> to make that plugin not active by default: clicking on this button the plugin will not be available in the context viewer until explicitly activated by the end user through the *Extension Library*.

* The **Edit Plugin Configuration** button <img src="../img/button/edit-plugin.jpg" class="ms-docbutton"/> allows the admin to interact with a text area to specify the plugin configuration and to override the default one.

<img src="../img/application-context/plugin-config.jpg" class="ms-docimage" style="max-width:300px;"/>

* The **Open plugin configuration documentation** button <img src="../img/button/docu-plugin.jpg" class="ms-docbutton"/> opens the [Plugins Documentation](https://mapstore.geo-solutions.it/mapstore/docs/api/plugins#plugins) in another page.


