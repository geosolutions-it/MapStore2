# MapViewer query parameters

In this section we will describe the available MapViewer query parameters
that can be used when the map is loaded.

## Retro-compatibility
In the past a **bbox** query param has been introduced whose value corresponds to extent in the viewport.

for example:
`?bbox=-177.84667968750014,-1.8234225930143395,-9.096679687500114,61.700290838326204`

For more details on it see [sharing a map](../user-guide/share).

## Dynamically dispatching initial actions in MapStore

To dispatch additional actions when the map viewer is started, the **actions** query param can be used.
Only actions from a configured whitelist can be dispatched in this way.

The value of this paramater is a JSON string containing an array with an object per action.

The structure of the object consist of a property type and a bunch of other properties depending on the action.

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
For more details check out the [zoomToExtent](https://mapstore2.geo-solutions.it/mapstore/docs/#actions.map.zoomToExtent) in the framework documentation.

#### Map info
It performs a [GetFeature](https://docs.geoserver.org/stable/en/user/services/wfs/reference.html#getfeature) request and then a [GetFeatureInfo](https://docs.geoserver.org/stable/en/user/services/wms/reference.html#getfeatureinfo) by taking a geometry from a feature retrieved. This action can be used can be used only for existing maps.

With the GetFeature request it takes the first coordinate of the geometry of the first feature.
Then it uses it for the GFI request by creating an area of 101x101 px and by limiting it to the specified layer.

You can add to the action a cql_filter that will be used in both request.

Requirements:
- the layer specified must be visible in the map
- there must be a geometry that can be retrieved from the GetFeature request

Example:
```
{
    "type": "SEARCH:SEARCH_WITH_FILTER",
    "cql_filter": "ID=75",
    "layer": "WORKSPACE:LAYER_NAME"
}
?actions=[{"type":"SEARCH:SEARCH_WITH_FILTER","cql_filter":"ID=75","layer":"WORKSPACE:LAYER_NAME"}]
```
For more details check out the [searchLayerWithFilter](https://mapstore2.geo-solutions.it/mapstore/docs/#actions.search.exports.searchLayerWithFilter) in the framework documentation


#### Add Layers

This action allows to add layers from catalog present in the map

Requirements:
- the number of values must be even
- catalog name must be present in the map


Example:
```
{
    "type": "CATALOG:ADD_LAYERS_FROM_CATALOGS",
    "layers": ["layer1", "layer2"],
    "sources": ["catalog1", "catalog2"]
}
?actions=[{"type":"CATALOG:ADD_LAYERS_FROM_CATALOGS","layers":["layer1", "layer2"],"sources":["catalog1", "catalog2"]}]
```
