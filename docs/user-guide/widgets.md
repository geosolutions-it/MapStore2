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

From the top toolbar of this panel the user is allowed to:

* Going back <img src="../img/button/back.jpg" class="ms-docbutton"/> to the widget type section.

* Connect <img src="../img/button/connect-widget.jpg" class="ms-docbutton"/> or disconnect <img src="../img/button/disconnect-widget.jpg" class="ms-docbutton"/> the widget to the map. When a widget is connected to the map, the widget is automatically spatially filtered with the map viewport. When a widget is not linked, it displays the entire dataset of that layer regardless of the map viewport.

* Move forward <img src="../img/button/next.jpg" class="ms-docbutton"/> to the next step when the settings are complete. The button prevents the user from proceeding to the next step of the wizard if the setting of some fields in the chart form is invalid

From the chart configuration page, the user can first perform the following operation:

* *Edit* the *Chart Title* through the <img src="../img/button/edit_button.jpg" class="ms-docbutton"/> button

* *Add new chart* to the current widget through the <img src="../img/button/+++.jpg" class="ms-docbutton"/> button

* *Delete* the selected chart and its configuration from the widget through the <img src="../img/button/delete_button.jpg" class="ms-docbutton"/> button

#### Traces

For each chart [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) allows to define multiple Traces. With a Trace it is possible to define an additional chart representation (for the same layer by default) to be displayed in the same chart view: all traces are displayed together in the same chart. Just below the chart's preview, there is the *Traces* tab, where the user can:

<img src="../img/widgets/traces_tab.jpg" class="ms-docimage"  style="max-width:450px;"/>

* Choose between **Bar Chart**, **Pie Chart** or **Line Chart**. By default, the *Bar Chart* is selected.

* *Edit* the current *Trace Title* through the <img src="../img/button/edit_button.jpg" class="ms-docbutton"/> button

* *Add new trace* through the <img src="../img/button/+++.jpg" class="ms-docbutton"/> button

* *Delete* the current trace through the <img src="../img/button/delete_button.jpg" class="ms-docbutton"/> button

Once the chart type is chosen, it is possible to set up the trace with the following options:

* **Trace data**
* **Trace style**
* **Trace axes**
* **Trace value formatting**
* **Null Value Handling**

##### Trace Data

The *Trace data* is displayed as follows:

<img src="../img/widgets/trace_data.jpg" class="ms-docimage"  style="max-width:450px;"/>

In this section the user can:

* Change the trace layer through the <img src="../img/button/timeline-playback-settings-button.jpg" class="ms-docbutton"/> button (by default the layer is automatically the same of the first trace defined)

* Open the [*Query Panel*](filtering-layers.md#query-panel) to configure a **Layer Filter** for the selected layer through the <img src="../img/button/advanced-search.jpg" class="ms-docbutton"/> button.

* Define the **X Attribute** of the chart (or **Group by** for *Pie Charts*) choosing between layer fields

* Define the **Y Attribute** of the chart (or **Use** for *Pie Charts*) choosing between layer fields

* Define the aggregate **Operation** to perform for the selected attribute choosing between `No Operation`, `COUNT`, `SUM`, `AVG`, `STDDEV`, `MIN` and `MAX`

!!! Note
    The *No operation* option is used when the aggregation method is not needed for the chart. If *No Operation* is selected, no aggregation will be carried out for the chart and the WFS service will be used to generate the chart without using the WPS process `gs:Aggregate` in GeoServer.

##### Trace Style

The *Trace style* is displayed as follows:

<img src="../img/widgets/trace_style.jpg" class="ms-docimage"  style="max-width:450px;"/>

The user can customize the style with the following options choosing between `Simple style` or `Classification style`

With the **Simple style**, the editor is allowed to customize the `Fill color`, the `Outline color` and the `Outline width`

<img src="../img/widgets/trace_simple_style.jpg" class="ms-docimage"  style="max-width:450px;"/>

###### Classification style

For *Bar Charts* and *Pie Charts*, [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) provides the possibility to customize the colors of the charts bars and slices. It is possible to classify the style based on the attributes of the layer. In this case it is possible to select the `Attribute` to use for the classification along with the classification `Method` (*Quantile*, *Equal interval*, *Natural breaks* and *Unique interval*) and select whether to `Sort` the classification by *Attribute X* or *Attribute Y*. Choose a `Color ramp`, the number of classification `Intervals` and the order (with `Reverse order`) of the classification intervals colors. Finally customize the `Outline color` and the `Outline width`.

<img src="../img/widgets/trace_classification_style.jpg" class="ms-docimage"  style="max-width:450px;"/>

From the **Color Ramp** option, the user can select the *Custom colors* option and open the **Custom Colors Settings** modal through the <img src="../img/button/edit_button.jpg" class="ms-docbutton"/> button.
Inside this modal, the user is allowed to:

* Change the default **Color** of bars or slices (depending on the chart type) through the *Color Picker*. This color will be applied for all values for which a *Class Color* has not been configured.

<video class="ms-docimage" controls><source src="../img/widgets/custom_colors.mp4"/></video>

* Enter a **Default Class Label** to be used in the legend for all values that will not be specifically classified in the following list.

<img src="../img/widgets/default_class_label.jpg" class="ms-docimage"/>

!!! Note
    For both *Default Class Label* and  *Class Label* '${legendValue}' can be used as a placeholder for the Y Attribute (that can be further customized through the usual *Advanced Option*).

* Classify *Classification Attribute* values to assign a specific color in the chart along with its *Class Label* to use for the chart legend. Only values of type **String** or **Number** are currently supported.

###### Classification Attribute of type String

When the values of a classification attribute are of type String, the user can:

<img src="../img/widgets/alphanumeric.jpg" class="ms-docimage"/>

* Change the **Class Color** through the *Color Picker*.

* Change the value of the *Classification attribute* through the dropdown menu **Class Value**

* Enter a **Class Label** to be used in the legend for the value entered in the *Class Value*

!!! Note
    For *Class Label*,  '${legendValue}' can be used as a placeholder for the Y Attribute (that can be further customized through the usual *Advanced Option*).

Through the <img src="../img/button/menu.jpg" class="ms-docbutton"/> button the user can add new values before through the <img src="../img/widgets/add-new-entry-before.jpg" class="ms-docimage"/> button or after through <img src="../img/widgets/add-new-entry-after.jpg" class="ms-docimage"/> button.

###### Classification Attribute of type Number

When the values of a classification attribute are numbers, the user can configure a color ramp and so:

<img src="../img/widgets/numeric.jpg" class="ms-docimage"/>

* Change the **Class Color** through the *Color Picker*

* Change the **Min value** of the *Classification attribute*

* Change the **Max value** of the *Classification attribute*

* Enter a **Class Label** to be used in the legend for the value entered in the *Class Value*

!!! Note
    For *Class Label* two placeholders can be used in this case: ${minValue}, can be used as a placeholder for **Min Value** and  ${maxValue}, can be used as a placeholder for Max Value; the ${legendValue} can be used in the same way as specified above.

##### Trace axes

If *Axes* have been customized in the [Axes](#axes) tab, the user can choose which custom axes to use for the current trace.

<img src="../img/widgets/trace_axes.jpg" class="ms-docimage"  style="max-width:450px;"/>

##### Trace Value Formatting

The user can customize trace value tooltips by adding a *Prefix* (e.g. `~`), a custom *Format* (e.g. `0%: rounded percentage, '12%'` or more) or a *Suffix* (e.g. `Km`). It is also possible to configure a *Formula* to transform tick values as needed (e.g. `value + 2` or `value / 100` or more)

<img src="../img/widgets/trace_value_formatting.jpg" class="ms-docimage"  style="max-width:450px;"/>

!!! Note
    More information about the syntax options allowed for **Format** are available [here](https://d3-wiki.readthedocs.io/zh_CN/master/Formatting/) and the allowed expression to be used as **Formula** are available [here](https://github.com/m93a/filtrex#expressions) in the online documentation.

An example of a custom trace value tooltip can be the following:

<img src="../img/widgets/custom_trace_value_tooltip.jpg" class="ms-docimage"  style="max-width:450px;"/>

##### Null Value Handling

The user can customize how **Null Value** are handled for the `X Attribute` field by selecting a *Strategy* from the following options:

<img src="../img/widgets/trace_null_value.jpg" class="ms-docimage"  style="max-width:450px;"/>

* **Ignore** to keep the *Null* values unchanged in the data.

* **Exclude** to remove all records where the value is *Null*

* **Use Placeholder** to replace *Null* values with a custom value provided by the user

##### Trace legend options

For the *Pie Charts*, the *Trace legend options* is available and it is displayed as follows:

<img src="../img/widgets/trace_legend_options.jpg" class="ms-docimage"  style="max-width:450px;"/>

The user can:

* Show/Hide the percentages in legend with the **Include percentages in legend** control. An example with the percentages in legend can be the following:

<img src="../img/widgets/percentages_in_legend.jpg" class="ms-docimage"  style="max-width:450px;"/>

#### Axes

[MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) allows to customize the **Y axis** and the **X axis** for the *Bar Charts* and the *Line Charts* through the *Axes* tab.

<img src="../img/widgets/axes_tab.jpg" class="ms-docimage"/>

Through this section, for each axis, the user is allowed to:

* *Edit* the current **Axis Title** through the <img src="../img/button/edit_button.jpg" class="ms-docbutton"/> button

* If there is more than one [Trace](#traces), *Add new axis* through the <img src="../img/button/+++.jpg" class="ms-docbutton"/> button

* If there is more than one [Trace](#traces), *Delete* the current axis through the <img src="../img/button/delete_button.jpg" class="ms-docbutton"/> button

* Choose the **Type** (between `Auto`, `Linear`, `Category`, `Log` or `Date`): the axis type is auto-detected by looking at the data (*Auto* option is automatically managed and selected by the tool and it is usually good as default setting).

!!! Note
    If **`Date`** is selected in the *Type* option, the **Show the Current Time** setting becomes available in the *Axes* panel, allowing you to highlight the current date in the chart.
    <img src="../img/widgets/show-current-time.jpg" class="ms-docimage" style="max-width:300px;"/>
    Once enabled, you can customize the appearance of the current time line using the following options:
    <img src="../img/widgets/customize-current-time.jpg" class="ms-docimage" style="max-width:300px;"/>

    * **Color**: choose the line color using the *Color Picker*.
    * **Size**: set the line thickness in `px`.
    * **Style**: select the line style from `Solid`, `Dot`, `Dash`, `LongDash` or `DashDot`

* Change the **Color** through the color picker

* Change the **Font size**

* Select the **Font family** (`Inherit`, `Arial`, `Georgia`, `Impact`, `Tahoma`, `Times New Roman` or `Verdana`)

* Customize *Y axis* label by adding a **Prefix** (e.g. `~`), a custom **Format** (e.g. `0%: rounded percentage, '12%'` or more) or a **Suffix** (e.g. `Km`).

!!! Note
    More information about the syntax options allowed for **Format** are available [here](https://d3-wiki.readthedocs.io/zh_CN/master/Formatting/) in the online documentation.

* Choose the **Side** of the chart on which to display the axis labels (between `Left` or `Right`)

* Choose how to **Anchor** the axis labels (between `Axis` or `Free`)

* Tune the rendering of tick labels by enabling the **Never skip labels** (it forces all ticks available in the chart to be rendered instead of simplifying the provided set based on chart size)

!!! Warning
    The *Never skip label* option is available only for the *X axis* and the tick labels available by enabling the option cannot be more than 200 in order to provide a clear chart and for performance reasons.

* Enable **Label rotation** to better adapt axis tick labels on the charts depending on the needs.

* Choose to completely hide labels through the **Hide labels** control.

#### Layout

Through the *Layout* tab, the user can also customize the **Layout** of the chart and the default **Font** for all the labels present in the chart.

<img src="../img/widgets/layout.jpg" class="ms-docimage"  style="max-width:450px;"/>

Here the user can:

* Show/Hide the chart's grid in background with the **Hide Grid** control (only for the *Bar Charts* and the *Line Charts*)

* Enable the chart's legend by activating **Display Legend**

* Choose the **Color** for all chart texts through the color picker (only for the *Bar Charts* and the *Line Charts*)

* Change the **Font size** for all chart texts

* Select the **Font family** (`Inherit`, `Arial`, `Georgia`, `Impact`, `Tahoma`, `Times New Roman` or `Verdana`) for all chart texts

If the *Classification attribute* is added to the *Bar Chart*, in the [Trace Style](#trace-style),  the **Bar Chart Type** option is displayed.

<img src="../img/widgets/bar_type.jpg" class="ms-docimage"/>

The user can customize the bars by choosing between:

* **Grouped**. An example can be the following:

<img src="../img/widgets/grouped_chart.jpg" class="ms-docimage" style="max-width:450px;"/>

* **Stacked**. An example can be the following:

<img src="../img/widgets/stacked-chart.jpg" class="ms-docimage" style="max-width:450px;"/>

!!! Note
    By default, the bar chart type is **Stacked**

#### Configure Chart Info

Once the settings are done, the next step of the chart widget creation/configuration is displayed as follows:

<img src="../img/widgets/widget-info.jpg" class="ms-docimage"  style="max-width:450px;"/>

The user can:

* Go back to the chart option with the <img src="../img/button/back.jpg" class="ms-docbutton"/> button

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
    From the *Text Editor Toolbar* the user can also add the following:

    * An **URL Image** or **Upload an Image** through the <img src="../img/button/image_button.jpg" class="ms-docbutton"/> button

    <img src="../img/widgets/add_image.jpg" class="ms-docimage"/>

    * Add an **Embedded Link** through the <img src="../img/button/embedded_link_buttton.jpg" class="ms-docbutton"/> button.

!!! note
    None of these options are mandatory, you can add the widget to the map without filling in these fields.

An example of text widget could be:

<img src="../img/widgets/text-ex.jpg" class="ms-docimage"/>

### Table

Adding a table widget to the map, a panel like the following opens:

<img src="../img/widgets/table-panel.jpg" class="ms-docimage"  style="max-width:450px;"/>

From the top toolbar of this panel the user is allowed to:

* Going back <img src="../img/button/back.jpg" class="ms-docbutton"/> to the widget type section.

* Connect <img src="../img/button/connect-widget.jpg" class="ms-docbutton"/> or disconnect <img src="../img/button/disconnect-widget.jpg" class="ms-docbutton"/> the widget to the map. When a widget is connected to the map, the widget is automatically spatially filtered with the map viewport. When a widget is not linked, it displays the entire dataset of that layer regardless of the map viewport.

* Open the [*Query Panel*](filtering-layers.md#query-panel) to configure a **Layer Filter** for the selected layer through the <img src="../img/button/advanced-search.jpg" class="ms-docbutton"/> button.

* Move forward <img src="../img/button/next.jpg" class="ms-docbutton"/> to the next step when the settings are complete. The button prevents the user from proceeding to the next step of the wizard if the setting of some fields in the chart form is invalid

In the *Table Widget* the user can:

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

!!! Note
    If the *Table* is connected to a map or if maps are connected to a *Table*, the user can **Zoom to feature** through the <img src="../img/button/zoom-feature.jpg" class="ms-docbutton"/> button available on each record.

### Counter

Selecting the counter option, the following window opens:

<img src="../img/widgets/counter-panel.jpg" class="ms-docimage"  style="max-width:450px;"/>

The top toolbar of this panel is similar to the one present in [Table section](#table). <br>
Here the user is allowed to:

* Select the attribute to **Use**

* Select the **Operation** to perform

From the **Trace value formatting** section, the user is allowed to:

* Customize the labels by adding a *Prefix* (e.g. `~`), a custom *Format* (e.g. `0%: rounded percentage, '12%'` or more) or a *Suffix* (e.g. `Km`).

* Configure a *Formula* to transform tick values as needed (e.g. `value + 2` or `value / 100` or more).

!!! Note
    More information about the syntax options allowed for **Format** are available [here](https://d3-wiki.readthedocs.io/zh_CN/master/Formatting/) and the allowed expression to be used as **Formula** are available [here](https://github.com/m93a/filtrex#expressions) in the online documentation.

* Choose the *Color* of the Counter text using the color picker

* Select the *Font family* (`Inherit`, `Arial`, `Georgia`, `Impact`, `Tahoma`, `Times New Roman` or `Verdana`) of the Counter text

!!! warning
    In order to move forward to the next step, only the **Use** and the **Operation** are considered as mandatory fields.

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
