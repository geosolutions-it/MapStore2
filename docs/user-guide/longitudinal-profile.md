# Longitudinal Profile

*******************

Given a DEM or a bathymetric layer as a source and a provided path on it, this tool allows to calculate the **Longitudinal Profile** and display it within an interactive chart.

!!! note
    The **Longitudinal Profile** is not included by default in the MapStore configuration but it can be configured within an [application contexts](application-context.md#configure-plugins) if needed.
    The plugin works only if the **Longitudinal Profile WPS process** is properly installed in [GeoServer](http://geoserver.org/). Look at the official [online documentation](https://docs.geoserver.org/latest/en/user/community/wps-longitudinal-profile/index.html) to learn more about this process and how to install it. The GeoServer module of the Longitudinal profile is available from Geoserver v2.20.x of Aug 2023.

By clicking the **Longitudinal Profile** <img src="../img/button/long-profile-button.jpg" class="ms-docbutton"/> button, available in the [Side Toolbar](mapstore-toolbars.md#side-toolbar), a drop down menu opens so that the user can manage the available options including different ways to calculate the profile:

<img src="../img/longitudinal-profile/dropdown-menu-long-profile.jpg" class="ms-docimage"/>

* It is possible to draw a line directly on the map through <img src="../img/button/drawing-line.jpg" class="ms-docbutton"/> button

<video class="ms-docimage" controls><source src="../img/longitudinal-profile/drawing-line.mp4"/></video>

* In alternative it is also possible to import a linear profile as a vector file (available formats for this are `GeoJSON`, `ShapeFile` or `DXF`),  through <img src="../img/button/import-file.jpg" class="ms-docbutton"/> button

<video class="ms-docimage" controls><source src="../img/longitudinal-profile/import-file.mp4"/></video>

* Finally, through <img src="../img/button/selection-layer.jpg" class="ms-docbutton"/> button, the user can also select a vector linear layer in [TOC](toc.md) and then select the line feature representing the desired profile path on map.

<video class="ms-docimage" controls><source src="../img/longitudinal-profile/selection-layer.mp4"/></video>

## Chart

When the geometry of the profile path has been drawn on the map, the **Longitudinal Profile** panel opens and the  chart appears in the **Chart** tab.

<img src="../img/longitudinal-profile/chart-tab.jpg" class="ms-docimage"/>

While the *X axis* indicates the distance from the starting point of the provided path, the *Y axis* indicates instead the height of points along the profile calculated from the provided path.  The user can hover over the chart to interact between the chart and the line of the map as follows:

<video class="ms-docimage" controls><source src="../img/longitudinal-profile/interact-with-chart.mp4"/></video>

The **Chart toolbar**, displayed in the right corner of the chart, allows the user to:

<img src="../img/longitudinal-profile/bar_charts.jpg" class="ms-docimage"/>

* **Download** the chart as a `png` through the <img src="../img/button/download_png.jpg" class="ms-docbutton"/> button.

* **Zoom** the chart through the <img src="../img/button/zoom_chart.jpg" class="ms-docbutton"/> button.

* **Pan** the chart through the <img src="../img/button/pan_chart.jpg" class="ms-docbutton"/> button.

* **Zoom in** the chart through the <img src="../img/button/zoom_in_chart.jpg" class="ms-docbutton"/> button.

* **Zoom out** the chart through the <img src="../img/button/zoom_out_chart.jpg" class="ms-docbutton"/> button.

* **Autoscale** to autoscale the axes to fit the plotted data automatically through the <img src="../img/button/autoscale_chart.jpg" class="ms-docbutton"/> button.

* **Reset axes** to return the chart to its initial state through the <img src="../img/button/reset_axes_chart.jpg" class="ms-docbutton"/> button.

[MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) also allows to export the *Longitudinal Profile* as `CSV`, `PNG` or `PDF` file.

<img src="../img/longitudinal-profile/export-profile.jpg" class="ms-docimage"/>

## Information

In the **Information** tab are reported all relevant indicators related to the longitudinal profile calculation. In particular it is reported:

<img src="../img/longitudinal-profile/profile-info.jpg" class="ms-docimage"/>

* The  layer used to calculate the profile

* Total linear length of the profile

* Cumulative elevation gain

* Cumulative elevation loss

* Number of points processed (the number of points varies according to the pitch chosen).

## Setting Parameters

Through the <img src="../img/button/parameters-button.jpg" class="ms-docbutton"/> button it is possible to tune the profile properties. The available parameters used to calculate the longitudinal profile are:

<img src="../img/longitudinal-profile/setting-parameters.jpg" class="ms-docimage"/>

* The **Profile layer** choosing between the available layer on the dropdown menu

* The **Distance** choosing the maximum distance between two points along the profile (in `m`)

* The **Chart Title** to be used  in the UI on the top of the chart.

<img src="../img/longitudinal-profile/chart-title.jpg" class="ms-docimage"/>
