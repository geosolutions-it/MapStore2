# Connecting Widgets
********************
In dashboards it is possible to connect the added widgets allowing the user to inspect and interact with more than one of them at the same time.

<img src="../img/connecting-widgets/widgets_interaction.gif" class="ms-docimage" style="max-width:700px;"/>

Once at least one connection between widgets is set, it is possible to identify the connected widgets turning on the connections button in the dashboard [Sidebar](exploring-dashboards.md#sidebar) making it green <img src="../img/button/connections.jpg" class="ms-docbutton"/>. This will highlight the connected elements with a colored bar on their upper side.

<img src="../img/connecting-widgets/connections_widgets.gif" class="ms-docimage" style="max-width:700px;"/>

In general, you can connect:

* Map widgets with other widgets

* Table widgets with other widgets

## Connecting Map widgets with other widgets

In dashboards it is possible to connect Map widgets with:

* Other Map widgets

* Chart widgets

* Table widgets

* Counter widgets

* Legend widgets 

### Maps with other Maps

As soon as more than one Map widget is added to the dashboard, the connect/disconnect button appears inside the *Configure map options* panel (accessible by adding a new Map widget or editing an existing one).

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

## Connecting Table widgets with other widgets

With the same procedure used for maps (see [previous section](connecting-widgets.md#maps-with-other-maps)) the user can connect Table widgets with:

* Map widgets

* Other tables widget, only if it refers to the same layer

* Chart widgets, only if it refers to the same layer

* Counter widgets, only if it refers to the same layer

When a table is connected with other widgets, it became a *Parent Table* and a filter appears on the top.

<img src="../img/connecting-widgets/table_filter.jpg" class="ms-docimage" style="max-width:700px;"/>  

It is possible to apply a filter in the *Parent Table* simply by typing a text in the input field present at the top of each column:

<img src="../img/connecting-widgets/filter_on_table.gif" class="ms-docimage" style="max-width:700px;"/>

Once a widget is connected to a map widget that is connected with a Parent Table at the same time, the filter applied in the Parent Table will also filter all the other connected widgets accordingly:

<img src="../img/connecting-widgets/interaction_a.gif" class="ms-docimage" style="max-width:700px;"/> 

!!! note
    This type of interaction works even if the widget, connected to the map, does not have the same layer as the map or table