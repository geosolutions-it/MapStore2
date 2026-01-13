# Export Layer Data

**************************

[MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) allows to export both vector and raster layers present in  [TOC](toc.md#table-of-contents). In order to provide advanced export capabilities the [WPS Download process](https://docs.geoserver.org/stable/en/user/community/wps-download/index.html) must be installed and available in GeoServer. MapStore performs a preventive check for this as soon as the user opens the tool: if the WPS Download process is not available, MapStore uses the WFS service as fallback and the export options are limited (eg. only vector data can be exported).
Once a layer is selected in the [TOC](toc.md#table-of-contents), the user can open the **Export Data** tool by clicking the <img src="../img/button/export_data.jpg" class="ms-docbutton"/> button available in the layer toolbar.

<img src="../img/export_data/export_data_ex.jpg" class="ms-docimage"/>

!!! note
    If the `WFS` service is the only one available, once the **Export Data** opens, the user can only select the *File Format* and the *Spatial Reference System* (as explained below).
    <img src="../img/export_data/wfs-export-data.jpg" class="ms-docimage"/>

!!! note
    Only for the **Vector layer**, the user can also download data by opening the Attribute Table <img src="../img/button/attributes-table.jpg" class="ms-docbutton"/> from the [TOC](toc.md#table-of-contents) and clicking the <img src="../img/button/export_data.jpg" class="ms-docbutton"/> button.

From the **Export Data** panel the user can:

* Select the **Service**, choosing between `WPS`and `WFS` (this option is present in the form only if the WPS Download process is available, otherwise the WFS service is used directly).

* Select the **File Format**. The list of formats depends on the availability of the WPS Download process in GeoServer. If the WPS process is available, the user can choose between `GeoJSON`, `GML2`, `GML3`, `Shapefile` and `CSV` for *vector layers*, and between `ArcGrid`and `TIFF` in case of *raster layers*. If the WPS Download process is not available for some reasons, MapStore provides the list of formats valid for the WFS service by looking at the ones offered by the services capabilities (WFS Capabilities).

From the *Advanced options* dropdown menu the user can:

<img src="../img/export_data/vector_advanced_options.jpg" class="ms-docimage"/>

* Select the **Spatial Reference System** (By default `Native` or `WGS84`)

* Enable the **Crop dataset to current viewport** for downloading only the part of the layer visible on the map at that moment (this option is present in the form only if the WPS Download process is available)

* Only for *Vector layer*, allows to consider for the download also an eventual filter applied to the layer using the [Filter layer tool](filtering-layers.md#layer-filter)  (this option is present in the form only if the WPS Download process is available)

<img src="../img/export_data/export_data_vector.jpg" class="ms-docimage"/>

* Only for *Raster layer* (and if the WPS Download process is available) the user can open the *Advanced options* to choose:

* The **Compression type** used to store internal tiles (`CCITT RLE`, `LZW`, `JPEG`, `ZLip`, `PackBits` or `Deflate`)
* The **Compression quality** for lossy compression (JPEG). Value is in the range [0 : 1] where 0 is for worst quality/higher compression and 1 is for best quality/lower compression
* Tile **Width** of internal tiles, in pixels
* Tile **Height** of internal tiles, in pixels

<img src="../img/export_data/export_data_raster.jpg" class="ms-docimage"/>

With a click on the <img src="../img/button/export_at.jpg" class="ms-docbutton"/> button MapStore performs the export request. In case of WPS Download process available, multiple export requests can be performed from MapStore asynchronously. An information popup informs the user when an export process starts and the user can check the status of the process itself by opening the **Export Data Result** panel with a clicking on the <img src="../img/button/export_data.jpg" class="ms-docbutton"/> button available on the right side of the [Top Toolbar](top-bar.md).  

<img src="../img/export_data/export_data_download.jpg" class="ms-docimage"/>

The **Export Data Result** provides the list of exports processes started by the user and their status: as soon as the WPS completes the export operation, its status is reported by MapStore to the user (in progress, completed, and so ready for download, or failed). Therefore, the user can:

<img src="../img/export_data/export_data_result.jpg" class="ms-docimage"/>

* Check for eventual reported errors: a specific icon informs the user that the process failed with a popup message.

* **Download** the final `zip` file: clicking the <img src="../img/button/save-changes.jpg" class="ms-docbutton"/> button

* **Remove** the final `zip` file: clicking the <img src="../img/button/delete_button.jpg" class="ms-docbutton"/> button
