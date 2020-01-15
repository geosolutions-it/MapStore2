# Adding Widgets
****************

With a click on the <img src="../img/button/+++.jpg" class="ms-docbutton"/> button in [Sidebar](exploring-dashboards.md#sidebar) the *Widget* panel opens, showing the list of the available widget types that can be added to the dashboard:

<img src="../img/adding-widgets/widgets-panel.jpg" class="ms-docimage"  style="max-width:400px;"/>

In particular, it is possible to choose between:

* **Chart**

* **Text**

* **Table**

* **Counter**

* **Map**

Creating *Chart*, *Text*, *Table* and *Counter* widgets the procedure is almost the same as that described for [create widgets in maps](widgets.md). The only minor differences are the following:

* In dashboards as soon as the user select the widget type, a panel appears in order to select the layer from which the widget will be created

* In dashboards the possibility to connect/disconnect widgets to the map is replaced with the possibility to connect/disconnect the Map widgets together or with other widget types (this point will be better explained in [Connecting Widgets](connecting-widgets.md) section)

Creating Map type widgets, otherwise, is a functionality present only in dashboards.

## Map Widget

In dashboards, selecting the Map type widget, the following panel appears:

<img src="../img/adding-widgets/wid-select-map.jpg" class="ms-docimage"  style="max-width:400px;"/>

Here the user can:

* Go back <img src="../img/button/back.jpg" class="ms-docbutton"/> to widget type selection

* Search for a map by writing its title

* Select a map (mandatory in order to move forward)

* Move forward to the next step <img src="../img/button/next.jpg" class="ms-docbutton"/>

The next panel is similar to the following (in this case an empty map was selected):

<img src="../img/adding-widgets/wid-map-options.jpg" class="ms-docimage"  style="max-width:400px;"/>

Now the user is allowed to add layers to the map through the <img src="../img/button/+++.jpg" class="ms-docbutton"/> button:

<img src="../img/adding-widgets/wid-add-layer.gif" class="ms-docimage"  style="max-width:400px;"/>

Once a layer is added to the map widget, it will be displayed in preview and in layers list:

<img src="../img/adding-widgets/wid-layers-list.jpg" class="ms-docimage"  style="max-width:400px;"/>

It's now possible to toggle the layer visibility, and set layers transparency (more information in [Display options](toc.md#display-options-in-panel) section). Furthermore, by selecting it, new buttons are added to the toolbar allowing to:

* Zoom to layers <img src="../img/button/zoom-layer.jpg" class="ms-docbutton"/>

* Access [Layer Settings](layer-settings.md) <img src="../img/button/properties.jpg" class="ms-docbutton"/>

* Remove layers <img src="../img/button/delete.jpg" class="ms-docbutton"/>

!!!note
    Adding layers is not mandatory, it is possible to create a widget map using an empty map.

Once the <img src="../img/button/next.jpg" class="ms-docbutton"/> button is clicked, the last step of the process is displayed like the following:

<img src="../img/adding-widgets/map-wid-info.jpg" class="ms-docimage" style="max-width:400px;"/>

Here the user has the possibility to insert a **Title** and a **Description** for the widget (optional fields) and to complete its creation by clicking on the <img src="../img/button/save-icon.jpg" class="ms-docbutton"/> button. After that, the widget is added to the viewer space:

<img src="../img/adding-widgets/viewer-map.jpg" class="ms-docimage" style="max-width:600px;"/>

## Legend widget

When at least one Map widget is created and added to the dashboard, there's the possibility to add also the **Legend** widget, available in the widget types list:

<img src="../img/adding-widgets/list-legend.jpg" class="ms-docimage" style="max-width:400px;"/>

Selecting the Legend widget, the user can choose the Map widget to which the legend will be connected (when only a Map widget is present in the dashboard this step is skipped):

<img src="../img/adding-widgets/select-map-connection.jpg" class="ms-docimage" style="max-width:600px;"/>

Once a Map widget is connected, the preview panel is similar to the following:

<img src="../img/adding-widgets/legend-preview.jpg" class="ms-docimage" style="max-width:400px;"/>

Here the user can go back <img src="../img/button/back.jpg" class="ms-docbutton"/> to the widget types section, connect <img src="../img/button/connect-widget.jpg" class="ms-docbutton"/> or disconnect <img src="../img/button/connection-icon.jpg" class="ms-docbutton"/>the legend to a map and move forward <img src="../img/button/next.jpg" class="ms-docbutton"/> to widget options. <br>
If the last option is selected, a configuration panel similar to the [Map widgets](adding-widgets.md#map-widget) one gives the possibility, before save, to set the *Title* and the *Description* for the Legend widget. <br>
An example of a Map widgets and a Legend widget is the following:

<img src="../img/adding-widgets/legend-ex.jpg" class="ms-docimage"/>
