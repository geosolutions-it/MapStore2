# Performing Measurements
*************************

The Measure tools in [MapStore](https://mapstore.geo-solutions.it/mapstore/#/) allows the user to perform distance, area and bearing measurements on the map. It also provides some additional functionalities that are described in this section of the documentation. The tool is accessible from [Burger Menu](menu-bar.md#burger-menu) by selecting the <img src="../img/button/measure-icon.jpg" class="ms-docbutton" style="max-height:20px;"/> option that opens the following window:

<img src="../img/measure/measure.jpg" class="ms-docimage" style="max-width:600px;"/>

Through this window it is possible to:

* Measure distance <img src="../img/button/measure-distance.jpg" class="ms-docbutton"/>

* Measure Area <img src="../img/button/measure-area.jpg" class="ms-docbutton"/>

* Measure Bearing <img src="../img/button/measure-bearing.jpg" class="ms-docbutton"/>

* Clear measures <img src="../img/button/x_button.jpg" class="ms-docbutton"/>

* Export the measures to *GeoJSON* <img src="../img/button/json_export_button.jpg" class="ms-docbutton"/>

* Add the measure as a layer in [TOC](toc.md) <img src="../img/button/layers_button.jpg" class="ms-docbutton"/>

* Add the measure as an [Annotation](annotations.md) <img src="../img/button/add-as-annotation.jpg" class="ms-docbutton"/>

!!! note
    The user can perform more than one measurement simultaneously on the map and then cancel it with the ** Clear Measures ** button <img src="../img/button/x_button.jpg" class="ms-docbutton"/>

## Measure distance

As soon as the measure window opens, by default the measure distance option is selected <img src="../img/button/measure-distance-green.jpg" class="ms-docbutton"/>. In order to perform a distance measure, each click on the map correspond to a segment of the line (at least one segment is needed) while the double click inserts the last line segment and ends the drawing session.

<img src="../img/measure/measure-distance-ex.gif" class="ms-docimage" style="max-width:600px;"/>

The available units of measure are:

<img src="../img/measure/distance-uom.jpg" class="ms-docimage" style="max-width:300px;"/>

!!! note
    The length of a line segment is shown on the map together with the measurement of the overall distance of all segments.

## Measure area

Once the **Measure Area** button is selected <img src="../img/button/measure-area-green.jpg" class="ms-docbutton"/>, it is possible to start the drawing session (in this case at least 3 vertices need to be indicated). Same as measuring the distance, each click correspond to a vertex and the double click will indicate the last one.

<img src="../img/measure/measure-area-ex.gif" class="ms-docimage" style="max-width:600px;"/>

In this case the available units of measure are:

<img src="../img/measure/area-uom.jpg" class="ms-docimage" style="max-width:300px;"/>

!!! note
    Each side's length of the polygon is reported in map along with its perimeter and the area.

## Measure bearing

The Bearing measurements allows you to measure directions and angles. In the quadrant bearing system, the bearing of a line is measured as an angle from the reference meridian, either the north or the south, toward the east or the west. Bearings in the quadrant bearing system are written as a meridian, an angle and a direction. For example, a bearing of N 30 W defines an angle of 30 degrees west measured from north. A bearing of S 15 E defines an angle of 15 degrees east measured from the south.<br>
After selecting the **Measure Bearing** button <img src="../img/button/measure-bearing-green.jpg" class="ms-docbutton"/> the user can draw a line with only two vertices that indicates respectively the starting and the ending point. 

<img src="../img/measure/measure-bearing-ex.gif" class="ms-docimage" style="max-width:600px;"/>

## Export the measure

Measurements drawn on the map can be exported in `GeoJson` format through the <img src="../img/button/json_export_button.jpg" class="ms-docbutton"/> button.  

## Add the measure as layer 

Once a measure is drawn, it is possible to add it as a layer through the <img src="../img/button/layers_button.jpg" class="ms-docbutton"/> button. The created layer is added to the [Table of Contents](toc.md) as follows:

<img src="../img/measure/as_layer.jpg" class="ms-docimage"/>

## Add measure as annotation

Once a measure is drawn, it is possible to add it as an [Annotation](annotations.md) through the <img src="../img/button/add-as-annotation.jpg" class="ms-docbutton"/> button. The following panel opens:

<img src="../img/measure/add-as-annotation-ex.jpg" class="ms-docimage"/>

From this step the creation process is the same described in the [Annotations section](annotations.md).
