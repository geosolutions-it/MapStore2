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
    "maxExtent": [
        -20037508.34, -20037508.34,
        20037508.34, 20037508.34
    ],
    "layers": [{...},{...}]
}
```

## Layers options

Every layer has it's own properties. Anyway there are some options valid for every layer:

- `title`: `{object|string}` the title of the layer, can be an object to support i18n.
- `type`: `{string}` the type of the layer. Can be `wms`, `wmts`, `osm`...
- `name`: `{string}` the name is used as general reference to the layer, or as title, if the title is not specified. Anyway, it's usage depends on the specific layer type.
- `group`: `{string}`: the group of the layer (in the TOC). Nested groups can be indicated using `/`. i.e. `Group/SubGroup`. A special group, `background`, is used to identify background layers. These layers will not be available in the TOC, but only in the background switcher, and only one layer of this group can be visible.
- `thumbURL`: `{string}`: the URL of the thumbnail for the layer, used in the background switcher ( if the layer is a background layer )
- `visibility`: `{boolean}`: indicates if the layer is visible or not

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
    "visibility": false
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

*special case* - *Elevation layer*

WMS layers can be configured to be used as a source for elevation related functions.

This requires:

- a GeoServer WMS service with the DDS/BIL plugin
- A WMS layer configured with BIL 16 bit output in big endian mode and -9999 nodata value
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
```
