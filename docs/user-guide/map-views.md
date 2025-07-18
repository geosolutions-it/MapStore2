# Map Views

The **Map Views** is a [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) tool useful to set up multiple map views differently configured and switch between them. A navigation functionality is also provided to automatically activate each view one after the other in temporal sequence.

!!! note
     The *Map Views* plugin works both in 2D and 3D modes, but the 3D mode has advanced options including the *Mask*, the *Globe Translucency* and the *Clipping* (see next paragraph).

## Add new view

Once the user opens a map, the *Map Views* tools can be opened through the <img src="../img/button/map-views-button.jpg" class="ms-docbutton" /> button available in the [Side Toolbar](mapstore-toolbars.md#side-toolbar).

<img src="../img/map-views/map-views-panel.jpg" class="ms-docimage"/>

To create a new simple view the user can simply move the map to the interested area, enable the desired layers in TOC to be displayed in the map and finally click on the <img src="../img/button/+++.jpg" class="ms-docbutton" /> button. The view will be created and visible in the *Views* list by clicking the <img src="../img/button/timeline-layers-list-button.jpg" class="ms-docbutton" /> button.

<video class="ms-docimage" controls><source src="../img/map-views/add-view.mp4"/></video>

[MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) allows to customize and edit the new view by opening the Edit panel through the <img src="../img/button/editing-button.jpg" class="ms-docbutton" /> button. Here the user is allowed to:

* Add a text, images, videos or hyperlinks through the **Description** section. The *description* is visible during the [Views Navigation](map-views.md#3d-views-navigations). Take a look at the following example.

<img src="../img/map-views/description.jpg" class="ms-docimage"/>

* *Capture the view positions* through the <img src="../img/button/capture-view-position-button.jpg" class="ms-docbutton" /> button or change the longitude, latitude and height of the *Camera Position* and *Center Position*  (only available for the *3D* mode) by using the **Position** section.

<img src="../img/map-views/position.jpg" class="ms-docimage"/>

* Modify the duration of the animation and enable/disable the transition effect during the [Views Navigation](map-views.md#3d-views-navigations) by using the **Animation** section.

<img src="../img/map-views/animation.jpg" class="ms-docimage"/>

* When in 3D mode, use the **Mask** section to select a WFS or Vector layer available in TOC to create a mask on all the 3D tiles visible in map. The mask layer need to be added to the map before using this functionality so that it is possible to use the layer features as masking areas: if multiple WFS or Vector layers (with polygonal features) are present in the map, these are used all merged together to represent the final masking areas.

<img src="../img/map-views/mask-panel.jpg" class="ms-docimage"/>

If the user enables the **Inverse** option, simply the inverse mask is applied using the same layer so that each feature is used to produce an hole on all visible 3D Tiles.

<img src="../img/map-views/mask-inverse.jpg" class="ms-docimage"/>

* Enable the translucency of the globe through **Globe Translucency** section so that it is possible to see layers under the globe's surface.

<img src="../img/map-views/translucency.jpg" class="ms-docimage"/>

* Manage layers through the **Layer Options** section. All the layers listed in the [TOC](toc.md#table-of-contents) are available in this section. The user can:

<img src="../img/map-views/layer-options-tool.jpg" class="ms-docimage"/>

* Search for a specific layer using the search tool.

* Enable synchronization of layer and group visibility and opacity with the main *TOC* by clicking the <img src="../img/button/enable-synch-toc.jpg" class="ms-docbutton" /> button.

* Disable synchronization of layer and group visibility and opacity with the main *TOC* by clicking the <img src="../img/button/disable-synch-toc.jpg" class="ms-docbutton" /> button.

* Show all groups and layers present in the TOC by enabling the **Show all child nodes** through the <img src="../img/button/show-all-child-nodes.jpg" class="ms-docbutton"/> button.

* Hide all groups and layers present in the TOC by enabling the **Hide all child nodes** through the <img src="../img/button/hide-all-child-nodes.jpg" class="ms-docbutton"/> button.

* Collapse all groups present in the TOC by enabling the **Collapse all child nodes** through the <img src="../img/button/collapse-all-child-nodes.jpg" class="ms-docbutton"/> button.

* Expand all groups present in the TOC by enabling the  **Expand all child nodes** through the <img src="../img/button/expand-all-child-nodes.jpg" class="ms-docbutton"/> button. Each layer legend is also expanded.

* Tune the layer transparency in map by scrolling the opacity slider.

* Enable or disable visibility synchronization of a specific layer or group with the main *TOC* by clicking the <img src="../img/button/synch-toc-layer.jpg" class="ms-docbutton" /> button to the right of each layer/group.

!!! warning
    In *2D mode*, the *3D Tiles* and the *Terrain* layers are not displayed in the *Layer Options*.

In *3D mode*, using the same logic described above for the Masking option, it is also possible to Clip (not Mask) each 3D Tiles or Terrain layers using a WFS or a vector layer as a clipping source. Furthermore, in this case the user can also choose which layer feature can be used as *Clipping feature*.

<video class="ms-docimage" controls><source src="../img/map-views/clipping.mp4"/></video>

!!! warning
    The clipping layer must have polygon convex features. Concave polygons are not supported by this type of clipping.

!!! note
    Unlike the *Mask* option, described above, the *Clip function* is a more narrowly focused tool because:

    * The clipping are is visible only on the selected 3D Tiles layer and not on the whole view

    * It is possible to select the feature of the WFS or Vector layer that you want to use for the clipping

## 3D Views navigations

Once multiple views are added to the *Map Views* tool it allows to visualize them in sequence by clicking on the <img src="../img/button/timeline-play-button.jpg" class="ms-docbutton" /> button. Doing that the presentation mode starts and each view is displayed in the Map Viewer, together with its descriptive panel (if configured) on the left side of the screen, for a time depended on the duration previously configured.

<video class="ms-docimage" controls><source src="../img/map-views/views-navigation.mp4"/></video>

The user can also choose to navigate each view manually using the navigation toolbar provided by the tool.

<img src="../img/map-views/views-navigation-toolbar.jpg" class="ms-docimage"/>
