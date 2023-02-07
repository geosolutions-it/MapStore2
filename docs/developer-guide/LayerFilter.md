# MapStore filters

Mapstore filtering system is trying to allow to accomplish the following goals:

- Support for multiple filters standards (CQL, OGC)
- Support for multiple filter types (spatial, temporal, attribute, etc.)
- Support for future filter standards.
- Allow to be handled independently from the data source (WFS, WMS, etc.)
- Allow to leave the entry points to manage them programmatically.

For this reason, MapStore stores internally a filter object that is a JSON object that can be serialized in different formats (CQL, OGC, etc.) and can be used to filter data sources.
This is the internal filtering system used by mapstore, that can be for instance in `layerFilters` in the layer object

## `mapstore` Format

This JSON object is a container that has this shape:

```json
{
    "format": "mapstore",
    "version": "1.0.0",
    "filters": [],
    // ...other fields
}
```

By default all the filters contained in the "filters" array are combined with an `AND` operator. Every filter in the array is a JSON object that can be serialized in different formats (CQL, OGC, etc.).
Each of them is a JSON object that must have the `format` value, to be recognized and properly converted,

All the filters in `filters` array will have at least a `format` field and an optional `id` attribute reserved, that can be used to identify the filter from a component that wants to use it.

Filters in the `filters` array can be combined with a logic operator (`AND`, `OR`), in this case the filter object must have the `logic` format.
Moreover they can be of `mapstore` format too.

!!! Note
    For backward compatibility, the filter object without the "format" field is considered as "mapstore" format, version "1.0.0".

!!! Note
    For backward compatibility, the filters "mapstore" of version "1.0.0" can contain also several other fields that will be deprecated in the future in favor of a `mapstore-query-panel` format, that is the format used by the query panel, and currently mostly supported in MapStore.
    So a filter like this is still valid:

        ```json
        {
            "format": "mapstore",
            "version": "1.0.0",
            "groupFields": [],
            "spatialField": {
                "method": "BBOX",
                "attribute": "the_geom",
                "operation": "INTERSECTS",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[12.5,41.5], [12.5,  42.5], [13.5,42.5], [13.5, 41.5], [12.5,41.5]]]
                }
            },
            "attributeFields": [{
                "attribute": "name",
                "operator": "=",
                "type": "string",
                "value": "test"
            }]
        }
        ```

## `mapstore-query-panel` format

The `mapstore-query-panel` format is a JSON object that has this shape:

```json
{
    "format": "mapstore-query-panel",
    "version": "1.0.0",
    "groupFields": [],
    "spatialField": {},
    "attributeFields": [],

}
```

## `logic` format

In order to allow to create complex filters, MapStore allows to combine filters with a logic operator (`AND`, `OR`).
The `logic` format is a JSON object that has this shape:

```json
{
    "format": "logic",
    "version": "1.0.0",
    "logic": "AND",
    "filters": []
}
```

## `cql` format

The `cql` format is a JSON object that has this shape:

```json
{
    "format": "cql",
    "version": "1.0.0",
    "value": "..."
}
```

## Supporting new formats

In order to support new formats, you can add a new entry in the `converters` object in `MapStore2/web/client/utils/Filter/filter/converters/index.js` file.
The converter object must implement at least the following methods:

```js
{
    toOGC: (filter::Object) => filter::String,
    toCQL: (filter::Object) => filter::String
}
```

These methods will translate the JSON object in the format specified in the method name.
Future converters (maybe with a more generic method) will be added to support other formats, if needed.
