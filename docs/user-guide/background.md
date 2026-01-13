# Background Selector

*********************

The background selector, located in the bottom left corner of the *Viewer*, allows the user to add, manage and remove map backgrounds.

<img src="../img/background/background.jpg" class="ms-docimage"/>

By clicking on the background selector, a list of available backgrounds will be displayed. The user can select a background from the list to switch between them. The default map backgrounds in MapStore are: *OSM Simple Light*, *OSM Simple Dark*, *OSM Bright*, *NE Political*, *Sentinel 2 Cloudless*, *Open Street Map* and *Empty Background*.

<img src="../img/background/bck-available.jpg" class="ms-docimage" style="max-width:500px;"/>

For example choosing *NE Political*, the map background will change like in the following image:

<img src="../img/background/back-selector.jpg" class="ms-docimage"/>

If the user has editing permissions on the map (independently on the role, see [Resource Properties](resources-properties.md#resource-properties) section for more information about permissions), it is also possible to add, edit or remove backgrounds.

### Add background

A new background can be added through the <img src="../img/button/++++.jpg" class="ms-docbutton"/> button on the top of the background selector. Performing this operation the [Catalog](catalog.md#catalog-services) panel opens with the possibility to access the *Remote Services*:

<img src="../img/background/bck-catalog.jpg" class="ms-docimage" style="max-width:500px;"/>

!!! warning
    *Default Backgrounds* service is available only accessing the [Catalog](catalog.md) from the background selector, but if you add a new Remote Service from there, it will be available also accessing [Catalog](catalog.md) from the [Side Toolbar](mapstore-toolbars.md#side-toolbar) or from [TOC](toc.md). *Default Backgrounds* represent a list of backgrounds that can be configured from MapStore's configuration files (more information about that can be found in Developer Guide's [Map Configuration](../developer-guide/maps-configuration.md) section).

From the [Catalog](catalog.md#catalog-services) the user can choose the layers to add to the list of backgrounds:

<img src="../img/background/add-ocean.jpg" class="ms-docimage" style="max-width:500px;"/>

As soon as a WMS layer is selected, the **Add New Background** window opens:

<img src="../img/background/add-new-bck.jpg" class="ms-docimage" style="max-width:500px;" />

In particular, from this window, the user can perform the following operations:

* Add a **Thumbnail** choosing the desired local file by clicking on image preview area, or simply with the drag and drop function

* Set the **Title**

* Set the **Format** (between `png`, `png8`, `jpeg`, `vnd.jpeg-png` or `gif`)

* Choose the **Style**, between the ones available for that layer

* Enable/disable the use of the layer cached tiles. If checked, the *Tiled=true* URL parameter will be added to the WMS request to [use tiles cached with GeoWebCache](https://docs.geoserver.org/latest/en/user/geowebcache/using.html#direct-integration-with-geoserver-wms).
When the *Use cache options* is enabled, more controls are enabled so that it is possible for the user to check if the current map settings match any GWC ***standard*** Gridset defined on the server side for the given WMS layer (**Check available tile grids information** <img src="../img/button/update_button.jpg" class="ms-docbutton"/>). At the same time, it is also possible to change the setting strategy (based on the WMTS service response) to strictly adapt layer settings on the client side to the ones matching any remote ***custom*** Gridset defined for the current map settings (**Use remote custom tile grids** <img src="../img/button/tile_grid.jpg" class="ms-docbutton"/> button). (More details on [Layer Settings](layer-settings.md#display) section.)

* Add **Additional Parameters** of three different types: *String*, *Number* or *Boolean* (these parameters will be added to the WMS request).

!!! warning
    The thumbnail image size should be a square of 98x98px or 128x128px, max 500kb and the supported format are `jpg` (or `jpeg`) and `png`

Once the options are chosen, with the <img src="../img/button/add_group_confirm_button.jpg" class="ms-docbutton"/> button the new background layer is definitively added to the background selector as a card and automatically set as the current one.

#### Add WMTS background

In case of a WMTS layer added as a background layer, the **Add New Background window** is a bit different:

<img src="../img/background/add_wmts_background.jpg" class="ms-docimage" style="max-width:500px;"/>

The user can perform the following operations:

* Add a **Thumbnail** choosing the desired local file by clicking on image preview area, or simply with the drag and drop function

* Set the **Title**

* Set the **Attribution** visible at the bottom left of the footer in the map viewer.

<video class="ms-docimage" controls><source src="../img/background/wmts-attribution.mp4" /></video>

### Edit background

Backgrounds can be edited using the <img src="../img/button/edit-icon.jpg" class="ms-docbutton"/> button located to the right of each background in the list.

<img src="../img/background/edit-back-window.jpg" class="ms-docimage" style="max-width:600px;"/>

!!! warning
    *Default Backgrounds* layers can't be edited, with an exception for *Open Street Map*: only WMS Layers can be edited/configured through the Background Selector.

The **Edit Current Background** window opens, allowing the user to customize the same set of information when adding a new background (see [previous section](#add-background)).

### Remove background

Backgrounds can be removed using the <img src="../img/button/delete2.jpg" class="ms-docbutton"/> button located to the right of each background in the list.

<img src="../img/background/bck-delete.jpg" class="ms-docimage" style="max-width:500px;"/>

!!! note
    By default, for new maps, all backgrounds from *Default Backgrounds* Service are added to the background selector, and in [Catalog](catalog.md#catalog-services) they appear grayed (it's not allowed to add the same default background twice): as soon as you remove one from the background selector, it becomes selectable from the [Catalog](catalog.md#catalog-services).

    <img src="../img/background/bck-unselectable.jpg" class="ms-docimage"/>

## Background Selector on the 3D navigation

On MapStore, when [3D Navigation](navigation-toolbar.md#3d-navigation) is enabled, the user can customize the background of the map viewer.

<img src="../img/background/3d-bck-selectors.jpg" class="ms-docimage" style="max-width:500px;"/>

If the user has editing permissions on the map, they can also add, edit, or remove terrains to use as a background.

!!! note
    By default, the only terrain available in the 3D map list is *Ellipsoid*, which cannot be edited or removed.

### Add Terrains

A new terrain can be added through the <img src="../img/button/++++.jpg" class="ms-docbutton"/> button. This opens the **Add New Terrain**panel, where the user can select the **Provider** from: *Cesium*, *Cesium Ion* and *WMS*.

<img src="../img/background/bck-provider.jpg" class="ms-docimage" style="max-width:500px;"/>

#### Cesium Provider

Using the **Cesium** provider, the user can add a terrain to the *Backgrounds Selector* list by:

<img src="../img/background/bck-cesium-provider.jpg" class="ms-docimage" style="max-width:500px;"/>

* Entering a service **Title** and **URL**

#### Cesium Ion Provider

Using the **Cesium Ion** provider, the user can add a terrain to the *Backgrounds Selector* list by:

<img src="../img/background/bck-cesium-ion-provider.jpg" class="ms-docimage" style="max-width:500px;"/>

* Entering a service **Title**
* Providing the **Asset ID**
* Providing the **Access Token**
* Adding the **Server** name of the terrain

#### WMS Provider

Using the **WMS** provider, the user can add a terrain to the *Backgrounds Selector* list by:

<img src="../img/background/bck-wms-provider.jpg" class="ms-docimage" style="max-width:500px;"/>

* Entering a service **Title**
* Entering the **URL** of the *WMS service*
* Specifying the **Layer Name**
* Setting the **Projection**
* Setting the **WMS Version**

### Edit Terrain

Once a terrain has been added to the list, it can be edited using the <img src="../img/button/edit-icon.jpg" class="ms-docbutton"/> button located to the right of each terrain.

<img src="../img/background/edit-terrain-window.jpg" class="ms-docimage" style="max-width:600px;"/>

### Remove Terrain

Terrains can be removed using the <img src="../img/button/delete2.jpg" class="ms-docbutton"/> button located to the right of each terrain in the list.

<img src="../img/background/terrains-delete.jpg" class="ms-docimage" style="max-width:500px;"/>
