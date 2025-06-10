# Table of Contents

**************************

The Table of Contents, briefly TOC from now on, is a space where all the layers and the layers groups are listed. Through this panel it is also possible to carry out the following operations:

* Add and remove layers and groups

* Perform a search between layers

* Change the position (and consequently the display order in map) of layers and groups

* Set some display options directly from the panel

* Manage layers and groups and query layers through the toolbar actions

## TOC Settings and Toolbar

The user can access the TOC with the <img src="../img/button/show-layers.jpg" class="ms-docbutton"/> button on the top-left corner of the map viewer. Once this is done, the following panel will appear:

<img src="../img/toc/toc.jpg" class="ms-docimage"  style="max-width:400px;" />

With the *TOC Toolbar* the user can:

* **Add new layer** through the <img src="../img/button/add_layer_button.jpg" class="ms-docbutton"/> button: the [Catalog](catalog.md#catalog-services) panel opens and the user can choose the desired layer to add it to the map, through the <img src="../img/button/add_to_map_button.jpg" class="ms-docbutton"/> button.

<video class="ms-docimage" controls><source src="../img/toc/add-layer.mp4"/></video>

* **Add new group**, through the <img src="../img/button/add_group_button.jpg" class="ms-docbutton"/> button: the following window opens where the user can enter the group title and add it to the TOC, through the <img src="../img/button/add_group_confirm_button.jpg" class="ms-docbutton"/> button.

<video class="ms-docimage" controls><source src="../img/toc/add-group.mp4"/></video>

* **Add new Annotations** through the <img src="../img/button/annotations2.jpg" class="ms-docbutton" style="max-height:30px;"/> button as explained in the [Annotations](annotations.md) section.

[MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) allows the user to customize the display of groups and layers within the *TOC* by enabling/disabling some options, through the <img src="../img/button/toc-settings-button.jpg" class="ms-docbutton"/> button:

<img src="../img/toc/toc-settings-panel.jpg" class="ms-docimage"  style="max-width:350px;"/>

Here the user can:

* Enable/disable the opening of the TOC on map initialization, through the <img src="../img/button/arrow-button.jpg" class="ms-docbutton"/> button.

* Change the TOC theme by choosing between **Default Theme** or **Legend Theme**, through the <img src="../img/button/theme-button.jpg" class="ms-docbutton"/> button. With the *Legend Theme* the user does not have the ability to drag and drop the position of groups/layers. This mode provides a simplified and lighter TOC when necessary.

* Enable/disable the possibility to display the entire title of groups/layers, through the <img src="../img/button/text-button.jpg" class="ms-docbutton"/> button.

* **Show/hide the opacity slider** for layers, through the <img src="../img/button/opacity-slider-button.jpg" class="ms-docbutton"/> button.

* If the *Opacity Slider* is enabled, **Show/hide the opacity tooltip** for layers, through the <img src="../img/button/opacity-tooltip-button.jpg" class="ms-docbutton"/> button.

When right-clicking on the TOC body, in addition to the options available in the *TOC Settings* menu described above, the user can access some more settings such as:

<video class="ms-docimage" controls><source src="../img/toc/toc-settings-panel2.mp4"/></video>

* Show all groups and layers present in the TOC by enabling the **Show all child nodes** through the <img src="../img/button/show-all-child-nodes.jpg" class="ms-docbutton"/> button.

* Hide all groups and layers present in the TOC by enabling the **Hide all child nodes** through the <img src="../img/button/hide-all-child-nodes.jpg" class="ms-docbutton"/> button.

* Collapse all groups present in the TOC by enabling the **Collapse all child nodes** through the <img src="../img/button/collapse-all-child-nodes.jpg" class="ms-docbutton"/> button.

* Expand all groups present in the TOC by enabling the  **Expand all child nodes** through the <img src="../img/button/expand-all-child-nodes.jpg" class="ms-docbutton"/> button. Each layer legend is also expanded.

* Add a new group in TOC, through the <img src="../img/button/add-group.jpg" class="ms-docbutton"/> button.

* Zoom the map to the extent covering all TOC layers, through the <img src="../img/button/zoom-extent.jpg" class="ms-docbutton"/> button.

### Search for layers

With the TOC it is also possible to perform a search between the added layers. This operation can be done simply by typing the name (o part of it) of the layer in the search bar:

<img src="../img/toc/search.jpg" class="ms-docimage"  style="max-width:300px;"/>

### Choose layers and groups position

The user can decide to change the position of a *Layer* within the TOC by clicking on the layer's drag and drop icon <img src="../img/button/drag-drop-button.jpg" class="ms-docbutton"/>. <br>
It is possible to change the position of a layer within its group or move it into a different groups. Once this is done, also the order of the layer in the map changes accordingly. <br>
Below is an example of changing the layer position through the drag and drop function.

<video class="ms-docimage" controls><source src="../img/toc/ded-layers.mp4"/></video>

The same operation can also be done with any *Group* of layers.

<video class="ms-docimage" controls><source src="../img/toc/ded-groups.mp4"/></video>

Layers position can also be changed by clicking on the **Layer settings** button <img src="../img/button/properties.jpg" class="ms-docbutton"/> available in the toolbar. It appears once a layer is selected in TOC. This button opens a panel where the user can choose the destination group:

<img src="../img/toc/settings-group.jpg" class="ms-docimage"  style="max-width:350px;"/>

### Display options in panel

Directly from the TOC UI, the user can access different kind of display options. In particular, for layers, it is possible to:

<img src="../img/toc/layer-legend.jpg" class="ms-docimage"/>

* Enable/disable the layer visibility by using the check box to the left side of the layer leaf<img src="../img/button/check-box.jpg" class="ms-docbutton"/>

* Expand <img src="../img/button/expand-all-child-nodes.jpg" class="ms-docbutton"/> or collapse <img src="../img/button/collapse-all-child-nodes.jpg" class="ms-docbutton"/> the layer legend.

!!! note
    The WMS layer legend can dynamically update based on the [Filter](filtering-layers.md#filter-types) applied to the layer and/or the current map viewport if the **Dynamic legend** option is enabled in the [Layer Settings](layer-settings.md#display).

* Tune the layer transparency in map by scrolling the opacity slider.

For groups the user can instead:

<img src="../img/toc/group.jpg" class="ms-docimage" style="max-width:500px;"/>

* Expand <img src="../img/button/expand-all-child-nodes.jpg" class="ms-docbutton"/> or collapse <img src="../img/button/collapse-all-child-nodes.jpg" class="ms-docbutton"/> layers or groups inside.

* Enable/disable the group visibility by using the check box to the left of the group leaf <img src="../img/button/check-box.jpg" class="ms-docbutton"/>

!!! note
    When the user turns off the visibility of a group, the visibility in map of all layers and groups inside it changes accordingly but their original visibility state in TOC remain untouched; simply all nested elements are grayed out to indicate they are not visible on map and other functions (e.g. via context menu) remain available.

## Group Settings and Toolbar

Once a group is selected the following toolbar appears and the user can:

<img src="../img/toc/group-toolbar.jpg" class="ms-docimage"/>

* **Add layer to selected group** through the <img src="../img/button/add_layer_button.jpg" class="ms-docbutton"/> button (it is possible to add one or more layers to the group)

* **Add subgroup to the selected group** through the <img src="../img/button/add_group_button.jpg" class="ms-docbutton"/> button (it is possible to add one or more subgroups to the selected group)

* **Zoom to selected layers extent** in order to zoom the map to the extent covering all layers belonging to the given group, through the <img src="../img/button/zoom-layer.jpg" class="ms-docbutton"/> button

* Open the **Group settings** through the <img src="../img/button/properties.jpg" class="ms-docbutton"/> button: the *Settings* panel opens and the user can:<br>
  **-** Change the **Title**<br>
  **-** Set the translation of the group title by opening the **Localize Text** popup through the <img src="../img/button/localize_button.jpg" class="ms-docbutton"/> button. This way the language of the title changes according to the  current [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) language <br>
  **-** Edit the group's **Description**<br>
  **-** Configure the **Tooltip** that appears moving the cursor over the group's item in TOC. In this case the user can decide that the *Title*, the *Description*, both or nothing will be displayed. Moreover you can set the *Placement* of the tooltip, choosing between *Top*, *Right* or *Bottom*. In all circumstances the title is fully visible in TOC the tooltip doesn't appear.

<img src="../img/toc/group-settings-panel.jpg" class="ms-docimage"/>

* **Remove selected group** and its content through the <img src="../img/button/delete.jpg" class="ms-docbutton"/> button

By right clicking on a group, the user can change some properties of the group such as:

<video class="ms-docimage" controls><source src="../img/toc/group-settings-panel.mp4"/></video>

* Show all groups and layers present in the selected group, enabling the **Show all child nodes** through the <img src="../img/button/show-all-child-nodes.jpg" class="ms-docbutton"/> button.

* Hide all groups and layers present in the selected group, enabling the **Hide all child nodes** through the <img src="../img/button/hide-all-child-nodes.jpg" class="ms-docbutton"/> button.

* Activate a mutually exclusive visibility of groups and layers inside the selected group, enabling the **Activate mutually exclusive visibility of child nodes** through the <img src="../img/button/mutually-exclusive-visibility.jpg" class="ms-docbutton"/> button. In this way, only one layer or subgroup within it at a time can be visible on map.

* Collapse all groups present in the selected group, enabling the **Collapse all child nodes** through the <img src="../img/button/collapse-all-child-nodes.jpg" class="ms-docbutton"/> button.

* Expand all groups present in the selected group, enabling the  **Expand all child nodes** through the <img src="../img/button/expand-all-child-nodes.jpg" class="ms-docbutton"/> button. Each layer legend is also expanded.

* Add a subgroup under the selected group, through the <img src="../img/button/add-group.jpg" class="ms-docbutton"/> button.

* Zoom the map to the selected group layers extent, through the <img src="../img/button/zoom-extent.jpg" class="ms-docbutton"/> button.

* Remove the selected group, through the <img src="../img/button/remove-button.jpg" class="ms-docbutton"/> button.

## Layer Settings and Toolbar

Selecting a layer, the toolbar is the following one:

<img src="../img/toc/layer-toolbar.jpg" class="ms-docimage"/>

In this case the user is allowed to:

* **Zoom to selected layer extent** <img src="../img/button/zoom-layer.jpg" class="ms-docbutton"/>: in order to zoom the map to the layer's extent

* Access the selected [Layer Settings](layer-settings.md#layer-settings) <img src="../img/button/properties.jpg" class="ms-docbutton"/>

* [Set a Filter](filtering-layers.md#filtering-layers) for that layer <img src="../img/button/filter-layer.jpg" class="ms-docbutton"/>

* Access the [Attribute Table](attributes-table.md#attribute-table) <img src="../img/button/attributes-table.jpg" class="ms-docbutton"/>

* **Remove** the selected layer <img src="../img/button/delete.jpg" class="ms-docbutton"/>

* [Create Widgets](widgets.md#widgets) for the selected layer <img src="../img/button/widgets.jpg" class="ms-docbutton"/>

* [Export](export-data.md#export-layer-data) the data of the selected layer <img src="../img/button/export_data.jpg" class="ms-docbutton"/>

* Open the **Layer Metadata** <img src="../img/button/info_button.jpg" class="ms-docbutton"/> (if configured), to retrieve layer metadata from the remote catalog source.

<img src="../img/toc/layer_metadata_panel.jpg" class="ms-docimage" style="max-width:600px;"/>

!!! note
    The **Metadata Tool** is not configured by default in [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/). A complete documentation to configure it is available as part of the [TOC Plugins documentation](https://mapstore.geosolutionsgroup.com/mapstore/docs/api/plugins#plugins.TOC) (see *metadataOptions*). Once the **Metadata Tool** has been configured, MapStore is able to load the layer metadata from the remote CSW service and parse it to be presented to the user according to the provided plugin configuration. This functionality automatically works in case of WMS layers coming from a CSW catalog source, while for layers coming directly from a WMS catalog source the [Metadata Link](https://docs.geoserver.org/latest/en/user/data/webadmin/layers.html#basic-info) must be present in the WMS Layer GetCapabilities.

By right clicking on a layer, the user can manage some layer properties such as:

<video class="ms-docimage" controls><source src="../img/toc/layer-settings-panel.mp4"/></video>

* Zoom the map to the selected layer extent, through the <img src="../img/button/zoom-extent.jpg" class="ms-docbutton"/> button.

* Remove the selected layer, through the <img src="../img/button/remove-button.jpg" class="ms-docbutton"/> button.

* Enable the **Swipe** tool on the map for the selected layer, through the <img src="../img/button/swipe-button.jpg" class="ms-docbutton"/> button.

<img src="../img/toc/swipe_on_map.jpg" class="ms-docimage" style="max-width:600px;"/>

The user can change the orientation of the swipe from *Vertical* to *Horizontal* by clicking the <img src="../img/button/swipe-icon.jpg" class="ms-docbutton"/> button that appeared to the right of the layer title.

* Enable the **Spy glass** tool on the map for the selected layer, through the <img src="../img/button/syp-glass-button.jpg" class="ms-docbutton"/> button.

<img src="../img/toc/spy_on_map.jpg" class="ms-docimage" style="max-width:600px;"/>

The user can change the size of the spy glass (the `radius`) by clicking the <img src="../img/button/syp-glass-icon.jpg" class="ms-docbutton"/> button that appeared to the right of the layer title.
