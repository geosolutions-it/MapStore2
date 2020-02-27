# Sidebar
*********

The sidebar is a navigation panel containing various elements that help the user to explore the map. It incorporates tools for zooming, changing the extent, navigating in 3D mode and querying objects on the map. Moreover, the following icon <img src="../img/button/collapse.jpg" class="ms-docbutton"/> is used to expand/collapse the sidebar.

<img src="../img/side-bar/side-bar-1.jpg" class="ms-docimage"/>

Geolocation tool
----------------

The Geolocation tool allows you to locate your real position on the map.

* **Click** on the *Locate me* icon <img src="../img/button/geolocation.jpg" class="ms-docbutton"/>. The icon will be highlighted in green and your position will be shown on the map.

<img src="../img/side-bar/position.jpg" class="ms-docimage"/>

Zooming tools
-------------

[MapStore](https://mapstore.geo-solutions.it/mapstore/#/) provides several tools to zoom in and out, and to switch the map extent.

* You can increase the map zoom by using the zoom in icon <img src="../img/button/zoom-in.jpg" class="ms-docbutton"/>.

* You can decrease the map zoom by using the zoom out icon <img src="../img/button/zoom-out.jpg" class="ms-docbutton"/>.

* You can switch to full screen view <img src="../img/button/full-screen.jpg" class="ms-docbutton"/>.

* You can navigate through the extents used in a session by going back <img src="../img/button/back-extent.jpg" class="ms-docbutton"/> and forward <img src="../img/button/forward-extent.jpg" class="ms-docbutton"/> or to zoom to the maximum extent <img src="../img/button/max-extent.jpg" class="ms-docbutton"/>.

3D Navigation
-------------

Based on CesiumJS, a 3D Navigator is implemented in [MapStore](https://mapstore.geo-solutions.it/mapstore/#/) that allows you to display the map contents in 3D mode, particularly the layers will be overlaid on the globe.

* **Open** a new map then **Add** a layer.

* **Click** on the 3D icon <img src="../img/button/3D-icon.jpg" class="ms-docbutton"/> in the *Sidebar*.

The scene will switch from 2D to 3D display mode and you will be guided by a brief tutorial that explain you how to interact with the map.

<img src="../img/side-bar/3D-mode.jpg" class="ms-docimage"/>

## Identify Tool

The Identify tool  <img src="../img/button/identify.jpg" class="ms-docbutton"/> allows you to interact with the map by clicking on features to get information stored in the attribute table of the queried feature. It is active by default as the green color suggests.

* **Add** a layer to the map (e.g. USA Population).

* **Click** on a feature of the layer added previously. A pop-up page will open on the right showing the requested information and the coordinates of the point.

<img src="../img/side-bar/get_feature_info.jpg" class="ms-docimage"/>

The returned information are viewed in Text plain format by default. In order to change it:

* **Navigate** into *Settings* from the main menu bar.

<img src="../img/side-bar/settings.jpg" class="ms-docimage"/>

* **Select** from the list menu *Identify response format* another format (e.g. HTML) then **Click** on a feature.

<img src="../img/side-bar/info_formats.jpg" class="ms-docimage" style="max-width:500px;"/>

* The informations will be returned as HTML accordingly.

<img src="../img/side-bar/html_info.jpg" class="ms-docimage"/>

!!! warning
    This global settings could be overwritten by a layer-specific configuration (see [Feature Info Form](layer-settings.md#feature-info-form)).

Below the point coordinates there are three icons:

* **More Info** <img src="../img/button/more_info_icon.jpg" class="ms-docbutton"/> shows a popup window displaying the point address.

<img src="../img/side-bar/more_info.jpg" class="ms-docimage"/>

* **Coordinates Editor** <img src="../img/button/coordinates_editor_icon.jpg" class="ms-docbutton"/> makes available a tool to perform queries using decimal or aeronautical coordinates (we will explain more in depth this tool in the next paragraph).

* **Highlight Features** <img src="../img/button/highlight_features_icon.jpg" class="ms-docbutton"/> highlights the resulting features.

<img src="../img/side-bar/highlight_features.jpg" class="ms-docimage"/>

Using the <img src="../img/button/zoom-layer.jpg" class="ms-docbutton"/> button it is possible to zoom the highlighted feature.

### Using the Coordinates Editor

You might want to search features starting from their coordinates. The **Coordinates Editor** helps you to have more precision than just clicking on the map, so you can query objects by directly typing in their latitude and longitude.

You can choose between `Decimal` coordinates:

<img src="../img/side-bar/decimal_coordinates_editor.gif" class="ms-docimage"  style="max-width:700px;"/>

and `Aeronautical` coordinates:

<img src="../img/side-bar/aeronautical_coordinates_editor.gif" class="ms-docimage"  style="max-width:700px;"/>
