# Navigation Toolbar

*********

The *Navigation Toolbar* is a navigation panel containing various elements that help the user to explore the map. In particular, it is possible zooming, changing the extent, navigating in 3D mode and querying objects on the map.
Moreover, the following icon <img src="../img/button/collapse.jpg" class="ms-docbutton"/> is used to expand/collapse the navigation toolbar.

<img src="../img/navigation-toolbar/sidebar.jpg" class="ms-docimage"/>

## Geolocation tool

Through the *Show my position* <img src="../img/button/geolocation.jpg" class="ms-docbutton"/> the user can center the map on his position. Therefore the button turns green.

<img src="../img/navigation-toolbar/position.jpg" class="ms-docimage"/>

The position is still active even when the user interacts with the map; with a single click on the button it is possible re-center the map on his position.
To disable the position the button needs to be duble clicked.

## Zooming tools

[MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) provides several tools allows the user to:

* **Increase** the map zoom by using the zoom in icon <img src="../img/button/zoom-in.jpg" class="ms-docbutton"/>

* **Decrease** the map zoom by using the zoom out icon <img src="../img/button/zoom-out.jpg" class="ms-docbutton"/>

* **Switch to full screen**  <img src="../img/button/full-screen.jpg" class="ms-docbutton"/> view

* **Go back** <img src="../img/button/back-extent.jpg" class="ms-docbutton"/> to the previous map extent in the map navigation history

* **Go forward** <img src="../img/button/forward-extent.jpg" class="ms-docbutton"/> to the next map extent in the map navigation history

* **Zoom to the maximum extent** <img src="../img/button/max-extent.jpg" class="ms-docbutton"/> the map

## 3D Navigation

The *3D navigation* in [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) is based on CesiumJS. If the 3D button <img src="../img/button/3D-icon.jpg" class="ms-docbutton"/> in the *Navigation Toolbar* is clicked, the map switch in 3D mode so map contents are displayed on a 3D globe and it is possible to orbit around it through the compass place in the upper right corner of the map.

<img src="../img/navigation-toolbar/3D-mode.jpg" class="ms-docimage"/>

!!! note
    The *3D mode* in MapStore support also the rendering **3D Tiles** layers once they are added through the *Catalog tool* as explained [here](catalog.md#3d-tiles-catalog).

## Identify Tool

The *Identify* tool <img src="../img/button/identify.jpg" class="ms-docbutton"/> allows to retrieve information about layers on the map.
The tool is active by default (the button is green). Therefore if the user click on a layer in the map, the identify panel opens containing the layers information corresponding to the clicked point in the map (also the coordinates of the clicked point are reported in the identify panel).

<img src="../img/navigation-toolbar/identify-tool.jpg" class="ms-docimage"/>

The layers information are reported in plain text by default. It is possible to change the format by selecting the <img src="../img/button/settings2.jpg" class="ms-docbutton"/> button in [Side Toolbar](mapstore-toolbars.md#side-toolbar) where the user can select, through the *Identify response format* menu, three different formats like: **TEXT**, **HTML** and **PROPERTIES**.

<img src="../img/navigation-toolbar/format-options.jpg" class="ms-docimage" style="max-width:400px;"/>

The information will be returned in the format chosen by the user. For exaple with *PROPERTIES* format as follows:

<img src="../img/navigation-toolbar/format_example.jpg" class="ms-docimage"/>

!!! warning
    This global settings could be overwritten by a layer-specific configuration (see [Feature Info Form](layer-settings.md#feature-info-form)).

In addition to the layers information, the following are provided by the *Identify Tool*:

* The **point address**  through the *More Info* button  <img src="../img/button/more_info_icon.jpg" class="ms-docbutton"/>

<img src="../img/navigation-toolbar/more-info.jpg" class="ms-docimage"/>

* The **coordinates** <img src="../img/button/coordinates_editor_icon.jpg" class="ms-docbutton"/> of the point

<img src="../img/navigation-toolbar/coordinate.jpg" class="ms-docimage"/>

!!! note
    The point coordinates are visualized in **decimal** or **areonautical** format. It is possible to change the format by the *setting* button <img src="../img/button/gear_icon.jpg" class="ms-docbutton" style="max-heigth:50px;"/>

* The **Highlight Features** button <img src="../img/button/highlight_features_icon.jpg" class="ms-docbutton"/> allows to highlights on the map the layers features corresponding to the retrieved information in the clicked point.

<video class="ms-docimage" controls><source src="../img/navigation-toolbar/hightlight-point1.mp4"/></video>

* The **Edit** button <img src="../img/button/edit_button.jpg" class="ms-docbutton"/> allows the user to open the [Attribute Table](attributes-table.md)  in edit mode showing only layers records corresponding to the clicked point on the map.

<video class="ms-docimage" controls><source src="../img/navigation-toolbar/edit_identify.mp4"/></video>

### Using the Coordinates Editor

In order to Identify layers features by typing coordinates instead of clicking on the map, you can use the **Coordinate Editor**.

The coordinates can be in **decimal** or **areonautical** format depending on the user needs. It is possible to change the format by the *setting* button <img src="../img/button/gear_icon.jpg" class="ms-docbutton" style="max-heigth:50px;"/>

An example of search with `Decimal` coordinates as follows:

<video class="ms-docimage"   controls><source src="../img/navigation-toolbar/decimal-ex.mp4"/></video>

An example of search with `Aeronautical` coordinates as follows:

<video class="ms-docimage"  style="max-width:700px;" controls><source src="../img/navigation-toolbar/areonautical-ex.mp4"/></video>

### Identify Tool with more than one layer

In a map it is possible to have several overlapping layers. With the *Identify* tool the user can retrieve information on one or more overlapping layers at the same time in a certain point.

If the user clicks on the map where one or more overlapping layers are present, the identify panel opens. The panel provides the layers information, therefore the user can navigate different layers information from the **layer select** drop-down menu where the layer options have been sorted as in *TOC*.

<img src="../img/navigation-toolbar/layers.jpg" class="ms-docimage"/>

In order to have information about one layer only the user can select the layer on the [Table of Contents](toc.md#table-of-contents), through the *TOC* button <img src="../img/button/show-layers.jpg" class="ms-docbutton"/>, and then click on the layer in the map to perform the identify operation only for that selected layer in TOC. The identify panel opens containing the layer information corresponding to the clicked point in the map, as follows:

<video class="ms-docimage" controls><source src="../img/navigation-toolbar/layer.mp4"/></video>

### Floating Identify Tool

In [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) the user can set the Identify tool in floating mode (**Floating Identify tool**) instead of having the default one available through a click on the map. In that case an identify popup will appears on the map as soon as the user hover over a layer in the map.

In order to activate the *Floating Identify Tool* the user can select the  <img src="../img/button/settings2.jpg" class="ms-docbutton"/> button in [Side Toolbar](mapstore-toolbars.md#side-toolbar). Here he can select the **Hover** option through the *Trigger event for Identify* dropdown menu.

<img src="../img/navigation-toolbar/setting-hover.jpg" class="ms-docimage"/>

As soon as the option *Hover* is selected, the user can hover the mouse over a layer in the map in order to show the popup containing the identify information.

<video class="ms-docimage" controls><source src="../img/navigation-toolbar/hover-over-map.mp4"/></video>
