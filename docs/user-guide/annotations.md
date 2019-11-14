# Adding Annotations 
********************

[Mapstore](https://mapstore.geo-solutions.it/mapstore/#/) lets you enrich the map with special features which expose additional information, mark particular position on the map and so on.
Those features make up the so called **Annotations** layers.

Starting from a new map or an already existing one:

* **Click** on the *Burger menu* button <img src="../img/button/burger.jpg" style="max-width:30px;" /> from the main menu bar.
* **Click** on the *Annotations* option from the list <img src="../img/annotations/annotation-option.jpg" style="max-width:100px;"/>.

The annotation panel will open.

<img src="../img/annotations/annotation_tool.jpg" style="max-width:600px;" />

Creating a New Annotation
-------------------------

In order to add a new annotation:

* **Click** on <img src="../img/button/+++.jpg" style="max-width:30px;" />, a new form will appear.

* **Type** a *Title* (required) and a *Description* (optional).

    <img src="../img/annotations/annotation_form_filled.jpg" style="max-width:500px;" />

* **Click** on <img src="../img/annotations/annotation-draw.jpg" style="max-width:30px;" /> to define the annotation geometry and position. You have to select the annotation type first, then to draw it on the map.

    <img src="../img/annotations/annotations_types.jpg" style="max-width:500px;" />

* **Select**, for example, the *Polygon* type.

* **Click** on the map to define the polygon vertices.

    <img src="../img/annotations/polygon_annotation_drawing.gif" />


    You can also insert new vertices, or edit existing ones, through the coordinates editor using `Decimal` or `Aeronautical` formats.


    <img src="../img/annotations/coordinates_format_switcher.jpg" style="max-width:600px;" />


    New vertices can be also added using the <img src="../img/button/++.jpg" style="max-width:30px;" /> button and typing the `latitude` and `longitude` values (see the picture below).


    <img src="../img/annotations/add_vertex_button.jpg" style="max-width:450px;" />


    Invalid vertices are notified with a red exclamation point icon.


    <img src="../img/annotations/invalid_vertex.jpg" style="max-width:600px;" />

* **Click** the *Change Style* <img src="../img/button/change_style_icon.jpg" style="max-width:30px;" /> button (optional) to manage the annotation style (see the next paragraph).

* **Click** on *Save* <img src="../img/button/save_button.jpg" style="max-width:30px;" />.

* **Click** on *Save* <img src="../img/button/save_button.jpg" style="max-width:30px;" /> on the main form.

The annotations layer will be added to the TOC and the annotation will be visible in the annotations list as in the figure below.

<img src="../img/annotations/tijuana_annotation.jpg" />

Styling Annotations
-------------------

Based on which type of annotation was chosen, [MapStore](https://mapstore.geo-solutions.it/mapstore/#/) allows you to customize the annotation style through a powerful editor. It is accessible from the <img src="../img/annotations/annotation-draw.jpg" style="max-width:30px;" /> button of the annotation toolbar. During the style editing a preview placed on top of the styler form shows a preview of the edited style.

<img src="../img/annotations/annotations_toolbar.jpg" style="max-width:500px;"/>

***Marker***

MapStore provides two types of *Marker* annotations, so you have to choose what type do you prefer using the *Type* combo box (*Marker* is the default):

<img src="../img/annotations/marker_type_selection.jpg" style="max-width:500px;"/>

* *Marker* types can be customized through the following editor:

    <img src="../img/annotations/marker_style_editor.jpg" style="max-width:600px;"/>

    Choose the `Shape`, `Color` and `Icon` that best fit your needs.

* *Symbol* types can  have different `Shape` and `Size`, a `Fill color` with a customizable `Opacity` level (%), a `Stroke` of different types (continuous, dashed, etc) and customizable `Color`, `Opacity` and `Width`. Only few symbols are provided by default in MapStore but a custom list of symbols can be configured.

    <img src="../img/annotations/symbol_style_editor.jpg" style="max-width:600px;"/>

***Polyline***

*Polyline* annotations can be styled using the following editor:

<img src="../img/annotations/polyline_style_editor.jpg"/>

You can customize the `Stroke` in order to consider the `Line/Dash` type (continuous, dashed, dotted, etc), `Color`, `Opacity` and `Width`.
You can also have styled *Start/End Points*: enable the *StartPoint Style*/*EndPoint Style* panel using the corresponding check box, the editor will be the same used for *Marker/Symbol* annotations.

***Polygon***

With polygonal annotations changing the style means choose the `Shape` and the size the `Size` of the polygon, its `Fill color` (with custom `Opacity`), the type of the `Stroke` (continuous, dashed, dotted, etc), its `Color`, `Opacity` and `Width`.
See the example below to better understand these options.

<img src="../img/annotations/polygon_style_editor.jpg" style="max-width:500px;"/>

***Text***

*Text* annotations are a bit different from the geometric ones. They display a formatted text on a given point of the map.
The style editor lets you customize the text `Font` (`Family`, `Size`, `Style`, `Weight`) and the `Alignment` (`left`, `center` or `right`).
You can also choose the text `Fill color` and its `Opacity`, the `Stroke` type, its `Color`, `Opacity` and `Width`. Take a look at the following example.

<img src="../img/annotations/text_annotation_editor.jpg" style="max-width:500px;"/>

***Circle***

Circle annotations can have custom `Fill color` (with custom `Opacity`), `Stroke` type (continuous, dashed, dotted, etc) with custom `Color`, `Opacity` and `Width`. The *Center* can be also customized through the same editor described for *Marker* annotations.
See the example below.

<img src="../img/annotations/circle_style_editor.jpg" style="max-width:500px;"/>

Click on <img src="../img/button/apply_button.jpg" style="max-width:30px;" /> to apply the style.

Managing Annotations
--------------------

You can manage anytime your annotations through the *Annotation Toolbar*. Click on some annotation to display it.

<img src="../img/annotations/annotation_toolbar.jpg" style="max-width:500px;"/>

* You can edit you annotations by clicking the <img src="../img/button/edit_button.jpg" style="max-width:30px;" /> button, it allows you to change the geometry and/or the information related to the annotations. See the gif below to better understand how:

    <img src="../img/annotations/editing_annotations.gif" />

* The <img src="../img/button/zoom_button.jpg" style="max-width:30px;" /> button allow the map to zoom on the annotation.

* To delete the annotation use the <img src="../img/button/delete_button.jpg" style="max-width:30px;" /> button.

* Annotations can be also download in `json` format and reused in other maps. Using <img src="../img/button/download_annotation_button.jpg" style="max-width:30px;" /> button you will be able to export your annotation in the `Annotation.json` file and download it.

    <img src="../img/annotations/download_annotation.jpg" />

From the main panel of the *Annotations* tool you can also download/upload annotations to/from a `json` file.

<img src="../img/annotations/annotations_main_panel.jpg" style="max-width:500px;" />

* **Click** on <img src="../img/button/download_annotation_button.jpg" style="max-width:30px;" > to *download* a file with all the existing annotations.

* **Click** on <img src="../img/button/upload_annotation_button.jpg" style="max-width:30px;" > to *upload* annotations from a valid `json` file.
