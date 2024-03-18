# Annotations

[MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) lets you enrich the map with special features which expose additional information, mark particular position on the map and so on.
Those features make up the so-called **Annotations** layers.

Within the map viewer,  the editor can access the **Annotations** <img src="../img/button/annotations2.jpg" class="ms-docbutton" style="max-height:30px;"/> tool button from the [TOC](toc.md) <img src="../img/button/show-layers.jpg" class="ms-docbutton" style="max-height:30px;"/> panel on the top-left corner of the map viewer.

<img src="../img/annotations/annotations_on_toc.jpg" class="ms-docimage" style="max-width:500px;" />

 The annotation panel will open and the editor can insert a **Title** (required) and a **Description** (optional).

<img src="../img/annotations/annotation_tool.jpg" class="ms-docimage" style="max-width:500px;" />

From the *Geometries* tab, the editor can choose between five different types of **Geometries**:

* **Marker** <img src="../img/button/marker2.jpg" class="ms-docbutton" />
* **Line** <img src="../img/button/line2.jpg" class="ms-docbutton" />
* **Polygon** <img src="../img/button/polygon2.jpg" class="ms-docbutton" />
* **Text** <img src="../img/button/text2.jpg" class="ms-docbutton" />
* **Circle** <img src="../img/button/circle2.jpg" class="ms-docbutton" />

<img src="../img/annotations/geometries-tab.jpg" class="ms-docimage"  style="max-width:500px;"/>

After selecting a geometry type, the editor can:

* Draw a *Geometry* on the map.

<video class="ms-docimage" style="max-width:700px;"controls><source src="../img/annotations/line_annotation_drawing.mp4" ></video>

* Enter the vertices of the geometry or modify the existing ones through the **Coordinates editor** using `Decimal` or `Aeronautical` formats.

<video class="ms-docimage" style="max-width:700px;" controls><source src="../img/annotations/coordinates_format_switcher.mp4" ></video>

* For *Line* and *Polygon*, add new vertices using the <img src="../img/button/++.jpg" class="ms-docbutton" /> button and typing the `latitude` and `longitude` values.

<video class="ms-docimage" style="max-width:700px;"controls><source src="../img/annotations/add_vertex_button.mp4" ></video>

!!! note
    If the vertices are invalid, they are notified with a red exclamation point and the geometry field is outlined in red.
    <img src="../img/annotations/invalid_vertex.jpg" class="ms-docimage" style="max-width:500px;" />
    In this case, it is not possible to save the annotation, as follows:
    <video class="ms-docimage" style="max-width:500px;" controls><source src="../img/annotations/invalid_vertex2.mp4" ></video>

* Customize the **Style** of the annotation, as explained in the following paragraph.

For each geometry created, the editor can perform the following operations:

* **Zoom** to the annotation geometry on map through the <img src="../img/button/zoom_button.jpg" class="ms-docbutton" /> button

* **Delete** the geometry annotation through the <img src="../img/button/delete_button.jpg" class="ms-docbutton" /> button

Once all the geometries have been created, the editor can return to the [TOC](toc.md) by clicking the <img src="../img/button/x2.jpg" class="ms-docbutton" /> button. A new annotation layer will appear here.

<img src="../img/annotations/annotation2.jpg" class="ms-docimage" />

From the [TOC](toc.md), the *Annotations toolbar* allows the user to:

<img src="../img/annotations/annotation3.jpg" class="ms-docimage" />

* **Delete** the annotation through the <img src="../img/button/delete_button.jpg" class="ms-docbutton" /> button

* Enable the [**Compare tool**](toc.md#toolbar-options) through the <img src="../img/button/compare_tool_button.jpg" class="ms-docbutton" /> button

* **Edit** the annotation through the <img src="../img/button/edit_button.jpg" class="ms-docbutton" /> button

* **Download** the annotation through the <img src="../img/button/download_annotation_button.jpg" class="ms-docbutton" /> button

## Styling Annotations

Based on which type of annotation was chosen, [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) allows you to customize the annotation style through a powerful editor. It is accessible from the *Style* tab of the annotation viewer.

<img src="../img/annotations/annotations_toolbar.jpg" class="ms-docimage" style="max-width:500px;"/>

***Marker***

MapStore provides different *Marker* annotation style:

* The *Mark* types: clicking on the <img src="../img/button/add_mark_button.jpg" class="ms-docbutton"/> button, a mark panel appears.

<img src="../img/annotations/marker_type_selection.jpg" class="ms-docimage" style="max-width:500px;"/>

The mark can have different `Shape`, `Color`, `Stroke` with different `Color`, `Width` and `Style` and customizable `Radius` and `Rotation`. Take a look at the following example.

<img src="../img/annotations/marker_style_editor.jpg" class="ms-docimage" style="max-width:500px;"/>

* The *Icon* types: clicking on the <img src="../img/button/add_icon_button.jpg" class="ms-docbutton"/> button, an icon panel appears.
The icon can have different `Image`. Clicking on it, the user can choose a *Marker* and a *Glyph*, as follows:

<video class="ms-docimage" controls><source src="../img/annotations/icon_style_editor.mp4" ></video>

The icon is also customizable with different `Opacity`, `Size`, `Rotation` and `Anchor point`.

***Line***

*Line* annotations, have customizable `Stroke` with different `Color`, `Width` and `Style` and different `Line cap` (*Butt*, *Round*, *Square*) and the `Line join` (*Bevel*, *Round*, *Miter*). Take a look at the following example.

<img src="../img/annotations/polyline_style_editor.jpg" class="ms-docimage" style="max-width:500px;"/>

The line is also customizable by clicking the mark <img src="../img/button/add_mark_button.jpg" class="ms-docbutton"/> button or the icon <img src="../img/button/add_icon_button.jpg" class="ms-docbutton"/> button and choose *Start Point*, *Center* or *End Point* from the `Geometry transformation` option.

<video class="ms-docimage" controls><source src="../img/annotations/start_point_option.mp4" ></video>

***Polygon***

*Polygon* annotations, can have different `Fill` color and `Outline` with different `Color`, `Width` and `Style`. Take a look at the following example.

<img src="../img/annotations/polygon_style_editor.jpg" class="ms-docimage" style="max-width:500px;"/>

Also for the polygon is possible to add a *Mark* <img src="../img/button/add_mark_button.jpg" class="ms-docbutton"/> and an *Icon* <img src="../img/button/add_icon_button.jpg" class="ms-docbutton"/>.

***Text***

*Text* annotations are a bit different from the geometric ones. They display a formatted text on a given point of the map the user can customize the `Font Family` (*DejaVu Sans*, *Serif*, etc), choose the font `Color`, `Size`, `Style` (*Normal* or *Italic*) and `Halo weight` (*Normal* or *Bold*) and select the desired `Anchor point`(*Center*, *Bottom left*, etc), `Halo color` and `Halo weight`. It is also possible to choose the text `Rotation` and `Offset` (*x* and *y*). En example can be the following one

<img src="../img/annotations/text_annotation_editor.jpg" class="ms-docimage" style="max-width:500px;"/>

***Circle***

*Circle* annotations, can have different `Color` color and `Outline` with different `Color`, `Width` and `Style`. Take a look at the following example.

<img src="../img/annotations/circle_style_editor.jpg" class="ms-docimage" style="max-width:500px;"/>

The *Center* can be also customized adding a *Mark* <img src="../img/button/add_mark_button.jpg" class="ms-docbutton"/> or an *Icon* <img src="../img/button/add_icon_button.jpg" class="ms-docbutton"/>.

## Settings Annotations

Once all the *Geometries* have been created, the user can enable the **Visibility limits** clicking on the *Settings* tab.

<img src="../img/annotations/settings_tab.jpg" class="ms-docimage" style="max-width:500px;" />

The **Visibility limits** allow the annotation to be displayed only within certain scale limits. The user can set the *Max value* and the *Min value* and select the *Limits type* choosing between `Scale` or `Resolution`.

## Annotations on the 3D navigation

Thanks to the new improvements, [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) allows the visualization of the *Annotations* also for the [3D Navigation](navigation-toolbar.md#3d-navigation).

<img src="../img/annotations/3d_annotations.jpg" class="ms-docimage" style="max-width:500px;" />

### Geometries on 3D

On the [3D Navigation](navigation-toolbar.md#3d-navigation), after selecting a geometry type and drawing the geometry on the map, the editor can also modify the geometry by changing the **Height** of each of the vertices.

<video class="ms-docimage" style="max-width:700px;" controls><source src="../img/annotations/height_switcher.mp4" ></video>

### Styling on 3D

As *Marker* annotation on the [3D Navigation](navigation-toolbar.md#3d-navigation), the **3D model** type is also available.
From the *Style* tab, by clicking on <img src="../img/button/3D-model-button.jpg" class="ms-docbutton"/> button, the 3D model option opens to allow adding a 3D model (based on [glTF](https://github.com/KhronosGroup/glTF), GLB is also allowed) as an external graphic by specifying its *URL* (see also the [Cesium documentation](https://cesium.com/learn/cesiumjs/ref-doc/ModelGraphics.html?classFilter=Model)). Furthermore, it is possible to customize the 3D model `Scale`, `Rotation` and `Color`. Take a look at the following example.

<img src="../img/annotations/3d_model_type.jpg" class="ms-docimage" style="max-width:500px;" />

Furthermore, for the [3D Navigation](navigation-toolbar.md#3d-navigation), [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) adds some additional styling options such as:

* **Bring to front** (available for Point and Text geometries) to bring in front and so to make visible (if set to *true*) the annotation covered by 3D Tile layers and the Terrain layer (for this last case when the *depth test against terrain* option is enabled in Global Settings).

<img src="../img/annotations/bring-to-front.jpg" class="ms-docimage">

* **Height reference from ground** (available for Point and Text geometries) to indicate the reference for the point height between `None` (to the absolute zero of the ground), `Relative` (to the terrain layer level) or `Clamp` (the annotation is clamped to the Terrain, if present, or to the ground). It is also possible to finely configure the **Height** value of the point.

<img src="../img/annotations/height-reference.jpg" class="ms-docimage">

* **Leader line** (available for Point and Text geometries) to add a line to connect the point symbol with the Terrain/Ground to have a more clear reference of the effective point position when the camera orientation change. The editor can choose the **Width** of the line and the **Color** through the usual *color picker*.

<img src="../img/annotations/leader-line.jpg" class="ms-docimage">

* **Clamp to ground** to enable/disable the boolean property specifying whether the line or polygon should be clamped to the ground (this option is available for Line and Polygon geometries).

<img src="../img/annotations/clamp-to-ground.jpg" class="ms-docimage">

* **Clamp to ground reference** to choose whether the drape effect, should affect `3D Tiles`, `Terrain` or `Both`. This option is available for Line, Polygon and Circle geometries and it is only enabled when the *Clamp to ground* option is set to `True`.

<img src="../img/annotations/polygon-type.jpg" class="ms-docimage">
