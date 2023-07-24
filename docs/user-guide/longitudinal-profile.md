# Longitudinal Profile

*******************

Given a DEM or a bathymetric layer as a source and a provided path on it, this tool allows to calculate the **Longitudinal Profile** and display it within an interactive chart.

!!! note
    By default, the **Longitudinal Profile** plugin is ready to be configured for [application contexts](application-context.md#configure-plugins), and is not available in the default plugin configuration.
    The plugin works only if the [WPS process](gs-wps-longitudinal-profile-2.24-SNAPSHOT.zip) is configured on the [GeoServer](http://geoserver.org/).

By clicking the **Longitudinal Profile** <img src="../img/button/long-profile-button.jpg" class="ms-docbutton"/> button, available in the [Side Toolbar](mapstore-toolbars.md#side-toolbar), a drop down menu opens so that the user can manage the available options including different ways to calculate the profile:

<img src="../img/longitudinal-profile/dropdown-menu-long-profile.jpg" class="ms-docimage"/>

* The **Draw line** to draw a line directly on the map through <img src="../img/button/drawing-line.jpg" class="ms-docbutton"/> button

<img src="../img/longitudinal-profile/drawing-line.gif" class="ms-docimage"/>

* The **Load file** to import linear profile as `JSON`, `ShapeFile` or `DXF`, selected from file system, through <img src="../img/button/import-file.jpg" class="ms-docbutton"/> button

<img src="../img/longitudinal-profile/import-file.gif" class="ms-docimage"/>

* The **Selection to profile** to select a linear layer on [TOC](toc.md) and then click a line feature on map through <img src="../img/button/selection-layer.jpg" class="ms-docbutton"/> button

<img src="../img/longitudinal-profile/selection-layer.gif" class="ms-docimage"/>

## Chart

When the line has been drawn on the map, the **Longitudinal Profile** panel is opened and the line chart appears in the **Chart** tab.

<img src="../img/longitudinal-profile/chart-tab.jpg" class="ms-docimage"/>

The *X axis* of the chart indicates the distance traveled from the starting point of the drawn or imported linear and the *Y axis* indicates the altitude returned by the height source at the coordinates along the profile. The user can hover over the chart to interact between the chart and the line of the map as follows:

<img src="../img/longitudinal-profile/interact-with-chart.gif" class="ms-docimage"/>

The **Chart toolbar**, displayed in the right corner of the chart, allows the user to:

<img src="../img/longitudinal-profile/bar_charts.jpg" class="ms-docimage"/>

* **Download** the chart as a `png` through the <img src="../img/button/download_png.jpg" class="ms-docbutton"/> button.

* **Zoom** the chart through the <img src="../img/button/zoom_chart.jpg" class="ms-docbutton"/> button.

* **Pan** the chart through the <img src="../img/button/pan_chart.jpg" class="ms-docbutton"/> button.

* **Zoom in** the chart through the <img src="../img/button/zoom_in_chart.jpg" class="ms-docbutton"/> button.

* **Zoom out** the chart through the <img src="../img/button/zoom_out_chart.jpg" class="ms-docbutton"/> button.

* **Autoscale** to autoscale the axes to fit the plotted data automatically through the <img src="../img/button/autoscale_chart.jpg" class="ms-docbutton"/> button.

* **Reset axes** to return the chart to its initial state through the <img src="../img/button/reset_axes_chart.jpg" class="ms-docbutton"/> button.

[MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) also allows to exporting the *Longitudinal Profile* as `CSV`, `PNG` or `PDF`.

<img src="../img/longitudinal-profile/export-profile.jpg" class="ms-docimage"/>

## Information

In the **Information** tab, the most important characteristics of the profile are highlighted, in particular it is reported:

<img src="../img/longitudinal-profile/profile-info.jpg" class="ms-docimage"/>

* The  layer used to calculate the profile

* Total linear length of the profile

* Cumulative elevation gain

* Cumulative elevation loss

* Number of points processed (The number of stitches varies according to the pitch chosen).

## Setting Parameters

When the <img src="../img/button/parameters-button.jpg" class="ms-docbutton"/> button is activated, the editor is allowed to set the following options:

<img src="../img/longitudinal-profile/setting-parameters.jpg" class="ms-docimage"/>

* The **Profile layer** choosing between the available layer on the dropdown menu

* The **Distance** choosing the maximum distance between two points along the profile (in `m`)

* The **Chart Title** to type a title that it is visible on the top of the chart line.

<img src="../img/longitudinal-profile/chart-title.jpg" class="ms-docimage"/>
