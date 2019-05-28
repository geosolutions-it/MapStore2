# Attribute Table
*****************
In GIS, the attribute table associated to a vector layer is a table that stores tabular informations related to the layer. The columns of the table are called fields and the rows are called records. Each record of the attribute table corresponds to one feature geometry of the layer. This relation allows to find records in the table (informations) by selecting features on the map and viceversa.

In [MapStore](https://mapstore2.geo-solutions.it/mapstore/#/), accessing the attribute table of a vector layer allows you to edit the tabular data or to directly edit the geometries on the map, to perform spatial queries and filters and to create widgets from the data.

!!! note
    Creating widgets for a layer is accessible from the *TOC* and the *Attribute Table* by clicking on this icon <img src="../img/widgets.jpg" style="max-width:20px;"/> and was already treated in the [Widgets](widgets.md) section.

* **Open** a new map.
* **Add** a vector layer (e.g. USA Population).
* **Select** the layer.
* **Click** on the *Open Attribute Table* icon <img src="../img/attributes-table.jpg" style="max-width:20px;"/>, you will note that the table has 49 items (rows).

The attribute table will open showing the data table and a set of functionalities.

<img src="../img/attributes-table-1.jpg" style="max-width:600px;"/>

!!! warning
    When GeoServer is set to strict CITE compliance for WFS (by default), the feature grid do not work correctly.
    This is because MapStore uses by default WFS 1.1.0 with startIndex/maxFeatures. This is not strict compliant with WFS 1.1.0 (GeoServer supports it but the request in strict mode is invalid). To solve it un-check the CITE compliance checkbox in the "WFS" page of GeoServer "Services" configurations using the GeoServer web interface.

Editing
-------

The basic Web Feature Service allows querying and retrieval of features.
Through Transactional Web Feature Services (WFS-T) [MapStore](https://mapstore2.geo-solutions.it/mapstore/#/) allows creation, deletion, and updating of features.

!!! warning
    By default editing functionalities are available only for MapStore ***Admin*** users. Other users can use these tools only if explicitly configured in the plugin configuration (see the [APIs documentation](https://dev.mapstore2.geo-solutions.it/mapstore/docs/api/plugins#plugins.FeatureEditor) for more details). In any case, the user must have editing rights on the layer to edit it (see for example the [GeoServer Security Settings](https://docs.geoserver.org/stable/en/user/security/webadmin/data.html)).

The **Editing** tools can be reached from the *Attribute Table* panel and they allow to edit only the layer which the table refers to.

* **Open** the *Attribute Table* of a layer (e.g '`Lakes, Mountains and Forest`')

    <img src="../img/attribute-table-editing-layer.jpg" />

* **Click** on the *Edit mode* icon <img src="../img/editing-button.jpg" style="max-width:25px;" /> to start an editing session

!!! note
    When the *Edit mode* is enabled only the editing functionalities are available to the user, all other tools are deactivated.

By default, in *Edit mode*, you can see a panel like that below:

<img src="../img/edit-mode.jpg" />

Through the *Quit edit mode* button <img src="../img/quit-edit-mode-button.jpg" style="max-width:25px;" /> you can stop the editing session to make the other functionalities available again.

### Creation of features

Once the *Edit mode* is enabled, you can add new features to your layers as described in the following steps:

* **Click** on the *Add New Feature* icon <img src="../img/add-new-feature-icon.jpg" style="max-width:25px;" /> to create a new row in the *Attribute Table* and fill out its fields

    <img src="../img/add-new-feature-attributes.jpg" />

    When editing a text field, MapStore provides some suggestion such as the *type* field above so you can choose the value from a select menu.
    <br>
    The *Missing geometry* exclamation point <img src="../img/missing-geometry-exclamation-point.jpg" style="max-width:25px;" /> in the second column of the *Attibute Table* means that the feature doesn't have a geometry yet. You can add it later or draw it on the map before saving.

    <img src="../img/missing-geometry.jpg" style="max-width:300px;" />

    If you want to save the changes made until now, **Click** on the *Save changes* icon <img src="../img/save-changes.jpg" style="max-width:25px;" />.
    <br>
    To undo your changes and exit from the *Add New Feature* process **Click** on the *Cancel changes* icon <img src="../img/cancel-changes.jpg" style="max-width:25px;" />.

* **Click** on the *Add a shape to existing geometry* icon <img src="../img/add-shape-icon.jpg" style="max-width:25px;" /> to draw the shape on the map.

    In the case of the '`Lakes, Mountains and Forest`' layer we have ***Polygons and Multipolygons*** geometries so for each click on the map one new vertex is added to the geometry shape, you should draw at least three vertices for each polygon. You can change the shape dragging vertices in new positions anytime with your mouse.

    <img src="../img/drawing-polygon-shape.gif" />

    You can delete the whole shape with the *Delete geometry* button <img src="../img/delete-geometry-button.jpg" style="max-width:25px;" />.
    <br>

* **Click** on the *Save changes* button <img src="../img/save-changes.jpg" style="max-width:25px;" /> to commit your changes.

For ***Lines and Multilines*** geometries (e.g. '`Roads`' layer) the shape drawing function works more or less in the same way. The only difference is that you need at least two vertices to draw a line and not three vertices like for polygons.

<img src="../img/drawing-line-shape.gif" />

For ***Points*** geometries (e.g. '`Points of Interest`' layer) you can see a marker <img src="../img/marker.jpg" style="max-height:25px;" /> on your mouse cursor, a point is drawn down when you click on the map.

<img src="../img/drawing-point-shape.gif" />

### Updating of features

If you want to update an existing feature, start an editing session by clicking the *Edit mode* icon <img src="../img/editing-button.jpg" style="max-width:25px;" /> button and follow these steps:

* **Select** the feature of interest by clicking the corresponding box in the first column of the *Attribute Table*

* If you need to do update the attributes values, **type** your new data into the input fields

* If you want to update the geometry shape, you can:

    * **move** the existing vertices to new positions

    * **click** on the *Add a shape to the existing geometry* button <img src="../img/add-shape-icon.jpg" style="max-width:25px;" /> to draw a new shape

* **Click** on the **Save changes** button <img src="../img/save-changes.jpg" style="max-width:25px;" /> to commit your changes.

<img src="../img/update-polygon-shape.gif" />

### Deletion of features

In *Edit mode*, you can delete existing features following these steps:

* **Select** the features of interest by clicking the corresponding boxes in the first column of the *Attribute Table*

* **Click** on the *Delete selected features* button <img src="../img/delete-features-button.jpg" style="max-width:25px;" /> to trigger the deletion of the selected features

* **Confirm** your choice in the subsequent dialog by clicking on '`Delete`' or return back by clicking '`Close`'

<img src="../img/delete-line-shape.gif" />

Advanced Filtering
------------------

[MapStore](https://mapstore2.geo-solutions.it/mapstore/#/) allows you to filter and select the data by attribute or by region and to perform cross filtering between two present layers in the map.

* **Click** on the *Advanced Search* icon <img src="../img/filter-icon.jpg" style="max-width:25px;" />.

The filtering page will open showing *Filters Types*.

<p align = "center" ><img src="../img/filter-types.jpg" style="max-width:500px;"/></p>

### Filtering by Attributes

The *Attribute Filter* allows you to set conditions on the fields to perform **AND**/**OR** logic operations.

Since the following example is based on filtering the data with respect to the *Persons* and *Employed* filelds, let us first switch off the unnecessary fields for a better visualization. To do that:

* **Click** on the *Hide/Show columns* button <img src="../img/hide-show.jpg" style="max-width:25px;" />.

* **Switch off** the fields leaving only the **STATE_NAME**, **PERSONS** and **EMPLOYED**.

<p align = "center" ><img src="../img/hide-show-1.jpg" style="max-width:620px;"/></p>

Now, let us set some filters.

* **Click** on the <img src="../img/++.jpg" style="max-width:20px;"/> button to add a condition.

<p align = "center" ><img src="../img/attribute-filter-1.jpg" style="max-width:500px;"/></p>

* **Set** the following condition for example; **Persons >= 6 000 000**.

<p align = "center" ><img src="../img/attribute-filter-5.jpg" style="max-width:620px;"/></p>

* **Click** on the loop icon to search <img src="../img/loop.jpg" style="max-width:20px;"/>

The filtered records by persons will be shown in the attribute table.

<p align = "center" ><img src="../img/attribute-filter-2.jpg" style="max-width:620px;"/></p>

!!! note
    We have got 13 items.

If you want to to see the filtered records also on the map, follow these steps:

* **Click** on the <img src="../img/sync.jpg" style="max-width:20px;"/> icon to synchronize the map with the filter.

<p align = "center" ><img src="../img/attribute-filter-3.jpg" style="max-width:620px;"/></p>

Now let us add other conditions:

* **Click** again on the *Advanced Search* icon <img src="../img/filter-icon.jpg" style="max-width:25px;" />.

* **Click** on the <img src="../img/++.jpg" style="max-width:20px;"/> button to add a second condition.

* **Set** the following condition (for example the employed persons between 2M and 5M): **Employed >< 2 000 000, 5 000 000**.

!!! note
    We are using *"Match any of the following conditions"* which is an **OR** logic operator.

<p align = "center" ><img src="../img/attribute-filter-4.jpg" style="max-width:620px;"/></p>

* **Click** on the loop icon to search <img src="../img/loop.jpg" style="max-width:20px;"/>.

As displayed in the picture below, the filter will return 20 records:

<p align = "center" ><img src="../img/attribute-filter-6.jpg" style="max-width:620px;"/></p>

In order to switch to an **AND** operator you have to follow these steps:

* **Click** again on the *Advanced Search* icon <img src="../img/filter-icon.jpg" style="max-width:25px;" />.

* **Select** form the droplist **all** instead of **any**.

<p align = "center" ><img src="../img/attribute-filter-7.jpg" style="max-width:620px;"/></p>

* **Click** on the loop icon to search <img src="../img/loop.jpg" style="max-width:20px;"/>.

The filter will return 7 records:

<p align = "center" ><img src="../img/attribute-filter-8.jpg" style="max-width:620px;"/></p>

### Filtering by Location

The second filter type called **Region of Interest** allows the user to filter the features overlaying drawn geometric shapes on the map.

<p align = "center" ><img src="../img/geometry-filter.jpg" style="max-width:620px;"/></p>

* **Select** the *Filter Type*, e.g. Circle.
* **Draw** the circle on the map; eventually you can change the position of the center and the radius by clicking on the icon <img src="../img/edit-icon-1.jpg" style="max-width:30px;"/>.
* **Set** the *Geometric Operation*, e.g.Contains.

<p align = "center" ><img src="../img/geometry-filter-1.jpg" style="max-width:700px;"/></p>

* **Click** on the loop icon to apply the filter <img src="../img/loop.jpg" style="max-width:20px;"/>.

<p align = "center" ><img src="../img/geometry-filter-2.jpg" style="max-width:600px;"/></p>

!!! note
    The *Geometric Operation* **Contains** will extract the features entirely contained in the drawn geometry while  the *Geometric Operation* **Intersects** will extract the features that have a part intersecting the geometry.

### Layer Filtering

*Layer Filter* allows the user to filter the features of a vector layer with respect to another one. For example, which features of the first layer are contained in the second or intersect the second.

* **Open** a new map.
* **Add** a vector layer (e.g. thematism_regioni).
* **Add** a second vector layer (e.g. Unesco Items)

<p align = "center" ><img src="../img/layer-filter-1.jpg" style="max-width:600px;"/></p>

Let us suppose that we want to get all the Unesco sites in Sicily. To do it:


* **Select** the layer *Unseco Items*.
* **Click** on the *Open Attribute Table* icon <img src="../img/attributes-table.jpg" style="max-width:20px;"/>.
* **Click** on the *Advanced Search* icon <img src="../img/filter-icon.jpg" style="max-width:25px;" />.

In the *Layer filter* section:

* **Set** the *Target layer* choosing the layer *thematism_regioni* from the list.
* **Choose** the appropriate *Operation*; in this case *Contains*.
* **Add** a condition as the following: **cod_reg = 19** since the region code of Sicily is equal to 19.

<p align = "center" ><img src="../img/layer-filter-2.jpg" style="max-width:600px;"/></p>

* **Click** on the loop icon to apply the filter <img src="../img/loop.jpg" style="max-width:20px;"/>.

Apparently nothing is changed on the map but the filter returned 20 items in the attributes table.

* **Click** on the <img src="../img/sync.jpg" style="max-width:20px;"/> icon to synchronize the map with the filter.

<p align = "center" ><img src="../img/layer-filter-3.jpg" style="max-width:600px;"/></p>
