# GeoProcessing Tool

This tool aims to provide a set of geo-processing utilities on layers present in map. WPS calls are made by the tool to produce the result to be displayed in the map. Supported WPS processes are _geo:buffer_ and _gs:IntersectionFeatureCollection_ (the [WPS plugin](https://docs.geoserver.org/latest/en/user/services/wps/install.html) need to be installed for your GeoServer version in order to use this tool).

!!! note
    The **GeoProcessing Tool** is not included by default in the MapStore configuration but it can be configured within an [application contexts](application-context.md#configure-plugins) if needed.

By clicking the **GeoProcessing Tool** <img src="../img/button/geoprocessing-button.jpg" class="ms-docbutton"/> button, available in the [Side Toolbar](mapstore-toolbars.md#side-toolbar), a panel opens so that the user can choose the geographic operations between **Buffer** and **Intersection**.

<img src="../img/geoprocessing-tool/geoprocessing-panel.jpg" class="ms-docimage" width="400px"/>

## Buffer tool

The **Buffer** tool allows to create a buffer around the input geometries and when it is selected, the user can:

* Select a layer from the **Source Layer** option drop down menu. The dropdown shows the layers available for the process from the ones present in TOC

* Select one of the layer features from the **Source Feature** option. The feature can be selected from the dropdown menu or directly clicking on map by activating the <img src="../img/button/add_marker_button.jpg" class="ms-docbutton"/> button.

<video class="ms-docimage" controls><source src="../img/geoprocessing-tool/select-buffer-feature.mp4"/></video>

* Insert the desired **Distance** for the buffer.

The editor can now click <img src="../img/button/run_button.jpg" class="ms-docbutton"/> to start the process and generate the new buffer layer.

<video class="ms-docimage" controls><source src="../img/geoprocessing-tool/run_buffer-layer.mp4"/></video>

The buffer layer is now present in the [TOC](toc.md) and visible in the map viewer.

### Advanced Settings

Enabling the *Advanced options* the editor can include the following to the *Buffer* operation:

<img src="../img/geoprocessing-tool/buffer-advanced-options.jpg" class="ms-docimage" width="400px" />

* Enter the **Quadrant Segments**, that is the number of line segments used to approximate a quarter circle.

* Select the **Style for the buffer end caps** choosing between `Round`, `Flat` or `Square`

## Intersection tool

Once the **Intersection** has been chosen as a process, the editor can select a layer to intersect from the **Source Layer** option drop down menu and one of the layer's features from the **Source Feature** option drop down menu or, enable the <img src="../img/button/add_marker_button.jpg" class="ms-docbutton"/> button that gives the possibility to select the *Feature* directly from the map.

Once the **Intersection** has been chosen as a process, the editor can select a layer to intersect with the following operations:

* Select the **Source Layer** from the drop down menu.

* Select the layer's features from the **Source Feature**. The feature can be selected directly from the drop down menu or by clicking on the map, activating the <img src="../img/button/add_marker_button.jpg" class="ms-docbutton"/> button.

<video class="ms-docimage" controls><source src="../img/geoprocessing-tool/select-feature.mp4"/></video>

In the same way it is possible to select the **Intersection Layer** and the corresponding **Intersection Feature** to obtain the new intersected layer by clicking on <img src="../img/button/run_button.jpg" class="ms-docbutton"/> button.

<video class="ms-docimage" controls><source src="../img/geoprocessing-tool/run_intersection-layer.mp4"/></video>

The new layer, result of the intersection of the features selected, will be added to the [TOC](toc.md) and visible in the map viewer.

<img src="../img/geoprocessing-tool/intersection-layer.jpg" class="ms-docimage" />

### Advanced Settings

Enabling the *Advanced options* the editor can include the following to the *Intersection* operation:

<img src="../img/geoprocessing-tool/intersection-advanced-options.jpg" class="ms-docimage" width="400px"/>

* Enter the **First attribute to retain**, which is the first attribute to display

* Enter the **Second attribute to retain**, which is the second attribute to display

* Select the **Intersection mode** choosing between `INTERSECTION`, `FIRST` or `SECOND`

* Select the **Percentages**, choosing between `False` or `True`, to indicate whether to generate area percentages.

* Select the **Areas enabled**, choosing between `False` or `True`, to indicate whether to generate area
