# MapStore filters

Mapstore filtering system is trying to allow to accomplish the following goals:

- Support for multiple filters standards (CQL, OGC)
- Support for multiple filter types (spatial, temporal, attribute, etc.)
- Support for future filter standards.
- Allow to be handled independently from the data source (WFS, WMS, etc.)
- Allow to leave the entry points to manage them programmatically.

For this reason, MapStore stores internally a filter object that is a JSON object that can be serialized in different formats (CQL, OGC, etc.) and can be used to filter data sources.
This is the internal filtering system used by mapstore, that can be for instance in `layerFilters` in the layer object

## Formats

### `mapstore` Format

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
            "filterFields": [{
                "attribute": "name",
                "operator": "=",
                "type": "string",
                "value": "test"
            }]
        }
        ```

### `logic` format

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

### `cql` format

The `cql` format is a JSON object that has this shape:

```json
{
    "format": "cql",
    "version": "1.0.0",
    "body": "..."
}
```

!!! Note:
    MapStore actually supports only a subset of CQL, that is the one used by GeoServer.

### `geostyler` format

The `geostyler` format is a JSON object that has this shape:

```json
{
    "format": "geostyler",
    "version": "1.0.0",
    "body": ["......"]
}
```

These are some examples for the `body` of `geostyler`:

- Simple: `["&&", ['>=', 'FIELD_01', '0'], ['<', 'FIELD_01', '250']]`
- Complex: `['||', ['==', 'FIELD_01', 1], ['&&', ['==', 'FIELD_02', 2], ['==', 'FIELD_03', 3]]]`

### `mapstore-query-panel` format

The `mapstore-query-panel` format is a JSON object that has this shape:

```json
{
    "format": "mapstore-query-panel",
    "version": "1.0.0",
    "groupFields": [],
    "spatialField": {},
    "filterFields": [],
    "crossLayerFilter": {},

}
```

Now it do not have an implementation yet, but this format will replace the old legacy 'mapstore' fields in the future.

## Supporting new formats

At the moment the filter conversion system is a work in progress. The API may change in the future, keeping the `canConvert` and `getConverter` functions as external API.
We actually support `cql`, `ogc` and `geostyler` as output formats (as strings), and `cql` (partially, cannot parse spatial filters in cql yet), `mapstore` and `logic` as input formats (as JSON objects with `format` as written above).  At the moment we don't have an internal model for a filter to use as intermediate model, but a set of `converters` in `MapStore2/web/client/utils/filter/converters/index.js` file.
The `converter` object is an object that implements a method for each format that you want to support, with the following signature:

```js
{
    [format]: (filter::Object, options) => filter
}
```

Example:

```js
{
    ogc: (filter::Object, options) => filter::String,
    cql: (filter::Object, options) => filter::String,
    geostyler: (filter::Object, options) => filter::[String]
}
```

`options` depends on the specific output format, but it can be used to pass additional parameters to the converter. For instance the `cql` and `geostyler` converters have no options, but the `ogc` converter has an `options` object that can contain the `nsFilter` field, that is the srs of the geometry to be used in the filter. See the JSDoc of the `ogc` converter for more details.

These methods will translate the JSON objects received as input (or in same cases the effective body of the filter) in the format specified in the method name.
Future converters (maybe with a more generic method) will be added to support other formats, if needed.

Javascript API exposed by MapStore to manage filters is in `MapStore2/web/client/utils/filter/converters`.

the functions are:

```js
getConverter(format::String) // return the converter for the specified format
```

The converter depends on the specific output format, but

```js
canConvert(from::Object|String, to::Object) // return true if the filter can be converted in the specified format
```

!!! note
    Because there is not a generic converter, the `from` parameter can be a string or an object. If it is a string, it is considered as the format of the filter, otherwise it is considered as the filter object.

## Appendix A: `mapstore` format legacy fields

`mapstore-query-panel` will include all the legacy fields of the `mapstore` format, that will be deprecated in the future.
For backward compatibility, the `mapstore` format will be still supported, but needs tp be converted into `mapstore-query-panel` format.

Here a full example of the current content stored in `layerFilter` object, with all the legacy fields:

```json
"layerFilter": {
    "searchUrl": null,
    "featureTypeConfigUrl": null,
    "showGeneratedFilter": false,
    "attributePanelExpanded": true,
    "spatialPanelExpanded": true,
    "crossLayerExpanded": true,
    "showDetailsPanel": false,
    "groupLevels": 5,
    "useMapProjection": false,
    "toolbarEnabled": true,
    "groupFields": [
        {
            "id": 1,
            "logic": "OR",
            "index": 0
        },
        {
            "id": 1671785737915,
            "logic": "OR",
            "groupId": 1,
            "index": 1
        }
    ],
    "maxFeaturesWPS": 5,
    "filterFields": [
        {
            "rowId": 1671785736331,
            "groupId": 1,
            "attribute": "LAND_KM",
            "operator": ">",
            "value": 1000000,
            "type": "number",
            "fieldOptions": {
                "valuesCount": 0,
                "currentPage": 1
            },
            "exception": null
        },
        {
            "rowId": 1671785739355,
            "groupId": 1671785737915,
            "attribute": "STATE_NAME",
            "operator": "=",
            "value": "Alabama",
            "type": "string",
            "fieldOptions": {
                "valuesCount": 0,
                "currentPage": 1
            },
            "exception": null,
            "loading": false,
            "options": {
                "STATE_NAME": []
            },
            "openAutocompleteMenu": false
        },
        {
            "rowId": 1671785746696,
            "groupId": 1671785737915,
            "attribute": "STATE_NAME",
            "operator": "=",
            "value": "Arizona",
            "type": "string",
            "fieldOptions": {
                "valuesCount": 0,
                "currentPage": 1
            },
            "exception": null,
            "loading": false,
            "options": {
                "STATE_NAME": []
            },
            "openAutocompleteMenu": false
        }
    ],
    "spatialField": {
        "method": "BBOX",
        "operation": "INTERSECTS",
        "geometry": {
            "id": "aefadb00-829f-11ed-b555-8bd9209cf0fa",
            "type": "Polygon",
            "extent": [
                -13188750.608437454,
                3135752.6483710706,
                -8795761.718831802,
                4671831.168789972
            ],
            "center": [
                -10992256.163634628,
                3903791.908580521
            ],
            "coordinates": [
                [
                    [
                        -13188750.608437454,
                        4671831.168789972
                    ],
                    [
                        -13188750.608437454,
                        3135752.6483710706
                    ],
                    [
                        -8795761.718831802,
                        3135752.6483710706
                    ],
                    [
                        -8795761.718831802,
                        4671831.168789972
                    ],
                    [
                        -13188750.608437454,
                        4671831.168789972
                    ]
                ]
            ],
            "style": {},
            "projection": "EPSG:3857"
        },
        "attribute": "the_geom"
    },
    "simpleFilterFields": [],
    "crossLayerFilter": {
        "attribute": "the_geom",
        "collectGeometries": {
            "queryCollection": {
                "typeName": "gs:us_states",
                "filterFields": [
                    {
                        "rowId": 1671785795624,
                        "groupId": 1,
                        "attribute": "STATE_NAME",
                        "operator": "=",
                        "value": "Alabama",
                        "type": "string",
                        "fieldOptions": {
                            "valuesCount": 0,
                            "currentPage": 1
                        },
                        "exception": null,
                        "loading": false,
                        "openAutocompleteMenu": false,
                        "options": {
                            "STATE_NAME": []
                        }
                    },
                    {
                        "rowId": 1671785801840,
                        "groupId": 1,
                        "attribute": "STATE_NAME",
                        "operator": "=",
                        "value": "Arizona",
                        "type": "string",
                        "fieldOptions": {
                            "valuesCount": 0,
                            "currentPage": 1
                        },
                        "exception": null,
                        "loading": false,
                        "openAutocompleteMenu": false,
                        "options": {
                            "STATE_NAME": []
                        }
                    }
                ],
                "geometryName": "the_geom",
                "groupFields": [
                    {
                        "id": 1,
                        "index": 0,
                        "logic": "OR"
                    }
                ]
            }
        },
        "operation": "INTERSECTS"
    },
    "autocompleteEnabled": true
}
```
