# Filtering Layers
******************

When using vector layers it might be useful to work with a subset of features. About that, [MapStore](https://mapstore.geo-solutions.it/mapstore/#/) let the user set up a **Layer Filter** that acts directly on a layer with WFS available and filter its content upfront.
The map will immediately update when a filter is created and all other tools will take it into consideration when used.

## Filter types

In [MapStore](https://mapstore.geo-solutions.it/mapstore/#/) it is possible to apply three types of filters, called:

* *Layer Filter*

* *Advanced Search*

* *Quick Filter*

### Layer Filter

This filter is applicable from the **Filter layer** button <img src="../img/button/filter-layer.jpg" class="ms-docbutton"/> in TOC's [Layers Toolbar](toc.md#toolbar-options) and it will persist in the following situations:

* Using other tools like the [Identify tool](side-bar.md#identify-tool):

<img src="../img/filtering-layers/get_filtered_features_info.gif" class="ms-docimage"/>

* Applying another type of filter

<img src="../img/filtering-layers/filtered_advanced_filtering.gif" class="ms-docimage"/>

* Opening the map next time (you need to Save the map from [Burger Menu](menu-bar.md#burger-menu) after the filter application)

Once a *Layer filter* is set, it is possible to enable/disable it simply by clicking on the button that will appear near the layer name in [TOC](toc.md):

<img src="../img/filtering-layers/toogle-layer.jpg" class="ms-docimage" style="max-width:300px;"/>

This filter is applied through the [Query Panel](filtering-layers.md#query-panel). Once the settings are chosen, it is possible to **Apply** <img src="../img/button/apply_button.jpg" class="ms-docbutton"/> them. After that the user can:

* **Undo** <img src="../img/button/undo_button.jpg" class="ms-docbutton"/> the last changes

* **Reset** <img src="../img/button/reset_button.jpg" class="ms-docbutton"/> the filter to the initial situation

* **Save** <img src="../img/button/save_button.jpg" class="ms-docbutton"/> the filter in order to make it persistent

### Advanced Search

This filter, applicable from **Advanced Search** button <img src="../img/button/advanced-search.jpg" class="ms-docbutton"/> in [Attribute Table](attributes-table.md), behaves as follows:

* It can be used to filter the geometries resulting from an already applied *Layer Filter* (in this case the *Layer Filter* will go in `AND` with the *Advanced Filtering*)

<img src="../img/filtering-layers/filtered_features_grid.jpg" class="ms-docimage"/>

* It is possible to sync this filter with the map through the <img src="../img/button/sync.jpg" class="ms-docbutton"/> icon:

<img src="../img/filtering-layers/ar_sync.gif" class="ms-docimage" style="max-width:500px;"/>

* It will be automatically removed/reapplied by closing/opening the [Attribute Table](attributes-table.md)

Also this filter is applied through the [Query Panel](filtering-layers.md#query-panel) but in this case it is not possible to Save it and make it persistent reopening the map the next time. The user is only allowed to apply it by clicking on **Search** <img src="../img/button/search.jpg" class="ms-docbutton"/> or eventually **Reset** <img src="../img/button/reset_button.jpg" class="ms-docbutton"/> it.

### Quick Filter

This filter, applicable directly in the [Attribute Table](attributes-table.md) just below the field names, can be also used in combination with the other types of filter:

<img src="../img/filtering-layers/filtered_quick_filter.gif" class="ms-docimage"/>

In the case the user wants to filter the layer through a text field, he can simply write something inside the input box and the field will be automatically filtered matching with the input text:

<img src="../img/filtering-layers/attribute-table-quick-filter-1.jpg" class="ms-docimage"/>

When, instead, the goal is to filter the layer through a numerical field, it is possible to make use of the following operations:

* Not equal (**!=** or **!==** or **<>**)

* Equal or less than (**<=**)

* Equal or greater than (**>=**)

* Less than (**<**)

* Greater than (**>**)

* Equal (**===** or **==** or *=*)

In order to filter a numerical filed matching the records *greater than* or *equal* to a certain threshold value, an example can be:

<img src="../img/filtering-layers/attribute-table-quick-filter-3.jpg" class="ms-docimage"/>

The *Quick Filter* remains active as long as the [Attribute Table](attributes-table.md) is open but, unlike the *Advanced Search*, closing the [Attribute Table](attributes-table.md) it will not reappear anymore.

## Query Panel

This panel, used in order to set a filter of the *Layer Filter* or *Advanced Search* types, is divided in three main sections:

* **Attribute Filter**

* **Region of Interest**

* **Layer Filter**

<img src="../img/filtering-layers/query-panel.jpg" class="ms-docimage" style="max-width:500px;"/>

Those filter types are persistent during the filtering section. This means that if a filter is set, the user can apply another one only for that records already filtered by the first one.

### Attribute filter

This filter allows to set one or more conditions referred to the attribute table fields. <br>
First of all it is possible to choose if the filter will match: 

* **Any** conditions

* **All** conditions 

* **None** conditions

After that, the user can insert one or more conditions, that can also be grouped in one or more condition groups (use the <img src="../img/button/cond_group.jpg" class="ms-docbutton"/> button in order to create a group).<br>
A condition can be set by selecting a value for each of the three input boxes:

* The first input box allows to choose a layer field

* In the second input box it is possible to choose the operation to perform (selecting a text field can be **=**, **like**, **ilike** or **isNull**, selecting a numerical field, can be **=**, **>**, **<**, **>=**, **<=**, **<>** or **><**)

* The third input box allows to choose between the selected field values when the field is textual, or simply insert a value when the field is numerical

A simple *Attribute Filter* applied for a numerical field can be, for example:

<img src="../img/filtering-layers/att_filter.gif" class="ms-docimage" style="max-width:600px;"/>

### Region of interest

In order to set this filter, performed comparing the layer with a spatial geometry, the user can:

* Select the *Filter type* between **Viewport**, **Rectangle**, **Circle**, **Polygon** (selecting Rectangle, Circle or Polygon it is necessary to draw the geometry on the map)

* Select the *Geometric operation* between **Intersects**, **Is contained**, **Contains**

Applying a *Circle* filter with *Intersect* operation, for example, the process could be similar to the following:

<img src="../img/filtering-layers/geom_filter.gif" class="ms-docimage" style="max-width:600px;"/>

Once this filter is set, it is always possible to edit the coordinates and the dimensions of the drawn geometry by clicking on the **Details** button <img src="../img/button/edit-icon-1.jpg" class="ms-docbutton"/>. Editing a circle, for example, it is possible to change the center coordinates (*x*, *y*) and the radius dimension (*m*):

<img src="../img/filtering-layers/edit_geom.jpg" class="ms-docimage" style="max-width:500px;"/>

### Layer filter

This tool allows to set a filter for a layer that takes into account another layer or even the same one. In order to perform this operation it is required to set the following options:

* *Target layer* (between those present in the [TOC](toc.md))

* *Operation* to be chosen between **Intersects**, **Is contained** or **Contains** 

* Optionally some *Conditions* (see [Attribute filter](filtering-layers.md#attribute-filter))

In order to better understand this type of filter, let's make an example. We suppose that the user want to filter the Italian Regions with the Unesco Item's one:

<img src="../img/filtering-layers/layer-filter-1.jpg" class="ms-docimage" style="max-width:500px;"/>

In particular, if our goal is to take a look at the Italian Regions that contain the Unesco sites with *serial code=1*, the operations to perform can be the following:

<img src="../img/filtering-layers/layer_filter.gif" class="ms-docimage"/>
