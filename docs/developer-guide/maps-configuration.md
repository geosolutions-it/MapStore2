# Map Configuration

By default MapStore is able to open maps with this path:

```http
http://localhost:8081/#viewer/<maptype>/<mapId>
```

Where:

- `maptype` can be `leaflet` `openlayers` or `cesium`.
- `mapId` can be a number or a string.
  - A **number** represents standard maps, stored on the database.
  - A **string** instead represents a static json file in the root of the application.

The second case can be used to define standard map contexts.

This is used for the **new map**. If you're logged in and allowed to create maps, when you try to create a new map you will see the the application will bring you to the URL:

```http
http://localhost:8081/#viewer/openlayers/new
```

This is a special context that uses the `new.json` file in the root of the project. (`web/client` for standard mapstore, root for custom projects). You can edit `new.json` to customize the initial template for new maps (for instance, you can change the backgrounds).

`new.json` is a special case, but you can configure your own static map context creating these json files in the root of the project, for instance `mycontext.json` and accessing them at the URL:

```http
http://localhost:8081/#viewer/openlayers/mycontext

```

**important note**: `new.json` is a special file and doesn't require the version. For other map context, you **must** specify the version of the map file type in the root of the json file:

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

## Layers options

Every layer has it's own properties. Anyway there are some options valid for every layer:

- `title`: `{object|string}` the title of the layer, can be an object to support i18n.
- `type`: `{string}` the type of the layer. Can be `wms`, `wmts`, `osm`...
- `name`: `{string}` the name is used as general reference to the layer, or as title, if the title is not specified. Anyway, it's usage depends on the specific layer type.
- `group`: `{string}`: the group of the layer (in the TOC). Nested groups can be indicated using `/`. i.e. `Group/SubGroup`. A special group, `background`, is used to identify background layers. These layers will not be available in the TOC, but only in the background switcher, and only one layer of this group can be visible.
- `thumbURL`: `{string}`: the URL of the thumbnail for the layer, used in the background switcher ( if the layer is a background layer )
- `visibility`: `{boolean}`: indicates if the layer is visible or not
- `queriable`: `{boolean}`: Indicates if the layer is queriable (e.g. getFeatureInfo). If not present the default is true for every layer that have some implementation available (WMS, WMTS). Usually used to set it explicitly to false, where the query service is not available.

i.e.

```javascript
{
    "title": "Open Street Map",
    "name": "mapnik",
    "group": "background",
    "visibility": false,
    "hidden": true
}
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

```json

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

```json
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

```javascript
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

```javascript
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

``` javascript
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
