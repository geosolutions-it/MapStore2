# Menu Bar
**********

The *Menu Bar* consist of four different parts:

* The **Search bar**

* The **Homepage** button <img src="../img/button/home-page-icon.jpg" class="ms-docbutton"/>, that redirect the user to the [Homepage](https://mapstore.geo-solutions.it/mapstore/#/)

* The **Login** button (for more information see the [Managing Users and Groups](managing-users-and-groups.md) section)

* The **Burger Menu** button <img src="../img/button/burger.jpg" class="ms-docbutton"/>

<img src="../img/menu-bar/menu-bar.jpg" class="ms-docimage"/>

## Search Bar

The search bar is a tool that allows the user to query the layers in order to find a specific information. In [MapStore](https://mapstore.geo-solutions.it/mapstore/#/) it is possible to perform the search in four different ways:

* By **Location name**

* By **Coordinates**

* By **Configuring a search service**

* By **Bookmarks**

<img src="../img/menu-bar/search-types.jpg" class="ms-docimage"/>

### Search by location name

The *Search by location name*, set by default when a new map is created, allows the user to search places asking the [OpenStreetMap Nominatim search engine](https://nominatim.openstreetmap.org/). Typing the desired place, the Nominatim seach engine is queried; selecting then the desired record in the list of results, the map is automatically re-center/zoomed to the chosen area that is also highlighted:

<img src="../img/menu-bar/rome.jpg" class="ms-docimage" />

### Search by coordinates

Performing a *Search by coordinates* the user can zoom to a specific point and place a marker in its position. That point can be specified typing the coordinates in two different formats:

* **Decimal** (the default format)

<img src="../img/menu-bar/decimal.jpg" class="ms-docimage" style="max-width:500px;"/>

* **Aeronautical** (that can be chosen through the <img src="../img/button/change-search-tool.jpg" class="ms-docbutton"/> button)

<img src="../img/menu-bar/aeronautical.jpg" class="ms-docimage" style="max-width:500px;"/>

Once the coordinates are set, it is possible to perform the search with the <img src="../img/button/magnifying_glass_icon.jpg" class="ms-docbutton"/> button. The displayed result is similar to the following:

<img src="../img/menu-bar/performed-search.jpg" class="ms-docimage"/>

### Configuring a search service

[MapStore](https://mapstore.geo-solutions.it/mapstore/#/) allows the user also to extend or replace the default OSM results with additional *WFS Search Services*. Selecting the **Configure Search Services** option <img src="../img/button/change-search-tool.jpg" class="ms-docbutton"/>, the following window opens:

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

* The **Launch Info panel** allows the user to chose if and how the custom search interact with the [Identify tool](side-bar.md#identify-tool). In particular, with the *No Info* option, the Info panel doesn't show up once a record from the search results is selected. Selecting *All Layers* the Identify tool is triggered and the related panel opens displaying the information of all layers visible in the map. With *Search Layer* instead, the Identify tool is triggered only for the layer (if it is present and visible in the map) related to the selected record in the search result list.

<img src="../img/menu-bar/launch-info-panel.jpg" class="ms-docimage"  style="max-width:400px;"/>

!!! note
    Note that, selecting *All Layers* or *Search Layer* options, the point used for Identify request is a point belonging to the surface of the geometry of the selected record. Moreover, using *Search Layer* the Identify request will filter results to the selected record and to its layer; it will also force the info_format to "application/json" to allow filtering features by using the ID of the selected record.

Once all the option are set, it is possible to move forward with the Next button <img src="../img/button/next-txt.jpg" class="ms-docbutton"/> that opens the *Optional properties* panel:

<img src="../img/menu-bar/optional-props-form.jpg" class="ms-docimage" style="max-width:400px;"/>

Here the user can choose:

* To **Sort** the results **by** the specified attribute

* The **Max** number of **features** (items) displayed in the custom search results

* The **Max** level of **zoom** to be set for the map when opening from the custom search result

After the <img src="../img/button/save-update-button.jpg" class="ms-docbutton"/> it is possible to see the custom WFS search service inside the *Available services* list:

<img src="../img/menu-bar/wfs-services-list.jpg" class="ms-docimage"  style="max-width:500px;"/>

Once a search service is created, it is always possible to Edit it <img src="../img/button/edit-service-icon.jpg" class="ms-docbutton"/> or Remove it <img src="../img/button/delete-service-icon.jpg" class="ms-docbutton"/> from the list. By default the **Override default services** option is disabled, in that case performing a search not only the custom search service results are shown, but also the Nominatim ones:

<img src="../img/menu-bar/override-no.jpg" class="ms-docimage" style="max-width:400px;"/>

Once the **Override default services** option is enabled, only the custom search service results are shown:

<img src="../img/menu-bar/override-yes.jpg" class="ms-docimage" style="max-width:400px;"/>

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

## Burger Menu

The *Burger Menu* is an important tools container that allows the user to perform different operations and take a look at several information:

<img src="../img/menu-bar/burger-menu.jpg" class="ms-docimage" style="max-width:150px;"/>

In particular, with these options it is possible to:

* [Print](print.md) the map

* **Export map** in `json` format

* [Import](import.md) files from your machine

* Open the [Catalog](catalog.md) in order to connect to a remote service and add layers to the map

* Perform a [Measure](measure.md) on the map

* **Save** the map in order to apply the changes made in an existing map (this button is not available creating a new one). Selecting this option the [Resources Properties](resources-properties.md) window opens, already filled with the current map properties

* **Save as** when the user needs to save a copy of a map or save one for the first time. Selecting this option an empty [Resources Properties](resources-properties.md) window opens.

* Create [Annotations](annotations.md) and add them to the map

* Access the map **Settings** where the user can change the current *Language*, select the *Identify response format* (*Text*, *html* or *Properties*) and see the application *Version* (more information about the *Identify response format* can be found in the [Identify tool](side-bar.md#identify-tool) section)

<img src="../img/menu-bar/settings.jpg" class="ms-docimage" style="max-width:400px;"/>

* See the **About this map** panel, when [Details](resources-properties.md#details) are present

* [Share](share.md) the map

* Open the [MapStore Documentation](https://mapstore.readthedocs.io/en/latest/)

* Start the **Tutorial** 

* Know more information **About** [MapStore](https://mapstore.geo-solutions.it/mapstore/#/)

<img src="../img/menu-bar/about.jpg" class="ms-docimage" style="max-width:500px;"/>
