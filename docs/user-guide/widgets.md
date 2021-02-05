# Widgets
*********

In [MapStore](https://mapstore.geo-solutions.it/mapstore/#/) it is possible to create widgets from the layers added to the map. Widgets are components such as charts, texts, tables and counters, useful to describe and visualize qualitatively and quantitatively layers data and provide the user the opportunity to analyze information more effectively.

!!! Note
    Some widgets (in maps or in dashboards) need some WPS back-end support to work:

    * The `map widgets` (dashboards) needs the WPS process `gs:Bounds` to zoom to filtered data, if connected to a table.
    
    * For aggregate operations, `chart` and `counter` widgets need the WPS process `gs:Aggregate` available in GeoServer to work.

## Add a Widget

Once at least one layer is present in the map (see [Catalog](catalog.md) section for more information about adding layers), it is possible to create a widget by selecting that layer in the [TOC](toc.md) and by clicking on the <img src="../img/button/widgets.jpg" class="ms-docbutton"/> button from the [Layer Toolbar](toc.md#toolbar-options) or from the [Attribute Table](attributes-table.md). Performing these operations the *Widget* panel appears:

<img src="../img/widgets/map-widgets-panel.jpg" class="ms-docimage" style="max-width:450px;"/>

From here the user can choose between four different types of widget:

* *Chart*

* *Text*

* *Table*

* *Counter*

### Chart

Selecting *Chart* option the following window opens:

<img src="../img/widgets/chart-types.jpg" class="ms-docimage"  style="max-width:450px;"/>

From here it is possible to choose between *Bar Chart*, *Pie Chart* or *Line Chart*, or simply go back to widget type selection through the <img src="../img/button/back.jpg" class="ms-docbutton"/> button. <br>
If a chart type is selected, it can display similar the following (in this case a *Bar Chart*):

<img src="../img/widgets/configure-chart.jpg" class="ms-docimage"  style="max-width:450px;"/>

From the toolbar of this panel <img src="../img/widgets/widget-options.jpg" class="ms-docbutton"/> the user is allowed to:

* Go back to the chart type selection with the <img src="../img/button/back.jpg" class="ms-docbutton"/> button

* Connect <img src="../img/button/connect-widget.jpg" class="ms-docbutton"/> or disconnect <img src="../img/button/disconnect-widget.jpg" class="ms-docbutton"/> the widget to the map. When a widget is connected to the map, the information displayed in the widget are automatically filtered with the map viewport. When a widget is not linked, it otherwise shows all the elements of that level regardless of the map viewport

* Configure a filter <img src="../img/button/filter-icon.jpg" class="ms-docbutton"/> for the widget data (more information on how to configure a filter can be found in [Filtering Layers](filtering-layers.md) section)

* Move forward <img src="../img/button/next.jpg" class="ms-docbutton"/> to the next step when the settings are completed

Just below the chart's preview, the following configurations are available:

* Define the **X Attribute** of the chart (or **Group by** for *Pie Charts*) choosing between layer fields

* Define the **Y Attribute** of the chart (or **Use** for *Pie Charts*) choosing between layer fields

* Define the aggregate **Operation** to perform for the selected attribute choosing between `No Operation`, `COUNT`, `SUM`, `AVG`, `STDDEV`, `MIN` and `MAX`

!!! Note
    The *No operation* option is used when the aggregation method is not needed for the chart. If *No Operation* is selected, no aggregation will be carried out for the chart and the WFS service will be used to generate the chart without using the WPS process `gs:Aggregate` in GeoServer.

* Choose the **Color** (`Blue`, `Red`, `Green`, `Brown` or `Purple`) of the chart (or the **Color Ramp** for *Pie Charts*)

* Enable the chart's legend by activating **Display Legend**

In addition, only for *Bar Charts* and *Line Charts*, [MapStore](https://mapstore.geo-solutions.it/mapstore/#/) provides advanced setting capabilities through the *Advanced Options* section.

<img src="../img/widgets/advanced_options.jpg" class="ms-docimage"/>

Through this section, the user is allowed to:

* Show/Hide the chart's grid in backgroung with the **Hide Grid** control

* Customize **Y axis** tick values by choosing the *Type* (between `Auto`, `Linear`, `Category`, `Log` or `Date`): the axis type is auto-detected by looking at data (*Auto* option is automatically managed and selected by the tool and it is usually good as default setting). The user can also choose to completely hide labels through the *Hide labels* control or customize them by adding a *Prefix* (e.g. `~`), a custom *Format* (e.g. `0%: rounded percentage, '12%'` or more) or a *Suffix* (e.g. `Km`). It is also possible to configure a *Formula* to transform tick values as needed (e.g. `value + 2` or `value / 100` or more) 

<img src="../img/widgets/yaxis_options.jpg" class="ms-docimage"/>

!!! Note
    More information about the syntax options allowed for **Format** are available [here](https://d3-wiki.readthedocs.io/zh_CN/master/Formatting/) and the allowed expression to be used as **Formula** are available [here](https://github.com/m93a/filtrex#expressions) in the online documentation. 

* Customize **X axis**  tick values by choosing the *Type* (between `Auto`, `Linear`, `Category`, `Log` or `Date`): the axis type is auto-detected by looking at data (*Auto* option is automatically managed and selected by the tool and it is usually good as default setting). As per **Y axis**, the user can completely hide labels through the *Hide labels* control or tune the rendering of tick labels with options like *Never skip labels* (it forces all ticks available in the chart to be rendered instead of simplifying the provided set based on chart size) and *Label rotation* to better adapt X axis tick labels on the charts depending on the needs. 

<img src="../img/widgets/xaxis_options.jpg" class="ms-docimage"/>

!!! Warning 
    The tick labels available for the X axis by enabling the option **Never skip label** cannot be more than 200 in order to provide a clear chart and for performance reasons.

* Set the **Legend Label** name

<img src="../img/widgets/legend_name.jpg" class="ms-docimage"/>

!!! Note
        The tooltips of the X and Y axis labels are available by hovering the mouse over the charts. This way the labels are available even if the **Hide labels** option for the X and Y axis is enabled.  <img src="../img/widgets/label_tooltips.gif" class="ms-docimage"/>

!!! Warning
    In order to move forward to the next step, only **X Attribute**, **Y Attribute** and **Operation** are considered as mandatory fields.

Once the settings are done, the next step of the chart widget creation/configuration is displayed as follows:

<img src="../img/widgets/widget-info.jpg" class="ms-docimage"  style="max-width:450px;"/>

The user can:

* Go back to the chart option with the <img src="../img/button/back.jpg" class="ms-docbutton"/> button

* Configure a filter <img src="../img/button/filter-icon.jpg" class="ms-docbutton"/> for the widget data (more information on how to configure a filter can be found in [Filtering Layers](filtering-layers.md) section)

* Add the widget to the map with the <img src="../img/button/save-icon.jpg" class="ms-docbutton"/> button

Just below the chart's preview, the user is allowed to set:

* The widget **Title**

* The widget **Description**

!!! Note
    None of these fields are mandatory, it is possible to save/add the widget to the map without filling them.

An example of chart widget could be:

<img src="../img/widgets/chart-ex.jpg" class="ms-docimage"/>

The **Chart toolbar**, displayed in the right corner of the chart allows the user to:

<img src="../img/widgets/bar_charts.jpg" class="ms-docimage"/>

* **Download** the chart as a `png` through the <img src="../img/button/download_png.jpg" class="ms-docbutton"/> button.

* **Zoom** the chart through the <img src="../img/button/zoom_chart.jpg" class="ms-docbutton"/> button.

* **Pan** the chart through the <img src="../img/button/pan_chart.jpg" class="ms-docbutton"/> button.

* **Zoom in** the chart through the <img src="../img/button/zoom_in_chart.jpg" class="ms-docbutton"/> button.

* **Zoom out** the chart through the <img src="../img/button/zoom_out_chart.jpg" class="ms-docbutton"/> button.

* **Autoscale** to autoscale the axes to fit the plotted data automatically through the <img src="../img/button/autoscale_chart.jpg" class="ms-docbutton"/> button.

* **Reset axes** to return the chart to its initial state through the <img src="../img/button/reset_axes_chart.jpg" class="ms-docbutton"/> button.

* **Toggle Spike Lines** to show dashed lines for X and Y values by hovering the mouse over the chart. This is useful to better see domain values on both axis in case of complex charts. It is possible to activate that option through the <img src="../img/button/toggle_lines_chart.jpg" class="ms-docbutton"/> button.

### Text

Creating a new text widget the following window opens:

<img src="../img/widgets/text-panel.jpg" class="ms-docimage"  style="max-width:450px;"/>

Through the toolbar it is possible to:

* Go back to the widget type selection with the <img src="../img/button/back.jpg" class="ms-docbutton"/> button

* Add the widget to the map with the <img src="../img/button/save-icon.jpg" class="ms-docbutton"/> button

Here the user can:

* Write the title of the widget

* Write the text of the widget

* Format the text through the [Text Editor Toolbar](text-editor-toolbar.md)

!!! note
    None of these options are mandatory, you can add the widget to the map without filling in these fields.

An example of text widget could be:

<img src="../img/widgets/text-ex.jpg" class="ms-docimage"/>

### Table

Adding a table widget to the map, a panel like the following opens:

<img src="../img/widgets/table-panel.jpg" class="ms-docimage"  style="max-width:450px;"/>

The toolbar on the top of this panel is similar to the one present in [Chart section](widgets.md#chart). Here the user is allowed to select the layer fields that will be displayed in the widget.

!!!warning
    At least one field must be selected in order to move to the next configuration step.

Once the desired fields are selected, a click on the <img src="../img/button/next.jpg" class="ms-docbutton"/> button opens the following panel:

<img src="../img/widgets/table-info.jpg" class="ms-docimage"  style="max-width:450px;"/>

In this last step of the widget creation, the toolbar and the information to be inserted are similar to the ones in [Chart section](widgets.md#chart). <br>
An example of table widget could be:

<img src="../img/widgets/table-ex.jpg" class="ms-docimage"/>

### Counter

Selecting the counter option, the following window opens:

<img src="../img/widgets/counter-panel.jpg" class="ms-docimage"  style="max-width:450px;"/>

Also in this case the toolbar is similar to the one present in [Chart section](widgets.md#chart). The user is allowed to:

* Select the attribute to **Use**

* Select the **Operation** to perform

* Set the **Unit of measure** that will be displayed

!!! warning
    In order to move forward to the next step, only the **Use** and the **Count** are considered as mandatory fields.

Once the <img src="../img/button/next.jpg" class="ms-docbutton"/> button is clicked, the panel of the last step appears:

<img src="../img/widgets/counter-info.jpg" class="ms-docimage"  style="max-width:450px;"/>

Also in this case the toolbar and the information to be inserted are similar to the ones in [Chart section](widgets.md#chart), with the only exception that the **Filtering** button <img src="../img/button/filter-icon.jpg" class="ms-docbutton"/> is missing. <br>
An example of counter widget could be:

<img src="../img/widgets/counter-ex.jpg" class="ms-docimage" style="max-width:600px;"/>

## Manage existing widgets

Once widgets have been created, they will be placed on the bottom right of the map viewer and the *Widgets Tray* appears:

<img src="../img/widgets/widgets-tray.jpg" class="ms-docimage" style="max-width:500px;"/>

Through the buttons available on each widget the user can  perform the following operations:

<img src="../img/widgets/widget-button.jpg" class="ms-docimage" style="max-width:500px;"/>

* Drag and drop the widget to move it within the map area of the viewer and **resize** it through the <img src="../img/button/resize-button.jpg" class="ms-docbutton"/> button (also available for widgets present in a dashboard)

<img src="../img/widgets/ded-widgets.gif" class="ms-docimage" style="max-width:500px;"/>

* **Pin** the position and the dimension of the widget through the <img src="../img/button/pin.jpg" class="ms-docbutton"/> button

* **Collapse** the widget through the <img src="../img/button/collapse-button.jpg" class="ms-docbutton"/> button and expand it again by clicking the related button in the *Widgets Tray*

<img src="../img/widgets/collapse-widgets.gif" class="ms-docimage" style="max-width:500px;"/>

!!!note
    The *Widgets Tray* allows the user to expand/collapse each single widget individually <img src="../img/button/wid-tray-single.jpg" class="ms-docbutton"/> or all of them at once by using the <img src="../img/button/wid-tray-all.jpg" class="ms-docbutton"/> button.

!!!warning
    When both **[Timeline](timeline.md)** and widgets are present in a map, the *Timeline* button appears in the *Widgets Tray* <img src="../img/button/w-tray-timeline.jpg" class="ms-docbutton"/> allowing the user to expand and collapse it (widgets and *Timeline* can't anyhow be expanded at the same time).

* Make the widget **Full screen** through the <img src="../img/button/maximize-button.jpg" class="ms-docbutton"/> button (also available for widgets present in a dashboard)

<img src="../img/widgets/maximize-widgets.gif" class="ms-docimage" style="max-width:500px;"/>

* Access to the *Title* and *Description* info through the <img src="../img/button/info.jpg" class="ms-docbutton"/> button, if this information has been provided during the widget configuration/creation

<img src="../img/widgets/wid-description.jpg" class="ms-docimage" style="max-width:500px;"/>

### Access widgets menu

Once a widget is added to the map, it is possible to access its **Menu** through the <img src="../img/button/menu.jpg" class="ms-docbutton"/> button. For *Text*, *Table* and *Counter* widgets, the following menu appears:

<img src="../img/widgets/widgets-menu.jpg" class="ms-docimage" style="max-width:200px;"/>

From here the user can:

* **Edit** the widget

* **Delete** the widget

Only for *Charts*, the menu is like the following:

<img src="../img/widgets/widgets-menu2.jpg" class="ms-docimage" style="max-width:200px;"/>

In particular, the user can also:

* **Show chart data** in tabular representation

* **Download data** in .csv format

* **Export Image** in .jpg format
