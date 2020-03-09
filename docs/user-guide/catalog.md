# Catalog Services
******************

The Catalog Service for the Web (CSW) is an [OGC Standard](https://www.ogc.org/standards) used to publish and search geospatial data and related metadata on the internet. It describes geospatial services such as Web Map Service (WMS) and Web Map Tile Service (WMTS).

In [MapStore](https://mapstore.geo-solutions.it/mapstore/#/) the Catalog offers the possibility to access CSW, WMS and WMTS Remote Services and to add the related layers to the map. By default, as soon as a user opens the Catalog, a CSW a WMS and a WMTS Demo Services are available, allowing to import layers from the GeoSolutions GeoServer.
The user can access the Catalog with a click on the <img src="../img/button/catalog-option.jpg" class="ms-docbutton" style="max-height:25px;" /> option present in [Burger Menu](menu-bar.md#burger-menu) <img src="../img/button/burger.jpg" class="ms-docbutton" />. As soon as you open it, the first display is like the following:

<img src="../img/catalog/catalog_panel.jpg" class="ms-docimage"  style="max-width:500px;" />

## Adding Layers from Remote Services

In order to add a layer, the user can first of all open the catalog and choose from the following dropdown menu the Remote Service from where the layer is going to be added:

<img src="../img/catalog/service_list.jpg" class="ms-docimage"  style="max-width:600px;"/>

Once the Remote Service is set, it is possible to search the desired layer by typing a text on the search bar:

<img src="../img/catalog/catalog_search.jpg" class="ms-docimage"  style="max-width:600px;"/>

By clicking on the <img src="../img/button/add_to_map_button.jpg" class="ms-docbutton"/> button, the layer is finally added to the [TOC](toc.md) and rendered to the map viewer:

<img src="../img/catalog/added_layer.jpg" class="ms-docimage"/>

!!! note
    For those layers which have long descriptions or long metadata information, the content is truncated in order to fit the *Layer Card* size. In order to access the complete information, the user can expand the card using the <img src="../img/button/expand_card_icon.jpg" class="ms-docbutton" style="max-height:20px;"/> button:

    <img src="../img/catalog/expand_card.gif" class="ms-docimage" style="max-width:400px;"/>

## Managing Remote Services

[MapStore](https://mapstore.geo-solutions.it/mapstore/#/) allows also to add new Remote Services to the map project (<img src="../img/button/+.jpg" class="ms-docbutton"/>) or Edit/Remove the existing ones (<img src="../img/button/edit-service.jpg" class="ms-docbutton" />). 

<img src="../img/catalog/add_edit_services.jpg" class="ms-docimage"  style="max-width:600px;"/>

The adding/editing process is very similar and the only difference is that editing an existing Service the input fields will be already filled with its settings, while adding a new one all the fields will be empty. Moreover only editing an existing Service, it will be possible to remove it from the Services list.<br>
Editing an existing Service, for example, the first display is the following: 

<img src="../img/catalog/new_service.jpg" class="ms-docimage"  style="max-width:600px;"/>

From here the user is allowed to set the Service options, that can be divided into:

* **General settings**

* **Advanced Settings**

Once the options are properly set, it is possible to <img src="../img/button/save_service.jpg" class="ms-docbutton"/> the Service. If the user wants to discard the edits, instead, there's the <img src="../img/button/cancel_service.jpg" class="ms-docbutton"/> button. 
An existing Service can finally be removed from the Services list through the <img src="../img/button/delete_service.jpg" class="ms-docbutton"/> button (this option is not available creating a new Remote Service).

### General settings

The general settings are three mandatory fields that each Remote Service needs to have:

<img src="../img/catalog/general_settings.jpg" class="ms-docimage"  style="max-width:600px;"/>

In particular:

* **Url**

* **Type** (between *CSW*, *WMS* and *WMTS*)

* **Title**

### Advanced settings

The Advances settings section opens by clicking on the <img src="../img/button/expand_card_icon.jpg" class="ms-docbutton"/> icon:

<img src="../img/catalog/advanced_settings.jpg" class="ms-docimage"  style="max-width:500px;" />

Here the user can set the following options:

* *Search on service selection* that allow to enable/disable the automatic loading of the catalog records when the user opens that Service 

* *Show preview* that can show/hide layers thumbnails in Catalog

* Change the *Format* of the image that will be rendered on the map (`png`, `png8`, `jpeg`, `vnd.jpeg-png` or `gif`) for layers belonging to the selected source

* *Show metadata template* can be enabled when the user wants to insert in the layer description a text with metadata information 

!!! warning
    The *Metadata Template* function is available for **CSW Services** only.

#### Metadata templates

In order to better understand this function, let's make an example supposing to edit the `GeoSolutions GeoServer CSW` service:

<img src="../img/catalog/metadata.jpg" class="ms-docimage"  style="max-width:500px;" />

Enabling the *Show metadata template* option appears a text editor through witch it is possible to insert the custom metadata information for that service. In order to dynamically parse each layer's metadata value the user can insert the desired properties name with the format `${property_name}`:

<img src="../img/catalog/metadata-tooltip.jpg" class="ms-docimage" style="max-width:500px;"/>

In this case it is possible to add a text like the following, in order to present desired metadata properties:

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

Inserting this text and saving, the result should be that each layer will show its properties in catalog with the format we set:

<img src="../img/catalog/metadata-det.gif" class="ms-docimage"  style="max-width:500px;"/>

!!! note
    If some metadata are missing, the server response will be `source Not Available`
