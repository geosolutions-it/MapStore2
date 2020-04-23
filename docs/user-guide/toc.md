# Table of Contents (TOC)
**************************

The Table of Contents, briefly TOC from now on, is a space where all the layers and the layers groups are listed. Through this panel it is also possible to carry out the following operations:

* Add and remove layers and groups

* Perform a search between layers

* Change the position (and consequently the display order in map) of layers and groups

* Set some display options directly from the panel

* Manage layers and groups and query layers through the toolbar actions

## Add and remove layers and groups

The user can access the TOC with the **Layers** button <img src="../img/button/show-layers.jpg" class="ms-docbutton"/> on the top-left corner of the map viewer. For example, in a new map, the following panel appears:

<img src="../img/toc/toc.jpg" class="ms-docimage"  style="max-width:300px;" />

The **Add Layer** button <img src="../img/button/add_layer_button.jpg" class="ms-docbutton"/> opens the [Catalog](catalog.md), a panel  where it is possible to choose the desired layer and add it to the map with the **Add to Map** button <img src="../img/button/add_to_map_button.jpg" class="ms-docbutton"/>:

<img src="../img/toc/catalog.jpg" class="ms-docimage"  style="max-width:500px;" />

Once the layer is added to the map, the result should be like the following:

<img src="../img/toc/layer-usa.jpg" class="ms-docimage"/>

!!! note
    When a layer is added for the first time to the TOC, without any group present, the *Default* group is created. This group host all the layers that don't belong to a specific group and can also host sub-groups within it.

In order to add a new group, clicking on the **Add Group** button <img src="../img/button/add_group_button.jpg" class="ms-docbutton"/> the following window opens:

<img src="../img/toc/new_group_name.jpg" class="ms-docimage"  style="max-width:350px;"/>

Once the name of the group is typed, with the <img src="../img/button/add_group_confirm_button.jpg" class="ms-docbutton"/> button the new group is added to the TOC.

<img src="../img/toc/group-added.jpg" class="ms-docimage"  style="max-width:300px;"/>

In order to add a new layer to a specific group, it is possible to select that group and click on **Add layer to selected group** <img src="../img/button/add_layer_button.jpg" class="ms-docbutton"/>:

<img src="../img/toc/add-layer-to-group.jpg" class="ms-docimage"  style="max-width:300px;"/>

In order to add a subgroup inside a specific group selected, the user can click on the **Add sub group to the selected group** button <img src="../img/button/add_group_button.jpg" class="ms-docbutton"/> (maximum 4 subgroup levels are allowed):

<img src="../img/toc/add-sub-group.jpg" class="ms-docimage"  style="max-width:300px;"/>

Layers and groups can be removed selecting them and clicking on the **Remove** button <img src="../img/button/delete.jpg" class="ms-docbutton"/> present in the toolbar of each selected layer and group.

!!! warning
    When a group is removed, also all the layers and subgroups associated with it will be removed.

## Search for layers

With the TOC it is also possible to perform a search between the added layers. This operation can be done simply by typing the name (o part of it) of the layer in the search bar:

<img src="../img/toc/search.jpg" class="ms-docimage"  style="max-width:300px;"/>

## Choose layers and groups position

With the drag and drop it is possible to change layers position inside the same group, but also moving them between different groups. Once the *Default* group is created, all the layers without a specific group are automatically added to this one. Changing layers position with the drag and drop, for example, it can display like the following:

<img src="../img/toc/ded-layers.gif" class="ms-docimage"  style="max-width:300px;"/>

Groups and sub-groups, no matter their level, can be nested inside other groups and sub-groups, or can be separated from their parent-level to create new main groups. These operation can be performed, again, with the drag and drop function.

<img src="../img/toc/ded-groups.gif" class="ms-docimage"  style="max-width:300px;"/>

!!! warning
    The only constraints applied to the groups manager refer to the *Default* group (each layer added to the map the first time is included in that group). Drag and Drop operations are not allowed for the *Default*, but it's allowed to rename it or to nest groups or sub-groups inside it.  

Layers position can also be determined through the **Selected layer settings** button <img src="../img/button/properties.jpg" class="ms-docbutton"/> available in the toolbar that appears once a layer is selected. This button opens a panel where the user can choose the destination group (or subgroup):

<img src="../img/toc/settings-group.jpg" class="ms-docimage"  style="max-width:350px;"/>

## Display options in panel

Directly from the TOC panel, it is possible to set different types of display options. In particular, for layers, it is possible to:

<img src="../img/toc/layer-legend.jpg" class="ms-docimage"/>

* Toggle layers visibility by switching on <img src="../img/button/eyeon.jpg" class="ms-docbutton"/> and off <img src="../img/button/eyeoff.jpg" class="ms-docbutton"/> the "eye" icon to the left of the layer name

* Expand or collapse the legend by clicking on the <img src="../img/button/legend-icon.jpg" class="ms-docbutton"/> icon. The width and height property of the legend can be overridden via Legend options under Display tab.

* Control the transparency in map by scrolling the opacity slider

!!! note
    When the user switch off the visibility of a layer, also the group where that layer is nested change the "eye" icon in <img src="../img/button/eyeoff.jpg" class="ms-docbutton"/> (no matter if other visible layers are present in that group)

With groups there's the possibility to:

<img src="../img/toc/group.jpg" class="ms-docimage"/>

* Expand <img src="../img/button/group-open.jpg" class="ms-docbutton"/> or collapse <img src="../img/button/group-close.jpg" class="ms-docbutton"/> the list of layers or subgroups nested inside it

* Toggle groups visibility by switching on <img src="../img/button/eyeon.jpg" class="ms-docbutton"/> and off <img src="../img/button/eyeoff.jpg" class="ms-docbutton"/> the "eye" icon to the left of the group name

!!! note
    When the user switch off the visibility of a group, also the visibility of all the layers and subgroups nested inside it will be automatically switched off.

## Toolbar options

Once a layer is selected the following toolbar appears: 

<img src="../img/toc/layer-toolbar.jpg" class="ms-docimage"/>

Through this toolbar it is possible to:

* **Zoom to selected layer extent** <img src="../img/button/zoom-layer.jpg" class="ms-docbutton"/>

* Access the selected [Layer Settings](layer-settings.md) <img src="../img/button/properties.jpg" class="ms-docbutton"/>

* [Set a Filter](filtering-layers.md) for that layer <img src="../img/button/filter-layer.jpg" class="ms-docbutton"/>

* Access the [Attribute Table](attributes-table.md) <img src="../img/button/attributes-table.jpg" class="ms-docbutton"/>

* **Remove** the selected layer <img src="../img/button/delete.jpg" class="ms-docbutton"/>

* [Create Widgets](widgets.md) for the selected layer <img src="../img/button/widgets.jpg" class="ms-docbutton"/>

Selecting a group the toolbar is the following:

<img src="../img/toc/group-toolbar.jpg" class="ms-docimage"/>

In this case the user is allowed to:

* **Add layer to selected group** <img src="../img/button/add_layer_button.jpg" class="ms-docbutton"/>

* **Add sub group to the selected group** <img src="../img/button/add_group_button.jpg" class="ms-docbutton"/>

* **Zoom to selected layers extent** <img src="../img/button/zoom-layer.jpg" class="ms-docbutton"/> (in order to zoom the map to all layers belonging to the group)

* Access the **Selected group settings** <img src="../img/button/properties.jpg" class="ms-docbutton"/> where it is possible to set the group title and the translations, take a look at the group ID name, add a description and customize the Tooltips visualization (more information can be found in [Layer Settings](layer-settings.md) section)

<img src="../img/toc/group-settings.jpg" class="ms-docimage" style="max-width:400px;"/>

* **Remove selected group** <img src="../img/button/delete.jpg" class="ms-docbutton"/> and its content

Once the changes have been made, it's possible to save them through the **Save** button <img src="../img/button/save-icon.jpg" class="ms-docbutton"/>.

!!! note
    Information such modified will be persisted only within the current user session. In order to make thiese kind of changes persistent also for other user session, the whole map context needs to be saved.

