# Attribute Table
*****************
In GIS, the attribute table associated to a vector layer is a table that stores tabular informations related to the layer. The columns of the table are called fields and the rows are called records. Each record of the attribute table corrisponds to one feature geometry of the layer. This relation allows to find records in the table (informations) by selecting features on the map and viceversa.

In [MapStore 2](https://mapstore2.geo-solutions.it/mapstore/#/), accessing the attribute table of a vector layer allows you to edit the tabular data or directly the geometries on the map, to perform spatial queries and filters, and to create widgets from the data.

!!! note
    Creating widgets for a layer is accessible from the *TOC* and the *Attribute Table* by clicking on this icon <img src="../img/widgets.jpg" style="max-width:20px;"/> and was already treated in the [Widgets](widgets.md) section.

* **Open** a new map.
* **Add** a vector layer (e.g. USA Population).
* **Select** the layer.
* **Click** on the *Open Attribute Table* icon <img src="../img/attributes-table.jpg" style="max-width:20px;"/>, you will note that the table has 49 items (rows).

The attribute table will open showing the data table and a set of functionalities.

<img src="../img/attributes-table-1.jpg" style="max-width:600px;"/>

Editing
-------

TODO


Advanced Filtering
------------------

[MapStore 2](https://mapstore2.geo-solutions.it/mapstore/#/) allows you to filter and select the data by attribute or by region and to perform cross filtering between two present layers in the map.

* **Click** on the *Advanced Search* icon <img src="../img/filter-icon.jpg" style="max-width:25px;" />.

The filtering page will open showing *Filters Types*.

<p align = "center" ><img src="../img/filter-types.jpg" style="max-width:500px;"/></p>

### Filtering by Attributes

the *Attribute Filter* allows you to set conditions on the fields to perform **AND**/**OR** logic operations.

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

!!!note
   We have got 13 items.

If you want to to see the filtered records also on the map.

* **Click** on the <img src="../img/sync.jpg" style="max-width:20px;"/> icon to synchronize the map with the filter.

<p align = "center" ><img src="../img/attribute-filter-3.jpg" style="max-width:620px;"/></p>

Now let us add other conditions.

* **Click** again on the *Advanced Search* icon <img src="../img/filter-icon.jpg" style="max-width:25px;" />.

* **Click** on the <img src="../img/++.jpg" style="max-width:20px;"/> button to add a second condition.

* **Set** the following condition, for example the employed persons between 2M and 5M; **Employed >< 2 000 000, 5 000 000**.

!!! note
    We are using *"Match any of the following conditions"* which is an **OR** logic operator.

<p align = "center" ><img src="../img/attribute-filter-4.jpg" style="max-width:620px;"/></p>

* **Click** on the loop icon to search <img src="../img/loop.jpg" style="max-width:20px;"/>.

The filter will return 20 records.

<p align = "center" ><img src="../img/attribute-filter-6.jpg" style="max-width:620px;"/></p>

In order to switch to an **AND** operator.

* **Click** again on the *Advanced Search* icon <img src="../img/filter-icon.jpg" style="max-width:25px;" />.

* **Select** form the droplist **all** instead of **any**.

<p align = "center" ><img src="../img/attribute-filter-7.jpg" style="max-width:620px;"/></p>

* **Click** on the loop icon to search <img src="../img/loop.jpg" style="max-width:20px;"/>.

The filter will return 7 records.


<p align = "center" ><img src="../img/attribute-filter-8.jpg" style="max-width:620px;"/></p>

### Filtering by Location

The second filter type called **Region of Interest** allows the user to filter the features overlaying drawn geometric shapes on the map.

<p align = "center" ><img src="../img/geometry-filter.jpg" style="max-width:620px;"/></p>

* **Select** the *Filter Type*, e.g. Circle.
* **Draw** the circle on the map; eventually you can change the position of the center and the radius by clicking on the icon <img src="../img/edit-icon-1.jpg" style="max-width:30px;"/>.
* **Set** the *Geomatric Operation*, e.g.Contains.

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
