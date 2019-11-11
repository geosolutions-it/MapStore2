# Filtering Layers
******************

When using vector layers it might be useful to work with a subset of features.
About that, [MapStore](https://mapstore.geo-solutions.it/mapstore/#/) let you set up a **Layer Filter** that acts directly on a layer with WFS available and filter its content upfront.
The map will immediately update when a filter is created and all other tools will take it into consideration when used. More over, the filter is saved into the map context so if you save it the filter will apply when you open the map next time.

Creating a new Layer Filter
---------------------------

As we said  in [this](toc.md#managing-layers) section, is it possible to set up a *Layer Filter* from the <img src="../img/button/filter-layer.png" style="max-width:30px;"/> button of the TOC toolbar. Select a vector layer and click on it to see the toolbar.

<img src="../img/filtering-layers/filter_layer_button.png" />

The following steps show you how to filter that layer:

* **Click** on the <img src="../img/button/filter-layer.png" style="max-width:30px;"/> button to open the *Query Builder*.

    <img src="../img/filtering-layers/query_builder.png" />

* **Set up** a filter. In this example we will draw a region of interest on the map to perform a spatial query:

    * **Select** a *Filter Type* (a `Rectangle` for example), you can choose between these spatial objects:

        * *Viewport*
        * *Rectangle*
        * *Circle*
        * *Polygon*

    * **Select** a *Geometric Operation* (`Intersect` could be fine), you can choose between these operations:

        * *Intersect*
        * *Is contained*
        * *Contains*

        <img src="../img/filtering-layers/filter_set_up.png" />

        A message suggest you to *draw the region of interest on the map*, so do it to complete the filter creation.

    * **Draw** a rectangle on the map

        <img src="../img/filtering-layers/rectangle_filter.png" />

* **Click** the *Apply* <img src="../img/button/apply_button.png" style="max-width:30px;"/> button of the Query Builder toolbar, the map updates immediately.

    <img src="../img/filtering-layers/applied_filter.png" />

* **Click** on *Save* <img src="../img/button/save_button.png" style="max-width:30px;"/> button to make it persistent. It means the filter will take effect whenever using the layer even if the *Query Builder* is closed.

A filter icon <img src="../img/button/filter-layer.png" style="max-width:30px;"/> is shown in the [TOC](toc.md) right next to the layer title to notify that the layer is filtered. The *Filter Icon* is toggleable to temporarily disable the filter anytime.

<img src="../img/filtering-layers/enable_layer_filter.gif" />

### Layer Filter Persistence

Once the filter has been saved the filter becomes **persistent** along with the other layer options and inside the map object on map save.

If you try to retrieve the features information through a click on the map, the filter you have created is applied to the content you get:

<img src="../img/filtering-layers/get_filtered_features_info.gif" />

The layer [Attributes Table](attributes-table.md) also takes the filter into account:

<img src="../img/filtering-layers/filtered_features_grid.png" />

Any additional filter you define using the [Advanced Filtering](attributes-table.md#advanced-filtering) tool or the *Quick Filter* will overlap the layer filter.
*Layer Filter* will go in *`AND`* with *Advanced Filtering*:

<img src="../img/filtering-layers/filtered_advanced_filtering.gif" />

*Layer Filter* will go in *`AND`* with *Quick Filter*:

<img src="../img/filtering-layers/filtered_quick_filter.gif" />

When saving a map the *Layer Filter* is saved along with it, so if you reload the map the filter will still be active.

Modifying a Layer Filter
------------------------

If you want to change the *Layer Filter* configuration you have to click the *Filter Layer* button <img src="../img/button/filter-layer.png" style="max-width:30px;"/> in the [TOC](toc.md) toolbar so that the *Query Builder* opens.

* **Modify** the existing filter (adding new conditions for example)

* **Click** on *Apply* <img src="../img/button/apply_button.png" style="max-width:30px;"/> so that the map updates

* **Click** on *Save* <img src="../img/button/save_button.png" style="max-width:30px;"/> to make the filter persistent

<img src="../img/filtering-layers/modify_layer_filter.gif" />

The *Query Builder* toolbar makes also available the *Undo* button <img src="../img/button/undo_button.png" style="max-width:30px;"/> to discard applied changes to the filter since the last save (so it is disabled if no changes are made after the last save).

Removing a Layer Filter
-----------------------

When opening the *Query Builder* of a filtered layer, the filter is already configured.
The *Reset* button <img src="../img/button/reset_button.png" style="max-width:30px;"/> is the only one enabled and it allows you to clear the filter (it restores an empty filter):

* **Click** on *Reset* <img src="../img/button/reset_button.png" style="max-width:30px;"/>, an empty filter will be configured and the map updates immediately.

* **Click** on *Save* <img src="../img/button/save_button.png" style="max-width:30px;"/> to make the state persistent or **Click** *Undo* <img src="../img/button/undo_button.png" style="max-width:30px;"/> to restore the previous saved filter.

An example in the following gif:

<img src="../img/filtering-layers/remove_layer_filter.gif" />
