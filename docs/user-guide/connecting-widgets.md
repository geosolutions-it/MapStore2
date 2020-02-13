# Connecting Widgets
********************
In the dashboards it is possible to connect the widgets with a **Map** or a **Table**, allowing the user to interact simultaneously with all the connected widgets. 

<img src="../img/connecting-widgets/widgets_interaction.gif" class="ms-docimage" style="max-width:700px;"/>

If the connections button, in the [Sidebar](exploring-dashboards.md#sidebar), is lit, green, <img src="../img/button/connections.jpg" class="ms-docbutton"/> the connections between the widgets are visible on the dashboard and a colored bar appears above them highlighting which widgets are connected to each other. 

<img src="../img/connecting-widgets/connections_widgets.gif" class="ms-docimage" style="max-width:700px;"/>

## Connecting Widgets with Map

In dashboards it is possible to connect Map widgets with:

* Other Map widgets

* Chart widgets

* Table widgets

* Counter widgets

* Legend widgets 

### Maps with other Maps

As soon as more than one Map widget is added to the dashboard, in the *Configure map options* panel (accessible adding a new Map widget or editing an existing one) the connect/disconnect button appears:

<img src="../img/connecting-widgets/connection-options.jpg" class="ms-docimage" style="max-width:400px;"/>

With a click on it, if only another Map widget is present, by default the connection will be made towards that Map widgets. When more than one Map widget is present in the dashboard, instead, it is possible choose one through a page like the following:

<img src="../img/connecting-widgets/map-to-connect.jpg" class="ms-docimage"/>

### Maps with Charts, Tables and Counters

In order to connect Charts, Tables or Counters widget with Maps widget, the procedure is similar to that seen in the [previous section](connecting-widgets.md#maps-with-other-maps). The result is that the information displayed in the Chart, Table or Counter changes accordingly with the map portion displayed in the connected Map widget. For example the result could be:

* Connecting Charts with Maps:

<img src="../img/connecting-widgets/chart-map.jpg" class="ms-docimage"/>

* Connecting Tables with Maps:

<img src="../img/connecting-widgets/table-map.jpg" class="ms-docimage"/>

* Connecting Counters with Maps:

<img src="../img/connecting-widgets/counter-map.jpg" class="ms-docimage"/>

When a pan or zoom operation is performed in the Map widget, the other connected widgets are spatially filtered according to the Map viewport.

### Maps with Legends

Also in this case the connecting procedure is similar to those seen previously, but now the information contained in the Legend widget doesn't change according with the map extension. An example can be the following:

<img src="../img/connecting-widgets/legend-map.jpg" class="ms-docimage"/>

## Connecting Widgets with Table

With the same procedure used for maps, that seen in the [previous section](connecting-widgets.md#maps-with-other-maps), the user can connect Table widgets with:

* Map widgets

* Other tables widget, only if it refers to the same layer

* Chart widgets, only if it refers to the same layer

* Counter widgets, only if it refers to the same layer

When a table is connected with other widgets, a filter appears on the table and its became a **Parent Table**. 

<img src="../img/connecting-widgets/table_filter.jpg" class="ms-docimage" style="max-width:700px;"/>  

Through the filter it is possible to filter its attributes like the following:

<img src="../img/connecting-widgets/filter_on_table.gif" class="ms-docimage" style="max-width:700px;"/>

## The interactions

By connecting a *Table*, a *Map* and an other widget together the interaction between them it is possible thanks to the fact that they can be connected with a Map that is connected at the same time with a Parent Table.

This triple connection is always possible by connecting widgets with the same layer and filtering the table. An example can be the following:

<img src="../img/connecting-widgets/interaction_a.gif" class="ms-docimage" style="max-width:700px;"/> 

The connection with the widgets of different layers can take place only if they are connected to the Map and not to the parent Table. An example can be the following:

<img src="../img/connecting-widgets/interaction_ab.gif" class="ms-docimage" style="max-width:700px;"/> 

!!! note
    The map, at a different layer, is the only widget that can be connected to the Parent Table


    