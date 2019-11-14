# Table of Contents (TOC)
************************
The Table of Contents, briefly TOC from now on, is a place where all layers on the map are kept. It shows what the features in each layer represent and it allows you to manage the order and the visibility of the added layers. Moreover, it contains several tools in order to make edits and analysis on the layers.

Adding Layers
-------------
* **Click** on the *Show Layers* icon <img src="../img/button/show-layers.jpg" style="max-width:30px;" /> on the top-left corner of the map viewer. The TOC will open.

    <img src="../img/toc/toc.jpg" style="max-width:300px;" />

* **Click** on the *Add Layer* icon <img src="../img/button/add_layer_button.jpg" style="max-width:30px;"/>. The *Catalog* page will open on the right. You will learn more about the *Catalog Services* in the [Menu Bar](menu-bar.md) section.

    <img src="../img/toc/catalog.jpg" style="max-width:500px;" />

* From the search bar highlighted in the figure above. **Search** for *USA POPULATION* layer then **Click** on  <img src="../img/button/add_to_map_button.jpg" style="max-width:30px;"/>. The layer will be added to the TOC under the Default *Layer Group* and displayed on the map.

    <img src="../img/toc/layer-usa.jpg" />

* You can toggle the layer visibility by switching off <img src="../img/button/eyeoff.jpg" style="max-width:60px;"/> and on <img src="../img/button/eyeon.jpg" style="max-width:60px;"/> the "eye" icon.

* You can expand the layer legend by clicking on the arrow icon <img src="../img/button/legend-icon.jpg" style="max-width:60px;"/>.

    <img src="../img/toc/layer-legend.jpg" style="max-width:200px;"/>

* You can control the layer transparency by scrolling left and right the transparency bar <img src="../img/toc/transparency-bar.jpg" style="max-width:60px;"/>.

Managing Layer Groups
---------------------
From the TOC, **Click** on the <span style="color:blue">*Default* </span> Layer Group. The layer group card will be highlighted and a <span style="color:red">set of options </span> will be shown.

<img src="../img/toc/layer_group.jpg" style="max-width:300px;"/>

 * <img src="../img/button/add_layer_button.jpg" style="max-width:30px;"/> allows the user to add layers to the selected group.
 * <img src="../img/button/add_group_button.jpg" style="max-width:30px;"/> allows the user to create groups and subgroups.
 * <img src="../img/button/zoom-layer.jpg" style="max-width:30px;"/> allows the user to zoom on the existing layers in the group.
 * <img src="../img/button/properties.jpg" style="max-width:30px;"/> allows the user to manage the properties of the layer group.
 * <img src="../img/button/delete.jpg" style="max-width:30px;"/> allows the user to delete the layer group and its content.

**Click** on <img src="../img/button/properties.jpg" style="max-width:25px;"/>, you will be addressed to a new page.

<img src="../img/toc/group-settings.jpg" style="max-width:350px;"/>

Here you can change the Title of the layer group, its translations in several languages and the description.

* **Change** the *Title* from Default to USA.

* Then **Click** on the save icon <img src="../img/button/save-icon.jpg" style="max-width:25px;"/>. You will be redirected to the TOC.

Now let us suppose that we want to add new layers and arrange them in new groups:

* **Click** on *USA* layer group to deselect it then **Click** on <img src="../img/button/add_layer_button.jpg" style="max-width:30px;"/> to add another layer to the map.

    <img src="../img/toc/usa_group.jpg" style="max-width:350px;"/>

As before, the catalog will open on the right side of the portal.

* **Search** the layer *North America sample imagery* then **Add** it to the map.

    <img src="../img/toc/second-layer.jpg" style="max-width:500px;"/>

The order of the layers in the TOC determines the drawing order in the data frame.

*  **Drag** and **Drop** the *USA Population* layer over the  *North America sample imagery* layer in order to get a right drawing order.

    <img src="../img/toc/order-layers.jpg" style="max-width:500px;"/>

* Deselect all the layers and groups, then **Click** on <img src="../img/button/add_group_button.jpg" style="max-width:25px;"/> to add a new group.

    <img src="../img/toc/new_group_name.jpg" style="max-width:350px;"/>

* **Type** the name of the group and click <img src="../img/button/add_group_confirm_button.jpg" style="max-width:30px;"/>, the new group should be visible under the existing ones.

    <img src="../img/toc/new_group.jpg" style="max-width:350px;"/>

In order to change a layer's group, you can simply drag and drop that layer inside the desidered group.

* **Drag** and **Drop** the *North America sample imagery* inside the new *Imagery* group.

    <img src="../img/toc/layer-in-group.jpg" style="max-width:350px;"/>

In addition to creating a new main group (at the same level of *USA*), you can also create or set new sub-groups (maximum 4 sub-group levels are allowed). 

* Select for example the *USA* group and **Click** the <img src="../img/button/add_group_button.jpg" style="max-width:30px;"/> icon in the toolbar.

    <img src="../img/toc/north_america_subgroup.jpg" style="max-width:350px;"/>

* **Type** the subgroup name and **Click** on <img src="../img/button/add_group_confirm_button.jpg" style="max-width:30px;"/>.

    <img src="../img/toc/new-subgroup.jpg" style="max-width:350px;"/>

Groups and sub-groups, no matter their level, can be nested inside other groups and sub-groups, or can be separated from their mother-level to form new main groups. These operation can be performed, again, with the drag and drop function.

!!! warning
    The only constraints applied to the groups manager refer to the default group, created when the first layer is added to the Table of Content. At the moment is impossible to change the position or nest the default group inside another group or sub-group, but it's allowed to rename it or to nest groups or sub-groups inside it.  

* **Drag** and **Drop** the *North America* sub-group inside the *Imagery* group.

    <img src="../img/toc/subgroup-in-group.jpg" style="max-width:350px;"/>

It is also possible to change the group of a specific layer from the selected layer's settings button. 

* Now, **Click** on *North America sample imagery* to select it. A set of options will be shown, it will be addressed in details shortly. For now **Click** the settings icon of the layer. 

    <img src="../img/toc/layer-settings.jpg" style="max-width:350px;"/>

* You will be addressed to a new page. Under the Group field, **Open** the dropdown menu and you will see all the groups and sub-groups where it's possible to nest the layer. **Click** on the *Imagery/North America* option in order to nest the layer inside the *North America* sub-group.

    <img src="../img/toc/layer-to-subgroup.jpg" style="max-width:350px;"/>

* **Save** the edits and take a look at the TOC to see the results.

    <img src="../img/toc/layer-moved.jpg" style="max-width:350px;"/>

Managing Layers
---------------

After adding a layer, several options can be accessed from the TOC allowing you to manage the layer and to make analysis on it.

**Click** on the *USA Population* layer, added in the previous section, to select it. A set of tools will be ready to be applied on the selected layer.

<img src="../img/toc/layer-tools.jpg" style="max-width:500px;" />

* <img src="../img/button/zoom-layer.jpg" style="max-width:60px;"/> allows you to zoom on the selected layer.

* <img src="../img/button/delete.jpg" style="max-width:60px;"/> allows you to delete the selected layer.

The remaining tools will be faced in detail in separate sections:

*  <img src="../img/button/properties.jpg" style="width:30px;"/> [Layer Settings](layer-settings.md): allows you to manage the layers in groups, to set the display mode and the style of the layers, and to set the format of the feature info.
*  <img src="../img/button/filter-layer.jpg" style="max-width:30px;"/> [Filter Layer](filtering-layers.md): acts directly on a layer and filter its content upfront (this works only on layers with WFS available).
*  <img src="../img/button/attributes-table.jpg" /> [Attribute Table](attributes-table.md): allows you to visualize, query, edit and analyze tabular data related to the layer.
* <img src="../img/button/widgets.jpg" /> [Widgets](widgets.md): allows you to create charts, texts, tables widgets and add them to the map.
