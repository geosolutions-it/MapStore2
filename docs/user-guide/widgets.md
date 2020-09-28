# Widgets
*********

In [MapStore](https://mapstore.geo-solutions.it/mapstore/#/) it is possible to create widgets from the layers added to the map. Widgets are components such as charts, texts, tables and counters, useful to describe and visualize qualitatively and quantitatively layers data and provide the user the opportunity to analyze information more effectively.

!!! Note
    Some widgets (in maps or in dashboards) need some WPS back-end support to work:

    - `chart` and `counter` widgets need the WPS Process `gs:Aggregate` to work.
    - The map widgets (dashboards) needs the process `gs:Bounds` to  zoom to
    filtered data, if connected to a table.

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

Just below the chart's preview, the following operations can be performed:

* Define the **X Attribute** of the chart (or **Group by** for *Pie Charts*) choosing between layer fields

* Define the **Y Attribute** of the chart (or **Use** for *Pie Charts*) choosing between layer fields

* Define the **Operation** with which the attributes will be related

* Choose the **Color** of the chart (or the **Color Ramp** for *Pie Charts*)

* Choose to keep the legend hidden, or to **Display Legend**

In addition, only for *Bar Charts* and *Line Charts*, it is possible to access the *Advanced Options* section, where the user can:

* Keep the grid visible or **Hide Grid**

* Keep Y axis visible or **Hide Y axis**

* Define the **X Axis Labels rotation angle**

* Set the **Legend Label** name

!!! warning
    In order to move forward to the next step, only **X Attribute**, **Y Attribute** and **Operation** are considered as mandatory fields.

Once the settings are done, the next step displays, for example, similar to the following:

<img src="../img/widgets/widget-info.jpg" class="ms-docimage"  style="max-width:450px;"/>

In this panel, through the toolbar, it is possible to:

* Go back to the chart option with the <img src="../img/button/back.jpg" class="ms-docbutton"/> button

* Configure a filter <img src="../img/button/filter-icon.jpg" class="ms-docbutton"/> for the widget data (more information on how to configure a filter can be found in [Filtering Layers](filtering-layers.md) section)

* Add the widget to the map with the <img src="../img/button/save-icon.jpg" class="ms-docbutton"/> button

Just below the chart's preview, the user is allowed to set:

* The widget **Title**

* The widget **Description**

!!! note
    None of these options are mandatory, you can add the widget to the map without filling in these fields.

An example of chart widget could be:

<img src="../img/widgets/chart-ex.jpg" class="ms-docimage"/>

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

Once widgets have been created, they will be placed on the bottom right of the map with three buttons available on their top (**Pin**, **Collapse** and **Menu**) and the *Widgets Tray* appears:

<img src="../img/widgets/widgets-tray.jpg" class="ms-docimage"/>

The user is now allowed to menage widgets performing the following operations:

* Move and resize them

* Fix and expand/collapse them

* Access their menu

### Move and resize a widget

In order to move a widget you can simply drag and drop it inside the viewport, and in order to resize it you can click in the lower right corner and drag it to the desired size:

<img src="../img/widgets/ded-widgets.gif" class="ms-docimage" style="max-width:500px;"/>

### Fix and expand/collapse a widget

The position and the dimension of a widget can be fixed with a click on the **Pin** button <img src="../img/button/pin.jpg" class="ms-docbutton"/>. <br>
The *Widgets Tray*, otherwise, allows the user to expand/collapse each single widget individually <img src="../img/button/wid-tray-single.jpg" class="ms-docbutton"/> or all of them at the same time <img src="../img/button/wid-tray-all.jpg" class="ms-docbutton"/>. A single widget can be also collapsed through the **Collapse** button <img src="../img/button/collapse2.jpg" class="ms-docbutton"/>.

!!!note
    When both **[Timeline](timeline.md)** and widgets are present in a map, the *Timeline* button appears in the *Widgets Tray* <img src="../img/button/w-tray-timeline.jpg" class="ms-docbutton"/> allowing the user to expand and collapse it (widgets and *Timeline* can't anyhow be expanded at the same time).

### Access widgets info

As soon as a description is provided for a widget the info button <img src="../img/button/info.jpg" class="ms-docbutton"/> appears, allowing the user to take a look at the widget's *Title* and *Description*:

<img src="../img/widgets/wid-description.jpg" class="ms-docimage"/>

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
