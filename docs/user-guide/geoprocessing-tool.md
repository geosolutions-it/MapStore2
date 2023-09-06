# GeoProcessing Tool

*******************

This tool allows to perform geographic operations using one or more layers containing geometry and save the result of the operation as a new layer.

!!! note
    The **GeoProcessing Tool** is not included by default in the MapStore configuration but it can be configured within an [application contexts](application-context.md#configure-plugins) if needed.
    The plugin works only if the **GeoProcessing WPS service** (available as a community extension) is properly installed in [GeoServer](http://geoserver.org/).

By clicking the **GeoProcessing Tool** <img src="../img/button/geoprocessing-button.jpg" class="ms-docbutton"/> button, available in the [Side Toolbar](mapstore-toolbars.md#side-toolbar), a panel opens so that the user can choose the geographic operations between **Buffer** and **Intersection**.

<img src="../img/geoprocessing-tool/geoprocessing-panel.jpg" class="ms-docimage" width="400px"/>

## Buffer tool

To get a layer buffer, the editor can select **Buffer** as a process, then can select a layer from the **Source Layer** option drop down menu and one of the layer's features from the **Source Feature** option drop down menu or, enable the <img src="../img/button/add_marker_button.jpg" class="ms-docbutton"/> button that gives the possibility to select the *Feature* directly from the map.

<img src="../img/geoprocessing-tool/select-buffer-feature.mp4" class="ms-docimage"/>

After entering the desired buffer **Distance**, the editor can click <img src="../img/button/run_button.jpg" class="ms-docbutton"/> to get a new buffer layer.

<img src="../img/geoprocessing-tool/run_buffer-layer.mp4" class="ms-docimage"/>

The buffer layer is now present in the [TOC](toc.md) and visible in the map viewer.

### Advanced Settings

Enabling the *Advanced options* the editor can include the following to the *Buffer* operation:

<img src="../img/geoprocessing-tool/buffer-advanced-options.jpg" class="ms-docimage" width="400px" />

* The **Quadrant Segments**

* The **Style for the buffer end caps** choosing between `Round`, `Flat` or `Square`

## Intersection tool

Once the **Intersection** has been chosen as a process, the editor can select a layer to intersect from the **Source Layer** option drop down menu and one of the layer's features from the **Source Feature** option drop down menu or, enable the <img src="../img/button/add_marker_button.jpg" class="ms-docbutton"/> button that gives the possibility to select the *Feature* directly from the map.

<img src="../img/geoprocessing-tool/select-feature.mp4" class="ms-docimage"/>

In the same way it is possible to select the **Intersection Layer** and the corresponding **Intersection Feature** to obtain the new intersected layer by clicking on <img src="../img/button/run_button.jpg" class="ms-docbutton"/> button.

<img src="../img/geoprocessing-tool/run_intersection-layer." class="ms-docimage"/>

The intersected layer is now present in the [TOC](toc.md) and visible in the map viewer.

<img src="../img/geoprocessing-tool/intersection-layer.jpg" class="ms-docimage" />

### Advanced Settings

Enabling the *Advanced options* the editor can include the following to the *Intersection* operation:

<img src="../img/geoprocessing-tool/intersection-advanced-options.jpg" class="ms-docimage" width="400px"/>

* The **First feature collection attribute to include**

* The **Second feature collection attribute to include**

* The **Specifies geometry computed for intersecting features** choosing between `INTERSECTION`, `FIRST` or `SECOND`

* The **Indicates whether to output feature area percentages** choosing between `False` or `True`

* The **Indicates whether to output feature areas** choosing between `False` or `True`.
