# Annotations

[Mapstore](https://mapstore.geosolutionsgroup.com/mapstore/#/) lets you enrich the map with special features which expose additional information, mark particular position on the map and so on.
Those features make up the so called **Annotations** layers.

Starting from a new map or an already existing one, the editor can access the **Annotations** <img src="../img/button/annotations2.jpg" class="ms-docbutton" style="max-height:30px;"/> button from the [TOC](toc.md) <img src="../img/button/show-layers.jpg" class="ms-docbutton" style="max-height:30px;"/> panel on the top-left corner of the map viewer.

<img src="../img/annotations/annotations_on_toc.jpg" class="ms-docimage" style="max-width:500px;" />

 The annotation panel will open:

<img src="../img/annotations/annotation_tool.jpg" class="ms-docimage" style="max-width:500px;" />

## Add new Annotation

To begin, from the annotation panel, the editor can open the new annotation panel by selecting the <img src="../img/button/+++.jpg" class="ms-docbutton" /> button.

<img src="../img/annotations/annotation_form_filled.jpg" class="ms-docimage"  style="max-width:500px;"/>

From here the editor can insert a **Title** (required), a **Description** (optional) and choose between five different types of **Geometries**:

* **Marker** <img src="../img/button/marker2.jpg" class="ms-docbutton" />
* **Line** <img src="../img/button/line2.jpg" class="ms-docbutton" />
* **Polygon** <img src="../img/button/polygon2.jpg" class="ms-docbutton" />
* **Text** <img src="../img/button/text2.jpg" class="ms-docbutton" />
* **Circle** <img src="../img/button/circle2.jpg" class="ms-docbutton" />

After selecting a geometry type, the editor can:

* Draw a *Geometry* on the map.

<video class="ms-docimage" style="max-width:700px;"controls><source src="../img/annotations/polygon_annotation_drawing.mp4" ></video>

* Enter the vertices of the geometry or modify the existing ones through the **Coordinates editor** using `Decimal` or `Aeronautical` formats.

<video class="ms-docimage" style="max-width:700px;" controls><source src="../img/annotations/coordinates_format_switcher.mp4" ></video>

* For *Line* and *Polygon*, add new vertices using the <img src="../img/button/++.jpg" class="ms-docbutton" /> button and typing the `latitude` and `longitude` values.

<video class="ms-docimage" style="max-width:700px;"controls><source src="../img/annotations/add_vertex_button.mp4" ></video>

!!! note
    If the vertices are invalid, they are notified with a red exclamation point.
    <img src="../img/annotations/invalid_vertex.jpg" class="ms-docimage" style="max-width:500px;" />
    In this case, it is not possible to add new geometry or save the annotation until a valid value is entered. It is still possible to interact with the geometries already present in the annotation, by zooming in on it or deleting it, as follows:
    <video class="ms-docimage" style="max-width:500px;" controls><source src="../img/annotations/invalid_vertex2.mp4" ></video>

* Customize the **Style** of the annotation, as explained in the following paragraph.

Once the geometry has been saved through the **Save** <img src="../img/button/save_button.jpg" class="ms-docbutton" /> button, for each geometry created, the editor can perform the following operations:

* **Zoom** to the geometry annotation on map through the <img src="../img/button/zoom-feature.jpg" class="ms-docbutton" /> button

* **Delete** the geometry annotation through the <img src="../img/button/delete_white_button.jpg" class="ms-docbutton" /> button

Once all the *Geometries* have been created, the editor can save the annotation through the **Save** <img src="../img/button/save_button.jpg" class="ms-docbutton" /> button that will be visible in the annotation list:

<img src="../img/annotations/annotation1.jpg" class="ms-docimage" />

Then, if not present, a new **Annotations**  layer will be created and added to the [TOC](toc.md)

<img src="../img/annotations/annotation2.jpg" class="ms-docimage" />

## Styling Annotations

Based on which type of annotation was chosen, [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) allows you to customize the annotation style through a powerful editor. It is accessible from the *Style* tab of the annotation viewer. During the style editing a preview placed on top of the styler form shows a preview of the edited style.

<img src="../img/annotations/annotations_toolbar.jpg" class="ms-docimage" style="max-width:500px;"/>

***Marker***

MapStore provides two types of *Marker* annotations, so you have to choose what type do you prefer using the *Type* combo box (*Marker* is the default):

<img src="../img/annotations/marker_type_selection.jpg" class="ms-docimage" style="max-width:500px;"/>

* *Marker* types can be customized through the following editor:

<img src="../img/annotations/marker_style_editor.jpg" class="ms-docimage" style="max-width:500px;"/>

Choose the `Shape`, `Color` and `Icon` that best fit your needs.

* *Symbol* types can  have different `Shape` and `Size`, a `Fill color` with a customizable `Opacity` level (%), a `Stroke` of different types (continuous, dashed, etc) and customizable `Color`, `Opacity` and `Width`. Only few symbols are provided by default in MapStore but a custom list of symbols can be configured.

<img src="../img/annotations/symbol_style_editor.jpg" class="ms-docimage" style="max-width:500px;"/>

***Polyline***

*Polyline* annotations can be styled using the following editor:

<img src="../img/annotations/polyline_style_editor.jpg" class="ms-docimage" style="max-width:500px;"/>

You can customize the `Stroke` in order to consider the `Line/Dash` type (continuous, dashed, dotted, etc), `Color`, `Opacity` and `Width`. You can also have styled *Start*/*End Points*: enable the StartPoint *Style*/*EndPoint Style* panel using the corresponding check box, the editor will be the same used for *Marker*/*Symbol annotations*.

***Polygon***

With polygonal annotations changing the style means choose the `Shape` and the size the `Size` of the polygon, its `Fill color` (with custom `Opacity`), the type of the `Stroke` (continuous, dashed, dotted, etc), its `Color`, `Opacity` and `Width`.
See the example below to better understand these options.

<img src="../img/annotations/polygon_style_editor.jpg" class="ms-docimage" style="max-width:500px;"/>

***Text***

*Text* annotations are a bit different from the geometric ones. They display a formatted text on a given point of the map.
The style editor allows you to customize the text `Font` (`Family`, `Size`, `Style`, `Weight`), the `Alignment` (`left`, `center` or `right`) and `Rotation`.
You can also choose the text `Fill color` and its `Opacity`, the `Stroke` type, its `Color`, `Opacity` and `Width`. Take a look at the following example.

<img src="../img/annotations/text_annotation_editor.jpg" class="ms-docimage" style="max-width:500px;"/>

***Circle***

Circle annotations can have custom `Fill color` (with custom `Opacity`), `Stroke` type (continuous, dashed, dotted, etc) with custom `Color`, `Opacity` and `Width`. The *Center* can be also customized through the same editor described for *Marker* annotations.
See the example below.

<img src="../img/annotations/circle_style_editor.jpg" class="ms-docimage" style="max-width:500px;"/>

Click on <img src="../img/button/apply_button.jpg" class="ms-docbutton"/> to apply the style.

## Managing Annotations

Once annotations are added to the [TOC](toc.md), the editor can **Manage** them by clicking to <img src="../img/button/edit_button.jpg" class="ms-docbutton" /> button from the TOC toolbar and the *Main Annotations panel* will be open.

<img src="../img/annotations/annotations_main_panel.jpg" class="ms-docimage" style="max-width:500px;" />

From it, the editor is allowed to:

* **Download** a file with all the existing annotations by clicking on <img src="../img/button/download_annotation_button.jpg" class="ms-docbutton" > button

* **Upload** annotations from a valid `json` file by clicking on <img src="../img/button/upload_annotation_button.jpg" class="ms-docbutton" > button

* **Zoom** an annotation on map by clicking on <img src="../img/button/white-zoom.jpg" class="ms-docbutton" /> button

* **Show/Hide** an annotation on the map by clicking on <img src="../img/button/eyeon.jpg" class="ms-docbutton" /> button

From the *Main Annotations Panel*, by selecting an annotation from the list, the editor is returned to the *Annotation Viewer* where the annotation can be edited.

<img src="../img/annotations/annotation_toolbar.jpg" class="ms-docimage" style="max-width:500px;"/>

In particular, the editor can:

* Change the *Coordinates* and the *Style* by clicking a geometry from list of geometries.

<video class="ms-docimage" style="max-width:700px;" controls><source src="../img/annotations/editing_annotations.mp4" ></video>

* **Download** the annotation in `json` format and reused in other maps by clicking on <img src="../img/button/download_annotation_button.jpg" class="ms-docbutton" > button
