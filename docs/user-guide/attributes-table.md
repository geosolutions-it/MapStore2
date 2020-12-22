# Attribute Table
*****************

In GIS, the Attribute Table associated to a vector layer is a table that stores tabular information related to the layer. The columns of the table are called fields and the rows are called records. Each record of the attribute table corresponds to a feature geometry of the layer. This relation allows to find records in the table (information) by selecting features on the map and viceversa.<br>
In [MapStore](https://mapstore.geo-solutions.it/mapstore/#/), through the <img src="../img/button/attributes-table.jpg" class="ms-docbutton"/> button in [Layers Toolbar](toc.md#toolbar-options) it is possible to access the Attribute table:

<img src="../img/attributes-table/attributes-table-1.jpg" class="ms-docimage"/>

Accessing this panel the user can perform the following main operations:

* [Edit records](attributes-table.md#editing-and-removing-existing-features) through the <img src="../img/button/edit_button.jpg" class="ms-docbutton"/> button 

* Filter records in Attribute Table in different ways as described in the [Set filter](attributes-table.md#set-filters) section below

* Opening the [Advanced Search](filtering-layers.md#query-panel) tool through the <img src="../img/button/filter-layer.jpg" class="ms-docbutton"/> button

* Activating the filtering capabilities by [clicking on map](filtering-layers.md#quick-filter-by-map-interaction), through <img src="../img/button/filter_geometry_button.jpg" class="ms-docbutton"/> button 

* Using the [quick filter by attribute](filtering-layers.md#quick-filter-by-attributes)

* Download the grid data through the <img src="../img/button/export_data.jpg" class="ms-docbutton"/> button 

* Customize the attribute table display through the <img src="../img/button/customize_attribute_table.jpg" class="ms-docbutton"/> button

* Create [Widgets](widgets.md) through the <img src="../img/button/widgets.jpg" class="ms-docbutton"/> button

* Zoom to features through the <img src="../img/button/zoom-feature.jpg" class="ms-docbutton"/> button available on each record or zoom to the page max extent through the <img src="../img/button/zoom_button.jpg" class="ms-docbutton"/> button (available only if the virtual scrolling is disabled, it is enabled by default in MapStore). 

!!!warning
    When GeoServer is set to strict CITE compliance for WFS (by default), the feature grid do not work correctly.
    This is because MapStore uses by default WFS 1.1.0 with startIndex/maxFeatures. This is not strict compliant with WFS 1.1.0 (GeoServer supports it but the request in strict mode is invalid). To solve it un-check the CITE compliance checkbox in the "WFS" page of GeoServer "Services" configurations using the GeoServer web interface

## Manage records

The basic Web Feature Service allows querying and retrieval of features. Through Transactional Web Feature Services (WFS-T) [MapStore](https://mapstore.geo-solutions.it/mapstore/#/) allows creation, deletion, and updating of features.

!!! warning
    By default editing functionalities are available only for MapStore *Admin* users. Other users can use these tools only if explicitly configured in the plugin configuration (see the [APIs documentation](https://dev.mapstore.geo-solutions.it/mapstore/docs/api/plugins#plugins.FeatureEditor) for more details). In any case, the user must have editing rights on the layer to edit it (see for example the [GeoServer Security Settings](https://docs.geoserver.org/stable/en/user/security/webadmin/data.html)).

The *Edit mode* can be reached from the <img src="../img/button/editing-button.jpg" class="ms-docbutton"/> button in *Attribute Table* panel, allowing to menage only the layer which the table refers to:

<img src="../img/attributes-table/attribute-table-editing-layer.jpg" class="ms-docimage"/>

!!! note
    When the *Edit mode* is enabled only the editing functionalities are available to the user, all other tools are deactivated.

By default, in *Edit mode*, you can see a panel like that following:

<img src="../img/attributes-table/edit-mode.jpg" class="ms-docimage"/>

Through the **Quit edit mode** button <img src="../img/button/quit-edit-mode-button.jpg" class="ms-docbutton"/> you can stop the editing session to make the other functionalities available again.

### Create new features

Once the *Edit mode* is enabled it is possible to create a new feature by clicking on the **Add New Feature** button <img src="../img/button/add-new-feature-icon.jpg" class="ms-docbutton"/>. After clicking on it the user can fill out the fields and edit the geometry of the new feature:

<img src="../img/attributes-table/add-new-feature-attributes.jpg" class="ms-docimage" style="max-width:500px;"/>

To edit attributes MapStore provides some input fields based on the attribute type, that forces the user to insert a valid value. If the attribute is of type `text`, MapStore will also show a dropdown menu with the list of the existing values for that attribute to allow a quick selection.

!!! note
    the dropdown menu is available only if the server provides the WPS process `gs:PageUnique`

The *Missing geometry* exclamation point <img src="../img/button/missing-geometry-exclamation-point.jpg" class="ms-docbutton"/> in the second column of the *Attribute Table* means that the feature doesn't have a geometry yet. It's possible to add it later or draw it on the map before saving:

<img src="../img/attributes-table/missing-geometry.jpg" class="ms-docimage" style="max-width:300px;"/>

In order to save the changes made until now, there's the <img src="../img/button/save-changes.jpg" class="ms-docbutton"/> button, whereas to undo the changes there's the <img src="../img/button/cancel-changes.jpg" class="ms-docbutton"/> button. <br>
Once a new record is created, it's possible to draw a geometry for it, by clicking on the <img src="../img/button/add-shape-icon.jpg" class="ms-docbutton"/> button that appears once that feature is selected. The process of drawing a new geometry is a little different depending on the layer type:

* For *Polygons* and *Multipolygons* layers, each click on the map add a new vertex (the minimum is 3). Once the vertex are set, it is possible to change the shape by creating new vertices or dragging the existing ones:

<img src="../img/attributes-table/drawing-polygon-shape.gif" class="ms-docimage"/>

* For *Lines* and *Multilines* layers the shape drawing function works more or less in the same way. The only difference is that you need at least two vertices to draw a line and not three like for polygons:

<img src="../img/attributes-table/drawing-line-shape.gif" class="ms-docimage"/>

For *Points* layers a point is drawn for each click on the map

<img src="../img/attributes-table/drawing-point-shape.gif" class="ms-docimage"/>

The user is always allowed to delete the drawn shape through the <img src="../img/button/delete-geometry-button.jpg" class="ms-docbutton"/> button.

### Editing and removing existing features

In order to edit an existing feature, it is necessary to switch the Attribute Table in editing mode by clicking the *Edit mode* <img src="../img/button/editing-button.jpg" class="ms-docbutton"/> button. If the goal is to edit the Attribute Table records, the user can simply select them and type the desired value into the input field. However, it is also possible to modify the geometry associated with a record by editing it on the map (adding or changing its vertices).

<img src="../img/attributes-table/update-polygon-shape.gif" class="ms-docimage"/>

!!! note
    It is possible to edit the value of an attribute for multiple records at once by selecting the corresponding cell in the table and dragging the content onto the multiple cells, as follows:
    <img src="../img/attributes-table/multiple_features.gif" class="ms-docimage" style="max-width:300px;"/>

With a click on **Save changes** <img src="../img/button/save-changes.jpg" class="ms-docbutton"/> these changes will be persistent.<br> In *Edit mode*, the user can also delete some features by selecting them in the table and clicking on the <img src="../img/button/delete-features-button.jpg" class="ms-docbutton" /> button.

## Set filters

In the Attribute table it is possible to apply filters in three ways (as explained in the [Filtering layers](filtering-layers.md) section):

* [Advanced search](filtering-layers.md#advanced-search)

* [Click on map](filtering-layers.md#quick-filter-by-map-interaction)

* [Quick filter](filtering-layers.md#quick-filter-by-attributes)

Those filters, once applied, can be visible on the map by enabling the <img src="../img/button/sync.jpg" class="ms-docbutton"/> button.

## Download the grid data

Form the Attribute table it is also possible to download the grid data through the <img src="../img/button/export_data.jpg" class="ms-docbutton"/> button. The following window opens:

<img src="../img/attributes-table/download_grid.jpg" class="ms-docimage" style="max-width:500px;"/>

From this window it is possible to set:

* The **File Format** (`GML2`, `Shapefile`, `GeoJSON`, `KML`, `CSW`, `GML3.1` or `GML3.2`)

* The **Spatial Reference System** (by default `Native` or `WGS84`)

With a click on the <img src="../img/button/export_at.jpg" class="ms-docbutton"/> button and the browser will download the file.

## Customize Attribute table display

[MapStore](https://mapstore.geo-solutions.it/mapstore/#/) allows the user to customize the fields displayed in Attribute table mainly in two way:

* Ordering the records in alphabetic order (if it's a text field) or from the minimum to the maximum value and viceversa (if it's a numerical field):

<img src="../img/attributes-table/ordering_records.gif" class="ms-docimage"/>

* Deciding which columns to show and which to hide through the <img src="../img/button/hide_show_col.jpg" class="ms-docbutton"/> button:

<img src="../img/attributes-table/show_hide_columns.gif" class="ms-docimage"/>