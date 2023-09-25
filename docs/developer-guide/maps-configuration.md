# Map Configuration

By default MapStore is able to open maps with this path in the URL:

```http
http://localhost:8081/#viewer/<mapId>
```

Where:

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

This page uses the `new.json` file as a template configuration to start creating a new map. You can find this file in `web/client/configs` directory for standard MapStore or in `configs/` folder for a custom projects.
You can edit `new.json` to customize this initial template. It typically contains the map backgrounds you want to use for all the new maps (identified by the special property `"group": "background"`).

If you have enabled the datadir, then you can externalize the new.json or config.json files. (see [here](externalized-configuration.md#externalized-configuration) for more details)

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
- `scales: {number[]}` scales used to compute the map resolutions
- `maxExtent: {number[]}` max bbox of the map expressed [minx, miny, maxx, maxy]
- `layers: {object[]}` list of layers to be loaded on the map
- `groups {object[]}`: contains information about the layer groups
- `visualizationMode: {string}` defines if the map should be visualized in "2D" or "3D"
- `viewerOptions: {object}` could contain viewer specific properties, eg. camera orientation and camera position for 3D visualization mode

i.e.

```javascript
{
    "version": 2,
    "projection": "EPSG:900913",
    "units": "m",
    "center": {"x": 1000000.000000, "y": 5528000.000000, "crs": "EPSG:900913"},
    "zoom": 15,
    "visualizationMode": "2D",
    "viewerOptions": {
      "cameraPosition": {
        "longitude": 0,
        "latitude": 0,
        "height": 0
      },
      "orientation": {
        "heading": 0,
        "pitch": 0,
        "roll": 0
      }
    },
    "mapOptions": {
      "view": {
        "scales": [175000, 125000, 100000, 75000, 50000, 25000, 10000, 5000, 2500],
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

!!! note
    The option to configure a list of scale denominators allow to have them in human friendly format, and calculate the map resolutions from scales.

!!! warning
    If the scales and resolutions property are declared, in the same json object, the scales have priority.
    In the array, the values have be in descending order.

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
- `hideLoading`: {boolean}. If true, loading events will be ignored ( useful to hide loading with some layers that have problems or trigger errors loading some tiles or if they do not have any kind of loading.).
- `minResolution`: `{number}`: layer is visible if zoom resolution is greater or equal than this value (inclusive)
- `maxResolution`: `{number}`: layer is visible if zoom resolution is less than this value (exclusive)
- `disableResolutionLimits`: `{boolean}`: this property disables the effect of minResolution and maxResolution if set to true

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

The layers can belong to the `background` group, in this case they will be available in the background switcher, and only one layer of this group can be visible at the same time.

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

In the case of the background the `thumbURL` is used to show a preview of the layer in the background switcher.

### Layer types

- `wms`: WMS - Web Mapping Service layers
- `osm`: OpenStreetMap layers format
- `tileprovider`: Some other mixed specific tile providers
- `wmts`: WMTS: Web Map Tile Service layers
- `bing`: Bing Maps layers
- `google`: Google Maps layers
- `mapquest`: MapQuest layers
- `graticule`: Vector layer that shows a coordinates grid over the map, with optional labels
- `empty`: special type for empty background
- `3dtiles`: 3d tiles layers
- `terrain`: layers that define the elevation profile of the terrain
- `cog`: Cloud Optimized GeoTIFF layers

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
    "params": {}, // can be used to add parameters to the request, or override the default ones
    "layerFilter": {} // a layer filter object, to filter the layer
    "search": {}, // object to configure the features URL in the layer
    "fields": [{"name": "attr1", "alias": "Attribute 1", "type": "string"},{...}] // array of fields
    "credits": { // optional
        "imageUrl": "somePic.png", // URL for the image to put in attribution
        "link": "http://someURL.org", // URL where attribution have to link to
        "title": "text to render" // title to show (as image title or as text)
    }
}
```

Details:

- `url`: the URL of the WMS service
- `name`: name of the layer
- `format`: the format of the WMS requests to use
- `params`: an object with additional parameters to add to the WMS request
- `layerFilter`: an object to filter the layer. See [LayerFilter](LayerFilter.md) for details.
- `search`: an object to configure the search features service. It is used to link a WFS service, typically with this shape: `{url: 'http://some.wfs.service', type: 'wfs'}`.
- `fields`: if the layer has a wfs service configured, this can contain the fields (attributes) of the features, with custom configuration (e.g. aliases, types, etc.). See [Fields](#fields) for details.
- `credits`: includes the information to show in attribution.(`imageUrl`, `link`, `title`).

##### Fields

The `fields` array is used to configure the attributes of the features of the layer. They can be used in the Identify tool, in the FeatureGrid plugin, in the FeatureInfo popup, etc.
It is supported by `wms` and `wfs` layers. The supported attributes are:

- `name`: the name of the attribute
- `alias`: the alias of the attribute (used in the Identify tool, in the FeatureGrid plugin, in the FeatureInfo popup, etc.). If not present, the `name` will be used. It can be an object to support i18n.
- `type`: the type of the attribute. Supported types are: `string`, `number`, `date`, `boolean`. If not present, the default type is `string`.
- `filterRenderer`: an object to configure the filter renderer in feature grid (for custom projects)
  - `name`: the name of the filter renderer (for custom projects)
- `featureGridFormatter`: an object to configure the feature grid formatter in feature grid.
  - `name`: the name of the feature grid formatter .
  - `config`: the configuration of the feature grid formatter.

Example:

```json
{
    "fields": [{
        "name": "attr1",
        "alias": "Attribute 1",
        "type": "string",
        "filterRenderer": {
            "name": "customFilterRenderer"
        },
        "featureGridFormatter": {
            "name": "customFeatureGridFormatter",
            "config": {
                "someConfig": "someValue"
            }
        }
    }, {
        "name": "attr2",
        "alias": {
            "default": "Attribute 2",
            "en-US": "Attribute 2",
            "it-IT": "Attributo 2"
        },
        "type": "number"
    }]
}
```

##### Multiple URLs

This feature is not yet fully supported by all the plugins, but OpenLayers supports it so if you put an array of urls instead of a single string in the layer url.
Some other feature will break, for example the layer properties will stop working, so it is safe to use only on background layers.

```json
{
  "type": "wms",
  "url": [
    "https://a.maps.geosolutionsgroup.com/geoserver/wms",
    "https://b.maps.geosolutionsgroup.com/geoserver/wms",
    "https://c.maps.geosolutionsgroup.com/geoserver/wms",
    "https://d.maps.geosolutionsgroup.com/geoserver/wms",
    "https://e.maps.geosolutionsgroup.com/geoserver/wms",
    "https://f.maps.geosolutionsgroup.com/geoserver/wms"
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

!!! note
    This type of layer configuration is still needed to show the elevation data inside the MousePosition plugin. The `terrain` layer section shows a more versatile way of handling elevation but it will work only as visualization in the 3D map viewer.

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
            "url": "http...",
            "format": "application/bil16",
            "type": "wms",
            ...
            "name": "elevation",
            "littleendian": false,
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

The WMTS Layer configuration has a `availableTileMatrixSets` object that lists all the available tile matrix sets for the specific layer.
Every entry of `availableTileMatrixSets`, identified by the ID of the tile matrix set, contains the `crs` and one of `tileMatrixSet` or `tileMatrixSetLink`. The first contains the definition of the tile matrix set, while the second contain the path to the tile matrix set definition in the JSON of the map configuration.
This object can also optionally contain a `limits` entry, containing the specific limits of the layer inside the tile matrix set.

```json
{
   "type": "wmts",
    "availableTileMatrixSets": {
          "google3857": {
            "crs": "EPSG:3857",
            "tileMatrixSetLink": "sources['https://sampleServer.org/wmts/1.0.0/WMTSCapabilities.xml'].tileMatrixSet['EPSG:3857']"
          }
        }
```

The `sources` entry of the map configuration usually contains the tile matrix sets definitions of the layers of the map, stored by their `capabilitiesURL` (if `capabilitiesURL` is not present it will use the `url` of the layer, in case of multiple URLs, the first one.).

A WMTS layer has also a `requestEncoding` entry that can be valued with `RESTful` or `KVP`. In case of `RESTful` the URL is a template where to place the request parameters ( see the example below ), while in the `KVP` case the request parameters will be passed in the query string. See the WMTS standard for more details.

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
        "availableTileMatrixSets": {
          "google3857": {
            "crs": "EPSG:3857",
            "tileMatrixSetLink": "sources['https://sampleServer.org/wmts/1.0.0/WMTSCapabilities.xml'].tileMatrixSet['EPSG:3857']"
          }
        },
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
        "availableTileMatrixSets": {
          "EPSG:32761": {
            "crs": "EPSG:32761",
            "tileMatrixSetLink": "sources['http://some.domain/geoserver/gwc/service/wmts'].tileMatrixSet['EPSG:32761']"
          },
          "EPSG:3857": {
            "crs": "EPSG:3857",
            "tileMatrixSetLink": "sources['http://some.domain/geoserver/gwc/service/wmts'].tileMatrixSet['EPSG:3857']"
          },
          "EPSG:4326": {
            "crs": "EPSG:4326",
            "tileMatrixSetLink": "sources['http://some.domain/geoserver/gwc/service/wmts'].tileMatrixSet['EPSG:4326']"
          },
          "EPSG:32661": {
            "crs": "EPSG:32661",
            "tileMatrixSetLink": "sources['http://some.domain/geoserver/gwc/service/wmts'].tileMatrixSet['EPSG:32661']"
          },
          "EPSG:3395": {
            "crs": "EPSG:3395",
            "tileMatrixSetLink": "sources['http://some.domain/geoserver/gwc/service/wmts'].tileMatrixSet['EPSG:3395']"
          },
          "EPSG:900913": {
            "crs": "EPSG:900913",
            // these ranges limit the tiles available for the grid level
            "limits": [
              {
                "identifier": "EPSG:900913:0",
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
                "identifier": "EPSG:900913:1",
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
                "identifier": "EPSG:900913:2",
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
            ],
            "tileMatrixSetLink": "sources['http://some.domain/geoserver/gwc/service/wmts'].tileMatrixSet['EPSG:900913']"
          }
        }
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
                "MatrixHeight": "1"
              },
              {
                "ows:Identifier": "EPSG:900913:1",
                "ScaleDenominator": "2.7954113197544646E8",
                "TopLeftCorner": "-2.003750834E7 2.0037508E7",
                "TileWidth": "256",
                "TileHeight": "256",
                "MatrixWidth": "2",
                "MatrixHeight": "2"
              },
              {
                "ows:Identifier": "EPSG:900913:2",
                "ScaleDenominator": "1.3977056598772323E8",
                "TopLeftCorner": "-2.003750834E7 2.0037508E7",
                "TileWidth": "256",
                "TileHeight": "256",
                "MatrixWidth": "4",
                "MatrixHeight": "4"
              }
            ]
          }
        }
      }
    }
  }
```

e.g. (embed tileMatrixSet without link to sources)

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
          "EPSG:3857": true,
          "EPSG:900913": true
        },
        "availableTileMatrixSets": {
          "EPSG:900913": {
            "crs": "EPSG:900913",
            "tileMatrixSet": {
              "ows:Identifier": "EPSG:900913",
              "ows:SupportedCRS": "urn:ogc:def:crs:EPSG::900913",
              "TileMatrix": [
                {
                  "ows:Identifier": "EPSG:900913:0",
                  "ScaleDenominator": "5.590822639508929E8",
                  "TopLeftCorner": "-2.003750834E7 2.0037508E7",
                  "TileWidth": "256",
                  "TileHeight": "256",
                  "MatrixWidth": "1",
                  "MatrixHeight": "1"
                },
                {
                  "ows:Identifier": "EPSG:900913:1",
                  "ScaleDenominator": "2.7954113197544646E8",
                  "TopLeftCorner": "-2.003750834E7 2.0037508E7",
                  "TileWidth": "256",
                  "TileHeight": "256",
                  "MatrixWidth": "2",
                  "MatrixHeight": "2"
                },
                {
                  "ows:Identifier": "EPSG:900913:2",
                  "ScaleDenominator": "1.3977056598772323E8",
                  "TopLeftCorner": "-2.003750834E7 2.0037508E7",
                  "TileWidth": "256",
                  "TileHeight": "256",
                  "MatrixWidth": "4",
                  "MatrixHeight": "4"
                }
              ]
            }
          }
        }
      }
    ]
  }
```

#### Bing

TODO

#### Google

!!! note
    The use of Google maps tiles in MapStore is not enabled and maintained due to licensing reasons. If your usage conditions respect the google license, you can enable the google layers by:

    * Adding `<script src="https://maps.google.com/maps/api/js?v=3"></script>` to all `html` files you need it.
    * Add your API-KEY to the request
    * Fix the code, if needed.

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
    "fields": [{"name": "attr1", "alias": "Attribute 1", "type": "string"}],
    "name":"workspace:layer",
    "styleName":"marker",
    "url":"https://myserver.org/geoserver/wfs"
}
```

- `name`: the name of the layer in the WFS service.
- `url`: the url of the WFS service.
- `fields`: if the layer has a wfs service configured, this can contain the fields (attributes) of the features, with custom configuration (e.g. aliases, types, etc.)

#### Vector Style

The `vector` and `wfs` layer types are rendered by the client as GeoJSON features and it possible to apply specific symbolizer using the `style` property available in the layer options. The style object is composed by these properties

- `format` the format encoding used by style body
- `body` the actual style rules and symbolizers

example:

```json
{
  "type": "vector",
  "features": [],
  "style": {
    "format": "geostyler",
    "body": {
      "name": "My Style",
      "rules": [
        {
          "name": "My Rule",
          "symbolizers": [
            {
              "kind": "Line",
              "color": "#3075e9",
              "opacity": 1,
              "width": 2
            }
          ]
        }
      ]
    }
  }
}
```

The default format used by MapStore is "geostyler" that is an encoding based on the [geostyler-style](https://github.com/geostyler/geostyler-style) specification that could include some variations or limitations related to the map libraries used by MapStore app.
We suggest to refer to following doc for the rule/symbolizer properties available in MapStore.

Ths style `body` is composed by following properties:

- `name` style name
- `rules` list of rule object that describe the style

A `rule` object is composed by following properties:

- `name` rule name that could be used to generate a legend
- `filter` filter expression
- `symbolizers` list of symbolizer object that describe the rule (usually one per rule)

The `filter` expression define with features should be rendered with the symbolizers listed in the rule

example:

```js
// simple comparison condition structure
// [operator, property key, value]
{
  "filter": ["==", "count", 10]
}

// mulitple condition with logical operato
// [logical operator, [condition], [condition]]
{
  "filter": [
    "||",
    [">", "height", 10],
    ["==", "category", "building"]
  ]
}
```

Available logical operators:

| Operator | Description |
| --- | --- |
| `\|\|` | OR operator |
| `&&` | AND operator |

Available comparison operators:

| Operator | Description |
| --- | --- |
| `==` | equal to |
| `*=` | like (for string type) |
| `!=` | is not |
| `<` | less than |
| `<=` | less and equal than |
| `>` | grater than |
| `>=` | grater and equal than |

The `symbolizer` could be of following `kinds`:

- `Mark` symbolizer properties

  | Property | Description | 2D | 3D |
  | --- | --- | --- | --- |
  | `kind` | must be equal to **Mark** | x | x |
  | `color` | fill color of the mark | x | x |
  | `fillOpacity` | fill opacity of the mark | x | x |
  | `strokeColor` | stroke color of the mark | x | x |
  | `strokeOpacity` | stroke opacity of the mark | x | x |
  | `strokeWidth` | stroke width of the mark | x | x |
  | `radius` | radius size in px of the mark | x | x |
  | `wellKnownName` | rendered shape, one of Circle, Square, Triangle, Star, Cross, X, shape://vertline, shape://horline, shape://slash, shape://backslash, shape://dot, shape://plus, shape://times, shape://oarrow or shape://carrow | x | x |
  | `msBringToFront` | this boolean will allow setting the **disableDepthTestDistance** value for the feature. This would |  | x |
  | `msHeightReference` | reference to compute the distance of the point geometry, one of **none**, **ground** or **clamp** |  | x |
  | `msHeight` | height of the point, the original geometry is applied if undefined  |  | x |
  | `msLeaderLineColor` | color of the leading line connecting the point to the terrain  |  | x |
  | `msLeaderLineOpacity` | opacity of the leading line connecting the point to the terrain |  | x |
  | `msLeaderLineWidth` | width of the leading line connecting the point to the terrain |  | x |

- `Icon` symbolizer properties

  | Property | Description | 2D | 3D |
  | --- | --- | --- | --- |
  | `kind` | must be equal to **Icon** | x | x |
  | `image` | url of the image to use as icon | x | x |
  | `size` | size of the icon | x | x |
  | `opacity` | opacity of the icon | x | x |
  | `rotate` | rotation of the icon | x | x |
  | `anchor` | array of values defined in fractions [0 to 1] | x | x |
  | `msBringToFront` | this boolean will allow setting the **disableDepthTestDistance** value for the feature. This would |  | x |
  | `msHeightReference` | reference to compute the distance of the point geometry, one of **none**, **ground** or **clamp** |  | x |
  | `msHeight` | height of the point, the original geometry is applied if undefined  |  | x |
  | `msLeaderLineColor` | color of the leading line connecting the point to the terrain  |  | x |
  | `msLeaderLineOpacity` | opacity of the leading line connecting the point to the terrain |  | x |
  | `msLeaderLineWidth` | width of the leading line connecting the point to the terrain |  | x |

- `Line` symbolizer properties

  | Property | Description | 2D | 3D |
  | --- | --- | --- | --- |
  | `kind` | must be equal to **Line** | x | x |
  | `color` | stroke color of the line | x | x |
  | `opacity` | stroke opacity of the line | x | x |
  | `width` | stroke width of the line | x | x |
  | `dasharray` | array that represent the dashed line intervals | x | x |
  | `msClampToGround` | this boolean will allow setting the **clampToGround** value for the feature. This would only apply on Cesium maps. |  | x |

- `Fill` symbolizer properties

  | Property | Description | 2D | 3D |
  | --- | --- | --- | --- |
  | `kind` | must be equal to **Fill** | x | x |
  | `color` | fill color of the polygon | x | x |
  | `fillOpacity` | fill opacity of the polygon | x | x |
  | `outlineColor` | outline color of the polygon | x | x |
  | `outlineOpacity` | outline opacity of the polygon | x | x |
  | `outlineWidth` | outline width of the polygon | x | x |
  | `msClassificationType` | allow setting **classificationType** value for the feature. This would only apply on polygon graphics in Cesium maps. |  | x |
  | `msClampToGround` | this boolean will allow setting the **clampToGround** value for the feature. This would only apply on Cesium maps. |  | x |

- `Text` symbolizer properties

  | Property | Description | 2D | 3D |
  | --- | --- | --- | --- |
  | `kind` | must be equal to **Text** | x | x |
  | `label` | text to show in the label, the {{propertyKey}} notetion allow to access feature properties (eg. 'feature name is {{name}}') | x | x |
  | `font` | array of font family names | x | x |
  | `size` | font size of the label | x | x |
  | `fontStyle` | font style of the label: normal or italic | x | x |
  | `fontWeight` | font style of the label: normal or bold | x | x |
  | `color` | font color of the label | x | x |
  | `haloColor` | halo color of the label | x | x |
  | `haloWidth` | halo width of the label | x | x |
  | `offset` | array of x and y values offset of the label | x | x |
  | `msBringToFront` | this boolean will allow setting the **disableDepthTestDistance** value for the feature. This would |  | x |
  | `msHeightReference` | reference to compute the distance of the point geometry, one of **none**, **ground** or **clamp** |  | x |
  | `msHeight` | height of the point, the original geometry is applied if undefined  |  | x |
  | `msLeaderLineColor` | color of the leading line connecting the point to the terrain  |  | x |
  | `msLeaderLineOpacity` | opacity of the leading line connecting the point to the terrain |  | x |
  | `msLeaderLineWidth` | width of the leading line connecting the point to the terrain |  | x |

- `Model` symbolizer properties (custom symbolizer to visualize 3D model as point geometries)

  | Property | Description | 2D | 3D |
  | --- | --- | --- | --- |
  | `kind` | must be equal to **Model** |  | x |
  | `model` | url of a 3D .glb file |  | x |
  | `heading` | heading rotation |  | x |
  | `pitch` | pitch rotation |  | x |
  | `roll` | roll rotation |  | x |
  | `scale` | scale factor |  | x |
  | `color` | color mixed with the mesh texture/material |  | x |
  | `opacity` | color opacity |  | x |
  | `msHeightReference` | reference to compute the distance of the point geometry, one of **none**, **ground** or **clamp** |  | x |
  | `msHeight` | height of the point, the original geometry is applied if undefined  |  | x |
  | `msLeaderLineColor` | color of the leading line connecting the point to the terrain  |  | x |
  | `msLeaderLineOpacity` | opacity of the leading line connecting the point to the terrain |  | x |
  | `msLeaderLineWidth` | width of the leading line connecting the point to the terrain |  | x |

#### Legacy Vector Style (deprecated)

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

#### Advanced Vector Styles (deprecated)

To support advanced styles (like multiple rules, symbols, dashed lines, start point, end point) the style can be configured also in a different format, as an array of objects and you can define them feature by feature, adding a "style" property.

!!!warning
    This advanced style functionality has been implemented to support annotations, at the moment this kind of advanced style options is supported **only** as a property of the single feature object, not as global style.

##### SVG Symbol (deprecated)

The following options are available for a SVG symbol.

- `symbolUrl`: a URL (also a data URL is ok) for the symbol to use (SVG format).
    You can anchor the symbol using:
  - `iconAnchor`: array of x,y position of the offset of the symbol from top left corner.
  - `anchorXUnits`, `anchorYUnits` unit of the `iconAnchor` (`fraction` or `pixels`).
  - `size`: the size in pixel of the square that contains the symbol to draw. The size is used to center and to cut the original svg, so it must fit the svg.
- `dashArray`: Array of line, space size, in pixels. ["6","6"] Will draw the border of the symbol dashed. It is applied also to a generic line or polygon geometry.

##### Markers and glyphs (deprecated)

These are the available options for makers. These are specific of annotations for now, so allowed values have to be documented.

- `iconGlyph`: e.g. "shopping-cart"
- `iconShape`: e.g. "circle"
- `iconColor`: e.g. "red"
- `iconAnchor`: [0.5,0.5]

##### Multiple rules and filtering (deprecated)

In order to support start point and end point symbols, you could find in the style these entries:

- `geometry`: "endPoint"|"startPoint", identify how to get the geometry from
- `filtering`: if true, the geometry filter is applied.

#### Example (deprecated)

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

#### Graticule

i.e.

```javascript
{
    "type": "graticule",
    "labels": true,
    "frame": true, // adds a frame to the map, to better highlight labels
    "frameRatio": 0.07, // frame percentage size (7%)
    "style": { // style for the grid lines
        "color": "#000000",
        "weight": 1,
        "lineDash": [0.5, 4],
        "opacity": 0.5
    },
    "frameStyle": { // style for the optional frame
        "color": "#000000",
        "weight": 1,
        "fillColor": "#FFFFFF"
    },
    "labelXStyle": { // style for X coordinates labels
        "color": "#000000",
        "font": "sans-serif",
        "fontWeight": "bold",
        "fontSize": "20",
        "labelOutlineColor": "#FFFFFF",
        "labelOutlineWidth": 2
    },
    "labelYStyle": { // style for Y coordinates labels
        "color": "#000000",
        "font": "sans-serif",
        "fontWeight": "bold",
        "fontSize": "20",
        "labelOutlineColor": "#FFFFFF",
        "labelOutlineWidth": 2,
        "rotation": 90,
        "verticalAlign": "top",
        "textAlign": "center"
    }
}
```

#### 3D tiles

This type of layer shows 3d tiles version 1.0 inside the Cesium viewer. This layer will not be visible inside 2d map viewer types: openlayer or leaflet.
See specification for more info about 3d tiles [here](https://www.ogc.org/standards/3DTiles).

i.e.

```javascript
{
    "type": "3dtiles",
    "url": "http..." // URL of tileset.json file
    "title": "3D tiles layer",
    "visibility": true,
    // optional
    "heightOffset": 0, // height offest applied to the complete tileset
    "style": {
      "format": "3dtiles",
      "body": { // 3d tiles style
        "color": "color('#43a2ca', 1)"
      }
    }
}
```

The style body object for the format 3dtiles accepts rules described in the 3d tiles styling specification version 1.0 available [here](https://github.com/CesiumGS/3d-tiles/tree/1.0/specification/Styling).

#### Terrain

`terrain` layer allows the customization of the elevation profile of the globe mesh in the Cesium 3d viewer. Currently Mapstore supports three different types of [terrain providers](https://cesium.com/learn/cesiumjs/ref-doc/TerrainProvider.html). If no `terrain` layer is defined the default elevation profile for the globe would be the [ellipsoid](https://cesium.com/learn/cesiumjs/ref-doc/EllipsoidTerrainProvider.html) that provides a rather flat profile.

The other two available terrain providers are the `wms` (that supports `DDL/BIL` types of assets) and the `cesium` (that support resources compliant with the Cesium terrain format).

In order to create a `wms` based mesh there are some requirements that need to be fulfilled:

- a GeoServer WMS service with the [DDS/BIL plugin](https://docs.geoserver.org/stable/en/user/community/dds/index.html)
- A WMS layer configured with **BIL 16 bit** output in **big endian mode** and **-9999 nodata value**
  - BILTerrainProvider is used to parse `wms` based mesh. Supports three ways in parsing the metadata of the layer
    1. Layer configuration with **sufficient metadata** of the layer. This prevents a call to `getCapabilities` eventually improving performance of the parsing of the layer.
        Mandatory fields are `url`, `name`, `crs`.

        ```json
        {
          "type": "terrain",
          "provider": "wms",
          "url": "http://hot-sample/geoserver/wms",
          "name": "workspace:layername",
          "littleEndian": false,
          "visibility": true,
          "crs": "CRS:84" // Supports only CRS:84 | EPSG:4326 | EPSG:3857 | OSGEO:41001
        }
        ```

    2. Layer configuration of `geoserver` layer with layer name *prefixed with workspace*, then the `getCapabilities` is requested only for that layer

        ```json
        {
        "type": "terrain",
        "provider": "wms",
        "url": "https://host-sample/geoserver/wms", // 'geoserver' url
        "name": "workspace:layername", // name of the geoserver resource with workspace prefixed
        "littleEndian": false
        }
        ```

    3. Layer configuration of geoserver layer with layer name *not prefixed with workspace* then `getCapabilities` is requested in global scope.

    ```json
    {
      "type": "terrain",
      "provider": "wms",
      "url": "https://host-sample/geoserver/wms",
      "name": "layername",
      "littleEndian": false
    }
    ```

!!! note
    With `wms` as provider, the format option is not needed, as Mapstore supports only `image/bil` format and is used by default

Generic layer configuration of type `terrain` and provide `wms` as follows.
The layer configuration needs to point to the geoserver resource and define the type of layer and the type of provider, here all available properties:

```json
{
  "type": "terrain",
  "provider": "wms",
  "url": "https://host-sample/geoserver/wms",
  "name": "workspace:layername", // name of the geoserver resource
  "littleEndian": false, // defines whether buffer is in little or big endian
  "visibility": true,
  // optional properties
  "crs": "CRS:84", // projection of the layer, support only CRS:84 | EPSG:4326 | EPSG:3857 | OSGEO:41001
  "version": "1.3.0", // version used for the WMS request
  "heightMapWidth": 65, // width  of a tile in pixels, default value 65
  "heightMapHeight": 65, // height of a tile in pixels, default value 65
  "waterMask": false,
  "offset": 0, // offset of the tiles (in meters)
  "highest": 12000, // highest altitude in the tiles (in meters)
  "lowest": -500, // lowest altitude in the tiles
  "sampleTerrainZoomLevel": 18 // zoom level used to perform sampleTerrain and get the height value given a point, used by measure components

}
```

The `terrain` layer of `cesium` type allows using Cesium terrain format compliant services (like Cesium Ion resources or [MapTiler meshes](https://cloud.maptiler.com/tiles/terrain-quantized-mesh-v2/)). The options attributte allows for further customization of the terrain properties (see available options on the Cesium documentation for the [cesium terrain provider](https://cesium.com/learn/cesiumjs/ref-doc/CesiumTerrainProvider.html))

```json
{
  "type": "terrain",
  "provider": "cesium",
  "url": "https://terrain-provider-service-url/?key={apiKey}",
  "visibility": true,
  "options": {
    // requestVertexNormals, requestWatermask, credit...
  }
}
```

In order to use these layers they need to be added to the `additionalLayers` in `localConfig.json`. The globe only accepts one terrain provider so in case of adding more than one the last one will take precedence and be used to create the elevation profile.

```json
{
    "name": "Map",
    "cfg": {
        "additionalLayers": [{
            "type": "terrain",
            "provider": "wms",
            "url": "https://host-sample/geoserver/wms",
            "name": "workspace:layername",  // name of the geoserver resource
            "littleEndian": false,
            "visibility": true,
            "crs": "CRS:84"
        }]
    }
}
```

#### Cloud Optimized GeoTIFF (COG)

i.e.

```javascript
{
    "type": "cog",
    "title": "Title",
    "group": "background",
    "visibility": false,
    "name": "Name",
    "sources": [
        { "url": "https://host-sample/cog1.tif" }, 
        { "url": "https://host-sample/cog2.tif" }
    ]
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
<ms:GroupList xmlns:ms="https://mapstore.geosolutionsgroup.com/mapstore/context">
    <ms:Group xmlns:ms="https://mapstore.geosolutionsgroup.com/mapstore/context" id="Default" title="Default" expanded="true"/>
</ms:GroupList>
```

- `center` defines a center of map view

```xml
<ms:center xmlns:ms="https://mapstore.geosolutionsgroup.com/mapstore/context" x="1.5" y="2.5" crs="EPSG:3857"/>
```

- `zoom` map zoom level

```xml
<ms:zoom xmlns:ms="https://mapstore.geosolutionsgroup.com/mapstore/context">7</ms:zoom>
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

Cesium:

- `tileDiscardPolicy` sets a policy for discarding (missing/broken) tiles ([https://cesium.com/learn/cesiumjs/ref-doc/TileDiscardPolicy.html](https://cesium.com/learn/cesiumjs/ref-doc/TileDiscardPolicy.html)). If it is not specified the NeverTileDiscardPolicy will be used. If "none" is specified, no policy at all will be set.

MapStore specific:

- `group` specifies to which group, among listed in "GroupList" element, the layer belongs to
- `search` JSON describing a filter that is applied to the layer
- `DimensionList` contains `Dimension` elements that describe dimensions that cannot be described using standard "Dimension" tag.
Currently supports dimensions of ***multidim-extension*** type:
- `CatalogServices` contains `Service` elements that describe services available for use in Catalog.

```xml
<ms:DimensionList xmlns:ms="https://mapstore.geosolutionsgroup.com/mapstore/context">
    <ms:Dimension xmlns:ms="https://mapstore.geosolutionsgroup.com/mapstore/context" xmlns:xlink="http://www.w3.org/1999/xlink" name="time" type="multidim-extension" xlink:type="simple" xlink:href="https://cloudsdi.geo-solutions.it/geoserver/gwc/service/wmts"/>
</ms:DimensionList>
<ms:CatalogServices selectedService="gs_stable_csw">
    <ms:Service serviceName="gs_stable_csw">
        <ms:Attribute name="url" type="string">https://gs-stable.geosolutionsgroup.com/geoserver/csw</ms:Attribute>
        <ms:Attribute name="type" type="string">csw</ms:Attribute>
        <ms:Attribute name="title" type="string">GeoSolutions GeoServer CSW</ms:Attribute>
        <ms:Attribute name="autoload" type="boolean">true</ms:Attribute>
    </ms:Service>
    <ms:Service serviceName="gs_stable_wms">
        <ms:Attribute name="url" type="string">https://gs-stable.geosolutionsgroup.com/geoserver/wms</ms:Attribute>
        <ms:Attribute name="type" type="string">wms</ms:Attribute>
        <ms:Attribute name="title" type="string">GeoSolutions GeoServer WMS</ms:Attribute>
        <ms:Attribute name="autoload" type="boolean">false</ms:Attribute>
    </ms:Service>
    <ms:Service serviceName="gs_stable_wmts">
        <ms:Attribute name="url" type="string">https://gs-stable.geosolutionsgroup.com/geoserver/gwc/service/wmts</ms:Attribute>
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
- `https://mapstore.geosolutionsgroup.com/mapstore/context` for mapstore specific extensions

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
- `mapViews` map views options

### mapViews

Example:

```js
{
  "mapViews": {
    "active": true,
    "selectedId": "view.id.01",
    "views": [
      {
        "id": "view.id.01",
        "title": "Title",
        "description": "<p>Description</p>",
        "duration": 10,
        "flyTo": true,
        "center": {
          "longitude": 8.93690091201193,
          "latitude": 44.39522451776296,
          "height": -0.0022900843616703204
        },
        "cameraPosition": {
          "longitude": 8.93925651181738,
          "latitude": 44.38698231953802,
          "height": 655.705914040523
        },
        "zoom": 17.89659156734602,
        "bbox": [
          8.920925393119584,
          44.39084055670365,
          8.948118718933738,
          44.40554444092288
        ],
        "mask": {
          "enabled": true,
          "resourceId": "resource.id.01",
          "inverse": true,
          "offset": 10000
        },
        "terrain": {
          "clippingLayerResourceId": "resource.id.02",
          "clippingPolygonFeatureId": "feature.id.01",
          "clippingPolygonUnion": true
        },
        "globeTranslucency": {
          "enabled": true,
          "fadeByDistance": false,
          "nearDistance": 500,
          "farDistance": 50000,
          "opacity": 0.5
        },
        "layers": [
          {
            "id": "layer.id.01",
            "visibility": true,
            "opacity": 0.5
          },
          {
            "id": "layer.id.04",
            "visibility": true,
            "clippingLayerResourceId": "resource.id.02",
            "clippingPolygonFeatureId": "feature.id.01",
            "clippingPolygonUnion": false
          }
        ]
      }
    ],
    "resources": [
      {
        "id": "resource.id.01",
        "data": {
          "type": "vector",
          "name": "mask",
          "title": "Mask",
          "id": "layer.id.02"
        }
      },
      {
        "id": "resource.id.02",
        "data": {
          "type": "wfs",
          "url": "/service/wfs",
          "name": "clip",
          "title": "Clip",
          "id": "layer.id.03"
        }
      }
    ]
  }
}
```

The mapViews properties

| Name | Type | Description |
| --- | --- | --- |
| active | boolean | if true the map view tool will be active at initialization |
| selectedId | string | id of the selected view |
| views | array | array of views configurations (see below) |
| resources | array | resources configurations (see below) |

View configuration object

| Name | Type | Description |
| --- | --- | --- |
| id | string | identifier of the view |
| title | string | title of the view |
| description | string | an html string to describe the view |
| duration | number | when playing, duration in seconds of the view|
| flyTo | boolean | enable animation transition during navigation |
| center | object | center target position as { latitude (degrees), longitude (degrees), height (meters) } |
| cameraPosition | object | point of view position as { latitude (degrees), longitude (degrees), height (meters) } |
| zoom | number | zoom level |
| bbox | array | bounding box in WGS84 as [minx, miny, maxx, maxy] |
| mask | object | optional configuration for the 3D tiles mask |
| mask.enabled | boolean | if true enables the mask |
| mask.resourceId | string | identifier of a resource configuration in the `resources` array |
| mask.inverse | boolean | if true enables the inverse mask |
| mask.offset | number | offset in meters for the inverse mask |
| terrain | object | optional configurations for terrain clipping |
|terrain.clippingLayerResourceId | string | identifier of a resource configuration in the `resources` array |
| terrain.clippingPolygonFeatureId | string | identifier of a polygonal feature available in the selected layer source to use to apply the clipping |
| terrain.clippingPolygonUnion | boolean | if true it applies inverse clipping |
| globeTranslucency | object | optional configuration for the globe translucency |
| globeTranslucency.enabled | boolean | if true enables translucency |
| globeTranslucency.opacity | number | opacity of the globe translucency, it should be a value between 0 and 1 where 1 is fully opaque  |
| globeTranslucency.fadeByDistance | boolean | if true the translucency is visible only between the `nearDistance` and `farDistance` values |
| globeTranslucency.nearDistance | number | when `fadeByDistance` is true it indicates the minimum distance to apply translucency |
| globeTranslucency.farDistance | number |  when `fadeByDistance` is true it indicates the maximum distance to apply translucency |
| layers | array | array of layer configuration overrides, default properties override `visibility` and `opacity` |

Resource object configuration

| Name | Type | Description |
| --- | --- | --- |
| id | string | identifier for the resource |
| data | object | properties related to the layer used for the resource (wfs or vector type) |
