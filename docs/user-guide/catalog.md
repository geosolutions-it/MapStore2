# Catalog Services
******************

The Catalog Service for the Web (CSW) is an OGC Standard to publish and search geospatial data and related metadata on the internet. It describes geospatial services such as Web Map Service (WMS) and Web Map Tile Service (WMTS).

In [MapStore](https://mapstore2.geo-solutions.it/mapstore/#/) the Catalog offers demo services that allow you to extract the data and add them to the map from GeoServer or to create connections to other Geoportal services.

Adding Layers from Demo Services
--------------------------------

CSW, WMS and WMTS Demo Services are available by default allowing you to import layers from GeoServer and to add them to your map.

Starting from a new map or an already existing map:

* **Click** on the *Burger menu* button <img src="../img/burger.jpg" style="max-width:25px;" /> from the main menu bar.
* **Click** on the *Catalog* option from the list <img src="../img/catalog-option.jpg" style="max-width:80px;" />.

The Catalog page will open showing a list of services, a search box to search the layers by name and a list of the retrieved layers ready to be added to the map.

<p align = "center" ><img src="../img/catalog_panel.png" style="max-width:500px;" /></p>

An example:

* **Select** *GeoSolutions GeoServer WMS* from the list.

<p align = "center" ><img src="../img/service_list.png" style="max-width:500px;" /></p>

* **Type** a text in the search box, e.g. "us", then click on the search button (or press `ENTER`).

<p align = "center" ><img src="../img/catalog_search.png" style="max-width:500px;" /></p>

* **Add** the layer to the map clicking on <img src="../img/add_to_map_button.png" style="max-width:30px;" />.

    <img src="../img/added_layer.png" />

Adding and Editing a Service
----------------------------

As mentioned before, [MapStore](https://mapstore2.geo-solutions.it/mapstore/#/) allows you to connect to remote services and to import the data from them.

* **Click** on the <img src="../img/+.jpg" style="max-width:80px;" /> button to add a new service.

<p align = "center" ><img src="../img/new_service.png" style="max-width:500px;" /></p>

* **Type** the URL name, e.g. `http://tms.comune.fi.it/geowebcache/service/wms`, and the Title.
* **Select** the Type of the service.
* **Save** the service created.

    <p align = "center" ><img src="../img/new_service_firenze.png" style="max-width:500px;" /></p>

    Tick the `Search on service selection` checkbox if you want to trigger a search at the same time you select the service, tick the `Show preview` one to see the resulting layers previews near their title.

A list of layers will be loaded from the portal ready to be added to your map.

<p align = "center" ><img src="../img/catalog_firenze.png" style="max-width:500px;" /></p>

!!! note
    For those layers which have long descriptions or long metadata information, the content is truncated in order to fit the *Layer Card* size. It is possible to expand the card using the <img src="../img/expand_card_icon.png" style="max-width:30px;" /> button:

    <p align = "center" ><img src="../img/expand_card.gif" style="max-width:350px;" /></p>

In order to edit a service, **Click** on the edit button <img src="../img/edit-service.jpg" style="max-width:80px;" /> and apply your changes.

Custom Metadata Template
------------------------

The *Catalog* tool of [MapStore](https://mapstore2.geo-solutions.it/mapstore/#/) allows you to customize what metadata to show and how they appear. About that, a **Metadata Template** is provided from the *Advanced Settings* panel of the service:

<p align = "center" ><img src="../img/metadata_template.png" style="max-width:500px;" /></p>

Tick that checkbox to get access to this functionality.

!!! warning
    The *Metadata Template* function is available for **CSW Services** only.

The *Metadata Template* panel makes available a **Text Editor** through which you can expose the available metadata information within a custom text. [MapStore](https://mapstore2.geo-solutions.it/mapstore/#/) suggests you how to correctly retrieve the properties values (**`${ property_name }`**) and what properties are available (see the tooltip content in the picture below).

<p align = "center" ><img src="../img/metadata_template_panel.png" style="max-width:500px;" /></p>

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

* This should be the results for the `test.point` layer:

    <p align = "center" ><img src="../img/metadata_template_example.gif" /></p>

!!! warning
    If some metadata is absent the `source Not Available` text will be shown.
