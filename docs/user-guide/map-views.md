# Map Views

The **Map Views** is a [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) tool useful to configure multiple views and switch between them with navigation tool.

!!! note
    The *Map views* works in both 2D and 3D modes, but the 3D mode has advanced options including the *Mask*, the *Globe Transluncency* and the *Clipping* (as we will see in the next paragraph).

## Add new view

Once the user opens a map, in [3D Mode](navigation-toolbar.md#3d-navigation), the *Map Views* tools can be open through the <img src="../img/button/map-views-button.jpg" class="ms-docbutton" /> button available in the [Side Toolbar](mapstore-toolbars.md#side-toolbar).

<img src="../img/map-views/map-views-panel.jpg" class="ms-docimage"/>

To create a new view, the user can, using the compass located in the upper right corner of the map, highlight a specific area on the map, enable the layers, on TOC, to be displayed in the map and finally click on the <img src="../img/button/+++.jpg" class="ms-docbutton" />. This view will be visible in the *Views* list by clicking the <img src="../img/button/timeline-layers-list-button.jpg" class="ms-docbutton" /> button.

<img src="../img/map-views/add-view.gif" class="ms-docimage"/>

[MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) allows to customize and edit the new view by opening the Edit panel through the <img src="../img/button/editing-button.jpg" class="ms-docbutton" /> button. Here the user is allowed to:

* Add a text, images, videos or hyperlinks by clicking **Description** section. The *description* is visible during the [Views Navigation](map-views.md#3d-views-navigations). Take a look at the following example.

<img src="../img/map-views/description.jpg" class="ms-docimage"/>

* Change the longitude, latitude and height of the *Camera Position* and *Center Position* by clicking on **Position** section.

<img src="../img/map-views/position.jpg" class="ms-docimage"/>

* Modify the duration of the animation and enable/disable the transition during the [Views Navigation](map-views.md#3d-views-navigations) by clicking on **Animation** section.

<img src="../img/map-views/animation.jpg" class="ms-docimage"/>

* Select a WFS or Vector layer available in the map to create a mask on on all the 3D tiles visible in the map by clicking **Mask** section. The WFS or Vector layer is added to the map by the user and then used in a transparent way to create the clipping area.

<img src="../img/map-views/mask-panel.jpg" class="ms-docimage"/>

If the user enables the **Inverse** option, a hole is created inside the 3D Tile layers. This hole can be filled by only 3D objects (3D Tiles cannot be used to fill these holes because all 3D tiles will be masked).

<img src="../img/map-views/mask-inverse.jpg" class="ms-docimage"/>

If the user disables the **Inverse** option the clipping style is used for the view, then the selected WFS layer masks the 3D Tile layers outside its polygon.

<img src="../img/map-views/mask.jpg" class="ms-docimage"/>

* Enable the translucency by clicking **Globe Translucency** section to view layers located below sea level.

<img src="../img/map-views/translucency.jpg" class="ms-docimage"/>

* Customize the layer present on the view by clicking **Layer Options** section. The user can simply enable or disable all the layers present on [TOC](toc.md#table-of-contents) and change the opacity of the layer or clipping for each 3D Tiles layer and are using another layer.
For this operation, the user can select a WFS or Vector layer available in the map from the *Clipping layer source* dropdown menu and choose a *Clipping feature* of the layer from the dropdown list where the hole on the 3D Tiles will be created.

<img src="../img/map-views/clipping.gif" class="ms-docimage"/>

!!! warning
    The WFS layer can be only polygon feature and concave polygon are not supported by this type of clipping, only convex layers can be used from this purpose.

!!! note
    Unlike the *Mask* option described above, the *Clipping* area is visible only on the selected 3D Tiles layer and not on the whole view, and it is possible, using the *Clip function*, to select the feature of the WFS or Vector layer's attribute table that you want to use to do the clipping.

## 3D Views navigations

Once multiple views are added to the *Map Views* tool, [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) allows to visualize them in sequence. By clicking on the <img src="../img/button/timeline-play-button.jpg" class="ms-docbutton" /> button, each view is displayed in the Map Viewer, with the previously set duration, and the description panel on the left side of the screen.

<img src="../img/map-views/views-navigation.gif" class="ms-docimage"/>

The user can also pause navigation or go back and forth in viewing views thanks to the navigation toolbar.

<img src="../img/map-views/views-navigation-toolbar.jpg" class="ms-docimage"/>
