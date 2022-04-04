# MapViewer query parameters

In this section we will describe the available MapViewer query parameters that can be used when the map is loaded.

MapStore allows to manipulate the map calling it with some parameters. This allows external application to open a customized viewer generating these parameters externally. With this functionality you can modifiy for instance the initial position of the map, modify the entire map and even trigger some actions.


## Passing parameters to the map

### Get Request

The parameters can be passed in a query-string-like section, after the `#<path>?` of the request. Example:

```qu
#/viewer/openlayers/new?map={"version":2,"map":{"center":{"x":16.68355617835898,"y":41.85986306892922,"crs":"EPSG:4326"},"maxExtent":[-20037508.34,-20037508.34,20037508.34,20037508.34],"projection":"EPSG:900913","units":"m","zoom":6,"mapOptions":{},"layers":[{"id":"mapnik__0","group":"background","source":"osm","name":"mapnik","title":"Open Street Map","type":"osm","visibility":true,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"Night2012__1","group":"background","source":"nasagibs","name":"Night2012","provider":"NASAGIBS.ViirsEarthAtNight2012","title":"NASAGIBS Night 2012","type":"tileprovider","visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"OpenTopoMap__2","group":"background","source":"OpenTopoMap","name":"OpenTopoMap","provider":"OpenTopoMap","title":"OpenTopoMap","type":"tileprovider","visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"s2cloudless:s2cloudless__3","format":"image/jpeg","group":"background","source":"s2cloudless","name":"s2cloudless:s2cloudless","opacity":1,"title":"Sentinel 2 Cloudless","type":"wms","url":["https://1maps.geo-solutions.it/geoserver/wms","https://2maps.geo-solutions.it/geoserver/wms","https://3maps.geo-solutions.it/geoserver/wms","https://4maps.geo-solutions.it/geoserver/wms","https://5maps.geo-solutions.it/geoserver/wms","https://6maps.geo-solutions.it/geoserver/wms"],"visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"undefined__4","group":"background","source":"ol","title":"Empty Background","type":"empty","visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"unesco:Unesco_point__031a2440-b3ff-11ec-b3fb-f9b438120ed2","format":"image/png","group":"Default","search":{"url":"https://gs-stable.geo-solutions.it/geoserver/wfs","type":"wfs"},"name":"unesco:Unesco_point","description":"Unesco Items","title":"Unesco Items","type":"wms","url":"https://gs-stable.geo-solutions.it/geoserver/wms","bbox":{"crs":"EPSG:4326","bounds":{"minx":"7.466999156080053","miny":"36.67491984727179","maxx":"18.033902263137904","maxy":"46.656160442453356"}},"visibility":true,"singleTile":false,"allowedSRS":{"EPSG:3857":true,"EPSG:900913":true,"EPSG:4326":true},"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"catalogURL":null,"useForElevation":false,"hidden":false,"version":"1.3.0","params":{}}],"groups":[{"id":"Default","title":"Default","expanded":true}],"backgrounds":[],"bookmark_search_config":{}},"catalogServices":{"services":{"gs_stable_csw":{"url":"https://gs-stable.geo-solutions.it/geoserver/csw","type":"csw","title":"GeoSolutions GeoServer CSW","autoload":true},"gs_stable_wms":{"url":"https://gs-stable.geo-solutions.it/geoserver/wms","type":"wms","title":"GeoSolutions GeoServer WMS","autoload":false},"gs_stable_wmts":{"url":"https://gs-stable.geo-solutions.it/geoserver/gwc/service/wmts","type":"wmts","title":"GeoSolutions GeoServer WMTS","autoload":false}},"selectedService":"gs_stable_wms"},"widgetsConfig":{"layouts":{"xxs":[],"md":[]}},"mapInfoConfiguration":{"trigger":"click"},"dimensionData":{},"timelineData":{}}&featureinfo={"lat": 43.077, "lng": 12.656, "filterNameList": []}
```

### POST Request

Sometimes the request parameters can be too big to be passed in the URL, for instance when dealing with an entire map, or complex data. To overcome this kind of situations, an adhoc `POST` service available at `mapstore/rest/config/setParams` allows to pass the parameters in the request payload as either `application/json` or `application/x-www-form-urlencoded`.
The parameters will be then made available in the `sessionStorage` with key `queryParams`. Optionally a `page` value can be passed together with the params to specify to which url be redirect. If no page attribute is specified by default redirection happens to `mapstore/#viewer/openlayers/config`.

Example `application/json` request payload:
```json
{
 "map": {"version":2,"map":{"center":{"x":16.68355617835898,"y":41.85986306892922,"crs":"EPSG:4326"},"maxExtent":[-20037508.34,-20037508.34,20037508.34,20037508.34],"projection":"EPSG:900913","units":"m","zoom":6,"mapOptions":{},"layers":[{"id":"mapnik__0","group":"background","source":"osm","name":"mapnik","title":"Open Street Map","type":"osm","visibility":true,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"Night2012__1","group":"background","source":"nasagibs","name":"Night2012","provider":"NASAGIBS.ViirsEarthAtNight2012","title":"NASAGIBS Night 2012","type":"tileprovider","visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"OpenTopoMap__2","group":"background","source":"OpenTopoMap","name":"OpenTopoMap","provider":"OpenTopoMap","title":"OpenTopoMap","type":"tileprovider","visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"s2cloudless:s2cloudless__3","format":"image/jpeg","group":"background","source":"s2cloudless","name":"s2cloudless:s2cloudless","opacity":1,"title":"Sentinel 2 Cloudless","type":"wms","url":["https://1maps.geo-solutions.it/geoserver/wms","https://2maps.geo-solutions.it/geoserver/wms","https://3maps.geo-solutions.it/geoserver/wms","https://4maps.geo-solutions.it/geoserver/wms","https://5maps.geo-solutions.it/geoserver/wms","https://6maps.geo-solutions.it/geoserver/wms"],"visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"undefined__4","group":"background","source":"ol","title":"Empty Background","type":"empty","visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"unesco:Unesco_point__031a2440-b3ff-11ec-b3fb-f9b438120ed2","format":"image/png","group":"Default","search":{"url":"https://gs-stable.geo-solutions.it/geoserver/wfs","type":"wfs"},"name":"unesco:Unesco_point","description":"Unesco Items","title":"Unesco Items","type":"wms","url":"https://gs-stable.geo-solutions.it/geoserver/wms","bbox":{"crs":"EPSG:4326","bounds":{"minx":"7.466999156080053","miny":"36.67491984727179","maxx":"18.033902263137904","maxy":"46.656160442453356"}},"visibility":true,"singleTile":false,"allowedSRS":{"EPSG:3857":true,"EPSG:900913":true,"EPSG:4326":true},"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"catalogURL":null,"useForElevation":false,"hidden":false,"version":"1.3.0","params":{}}],"groups":[{"id":"Default","title":"Default","expanded":true}],"backgrounds":[],"bookmark_search_config":{}},"catalogServices":{"services":{"gs_stable_csw":{"url":"https://gs-stable.geo-solutions.it/geoserver/csw","type":"csw","title":"GeoSolutions GeoServer CSW","autoload":true},"gs_stable_wms":{"url":"https://gs-stable.geo-solutions.it/geoserver/wms","type":"wms","title":"GeoSolutions GeoServer WMS","autoload":false},"gs_stable_wmts":{"url":"https://gs-stable.geo-solutions.it/geoserver/gwc/service/wmts","type":"wmts","title":"GeoSolutions GeoServer WMTS","autoload":false}},"selectedService":"gs_stable_wms"},"widgetsConfig":{"layouts":{"xxs":[],"md":[]}},"mapInfoConfiguration":{"trigger":"click"},"dimensionData":{},"timelineData":{}},
 "featureinfo": {"lat": 43.077, "lng": 12.656, "filterNameList": []},
 "page":"#/viewer/openlayers/config"
}
```

Example `application/x-www-form-urlencoded` request payload:
```
"map"={"version":2,"map":{"center":{"x":16.68355617835898,"y":41.85986306892922,"crs":"EPSG:4326"},"maxExtent":[-20037508.34,-20037508.34,20037508.34,20037508.34],"projection":"EPSG:900913","units":"m","zoom":6,"mapOptions":{},"layers":[{"id":"mapnik__0","group":"background","source":"osm","name":"mapnik","title":"Open Street Map","type":"osm","visibility":true,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"Night2012__1","group":"background","source":"nasagibs","name":"Night2012","provider":"NASAGIBS.ViirsEarthAtNight2012","title":"NASAGIBS Night 2012","type":"tileprovider","visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"OpenTopoMap__2","group":"background","source":"OpenTopoMap","name":"OpenTopoMap","provider":"OpenTopoMap","title":"OpenTopoMap","type":"tileprovider","visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"s2cloudless:s2cloudless__3","format":"image/jpeg","group":"background","source":"s2cloudless","name":"s2cloudless:s2cloudless","opacity":1,"title":"Sentinel 2 Cloudless","type":"wms","url":["https://1maps.geo-solutions.it/geoserver/wms","https://2maps.geo-solutions.it/geoserver/wms","https://3maps.geo-solutions.it/geoserver/wms","https://4maps.geo-solutions.it/geoserver/wms","https://5maps.geo-solutions.it/geoserver/wms","https://6maps.geo-solutions.it/geoserver/wms"],"visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"undefined__4","group":"background","source":"ol","title":"Empty Background","type":"empty","visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"unesco:Unesco_point__031a2440-b3ff-11ec-b3fb-f9b438120ed2","format":"image/png","group":"Default","search":{"url":"https://gs-stable.geo-solutions.it/geoserver/wfs","type":"wfs"},"name":"unesco:Unesco_point","description":"Unesco Items","title":"Unesco Items","type":"wms","url":"https://gs-stable.geo-solutions.it/geoserver/wms","bbox":{"crs":"EPSG:4326","bounds":{"minx":"7.466999156080053","miny":"36.67491984727179","maxx":"18.033902263137904","maxy":"46.656160442453356"}},"visibility":true,"singleTile":false,"allowedSRS":{"EPSG:3857":true,"EPSG:900913":true,"EPSG:4326":true},"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"catalogURL":null,"useForElevation":false,"hidden":false,"version":"1.3.0","params":{}}],"groups":[{"id":"Default","title":"Default","expanded":true}],"backgrounds":[],"bookmark_search_config":{}},"catalogServices":{"services":{"gs_stable_csw":{"url":"https://gs-stable.geo-solutions.it/geoserver/csw","type":"csw","title":"GeoSolutions GeoServer CSW","autoload":true},"gs_stable_wms":{"url":"https://gs-stable.geo-solutions.it/geoserver/wms","type":"wms","title":"GeoSolutions GeoServer WMS","autoload":false},"gs_stable_wmts":{"url":"https://gs-stable.geo-solutions.it/geoserver/gwc/service/wmts","type":"wmts","title":"GeoSolutions GeoServer WMTS","autoload":false}},"selectedService":"gs_stable_wms"},"widgetsConfig":{"layouts":{"xxs":[],"md":[]}},"mapInfoConfiguration":{"trigger":"click"},"dimensionData":{},"timelineData":{}}&"featureinfo"={"lat": 43.077, "lng": 12.656, "filterNameList": []}&"page"="#/viewer/openlayers/config"
```

## Available Parameters

### Feature Info

GET: `?featureinfo={"lat": 43.077, "lng": 12.656, "filterNameList": []}`

POST: ` {"featureinfo: {"lat": 43.077, "lng": 12.656, "filterNameList": []}}`

### Map

GET: 
```
?map={"version":2,"map":{"center":{"x":16.68355617835898,"y":41.85986306892922,"crs":"EPSG:4326"},"maxExtent":[-20037508.34,-20037508.34,20037508.34,20037508.34],"projection":"EPSG:900913","units":"m","zoom":6,"mapOptions":{},"layers":[{"id":"mapnik__0","group":"background","source":"osm","name":"mapnik","title":"Open Street Map","type":"osm","visibility":true,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"Night2012__1","group":"background","source":"nasagibs","name":"Night2012","provider":"NASAGIBS.ViirsEarthAtNight2012","title":"NASAGIBS Night 2012","type":"tileprovider","visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"OpenTopoMap__2","group":"background","source":"OpenTopoMap","name":"OpenTopoMap","provider":"OpenTopoMap","title":"OpenTopoMap","type":"tileprovider","visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"s2cloudless:s2cloudless__3","format":"image/jpeg","group":"background","source":"s2cloudless","name":"s2cloudless:s2cloudless","opacity":1,"title":"Sentinel 2 Cloudless","type":"wms","url":["https://1maps.geo-solutions.it/geoserver/wms","https://2maps.geo-solutions.it/geoserver/wms","https://3maps.geo-solutions.it/geoserver/wms","https://4maps.geo-solutions.it/geoserver/wms","https://5maps.geo-solutions.it/geoserver/wms","https://6maps.geo-solutions.it/geoserver/wms"],"visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"undefined__4","group":"background","source":"ol","title":"Empty Background","type":"empty","visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"unesco:Unesco_point__031a2440-b3ff-11ec-b3fb-f9b438120ed2","format":"image/png","group":"Default","search":{"url":"https://gs-stable.geo-solutions.it/geoserver/wfs","type":"wfs"},"name":"unesco:Unesco_point","description":"Unesco Items","title":"Unesco Items","type":"wms","url":"https://gs-stable.geo-solutions.it/geoserver/wms","bbox":{"crs":"EPSG:4326","bounds":{"minx":"7.466999156080053","miny":"36.67491984727179","maxx":"18.033902263137904","maxy":"46.656160442453356"}},"visibility":true,"singleTile":false,"allowedSRS":{"EPSG:3857":true,"EPSG:900913":true,"EPSG:4326":true},"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"catalogURL":null,"useForElevation":false,"hidden":false,"version":"1.3.0","params":{}}],"groups":[{"id":"Default","title":"Default","expanded":true}],"backgrounds":[],"bookmark_search_config":{}},"catalogServices":{"services":{"gs_stable_csw":{"url":"https://gs-stable.geo-solutions.it/geoserver/csw","type":"csw","title":"GeoSolutions GeoServer CSW","autoload":true},"gs_stable_wms":{"url":"https://gs-stable.geo-solutions.it/geoserver/wms","type":"wms","title":"GeoSolutions GeoServer WMS","autoload":false},"gs_stable_wmts":{"url":"https://gs-stable.geo-solutions.it/geoserver/gwc/service/wmts","type":"wmts","title":"GeoSolutions GeoServer WMTS","autoload":false}},"selectedService":"gs_stable_wms"},"widgetsConfig":{"layouts":{"xxs":[],"md":[]}},"mapInfoConfiguration":{"trigger":"click"},"dimensionData":{},"timelineData":{}}
```

POST: 
```json
{
    "map": {"version":2,"map":{"center":{"x":16.68355617835898,"y":41.85986306892922,"crs":"EPSG:4326"},"maxExtent":[-20037508.34,-20037508.34,20037508.34,20037508.34],"projection":"EPSG:900913","units":"m","zoom":6,"mapOptions":{},"layers":[{"id":"mapnik__0","group":"background","source":"osm","name":"mapnik","title":"Open Street Map","type":"osm","visibility":true,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"Night2012__1","group":"background","source":"nasagibs","name":"Night2012","provider":"NASAGIBS.ViirsEarthAtNight2012","title":"NASAGIBS Night 2012","type":"tileprovider","visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"OpenTopoMap__2","group":"background","source":"OpenTopoMap","name":"OpenTopoMap","provider":"OpenTopoMap","title":"OpenTopoMap","type":"tileprovider","visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"s2cloudless:s2cloudless__3","format":"image/jpeg","group":"background","source":"s2cloudless","name":"s2cloudless:s2cloudless","opacity":1,"title":"Sentinel 2 Cloudless","type":"wms","url":["https://1maps.geo-solutions.it/geoserver/wms","https://2maps.geo-solutions.it/geoserver/wms","https://3maps.geo-solutions.it/geoserver/wms","https://4maps.geo-solutions.it/geoserver/wms","https://5maps.geo-solutions.it/geoserver/wms","https://6maps.geo-solutions.it/geoserver/wms"],"visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"undefined__4","group":"background","source":"ol","title":"Empty Background","type":"empty","visibility":false,"singleTile":false,"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"useForElevation":false,"hidden":false},{"id":"unesco:Unesco_point__031a2440-b3ff-11ec-b3fb-f9b438120ed2","format":"image/png","group":"Default","search":{"url":"https://gs-stable.geo-solutions.it/geoserver/wfs","type":"wfs"},"name":"unesco:Unesco_point","description":"Unesco Items","title":"Unesco Items","type":"wms","url":"https://gs-stable.geo-solutions.it/geoserver/wms","bbox":{"crs":"EPSG:4326","bounds":{"minx":"7.466999156080053","miny":"36.67491984727179","maxx":"18.033902263137904","maxy":"46.656160442453356"}},"visibility":true,"singleTile":false,"allowedSRS":{"EPSG:3857":true,"EPSG:900913":true,"EPSG:4326":true},"dimensions":[],"hideLoading":false,"handleClickOnLayer":false,"catalogURL":null,"useForElevation":false,"hidden":false,"version":"1.3.0","params":{}}],"groups":[{"id":"Default","title":"Default","expanded":true}],"backgrounds":[],"bookmark_search_config":{}},"catalogServices":{"services":{"gs_stable_csw":{"url":"https://gs-stable.geo-solutions.it/geoserver/csw","type":"csw","title":"GeoSolutions GeoServer CSW","autoload":true},"gs_stable_wms":{"url":"https://gs-stable.geo-solutions.it/geoserver/wms","type":"wms","title":"GeoSolutions GeoServer WMS","autoload":false},"gs_stable_wmts":{"url":"https://gs-stable.geo-solutions.it/geoserver/gwc/service/wmts","type":"wmts","title":"GeoSolutions GeoServer WMTS","autoload":false}},"selectedService":"gs_stable_wms"},"widgetsConfig":{"layouts":{"xxs":[],"md":[]}},"mapInfoConfiguration":{"trigger":"click"},"dimensionData":{},"timelineData":{}}
}
```

### Center / Zoom
GET: `?center=0,0&zoom=5`

POST: `{"center: "0,0", "zoom": 5}`

### Marker / Zoom
GET: `?marker=0,0&zoom=5`

POST: `{"marker: "0,0", "zoom": 5}`

### Bbox

GET: `?bbox=8,8,53,53`

POST: ` {"bbox: "8,8,53,53"}`

### Actions

To dispatch additional actions when the map viewer is started, the **actions** query parameter can be used. Only actions from a configured whitelist can be dispatched in this way (see the [configuration section](../configuration-files/) for more details).

```yaml
// list of actions types that are available to be launched dynamically from query param (#3817)
  "initialActionsWhiteList": ["ZOOM_TO_EXTENT", "ADD_LAYER", ...]
```

The value of this parameter is a JSON string containing an array with an object per action. The structure of the object consist of a property type and a bunch of other properties depending on the action.

### Available actions
Only the following actions can be used in the **actions** json string.

### - Zoom to extent
It zooms the map to the defined extent.

Example:
```json
{
    "type": "ZOOM_TO_EXTENT",
    "extent": [1,2,3,4],
    "crs": "EPSG:4326",
    "maxZoom": 8
}
```

GET: `?actions=[{"type": "ZOOM_TO_EXTENT","extent": [1,2,3,4],"crs": "EPSG:4326","maxZoom": 8}]`

POST: `{actions: [{"type": "ZOOM_TO_EXTENT","extent": [1,2,3,4],"crs": "EPSG:4326","maxZoom": 8}]}`

For more details check out the [zoomToExtent](https://mapstore.geosolutionsgroup.com/mapstore/docs/#actions.map.zoomToExtent) in the framework documentation.

### - Map info
It performs a [GetFeature](https://docs.geoserver.org/stable/en/user/services/wfs/reference.html#getfeature) request on the specified layer and then a [GetFeatureInfo](https://docs.geoserver.org/stable/en/user/services/wms/reference.html#getfeatureinfo) by taking a point from the retrieved features's geometry. This action can be used only for existing maps (map previously created).

With the GetFeature request it takes the first coordinate of the geometry of the first retrieved feature; that coordinates are then used for an usual GFI (WMS GetFeatureInfo) request by limiting it to the specified layer.

A **cql_filter** is also **mandatory** for that action to properly filter required data: that filter will be used in both request (GetFeature and GFI). If you don't need to apply a filter, you can use the standard INCLUDE clause (cql_filter=INCLUDE) so the whole dataset will be queried.

Requirements:
- The layer specified must be visible in the map
- There must be a geometry that can be retrieved from the GetFeature request

Example:

```json
{
    "type": "SEARCH:SEARCH_WITH_FILTER",
    "cql_filter": "ID=75",
    "layer": "WORKSPACE:LAYER_NAME"
}
```
GET: `?actions=[{"type":"SEARCH:SEARCH_WITH_FILTER","cql_filter":"ID=75","layer":"WORKSPACE:LAYER_NAME"}]`

POST: `{actions: [{"type":"SEARCH:SEARCH_WITH_FILTER","cql_filter":"ID=75","layer":"WORKSPACE:LAYER_NAME"}]}`

The sample request below illustrates how two actions can be concatenated:

```
https://dev-mapstore.geosolutionsgroup.com/mapstore/#/viewer/openlayers/4093?actions=[{"type":"SEARCH:SEARCH_WITH_FILTER","cql_filter":"STATE_FIPS=34","layer":"topp:states"},{"type":"ZOOM_TO_EXTENT","extent":[-77.48202256347649,38.74612266051003,-72.20858506347648,40.66664704515103],"crs":"EPSG:4326","maxZoom":8}]
```

The MapStore invocation URL above executes the following operations:

- Execution of a search request filtering by **STATE_FIPS** with value 34 on the **topp:states** layer
- Execution of a map zoom to the provided extent

For more details check out the [searchLayerWithFilter](https://mapstore.geosolutionsgroup.com/mapstore/docs/#actions.search.exports.searchLayerWithFilter) in the framework documentation


### - Add Layers

This action allows to add layers directly to the map by taking them from the Catalogs

Requirements:

- The number of layers should match the number of sources
- The source name can be a string that must match a catalog service name present in the map or an object that defines an external catalog (see example)

Supported layer types are WMS, WMTS and WFS.

Example:
```json
{
    "type": "CATALOG:ADD_LAYERS_FROM_CATALOGS",
    "layers": ["workspace1:layer1", "workspace2:layer2", "workspace:externallayername"],
    "sources": ["catalog1", "catalog2", {"type":"WMS","url":"https://example.com/wms"}]
}
```
GET: `?actions=[{"type":"CATALOG:ADD_LAYERS_FROM_CATALOGS","layers":["layer1", "layer2", "workspace:externallayername"],"sources":["catalog1", "catalog2", {"type":"WMS","url":"https://example.com/wms"}]}]`

POST: `{actions: [{"type":"CATALOG:ADD_LAYERS_FROM_CATALOGS","layers":["layer1", "layer2", "workspace:externallayername"],"sources":["catalog1", "catalog2", {"type":"WMS","url":"https://example.com/wms"}]}]}`

Data of resulting layer can be additionally filtered by passing "CQL_FILTER" into the options array. Each element of array corresponds to the layer defined in action:
```json
{
    "type": "CATALOG:ADD_LAYERS_FROM_CATALOGS",
    "layers": ["workspace1:layer1", "workspace2:layer2", "workspace:externallayername"],
    "sources": ["catalog1", "catalog2", {"type":"WMS","url":"https://example.com/wms"}],
    "options": [{"params":{"CQL_FILTER":"NAME='value'"}}, {}, {"params":{"CQL_FILTER":"NAME='value2'"}}]
}
```

GET `?actions=[{"type":"CATALOG:ADD_LAYERS_FROM_CATALOGS","layers":["layer1","layer2","workspace:externallayername"],"sources":["catalog1","catalog2",{"type":"WMS","url":"https://example.com/wms"}],"options": [{"params":{"CQL_FILTER":"NAME='value'"}}, {}, {"params":{"CQL_FILTER":"NAME='value2'"}}]}]`

POST: `{"actions": [{"type":"CATALOG:ADD_LAYERS_FROM_CATALOGS","layers":["layer1","layer2","workspace:externallayername"],"sources":["catalog1","catalog2",{"type":"WMS","url":"https://example.com/wms"}],"options": [{"params":{"CQL_FILTER":"NAME='value'"}}, {}, {"params":{"CQL_FILTER":"NAME='value2'"}}]}]}`

Number of objects passed to the options can be different to the number of layers, in this case options will be applied to the first X layers, where X is the length of options array.

