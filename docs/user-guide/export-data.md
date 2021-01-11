# Export Layer Data
**************************

[MapStore](https://mapstore.geo-solutions.it/mapstore/#/) allows to export both vector and raster layers, easily controlling the size and format of the output file, and downloading it as a `zip` files. Once a layer is selected in the [TOC](toc.md) the **Export Data** open by clicking the <img src="../img/button/export_data.jpg" class="ms-docbutton"/> button on the layer toolbar.

<img src="../img/export_data/export_data_ex.jpg" class="ms-docimage"/>

!!! note
    Only for the **Vector layer**, the user can also download data by opening the Attribute Table <img src="../img/button/attributes-table.jpg" class="ms-docbutton"/> from the [TOC](toc.md) and clicking the <img src="../img/button/export_data.jpg" class="ms-docbutton"/> button. 

From the **Export Data** panel the user can:

* Select the **File Format**. Choose between `GeoJSON`, `wfs-collection-1.0`, `wfs-collection-1.1`, `Shapefile` and `CSV`, if it is a *vector layer*, and `ArcGrid`, `TIFF`, `PNG`, `JPEG`, if it is a *raster layer* 

* Select the **Spatial Reference System** (By default `Native` or `WGS84`)

* Enable the **Crop dataset to current viewport** for downloading only the part of the layer visible on the map at that moment

* Only for *Vector layer*, enable the **Download filtered dataset** to download also the layer dataset 

<img src="../img/export_data/export_data_vector.jpg" class="ms-docimage"/>

* Only for *Raster layer*, enable the **Advanced options** to set compression (`CCITT RLE`, `LZW`, `JPEG`, `ZLip`, `PackBits` or `Deflate`), quality (from 0 to 1), tile width and height (`px`).

<img src="../img/export_data/export_data_raster.jpg" class="ms-docimage"/>

With a click on the <img src="../img/button/export_at.jpg" class="ms-docbutton"/> button the browser will start to export the file. Then the user can view the status of the export procedure by clicking on the <img src="../img/button/export_data.jpg" class="ms-docbutton"/> button appears right at the bottom of the footer.

<img src="../img/export_data/export_data_download.jpg" class="ms-docimage"/>

The **Export Data Result** panel opens and the user can:

<img src="../img/export_data/export_data_result.jpg" class="ms-docimage"/>

* **Download** the final `zip` file: clicking the <img src="../img/button/save-changes.jpg" class="ms-docbutton"/> button 

* **Remove** the final `zip` file: clicking the <img src="../img/button/delete_button.jpg" class="ms-docbutton"/> button