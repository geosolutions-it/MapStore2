# Adding Widgets

****************

With a click on the <img src="../img/button/++++.jpg" class="ms-docbutton"/> button in [Side Toolbar](exploring-dashboards.md#side-toolbar) the *Widget* panel opens, showing the list of the available widget types that can be added to the dashboard:

<img src="../img/adding-widgets/widgets-panel.jpg" class="ms-docimage"  style="max-width:400px;"/>

In particular, it is possible to choose between:

* **Chart**

* **Text**

* **Table**

* **Counter**

* **Map**

Creating *Chart*, *Text*, *Table* and *Counter* widgets the procedure is almost the same as that described for [create widgets in maps](widgets.md#widgets). The only minor differences are the following:

* In dashboards as soon as the user selects the widget type, a panel appears to select the layer from which the widget will be created. [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) allows you to choose between CSW, WMS and WMTS GeoSolutions Services, present by default, or by accessing WMS, WFS, CSW, WMTS and TMS Remote Services as explained in the [Managing Remote Services](catalog.md#managing-remote-services) section

<img src="../img/adding-widgets/default-services.jpg" class="ms-docimage"  style="max-width:400px;"/>

* In dashboards the possibility to connect/disconnect widgets to the map is replaced with the possibility to connect/disconnect the Map widgets together or with other widget types (this point will be better explained in [Connecting Widgets](connecting-widgets.md#connecting-widgets) section)

Creating Map type widgets, otherwise, is a functionality present only in dashboards.

## Map Widget

In dashboards, selecting the Map type widget, the following panel appears:

<img src="../img/adding-widgets/wid-select-map.jpg" class="ms-docimage"  style="max-width:400px;"/>

Here the user can:

* Go back to widget type selection through the <img src="../img/button/back.jpg" class="ms-docbutton"/> button

* Search for a map by writing its title

* Select one or more maps from the list of maps (mandatory in order to move forward)

* Move forward to the next step through the <img src="../img/button/next.jpg" class="ms-docbutton"/> button

Once a map is selected, the panel displays:

* The map preview

* The **Layers** tab with the list of layers present in the map

* The **Settings** tab

!!!note
    If user has selected more than one map, the map wizard displays the *map switcher* dropdown allowing user to select and configure the map.

!!!note
    If the **Empty Map** has been selected the user can:

    * Create a map widget using an empty map

    * If the map selection has an empty map, then the user is prompted with an option to enter map name

    * Upon adding the name, the map wizard displays the map switcher allowing user to select and configure the map

    * Add layers to the map through the <img src="../img/button/+++.jpg" class="ms-docbutton"/> button, as follows: <video controls class="ms-docimage"  style="max-width:400px;"><source src="../img/adding-widgets/wid-add-layer.mp4"> /></video>

### Layers tab

From the Layers tab the user can toggle the layer visibility and set layers transparency, as explained in [Display options](toc.md#display-options-in-panel) section. Furthermore, the user can manage the layer with the buttons present in the layer toolbar by selecting the layer in the list first.

<img src="../img/adding-widgets/wid-layers-new-buttons.jpg" class="ms-docimage"  style="max-width:400px;"/>

Here, the user is allowed to:

* **Zoom** to layers though the <img src="../img/button/zoom-layer.jpg" class="ms-docbutton"/> button

* Access [Layer Settings](layer-settings.md#layer-settings) through the <img src="../img/button/properties.jpg" class="ms-docbutton"/> button

* **Remove** layers through the <img src="../img/button/delete.jpg" class="ms-docbutton"/> button

* Disable/Enable the [Floating Identify Tool](navigation-toolbar.md#floating-identify-tool) to retrieve Identify information about layers available on the map through the <img src="../img/button/identify_green_burron.jpg" class="ms-docbutton"/> button

!!!warning
    The *Floating Identify* tool is active by default (the button is green)

### Settings tab

By switching to the Settings tab, the user can customize the map widget with the following options:

<img src="../img/adding-widgets/settings-tab.jpg" class="ms-docimage"  style="max-width:400px;"/>

* Enable/Disable the **Background Selector** useful to choose from configured backgrounds the desired one for the map

* Enable/Disable the **Legend** for showing the layers legend on map

Below is the final result displayed in the map widget after adding the two options above:

<img src="../img/adding-widgets/settings-tab-sample.jpg" class="ms-docimage"/>

Once the <img src="../img/button/next.jpg" class="ms-docbutton"/> button is clicked, the last step of the process is displayed like the following:

<img src="../img/adding-widgets/map-wid-info.jpg" class="ms-docimage" style="max-width:400px;"/>

Here the user has the possibility to insert a **Title** and a **Description** for the widget (optional fields) and to complete its creation by clicking on the <img src="../img/button/save-icon.jpg" class="ms-docbutton"/> button. After that, the widget is added to the viewer space:

<img src="../img/adding-widgets/viewer-map.jpg" class="ms-docimage" style="max-width:600px;"/>

### Advanced map editor

From the *Map Widget* menu, the user can access the **Map Editor** by clicking the <img src="../img/button/three-dots-button.jpg" class="ms-docbutton"/> button. This allows for advanced customization of the map's content and appearance using a more advanced viewer.

<img src="../img/adding-widgets/ad-edit-map.jpg" class="ms-docimage"/>

The primary tools available for modifying the map are:

* The **Catalog** to add a new layer, as described in the [Catalog Services](catalog.md#catalog-services).

* The **Annotations** tool to create and manage annotations, as explained in [Adding Annotations](annotations.md#add-new-annotation).

* **Import** and **EXport** map context files, as detailed in [Importing and Exporting Files](import.md##export-and-import-map-context-files).

* **Change Background** as it is explained in the [Background Selector](background.md#background-selector)

* Manage layer's [**Attribute Table**](attributes-table.md) and the layer's [Settings](layer-settings.md)

Once the advanced map editing is complete, it is possible click on <img src="../img/button/ok.jpg" class="ms-docbutton"/> button to see the final result in the *Map Widget*.

<img src="../img/adding-widgets/map-backg-inline.jpg" class="ms-docimage"/>

## Legend widget

When at least one Map widget is created and added to the dashboard, there's the possibility to add also the **Legend** widget, available in the widget types list:

<img src="../img/adding-widgets/list-legend.jpg" class="ms-docimage" style="max-width:400px;"/>

Selecting the Legend widget, the user can choose the Map widget to which the legend will be connected (when only a Map widget is present in the dashboard this step is skipped):

<img src="../img/adding-widgets/select-map-connection.jpg" class="ms-docimage" style="max-width:600px;"/>

Once a Map widget is connected, the preview panel is similar to the following:

<img src="../img/adding-widgets/legend-preview.jpg" class="ms-docimage" style="max-width:400px;"/>

Here the user can go back <img src="../img/button/back.jpg" class="ms-docbutton"/> to the widget types section, connect <img src="../img/button/connect-widget.jpg" class="ms-docbutton"/> or disconnect <img src="../img/button/connection-icon.jpg" class="ms-docbutton"/>the legend to a map and move forward <img src="../img/button/next.jpg" class="ms-docbutton"/> to widget options. <br>
If the last option is selected, a configuration panel similar to the [Map widgets](#map-widget) one gives the possibility, before save, to set the *Title* and the *Description* for the Legend widget. <br>
An example of a Map widgets and a Legend widget is the following:

<img src="../img/adding-widgets/legend-ex.jpg" class="ms-docimage"/>
