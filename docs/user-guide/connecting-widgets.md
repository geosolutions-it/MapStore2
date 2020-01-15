# Connecting Widgets
********************

In dashboards it is possible to connect Map widgets with:

* Other Map widgets

* Chart widgets

* Table widgets

* Counter widgets

* Legend widgets 

## Maps with other Maps

As soon as more than one Map widget is added to the dashboard, in the *Configure map options* panel (accessible adding a new Map widget or editing an existing one) the connect/disconnect button appears:

<img src="../img/connecting-widgets/connection-options.jpg" class="ms-docimage" style="max-width:400px;"/>

With a click on it, if only another Map widget is present, by default the connection will be made towards that Map widgets. When more than one Map widget is present in the dashboard, instead, it is possible choose one through a page like the following:

<img src="../img/connecting-widgets/map-to-connect.jpg" class="ms-docimage"/>

Once a Map widget is connected to another map in the dashboard, each pan or zoom operation performed on the connected map is performed also in the other one accordingly:

<img src="../img/connecting-widgets/changes.gif" class="ms-docimage"/>

Since at least one connection is set, the **Show connections** button <img src="../img/button/show-connections.jpg" class="ms-docbutton"/> appears in the [Sidebar](exploring-dashboards.md#sidebar) just below the **Add widget** button <img src="../img/button/+++.jpg" class="ms-docbutton"/>. With a click on it, it turns green and a colored top border appears in the connected widgets, so that the user can immediately understand which widgets are connected together:

<img src="../img/connecting-widgets/connections-showed.jpg" class="ms-docimage"/>

## Maps with Charts, Tables and Counters

In order to connect Charts, Tables or Counters widget with Maps widget, the procedure is similar to that seen in the [previous section](connecting-widgets.md#maps-with-other-maps). The result is that the information displayed in the Chart, Table or Counter changes accordingly with the map portion displayed in the connected Map widget. For example the result could be:

* Connecting Charts with Maps:

<img src="../img/connecting-widgets/chart-map.jpg" class="ms-docimage"/>

* Connecting Tables with Maps:

<img src="../img/connecting-widgets/table-map.jpg" class="ms-docimage"/>

* Connecting Counters with Maps:

<img src="../img/connecting-widgets/counter-map.jpg" class="ms-docimage"/>

When a pan or zoom operation is performed in the Map widget, the other connected widgets are spatially filtered according to the Map viewport.

## Maps with Legends

Also in this case the connecting procedure is similar to those seen previously, but now the information contained in the Legend widget doesn't change according with the map extension. An example can be the following:

<img src="../img/connecting-widgets/legend-map.jpg" class="ms-docimage"/>



