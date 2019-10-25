# MapViewer query parameters

In this section we will describe the available MapViewer query parameters that can be used when the map is loaded.

## Retro-compatibility
In latest releases the **bbox** query param has been introduced whose value corresponds to the extent in the viewport.

for example:
`?bbox=-177.84667968750014,-1.8234225930143395,-9.096679687500114,61.700290838326204`

For more details on it see [sharing a map](../user-guide/share.md). This **bbox** has been maintained as independent parameter for retro compatibility reasons since the URL query parameters logic is changing.

## Dynamically dispatching initial actions in MapStore

To dispatch additional actions when the map viewer is started, the **actions** query parameter can be used. Only actions from a configured whitelist can be dispatched in this way (see the [configuration section](../configuration-files/) for more details).

```
// list of actions types that are available to be launched dynamically from query param (#3817)
  "initialActionsWhiteList": ["ZOOM_TO_EXTENT", "ADD_LAYER", ...]
```

The value of this parameter is a JSON string containing an array with an object per action. The structure of the object consist of a property type and a bunch of other properties depending on the action.

### Available actions
Only the following actions can be used in the **actions** json string.

#### Zoom to extent
It zooms the map to the defined extent.

Example:
```
{
    "type": "ZOOM_TO_EXTENT",
    "extent": [1,2,3,4],
    "crs": "EPSG:4326",
    "maxZoom": 8
}
```

For more details check out the [zoomToExtent](https://mapstore.geo-solutions.it/mapstore/docs/#actions.map.zoomToExtent) in the framework documentation.

#### Map info
It performs a [GetFeature](https://docs.geoserver.org/stable/en/user/services/wfs/reference.html#getfeature) request on the specified layer and then a [GetFeatureInfo](https://docs.geoserver.org/stable/en/user/services/wms/reference.html#getfeatureinfo) by taking a point from the retrieved features's geometry. This action can be used only for existing maps (map previously created).

With the GetFeature request it takes the first coordinate of the geometry of the first retrieved feature; that coordinates are then used for an usual GFI (WMS GetFeatureInfo) request by limiting it to the specified layer.

A **cql_filter** is also **mandatory** for that action to properly filter required data: that filter will be used in both request (GetFeature and GFI). If you don't need to apply a filter, you can use the standard INCLUDE clause (cql_filter=INCLUDE) so the whole dataset will be queried.

Requirements:
- The layer specified must be visible in the map
- There must be a geometry that can be retrieved from the GetFeature request

Example:

```
{
    "type": "SEARCH:SEARCH_WITH_FILTER",
    "cql_filter": "ID=75",
    "layer": "WORKSPACE:LAYER_NAME"
}

?actions=[{"type":"SEARCH:SEARCH_WITH_FILTER","cql_filter":"ID=75","layer":"WORKSPACE:LAYER_NAME"}]
```

The sample request below illustrates how two actions can be concatenated:

```
https://dev.mapstore.geo-solutions.it/mapstore/#/viewer/openlayers/4093?actions=[{"type":"SEARCH:SEARCH_WITH_FILTER","cql_filter":"STATE_FIPS=34","layer":"topp:states"},{"type":"ZOOM_TO_EXTENT","extent":[-77.48202256347649,38.74612266051003,-72.20858506347648,40.66664704515103],"crs":"EPSG:4326","maxZoom":8}]
```

The MapStore invocation URL above executes the following operations:

- Execution of a search request filtering by **STATE_FIPS** with value 34 on the **topp:states** layer
- Execution of a map zoom to the provided extent

For more details check out the [searchLayerWithFilter](https://mapstore.geo-solutions.it/mapstore/docs/#actions.search.exports.searchLayerWithFilter) in the framework documentation


#### Add Layers

This action allows to add layers directly to the map by taking them from the Catalogs

Requirements:

- The number of layers should match the number of sources
- The source name must match a catalog service name present in the map

Example:
```
{
    "type": "CATALOG:ADD_LAYERS_FROM_CATALOGS",
    "layers": ["workspace1:layer1", "workspace2:layer2"],
    "sources": ["catalog1", "catalog2"]
}
?actions=[{"type":"CATALOG:ADD_LAYERS_FROM_CATALOGS","layers":["layer1", "layer2"],"sources":["catalog1", "catalog2"]}]
```
