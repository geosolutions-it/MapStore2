# Import Files
**************

In [MapStore](https://mapstore.geo-solutions.it/mapstore/#/) it is possible to add map context files or vector files to a map. This operation can be performed by clicking on the *Burger menu* button <img src="../img/button/burger.jpg" class="ms-docbutton"/> from the [Menu Bar](menu-bar.md) and by selecting the <img src="../img/button/import.jpg" class="ms-docbutton"/> option. Following these steps the import screen appears:

<img src="../img/import/import-screen.jpg" class="ms-docimage" style="max-width:700px;"/>

Here the user, in order to import a file, can drag and drop it inside the import screen or select it from the folders of the local machine through the <img src="../img/button/select-files.jpg" class="ms-docbutton"/> button. Actually there's the possibility to import two different types of files:

* *Map context files* (supported formats: MapStore legacy format, WMC)

* *Vector layer files* (supported formats: shapefiles, KML/KMZ, GeoJSON and GPX)

!!! warning
    Shapefiles must be contained in .zip archives.

## Export and Import map context files

A map context is, for example, the file that an user download selecting the <img src="../img/button/export.jpg" class="ms-docbutton"/> option in [Burger Menu](menu-bar.md#burger-menu). Map contexts can be exported in two different format:

* The <img src="../img/button/mapstore_format_button.jpg" class="ms-docbutton"/> file, is an export in `json` format of the current map context state: current projections, coordinates, zoom, extent, layers present in the map, widgets and more (additional information can be found in the [Maps Configuration](../developer-guide/maps-configuration.md) section of the [Developer Guide](https://mapstore.readthedocs.io/en/latest/developer-guide/)).

Adding a MapStore configuration file the behavior is similar to the following:

<img src="../img/import/export-import.gif" class="ms-docimage"/>

* The <img src="../img/button/wmc_format_button.jpg" class="ms-docbutton"/> (Web Map Context) file, is a `xml` format where only WMS layers present in the map are exported including their settings related to projections, coordinates, zoom and extension (additional information can be found in the  [Maps Configuration](../developer-guide/maps-configuration.md#web-map-context) section of the [Developer Guide](https://mapstore.readthedocs.io/en/latest/developer-guide/)).

Adding a WMC configuration file the behavior is similar to the following:

<img src="../img/import/wmc_import.gif" class="ms-docimage"/>

!!! warning
    Adding a map context file the current map context will be overridden.

## Import vector files

Importing vector files, the **Add Local Vector Files** window opens:

<img src="../img/import/add-vector.jpg" class="ms-docimage" style="max-width:600px;"/>

In particular, from this window, it is possible to:

* Choose the layer (when more than one layer is import at the same time)

* Set the layer style or keep the default one

* Toggle the **Zoom on the vector files**

Once the settings are done, the files can be added with the <img src="../img/button/add_group_confirm_button.jpg" class="ms-docbutton"/> button and they will be immediately available in the [TOC](toc.md) nested inside the *Imported layers* group. For example:

<img src="../img/import/local-files-added.jpg" class="ms-docimage" style="max-width:300px;"/>

!!! warning
    Currently is not possible to read the [Attribute Table](attributes-table.md) of the imported vector files and for this reason also the [Layer Filter](filtering-layers.md) and the creation of [Widgets](widgets.md) are not allowed for those layers.