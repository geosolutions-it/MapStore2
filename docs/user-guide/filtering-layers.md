# Filtering Layers

******************

When using vector layers it might be useful to work with a subset of features. About that, [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) let the user set up a **Layer Filter** that acts directly on a layer with WFS available and filter its content upfront.
The map will immediately update when a filter is applied.

!!!warning
    The [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/)'s filtering capabilities are working on top of the WFS specifications so that service must be enabled if you want to filter a layer using the tools described in this section.

## Filter types

In [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) it is possible to apply filters on layers in three different ways:

* With the [Layer Filter](filtering-layers.md#layer-filter) tool available in [TOC](toc.md#table-of-contents)

* With the [Advanced Search](attributes-table.md#advanced-search) tool available from the [Attribute Table](attributes-table.md#attribute-table)

* With the [Quick Filter](attributes-table.md#quick-filter) available in the [Attribute Table](attributes-table.md#attribute-table)

### Layer Filters

This filter is applicable from the **Filter layer** button <img src="../img/button/filter-layer.jpg" class="ms-docbutton"/> in TOC's [Layers Toolbar](toc.md#toolbar-options) and it will persist in the following situations:

* Using other tools like the [Identify tool](navigation-toolbar.md#identify-tool):

<video class="ms-docimage" controls><source src="../img/filtering-layers/get_filtered_features_info.mp4"/></video>

* Applying another type of filter

<video class="ms-docimage" controls><source src="../img/filtering-layers/filtered_advanced_filtering.mp4"/></video>

* Opening the map next time (you need to Save the map from the [Side Toolbar](mapstore-toolbars.md#side-toolbar) after applying a filter)

Once a *Layer filter* is set, it is possible to enable/disable it simply by clicking on the button that will appear near the layer name in [TOC](toc.md#table-of-contents):

<img src="../img/filtering-layers/toogle-layer.jpg" class="ms-docimage" style="max-width:300px;"/>

This filter is applied through the [Query Panel](#query-panel). Once the settings are chosen, it is possible to **Apply** <img src="../img/button/apply_button.jpg" class="ms-docbutton"/> them. After that the user can:

* **Undo** <img src="../img/button/undo_button.jpg" class="ms-docbutton"/> the last changes

* **Reset** <img src="../img/button/reset_button.jpg" class="ms-docbutton"/> the filter to the initial situation

* **Save** <img src="../img/button/save_button.jpg" class="ms-docbutton"/> the filter in order to make it persistent

### Query Panel

This tool is used to define advanced filters in [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/). It includes three main sections:

* **Attribute Filter**

* **Area of Interest**

* **Layer Filter**

<img src="../img/filtering-layers/query-panel.jpg" class="ms-docimage" style="max-width:500px;"/>

#### Attribute Filter

This filter allows to set one or more conditions referred to the [Attribute Table](attributes-table.md#attribute-table) fields. <br>
First of all it is possible to choose if the filter will match:

* **Any** conditions

* **All** conditions

* **None** conditions

After that, the user can insert one or more conditions, that can also be grouped in one or more condition groups (use the <img src="../img/button/condition_group.jpg" class="ms-docbutton"/> button in order to create a group).<br>
A condition can be set by selecting a value for each of the three input boxes:

* The first input box allows to choose a layer field

* In the second input box it is possible to choose the operation to perform (selecting a text field can be **=**, **like**, **ilike** or **isNull**, selecting a numerical field, can be **=**, **>**, **<**, **>=**, **<=**, **<>** or **><**)

* The third input box (in case of fields of type String) provides a paginated list of available field values already present in the layer's dataset (a GeoServer WPS process is used for this). In case of numeric fields, the user can simply type a value to use for the filter or use instead the **Date Picker** tool for the *Date*, *Time* and *DateTime* attributes as described above in the [Quick Filter by attributes](attributes-table.md#quick-filter-by-attributes) section.

!!! Note
    For the *Query Panel*, the *Date Picker* tool also allows the user to perform select **Quick Date Selections** such as: `Now`, `Yesterday` for single *Date* or *DateTime* and `Tomorrow` or also quick date ranges like `Now`, `This week`, `This month`, `7 days from now`, `30 days from now` and `90 days from now` for *Date* or *DateTime* intervals depending on the operator selected. An example can be the following:
    <video class="ms-docimage" style="max-width:500px;" controls><source src="../img/filtering-layers/quick_date_ranges.mp4"/></video>

!!! Note
    the "paginated list of available field values" above is available only if the server provides the WPS process `gs:PagedUnique`

A simple *Attribute Filter* applied for a numerical field can be, for example:

<video class="ms-docimage" controls><source src="../img/filtering-layers/att_filter.mp4"/></video>

#### Area of Interest

In order to set this filter the user can:

* Select the *Filter type* by choosing between **Viewport**, **Rectangle**, **Circle**, **Polygon** (selecting Rectangle, Circle or Polygon it is necessary to draw the filter's geometry on the map)

* Select the *Geometric operation* by choosing between **Intersects**, **Is contained**, **Contains**

Applying a *Rectangle* filter with *Intersect* operation, for example, the process could be similar to the following:

<video class="ms-docimage" controls><source src="../img/filtering-layers/geom_filter.mp4"/></video>

Once this filter is set, it is always possible to edit the coordinates and the dimensions of the drawn filter's geometry by clicking on the **Details** button <img src="../img/button/edit-icon-1.jpg" class="ms-docbutton"/>. Editing a circle, for example, it is possible to change the center coordinates (*x*, *y*) and the radius dimension (*m*):

<img src="../img/filtering-layers/edit_geom.jpg" class="ms-docimage" style="max-width:500px;"/>

!!! note
     Also for [Dashboard](exploring-dashboards.md) [widgets](widgets.md) (charts, table and counter) it is possible to define a spatial filter without necessarily connect the widget to the map widget by using the usual **Area of interest** filtering section. The example below sows how:
     <video class="ms-docimage" style="max-width:600px;" controls><source src="../img/filtering-layers/area-filter-dash.mp4"/></video>

#### Layer Filter

This tool allows to set [cross-layer filters](https://docs.geoserver.org/stable/en/user/extensions/querylayer/index.html) for a layer by using another layer or even the same one.

!!!warning
    This filter tool requires the [Query Layer plugin](https://docs.geoserver.org/stable/en/user/extensions/querylayer/index.html#installing-the-querylayer-module) installed in GeoServer

In order to set up a cross-layer filter the options below are required:

* *Target layer* (between those present in the [TOC](toc.md#table-of-contents))

* *Operation* to be chosen between **Intersects**, **Is contained** or **Contains**

* Optionally some *Conditions* (see [Attribute filter](#attribute-filter))

In order to better understand this type of filter, let's make an example. We suppose that the user want to filter the Italian Regions with the Unesco Item's one:

<img src="../img/filtering-layers/layer-filter-1.jpg" class="ms-docimage"/>

In particular, if our goal is to take a look at the Italian Regions that contain the Unesco sites with *serial code=1*, the operations to perform can be the following:

<video class="ms-docimage" controls><source src="../img/filtering-layers/layer_filter.mp4"/></video>

!!! note
    The **Layer Filter** option is only available for [widgets](widgets.md) defined in [Map viewer](exploring-maps.md) and not for [Dashboards](exploring-dashboards.md) widgets.

#### Combining Multiple Filtering

To filter a layer, the user can also combine the two methods described above. This way, the user can first apply an [Area of Interest Filter](filtering-layers.md#area-of-interest) to a layer and then use a second layer to define the cross-layer filter using the [Layer Filter](filtering-layers.md#layer-filter) method.

The following example shows this workflow: the meteorites layer is filtered using a square area of interest, and then a second filter excludes features located in the state of California by using the USA States layer. It is also worth clarifying that the AOI thus defined is used in this case to also restrict the [Layer Filter's](filtering-layers.md#layer-filter) action to that area only.

<img src="../img/filtering-layers/cascading-search-filter.jpg" class="ms-docimage"/>
