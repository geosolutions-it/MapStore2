# Attribute Table

*****************

In GIS, the Attribute Table associated to a vector layer is a table that stores tabular information related to the layer. The columns of the table are called fields and the rows are called records. Each record of the attribute table corresponds to a feature geometry of the layer. This relation allows to find records in the table (information) by selecting features on the map and viceversa.<br>
In [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/), through the <img src="../img/button/attributes-table.jpg" class="ms-docbutton"/> button in [Layers Toolbar](toc.md#toolbar-options) it is possible to access the Attribute table:

<img src="../img/attributes-table/attributes-table-1.jpg" class="ms-docimage"/>

Accessing this panel the user can perform the following main operations:

* [Edit records](#editing-and-removing-existing-features) through the <img src="../img/button/edit_button.jpg" class="ms-docbutton"/> button

* Filter records in Attribute Table in different ways as described in the [Set filter](#set-filters) section below

* Open the [Advanced Search](#advanced-search) tool through the <img src="../img/button/filter-icon.jpg" class="ms-docbutton"/> button

* Activate the [filter by the current viewport](#quick-filter-by-viewport), through the <img src="../img/button/filter-by-viewport-button.jpg" class="ms-docbutton"/> button

* Activate the filtering capabilities by [clicking on map](#quick-filter-by-map-interaction), through <img src="../img/button/filter_geometry_button.jpg" class="ms-docbutton"/> button

* Using the [quick filter by attribute](#quick-filter-by-attributes)

* Download the grid data through the <img src="../img/button/export_data.jpg" class="ms-docbutton"/> button

* Create [Widgets](widgets.md#widgets) through the <img src="../img/button/widgets.jpg" class="ms-docbutton"/> button

* Customize the attribute table display through the <img src="../img/button/customize_attribute_table.jpg" class="ms-docbutton"/> button

* Zoom to features through the <img src="../img/button/zoom-feature.jpg" class="ms-docbutton"/> button available on each record or zoom to the page max extent through the <img src="../img/button/zoom_button.jpg" class="ms-docbutton"/> button (available only if the virtual scrolling is disabled, it is enabled by default in MapStore).

!!!warning
    When GeoServer is set to strict CITE compliance for WFS (by default), the feature grid do not work correctly.
    This is because MapStore uses by default WFS 1.1.0 with startIndex/maxFeatures. This is not strict compliant with WFS 1.1.0 (GeoServer supports it but the request in strict mode is invalid). To solve it un-check the CITE compliance checkbox in the "WFS" page of GeoServer "Services" configurations using the GeoServer web interface

## Set filters

In the Attribute Table it is possible to apply different types of filter, in particular the **Advanced search** tool and the **Quick filter** options are available

### Advanced Search

This filter, applicable from **Advanced Search** button <img src="../img/button/advanced-search.jpg" class="ms-docbutton"/> in the *Attribute Table* toolbar, opens the [Query Panel](filtering-layers.md#query-panel) which, in the Attribute Table, behaves as follows:

* It can be used to apply a filter to a layer for search purposes: this filter is applied in `AND` to the *Layer Filter* if it is already been set on layer side.

<img src="../img/attributes-table/filtered_features_grid.jpg" class="ms-docimage"/>

* It is possible to sync this filter with the map through the <img src="../img/button/sync.jpg" class="ms-docbutton"/> icon:

<video class="ms-docimage" controls><source src="../img/attributes-table/ar_sync.mp4"/></video>

* It will be automatically removed/reapplied by closing/opening the *Attribute Table*

### Quick Filter

The user can perform three type of quick filters:

* Filter by **attributes**

* Filter by **clicked point in the map**

* Filter by **viewport**

#### Quick Filter by attributes

This filter is available for each colum in the *Attribute Table* just below the field names and it can be also used in combination with other filter applied:

<video class="ms-docimage" controls><source src="../img/attributes-table/filtered_quick_filter.mp4"/></video>

The user has the possibility to apply simple filters by attributes typing the filter's value in the available input fields (Date or Time pickers are available according to the attributes data types). Filtering by one or more attributes, layer records in *Attribute Table* are automatically filtered accordingly.

If the user wants to filter by an attribute, he can simply write the desired filter value inside the input box and the list of records in table will be automatically filtered by matching with the input text.

<img src="../img/attributes-table/attribute-table-quick-filter-1.jpg" class="ms-docimage"/>

The user can also filter an attribute using the input box. From the dropdown menu it is possible to choose the operator to use (for the *String* attribute it can be `=`, `like`, `ilike` or `isNull`, for the *Integer*, *Data* or *Time* attribute, it can be instead `=`, `>`, `<`, `>=`, `<=`, `<>`, `><` or `isNull`)

<img src="../img/attributes-table/operations_drop_down_menu.jpg" class="ms-docimage"/>

In order to filter a numerical filed matching the records *greater than* or *equal* to a certain threshold value, an example can be:

<img src="../img/attributes-table/attribute-table-quick-filter-3.jpg" class="ms-docimage"/>

The user can also filter the records, of the *Date*, *Time* and *DateTime* attributes, through the *Date Picker* option by clicking on the <img src="../img/button/date_picker.jpg" class="ms-docbutton"/> button for *Date* attributes, the <img src="../img/button/time_picker.jpg" class="ms-docbutton"/> button for *Time* attributes and the <img src="../img/button/date_time_picker.jpg" class="ms-docbutton"/> button for *DateTime* attributes. To filter a *DateTime* attribute using the **Date Picker** option, an example can be the following:

<video class="ms-docimage" style="max-width:700px;" controls><source src="../img/attributes-table/data_time_picker_example.mp4"/></video>

In the *Date Picker* option, with the `><` operator selected, the **Time Range** picker is supported. Here the user can select the *Start Date* and the *End Date* to filter the attribute, an example can be the following:

<video class="ms-docimage" style="max-width:700px;" controls><source src="../img/attributes-table/time_range_picker_example.mp4"/></video>

#### Quick Filter by map interaction

It is possible to filter records in the *Attribute Table* by clicking on the map or doing a selection directly in a map of multiple features. The user can activate the  **Filter on the map** <img src="../img/button/filter_geometry_button.jpg" class="ms-docbutton"/> button (once clicked the button turns blue) and then:

* Click on the map over the features he wants to select

* Add multiple features to the selection by pressing Ctrl and clicking again over other features in map

<video class="ms-docimage" controls><source src="../img/attributes-table/filter_geometry.mp4"/></video>

* Add multiple features to the selection by pressing Ctrl + Alt and drawing a selection box in map

 <video class="ms-docimage" controls><source src="../img/attributes-table/filter_geometries.mp4"/></video>

The list of records in the *Attribute Table* will be automatically filtered according to such user selection and then the user can disable the geometry filter through the **Remove filter** <img src="../img/button/remove_filter_geometry.jpg" class="ms-docbutton"/> button.

#### Quick Filter by viewport

From the *Attribute Table* the user can filter data by map viewport through the **Filter by viewport** <img src="../img/button/filter-by-viewport-button.jpg" class="ms-docbutton"/> button. Once clicked, the toggle button turns its state to green and the list of records in the *Attribute Table* is filtered by showing only records corresponding to layer features present in the current map viewport.

<video class="ms-docimage" controls><source src="../img/attributes-table/filter_viewport.mp4"/></video>

The list of records in the *Attribute Table* is automatically updated when the user pan/zoom the map view. It is possible to deactivate the **Filter by viewport** <img src="../img/button/filter-by-viewport-enable.jpg" class="ms-docbutton"/> by clicking again the same toggle button.

!!! note
    The *Quick Filter* remains active as long as the [Attribute Table](attributes-table.md#attribute-table) is open but, unlike the *Advanced Search*, closing the *Attribute Table* it will not reappear anymore if the *Attribute Table* is re-opened in a second time.

## Manage records

The basic Web Feature Service allows querying and retrieval of features. Through Transactional Web Feature Services (WFS-T) [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) allows creation, deletion, and updating of features.

!!! warning
    By default editing functionalities are available only for MapStore *Admin* users. Other users can use these tools only if explicitly configured in the plugin configuration (see the [APIs documentation](https://dev-mapstore.geosolutionsgroup.com/mapstore/docs/api/plugins#plugins.FeatureEditor) for more details). In any case, the user must have editing rights on the layer to edit it (see for example the [GeoServer Security Settings](https://docs.geoserver.org/stable/en/user/security/webadmin/data.html)).

The *Edit mode* can be reached from the <img src="../img/button/editing-button.jpg" class="ms-docbutton"/> button in *Attribute Table* panel, allowing to menage only the layer which the table refers to:

<img src="../img/attributes-table/attribute-table-editing-layer.jpg" class="ms-docimage"/>

!!! note
    When the *Edit mode* is enabled only the editing functionalities are available to the user, all other tools are deactivated.

By default, in *Edit mode*, you can see a panel like that following:

<img src="../img/attributes-table/edit-mode.jpg" class="ms-docimage"/>

Through the **Quit edit mode** button <img src="../img/button/quit-edit-mode-button.jpg" class="ms-docbutton"/> you can stop the editing session to make the other functionalities available again.

### Create new features

Once the *Edit mode* is enabled it is possible to create a new feature by clicking on the **Add New Feature** button <img src="../img/button/add-new-feature-icon.jpg" class="ms-docbutton"/>. After clicking on it the user can fill out the fields and edit the geometry of the new feature:

<img src="../img/attributes-table/add-new-feature-attributes.jpg" class="ms-docimage"/>

To edit attributes MapStore provides some input fields based on the attribute type, that forces the user to insert a valid value. If the attribute is of type `text`, MapStore will also show a dropdown menu with the list of the existing values for that attribute to allow a quick selection.

!!! note
    the dropdown menu is available only if the server provides the WPS process `gs:PagedUnique`

The *Missing geometry* exclamation point <img src="../img/button/missing-geometry-exclamation-point.jpg" class="ms-docbutton"/> in the second column of the *Attribute Table* means that the feature doesn't have a geometry yet. It's possible to add it later or draw it on the map before saving:

<img src="../img/attributes-table/missing-geometry.jpg" class="ms-docimage" style="max-width:300px;"/>

In order to save the changes made until now, there's the <img src="../img/button/save-changes.jpg" class="ms-docbutton"/> button, whereas to undo the changes there's the <img src="../img/button/cancel-changes.jpg" class="ms-docbutton"/> button. <br>
Once a new record is created, it's possible to draw a geometry for it, by clicking on the <img src="../img/button/add-shape-icon.jpg" class="ms-docbutton"/> button that appears once that feature is selected. The process of drawing a new geometry is a little different depending on the layer type:

* For *Polygons* and *Multipolygons* layers, each click on the map add a new vertex (the minimum is 3). Once the vertex are set, it is possible to change the shape by creating new vertices or dragging the existing ones:

<video  class="ms-docimage" controls><source src="../img/attributes-table/drawing-polygon-shape.mp4"/></video>

* For *Lines* and *Multilines* layers the shape drawing function works more or less in the same way. The only difference is that you need at least two vertices to draw a line and not three like for polygons:

<video  class="ms-docimage" controls><source src="../img/attributes-table/drawing-line-shape.mp4"/></video>

* For *Points* layers a point is drawn for each click on the map

<video  class="ms-docimage" controls><source src="../img/attributes-table/drawing-point-shape.mp4"/></video>

The user is always allowed to delete the drawn shape through the <img src="../img/button/delete-geometry-button.jpg" class="ms-docbutton"/> button.

#### Create new geometry with Snapping

To fine tune the vertex position while editing or creating a new feature geometry, it is possible to leverage on the Snapping functionality. Through this function <img src="../img/button/snapping.jpg" class="ms-docbutton"/> it is possible to snap to other vertices of features belonging to the same layer or to others while editing a feature.

<video  class="ms-docimage" controls><source src="../img/attributes-table/add-new-snapping-geometry.mp4"/></video>

The tool provides the ability to tune the snapping function so that the user can:

* Choose one of the visible map layers in TOC to be used for the snapping

<video  class="ms-docimage" controls><source src="../img/attributes-table/snap-new-layer.mp4"/></video>

* Choose where to snap the layer, enabling/disabling the **Edge** or/and the **Vertex**

* Set **Tolerance** for considering the pointer close enough to a segment or vertex for snapping

* Choose the **Loading strategy** of features to snap with by choosing one of the available options from the dropdown menu. Available options are:</p>
  * *bbox*: only features in the current viewport are loaded</p>
  * *all*: all layer features are loaded

!!! note
    The snapping functionality is by default set to work with the same layer in editing mode. By default, the **Edge** and the **Vertex** are enabled, the **Tolerance** is set to 10 `pixel` and the **Loading strategy** is set to *bbox*.

### Editing and removing existing features

In order to edit an existing feature, it is necessary to switch the Attribute Table in editing mode by clicking the *Edit mode* <img src="../img/button/editing-button.jpg" class="ms-docbutton"/> button. If the goal is to edit the Attribute Table records, the user can simply select them and type the desired value into the input field. However, it is also possible to modify the geometry associated with a record by editing it on the map (adding or changing its vertices).

<video  class="ms-docimage" controls><source src="../img/attributes-table/update-polygon-shape.mp4"/></video>

!!! note
    It is possible to edit the value of an attribute for multiple records at once by selecting the corresponding cell in the table and dragging the content onto the multiple cells, as follows:
    <video  class="ms-docimage" style="max-width:300px;" controls><source src="../img/attributes-table/multiple_features.mp4"/></video>

With a click on **Save changes** <img src="../img/button/save-changes.jpg" class="ms-docbutton"/> these changes will be persistent.<br> In *Edit mode*, the user can also delete some features by selecting them in the table and clicking on the <img src="../img/button/delete-features-button.jpg" class="ms-docbutton" /> button.

## Download the grid data

Form the Attribute table it is also possible to download the grid data through the <img src="../img/button/export_data.jpg" class="ms-docbutton"/> button. The following window opens:

<img src="../img/attributes-table/download_grid.jpg" class="ms-docimage" style="max-width:500px;"/>

From this window it is possible to set:

* The **File Format** (`GML2`, `Shapefile`, `GeoJSON`, `KML`, `CSW`, `GML3.1` or `GML3.2`)

* The **Spatial Reference System** (by default `Native` or `WGS84`)

With a click on the <img src="../img/button/export_at.jpg" class="ms-docbutton"/> button and the browser will download the file.

## Customize Attribute table display

[MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) allows the user to customize the fields displayed in Attribute table mainly in two way:

* Ordering the records in alphabetic order (if it's a text field) or from the minimum to the maximum value and viceversa (if it's a numerical field):

<video  class="ms-docimage" controls><source src="../img/attributes-table/ordering_records.mp4"/></video>

* Deciding which columns to show and which to hide through the <img src="../img/button/hide_show_col.jpg" class="ms-docbutton"/> button:

<video  class="ms-docimage" controls><source src="../img/attributes-table/show_hide_columns.mp4"/></video>
