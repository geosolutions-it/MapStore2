# Filtering Layers
******************

When using vector layers it might be useful to work with a subset of features. About that, [MapStore](https://mapstore.geo-solutions.it/mapstore/#/) let the user set up a **Layer Filter** that acts directly on a layer with WFS available and filter its content upfront.
The map will immediately update when a filter is applied.

!!!warning
    The [MapStore](https://mapstore.geo-solutions.it/mapstore/#/)'s filtering capabilities are working on top of the WFS specifications so that service must be enabled if you want to filter a layer using the tools described in this section.

## Filter types

In [MapStore](https://mapstore.geo-solutions.it/mapstore/#/) it is possible to apply filters on layers in three different ways:

* With the *Layer Filter* tool available in [TOC](toc.md)

* With the *Advanced Search* tool available from the [Attribute Table](attributes-table.md)

* With the *Quick Filter* available in the [Attribute Table](attributes-table.md)

### Layer Filter

This filter is applicable from the **Filter layer** button <img src="../img/button/filter-layer.jpg" class="ms-docbutton"/> in TOC's [Layers Toolbar](toc.md#toolbar-options) and it will persist in the following situations:

* Using other tools like the [Identify tool](side-bar.md#identify-tool):

<img src="../img/filtering-layers/get_filtered_features_info.gif" class="ms-docimage"/>

* Applying another type of filter

<img src="../img/filtering-layers/filtered_advanced_filtering.gif" class="ms-docimage"/>

* Opening the map next time (you need to Save the map from [Burger Menu](menu-bar.md#burger-menu) after applying a filter)

Once a *Layer filter* is set, it is possible to enable/disable it simply by clicking on the button that will appear near the layer name in [TOC](toc.md):

<img src="../img/filtering-layers/toogle-layer.jpg" class="ms-docimage" style="max-width:300px;"/>

This filter is applied through the [Query Panel](filtering-layers.md#query-panel). Once the settings are chosen, it is possible to **Apply** <img src="../img/button/apply_button.jpg" class="ms-docbutton"/> them. After that the user can:

* **Undo** <img src="../img/button/undo_button.jpg" class="ms-docbutton"/> the last changes

* **Reset** <img src="../img/button/reset_button.jpg" class="ms-docbutton"/> the filter to the initial situation

* **Save** <img src="../img/button/save_button.jpg" class="ms-docbutton"/> the filter in order to make it persistent

### Advanced Search

This filter, applicable from **Advanced Search** button <img src="../img/button/advanced-search.jpg" class="ms-docbutton"/> in [Attribute Table](attributes-table.md), behaves as follows:

* It can be used to apply a filter to a layer for search purposes in [Attribute Table](attributes-table.md): this filter is applied in `AND` to the *Layer Filter* if it is already been set.

<img src="../img/filtering-layers/filtered_features_grid.jpg" class="ms-docimage"/>

* It is possible to sync this filter with the map through the <img src="../img/button/sync.jpg" class="ms-docbutton"/> icon:

<img src="../img/filtering-layers/ar_sync.gif" class="ms-docimage" style="max-width:500px;"/>

* It will be automatically removed/reapplied by closing/opening the [Attribute Table](attributes-table.md)

Also this filter is applied through the [Query Panel](filtering-layers.md#query-panel) but in this case it is not possible to Save it and make it persistent reopening the map the next time. The user is only allowed to apply it by clicking on **Search** <img src="../img/button/search.jpg" class="ms-docbutton"/> or eventually **Reset** <img src="../img/button/reset_button.jpg" class="ms-docbutton"/> it.

### Quick Filter

The user can perform two type of quick filters:

* Filter by **attributes**

* Filter by **clicked point in the map**

#### Quick Filter by attributes

This filter is available for each colum in the [Attribute Table](attributes-table.md) just below the field names and it can be also used in combination with other filter applied:

<img src="../img/filtering-layers/filtered_quick_filter.gif" class="ms-docimage"/>

The user has the possibility to apply simple filters by attributes simply typing the filter's value in the available input fields (Date or Time pickers are available according to real attributes data types and a tooltip usually gives an information on how to fill the filter's input field). Filtering by one or more attributes, layer records in [Attribute Table](attributes-table.md) are automatically filtered accordingly.

If the user wants to filter by an attribute of type String, he can simply write something inside the input box and the list of records in table will be automatically filtered by matching with the input text.

<img src="../img/filtering-layers/attribute-table-quick-filter-1.jpg" class="ms-docimage"/>

If the User wants to filter by a numeric attribute, he can type directly a number or an expression using the following operators:

* Not equal (**!=** or **!==** or **<>**)

* Equal or less than (**<=**)

* Equal or greater than (**>=**)

* Less than (**<**)

* Greater than (**>**)

* Equal (**===** or **==** or *=*)

In order to filter a numerical filed matching the records *greater than* or *equal* to a certain threshold value, an example can be:

<img src="../img/filtering-layers/attribute-table-quick-filter-3.jpg" class="ms-docimage"/>

#### Quick Filter by clicked point

If the user wants to filter records in the Attribute Table simply by clicking on the map, he can activate the  **Filter clicking on the map** <img src="../img/button/filter_geometry_button.jpg" class="ms-docbutton"/> button (the button became blue) and then click on the map over the features he need to select. The list of records in the [Attribute Table](attributes-table.md) will be automatically filtered by matching with the selected point in the map.

<img src="../img/filtering-layers/filter_geometry.gif" class="ms-docimage"/>

The user can disable the geometry filter through the **Remove filter** <img src="../img/button/remove_filter_geometry.jpg" class="ms-docbutton"/> button.

!!! note
    The *Quick Filter* remains active as long as the [Attribute Table](attributes-table.md) is open but, unlike the *Advanced Search*, closing the [Attribute Table](attributes-table.md) it will not reappear anymore if the [Attribute Table](attributes-table.md) is re-opened in a second time.

## Query Panel

This tool is used to define advanced filters in [MapStore](https://mapstore.geo-solutions.it/mapstore/#/). It includes three main sections:

* **Attribute Filter**

* **Region of Interest**

* **Layer Filter**

<img src="../img/filtering-layers/query-panel.jpg" class="ms-docimage" style="max-width:500px;"/>

### Attribute filter

This filter allows to set one or more conditions referred to the [Attribute Table](attributes-table.md) fields. <br>
First of all it is possible to choose if the filter will match:

* **Any** conditions

* **All** conditions

* **None** conditions

After that, the user can insert one or more conditions, that can also be grouped in one or more condition groups (use the <img src="../img/button/condition_group.jpg" class="ms-docbutton"/> button in order to create a group).<br>
A condition can be set by selecting a value for each of the three input boxes:

* The first input box allows to choose a layer field

* In the second input box it is possible to choose the operation to perform (selecting a text field can be **=**, **like**, **ilike** or **isNull**, selecting a numerical field, can be **=**, **>**, **<**, **>=**, **<=**, **<>** or **><**)

* The third input box (in case of fields of type String) provides a paginated list of available field values already present in the layer's dataset (a GeoServer WPS process is used for this). In case of numeric fields the user can simply type a value to use for the filter.

!!! Note
    the "paginated list of available field values" above is available only if the server provides the WPS process `gs:PagedUnique`

A simple *Attribute Filter* applied for a numerical field can be, for example:

<img src="../img/filtering-layers/att_filter.gif" class="ms-docimage" style="max-width:600px;"/>

### Region of interest

In order to set this filter the user can:

* Select the *Filter type* by choosing between **Viewport**, **Rectangle**, **Circle**, **Polygon** (selecting Rectangle, Circle or Polygon it is necessary to draw the filter's geometry on the map)

* Select the *Geometric operation* by choosing between **Intersects**, **Is contained**, **Contains**

Applying a *Circle* filter with *Intersect* operation, for example, the process could be similar to the following:

<img src="../img/filtering-layers/geom_filter.gif" class="ms-docimage" style="max-width:600px;"/>

Once this filter is set, it is always possible to edit the coordinates and the dimensions of the drawn filter's geometry by clicking on the **Details** button <img src="../img/button/edit-icon-1.jpg" class="ms-docbutton"/>. Editing a circle, for example, it is possible to change the center coordinates (*x*, *y*) and the radius dimension (*m*):

<img src="../img/filtering-layers/edit_geom.jpg" class="ms-docimage" style="max-width:500px;"/>

### Layer filter

This tool allows to set [cross-layer filters](https://docs.geoserver.org/stable/en/user/extensions/querylayer/index.html) for a layer by using another layer or even the same one.

!!!warning
    This filter tool requires the [Query Layer plugin](https://docs.geoserver.org/stable/en/user/extensions/querylayer/index.html#installing-the-querylayer-module) installed in GeoServer

In order to set up a cross-layer filter the options below are required:

* *Target layer* (between those present in the [TOC](toc.md))

* *Operation* to be chosen between **Intersects**, **Is contained** or **Contains**

* Optionally some *Conditions* (see [Attribute filter](filtering-layers.md#attribute-filter))

In order to better understand this type of filter, let's make an example. We suppose that the user want to filter the Italian Regions with the Unesco Item's one:

<img src="../img/filtering-layers/layer-filter-1.jpg" class="ms-docimage" style="max-width:500px;"/>

In particular, if our goal is to take a look at the Italian Regions that contain the Unesco sites with *serial code=1*, the operations to perform can be the following:

<img src="../img/filtering-layers/layer_filter.gif" class="ms-docimage"/>
