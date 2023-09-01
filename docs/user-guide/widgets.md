# Widgets

*********

In [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) it is possible to create widgets from the layers added to the map. Widgets are components such as charts, texts, tables and counters, useful to describe and visualize qualitatively and quantitatively layers data and provide the user the opportunity to analyze information more effectively.

!!! Note
    Some widgets (in maps or in dashboards) need some WPS back-end support to work:

    * The `map widgets` (dashboards) needs the WPS process `gs:Bounds` to zoom to filtered data, if connected to a table.

    * For aggregate operations, `chart` and `counter` widgets need the WPS process `gs:Aggregate` available in GeoServer to work.

## Add a Widget

Once at least one layer is present in the map (see [Catalog](catalog.md#catalog-services) section for more information about adding layers), it is possible to create a widget by selecting that layer in the [TOC](toc.md#table-of-contents) and by clicking on the <img src="../img/button/widgets.jpg" class="ms-docbutton"/> button from the [Layer Toolbar](toc.md#toolbar-options) or from the [Attribute Table](attributes-table.md#attribute-table). Performing these operations the *Widget* panel appears:

<img src="../img/widgets/map-widgets-panel.jpg" class="ms-docimage" style="max-width:450px;"/>

From here the user can choose between four different types of widget:

* *Chart*

* *Text*

* *Table*

* *Counter*

### Chart

Charts widget allow multi-selection of layer to create a widget that allows user to configure chart options for each layer. And switch between multiple charts in a widget.

<img src="../img/widgets/chart-layer-selection.jpg" class="ms-docimage"  style="max-width:450px;"/>

Selecting a *Layer* or *Layers*, the following *Chart* options is presented to user:

<img src="../img/widgets/chart-options.jpg" class="ms-docimage"  style="max-width:450px;"/>

From the chart configuration page, the user can perform the following operation

* Edit chart name <img src="../img/button/edit_button.jpg" class="ms-docbutton"/>
* Choose between *Bar Chart*, *Pie Chart* or *Line Chart*. By default, the bar chart is selected.

From the toolbar of this panel <img src="../img/widgets/widget-options.jpg" class="ms-docbutton"/> the user is allowed to:

* Go back to the chart type selection with the <img src="../img/button/back.jpg" class="ms-docbutton"/> button

* Connect <img src="../img/button/connect-widget.jpg" class="ms-docbutton"/> or disconnect <img src="../img/button/disconnect-widget.jpg" class="ms-docbutton"/> the widget to the map. When a widget is connected to the map, the information displayed in the widget are automatically filtered with the map viewport. When a widget is not linked, it otherwise shows all the elements of that level regardless of the map viewport

* Configure a filter <img src="../img/button/filter-icon.jpg" class="ms-docbutton"/> for the widget data (more information on how to configure a filter can be found in [Filtering Layers](filtering-layers.md#filtering-layers) section).

* Add new layers <img src="../img/button/+++.jpg" class="ms-docbutton"/> to existing chart configuration

* Delete the current layer <img src="../img/button/delete_button.jpg" class="ms-docbutton"/> and it's related chart configuration from the wizard

* Move forward <img src="../img/button/next.jpg" class="ms-docbutton"/> to the next step when the settings are completed. The button prohibits the user from proceeding further when some chart is invalid

Just below the chart's preview, the following configurations are available:

* Define the **X Attribute** of the chart (or **Group by** for *Pie Charts*) choosing between layer fields

* Define the **Y Attribute** of the chart (or **Use** for *Pie Charts*) choosing between layer fields

* Define the aggregate **Operation** to perform for the selected attribute choosing between `No Operation`, `COUNT`, `SUM`, `AVG`, `STDDEV`, `MIN` and `MAX`

!!! Note
    The *No operation* option is used when the aggregation method is not needed for the chart. If *No Operation* is selected, no aggregation will be carried out for the chart and the WFS service will be used to generate the chart without using the WPS process `gs:Aggregate` in GeoServer.

* Enable the chart's legend by activating **Display Legend**

* Choose the **Color** (`Blue`, `Red`, `Green`, `Brown` or `Purple`) of the chart (or the **Color Ramp** for *Pie Charts*) or choose to **Customize the color**.

#### Color customization

For *Bar Charts* and *Pie Charts*, [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) provides the possibility to customize the colors of the charts bars and slices. From the **Color** option dropdown menu, the user can select the *Custom* option and open the **Custom Colors Settings** modal through the <img src="../img/button/change-media2.jpg" class="ms-docbutton"/> button.

<img src="../img/widgets/custom_colors_settings.jpg" class="ms-docimage"/>

Inside this modal, the user is allowed to:

* Change the default **Color** of bars or slices (depending on the chart type) through the *Color Picker*. This color will be applied for all values for which a *Class Color* has not been configured.

<video class="ms-docimage" controls><source src="../img/widgets/custom_colors.mp4"/></video>

* Select an *Attribute* in the dropdown list as a **Classification attribute**.

<video class="ms-docimage" controls><source src="../img/widgets/classification-attribute.mp4"/></video>

Once the attribute is chosen, new options appear in the *Custom Color Settings* panel that allow the user to:

* Enter a **Default Class Label** to be used in the legend for all values that will not be specifically classified in the following list.

<img src="../img/widgets/default_class_label.jpg" class="ms-docimage"/>

!!! Note
    For both *Default Class Label* and  *Class Label* '${legendValue}' can be used as a placeholder for the Y Attribute (that can be further customized through the usual *Advanced Option*).

* Classify *Classification Attribute* values to assign a specific color in the chart along with its *Class Label* to use for the chart legend. Only values of type **String** or **Number** are currently supported.

#### Classification Attribute of type String

When the values of a classification attribute are of type String, the user can:

<img src="../img/widgets/alphanumeric.jpg" class="ms-docimage"/>

* Choose the **Class Color** through the *Color Picker*.

* Choose the value of the *Classification attribute* through the dropdown menu **Class Value**

* Enter a **Class Label** to be used in the legend for the value entered in the *Class Value*

!!! Note
    For *Class Label*,  '${legendValue}' can be used as a placeholder for the Y Attribute (that can be further customized through the usual *Advanced Option*).

An example of *Bar charts* corresponding to this type of classification can be the following:

<video class="ms-docimage" controls><source src="../img/widgets/color-customization-alhanumeric-attribute.mp4"/></video>

Through the <img src="../img/button/menu.jpg" class="ms-docbutton"/> button the user can add new values before through the <img src="../img/widgets/add-new-entry-before.jpg" class="ms-docimage"/> button or after through <img src="../img/widgets/add-new-entry-after.jpg" class="ms-docimage"/> button.

#### Classification Attribute of type Number

When the values of a classification attribute are numbers, the user can configure a color ramp and so:

<img src="../img/widgets/numeric.jpg" class="ms-docimage" style="max-width:450px;"/>

* Choose the **Class Color** through the *Color Picker*

* Choose the **Min value** of the *Classification attribute*

* Choose the **Max value** of the *Classification attribute*

* Enter a **Class Label** to be used in the legend for the value entered in the *Class Value*

!!! Note
    For *Class Label* two placeholders can be used in this case: ${minValue}, can be used as a placeholder for **Min Value** and  ${maxValue}, can be used as a placeholder for Max Value; the ${legendValue} can be used in the same way as specified above.

An example of Bar chart corresponding to this type of classification can be the following:

<video class="ms-docimage" controls><source src="../img/widgets/color-customization-numeric-attribute.mp4"/></video>

#### Bar Chart Type

If the *Classification attribute* is added to the *Bar Chart*, in the [Advanced Options](#advanced-options),  the **Bar Chart Type** option is displayed.

<img src="../img/widgets/bar_type.jpg" class="ms-docimage"/>

The user can customize the bars by choosing between:

* **Grouped**. An example can be the following:

<img src="../img/widgets/grouped_chart.jpg" class="ms-docimage" style="max-width:450px;"/>

* **Stacked**. An example can be the following:

<img src="../img/widgets/stacked-chart.jpg" class="ms-docimage" style="max-width:450px;"/>

!!! Note
    By default, the bar chart type is **Stacked**

#### Advanced Options

In addition, only for *Bar Charts* and *Line Charts*, [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) provides advanced setting capabilities through the *Advanced Options* section.

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
        The tooltips of the X and Y axis labels are available by hovering the mouse over the charts. This way the labels are available even if the **Hide labels** option for the X and Y axis is enabled.
        <video class="ms-docimage" controls><source src="../img/widgets/label_tooltips.mp4" /></video>

!!! Warning
    In order to move forward to the next step, only **X Attribute**, **Y Attribute** and **Operation** are considered as mandatory fields.

Once the settings are done, the next step of the chart widget creation/configuration is displayed as follows:

<img src="../img/widgets/widget-info.jpg" class="ms-docimage"  style="max-width:450px;"/>

The user can:

* Go back to the chart option with the <img src="../img/button/back.jpg" class="ms-docbutton"/> button

* Configure a filter <img src="../img/button/filter-icon.jpg" class="ms-docbutton"/> for the widget data (more information on how to configure a filter can be found in [Filtering Layers](filtering-layers.md#filtering-layers) section)

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

* Format the text through the [Text Editor Toolbar](text-editor-toolbar.md#text-editor-toolbar)

!!! note
    None of these options are mandatory, you can add the widget to the map without filling in these fields.

An example of text widget could be:

<img src="../img/widgets/text-ex.jpg" class="ms-docimage"/>

### Table

Adding a table widget to the map, a panel like the following opens:

<img src="../img/widgets/table-panel.jpg" class="ms-docimage"  style="max-width:450px;"/>

The toolbar on the top of this panel is similar to the one present in [Chart section](#chart). Here the user is allowed to:

* **Enable/Disable** the layer fields that will be displayed in the widget as columns.

<video class="ms-docimage" controls><source src="../img/widgets/table-attribute.mp4"/></video>

!!!warning
    At least one field must be selected in order to move to the next configuration step.

* Enter a **Title** for each column to be displayed as the table header in place of the *Name* of the layer field

<video class="ms-docimage" controls><source src="../img/widgets/table-title.mp4"/></video>

* Enter a **Description** for each field to be displayed as a tooltip, visible moving the mouse on the column header.

<video class="ms-docimage" controls><source src="../img/widgets/table-description.mp4"/></video>

Once the desired fields are selected, a click on the <img src="../img/button/next.jpg" class="ms-docbutton"/> button opens the following panel:

<img src="../img/widgets/table-info.jpg" class="ms-docimage"  style="max-width:450px;"/>

In this last step of the widget creation, the toolbar and the information to be inserted are similar to the ones in [Chart section](#chart). <br>
An example of table widget could be:

<img src="../img/widgets/table-ex.jpg" class="ms-docimage"/>

### Counter

Selecting the counter option, the following window opens:

<img src="../img/widgets/counter-panel.jpg" class="ms-docimage"  style="max-width:450px;"/>

Also in this case the toolbar is similar to the one present in [Chart section](#chart). The user is allowed to:

* Select the attribute to **Use**

* Select the **Operation** to perform

* Set the **Unit of measure** that will be displayed

!!! warning
    In order to move forward to the next step, only the **Use** and the **Count** are considered as mandatory fields.

Once the <img src="../img/button/next.jpg" class="ms-docbutton"/> button is clicked, the panel of the last step appears:

<img src="../img/widgets/counter-info.jpg" class="ms-docimage"  style="max-width:450px;"/>

Also in this case the toolbar and the information to be inserted are similar to the ones in [Chart section](#chart), with the only exception that the **Filtering** button <img src="../img/button/filter-icon.jpg" class="ms-docbutton"/> is missing. <br>
An example of counter widget could be:

<img src="../img/widgets/counter-ex.jpg" class="ms-docimage" style="max-width:600px;"/>

## Manage existing widgets

Once widgets have been created, they will be placed on the bottom right of the map viewer and the *Widgets Tray* appears:

<img src="../img/widgets/widgets-tray.jpg" class="ms-docimage" style="max-width:500px;"/>

Through the buttons available on each widget the user can  perform the following operations:

<img src="../img/widgets/widget-button.jpg" class="ms-docimage" style="max-width:500px;"/>

* Drag and drop the widget to move it within the map area of the viewer and **resize** it through the <img src="../img/button/resize-button.jpg" class="ms-docbutton"/> button (also available for widgets present in a dashboard)

<video class="ms-docimage" style="max-width:500px;" controls><source src="../img/widgets/ded-widgets.mp4"/></video>

* **Pin** the position and the dimension of the widget through the <img src="../img/button/pin.jpg" class="ms-docbutton"/> button

* **Collapse** the widget through the <img src="../img/button/collapse-button.jpg" class="ms-docbutton"/> button and expand it again by clicking the related button in the *Widgets Tray*

<video class="ms-docimage" style="max-width:500px;" controls><source src="../img/widgets/collapse-widgets.mp4"/></video>

!!!note
    The *Widgets Tray* allows the user to expand/collapse each single widget individually <img src="../img/button/wid-tray-single.jpg" class="ms-docbutton"/> or all of them at once by using the <img src="../img/button/wid-tray-all.jpg" class="ms-docbutton"/> button.

!!!warning
    When both **[Timeline](timeline.md#timeline)** and widgets are present in a map, the *Timeline* button appears in the *Widgets Tray* <img src="../img/button/w-tray-timeline.jpg" class="ms-docbutton"/> allowing the user to expand and collapse it (widgets and *Timeline* can't anyhow be expanded at the same time).

* Make the widget **Full screen** through the <img src="../img/button/maximize-button.jpg" class="ms-docbutton"/> button (also available for widgets present in a dashboard)

<video class="ms-docimage" style="max-width:500px;" controls><source src="../img/widgets/maximize-widgets.mp4"/></video>

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
