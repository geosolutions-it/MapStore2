# MapViewer query parameters

In this section we will describe the available MapViewer query parameters that can be used when the map is loaded.

MapStore allows to manipulate the map by passing some parameters. This allows external application to open a customized viewer generating these parameters externally. With this functionality you can modify for instance the initial position of the map, the entire map and even trigger some actions.

## Passing parameters to the map

### Get Request

The parameters can be passed in a query-string-like section, after the `#<path>?` of the request.

Example:

```text
#/viewer/new?center=0,0&zoom=5
```

!!! note
    The parameters in the request should be URL encoded. In order to make them more readable, the examples in this page will now apply the URL encoding.

### POST Request

Sometimes the request parameters can be too big to be passed in the URL, for instance when dealing with an entire map, or complex data. To overcome this kind of situations, an adhoc `POST` service available at `<mapstore-base-path>/rest/config/setParams` allows to pass the parameters in the request payload `application/x-www-form-urlencoded`.
The parameters will be then passed to the client (using a temporary `queryParams-{random-UUID}` variable in `sessionStorage`).
Near the parameters, an additional `page` value can be passed together with the params to specify to which url be redirect. If no page attribute is specified by default redirection happens to `#/viewer/config`.
The UUID used in the `queryParams-{random-UUID}` variable name is being added to the redirect URL in a query parameter named `queryParamsID=`. Assuming to use the default redirect value, the url will then look like the following: `#/viewer/config?queryParamsID={random-UUID}`.

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
            "page": '../../#/viewer/config',
            "map": {"version":2,"map":{"projection":"EPSG:900913","units":"m","center":{"x":1250000,"y":5370000,"crs":"EPSG:900913"},"zoom":5,"maxExtent":[-20037508.34,-20037508.34,20037508.34,20037508.34],"layers":[{"type":"osm","title":"Open Street Map","name":"mapnik","source":"osm","group":"background","visibility":true}]}},
            "featureinfo": '',
            "bbox": '',
            "center": '',
            "zoom": 4,
            "actions": [],
        };
        let i = 0;
        function createIframe() {
            i++;
            const iframe = document.createElement('iframe');
            iframe.name = `_iframe-${i}`;
            iframe.id = `_iframe-${i}`;
            iframe.style.width = "100%";
            iframe.style.height = "400px";
            document.body.appendChild(iframe);
            return iframe.name;
        }
        window.onload = function(){
            Object.keys(queryParameters).forEach(function (key) {
                const element = document.getElementById(key);
                if (element) element.value = typeof queryParameters[key] === "object" || Array.isArray(queryParameters[key]) ? JSON.stringify(queryParameters[key]) : queryParameters[key];
            });
            const form = document.getElementById("post-form");
            form.addEventListener('submit', function() {
                const base_url = document.getElementById('mapstore-base').value.replace(/\/?$/, '/');
                const method = document.getElementById("method").value;
                // handle GET URL
                if(method === "GET") {
                    event.preventDefault();
                    const page = document.getElementById("page")?.value;
                    const data = new FormData(event.target);
                    const values = Array.from(data.entries());
                    const queryString = values
                        .filter(([k, v]) => !!v)
                        .reduce((qs = "", [k, v]) => `${qs}&${k}=${encodeURIComponent(v)}`, "");
                    window.open(`${base_url}${page}?${queryString}`, "_blank");
                    return false;
                } else if (method === "GET_IFRAME") {
                    event.preventDefault();
                    const page = document.getElementById("page")?.value;
                    const data = new FormData(event.target);
                    const values = Array.from(data.entries());
                    const queryString = values
                        .filter(([k, v]) => !!v)
                        .reduce((qs = "", [k, v]) => `${qs}&${k}=${encodeURIComponent(v)}`, "");
                    const iframeName = createIframe();
                    const iframe = document.getElementById(iframeName);
                    iframe.src = `${base_url}${page}?${queryString}`;
                    return false;
                }
                // handle POST and POST_IFRAME
                if(method === "POST_IFRAME") {
                    const iframeName = createIframe();
                    form.target = iframeName;
                } else if(method === "POST") {
                    form.target = "_blank";
                }
                form.action = base_url + POST_PATH;
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
            <option value="GET_IFRAME">GET_IFRAME</option>
            <option value="POST_IFRAME">POST_IFRAME</option>
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
        <label for="page">page:</label><br/><input type="text" id="page" name="page" value="../../#/viewer/config"></input><br/>
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

GET: `#/viewer/config?featureinfo={"lat": 43.077, "lng": 12.656, "filterNameList": []}`

GET: `#/viewer/config?featureinfo={"lat": 43.077, "lng": 12.656, "filterNameList": ["layerName1", "layerName2"]}`

#### Simplified syntax

GET: `#/viewer/config?featureInfo=38.72,-95.625`

Where lon,lat values are comma-separated respecting order.

### Map

Allows to pass the entire map JSON definition (see the map configuration format of MapStore).

GET:

```text
#/viewer/config?map={"version":2,"map":{"projection":"EPSG:900913","units":"m","center":{"x":1250000,"y":5370000,"crs":"EPSG:900913"},"zoom":5,"maxExtent":[-20037508.34,-20037508.34,20037508.34,20037508.34],"layers":[{"type":"osm","title":"Open Street Map","name":"mapnik","source":"osm","group":"background","visibility":true}]}}
```

It also allows partial overriding of existing map configuration by passing only specific properties of the root object and/or the internal "map" object.

Following example will override "catalogServices" and "mapInfoConfiguration":

```text
#/viewer/config?map={"mapInfoConfiguration":{"trigger":"click","infoFormat":"text/html"},"catalogServices":{"services": {"wms": {"url": "http://example.com/geoserver/wms","type": "wms","title": "WMS","autoload": true}},"selectedService": "wms"}}
```

### Center / Zoom

GET: `#/viewer/config?center=0,0&zoom=5`

Where lon,lat values are comma-separated respecting order.

### Marker / Zoom

GET: `#/viewer/config?marker=0,0&zoom=5`

Where lon,lat values are comma-separated respecting order.

### Bbox

GET: `#/viewer/config?bbox=8,8,53,53`

Where values are `minLongitude, minLatitude, maxLongitude, maxLatitude` respecting order.

### AddLayers

This is a shortened syntax for `CATALOG:ADD_LAYERS_FROM_CATALOGS` action described down below.

GET: `#/viewer/config?addLayers=layer1;service,layer2&layerFilters=attributeLayer1='value';attributeLayer2='value2'`

`addLayers` parameter is a comma separated list of `<layerName>;<service>` (`service` is optional, and if present is separated
from the layerName by a `;`.

In the example above:

- `layer1` and `layer2` are layer names;
- `service` is the service identifier of the catalog.
If no service is provided, the default service will be used.
- `layerFilters` is a list of cql filters to apply to the corresponding layer in the same position of the `addLayers` parameter, separated by `;`

### MapInfo

This is a shortened syntax for `SEARCH:SEARCH_WITH_FILTER` action described down below.
In opposite to direct usage of action, `mapInfo` parameter can work with layers added by `addLayers` parameter.
In this case search execution will be postponed up to the moment when layer is added to the map.

`mapInfo` handler will check if `addLayers` parameter is present and if it lists layer name used in `mapInfo` parameter.
If so, it will postpone search to ensure that layer is added to the map. Otherwise, in case of no matches, search will execute
immediately.

GET: `#/viewer/new?addLayers=layer1;service&mapinfo=layer1&mapInfoFilter=BB='cc'`

Where:

- `layer1` is layer name.
- `service` is the service name providing layer data. Service name is optional. If no service is provided, the default service of the catalog will be used.
- `mapInfoFilter` is a cql filter applied to the layer.

### Background

Allows to dynamically add background to the map and activate it.
Supports default backgrounds provided by static service defined in `localConfig.json` (`default_map_backgrounds`) as well
as other layers:

`#/viewer/new?background=Sentinel;default_map_backgrounds`

`#/viewer/new?background=layer1;service`

`#/viewer/new?background=layer2`

Where:

- `Sentinel`, `layer1`, `layer2` are layer names,
- `service`, `default_map_backgrounds` are the service names providing layer data. Service name is optional. If no service is provided, the default service of the catalog will be used.

According to the implementation of `default_map_backgrounds` service, it is enough to pass desired layer name even partially, e.g. `background=Sen;default_map_backgrounds`,
it will use the closest layer name match in this case.

### Actions

To dispatch additional actions when the map viewer is started, the **actions** query parameter can be used. Only actions from a configured whitelist can be dispatched in this way (see the [configuration section](configuration-files.md#configuring-mapstore) for more details).

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

GET: `#/viewer/config?actions=[{"type": "ZOOM_TO_EXTENT","extent": [1,2,3,4],"crs": "EPSG:4326","maxZoom": 8}]`

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

GET: `#/viewer/config?actions=[{"type":"SEARCH:SEARCH_WITH_FILTER","cql_filter":"ID=75","layer":"WORKSPACE:LAYER_NAME"}]`

The sample request below illustrates how two actions can be concatenated:

```text
https://dev-mapstore.geosolutionsgroup.com/mapstore/#/viewer/4093?actions=[{"type":"SEARCH:SEARCH_WITH_FILTER","cql_filter":"STATE_FIPS=34","layer":"topp:states"},{"type":"ZOOM_TO_EXTENT","extent":[-77.48202256347649,38.74612266051003,-72.20858506347648,40.66664704515103],"crs":"EPSG:4326","maxZoom":8}]
```

The MapStore invocation URL above executes the following operations:

- Execution of a search request filtering by **STATE_FIPS** with value 34 on the **topp:states** layer
- Execution of a map zoom to the provided extent

For more details check out the [searchLayerWithFilter](https://mapstore.geosolutionsgroup.com/mapstore/docs/#actions.search.exports.searchLayerWithFilter) in the framework documentation

#### Scheduled Map Info

It works similarly to the `Map Info` action, but supports delaying of the search execution up to the moment when layer is added to the map.
This behavior is used when search should be applied to the dynamically added layer (e.g. using `addLayer` parameter) :

Example:

```json
{
    "type": "SEARCH:SCHEDULE_SEARCH_WITH_FILTER",
    "cql_filter": "ID=75",
    "layer": "WORKSPACE:LAYER_NAME"
}
```

GET: `#/viewer/config?actions=[{"type":"SEARCH:SCHEDULE_SEARCH_WITH_FILTER","cql_filter":"ID=75","layer":"WORKSPACE:LAYER_NAME"},{"type":"CATALOG:ADD_LAYERS_FROM_CATALOGS","layers":["WORKSPACE:LAYER_NAME"],"sources":["catalog1"]}]`

#### Add Layers

This action allows to add layers directly to the map by taking them from the catalogs configured, or passed.

Requirements:

- The number of layers should match the number of sources
- The source name can be a string that must match a catalog service name present in the map or an object that defines an external catalog (see example)

Supported layer types are WMS, WMTS, WFS, COG, 3D Tiles and GeoJSON.

Example:

```json
{
    "type": "CATALOG:ADD_LAYERS_FROM_CATALOGS",
    "layers": ["workspace1:layer1", "workspace2:layer2", "workspace:externallayername"],
    "sources": ["catalog1", "catalog2", {"type":"WMS","url":"https://example.com/wms"}]
}
```

GET: `#/viewer/config?actions=[{"type":"CATALOG:ADD_LAYERS_FROM_CATALOGS","layers":["layer1", "layer2", "workspace:externallayername"],"sources":["catalog1", "catalog2", {"type":"WMS","url":"https://example.com/wms"}]}]`

Data of resulting layer can be additionally filtered by passing "CQL_FILTER" into the options array. Each element of array corresponds to the layer defined in action:

```json
{
    "type": "CATALOG:ADD_LAYERS_FROM_CATALOGS",
    "layers": ["workspace1:layer1", "workspace2:layer2", "workspace:externallayername"],
    "sources": ["catalog1", "catalog2", {"type":"WMS","url":"https://example.com/wms"}],
    "options": [{"params":{"CQL_FILTER":"NAME='value'"}}, {}, {"params":{"CQL_FILTER":"NAME='value2'"}}]
}
```

GET `#/viewer/config?actions=[{"type":"CATALOG:ADD_LAYERS_FROM_CATALOGS","layers":["layer1","layer2","workspace:externallayername"],"sources":["catalog1","catalog2",{"type":"WMS","url":"https://example.com/wms"}],"options": [{"params":{"CQL_FILTER":"NAME='value'"}}, {}, {"params":{"CQL_FILTER":"NAME='value2'"}}]}]`

Number of objects passed to the options can be different to the number of layers, in this case options will be applied to the first X layers, where X is the length of options array.

The COG service endpoint does not contain a default property for the name of the layer and it returns only a single record for this reason the name used in the layers array will be used to apply the title to the added COG layer:

```json
{
    "type": "CATALOG:ADD_LAYERS_FROM_CATALOGS",
    "layers": ["My huge remote satellite COG"],
    "sources": [{ "type":"cog", "url":"https://example.com/satellite_imagery.tif" }]
}
```

GET: `#/viewer/config?actions=[{"type":"CATALOG:ADD_LAYERS_FROM_CATALOGS","layers":["My huge remote satellite COG"],"sources":[{"type":"cog","url":"https://example.com/satellite_imagery.tif"}]}]`

!!! note
    Depending on the internal structure optimization done on the remote COG source, the map load time might be long. Furthermore, it is not feasible to cancel metadata fetching for the COG layer(s) when loading layers via query parameters.

The 3D tiles service endpoint does not contain a default property for the name of the layer and it returns only a single record for this reason the name used in the layers array will be used to apply the title to the added 3D Tiles layer:

```json
{
    "type": "CATALOG:ADD_LAYERS_FROM_CATALOGS",
    "layers": ["My 3D Tiles Layer"],
    "sources": [{ "type":"3dtiles", "url":"https://example.com/tileset-pathname/tileset.json" }]
}
```

GET: `#/viewer/config?actions=[{"type":"CATALOG:ADD_LAYERS_FROM_CATALOGS","layers":["My 3D Tiles Layer"],"sources":[{"type":"3dtiles","url":"https://example.com/tileset-pathname/tileset.json"}]}]`

For the 3D Tiles you can pass also the layer options, to customize the layer. Here and example to localize the title:

```json
{
    "type": "CATALOG:ADD_LAYERS_FROM_CATALOGS",
    "layers": ["My 3D Tiles Layer"],
    "sources": [{ "type":"3dtiles", "url":"https://example.com/tileset-pathname/tileset.json" }],
    "options":[{ "title": { "en-US": "LayerTitle", "it-IT": "TitoloLivello" }}]
}
```

GET: `#/viewer/config?actions=[{"type":"CATALOG:ADD_LAYERS_FROM_CATALOGS","layers":["My 3D Tiles Layer"],"sources":[{"type":"3dtiles","url":"https://example.com/tileset-pathname/tileset.json"}],"options":[{"title":{"en-US":"LayerTitle","it-IT":"TitoloLivello"}}]}]`

It is possible to add GeoJSON layer using the following configuration:

```json
{
"type": "CATALOG:ADD_LAYERS_FROM_CATALOGS",
"layers": ["My GeoJSON Layer"],
"sources": [{ "type":"GEOJSON", "url":"https://example.com/example.geojson" }]
}
```

GET: `#/viewer/config?actions=[{"type":"CATALOG:ADD_LAYERS_FROM_CATALOGS","layers":["My GeoJSON Layer"],"sources":[{"type":"GEOJSON","url":"https://example.com/example.geojson"}]}]`

This GeoJSON catalog will return a single record similar to the 3D Tiles catalog and for this reason the name used in the layers array will be used to apply the title to the added vector layer.

!!! note
    When using `SEARCH:SEARCH_WITH_FILTER` and `SEARCH:SCHEDULE_SEARCH_WITH_FILTER` in the context or any derived resource of the context via a query parameter, please ensure that the `Search` plugin is imported in the respective [context](../../user-guide/application-context/#application-context), as the actions associated with the plugin are required for them to be effectively triggered.
