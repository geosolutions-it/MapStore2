# Map Views

The **Map Views** is a [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) tool useful to set up multiple map views differently configured and switch between them. A navigation functionality is also provided to automatically activate each view one after the other in temporal sequence.

!!! note
     The *Map Views* plugin works both in 2D and 3D modes, but the 3D mode has advanced options including the *Mask*, the *Globe Translucency* and the *Clipping* (see next paragraph).

## Add new view

Once the user opens a map, the *Map Views* tools can be opened through the <img src="../img/button/map-views-button.jpg" class="ms-docbutton" /> button available in the [Side Toolbar](mapstore-toolbars.md#side-toolbar).

<img src="../img/map-views/map-views-panel.jpg" class="ms-docimage"/>

To create a new simple view the user can simply move the map to the interested area, enable the desired layers in TOC to be displayed in the map and finally click on the <img src="../img/button/+++.jpg" class="ms-docbutton" /> button. The view will be created and visible in the *Views* list by clicking the <img src="../img/button/timeline-layers-list-button.jpg" class="ms-docbutton" /> button.

<img src="../img/map-views/add-view.gif" class="ms-docimage"/>

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

* Choose which layer should be visible when the view is active through the **Layer Options** section. In 2D mode the user can simply enable or disable all the layers present on [TOC](toc.md#table-of-contents) and change the opacity.

<img src="../img/map-views/layer-options-tool.jpg" class="ms-docimage"/>

!!! warning
    In *2D mode*, the *3D Tiles* and the *Terrain* layers are not displayed in the *Layer Options*.

In *3D mode*, using the same logic described above for the Masking option, it is also possible to Clip (not Mask) each 3D Tiles or Terrain layers using a WFS or a vector layer as a clipping source. Furthermore, in this case the user can also choose which layer feature can be used as *Clipping feature*.

<img src="../img/map-views/clipping.gif" class="ms-docimage"/>

!!! warning
    The clipping layer must have polygon convex features. Concave polygons are not supported by this type of clipping.

!!! note
    Unlike the *Mask* option, described above, the *Clip function* is a more narrowly focused tool because:

    * The clipping are is visible only on the selected 3D Tiles layer and not on the whole view

    * It is possible to select the feature of the WFS or Vector layer that you want to use for the clipping

## 3D Views navigations

Once multiple views are added to the *Map Views* tool it allows to visualize them in sequence by clicking on the <img src="../img/button/timeline-play-button.jpg" class="ms-docbutton" /> button. Doing that the presentation mode starts and each view is displayed in the Map Viewer, together with its descriptive panel (if configured) on the left side of the screen, for a time depended on the duration previously configured.

<img src="../img/map-views/views-navigation.gif" class="ms-docimage"/>

The user can also choose to navigate each view manually using the navigation toolbar provided by the tool.

<img src="../img/map-views/views-navigation-toolbar.jpg" class="ms-docimage"/>

## Map View case studies

This chapter gives some examples of use cases of the *Map View* on projects planned in urban areas, indicating which data and which map view tools have been used for each case.

The urban renewal project of some areas of the city of Genoa is taken as an example and the use cases examined are:

* The overview of the area that includes the project we want highlight

* Two views of an urban project area to show a view highlight the current situation and a view of the area with the new project

* The view of an underground project

* The study of the land before and after an urbanization intervention

### Overview

In the case of a large-scale overview of new intervention projects, the following data are needed:

* the *3D Tiles* of the city
* the *Points layer* with the position of the projects (can be WFS or Vector layer)
* the *Mask layer* with the geometry of the projects

<img src="../img/map-views/.jpg" class="ms-docimage"/>

In this view the color of the *3D Tiles* is uniformed, in order to highlight the project areas of the *Mask layer*. For both layers a color is chosen using the *Fill Color* tool present in the [Visual Editor Style] of each layer.
The *Points layer* is used to add a label with the name of the projects through the *Text Rule* present in the [Visual Style Editor]

### Setting project

In this case there are two views:

1_The first view highlight the area and the current location of the waterfront project area with the following data:

* the *3D Tiles* of the city

* the *Mask layer* with the geometry of the project

<img src="../img/map-views/.jpg" class="ms-docimage"/>

For the construction of the view the *3D Tiles* of the city is used without adding color but the zoom on the project area is increased.

2_ The second view show the new project of the waterfront with the following data:

* the *3D Tiles* of the city

* the *Mask layer* with the geometry of the projects

* the *Model layer* a point layer with the position of the project

<img src="../img/map-views/.jpg" class="ms-docimage"/>

Here for the *Model Layer* a 3D model is added using the [3D Model] adjust tool present in the *Visual Editor Style* and a clipping mask is created with the [Mask] tool using the *Mask Layer*.

### Underwater

This project concerns the construction of an underwater tunnel. The *Map View*'s [Globe Transparency] tool is then used so that the 3D model of the tunnel is visible even if placed below sea level.The following dates are needed:

* the *3D Tiles* of the city

* the *Model layer* a point layer with the position of the project

<img src="../img/map-views/.jpg" class="ms-docimage"/>

Here for the *Model layer* a 3D model will be added using the [3D model] rule tool present in the *Visual Editor Style* and the globe transparency is enabled with the [Globe Translucency] tool.

### Intersection

The following dates are needed:

* the *3D Tiles* of the city

* the *Mask layer* with the geometry of the hill

* the *Model layer* a point layer with the position of the hill

<img src="../img/map-views/.jpg" class="ms-docimage"/>
