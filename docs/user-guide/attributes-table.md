# Attribute Table
*****************

In GIS, the attribute table associated to a vector layer is a table that stores tabular informations related to the layer. The columns of the table are called fields and the rows are called records. Each record of the attribute table corresponds to one feature geometry of the layer. This relation allows to find records in the table (informations) by selecting features on the map and viceversa.

In [MapStore](https://mapstore.geo-solutions.it/mapstore/#/), accessing the attribute table of a vector layer allows you to edit the tabular data or to directly edit the geometries on the map, to perform spatial queries and filters and to create widgets from the data.

!!! note
    Creating widgets for a layer is accessible from the *TOC* and the *Attribute Table* by clicking on this icon <img src="../img/button/widgets.jpg" style="vertical-align:middle"/> and was already treated in the [Widgets](widgets.md) section.

* **Open** a new map.

* **Add** a vector layer (e.g. USA Population).

* **Select** the layer.

* **Click** on the *Open Attribute Table* icon <img src="../img/button/attributes-table.jpg" class="ms-docbutton"/>, you will note that the table has 49 items (rows).

The attribute table will open showing the data table and a set of functionalities.

<img src="../img/attributes-table/attributes-table-1.jpg" class="ms-docimage"/>

!!! warning
    When GeoServer is set to strict CITE compliance for WFS (by default), the feature grid do not work correctly.
    This is because MapStore uses by default WFS 1.1.0 with startIndex/maxFeatures. This is not strict compliant with WFS 1.1.0 (GeoServer supports it but the request in strict mode is invalid). To solve it un-check the CITE compliance checkbox in the "WFS" page of GeoServer "Services" configurations using the GeoServer web interface.

Editing
-------

The basic Web Feature Service allows querying and retrieval of features.
Through Transactional Web Feature Services (WFS-T) [MapStore](https://mapstore.geo-solutions.it/mapstore/#/) allows creation, deletion, and updating of features.

!!! warning
    By default editing functionalities are available only for MapStore ***Admin*** users. Other users can use these tools only if explicitly configured in the plugin configuration (see the [APIs documentation](https://dev.mapstore.geo-solutions.it/mapstore/docs/api/plugins#plugins.FeatureEditor) for more details). In any case, the user must have editing rights on the layer to edit it (see for example the [GeoServer Security Settings](https://docs.geoserver.org/stable/en/user/security/webadmin/data.html)).

The **Editing** tools can be reached from the *Attribute Table* panel and they allow to edit only the layer which the table refers to.

* **Open** the *Attribute Table* of a layer (e.g '`Lakes, Mountains and Forest`')

<img src="../img/attributes-table/attribute-table-editing-layer.jpg" class="ms-docimage"/>

* **Click** on the *Edit mode* icon <img src="../img/button/editing-button.jpg" class="ms-docbutton" /> to start an editing session

!!! note
    When the *Edit mode* is enabled only the editing functionalities are available to the user, all other tools are deactivated.

By default, in *Edit mode*, you can see a panel like that below:

<img src="../img/attributes-table/edit-mode.jpg" class="ms-docimage" />

Through the *Quit edit mode* button <img src="../img/button/quit-edit-mode-button.jpg" class="ms-docbutton"/> you can stop the editing session to make the other functionalities available again.

### Creation of features

Once the *Edit mode* is enabled, you can add new features to your layers as described in the following steps:

* **Click** on the *Add New Feature* icon <img src="../img/button/add-new-feature-icon.jpg" class="ms-docbutton"/> to create a new row in the *Attribute Table* and fill out its fields

<img src="../img/attributes-table/add-new-feature-attributes.jpg" class="ms-docimage" style="max-width:500px;"/>

When editing a text field, MapStore provides some suggestion such as the *type* field above so you can choose the value from a select menu.<br>
The *Missing geometry* exclamation point <img src="../img/button/missing-geometry-exclamation-point.jpg" class="ms-docbutton" /> in the second column of the *Attibute Table* means that the feature doesn't have a geometry yet. You can add it later or draw it on the map before saving.

<img src="../img/attributes-table/missing-geometry.jpg" class="ms-docimage" style="max-width:300px;" />

If you want to save the changes made until now, **Click** on the *Save changes* icon <img src="../img/button/save-changes.jpg" class="ms-docbutton"/>.<br>
To undo your changes and exit from the *Add New Feature* process **Click** on the *Cancel changes* icon <img src="../img/button/cancel-changes.jpg" class="ms-docbutton"  />.

* **Click** on the *Add a shape to existing geometry* icon <img src="../img/button/add-shape-icon.jpg" class="ms-docbutton"  /> to draw the shape on the map.

In the case of the '`Lakes, Mountains and Forest`' layer we have ***Polygons and Multipolygons*** geometries so for each click on the map one new vertex is added to the geometry shape, you should draw at least three vertices for each polygon. You can change the shape dragging vertices in new positions anytime with your mouse.

<img src="../img/attributes-table/drawing-polygon-shape.gif" class="ms-docimage"/>

You can delete the whole shape with the *Delete geometry* button <img src="../img/button/delete-geometry-button.jpg" class="ms-docbutton" />.

* **Click** on the *Save changes* button <img src="../img/button/save-changes.jpg" class="ms-docbutton" /> to commit your changes.

For ***Lines and Multilines*** geometries (e.g. '`Roads`' layer) the shape drawing function works more or less in the same way. The only difference is that you need at least two vertices to draw a line and not three vertices like for polygons.

<img src="../img/attributes-table/drawing-line-shape.gif" class="ms-docimage"/>

For ***Points*** geometries (e.g. '`Points of Interest`' layer) you can see a marker <img src="../img/attributes-table/marker.jpg" class="ms-docbutton" /> on your mouse cursor, a point is drawn down when you click on the map.

<img src="../img/attributes-table/drawing-point-shape.gif" class="ms-docimage"/>

### Updating of features

If you want to update an existing feature, start an editing session by clicking the *Edit mode* icon <img src="../img/button/editing-button.jpg" class="ms-docbutton" /> button and follow these steps:

* **Select** the feature of interest by clicking the corresponding box in the first column of the *Attribute Table*

* If you need to do update the attributes values, **type** your new data into the input fields

* If you want to update the geometry shape, you can:

    * **move** the existing vertices to new positions

    * **click** on the *Add a shape to the existing geometry* button <img src="../img/button/add-shape-icon.jpg" class="ms-docbutton" /> to draw a new shape

* **Click** on the **Save changes** button <img src="../img/button/save-changes.jpg" class="ms-docbutton" /> to commit your changes.

<img src="../img/attributes-table/update-polygon-shape.gif" class="ms-docimage" />

### Deletion of features

In *Edit mode*, you can delete existing features following these steps:

* **Select** the features of interest by clicking the corresponding boxes in the first column of the *Attribute Table*

* **Click** on the *Delete selected features* button <img src="../img/button/delete-features-button.jpg" class="ms-docbutton" /> to trigger the deletion of the selected features

* **Confirm** your choice in the subsequent dialog by clicking on '`Delete`' or return back by clicking '`Close`'

<img src="../img/button/delete-line-shape.gif" class="ms-docimage"/>

Quick Filtering
-------------------

The [MapStore](https://mapstore.geo-solutions.it/mapstore/#/) Attribute Table allows you to quickly filter the table records (features) by using the filter field located at the top of each column.

<img src="../img/attributes-table/attribute-table-quick-filter.jpg" class="ms-docimage" style="max-width:500px;"/>

To use quick filters, just type in the filter text in the filter fields located at the top of any column to be filtered.
For example to filter **Arizona State** type in **arizona** in the filter field located on **state_name** column.

<img src="../img/attributes-table/attribute-table-quick-filter-1.jpg" class="ms-docimage" style="max-width:500px;"/>

!!! note
    We have got **one** item and since the map is by default synchronized with the **attribute table**, only the **Arizona** state is visible.

### Operator based quick filtering

Quick filters allow you to filter records in the Attribute Table by using comparison operators (the operators must precede the filter text): operator can be used for all data type including float and date types.

<img src="../img/attributes-table/attribute-table-quick-filter-2.jpg" class="ms-docimage"/>

So far the operators allowed are as follows

* **!== or != or <>**  Not equal

* **<=**  Less than or equal

* **>=**  Greater than or equal

* **<**  Less than

* **>**  Greater than

* **=== or == or =** Equal, this is the internal default one if the operator isn't specified.

Examples:

* Filtering states with **persons >= 4,000,000**

<img src="../img/attributes-table/attribute-table-quick-filter-3.jpg" class="ms-docimage"/>

* Filtering states with male population **Male < 2000,0000**

<img src="../img/attributes-table/attribute-table-quick-filter-4.jpg" class="ms-docimage"/>

!!! note
    Please note the comparison operator preceding the filter text in both examples.

Advanced Filtering
------------------

In addition to quick filters, [MapStore](https://mapstore.geo-solutions.it/mapstore/#/) attribute table allows you to perform advance filtering and select the data by attribute or by region and to perform cross filtering between two present layers in the map.

* **Click** on the *Advanced Search* icon <img src="../img/button/filter-icon.jpg" class="ms-docbutton" />.

The filtering page will open showing *Filters Types*.

<img src="../img/attributes-table/filter-types.jpg" class="ms-docimage" style="max-width:500px;"/>

### Filtering by Attributes

The *Attribute Filter* allows you to set conditions on the fields to perform **AND**/**OR** logic operations.

Since the following example is based on filtering the data with respect to the *Persons* and *Employed* fields, let us first switch off the unnecessary fields for a better visualization. To do that:

* **Click** on the *Hide/Show columns* button <img src="../img/button/hide-show.jpg" class="ms-docbutton"/>.

* **Switch off** the fields leaving only the **STATE_NAME**, **PERSONS** and **EMPLOYED**.

<img src="../img/attributes-table/hide-show-1.jpg" class="ms-docimage"/>

Now, let us set some filters.

* **Click** on the <img src="../img/button/++.jpg" class="ms-docbutton"/> button to add a condition.

<img src="../img/attributes-table/attribute-filter-1.jpg" class="ms-docimage" style="max-width:500px;"/>

* **Set** the following condition for example; **Persons >= 6 000 000**.

<img src="../img/attributes-table/attribute-filter-5.jpg" class="ms-docimage" style="max-width:500px;"/>

* **Click** on the loop icon to search <img src="../img/button/loop.jpg" class="ms-docbutton"/>

The filtered records by persons will be shown in the attribute table.

<img src="../img/attributes-table/attribute-filter-2.jpg" class="ms-docimage"/>

!!! note
    We have got 13 items.

If you want to to see the filtered records also on the map, follow these steps:

* **Click** on the <img src="../img/button/sync.jpg" class="ms-docbutton"/> icon to synchronize the map with the filter.

<img src="../img/attributes-table/attribute-filter-3.jpg" class="ms-docimage"/>

Now let us add other conditions:

* **Click** again on the *Advanced Search* icon <img src="../img/button/filter-icon.jpg" class="ms-docbutton"/>.

* **Click** on the <img src="../img/button/++.jpg" class="ms-docbutton"/> button to add a second condition.

* **Set** the following condition (for example the employed persons between 2M and 5M): **Employed >< 2 000 000, 5 000 000**.

!!! note
    We are using *"Match any of the following conditions"* which is an **OR** logic operator.

<img src="../img/attributes-table/attribute-filter-4.jpg" class="ms-docimage" style="max-width:500px;"/>

* **Click** on the loop icon to search <img src="../img/button/loop.jpg" class="ms-docbutton"/>.

As displayed in the picture below, the filter will return 20 records:

<img src="../img/attributes-table/attribute-filter-6.jpg" class="ms-docimage" style="max-width:500px;"/>

In order to switch to an **AND** operator you have to follow these steps:

* **Click** again on the *Advanced Search* icon <img src="../img/button/filter-icon.jpg" class="ms-docbutton" />.

* **Select** form the droplist **all** instead of **any**.

<img src="../img/attributes-table/attribute-filter-7.jpg" class="ms-docimage" style="max-width:500px;"/>

* **Click** on the loop icon to search <img src="../img/button/loop.jpg" style="max-width:20px;"/>.

The filter will return 7 records:

<img src="../img/attributes-table/attribute-filter-8.jpg" class="ms-docimage" style="max-width:500px;"/>

### Filtering by Location

The second filter type called **Region of Interest** allows the user to filter the features overlaying drawn geometric shapes on the map.

<img src="../img/attributes-table/geometry-filter.jpg" class="ms-docimage" style="max-width:500px;"/>

* **Select** the *Filter Type*, e.g. Circle.

* **Draw** the circle on the map; eventually you can change the position of the center and the radius by clicking on the icon <img src="../img/button/edit-icon-1.jpg" class="ms-docbutton"/>.

* **Set** the *Geometric Operation*, e.g.Contains.

<img src="../img/attributes-table/geometry-filter-1.jpg" class="ms-docimage"/>

* **Click** on the loop icon to apply the filter <img src="../img/button/loop.jpg" class="ms-docbutton"/>.

<img src="../img/attributes-table/geometry-filter-2.jpg" class="ms-docimage" style="max-width:500px;"/>

!!! note
    The *Geometric Operation* **Contains** will extract the features entirely contained in the drawn geometry while  the *Geometric Operation* **Intersects** will extract the features that have a part intersecting the geometry.

### Layer Filtering

*Layer Filter* allows the user to filter the features of a vector layer with respect to another one. For example, which features of the first layer are contained in the second or intersect the second.

* **Open** a new map.

* **Add** a vector layer (e.g. thematism_regioni).

* **Add** a second vector layer (e.g. Unesco Items)

<img src="../img/attributes-table/layer-filter-1.jpg" class="ms-docimage" style="max-width:500px;"/>

Let us suppose that we want to get all the Unesco sites in Sicily. To do it:

* **Select** the layer *Unseco Items*.

* **Click** on the *Open Attribute Table* icon <img src="../img/button/attributes-table.jpg" class="ms-docbutton"/>.

* **Click** on the *Advanced Search* icon <img src="../img/button/filter-icon.jpg" class="ms-docbutton" />.

In the *Layer filter* section:

* **Set** the *Target layer* choosing the layer *thematism_regioni* from the list.

* **Choose** the appropriate *Operation*; in this case *Contains*.

* **Add** a condition as the following: **cod_reg = 19** since the region code of Sicily is equal to 19.

<img src="../img/attributes-table/layer-filter-2.jpg" class="ms-docimage" style="max-width:500px;"/>

* **Click** on the loop icon to apply the filter <img src="../img/button/loop.jpg" class="ms-docbutton"/>.

Apparently nothing is changed on the map but the filter returned 20 items in the attributes table.

* **Click** on the <img src="../img/button/sync.jpg" class="ms-docbutton"/> icon to synchronize the map with the filter.

<img src="../img/attributes-table/layer-filter-3.jpg" class="ms-docimage"/>
