# Sidebar
*********

The sidebar is a navigation panel containing various elements that help the user to explore the map. It incorporates tools for zooming, changing the extent, navigating in 3D mode and querying objects on the map. Moreover, the following icon <img src="../img/collapse.jpg" style="max-width:20px;"/> is used to expand/collapse the sidebar.

<img src="../img/side-bar-1.jpg" style="max-width:600px;" />

Geolocation tool
----------------

The Geolocation tool allows you to locate your real position on the map.

* **Click** on the *Locate me* icon <img src="../img/geolocation.jpg" style="max-width:20px;"/>. The icon will be highlighted in green and your position will be shown on the map.

  <img src="../img/position.jpg" style="max-width:500px;" />

Zooming tools
-------------

[MapStore](https://mapstore2.geo-solutions.it/mapstore/#/) provides several tools to zoom in and out, and to switch the map extent.

* You can increase the map zoom by using the zoom in icon <img src="../img/zoom-in.jpg" style="max-width:18px;"/>.

* You can decrease the map zoom by using the zoom out icon <img src="../img/zoom-out.jpg" style="max-width:18px;"/>.

* You can switch to full screen view <img src="../img/full-screen.jpg" style="max-width:18px;"/>.

* You can navigate through the extents used in a session by going back <img src="../img/back-extent.jpg" style="max-width:22px;"/> and forward <img src="../img/forward-extent.jpg" style="max-width:22px;"/> or to zoom to the maximum extent <img src="../img/max-extent.jpg" style="max-width:22px;"/>.

3D Navigation
-------------
Based on CesiumJS, a 3D Navigator is implemented in [MapStore](https://mapstore2.geo-solutions.it/mapstore/#/) that allows you to display the map contents in 3D mode, particularly the layers will be overlaid on the globe.

* **Open** a new map then **Add** a layer.
* **Click** on the 3D icon <img src="../img/3D-icon.jpg" style="max-width:22px;"/> in the *Sidebar*.

The scene will switch from 2D to 3D display mode and you will be guided by a brief tutorial that explain you how to interact with the map.

<img src="../img/3D-mode.jpg" style="max-width:600px;" />



Querying Objects
----------------

The Identify tool  <img src="../img/identify.jpg" style="max-width:22px;"/> allows you to intercat with the map by clicking on features to get information stored in the attribute table of the queried feature. It is active by default as the green color suggest.

* **Add** a layer to the map (e.g. USA Population).
* **Click** on a feature of the layer added previously. A pop-up page will open on the right showing the requested information and the coordinates of the point.

    <img src="../img/get-info.jpg" style="max-width:500px;" />

The returned information are viewed in Text plain format by default. In order to change it:

* **Navigate** into *Settings* from the main menu bar.

    <img src="../img/settings.jpg" style="max-width:500px;" />

* **Select** from the list menu *Identify response format* another format (e.g. HTML) then **Click** on a feature. The informations will be returned as HTML accordingly.

    <img src="../img/html-info.jpg" style="max-width:500px;" />