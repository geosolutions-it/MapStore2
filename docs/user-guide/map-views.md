# Map Views

The **Map Views** is a [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) tool useful to configure multiple views differently configured and switch between. A navigation functionality is also provided to automatically activate each view one after the other in temporal sequence.

!!! note
    The *Map views* works in both 2D and 3D modes, but the 3D mode has advanced options including the *Mask*, the *Globe Translucency* and the *Clipping* (see next paragraph).

## Add new view

Once the user opens a map, the *Map Views* tools can be open through the <img src="../img/button/map-views-button.jpg" class="ms-docbutton" /> button available in the [Side Toolbar](mapstore-toolbars.md#side-toolbar).

<img src="../img/map-views/map-views-panel.jpg" class="ms-docimage"/>

To create a new simple view the user can simply move the map to the interested area, enable the desired layers in TOC to be displayed in the map and finally click on the <img src="../img/button/+++.jpg" class="ms-docbutton" /> button. The view will be created and visible in the *Views* list by clicking the <img src="../img/button/timeline-layers-list-button.jpg" class="ms-docbutton" /> button.

<img src="../img/map-views/add-view.gif" class="ms-docimage"/>

[MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) allows to customize and edit the new view by opening the Edit panel through the <img src="../img/button/editing-button.jpg" class="ms-docbutton" /> button. Here the user is allowed to:

* Add a text, images, videos or hyperlinks by clicking **Description** section. The *description* is visible during the [Views Navigation](map-views.md#3d-views-navigations). Take a look at the following example.

<img src="../img/map-views/description.jpg" class="ms-docimage"/>

* *Capture the view positions* through the <img src="../img/button/capture-view-position-button.jpg" class="ms-docbutton" /> button or change the longitude, latitude and height of the *Camera Position* and *Center Position*  (only available for the *3D* mode) by clicking on **Position** section.

<img src="../img/map-views/position.jpg" class="ms-docimage"/>

* Modify the duration of the animation and enable/disable the transition during the [Views Navigation](map-views.md#3d-views-navigations) by clicking on **Animation** section.

<img src="../img/map-views/animation.jpg" class="ms-docimage"/>

* Select a WFS or Vector layer available in the map to create a mask on all the 3D tiles visible in the map by clicking **Mask** section. The WFS or Vector layer is added to the map by the user and then used the layers features in a transparent way to create the clipping area.

<img src="../img/map-views/mask-panel.jpg" class="ms-docimage"/>

If the user enables the **Inverse** option, a hole is created inside the 3D Tile layers. This hole can be filled by only 3D objects (3D Tiles cannot be used to fill these holes because all 3D tiles will be masked).

<img src="../img/map-views/mask-inverse.jpg" class="ms-docimage"/>

If the user disables the **Inverse** option the clipping style is used for the view, then the selected WFS layer masks the 3D Tile layers outside its polygon.

<img src="../img/map-views/mask.jpg" class="ms-docimage"/>

* Enable the translucency of the globe in **Globe Translucency** section so that it is possible to see layers beneath the globe's surface.

<img src="../img/map-views/translucency.jpg" class="ms-docimage"/>

* Customize the layer present on the view by clicking **Layer Options** section. The user can simply enable or disable all the layers present on [TOC](toc.md#table-of-contents) and change the opacity of the layer.

<img src="../img/map-views/layer-options-tool.jpg" class="ms-docimage"/>

!!! warning
    In the *2D mode*, the *3D Tiles* layer and the *Terrain* are not displayed in the *Layer Options*.

For the *3D mode*, it is also possible to clip each layer of 3D tiles using another layer. For this operation, the user can select a WFS or Vector layer available in the map from the *Clipping layer source* dropdown menu and choose a *Clipping feature* of the layer from the dropdown list where the hole on the 3D Tiles will be created.

<img src="../img/map-views/clipping.gif" class="ms-docimage"/>

!!! warning
    The WFS layer can be only polygon feature and concave polygon are not supported by this type of clipping, only convex layers can be used from this purpose.

!!! note
    Unlike the *Mask* option, described above, the *Clipping* area is a more narrowly focused tool because:

    * The clipping are is visible only on the selected 3D Tiles layer and not on the whole view

    * It is possible, using the *Clip function*, to select the feature of the WFS or Vector layer's attribute table that you want to use to do the clipping

## 3D Views navigations

Once multiple views are added to the *Map Views* tool it allows to visualize them in sequence by clicking on the <img src="../img/button/timeline-play-button.jpg" class="ms-docbutton" /> button. Doing that the presentation mode starts and each view is displayed in the Map Viewer, together with its descriptive panel (if configured) on the left side of the screen, for a time depended on the duration previously configured.

<img src="../img/map-views/views-navigation.gif" class="ms-docimage"/>

The user can also choose to navigate each view manually using the navigation toolbar provided by the tool.

<img src="../img/map-views/views-navigation-toolbar.jpg" class="ms-docimage"/>
