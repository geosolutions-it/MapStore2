# Sidebar
*********

The *Sidebar* is a navigation panel containing various elements that help the user to explore the map. In particular, it is possible zooming, changing the extent, navigating in 3D mode and querying objects on the map. 
Moreover, the following icon <img src="../img/button/collapse.jpg" class="ms-docbutton"/> is used to expand/collapse the sidebar.

<img src="../img/side-bar/sidebar.jpg" class="ms-docimage"/>

Geolocation tool
----------------

Trought the *Show my position* <img src="../img/button/geolocation.jpg" class="ms-docbutton"/> the user can center the map on his position. Therefore the button turns green. 

<img src="../img/side-bar/position.jpg" class="ms-docimage"/>

The position is still active even when the user interacts with the map; with a single click on the button it is possible re-center the map on his position. 
To desable the position the button needs to be duble clicked. 

Zooming tools
-------------

[MapStore](https://mapstore.geo-solutions.it/mapstore/#/) provides several tools allows the user to:

* **Increase** <img src="../img/button/zoom-in.jpg" class="ms-docbutton"/> the map zoom

* **Decrease** <img src="../img/button/zoom-out.jpg" class="ms-docbutton"/> the map zoom

* **Switch to full screen**  <img src="../img/button/full-screen.jpg" class="ms-docbutton"/> view

* **Go back** <img src="../img/button/back-extent.jpg" class="ms-docbutton"/> to the last change 

* **Go forward** <img src="../img/button/forward-extent.jpg" class="ms-docbutton"/> to the last change 

* **Zoom to the maximum extent** <img src="../img/button/max-extent.jpg" class="ms-docbutton"/> the map

3D Navigation
-------------

Based on CesiumJS, a **3D Navigator** <img src="../img/button/3D-icon.jpg" class="ms-docbutton"/> is implemented in [MapStore](https://mapstore.geo-solutions.it/mapstore/#/) that allows the user to display the map contents in 3D mode. In particularly the layers will be overlaid on the globe and it is possible to orbit around the globe trought the compass place in the upper right corner of the map.

<img src="../img/side-bar/3D-mode.jpg" class="ms-docimage"/>

## Identify Tool

Getting information about the layers, which have been loaded into the map, is possible thanks to the **Identify** button <img src="../img/button/identify.jpg" class="ms-docbutton"/>, through which the attribute table, where the characteristics of the layer are stored, is queried. 
The tool is active by default, as suggested by the green of the button. Therefore by clicking on a point on the level opens a modal window on the right side. On the window are dispalyed the requested information and the coordinates of the point.

<img src="../img/side-bar/identify-tool.jpg" class="ms-docimage"/>

The returned information are viewed in Text plain format by default. It is possible to change the format selecting the <img src="../img/button/setting_button.jpg" class="ms-docbutton"/> option in [Burger Menu](menu-bar.md#burger-menu) where the user can select, from the list menu *Identify response format*, three different formats: **TEXT**, **HTML** and **PROPERTIES**.

<img src="../img/side-bar/format-options.jpg" class="ms-docimage" style="max-width:400px;"/>

The information will be returned in the format chosen by the user. For exaple with *PROPERTIES* format as follows:

<img src="../img/side-bar/format_example.jpg" class="ms-docimage"/>

!!! warning
    This global settings could be overwritten by a layer-specific configuration (see [Feature Info Form](layer-settings.md#feature-info-form)).


In addition to the features, the following information is provided by the *Identify Tool*: 

* The **point address**  trought the *More Info* button  <img src="../img/button/more_info_icon.jpg" class="ms-docbutton"/>

<img src="../img/side-bar/more-info.jpg" class="ms-docimage"/>

* The **coordinates** <img src="../img/button/coordinates_editor_icon.jpg" class="ms-docbutton"/> of the point

<img src="../img/side-bar/coordinate.jpg" class="ms-docimage"/>

!!! note
    The point coordinates are viewed in **decimal** or **areonautical** format. It is possible to change the format by the *setting* button <img src="../img/button/gear_icon.jpg" class="ms-docbutton" style="max-heigth:50px;"/> 

* The **Highlight Features** <img src="../img/button/highlight_features_icon.jpg" class="ms-docbutton"/> highlights the resulting features. Using the <img src="../img/button/zoom-layer.jpg" class="ms-docbutton"/> button it is possible to zoom the highlighted feature.

<img src="../img/side-bar/hightlight-point1.gif" class="ms-docimage"/>

### Using the Coordinates Editor

 In order to search for features starting from their coordinates it is possible using the **Coordinate Editor**. The user might precisely query objects by entering their latitude and longitude.  

The point coordinates are searched in **decimal** or **areonautical** format. It is possible to change the format by the *setting* button <img src="../img/button/gear_icon.jpg" class="ms-docbutton" style="max-heigth:50px;"/> 

An example of search with `Decimal` coordinates as follows:

<img src="../img/side-bar/decimal-ex.gif" class="ms-docimage"  />

An example of search with `Aeronautical` coordinates as follows:

<img src="../img/side-bar/areonautical-ex.gif" class="ms-docimage"  style="max-width:700px;"/>
