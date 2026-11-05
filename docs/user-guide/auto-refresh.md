# Automatic Refresh

AutoRefresh updates selected datasets periodically in maps and dashboards. Enable the
plugin in a map context to show its control in the map footer. Dashboards include the
control in their sidebar, including embedded dashboards.

## Configure and use refresh

Users who can edit the resource can open the settings with the cog button, select a
dataset and enter its interval in seconds. The list combines layers in the map and
widgets. Copies of a dataset from the same service share one setting, even when their
layer IDs differ. Datasets with the same name on different services remain separate.

Activate the checkbox to start periodic refresh. **Refresh now** performs a single
refresh of the configured datasets without changing the checkbox. The control shows
the time the most recent refresh was requested.

Only visible instances are refreshed. Refreshing a dataset also updates its visible counter, table, chart, map and connected legend widgets. Widget filters, dependencies, pagination and styles are preserved.

While editing features or configuring a widget, its datasets are excluded from refresh.
Other datasets continue refreshing. Refresh resumes after editing ends. AutoRefresh
does not reload an open Attribute Table independently of its normal query/edit flow.

Save the resource to preserve the selected layers and intervals. Activation and
last-refresh status are temporary: every newly loaded resource starts with refresh
disabled. Runtime refresh versions are excluded from saved maps and dashboards.

## Supported layers

Background layers and local data such as annotations, measurements and imported
GeoJSON/shapefiles are excluded. Remote layer support follows the mapping engine:

| Layer | OpenLayers | Leaflet | Cesium |
| --- | --- | --- | --- |
| WMS, WFS | Yes | Yes | Yes |
| ArcGIS MapServer/ImageServer | Yes | Yes | Yes |
| ArcGIS FeatureServer | Yes | No | Yes |
| WMTS | Yes | Yes | Yes |
| TMS | Yes | Yes | No |
| Tile provider | Yes | Yes | Yes |
| FlatGeobuf, COG | Yes | No | Yes |
| 3D Tiles, IFC model | No | No | Yes |

Map widgets use their supported map engine. A layer type unavailable in an engine
cannot be refreshed by that engine.

## Plugin configuration

Add the plugin to a map context, or configure it in the dashboard plugin list:

```json
{
  "name": "AutoRefresh",
  "cfg": {
    "defaultRefreshInterval": 60000,
    "minimumRefreshInterval": 30000
  }
}
```

Both options use **milliseconds**. The default interval is 60 seconds and the minimum
is 30 seconds. An invalid default/minimum falls back to the corresponding default;
the default interval is always at least the configured minimum.

The optional `autoRefreshInterval` layer property also uses milliseconds. For example,
`"autoRefreshInterval": 60000` schedules a dataset every 60 seconds. Missing, zero,
negative, nonnumeric or values above 2147483647 disable scheduling. Imported positive intervals below the configured minimum are clamped to that minimum when scheduling.
