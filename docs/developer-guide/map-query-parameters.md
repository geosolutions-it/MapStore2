# MapViewer query parameters

In this section we will describe the available MapViewer query parameters that can be used when the map is loaded.

MapStore allows to manipulate the map by passing some parameters. This allows external application to open a customized viewer generating these parameters externally. With this functionality you can modify for instance the initial position of the map, the entire map and even trigger some actions.

## Passing parameters to the map

### Get Request

The parameters can be passed in a query-string-like section, after the `#<path>?` of the request.

Example:

```text
#/viewer/openlayers/new?center=0,0&zoom=5
```

!!! note
    The parameters in the request should be URL encoded. In order to make them more readable, the examples in this page will now apply the URL encoding.

### POST Request

Sometimes the request parameters can be too big to be passed in the URL, for instance when dealing with an entire map, or complex data. To overcome this kind of situations, an adhoc `POST` service available at `<mapstore-base-path>/rest/config/setParams` allows to pass the parameters in the request payload `application/x-www-form-urlencoded`.
The parameters will be then passed to the client (using a temporary `queryParams` variable in `sessionStorage`). Near the parameters, an additional `page` value can be passed together with the params to specify to which url be redirect. If no page attribute is specified by default redirection happens to `#/viewer/openlayers/config`.

Example `application/x-www-form-urlencoded` request payload (URL encoded):

```text
page=..%2F..%2F%23%2Fviewer%2Fopenlayers%2Fnew&featureinfo=&bbox=&center=1%2C1&zoom=4
```

Here a sample page you can create to test the service:

```html
<html><head><meta charset="UTF-8">
    <script>
        const POST_PATH = "rest/config/setParams";
        const queryParameters = {
            "page": '../../#/viewer/openlayers/config',
            "map": {"version":2,"map":{"projection":"EPSG:900913","units":"m","center":{"x":1250000,"y":5370000,"crs":"EPSG:900913"},"zoom":5,"maxExtent":[-20037508.34,-20037508.34,20037508.34,20037508.34],"layers":[{"type":"osm","title":"Open Street Map","name":"mapnik","source":"osm","group":"background","visibility":true}]}},
            "featureinfo": '',
            "bbox": '',
            "center": '',
            "zoom": 4,
            "actions": [],
        };
        window.onload = function(){
            Object.keys(queryParameters).forEach(function (key) {
                const element = document.getElementById(key);
                if (element) element.value = typeof queryParameters[key] === "object" || Array.isArray(queryParameters[key]) ? JSON.stringify(queryParameters[key]) : queryParameters[key];
            });
            document.getElementById("post-form").addEventListener('submit', function() {
                const base_url = document.getElementById('mapstore-base').value.replace(/\/?$/, '/');
                // handle GET URL
                if(document.getElementById("method").value === "GET") {
                    event.preventDefault();
                    const page = document.getElementById("page")?.value;
                    const data = new FormData(event.target);
                    const values = Array.from(data.entries());
                    const queryString = values
                        .filter(([k, v]) => !!v)
                        .reduce((qs = "", [k, v]) => `${qs}&${k}=${encodeURIComponent(v)}`, "");
                    window.open(`${base_url}${page}?${queryString}`, "_blank");
                    return false;
                }
                document.getElementById("post-form").action = base_url + POST_PATH;
                return true;
            })
        }
    </script>
</head><body>
    <fieldset>
        <legend>Options:</legend>
        <label>method:</label><select id="method">
            <option value="POST">POST</option>
            <option value="GET">GET</option>
        </select>
    <br/>
    <label>MapStore Base URL:</label><input type="text" id="mapstore-base" value="http://localhost:8080/mapstore/">
</input><br/>
</fieldset>
<!-- Place the URL of your MapStore in "action" -->
<form id="post-form" action="http://localhost:8080/mapstore/rest/config/setParams" method="POST" target="_blank">
    <fieldset>
        <legend>Params:</legend>
        <label for="map">map:</label><br/><textarea id="map" name="map"></textarea><br/>
        <label for="page">page:</label><br/><input type="text" id="page" name="page" value="../../#/viewer/openlayers/config"></input><br/>
        <label for="featureinfo">featureinfo:</label><br/><textarea id="featureinfo" name="featureinfo"></textarea><br/>
        <label for="bbox">bbox:</label><br/><input type="text" id="bbox" name="bbox"></input><br/>
        <label for="center">center:</label><br/><input type="text" id="center" name="center"></input><br/>
        <label for="zoom">zoom:</label><br/><input type="text" id="zoom" name="zoom"></input><br/>
        <label for="marker">marker:</label><br/><input type="text" id="marker" name="marker"></input><br/>
        <label for="actions">actions:</label><br/><textarea id="actions" name="actions"></textarea><br/>
    </fieldset>
    <br/>
    <input id="submit-form" value="Submit" type="submit"><br/>
</form>
</body></html>
```

## Available Parameters

### Feature Info

Allows to trigger [identify tool](../../user-guide/side-bar/#identify-tool) for the coordinates passed in "lat"/"lng" parameters. 

Optional parameter "filterNameList" allows limiting request to the specific layer names.
It will be effectively used only if it's passed as non-empty array of layer names.
Omitting or passing an empty array will have the same effect.

GET: `#/viewer/openlayers/config?featureinfo={"lat": 43.077, "lng": 12.656, "filterNameList": []}`

GET: `#/viewer/openlayers/config?featureinfo={"lat": 43.077, "lng": 12.656, "filterNameList": ["layerName1", "layerName2"]}`

### Map

Allows to pass the entire map JSON definition (see the map configuration format of MapStore). 

GET:

```text
#/viewer/openlayers/config?map={"version":2,"map":{"projection":"EPSG:900913","units":"m","center":{"x":1250000,"y":5370000,"crs":"EPSG:900913"},"zoom":5,"maxExtent":[-20037508.34,-20037508.34,20037508.34,20037508.34],"layers":[{"type":"osm","title":"Open Street Map","name":"mapnik","source":"osm","group":"background","visibility":true}]}}
```

It also allows partial overriding of existing map configuration by passing only specific properties of the root object and/or the internal "map" object.

Following example will override "catalogServices" and "mapInfoConfiguration":
```text
#/viewer/openlayers/config?map={"mapInfoConfiguration":{"trigger":"click","infoFormat":"text/html"},"catalogServices":{"services": {"wms": {"url": "http://example.com/geoserver/wms","type": "wms","title": "WMS","autoload": true}},"selectedService": "wms"}}
```
### Center / Zoom

GET: `#/viewer/openlayers/config?center=0,0&zoom=5`

### Marker / Zoom

GET: `#/viewer/openlayers/config?marker=0,0&zoom=5`

### Bbox

GET: `#/viewer/openlayers/config?bbox=8,8,53,53`

### Actions

To dispatch additional actions when the map viewer is started, the **actions** query parameter can be used. Only actions from a configured whitelist can be dispatched in this way (see the [configuration section](../configuration-files/) for more details).

```yaml
// list of actions types that are available to be launched dynamically from query param (#3817)
  "initialActionsWhiteList": ["ZOOM_TO_EXTENT", "ADD_LAYER", ...]
```

The value of this parameter is a JSON string containing an array with an object per action. The structure of the object consist of a property type and a bunch of other properties depending on the action.

### Available actions

Only the following actions can be used in the **actions** json string.

#### Zoom to extent

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

GET: `#/viewer/openlayers/config?actions=[{"type": "ZOOM_TO_EXTENT","extent": [1,2,3,4],"crs": "EPSG:4326","maxZoom": 8}]`

For more details check out the [zoomToExtent](https://mapstore.geosolutionsgroup.com/mapstore/docs/#actions.map.zoomToExtent) in the framework documentation.

#### Map info

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

GET: `#/viewer/openlayers/config?actions=[{"type":"SEARCH:SEARCH_WITH_FILTER","cql_filter":"ID=75","layer":"WORKSPACE:LAYER_NAME"}]`

The sample request below illustrates how two actions can be concatenated:

```text
https://dev-mapstore.geosolutionsgroup.com/mapstore/#/viewer/openlayers/4093?actions=[{"type":"SEARCH:SEARCH_WITH_FILTER","cql_filter":"STATE_FIPS=34","layer":"topp:states"},{"type":"ZOOM_TO_EXTENT","extent":[-77.48202256347649,38.74612266051003,-72.20858506347648,40.66664704515103],"crs":"EPSG:4326","maxZoom":8}]
```

The MapStore invocation URL above executes the following operations:

- Execution of a search request filtering by **STATE_FIPS** with value 34 on the **topp:states** layer
- Execution of a map zoom to the provided extent

For more details check out the [searchLayerWithFilter](https://mapstore.geosolutionsgroup.com/mapstore/docs/#actions.search.exports.searchLayerWithFilter) in the framework documentation

#### Add Layers

This action allows to add layers directly to the map by taking them from the catalogs configured, or passed.

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

GET: `#/viewer/openlayers/config?actions=[{"type":"CATALOG:ADD_LAYERS_FROM_CATALOGS","layers":["layer1", "layer2", "workspace:externallayername"],"sources":["catalog1", "catalog2", {"type":"WMS","url":"https://example.com/wms"}]}]`

Data of resulting layer can be additionally filtered by passing "CQL_FILTER" into the options array. Each element of array corresponds to the layer defined in action:

```json
{
    "type": "CATALOG:ADD_LAYERS_FROM_CATALOGS",
    "layers": ["workspace1:layer1", "workspace2:layer2", "workspace:externallayername"],
    "sources": ["catalog1", "catalog2", {"type":"WMS","url":"https://example.com/wms"}],
    "options": [{"params":{"CQL_FILTER":"NAME='value'"}}, {}, {"params":{"CQL_FILTER":"NAME='value2'"}}]
}
```

GET `#/viewer/openlayers/config?actions=[{"type":"CATALOG:ADD_LAYERS_FROM_CATALOGS","layers":["layer1","layer2","workspace:externallayername"],"sources":["catalog1","catalog2",{"type":"WMS","url":"https://example.com/wms"}],"options": [{"params":{"CQL_FILTER":"NAME='value'"}}, {}, {"params":{"CQL_FILTER":"NAME='value2'"}}]}]`

Number of objects passed to the options can be different to the number of layers, in this case options will be applied to the first X layers, where X is the length of options array.
