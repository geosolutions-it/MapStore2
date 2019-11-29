# Creating Widgets
******************

In addition to adding layers to the map, in [MapStore](https://mapstore.geo-solutions.it/mapstore/#/) the user can create widgets from the added layers. Widgets are graphical elements created by the user that describe and visualize qualitatively and quantitatively the data of the layer such as charts, texts, tables and counters.

* **Open** a new map.

* **Add** a layer (e.g. USA Population).

* **Select** the layer from the TOC.

* **Click** on the widget icon <img src="../img/button/widgets.jpg" class="ms-docbutton"/>.

The Widget page will open showing the various widget types to create.

<img src="../img/widgets/widget-list.jpg" class="ms-docimage" style="max-width:400px;"/>

Widgets Tray
------------

When created, the widgets will be placed on the map (or in the dashboard, depending on the context). In the header of each widget window there are some options:

<img src="../img/widgets/widgets-tray.jpg" class="ms-docimage"/>

* **Pin** the pin tool allow to lock the widget position

* **Collapse** the collapse tool allow to collapse the widgets in the *Widgets Tray*

* **Menu** a set of tools (depending of the widget). Contains the controls to "Remove" or Edit the widget

The **Widget Tray** is a plugin that allow to expand/collapse widgets one by one. In this tray you can see one item for each widget. You can click on these items to collapse or expand the single widgets. A **Collapse All** button allow to collapse or expand all widgets at once.

Widgets and **[Timeline](timeline.md#timeline)** cannot be expanded on the same map at the same time.<br>
If a layer with a time dimension is added to the map, the *Timeline* will be shown on the screen and not-pinned widgets will collapse in the tray automatically.<br>
When a widget is added to the map, the *Timeline* will collapse in the tray and all the widgets will expand. A tooltip will highlight the *Timeline* icon <img src="../img/button/timeline-collapse-icon.jpg" class="ms-docbutton"/> in the tray.<br>
When those events occur a **notification** explains what happened and how to manage the widgets and the *Timeline*.

<img src="../img/widgets/timeline-collapse.jpg"class="ms-docimage"/>

Creating Chart Widget
---------------------

* **Click** on *Chart* from the list. Another page will open showing the Chart types (Bar Chart, Pie Chart and Line Chart).

<img src="../img/widgets/chart-types.jpg" class="ms-docimage"  style="max-width:400px;"/>

* **Select** for example the *Bar Chart*. You will be addressed to the configuration page to configure the data.

<img src="../img/widgets/bar-chart.jpg" class="ms-docimage"  style="max-width:400px;"/>

On the top of the page, you can find: a set of options <img src="../img/widgets/widget-options.jpg" class="ms-docbutton"/> that allow you to switch back and forward the pages of the form; a connection button (highlighted in green because it is active by default) that connects the chart to the viewport; an advanced filter that allows you to plot only the filtered data.

* **Configure** the data you want to plot and the operation. Activating the *Advanced Options* you can customize the shape of the chart.

<img src="../img/widgets/configure-chart.jpg" class="ms-docimage"  style="max-width:400px;"/>

* **Click** on *Configure widget options*  <img src="../img/button/next.jpg" class="ms-docbutton"/>.
    * **Set** a *Title* and a *Description*.
    * **Click** on *Save*.

<img src="../img/widgets/widget-info.jpg" class="ms-docimage"  style="max-width:400px;"/>

The widget will be added to the map.

<img src="../img/widgets/widget-map.jpg" class="ms-docimage"/>

Expanding the options menu of the widget you can show the plotted data, edit the widget or delete it, download the data as a CSV file or save the image of the graph.

<img src="../img/widgets/widget-menu.jpg" class="ms-docimage"  style="max-width:500px;"/>

Similarly, you can add to the map Pie and Line Charts.

Creating Text Widget
--------------------

* **Select** the Text widget from the list. The Text widget form will open where you can add a Title and the desired descriptive text.

<img src="../img/widgets/text-widget.jpg" class="ms-docimage"  style="max-width:500px;"/>

* **Click** on the save button to add the widget to the map.

<img src="../img/widgets/text-map.jpg" class="ms-docimage"/>

Creating Table widget
---------------------

* **Select** the Table widget from the list. You will be addressed to the configuration page.

<img src="../img/widgets/table-widget.jpg" class="ms-docimage"  style="max-width:400px;"/>

* **Choose** the fields you want to include in the table.
    
    * **click** on the next button <img src="../img/button/next.jpg" class="ms-docbutton"/>.

    * **Set** a Title and a Description.

    * **Add** the widget to the map.

<img src="../img/widgets/table-map.jpg" class="ms-docimage"/>

Creating Counter Widget
-----------------------

 * **Select** the Counter widget from the list. You will be addressed to the configuration page.
  
  * **Configure** the data you want to count.

<img src="../img/widgets/counter-widget.jpg" class="ms-docimage"  style="max-width:400px;"/>

  * **click** on the next button <img src="../img/button/next.jpg" class="ms-docbutton"/>.

  * **Set** a Title and a Description.

  * **Add** the widget to the map.

<img src="../img/widgets/counter-map.jpg" class="ms-docimage"/>
