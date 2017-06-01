# Map options

projection: {string} expressed in EPSG values
units: {string} uom of the coordinates
center: [object] center of the map with starting point in the bottom-left corner
zoom: {number} level of zoom
maxExtent: {number[]} max bbox of the map expressed [minx, miny, maxx, maxy]
layers: {object[]} list of layers to be loaded on the map

i.e.
> ``{ "projection": "EPSG:900913",
    "units": "m",
    "center": {"x": 1000000.000000, "y": 5528000.000000, "crs": "EPSG:900913"},
    "zoom": 15,
    "maxExtent": [
        -20037508.34, -20037508.34,
        20037508.34, 20037508.34
    ],
    "layers": [{...},{...}]
}``
# Layers option

i.e.
> ``{
    "url": "http..."
    "format": "image/png8"
    "title": "Open Street Map",
    "name": "mapnik",
    "group": "background",
    "visibility": false
}``

## Layer types

 * WMS
 * Bing
 * Google
 * MapQuest
 * OSM
 * TileProvider

### WMS

### Bing

### Google

### MapQuest

### TileProvider
TileProvider is a shortcut to easily configure many different layer sources.
It's enough to add provider property and 'tileprovider' as type property to the layer configuration object. Property value should be in the form of ProviderName.VariantName.

List of available layer [here](https://github.com/geosolutions-it/MapStore2/blob/master/web/client/utils/ConfigProvider.js)

i.e.
> ``{
"type": "tileprovider",
"title": "Title",
"provider": "Stamen.Toner",
"name": "Name",
"group": "GroupName",
"visibility": false
}``

Options passed in configuration object, if already configured by TileProvider,  will be overridden.

Openlayer's TileProvider at the moment doesn't support minZoom configuration property and hi resolution map
