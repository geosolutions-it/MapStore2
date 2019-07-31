# Table of Contents (TOC)
************************
The Table of Contents, briefly TOC from now on, is a place where all layers on the map are kept. It shows what the features in each layer represent and it allows you to manage the order and the visibility of the added layers. Moreover, it contains several tools in order to make edits and analysis on the layers.

Adding Layers
-------------
* **Click** on the *Show Layers* icon <img src="../img/show-layers.jpg" style="max-width:30px;" /> on the top-left corner of the map viewer. The TOC will open.

    <img src="../img/toc.png" style="max-width:300px;" />

* **Click** on the *Add Layer* icon <img src="../img/add_layer_button.png" style="max-width:30px;"/>. The *Catalog* page will open on the right. You will learn more about the *Catalog Services* in the [Menu Bar](menu-bar.md) section.

    <img src="../img/catalog.jpg" style="max-width:500px;" />

* From the search bar highlighted in the figure above. **Search** for *USA POPULATION* layer then **Click** on  <img src="../img/add_to_map_button.png" style="max-width:30px;"/>. The layer will be added to the TOC under the Default *Layer Group* and displayed on the map.

    <img src="../img/layer-usa.png" />

* You can toggle the layer visibility by switching off <img src="../img/eyeoff.jpg" style="max-width:60px;"/> and on <img src="../img/eyeon.jpg" style="max-width:60px;"/> the "eye" icon.

* You can expand the layer legend by clicking on the arrow icon <img src="../img/legend-icon.jpg" style="max-width:60px;"/>.

     <img src="../img/layer-legend.jpg" style="max-width:200px;"/>

* You can control the layer transparency by scrolling left and right the transparency bar <img src="../img/transparency-bar.jpg" style="max-width:60px;"/>.

Managing Layer Groups
---------------------
From the TOC, **Click** on the <span style="color:blue">*Default* </span> Layer Group. The layer group card will be highlighted and a <span style="color:red">set of options </span> will be shown.

<img src="../img/layer_group.png" style="max-width:300px;"/>

 * <img src="../img/add_layer_button.png" style="max-width:30px;"/> allows the user to add layers to the selected group.
 * <img src="../img/add_group_button.png" style="max-width:30px;"/> allows the user to create groups and subgroups.
 * <img src="../img/zoom-layer.jpg" style="max-width:30px;"/> allows the user to zoom on the existing layers in the group.
 * <img src="../img/properties.jpg" style="max-width:30px;"/> allows the user to manage the properties of the layer group.
 * <img src="../img/delete.jpg" style="max-width:30px;"/> allows the user to delete the layer group and its content.

**Click** on <img src="../img/properties.jpg" style="max-width:25px;"/>, you will be addressed to a new page.

<img src="../img/group-settings.jpg" style="max-width:350px;"/>

Here you can change the Title of the layer group, its translations in several languages and the description.

* **Change** the *Title* from Default to USA.

* Then **Click** on the save icon <img src="../img/save-icon.jpg" style="max-width:25px;"/>. You will be redirected to the TOC.

Now let us suppose that we want to add new layers and arrange them in new groups:

* **Click** on *USA* layer group to deselect it then **Click** on <img src="../img/add_layer_button.png" style="max-width:30px;"/> to add another layer to the map.

    <img src="../img/usa_group.png" style="max-width:350px;"/>

As before, the catalog will open on the right side of the portal.

 * **Search** the layer *North America sample imagery* then **Add** it to the map.

    <img src="../img/second-layer.jpg" style="max-width:500px;"/>

* The order of the layers in the TOC determines the drawing order in the data frame. **Drag** and **Drop** the *USA Population* layer over the  *North America sample imagery* layer in order to get a right drawing order.

    <img src="../img/order-layers.jpg" style="max-width:500px;"/>

* Deselect all the layers and groups, then **Click** on <img src="../img/add_group_button.png" style="max-width:25px;"/> to add a new group.

    <img src="../img/new_group_name.png" style="max-width:350px;"/>

* **Type** the name of the group and click <img src="../img/add_group_confirm_button.png" style="max-width:30px;"/>, the new group should be visible under the existing ones.

    <img src="../img/new_group.png" style="max-width:350px;"/>

* Now, **Click** on *North America sample imagery* to select it. A set of options will be shown, it will be addressed in details shortly. For now **Click** the settings icon of the layer.

     <img src="../img/imagery.jpg" style="max-width:350px;"/>

* You will be addressed to a new page. Under the Group field, **Select**  the new group *Imagery*

      <img src="../img/group_imagery.png" style="max-width:350px;"/>

* **Save** the edits.

A new group called Imagery will be created containing the layer North America sample imagery.

<img src="../img/group-imagery-1.jpg" style="max-width:350px;"/>

Instead of creating a new main group (at the same level USA) you can also create or set sub-groups

* Select for example the **Imagery** group and click the <img src="../img/add_group_button.png" style="max-width:30px;"/> icon in the toolbar.

    <img src="../img/north_america_subgroup.png" style="max-width:350px;"/>

* **Type** the subgroup name and **Click** on <img src="../img/add_group_confirm_button.png" style="max-width:30px;"/>.

    <img src="../img/new_subgroup.png" style="max-width:350px;"/>

* **Select** the *North America sample imagery* layer, open its settings.

* Select the group *North America* and click **Save**

    <img src="../img/add_layer_to_subgroups.png" style="max-width:350px;"/>

* Take a look at the TOC to see the results.

    <img src="../img/subgroup_with_layers_in_toc.png" style="max-width:350px;"/>

Managing Layers
---------------

After adding a layer, several options can be accessed from the TOC allowing you to manage the layer and to make analysis on it.

**Click** on the *USA Population* layer, added in the previous section, to select it. A set of tools will be ready to be applied on the selected layer.

<img src="../img/layer-tools.png" style="max-width:500px;" />

* <img src="../img/zoom-layer.jpg" style="max-width:60px;"/> allows you to zoom on the selected layer.

* <img src="../img/delete.jpg" style="max-width:60px;"/> allows you to delete the selected layer.

The remaining tools will be faced in detail in separate sections:

*  <img src="../img/properties.jpg" style="width:30px;"/> [Layer Settings](layer-settings.md): allows you to manage the layers in groups, to set the display mode and the style of the layers, and to set the format of the feature info.
*  <img src="../img/filter-layer.png" style="max-width:30px;"/> [Filter Layer](filtering-layers.md): acts directly on a layer and filter its content upfront (this works only on layers with WFS available).
*  <img src="../img/attributes-table.jpg" /> [Attribute Table](attributes-table.md): allows you to visualize, query, edit and analyze tabular data related to the layer.
* <img src="../img/widgets.jpg" /> [Widgets](widgets.md): allows you to create charts, texts, tables widgets and add them to the map.
