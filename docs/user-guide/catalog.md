# Catalog Services
******************

The Catalog Service for the Web (CSW) is an OGC Standard to publish and search geospatial data and related metadata on the internet. It describes geospatial services such as Web Map Service (WMS) and Web Map Tile Service (WMTS).

In [MapStore](https://mapstore.geo-solutions.it/mapstore/#/) the Catalog offers demo services that allow you to extract the data and add them to the map from GeoServer or to create connections to other geospatial services (supported services are WMS, WMTS and CSW).

Adding Layers from Demo Services
--------------------------------

CSW, WMS and WMTS Demo Services are available by default allowing you to import layers from the GeoSolutions GeoServer and to add them to your map.

Starting from a new map or an already existing map:

* **Click** on the *Burger menu* button <img src="../img/button/burger.jpg" class="ms-docbutton" /> from the main menu bar.

* **Click** on the *Catalog* option from the list <img src="../img/catalog/catalog-option.jpg" class="ms-docbutton" style="max-height:20px;" />.

The Catalog page will open showing a list of services, a search box to search the layers by name and a list of the retrieved layers ready to be added to the map.

<img src="../img/catalog/catalog_panel.jpg" class="ms-docimage"  style="max-width:500px;" />

An example:

* **Select** *GeoSolutions GeoServer WMS* from the list.

<img src="../img/catalog/service_list.jpg" class="ms-docimage"  style="max-width:500px;"/>

* **Type** a text in the search box, e.g. "us", then click on the search button (or press `ENTER`).

<img src="../img/catalog/catalog_search.jpg" class="ms-docimage"  style="max-width:500px;"/>

* **Add** the layer to the map clicking on <img src="../img/button/add_to_map_button.jpg" class="ms-docbutton"/>.

<img src="../img/catalog/added_layer.jpg" class="ms-docimage"/>

Adding and Editing a Service
----------------------------

As mentioned before, [MapStore](https://mapstore.geo-solutions.it/mapstore/#/) allows you to connect to remote services and to import the data from them.

* **Click** on the <img src="../img/button/+.jpg" class="ms-docbutton"/> button to add a new service.

<img src="../img/catalog/new_service.jpg" class="ms-docimage"  style="max-width:500px;"/>

The Service manager window opens, where the user can start to insert the informations related to the new service:

* **Type** the URL name (e.g. `http://tms.comune.fi.it/geowebcache/service/wms`);

* **Select** the Type of the service (e.g. *WMS*);

* **Type** the Title (e.g. *GeoPortal of Firenze*).

In addition to basic information, the user can customize the Service with other useful parameters: Search on selection, Preview and Image format.

* **Expand** the Advanced Settings window;

<img src="../img/catalog/add-service.jpg" class="ms-docimage"  style="max-width:500px;" />

* **Tick** the Search on service selection if you want to trigger a search at the same time you select the service;

* **Tick** the Show preview to see the resulting layers previews near their title;

* **Select** the Format (e.g. jpeg), if you want to set a specific default format for the images;

<img src="../img/catalog/cat-adv-settings.jpg" class="ms-docimage"  style="max-width:500px;"/>

* **Save** the created Service.

A list of layers will be loaded from the portal ready to be added to your map.

<img src="../img/catalog/catalog_firenze.jpg" class="ms-docimage"  style="max-width:500px;"/>

!!! note
    For those layers which have long descriptions or long metadata information, the content is truncated in order to fit the *Layer Card* size. It is possible to expand the card using the <img src="../img/button/expand_card_icon.jpg" class="ms-docbutton"/> button:

    <p style="text-align:center;"><img src="../img/catalog/expand_card.gif" class="ms-docimage"  style="max-width:300px;"/>

In order to edit a service, **Click** on the edit button <img src="../img/button/edit-service.jpg" class="ms-docbutton" /> and apply your changes.

Custom Metadata Template
------------------------

The Catalog tool of [MapStore](https://mapstore.geo-solutions.it/mapstore/#/) lets you choose whether to show metadata or not, and how they appear. About that, a **Metadata Template** is provided inside the *Advanced Settings* panel of the Service manager:

<img src="../img/catalog/metadata.jpg" class="ms-docimage"  style="max-width:500px;" />

!!! warning
    The *Metadata Template* function is available for **CSW Services** only.

* **Tick** that checkbox to get access to this functionality.

The *Metadata Template* panel makes available a **Text Editor** through which you can expose the available metadata information within a custom text. [MapStore](https://mapstore.geo-solutions.it/mapstore/#/) suggests you how to correctly retrieve the properties values (**`${ property_name }`**) and what properties are available (see the tooltip content in the picture below).

<img src="../img/catalog/metadata-tooltip.jpg" class="ms-docimage"  style="max-width:500px;" />

An example:

* **Type** the following template in the text editor

```
title: ${title}
-------------------
description: ${description}
-------------------
abstract: ${abstract}
-------------------
boundingBox: ${boundingBox}
-------------------
contributor: ${contributor}
-------------------
creator: ${creator}
-------------------
format: ${format}
-------------------
identifier: ${identifier}
-------------------
references: ${references}
-------------------
rights: ${rights}
-------------------
source: ${source}
-------------------
subject: ${subject}
-------------------
temporal: ${temporal}
-------------------
type: ${type}
-------------------
uri: ${uri}
```

* **Click** on *Save*

* This should be the results for the *test.point* layer from Catalog:

<img src="../img/catalog/metadata-det.gif" class="ms-docimage"  style="max-width:500px;"/>

!!! note
    If some metadata is absent, the `source Not Available` text will be shown.
