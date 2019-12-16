# Menu Bar
**********

The *Menu Bar* consist of four different parts:

* The **Search bar**

* The **Homepage** button <img src="../img/button/home-page-icon.jpg" class="ms-docbutton"/>, that redirect the user to the [Homepage](https://mapstore.geo-solutions.it/mapstore/#/)

* The **Login** button (for more information see the [Managing Users and Groups](managing-users-and-groups.md) section)

* The **Burger Menu** button <img src="../img/button/burger.jpg" class="ms-docbutton"/>

<img src="../img/menu-bar/menu-bar.jpg" class="ms-docimage"/>

## Search Bar

The search bar is a tool that allows the user to query the layers in order to find a specific information. In [Mapstore](https://mapstore.geo-solutions.it/mapstore/#/) it is possible to perform the search in three different ways:

* By **Location name**

* By **Coordinates**

* By **Configuring a search service**

<img src="../img/menu-bar/search-types.jpg" class="ms-docimage"/>

### Search by location name

The *Search by location name*, set by default when a new map is created, allow the user to find polygonal, linear and points features. Typing the name of a city in the input box and selecting the desired record, for example, the map will automatically re-center on the chosen area highlighting with a polygon the border of the administrative area:

<img src="../img/menu-bar/rome.jpg" class="ms-docimage" />

A similar behavior happens when looking for a linear feature (like, for example, can be a street or a river) or a point feature (like a restaurant or the top of a mountain)

### Search by coordinates

Performing a *Search by coordinates* the user can zoom to a specific point and place a marker in its position. That point can be specified typing the coordinates in two different formats:

* **Decimal** (the default format)

<img src="../img/menu-bar/decimal.jpg" class="ms-docimage" style="max-width:500px;"/>

* **Aeronautical** (that can be chosen through the <img src="../img/button/change-search-tool.jpg" class="ms-docbutton"/> button)

<img src="../img/menu-bar/aeronautical.jpg" class="ms-docimage" style="max-width:500px;"/>

Once the coordinates are set, it is possible to perform the search with the <img src="../img/button/magnifying_glass_icon.jpg" class="ms-docbutton"/> button. The displayed result is similar to the following:

<img src="../img/menu-bar/performed-search.jpg" class="ms-docimage"/>

### Configuring a search service

[MapStore](https://mapstore.geo-solutions.it/mapstore/#/) allows the user also to extend the default OSM results with additional *WFS Search Services*. Selecting the **Configure Search Services** option, the following window opens:

<img src="../img/menu-bar/create-edit-service-panel.jpg" class="ms-docimage" style="max-width:400px;"/>

In order to create a new custom service, the <img src="../img/button/add_group_confirm_button.jpg" class="ms-docbutton"/> button takes the user to a page where he can set the *WFS service props*, for example:

<img src="../img/menu-bar/wfs-service-props-form.jpg" class="ms-docimage"  style="max-width:400px;"/>

In particular, the information to be entered is:

* **Name** of the service

* WFS **Service url** that the user want to call

* **Layer** to be queried

* Specific **Attributes** (fileds) that the user wants to query

When all the options are set, by clicking on the <img src="../img/button/next-txt.jpg" class="ms-docbutton"/> button a new panel opens, where it is possible to choose the properties of the displayed results:

<img src="../img/menu-bar/result-display-properties-form.jpg" class="ms-docimage"  style="max-width:400px;"/>

In this case, the user can define the following settings:

* The **Title** displayed on the top of each results row (in the previous image, for  example, the chosen title for the results is the NAME of the objects)

* The **Description** inserted in the results just below the title (in the previous image for  example, a static text was set in order to show the name of the layer in which the results are sought)

* The **Priority**, a parameter which determines the position of the records in the results list. Lower values imply a higher positions in the results list and vice versa. By default the [OpenStreetMap Nominatim search engine](https://nominatim.openstreetmap.org/) result has priority equals to 5, therefore in order to see the custom results in a higher position a lower priority value is needed 

* The **Launch Info panel** allows the user to chose if and how the custom search interact with the [Identify tool](side-bar.md#identify-tool). In particular, with the *No Info* option, the Info panel doesn't show up selecting a record from the search results. Selecting *All Layers* or *Search Layer*, instead, the Info panel show up displaying respectively the information of all layers visible in the map and the data already available through the custom search

<img src="../img/menu-bar/launch-info-panel.jpg" class="ms-docimage"  style="max-width:400px;"/>

!!! note
    Selecting *All Layers* in the Launch Info panel the result is something like the following:
    
    <img src="../img/menu-bar/custom-search-results-all-layers.jpg" class="ms-docimage"/>

    Selecting *Search Layer*, instead, is something like:

    <img src="../img/menu-bar/custom-search-results-search-layer.jpg" class="ms-docimage"/>

!!! warning
    In this panel, and in the previous one, all the options are required in order to move to the next page.

Once all the option are set, it is possible to move forward with the Next button <img src="../img/button/next-txt.jpg" class="ms-docbutton"/> that opens the *Optional props* panel:

<img src="../img/menu-bar/optional-props-form.jpg" class="ms-docimage" style="max-width:400px;"/>

In here the user can choose:

* To **Sort** the results **by** a field

* The **Max** number of **features** (rows) displayed in the custom search results

After the <img src="../img/button/save-update-button.jpg" class="ms-docbutton"/> it is possible to see the custom WFS search service inside the *Available services* list:

<img src="../img/menu-bar/wfs-services-list.jpg" class="ms-docimage"  style="max-width:500px;"/>

Once a search service is created, it is always possible to Edit it <img src="../img/button/edit-service-icon.jpg" class="ms-docbutton"/> or Remove it <img src="../img/button/delete-service-icon.jpg" class="ms-docbutton"/> from the list. By default, the **Override default services** option is disabled, and performing a search not only the custom search service results are shown, but also the OSM ones:

<img src="../img/menu-bar/override-no.jpg" class="ms-docimage" style="max-width:400px;"/>

Once the **Override default services** option is enabled, instead, only the custom search service results are shown:

<img src="../img/menu-bar/override-yes.jpg" class="ms-docimage" style="max-width:400px;"/>

## Burger Menu

The *Burger Menu* is an important tools container that allows the user to perform different operations and take a look at several information:

<img src="../img/menu-bar/burger-menu.jpg" class="ms-docimage" style="max-width:150px;"/>

In particular, with these options it is possible to:

* [Print](print.md) the map

* **Export map** in `json` format

* [Import](local-files.md) vector files from your machine

* Open the [Catalog](catalog.md) in order to connect to a remote service and add layers to the map

* Perform a [Measure](measure.md) on the map

* **Save** the map in order to apply the changes (see [Resources Properties](resources-properties.md) section for more information)

* **Save as** when the user needs to save a copy of the map (see [Resources Properties](resources-properties.md) section for more information)

* Create [Annotations](annotations.md) and add them to the map

* Access the map **Settings** where the user can change the *Language*, select the *Identify response format* (*Text*, *html* or *Properties*) and see the application *Version* (more information about the *Identify response format* can be found in the [Identify tool](side-bar.md#identify-tool) section)

<img src="../img/menu-bar/settings.jpg" class="ms-docimage" style="max-width:400px;"/>

* See the **About this map** panel, when [details](resources-properties.md#details) are present

* [Share](share.md) the map

* Open the [Mapstore Documentation](https://mapstore.readthedocs.io/en/latest/)

* Start the **Tutorial** 

* Know more information **About** [MapStore](https://mapstore.geo-solutions.it/mapstore/#/)

<img src="../img/menu-bar/about.jpg" class="ms-docimage" style="max-width:500px;"/>
