# Catalog Services

The Catalog Service for the Web (CSW) is an [OGC Standard](https://www.ogc.org/standards) used to publish and search geospatial data and related metadata on the internet. It describes geospatial services such as Web Map Service (WMS) and Web Map Tile Service (WMTS).

In [MapStore](https://mapstore.geo-solutions.it/mapstore/#/) the Catalog offers the possibility to access WMS, WFS, CSW, WMTS and TMS Remote Services and to add the related layers to the map. By default, as soon as a user opens the Catalog, a CSW a WMS and a WMTS Demo Services are available, allowing to import layers from the GeoSolutions GeoServer.
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

* **Url**: the URL of the remote source service

* **Type**: the type of the remote source service (between *WMS*, *WFS*, *CSW*, *TMS* and *WMTS*)

* **Title**: the title to assign to the catalog. This text will be used in the service selection dropdown menu for this service.

### Advanced settings

The Advances settings section opens by clicking on the <img src="../img/button/expand_card_icon.jpg" class="ms-docbutton"/> icon:

<img src="../img/catalog/advanced_settings.jpg" class="ms-docimage"  style="max-width:500px;" />

The content of Advanced settings depends on the catalog type, but some options are common to all the services types:

* *Search on service selection* that allow to enable/disable the automatic loading of the catalog records when the user opens that Service 

* *Show preview* that can show/hide layers thumbnails in Catalog

## Catalog Types

### CSW Catalog

The Catalog Service for the Web (CSW) is an [OGC Standard](https://www.ogc.org/standards) used to publish and search geospatial data and related metadata on the internet. It describes geospatial services such as Web Map Service (WMS), Web Map Tile Service (WMTS) and so on...
MapStore actually supports only the **Dublin Core** metadata schemas. *ISO Metadata Profile is not supported yet*.

In **general settings of**  CSW service the user can specify the title to assign to this service and the URL of the service.

<img src="../img/catalog/general_settings.jpg" class="ms-docimage"  style="max-width:600px;"/>

#### Advanced Settings

* *Format*: the default image format for the layers added to the map (`png`, `png8`, `jpeg`, `vnd.jpeg-png` or `gif`). Setting this is particularly useful when the user wants to use optimized formats by default (`png8`, `vnd.jpeg-png`) for all the layers, without having to select it for each layer in layer settings.
* *Show metadata template*: This can be enabled when the user wants to insert in the layer description a text with metadata information

!!! warning
    The *Metadata Template* function is available for **CSW Services** only.

#### Metadata templates

In order to better understand this function, let's make an example supposing to edit the `GeoSolutions GeoServer CSW` service:

* Change the *Format* of the image that will be rendered on the map (`png`, `png8`, `jpeg`, `vnd.jpeg-png` or `gif`) for layers belonging to the selected source

* *Show metadata template* can be enabled when the user wants to insert in the layer description a text with metadata information 

Enabling the *Show metadata template* option appears a text editor through witch it is possible to insert the custom metadata information for that service. In order to dynamically parse each layer's metadata value the user can insert the desired properties name with the format `${property_name}`:

<img src="../img/catalog/metadata-tooltip.jpg" class="ms-docimage" style="max-width:500px;"/>

In this case it is possible to add a text like the following, in order to present desired metadata properties:

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

Inserting this text and saving, the result should be that each layer will show its properties in catalog with the format we set:

<img src="../img/catalog/metadata-det.gif" class="ms-docimage"  style="max-width:500px;"/>

!!! note
    If some metadata are missing, the server response will be `source Not Available`

### WMS/WMTS Catalog

WMS and WMTS Services are [OGC Standards](https://www.ogc.org/standards) protocol for publishing maps (and tile maps) on the Internet. The user can add these kind of services as catalogs to browse and add to the map the layers published using these protocols.

In **General Settings** the user can set the title he wants to assign to this service and the URL of the service to configure the service and its URL.

In **Advanced Settings** the user can set, other than the standard options, also:

* *Localized styles* (only for the WMS service) if enabled allows to include the MapStore's locale in each **GetMap**, **GetLegendGraphic** and **GetFeatureInfo** requests to the server so that the WMS server, if properly configured, can use that locale to:

    - Use localized lables for Tiles in case of vector layers (the layer's style must be properly configured for this using the [ENV variable support](https://docs.geoserver.org/stable/en/user/styling/sld/extensions/substitution.html))

    - Produce a localized layer legend in case of vector layers (the layer's style must be properly configured to use the [Localized tag for rule titles](https://docs.geoserver.org/stable/en/user/styling/sld/language.html))

    - Produce a localized output for GetFeatureInfo requests (the freemarker template need to be properly configured to retrieve [the locale from the request](https://docs.geoserver.org/stable/en/user/tutorials/freemarker.html))

Enabling that option, all layers added to the map from this catalog source will be localized as described above (it is possible to tune again that setting for each single layer by opening the [Layer Settings](layer-settings.md#display) in TOC).

* *Format*: the default image format for the layers added to the map (`png`, `png8`, `jpeg`, `vnd.jpeg-png` or `gif`). Setting this configuration property is particularly useful when the user wants to use an optimized format by default (`png8`, `vnd.jpeg-png`) for all the layers added from the catalog's source without having to select it for each layer in [Layer Settings](https://mapstore.readthedocs.io/en/latest/user-guide/layer-settings/#display)..

### TMS Catalog

The Tile Map Service (TMS) specifications include some not official/not standard protocol for serving maps as tiles (i.e. splitting map up into a pyramid of images at multiple zoom levels).
MapStore allows to add to the map the following services providers:

* Custom TMS service, specifying the URL template for the tiles.
* TMS 1.0.0 , setting the URL
* Select from a list of known TMS services, with all the variants.

<img src="../img/catalog/tms.jpg" class="ms-docimage"  style="max-width:500px;"/>
<p class="ms-doc-caption">Select provider for TMS. The list of providers contains "custom", "TMS 1.0.0" and other resources</p>

!!! note
    Since some of these services are not standard, using them in different CRSs may cause problems. Therefore, keep in mind that [changing CRS](https://mapstore.readthedocs.io/en/latest/user-guide/footer/#crs-selector) can cause problems when these levels are on the map.

#### Custom TMS

Selecting the **custom** provider the user can insert the tile URL template manually. The URL template is an URL with some placeholder that will be replaced with variables. The placeholder are identified by strings between brackets. e.g.: `{variable_name}`.

<img src="../img/catalog/custom_tms.jpg" class="ms-docimage"  style="max-width:500px;"/>
<p class="ms-doc-caption">Edit a custom TMS</p>


Allowed placeholder are:

* `{x}`,`{y}`,`{z}`: coordinates of the tiles
* `{s}`: subdomains, this provides support for *domain sharding*. By default this is `["a", "b", "c"]`. User can customize the default by adding options.subdomains.

*example:*

```json
{
  "options": {
    "subdomains": ["a", "b", "c", "d", "e"]
  }
}
```

When the user saves this custom catalog service and clicks on search, he will see only one result, that can be added on the map: variants are not currently sopported in MapStore for this provider type.

<img src="../img/catalog/custom_tms_browse.jpg" class="ms-docimage"  style="max-width:400px;"/>
<p class="ms-doc-caption">Browse custom TMS service. It contains only one result</p>

*Sample custom*
```
url: https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png
```

*Sample custom with advanced options*
```
url: https://nls-{s}.tileserver.com/nls/{z}/{x}/{y}.jpg    
```
```
{
  "options": {
    "subdomains": [
      "0",
      "1",
      "2",
      "3"
    ]
  }
}
```
#### TMS 1.0.0

Selecting the "TMS 1.0.0" provider the user can insert the URL of the Tile Map Service (see [TMS Specification](https://wiki.osgeo.org/wiki/Tile_Map_Service_Specification)). For instance, in GeoServer, it is the URL of the "TMS" link in the home page.

<img src="../img/catalog/gs-tms.jpg" class="ms-docimage"  style="max-width:500px;"/>
<p class="ms-doc-caption">TMS 1.1.0 URL from GeoServer</p>

When saved this, the user will be allowed to browse and add to the map the TMS layers provided by the service. MapStore will filter the layers published showing only the tile maps in the current EPSG.

<img src="../img/catalog/tms100_edit.jpg" class="ms-docimage"  style="max-width:400px;"/>
<p class="ms-doc-caption">Edit a TMS 1.0.0 provider</p>

<img src="../img/catalog/tms100_browse.jpg" class="ms-docimage"  style="max-width:400px;"/>
<p class="ms-doc-caption">Browse TMS 1.0.0 layers</p>

*sample TMS 1.0.0 services*

```
https://public.sig.rennesmetropole.fr/geowebcache/service/tms/1.0.0
https://osm.geobretagne.fr/gwc01/service/tms/1.0.0
http://gs-stable.geo-solutions.it/geoserver/gwc/service/tms/1.0.0
```

#### TMS Known Services

The other known services are listed as providers below "custom" and "TMS 1.0.0". They are a static list configured inside the application. Selecting one of the provider listed and saving the new catalog service allows to browse al the variants known for that service. For more information about the list of available providers, see the developer documentation about [Tile Providers](../../developer-guide/maps-configuration/#tileprovider)

<img src="../img/catalog/tms_known_edit.jpg" class="ms-docimage"  style="max-width:400px;"/>
<p class="ms-doc-caption">Select a known TMS provider</p>

<img src="../img/catalog/tms_known_browse.jpg" class="ms-docimage"  style="max-width:400px;"/>
<p class="ms-doc-caption">Browse the TMS variants</p>
