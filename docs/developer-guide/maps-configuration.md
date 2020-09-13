# Map Configuration

By default MapStore is able to open maps with this path in the URL:

```http
http://localhost:8081/#viewer/<maptype>/<mapId>
```

Where:

- `maptype` can be `leaflet` `openlayers` or `cesium`.
- `mapId` can be a number or a string.
  - A **number** represents standard maps, stored on the database.
  - A **string** instead represents a static json file in the root of the application.

The first case can be used to load a map from the maps database, using its id.

There is a special mapId, 0 (zero), that is used to load a basic OSM map for demo purposes.

```http
http://localhost:8081/#viewer/openlayers/0
```

The configuration of this map is stored in the static `config.json` file in the root of the project.

The second case can be used to define standard map contexts.

This is used for the **new map**. If you're logged in and allowed to create maps, when you try to create a new map you will see the the application will bring you to the URL:

```http
http://localhost:8081/#viewer/openlayers/new
```

This page uses the `new.json` file as a template configuration to start creating a new map. You can find this file in `web/client` directory for standard MapStore or in the root for a custom projects.
You can edit `new.json` to customize this initial template. It typically contains the map backgrounds you want to use for all the new maps (identified by the special property `"group": "background"`).

If you have enabled the datadir, then you can externalize the new.json or config.json files. (see [here](../externalized-configuration) for more details)

`new.json` and `config.json` are special cases, but you can configure your own static map context creating these json files in the root of the project, for instance `mycontext.json` and accessing them at the URL:

```http
http://localhost:8081/#viewer/openlayers/mycontext

```

**important note**: `new.json` and `config.json` are special files and don't require the version. For other map context, you **must** specify the version of the map file type in the root of the json file:

```javascript
    {
        "version": 2,
        // ...
    }
```

These static map contexts are accessible by anyone. If you want to customize standard maps (that are listed in home page and where you can define) manually, you will have to edit the maps using the [GeoStore REST API](https://github.com/geosolutions-it/geostore/wiki/REST-API).

## Map options

The following options define the map options (projection, position, layers):

- `projection: {string}` expressed in EPSG values
- `units: {string}` uom of the coordinates
- `center: [object]` center of the map with starting point in the bottom-left corner
- `zoom: {number}` level of zoom
- `resolutions: {number[]}` resolutions for each level of zoom
- `maxExtent: {number[]}` max bbox of the map expressed [minx, miny, maxx, maxy]
- `layers: {object[]}` list of layers to be loaded on the map
- `groups {object[]}`: contains information about the layer groups

i.e.

```javascript
{
    "version": 2,
    "projection": "EPSG:900913",
    "units": "m",
    "center": {"x": 1000000.000000, "y": 5528000.000000, "crs": "EPSG:900913"},
    "zoom": 15,
    "mapOptions": {
      "view": {
        "resolutions": [
          84666.66666666688,
          42333.33333333344,
          21166.66666666672,
          10583.33333333336,
          5291.66666666668,
          2645.83333333334,
          1322.91666666667,
          661.458333333335000,
          529.166666666668000,
          396.875000000001000,
          264.583333333334000,
          132.291666666667000,
          66.145833333333500,
          39.687500000000100,
          26.458333333333400,
          13.229166666666700,
          6.614583333333350,
          3.968750000000010,
          2.645833333333340,
          1.322916666666670,
          0.661458333333335
        ]
      }
    },
    "maxExtent": [
        -20037508.34, -20037508.34,
        20037508.34, 20037508.34
    ],
    "layers": [{...},{...}]
}
```

!!! warning
    Actually the custom resolution values are valid for one single CRS. It's therefore suggested to avoid to add this parameter when multiple CRSs in the same map configuration are needed.

## Additional map configuration options

Map configuration also contains the following additional options:

- `catalogServices` object describing services configuration for Catalog
- `widgetsConfig` configuration of map widgets
- `mapInfoConfiguration` map info configuration options
- `dimensionData` contains map time information
    - `currentTime` currently selected time; the beginning of a time range if offsetTime is set
    - `offsetTime` the end of a time range
- `timelineData` timeline options
    - `selectedLayer` selected layer id; if not present time cursor will be unlocked

## Layers options

Every layer has it's own properties. Anyway there are some options valid for every layer:

- `title`: `{object|string}` the title of the layer, can be an object to support i18n.
- `type`: `{string}` the type of the layer. Can be `wms`, `wmts`, `osm`...
- `name`: `{string}` the name is used as general reference to the layer, or as title, if the title is not specified. Anyway, it's usage depends on the specific layer type.
- `group`: `{string}`: the group of the layer (in the TOC). Nested groups can be indicated using `/`. i.e. `Group/SubGroup`. A special group, `background`, is used to identify background layers. These layers will not be available in the TOC, but only in the background switcher, and only one layer of this group can be visible.
- `thumbURL`: `{string}`: the URL of the thumbnail for the layer, used in the background switcher ( if the layer is a background layer )
- `visibility`: `{boolean}`: indicates if the layer is visible or not
- `queriable`: `{boolean}`: Indicates if the layer is queriable (e.g. getFeatureInfo). If not present the default is true for every layer that have some implementation available (WMS, WMTS). Usually used to set it explicitly to false, where the query service is not available.
- `hideLoading`: {boolean}. If true, loading events will be ignored ( useful to hide loading with some layers that have problems or trigger errors loading some tiles or if they do not have any kind of loading.).

i.e.

```json
{
    "title": "Open Street Map",
    "name": "mapnik",
    "group": "background",
    "visibility": false,
    "hidden": true
}
```

**Localized titles**: In these configuration files you can localize titles using an object instead of a string in the `title` entry. In this case the `title` object has this shape:

```javascript
title: {
      'default': 'Meteorite Landings from NASA Open Data Portal', // default title, used in case the localized entry is not present
      'it-IT': 'Atterraggi meteoriti', // one string for each IETF language tag you want to support.
      'en-US': 'Meteorite Landings',
      'fr-FR': 'Débarquements de météorites'
    },
```

### Layer types

- `wms`: WMS - Web Mapping Service layers
- `osm`: OpenStreetMap layers format
- `tileprovider`: Some other mixed specific tile providers
- `wmts`: WMTS: Web Map Tile Service layers
- `bing`: Bing Maps layers
- `google`: Google Maps layers
- `mapquest`: MapQuest layers
- `empty`: special type for empty background

#### WMS

i.e.

```javascript
{
    "type": "wms",
    "url": "http..." // URL of the WMS Service
    "name": "TEST:TEST", // The name of the layer
    "format": "image/png8" // format
    "title": "Open Street Map",
    "name": "mapnik",
    "group": "background",
    "visibility": false,
    "credits": { // optional
        "imageUrl": "somePic.png", // URL for the image to put in attribution
        "link": "http://someURL.org", // URL where attribution have to link to
        "title": "text to render" // title to show (as image title or as text)
    }
}
```

You can also configure a WMS layer also as background, like this:

```javascript
    {
        "format": "image/jpeg",
        "name": "workspace:layername",
        "params": {},
        "singleTile": false,
        "title": "My WMS Background",
        "type": "wms",
        "group": "background",
        "thumbURL": "http://some.wms.service/geoserver/ows?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=rv%3Arv1&STYLES=&FORMAT=image%2Fjpeg&TRANSPARENT=true&HEIGHT=256&WIDTH=256&TILED=true&ZINDEX=2&SRS=EPSG%3A3857&CRS=EPSG%3A3857&BBOX=3757032.814272983,5009377.08569731,5009377.085697311,6261721.35712164",
        "url": "http://some.wms.service/geoserver/ows",
        "visibility": false
    },
```

##### Multiple URLs

This feature is not yet fully supported by all the plugins, but OpenLayers supports it so if you put an array of urls instead of a single string in the layer url.
Some other feature will break, for example the layer properties will stop working, so it is safe to use only on background layers.

```json
{
  "type": "wms",
  "url": [
    "https://a.maps.geo-solutions.it/geoserver/wms",
    "https://b.maps.geo-solutions.it/geoserver/wms",
    "https://c.maps.geo-solutions.it/geoserver/wms",
    "https://d.maps.geo-solutions.it/geoserver/wms",
    "https://e.maps.geo-solutions.it/geoserver/wms",
    "https://f.maps.geo-solutions.it/geoserver/wms"
  ],
  "visibility": true,
  "opacity": 1,
  "title": "OSM",
  "name": "osm:osm",
  "group": "Meteo",
  "format": "image/png8",
  "bbox": {
    "bounds": {"minx": -180, "miny": -90, "maxx": 180, "maxy": 90},
    "crs": "EPSG:4326"
  }
},
```

##### special case - The Elevation layer

WMS layers can be configured to be used as a source for elevation related functions.

This requires:

- a GeoServer WMS service with the [DDS/BIL plugin](https://docs.geoserver.org/stable/en/user/community/dds/index.html)
- A WMS layer configured with **BIL 16 bit** output in **big endian mode** and **-9999 nodata value**
- a static layer in the Map plugin configuration (use the additionalLayers configuration option):

in `localConfig.json`

```javascript
{
    "name": "Map",
    "cfg": {
        "additionalLayers": [{
            "url": "http..."
            "format": "application/bil16",
            ...
            "name": "elevation",
            "visibility": true,
            "useForElevation": true
        }]
    }
}
```

The layer will be used for:

- showing elevation in the MousePosition plugin (requires showElevation: true in the plugin configuration)
- as a TerrainProvider if the maptype is Cesium

in `localConfig.json`

```javascript
{
    "name": "MousePosition",
    "cfg": {
        "showElevation": true,
        ...
    }
}
```

#### WMTS

WMTS Layer require a source object in the `sources` object of the map configuration where to retrieve the `tileMatrixSet`. The source is identified by the `capabilitiesURL`. (if `capabilitiesURL` is not present it will use the `url`, in case of multiple URLs, the first one.).

A WMTS layer can have a `requestEncoding` that is RESTful or KVP. In case of RESTful the URL is a template where to place the request parameters ( see the example below ), while in the KVP the request parameters are in the query string. See the WMTS standard for more details.

e.g. (RESTful):

```javascript

{
  "version": 2,
  // ...
  "map": {
    // ...
    "layers": [
        // WMTS layer sample
        {
        "id": "bmapoberflaeche__11",
        "name": "layer_name",
        // ...
        "type": "wmts",
        "url": [ // MULTIPLE URLS are allowed
            "https://maps1.sampleServer/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpeg",
            "https://maps2.sampleServer/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpeg",
            "https://maps3.sampleServer/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpeg",
            "https://maps4.sampleServer/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpeg",
            "https://maps.sampleServer/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpeg"
        ],
        "allowedSRS": {
          "EPSG:3857": true
        },
        "matrixIds": [
          "google3857",
          "EPSG:3857"
        ],
        "tileMatrixSet": true,
        // KVP (By default) or RESTful
        "requestEncoding": "RESTful",
        // identifier for the source
        "capabilitiesURL": "https://sampleServer.org/wmts/1.0.0/WMTSCapabilities.xml",
      }
    ],
    "sources": {
      // source of the layer above
      "https://sampleServer.org/wmts/1.0.0/WMTSCapabilities.xml": {
        "tileMatrixSet": {
          "google3857": {
            "ows:Identifier": "google3857",
            "ows:BoundingBox": {
              "$": {
                "crs": "urn:ogc:def:crs:EPSG:6.18.3:3857"
              },
              "ows:LowerCorner": "977650 5838030",
              "ows:UpperCorner": "1913530 6281290"
            },
            "ows:SupportedCRS": "urn:ogc:def:crs:EPSG:6.18.3:3857",
            "WellKnownScaleSet": "urn:ogc:def:wkss:OGC:1.0:GoogleMapsCompatible",
            "TileMatrix": [
              {
                "ows:Identifier": "0",
                "ScaleDenominator": "559082264.029",
                "TopLeftCorner": "-20037508.3428 20037508.3428",
                "TileWidth": "256",
                "TileHeight": "256",
                "MatrixWidth": "1",
                "MatrixHeight": "1"
              },
              {
                "ows:Identifier": "1",
                "ScaleDenominator": "279541132.015",
                "TopLeftCorner": "-20037508.3428 20037508.3428",
                "TileWidth": "256",
                "TileHeight": "256",
                "MatrixWidth": "2",
                "MatrixHeight": "2"
              },
              // ...more levels
            ]
          }
        }
      }
    }
  }
}
```

e.g. (KVP)

```javascript
{
  "version": 2,
  "map": {
    // ...
    "projection": "EPSG:900913",
    "layers": [
      // ...
      {
        // requestEncoding is KVP by default
        "id": "EMSA:S52 Standard__6",
        "name": "EMSA:S52 Standard",
        "description": "S52 Standard",
        "title": "S52 Standard",
        "type": "wmts",
        // if the capabilitiesURL is not present, the `url` will be used to identify the source.
        // (for retro-compatibility with existing layers)
        "url": "http://some.domain/geoserver/gwc/service/wmts",
        "bbox": {
          "crs": "EPSG:4326",
          "bounds": {
            "minx": "-180.0",
            "miny": "-79.99999999999945",
            "maxx": "180.0",
            "maxy": "83.99999999999999"
          }
        },
        // list of allowed SRS
        "allowedSRS": {
          "EPSG:4326": true,
          "EPSG:3857": true,
          "EPSG:900913": true
        },
        // list of the available matrixes for the layer
        "matrixIds": [
          "EPSG:3395",
          "EPSG:32761",
          "EPSG:3857",
          "EPSG:4326",
          "EPSG:900913",
          "EPSG:32661"
        ],
        "tileMatrixSet": true
      }
    ],
    // ...
    "sources": {
      "http://some.domain/geoserver/gwc/service/wmts": {
        "tileMatrixSet": {
          "EPSG:32761": {/*...*/},
          "EPSG:3857": {/*...*/},
          "EPSG:4326": {/*...*/},
          "EPSG:32661": {/*...*/},
          "EPSG:3395": {/*...*/},
          "EPSG:900913": {
            "ows:Identifier": "EPSG:900913",
            // the supported CRS
            "ows:SupportedCRS": "urn:ogc:def:crs:EPSG::900913",
            "TileMatrix": [
              {
                "ows:Identifier": "EPSG:900913:0",
                "ScaleDenominator": "5.590822639508929E8",
                "TopLeftCorner": "-2.003750834E7 2.0037508E7",
                "TileWidth": "256",
                "TileHeight": "256",
                "MatrixWidth": "1",
                "MatrixHeight": "1",

                "ranges": {
                  "cols": {
                    "min": "0",
                    "max": "0"
                  },
                  "rows": {
                    "min": "0",
                    "max": "0"
                  }
                }
              },
              {
                "ows:Identifier": "EPSG:900913:1",
                "ScaleDenominator": "2.7954113197544646E8",
                "TopLeftCorner": "-2.003750834E7 2.0037508E7",
                "TileWidth": "256",
                "TileHeight": "256",
                "MatrixWidth": "2",
                "MatrixHeight": "2",
                // these ranges limit the tiles available for the grid level
                "ranges": {
                  "cols": {
                    "min": "0",
                    "max": "1"
                  },
                  "rows": {
                    "min": "0",
                    "max": "1"
                  }
                }
              },
              {
                "ows:Identifier": "EPSG:900913:2",
                "ScaleDenominator": "1.3977056598772323E8",
                "TopLeftCorner": "-2.003750834E7 2.0037508E7",
                "TileWidth": "256",
                "TileHeight": "256",
                "MatrixWidth": "4",
                "MatrixHeight": "4",
                "ranges": {
                  "cols": {
                    "min": "0",
                    "max": "3"
                  },
                  "rows": {
                    "min": "0",
                    "max": "3"
                  }
                }
              }
            ]
          }
        }
      }
    }
  }
```

#### Bing

TODO

#### Google

example:

```json
    {
        "type": "google",
        "title": "Google HYBRID",
        "name": "HYBRID",
        "source": "google",
        "group": "background",
        "visibility": false
    }
```

#### OSM

example:

```json
{
    "type": "osm",
    "title": "Open Street Map",
    "name": "mapnik",
    "source": "osm",
    "group": "background",
    "visibility": true
}
```

#### TileProvider

TileProvider is a shortcut to easily configure many different layer sources.
It's enough to add `provider` property and 'tileprovider' as type property to the layer configuration object. `provider` should be in the form of `ProviderName.VariantName`.

i.e.

```javascript
{
    "type": "tileprovider",
    "title": "Title",
    "provider": "Stamen.Toner", // "ProviderName.VariantName"
    "name": "Name",
    "group": "GroupName",
    "visibility": false
}
```

Options passed in configuration object, if already configured by TileProvider,  will be overridden.

Openlayers' TileProvider at the moment doesn't support `minZoom` configuration property and high resolution map.

In case of missing `provider` or if `provider: "custom"`, the tile provider can be customized and configured internally.
You can configure the `url` as a template, than you can configure options add specific options (`maxNativeZoom`, `subdomains`).

```javascript
{
    "type": "tileprovider",
    "title": "Title",
    "provider": "custom", // or undefined
    "name": "Name",
    "group": "GroupName",
    "visibility": false,
    "url": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    "options": {
        "subdomains": [ "a", "b"]
    }
}
```

##### Providers and variants

This is a *not maintained* list of providers and variants. For the most updated list check the code [here](https://github.com/geosolutions-it/MapStore2/blob/master/web/client/utils/ConfigProvider.js)

Some of them may need some additional configuration or API keys.

```text
OpenStreetMap.Mapnik
OpenStreetMap.BlackAndWhite
OpenStreetMap.DE
OpenStreetMap.France
OpenStreetMap.HOT
Thunderforest.OpenCycleMap
Thunderforest.Transport
Thunderforest.TransportDark
Thunderforest.Landscape
Thunderforest.Outdoors
OpenMapSurfer.Roads
OpenMapSurfer.AdminBounds
OpenMapSurfer.Grayscale
Hydda.Full
Hydda.Base
Hydda.RoadsAndLabels
MapQuestOpen.OSM
MapQuestOpen.Aerial
MapQuestOpen.HybridOverlay
Stamen.Toner
Stamen.TonerBackground
Stamen.TonerHybrid
Stamen.TonerLines
Stamen.TonerLabels
Stamen.TonerLite
Stamen.Watercolor
Stamen.Terrain
Stamen.TerrainBackground
Stamen.TopOSMRelief
Stamen.TopOSMFeatures
Esri.WorldStreetMap
Esri.DeLorme
Esri.WorldTopoMap
Esri.WorldImagery
Esri.WorldTerrain
Esri.WorldShadedRelief
Esri.WorldPhysical
Esri.OceanBasemap
Esri.NatGeoWorldMap
Esri.WorldGrayCanvas
OpenWeatherMap.Clouds
OpenWeatherMap.CloudsClassic
OpenWeatherMap.Precipitation
OpenWeatherMap.PrecipitationClassic
OpenWeatherMap.Rain
OpenWeatherMap.RainClassic
OpenWeatherMap.Pressure
OpenWeatherMap.PressureContour
OpenWeatherMap.Wind
OpenWeatherMap.Temperature
OpenWeatherMap.Snow
HERE.normalDay
HERE.normalDayCustom
HERE.normalDayGrey
HERE.normalDayMobile
HERE.normalDayGreyMobile
HERE.normalDayTransit
HERE.normalDayTransitMobile
HERE.normalNight
HERE.normalNightMobile
HERE.normalNightGrey
HERE.normalNightGreyMobile
HERE.carnavDayGrey
HERE.hybridDay
HERE.hybridDayMobile
HERE.pedestrianDay
HERE.pedestrianNight
HERE.satelliteDay
HERE.terrainDay
HERE.terrainDayMobile
Acetate.basemap
Acetate.terrain
Acetate.all
Acetate.foreground
Acetate.roads
Acetate.labels
Acetate.hillshading
CartoDB.Positron
CartoDB.PositronNoLabels
CartoDB.PositronOnlyLabels
CartoDB.DarkMatter
CartoDB.DarkMatterNoLabels
CartoDB.DarkMatterOnlyLabels
HikeBike.HikeBike
HikeBike.HillShading
BasemapAT.basemap
BasemapAT.grau
BasemapAT.overlay
BasemapAT.highdpi
BasemapAT.orthofoto
NASAGIBS.ModisTerraTrueColorCR
NASAGIBS.ModisTerraBands367CR
NASAGIBS.ViirsEarthAtNight2012
NASAGIBS.ModisTerraLSTDay
NASAGIBS.ModisTerraSnowCover
NASAGIBS.ModisTerraAOD
NASAGIBS.ModisTerraChlorophyll
NLS.OS_1900
NLS.OS_1920
NLS.OS_opendata
NLS.OS_6inch_1st
NLS.OS_6inch
NLS.OS_25k
NLS.OS_npe
NLS.OS_7th
NLS.OS_London
NLS.GSGS_Ireland
PDOK.brtachtergrondkaart
PDOK.brtachtergrondkaartgrijs
PDOK.brtachtergrondkaartpastel
PDOK.brtachtergrondkaartwater
PDOK.luchtfotoRGB
PDOK.luchtfotoIR
```

#### Vector

The layer type vector is the type used for imported data (geojson, shapefile) or for annotations. Generally speaking, any vector data added directly to the map.
This is the typical fields of a vector layer

```json
{
    "type":"vector",
    "features":[
        {
            "type":"Feature",
            "geometry":{
                "type":"Point",
                "coordinates":[
                12.516431808471681,
                41.89817370656741
                ]
            },
            "properties":{
            },
            "id":0
        }
    ],
    "style":{
        "weight":5,
        "radius":10,
        "opacity":1,
        "fillOpacity":0.1,
        "color":"rgba(0, 0, 255, 1)",
        "fillColor":"rgba(0, 0, 255, 0.1)"
    },
    "hideLoading":true
}
```

- `features`: features in GeoJSON format.
- `style`: the style object.
- `styleName`: name of a style to use (e.g. "marker").
- `hideLoading`: boolean. if true, the loading will not be taken into account.

#### Vector Style

The `style` or `styleName` properties of vector layers (wfs, vector...) allow to apply a style to the local data on the map.

- `style`: a style object/array. It can have different formats. In the simplest case it is an object that uses some leaflet-like style properties:
  - `weight`: width in pixel of the border / line.
  - `radius`: radius of the circle (valid only for Point types)
  - `opacity`: opacity of the border / line.
  - `color`: color of the border / line.
  - `fillOpacity`: opacity of the fill if any. (Polygons, Point)
  - `fillColor`: color of the fill, if any. (Polygons, Point)
- `styleName`: if set to `marker`, the `style` object will be ignored and it will use the default marker.

In case of `vector` layer, style can be added also to the specific features. Other ways of defining the style for a vector layer have to be documented.

#### Advanced Vector Styles

To support advanced styles (like multiple rules, symbols, dashed lines, start point, end point) the style can be configured also in a different format, as an array of objects and you can define them feature by feature, adding a "style" property.

!!!warning
    This advanced style functionality has been implemented to support annotations, at the moment this kind of advanced style options is supported **only** as a property of the single feature object, not as global style.

##### SVG Symbol

The following options are available for a SVG symbol.

- `symbolUrl`: a URL (also a data URL is ok) for the symbol to use (SVG format).
    You can anchor the symbol using:
  - `iconAnchor`: array of x,y position of the offset of the symbol from top left corner.
  - `anchorXUnits`, `anchorYUnits` unit of the `iconAnchor` (`fraction` or `pixels`).
  - `size`: the size in pixel of the square that contains the symbol to draw. The size is used to center and to cut the original svg, so it must fit the svg.
- `dashArray`: Array of line, space size, in pixels. ["6","6"] Will draw the border of the symbol dashed. It is applied also to a generic line or polygon geometry.

##### Markers and glyphs

These are the available options for makers. These are specific of annotations for now, so allowed values have to be documented.

- `iconGlyph`: e.g. "shopping-cart"
- `iconShape`: e.g. "circle"
- `iconColor`: e.g. "red"
- `iconAnchor`: [0.5,0.5]

##### Multiple rules and filtering

In order to support start point and end point symbols, you could find in the style these entries:

- `geometry`: "endPoint"|"startPoint", identify how to get the geometry from
- `filtering`: if true, the geometry filter is applied.

#### Example

Here an example of a layer with:

- a point styled with SVG symbol,
- a polygon with dashed style
- a line with start-end point styles as markers with icons

```json
{
        "type": "vector",
        "visibility": true,
        "id": "styled-vector-layer",
        "name": "styled-vector-layer",
        "hideLoading": true,
        "features": [
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [2,0]
            },
            "properties": {},
            "style": [
              {
                "iconAnchor": [0.5,0.5],
                "anchorXUnits": "fraction",
                "anchorYUnits": "fraction",
                "opacity": 1,
                "size": 30,
                "symbolUrl": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30'%3E%3Crect  x='5' y='5' width='20' height='20' style='fill:rgb(255,0,0);stroke-width:5;stroke:rgb(0,0,0)' /%3E%3C/svg%3E",
                "shape": "triangle",
                "id": "c65cadc0-9b46-11ea-a138-dd5f1faf9a0d",
                "highlight": false,
                "weight": 4
              }
            ]
          },{
            "type": "Feature",
            "geometry": {
              "type": "Polygon",
              "coordinates": [[[0, 0],[1, 0],[1, 1],[0,1],[ 0,0]]]
            },
            "properties": {},
            "style": [
              {
                "color": "#d0021b",
                "opacity": 1,
                "weight": 3,
                "fillColor": "#4a90e2",
                "fillOpacity": 0.5,
                "highlight": false,
                "dashArray": ["6","6"]
              }
            ]
          },{
            "type": "Feature",
            "geometry": {
              "coordinates": [[0, 2],[ 0,3]],
              "type": "LineString"
            },
            "properties": {},
            "style": [
              {
                "color": "#ffcc33",
                "opacity": 1,
                "weight": 3,
                "editing": {
                  "fill": 1
                },
                "highlight": false
              },
              {
                "iconGlyph": "comment",
                "iconShape": "square",
                "iconColor": "blue",
                "highlight": false,
                "iconAnchor": [ 0.5,0.5],
                "type": "Point",
                "title": "StartPoint Style",
                "geometry": "startPoint",
                "filtering": true
              },
              {
                "iconGlyph": "shopping-cart",
                "iconShape": "circle",
                "iconColor": "red",
                "highlight": false,
                "iconAnchor": [ 0.5,0.5 ],
                "type": "Point",
                "title": "EndPoint Style",
                "geometry": "endPoint",
                "filtering": true
              }
            ]
          }
        ]
      }
```

*Result:*

<img src="../img/vector-style-annotations.jpg" class="ms-docimage"  style="max-width:600px;"/>

#### WFS Layer

A vector layer, whose data source is a WFS service. The configuration has properties in common with both WMS and vector layers. it contains the search entry that allows to browse the data on the server side. The styling system is the same of the vector layer.

This layer differs from the "vector" because all the loading/filtering/querying operations are applied directly using the WFS service, without storing anything locally.

```json
{
    "type":"wfs",
    "search":{
        "url":"https://myserver.org/geoserver/wfs",
        "type":"wfs"
    },
    "name":"workspace:layer",
    "styleName":"marker",
    "url":"https://myserver.org/geoserver/wfs"
}
```

## Layer groups

Inside the map configuration, near the `layers` entry, you can find also the `groups` entry. This array contains information about the groups in the TOC.
A group entry has this shape:


- `id`: the id of the group.
- `expanded`: boolean that keeps the status (expanded/collapsed) of the group.
- `title`: a string or an object (for i18n) with the title of the group. i18n object format is the same of layer's title.

```json
"title": {
        "default": "Root Group",
        "it-IT": "Gruppo radice",
        "en-US": "Root Group",
        "de-DE": "Wurzelgruppe",
        "fr-FR": "Groupe Racine",
        "es-ES": "Grupo Raíz"
      },
```

i.e.

```json
{
  "id": "GROUP_ID",
  "title": "Some default title"
  "expanded": true
}
```

## Other supported formats

The JSON format above is the standard MapStore format. Anyway MapStore allows to import/export different kinds of formats for maps.

### Web Map Context

MapStore provides support for OGC Web Map Context(WMC) files. They can be imported either using
Import plugin functionality, or from within a context using Map Templates plugin. MapStore maps can
also be exported in WMC format through Export plugin.

The important thing to remember when exporting MapStore maps to WMC format is that it only supports WMS layers,
meaning any non-WMS layers(such as tiled OSM backgrounds for example) will not be preserved in the resulting WMC file.
The exact way in which the conversion happens is described in further detail throughout this document.

#### WMC File Structure

WMC context file generated by MapStore is an XML file with the following structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ViewContext xmlns="http://www.opengis.net/context" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.1.0" xsi:schemaLocation="http://www.opengis.net/context http://schemas.opengis.net/context/1.1.0/context.xsd">
    <General>
        <Title>MapStore Context</Title>
        <Abstract>This is a map exported from MapStore2.</Abstract>
        <BoundingBox minx="-20037508.34" miny="-20037508.34" maxx="20037508.34" maxy="20037508.34" SRS="EPSG:900913"/>
        <Extension>
            <!--general extensions go here-->
        </Extension>
    </General>
    <LayerList>
        <Layer queryable="0" hidden="0">
        <Name>topp:states</Name>
        <Title>USA Population</Title>
        <Server service="OGC:WMS" version="1.3.0">
            <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://demo.geo-solutions.it/geoserver/wms"/>
        </Server>
        <DimensionList>
            <Dimension name="elevation" units="EPSG:5030" unitSymbol="m" default="0.0" multipleValues="1">0.0,200.0,400.0,600.0</Dimension>
            <Dimension name="time" units="ISO8601" default="current" multipleValues="1">2016-02-23T03:00:00.000Z,2016-02-23T06:00:00.000Z</Dimension>
            <!--...other dimensions-->
        </DimensionList>
        <FormatList>
            <Format current="1">image/png</Format>
            <!--...other formats-->
        </FormatList>
        <StyleList>
            <Style>
                <Name>population</Name>
                <Title>Population in the United States</Title>
                <LegendURL width="81" height="80" format="image/png">
                    <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://demo.geo-solutions.it:443/geoserver/topp/states/ows?service=WMS&amp;request=GetLegendGraphic&amp;format=image%2Fpng&amp;width=20&amp;height=20&amp;layer=states"/>
                </LegendURL>
            </Style>
            <!--...other styles-->
        </StyleList>
        <Extension>
            <!--layer extensions go here-->
        </Extension>
        <!--...other layers-->
    </LayerList>
</ViewContext>
```

More information about each of the elements in the example above can be looked up in [OGC WMC implementation specification](http://portal.opengeospatial.org/files/?artifact_id=8618)

Apart from standard WMC XML elements, MapStore provides support for various extensions. These are placed inside
`Extension` tag, and are not gueranteed to be supported outside MapStore, as they are not a part of OGC
Web Map Context specification. MapStore provides two types of extensions: openlayers and mapstore-specific elements.
WMC can have an `Extension` element inside `General`, and each of the `Layer` elements. Supported extensions in `General` are:

Openlayers:

- `maxExtent` if present, it's attributes are used as map's bounding box, instead of the values specified in `BoundingBox` tag.
The values are assumed to be in a projection, specified in SRS attribute of `BoundingBox`

```xml
<ol:maxExtent xmlns:ol="http://openlayers.org/context" minx="-20037508.34" miny="-20037508.34" maxx="20037508.34" maxy="20037508.34"/>
```

MapStore specific:

- `GroupList` defines a mapstore group list. Contains `Group` elements that describe a particular layer group:

```xml
<ms:GroupList xmlns:ms="http://geo-solutions.it/mapstore/context">
    <ms:Group xmlns:ms="http://geo-solutions.it/mapstore/context" id="Default" title="Default" expanded="true"/>
</ms:GroupList>
```

- `center` defines a center of map view

```xml
<ms:center xmlns:ms="http://geo-solutions.it/mapstore/context" x="1.5" y="2.5" crs="EPSG:3857"/>
```

- `zoom` map zoom level

```xml
<ms:zoom xmlns:ms="http://geo-solutions.it/mapstore/context">7</ms:zoom>
```

Supported extensions for each `Layer` element are:

Openlayers:

- `maxExtent` if present, used for the value of layer's bbox. Values are assumed to be in a projection, specified in SRS attribute of
"BoundingBox"
- `singleTile` specifies layer's "singleTile" property value
- `transparent` is layer transparent or not, true by default
- `isBaseLayer` if true, the layer is put into "backgrounds" group
- `opacity` layer's opacity value

```xml
<ol:maxExtent xmlns:ol="http://openlayers.org/context" minx="-13885038.382960921" miny="2870337.130793682" maxx="-7455049.489182421" maxy="6338174.0557576185"/>
<ol:singleTile xmlns:ol="http://openlayers.org/context">false</ol:singleTile>
<ol:transparent xmlns:ol="http://openlayers.org/context">true</ol:transparent>
<ol:isBaseLayer xmlns:ol="http://openlayers.org/context">false</ol:isBaseLayer>
<ol:opacity xmlns:ol="http://openlayers.org/context">1</ol:opacity>
```

MapStore specific:

- `group` specifies to which group, among listed in "GroupList" element, the layer belongs to
- `search` JSON describing a filter that is applied to the layer
- `DimensionList` contains `Dimension` elements that describe dimensions that cannot be described using standard "Dimension" tag.
Currently supports dimensions of ***multidim-extension*** type:
- `CatalogServices` contains `Service` elements that describe services available for use in Catalog.

```xml
<ms:DimensionList xmlns:ms="http://geo-solutions.it/mapstore/context">
    <ms:Dimension xmlns:ms="http://geo-solutions.it/mapstore/context" xmlns:xlink="http://www.w3.org/1999/xlink" name="time" type="multidim-extension" xlink:type="simple" xlink:href="https://cloudsdi.geo-solutions.it/geoserver/gwc/service/wmts"/>
</ms:DimensionList>
<ms:CatalogServices selectedService="gs_stable_csw">
    <ms:Service serviceName="gs_stable_csw">
        <ms:Attribute name="url" type="string">https://gs-stable.geo-solutions.it/geoserver/csw</ms:Attribute>
        <ms:Attribute name="type" type="string">csw</ms:Attribute>
        <ms:Attribute name="title" type="string">GeoSolutions GeoServer CSW</ms:Attribute>
        <ms:Attribute name="autoload" type="boolean">true</ms:Attribute>
    </ms:Service>
    <ms:Service serviceName="gs_stable_wms">
        <ms:Attribute name="url" type="string">https://gs-stable.geo-solutions.it/geoserver/wms</ms:Attribute>
        <ms:Attribute name="type" type="string">wms</ms:Attribute>
        <ms:Attribute name="title" type="string">GeoSolutions GeoServer WMS</ms:Attribute>
        <ms:Attribute name="autoload" type="boolean">false</ms:Attribute>
    </ms:Service>
    <ms:Service serviceName="gs_stable_wmts">
        <ms:Attribute name="url" type="string">https://gs-stable.geo-solutions.it/geoserver/gwc/service/wmts</ms:Attribute>
        <ms:Attribute name="type" type="string">wmts</ms:Attribute>
        <ms:Attribute name="title" type="string">GeoSolutions GeoServer WMTS</ms:Attribute>
        <ms:Attribute name="autoload" type="boolean">false</ms:Attribute>
    </ms:Service>
</ms:CatalogServices>
```

Note, that during the exporting process, some sort of fallback for dimensions, listed as extensions, is provided inside the standard
`DimensionList` tag whenever possible, to ensure interoperability with other geospatial software. When such a context is
imported back into MapStore, the values of dimensions inside extensions will override the ones specified inside the standard
`DimensionList` tag.

Also note, that the extension elements would be read correctly only if they belong to appropriate XML namespaces:

- `http://openlayers.org/context` for openlayers extensions
- `http://geo-solutions.it/mapstore/context` for mapstore specific extensions

#### Usage inside MapTemplates plugin

As stated previously, WMC files can be used as map templates inside contexts. New WMC templates can be uploaded in context creation tool,
after enabling the MapTemplates plugin for a context. When the context is loaded, for every template inside MapTemplates there are
two options available:

- `Replace map with this template` replace the currently loaded map with the one described by the template. Upon loading,
the map will zoom to the extent specified in `maxExtent` extension or in `BoundingBox` tag. If the template has no
visible background layers available, the default empty background will be added and set to be visible automatically.
- `Add this template to map` merges layers and groups inside the template with the current map configuration. If the WMC template does
not contain `GroupList` extension, a new group with the name extracted from `Title` tag of the template
will be created and will contain all the layers of the template. Zoom and projection will remain unchanged.

#### Other considerations

Due to the limitations posed by WMC format the conversion process will not preserve the map state in it's entirety. The only supported way
to do this is to export to MapStore JSON format. The WMC export option presumably should be used in cases when the WMS layers inside
a MapStore map need to be used in some way with a different geospatial software suite, or to import such layers from outside
MapStore or if you already have WMC context files that you want to use.
