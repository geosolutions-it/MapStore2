# Map Toolbars

The main toolbar of [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/), used by the user to interact on the map viewer, are:

* The **Search bar**

* The **Side toolbar**

<img src="../img/menu-bar/menu-bar.jpg" class="ms-docimage"/>

## Search Bar

The search bar is a tool that allows the user to query the layers in order to find a specific information. In [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) it is possible to perform the search in four different ways:

* By **Location name**

* By **Configuring a search service**

* By **Coordinates**

* By **Current map CRS**

* By **Bookmarks**

<img src="../img/menu-bar/search-types.jpg" class="ms-docimage"/>

### Search by location name

The *Search by location name*, set by default when a new map is created, allows the user to search places asking the [OpenStreetMap Nominatim search engine](https://nominatim.openstreetmap.org/). Typing the desired place, the Nominatim seach engine is queried; selecting then the desired record in the list of results, the map is automatically re-center/zoomed to the chosen area that is also highlighted:

<img src="../img/menu-bar/rome.jpg" class="ms-docimage" />

### Configuring a search service

[MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) allows the user also to extend or replace the default OSM results with additional *WFS Search Services*. Selecting the **Configure Search Services** option <img src="../img/button/change-search-tool.jpg" class="ms-docbutton"/>, the following window opens:

<img src="../img/menu-bar/create-edit-service-panel.jpg" class="ms-docimage" style="max-width:400px;"/>

In order to create a new custom service, the <img src="../img/button/add_group_confirm_button.jpg" class="ms-docbutton"/> button brings the user to a page where he can set the *WFS service properties*, for example:

<img src="../img/menu-bar/wfs-service-props-form.jpg" class="ms-docimage"  style="max-width:400px;"/>

In particular, the information to be entered are:

* **Name** of the service

* WFS **Service URL** the user want to call

* **Layer** to be queried

* Specific **Attributes** (comma separeted fields) the user wants to query

When all the options are set, by clicking on the <img src="../img/button/next-txt.jpg" class="ms-docbutton"/> button a new panel opens, where it is possible to choose the properties for the displayed results:

<img src="../img/menu-bar/result-display-properties-form.jpg" class="ms-docimage"  style="max-width:400px;"/>

In this case, the user can define the following settings:

* The **Title** displayed on the top of each results row (in the previous image, for  example, the chosen title for the results is the one corresponding to the attribute NAME of the feature)

* The **Description** to report in the results just below the title

* The **Priority**, a parameter which determines the position of the records in the results list. Lower values imply a higher positions in the results list and vice versa. By default the [OpenStreetMap Nominatim search engine](https://nominatim.openstreetmap.org/) result has priority equals to 5, therefore in order to see the custom results in a higher position a lower priority value is needed

* The **Launch Info panel** allows the user to chose if and how the custom search interact with the [Identify tool](navigation-toolbar.md#identify-tool). In particular, with the *No Info* option, the Info panel doesn't show up once a record from the search results is selected. Selecting *All Layers* or *Single Layer* the Identify tool is triggered, and the related panel opens displaying the information of all/single layer(s) visible in the map. With *Single Layer* instead, the Identify tool is triggered only for the layer (if it is present and visible in the map) related to the selected record in the search result list.

<img src="../img/menu-bar/launch-info-panel.jpg" class="ms-docimage"  style="max-width:400px;"/>

!!! note
    Note that, selecting *All Layers* or *Single Layer* options, the point used for Identify request is a point belonging to the surface of the geometry of the selected record. Moreover, using *Single Layer*, the Identify request will filter results to the selected record and to its layer, using `featureid` which might be ignored by other servers, but can be used by GeoServer to select the specific feature of the results, when info_format is other than *application/json*. In order to achieve filtering of feature on servers other than GeoServer, one can select the format (*info_format*) as *application/json* for the layer to **GetFeatureInfo** from the layer settings in TOC to allow filtering features by using the ID of the selected record.

Once all the option are set, it is possible to move forward with the Next button <img src="../img/button/next-txt.jpg" class="ms-docbutton"/> that opens the *Optional properties* panel:

<img src="../img/menu-bar/optional-props-form.jpg" class="ms-docimage" style="max-width:400px;"/>

Here the user can choose:

* To **Sort** the results **by** the specified attribute

* The **Max** number of **features** (items) displayed in the custom search results

* The **Max** level of **zoom** to be set for the map when opening from the custom search result

* The text to insert as **placeholder** in the **Search input** when the search service is selected in the *Service Menu*

* The text to be inserted as **tooltip** in the **Service Menu** is visible by moving the mouse over the search service

After the <img src="../img/button/save-update-button.jpg" class="ms-docbutton"/> it is possible to see the custom WFS search service inside the *Available services* list:

<img src="../img/menu-bar/wfs-services-list.jpg" class="ms-docimage"  style="max-width:500px;"/>

Once a search service is created, it is always possible to Edit it <img src="../img/button/edit-service-icon.jpg" class="ms-docbutton"/> or Remove it <img src="../img/button/delete-service-icon.jpg" class="ms-docbutton"/> from the list. By default the **Override default services** option is disabled, in that case performing a search not only the custom search service results are shown, but also the Nominatim ones:

<img src="../img/menu-bar/override-no.jpg" class="ms-docimage" style="max-width:400px;"/>

Once the **Override default services** option is enabled, only the custom search service results are shown:

<img src="../img/menu-bar/override-yes.jpg" class="ms-docimage" style="max-width:400px;"/>

When there are multiple search services defined, by default [MapStore](https://mapstore.geosolutionsgroup.com/mapstore/#/) performs the search operation on all of them according to the priority configured for each service (see above). Therefore, it is also possible for the user to select the desired search service from the menu to perform the search only on it. Selecting the **Search Service Menu** button <img src="../img/button/select-tool-button.jpg" class="ms-docbutton"/>, the following window opens:

<img src="../img/menu-bar/search-tool-option.jpg" class="ms-docimage" style="max-width:400px;"/>

In the *Search Menu*, the user can choose one of the search services to use to carry out the search by clicking on one of them. An example could be the following:

<video class="ms-docimage" style="max-width:600px;" controls><source src="../img/menu-bar/search-with-one-search-service.mp4"/></video>

### Search by coordinates

Performing a *Search by coordinates* the user can zoom to a specific point and place a marker in its position. That point can be specified typing the coordinates in two different formats:

* **Decimal** (the default format)

<img src="../img/menu-bar/decimal.jpg" class="ms-docimage" style="max-width:500px;"/>

* **Aeronautical** (that can be chosen through the <img src="../img/button/change-search-tool.jpg" class="ms-docbutton"/> button)

<img src="../img/menu-bar/aeronautical.jpg" class="ms-docimage" style="max-width:500px;"/>

Once the coordinates are set, it is possible to perform the search with the <img src="../img/button/magnifying_glass_icon.jpg" class="ms-docbutton"/> button. The displayed result is similar to the following:

<img src="../img/menu-bar/performed-search.jpg" class="ms-docimage"/>

### Search by current map CRS

MapStore allows the user to *Search by current map CRS*, which can zoom to a specific point and place a marker in its position. That point can be specified typing the **X** and **Y** coordinates of the map.
Once the coordinates are set, it is possible to perform the search with the <img src="../img/button/magnifying_glass_icon.jpg" class="ms-docbutton"/> button. The displayed result is similar to the following:

<img src="../img/menu-bar/performed-search_by_crs.jpg" class="ms-docimage" style="max-width:600px;"/>

!!! Warning
    The *Search by current map CRS* is available only if the the current map CRS is not the one normally used by Decimal and Aeronautical coordinates, which means `EPSG:4326`.

### Search by bookmark

<img src="../img/menu-bar/search-bookmark.jpg" class="ms-docimage" style="max-width:400px;"/>

MapStore allows the user to search by the preconfigured bookmarks, which can zoom to a specific bounding box area or zoom along with reloading the visibility of the layers. Selecting the **Bookmark settings** <img src="../img/button/change-search-tool.jpg" class="ms-docbutton"/> icon, the following window opens:

<img src="../img/menu-bar/view-bookmark.jpg" class="ms-docimage" style="max-width:400px;"/>

In order to create a new bookmark, the <img src="../img/button/add_group_confirm_button.jpg" class="ms-docbutton"/> button brings up **Add new bookmark** page where the user set the *Bookmark properties*, for example:

<img src="../img/menu-bar/add-bookmark.jpg" class="ms-docimage"  style="max-width:400px;"/>

In particular, the information to be entered are:

* **Title** of the bookmark

* **Bounding Box** property the user wish to zoom to

  * **West**, **South**, **East** and **North**

* **Toggle layer visibility reload**, <img src="../img/button/eyeon.jpg" class="ms-docbutton"/> to enable/disable the layer visibility reload when searched by bookmark

Note: The user can define bounding box value either manually or by selecting **Use current view as bounding box** <img src="../img/button/get_bbox.jpg" class="ms-docbutton"/> to fetch the current bounding box values from the map view to populate the fields

When all the properties have been set, selecting the <img src="../img/button/save-update-button.jpg" class="ms-docbutton"/> it is possible to see the newly added bookmark in the **View bookmarks** list:

<img src="../img/menu-bar/view-bookmark.jpg" class="ms-docimage"  style="max-width:400px;"/>

Once a bookmark has been created, it is always possible to *Edit* it <img src="../img/button/edit-service-icon.jpg" class="ms-docbutton"/> or *Remove* it <img src="../img/button/delete-service-icon.jpg" class="ms-docbutton"/> from the list.

## Side toolbar

The *Side Toolbar* is an important component, positioned on the right side of the map viewer, that provides to the user the access to different tools of MapStore. The following tools are the ones available by default:

<img src="../img/menu-bar/options-menu.jpg" class="ms-docimage" style="max-width:300px;"/>

In particular, with these options it is possible to:

* [Print](print.md) the map by clicking the <img src="../img/button/print2.jpg" class="ms-docbutton"/> button

* **Export map** in `json` format by clicking the <img src="../img/button/export2.jpg" class="ms-docbutton"/> button

* [Import](import.md) files from your computer by clicking the <img src="../img/button/import2.jpg" class="ms-docbutton"/> button

* Open the [Catalog](catalog.md) in order to connect to a remote service and add layers to the map by clicking the <img src="../img/button/catalog2.jpg" class="ms-docbutton"/> button

* Perform a [Measure](measure.md) on the map by clicking the <img src="../img/button/measurament.jpg" class="ms-docbutton"/> button

* Access the map **Settings** by clicking the <img src="../img/button/settings2.jpg" class="ms-docbutton"/> button, where the user can change the current **Language** and select the [Identify](navigation-toolbar.md#identify-tool) options

<img src="../img/menu-bar/settings-panel.jpg" class="ms-docimage" style="max-width:400px;"/>

!!!Note
    When the [3D navigation](navigation-toolbar.md#3d-navigation) is enabled, opening the **Settings** panel, the editor is allowed to configure some options related to the *Cesium viewer*.
    <img src="../img/menu-bar/cesium-settings.jpg" class="ms-docimage" style="max-width:500px;"/>

    In particular, from the *Map Settings* it is possible to:

    * Enable the **Show sky atmosphere** to see the atmosphere around the globe

    * Enable the **Show ground atmosphere** to view the ground atmosphere on the globe when the camera is far away

    * Enable the **Show fog** to allow additional performance by rendering less geometry and dispatching less terrain requests

    * Enable the **Depth test against terrain** if primitives such as billboards, polylines, labels, etc. should be depth-tested against the terrain surface instead of always having them drawn on top of terrain unless they're on the opposite side of the globe

    * Disable the **Terrain collision detection** to allow underground navigation.

    * Set the **Lighting Options** to configure the light source within the *Cesium* 3D viewer. The user can choose from the following modes:
        - **Sunlight**: this is the default behavior. The scene is illuminated based on the position of the real sun, updating dynamically according to the current system time and camera location.
        - **Flashlight**: a fixed light source is attached to the camera, simulating a flashlight effect.
        - **Specific UTC Date-Time**: to define a precise UTC date and time for the light source. When selected, a date-time picker appears to customize a daily time more in line with the one of the visualized data source in map. An example could be the following:
        <video class="ms-docimage" style="max-width:600px;" controls><source src="../img/menu-bar/date-time-picker.mp4"/></video>

* See the **About this map** panel by clicking the <img src="../img/button/details2.jpg" class="ms-docbutton"/> button, when [Details](resources-properties.md#details) are present

* [Share](share.md) the map by clicking the <img src="../img/button/share2.jpg" class="ms-docbutton"/> button

* Open the [MapStore Documentation](https://mapstore.readthedocs.io/en/latest/) by clicking the <img src="../img/button/doc2.jpg" class="ms-docbutton"/> button

* Start the **Tutorial** by clicking the <img src="../img/button/tutorial2.jpg" class="ms-docbutton"/> button

!!!warning
    The **Save**, the **Delete Map** and the **Share** buttons are present in the *Options Menu* only when the map has already been saved once.
