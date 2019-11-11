# Menu Bar
**********

In this section you will learn how to use the *Menu Bar*. As mentioned before, it includes connections to the <span style="color:red">*Home Page*</span> and the <span style="color:blue">*Account*</span>.

   <p align = "center" > <img src="../img/menu-bar/menu-bar.jpg" style="max-width:500px;" /></p>

It contains also a *Search bar* and a *Burger menu* that will be treated in details here below.

Search Bar
----------

The *Search Bar* of the portal allows you to find point of interests (POIs), streets or locations by name (default) or by coordinates.

In the *Search Bar*, for example, **Type** the text "rome" then **Select** the first record. The map will automatically re-center on that area delimiting it by a polygon in the case of an area, by a line in the case of a linear shape (e.g. streets, streams) and by a marker in the case of a point.

<img src="../img/menu-bar/rome.jpg" style="max-width:650px;" />

### Searching by coordinates

Through the *Search Bar* you have the possibility to zoom to a specific point and place a marker in its position. The map will be centered in that point.
The point can be specified typing its coordinates both in `decimal` and `aeronautical` formats.

!!! warning
    This functionality is available in **desktop** mode only, on mobile it is disabled.

To experience this, follow these steps:

* click on the **Burger Icon** of the *Search Bar* to open the *Options Panel*

    <img src="../img/menu-bar/search_by_coordinates_option.png" style="max-width:400px;"/>

* click on **Search By Coordinates** to activate the coordinates input fields (*Decimal* format by default)

    <img src="../img/menu-bar/decimal_coordinates_editor.png" style="max-width:500px;"/>

* type **Latitude** and **Longitude** and click on the magnifying glass icon <img src="../img/button/magnifying_glass_icon.png" style="max-width:30px;"/> to perform the search

    <img src="../img/menu-bar/search_by_decimal_coordinates.gif" />

By default [MapStore](https://mapstore.geo-solutions.it/mapstore/#/) use the `decimal` format but the `aeronautical` one is also available. Click the gear icon <img src="../img/button/gear_icon.png" style="max-width:30px;"> of the coordinates editor, select *Aeronautical* and click on it to switch to this coordinate format.

<img src="../img/menu-bar/search_by_aeronautical_coordinates.gif" />

### Custom WFS Searches

When you search a place, you might want to extend the default OSM results through additional *WFS Search Services*.
The **Configure Search Services** option of the *Search Bar* allows you to do that.

To better understand how it works, create an empty map and try to search somethings, for example **'`grand`'**, and see the result provided by the [OpenStreetMap Nominatim search engine](https://nominatim.openstreetmap.org/):

<img src="../img/menu-bar/default-osm-search.jpg" />

The following example shows the steps required to set up a custom service:

* Click on the **Burger Icon** of the *Search Bar*, the options panel will open

    <img src="../img/menu-bar/search_tool.png" style="max-width:400px;" />

* Click on the **Configure search services** button to open the **Create/edit search service** panel

    <img src="../img/menu-bar/create-edit-service-panel.jpg" style="max-height:500px;" />

    The custom search services are listed in the *Available services* section.

* Click on the **Add** button to open the *WFS service props* form and fill out it

    <img src="../img/menu-bar/wfs-service-props-form.jpg" style="max-height:500px;" />

    - **Name** can be whatever you prefer, it is a good practice to refer it to some other properties as the *Layer* and/or the *Attributes*

    - **Service url** is the WFS you want to call, in this example we used a WFS service available on the GeoSolutions Demo Server

    - **Layer** is the layer from which you want to retrieve information, for example the TIGER layer *Manhattan (NY) roads*

    - **Attributes** identifies which field should be considered by the search query, in this case we are interested in roads' name so we choose the NAME field

* Click on the **Next** button to open the *Result display properties* form

    <img src="../img/menu-bar/result-display-properties-form.jpg" style="max-height:500px;" />

    - **Title** is displayed on the top of each results row. You might want to show here the content of the fields of interest, in this example we choose to display the NAME field values so we type `${properties.NAME}`

    - **Description** is displayed to the bottom of each results row. We use *Manhattan Roads* to point out the source layer name but feel free to change it. You can use the same property placeholder syntax here.

    - **Priority** is a weight assigned to the custom results. It is used to sort all the search results so lower values determine higher positions in the results list (top). The default [OpenStreetMap Nominatim search engine](https://nominatim.openstreetmap.org/) result has priority equals to 5, so to see our custom results in the first positions we should set a value lower than 5 for this field. We use 3.

    - **Launch Info Panel** is a flag that can be used to trigger GetFeatureInfo requests when selecting a record after a search.
    It has three values as shown here:
    <img src="../img/menu-bar/launch-info-panel.jpg" style="max-height:500px;" />
     - "No info" means that no GFI request will be triggered and it is the default value.

     Note that, in the following cases, the point used for GFI request is a point on surface of the geometry of the selected record

     - "Search Layer" means that the GFI will filter results to the record selected and to its layer. It will also force the info_format to "application/json" (PROPERTIES) for allowing filtering on the features by using the id of the selected record.
     - "All Layers" means that there will be no filtering as it happens when you click on map.


* Click on the **Next** button to open the *Optional props* form

    <img src="../img/menu-bar/optional-props-form.jpg" style="max-height:500px;" />

    - **Sort by** lets you decide on which field to sort the results, we choose NAME again

    - **Max features** is the maximum number of rows displayed in your custom search results, in this example we consider that 5 is enough

* Click on the **Save/Update** <img src="../img/button/save-update-button.jpg" style="height:25px" /> button to save your settings

Now you can see your custom *WFS Search Service* in the *Available services* list, click on the **Edit** <img src="../img/button/edit-service-icon.jpg" style="height:25px" /> icon if you want to change some settings or on the **Delete** <img src="../img/button/delete-service-icon.jpg" style="height:25px" /> icon to remove this service from the list.

<img src="../img/menu-bar/wfs-services-list.jpg" style="max-height:500px;" />

Come on to test our new search service. Type **'`grand`'** in the search box again and take a look at the results:

<img src="../img/menu-bar/custom-search-results.jpg" style="max-height:500px;" />

We have 5 (the **Max features**) more results displayed in the first five positions (because of **Priority**), these results are labelled as *Manhattan Roads* (the **Description**) and they show the roads' names (the **Title**) at the top of each row. The results are sorted by NAME (the **Sort by** property).
<br>
The **Override default services** option of the **Create/edit search service** panel, if enabled, allows to show only those results from your custom service. Let's tick the checkbox corresponding to this option:

<img src="../img/menu-bar/override-default-service.jpg" style="max-height:500px;" />

Since the option is enabled no results from the default service are shown:

<img src="../img/menu-bar/override-default-service-results.jpg" style="max-height:500px;" />


Testing Launch Info panel options
-----------
You can follow the previous procedure and use "Search Layer" as launch info panel value.

You can see that when you click on the first result
<img src="../img/menu-bar/custom-search-results-click-records.jpg" style="max-height:500px;" />

The result will be something like:

<img src="../img/menu-bar/custom-search-results-search-layer.jpg" style="max-height:500px;" />

If "All Layers" option is used then the results would be something like this:

<img src="../img/menu-bar/custom-search-results-all-layers.jpg" style="max-height:500px;" />

Since other layers are on the map then the navigation arrows is visible in the top-right corner of the FeatureInfo panel under the calculated search point.

Burger Menu
-----------
The *Burger Menu* is the core of the *Menu Bar* and it will be later addressed in details. It contains several options to add data from different sources to the map, to perform measurments and to save, print and share the created map.

<br>

Click on the following links to learn more about the main options:

* [PRINT](print.md): allows you to print a created map;
* [ADD LOCAL VECTOR FILES](local-files.md): allows to import from your machine vector files to be added to  the map;
* [CATALOG](catalog.md): allows you to import data from several remote services;
* [MEASURE](measure.md): tools to perform measurments on the map;
* [ANNOTATIONS](annotations.md): allows you to create customized annotations and add them to the map;
* [SHARE](share.md): allows you to share your map.
