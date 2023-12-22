# MapStore vector style

The `vector` and `wfs` layer types are rendered by the client as GeoJSON features and it possible to apply specific symbolizer using the `style` property available in the layer options. The style object is composed by these properties

- `format` the format encoding used by style body
- `body` the actual style rules and symbolizers

example:

```json
{
  "type": "vector",
  "features": [],
  "style": {
    "format": "geostyler",
    "body": {
      "name": "My Style",
      "rules": [
        {
          "name": "My Rule",
          "symbolizers": [
            {
              "kind": "Line",
              "color": "#3075e9",
              "opacity": 1,
              "width": 2
            }
          ]
        }
      ]
    }
  }
}
```

The default format used by MapStore is "geostyler" that is an encoding based on the [geostyler-style](https://github.com/geostyler/geostyler-style) specification that could include some variations or limitations related to the map libraries used by MapStore app.
We suggest to refer to following doc for the rule/symbolizer properties available in MapStore.

Ths style `body` is composed by following properties:

- `name` style name
- `rules` list of rule object that describe the style

A `rule` object is composed by following properties:

- `name` rule name that could be used to generate a legend
- `filter` filter expression
- `symbolizers` list of symbolizer object that describe the rule (usually one per rule)

The `filter` expression define with features should be rendered with the symbolizers listed in the rule

example:

```js
// simple comparison condition structure
// [operator, property key, value]
{
  "filter": ["==", "count", 10]
}

// mulitple condition with logical operato
// [logical operator, [condition], [condition]]
{
  "filter": [
    "||",
    [">", "height", 10],
    ["==", "category", "building"]
  ]
}
```

Available logical operators:

| Operator | Description |
| --- | --- |
| `\|\|` | OR operator |
| `&&` | AND operator |

Available comparison operators:

| Operator | Description |
| --- | --- |
| `==` | equal to |
| `*=` | like (for string type) |
| `!=` | is not |
| `<` | less than |
| `<=` | less and equal than |
| `>` | grater than |
| `>=` | grater and equal than |

The `symbolizer` could be of following `kinds`:

## `Mark` symbolizer properties

| Property | Description | 2D | 3D |
| --- | --- | --- | --- |
| `kind` | must be equal to **Mark** | x | x |
| `color` | fill color of the mark | x | x |
| `fillOpacity` | fill opacity of the mark | x | x |
| `strokeColor` | stroke color of the mark | x | x |
| `strokeOpacity` | stroke opacity of the mark | x | x |
| `strokeWidth` | stroke width of the mark | x | x |
| `strokeDasharray` | array that represent the dashed line intervals | x | x |
| `radius` | radius size in px of the mark | x | x |
| `wellKnownName` | rendered shape, one of Circle, Square, Triangle, Star, Cross, X, shape://vertline, shape://horline, shape://slash, shape://backslash, shape://dot, shape://plus, shape://times, shape://oarrow or shape://carrow | x | x |
| `msBringToFront` | this boolean will allow setting the **disableDepthTestDistance** value for the feature. This would |  | x |
| `msHeightReference` | reference to compute the distance of the point geometry, one of **none**, **ground** or **clamp** |  | x |
| `msHeight` | height of the point, the original geometry is applied if undefined  |  | x |
| `msLeaderLineColor` | color of the leading line connecting the point to the terrain  |  | x |
| `msLeaderLineOpacity` | opacity of the leading line connecting the point to the terrain |  | x |
| `msLeaderLineWidth` | width of the leading line connecting the point to the terrain |  | x |

## `Icon` symbolizer properties

| Property | Description | 2D | 3D |
| --- | --- | --- | --- |
| `kind` | must be equal to **Icon** | x | x |
| `image` | url of the image to use as icon | x | x |
| `size` | size of the icon | x | x |
| `opacity` | opacity of the icon | x | x |
| `rotate` | rotation of the icon | x | x |
| `anchor` | anchor point of the icon, one of: top-left, top, top-right, left, center, right, bottom-left, bottom or bottom-right | x | x |
| `msBringToFront` | this boolean will allow setting the **disableDepthTestDistance** value for the feature. This would |  | x |
| `msHeightReference` | reference to compute the distance of the point geometry, one of **none**, **ground** or **clamp** |  | x |
| `msHeight` | height of the point, the original geometry is applied if undefined  |  | x |
| `msLeaderLineColor` | color of the leading line connecting the point to the terrain  |  | x |
| `msLeaderLineOpacity` | opacity of the leading line connecting the point to the terrain |  | x |
| `msLeaderLineWidth` | width of the leading line connecting the point to the terrain |  | x |

**Experimental**: the image property support a custom expression called `msMarkerIcon` to render default markers, here the expected structure:

```js
{
    "kind": "Icon",
    "image": {
        "name": "msMarkerIcon",
        "args": [
            {
                "color": "blue", // 'red', 'orange-dark', 'orange', 'yellow', 'blue-dark', 'blue', 'cyan', 'purple', 'violet', 'pink', 'green-dark', 'green', 'green-light' or 'black'
                "shape": "circle", // 'circle', 'square', 'star' or 'penta'
                "glyph": "comment" // a Font Awesome v4.7.0 icon
            }
        ]
    },
    "opacity": 1,
    "size": 48,
    "rotate": 0,
    "anchor": "bottom"
}
```

## `Line` symbolizer properties

| Property | Description | 2D | 3D |
| --- | --- | --- | --- |
| `kind` | must be equal to **Line** | x | x |
| `color` | stroke color of the line | x | x |
| `opacity` | stroke opacity of the line | x | x |
| `width` | stroke width of the line | x | x |
| `dasharray` | array that represent the dashed line intervals | x | x |
| `msClampToGround` | this boolean will allow setting the **clampToGround** value for the feature. This would only apply on Cesium maps. |  | x |
| `msHeight` | line height in meters, if undefined the line geometry height is used |  | x |
| `msHeightReference` | reference to compute the distance of the line geometry, one of **none**, **ground** or **clamp**. This is applied also to the `msExtrudedHeight` property |  | x |
| `msExtrudedHeight` | height of the extrusion in meters |  | x |
| `msExtrusionRelativeToGeometry` | if true the extrusion height is computed as z distance from the line geometry. When false the extrude height is computed as absolute altitude. When `msExtrusionType` is not `undefined` the extrusion height will be computed always relative to the geometry so this property has not effect |  | x |
| `msExtrusionColor` | color of the extruded shape |  | x |
| `msExtrusionOpacity` | opacity of the extruded shape |  | x |
| `msExtrusionType` | type of extrusion, one of `undefined`, **Circle** or **Square**. If `undefined` a vertical wall plane will be extruded. |  | x |

## `Fill` symbolizer properties

| Property | Description | 2D | 3D |
| --- | --- | --- | --- |
| `kind` | must be equal to **Fill** | x | x |
| `color` | fill color of the polygon | x | x |
| `fillOpacity` | fill opacity of the polygon | x | x |
| `outlineColor` | outline color of the polygon | x | x |
| `outlineOpacity` | outline opacity of the polygon | x | x |
| `outlineWidth` | outline width of the polygon | x | x |
| `outlineDasharray` | array that represent the dashed line intervals | x | x |
| `msClassificationType` | allow setting **classificationType** value for the feature. This would only apply on polygon graphics in Cesium maps. |  | x |
| `msHeight` | polygon height in meters, if undefined the polygon geometry height is used |  | x |
| `msHeightReference` | reference to compute the distance of the polygon geometry, one of **none**, **ground** or **clamp**. This is applied also to the `msExtrudedHeight` property |  | x |
| `msExtrudedHeight` | height of the extrusion in meters |  | x |
| `msExtrusionRelativeToGeometry` | if true the extrusion height is computed as z distance from the polygon surface. When false the extrude height is computed as absolute altitude |  | x |

## `Text` symbolizer properties

| Property | Description | 2D | 3D |
| --- | --- | --- | --- |
| `kind` | must be equal to **Text** | x | x |
| `label` | text to show in the label, the {{propertyKey}} notetion allow to access feature properties (eg. 'feature name is {{name}}') | x | x |
| `font` | array of font family names | x | x |
| `size` | font size of the label | x | x |
| `fontStyle` | font style of the label: normal or italic | x | x |
| `fontWeight` | font style of the label: normal or bold | x | x |
| `color` | font color of the label | x | x |
| `anchor` | anchor point of the label, one of: top-left, top, top-right, left, center, right, bottom-left, bottom or bottom-right | x | x |
| `haloColor` | halo color of the label | x | x |
| `haloWidth` | halo width of the label | x | x |
| `offset` | array of x and y values offset of the label | x | x |
| `msBringToFront` | this boolean will allow setting the **disableDepthTestDistance** value for the feature. This would |  | x |
| `msHeightReference` | reference to compute the distance of the point geometry, one of **none**, **ground** or **clamp** |  | x |
| `msHeight` | height of the point, the original geometry is applied if undefined  |  | x |
| `msLeaderLineColor` | color of the leading line connecting the point to the terrain  |  | x |
| `msLeaderLineOpacity` | opacity of the leading line connecting the point to the terrain |  | x |
| `msLeaderLineWidth` | width of the leading line connecting the point to the terrain |  | x |

## `Model` symbolizer properties (custom symbolizer to visualize 3D model as point geometries)

| Property | Description | 2D | 3D |
| --- | --- | --- | --- |
| `kind` | must be equal to **Model** |  | x |
| `model` | url of a 3D .glb file |  | x |
| `heading` | heading rotation |  | x |
| `pitch` | pitch rotation |  | x |
| `roll` | roll rotation |  | x |
| `scale` | scale factor |  | x |
| `color` | color mixed with the mesh texture/material |  | x |
| `opacity` | color opacity |  | x |
| `msHeightReference` | reference to compute the distance of the point geometry, one of **none**, **ground** or **clamp** |  | x |
| `msHeight` | height of the point, the original geometry is applied if undefined  |  | x |
| `msTranslateX` | move the model on the x axis with a value in meters (west negative value, east positive value) |  | x |
| `msTranslateY` | move the model on the y axis with a value in meters (south negative value, north positive value) |  | x |
| `msLeaderLineColor` | color of the leading line connecting the point to the terrain  |  | x |
| `msLeaderLineOpacity` | opacity of the leading line connecting the point to the terrain |  | x |
| `msLeaderLineWidth` | width of the leading line connecting the point to the terrain |  | x |

## `Circle` symbolizer properties

| Property | Description | 2D | 3D |
| --- | --- | --- | --- |
| `kind` | must be equal to **Circle** | x | x |
| `color` | fill color of the circle | x | x |
| `opacity` | fill opacity of the circle | x | x |
| `outlineColor` | outline color of the circle | x | x |
| `outlineOpacity` | outline opacity of the circle | x | x |
| `outlineWidth` | outline width of the circle | x | x |
| `outlineDasharray` | array that represent the dashed line intervals | x | x |
| `radius` | radius in meter of the circle | x | x |
| `gedesic` | if true draws a geodesic circle | x | x |
| `msClassificationType` | allow setting **classificationType** value for the feature. This would only apply on polygon graphics in Cesium maps. |  | x |
| `msClampToGround` | this boolean will allow setting the **clampToGround** value for the feature. This would only apply on Cesium maps. |  | x |

### Legacy Vector Style (deprecated)

The `style` or `styleName` properties of vector layers (wfs, vector...) allow to apply a style to the local data on the map.

- `style`: a style object/array. It can have different formats. In the simplest case it is an object that uses some leaflet-like style properties:
  - `weight`: width in pixel of the border / line.
  - `radius`: radius of the circle (valid only for Point types)
  - `opacity`: opacity of the border / line.
  - `color`: color of the border / line.
  - `fillOpacity`: opacity of the fill if any. (Polygons, Point)
  - `fillColor`: color of the fill, if any. (Polygons, Point)
- `styleName`: if set to `marker`, the `style` object will be ignored and it will use the default marker.

In case of `vector` layer, style can be added also to the specific features. Other ways of defining the style for a vector layer have to be documented.

### Advanced Vector Styles (deprecated)

To support advanced styles (like multiple rules, symbols, dashed lines, start point, end point) the style can be configured also in a different format, as an array of objects and you can define them feature by feature, adding a "style" property.

!!!warning
    This advanced style functionality has been implemented to support annotations, at the moment this kind of advanced style options is supported **only** as a property of the single feature object, not as global style.

### SVG Symbol (deprecated)

The following options are available for a SVG symbol.

- `symbolUrl`: a URL (also a data URL is ok) for the symbol to use (SVG format).
    You can anchor the symbol using:
  - `iconAnchor`: array of x,y position of the offset of the symbol from top left corner.
  - `anchorXUnits`, `anchorYUnits` unit of the `iconAnchor` (`fraction` or `pixels`).
  - `size`: the size in pixel of the square that contains the symbol to draw. The size is used to center and to cut the original svg, so it must fit the svg.
- `dashArray`: Array of line, space size, in pixels. ["6","6"] Will draw the border of the symbol dashed. It is applied also to a generic line or polygon geometry.

### Markers and glyphs (deprecated)

These are the available options for makers. These are specific of annotations for now, so allowed values have to be documented.

- `iconGlyph`: e.g. "shopping-cart"
- `iconShape`: e.g. "circle"
- `iconColor`: e.g. "red"
- `iconAnchor`: [0.5,0.5]

### Multiple rules and filtering (deprecated)

In order to support start point and end point symbols, you could find in the style these entries:

- `geometry`: "endPoint"|"startPoint", identify how to get the geometry from
- `filtering`: if true, the geometry filter is applied.

### Example (deprecated)

Here an example of a layer with:

- a point styled with SVG symbol,
- a polygon with dashed style
- a line with start-end point styles as markers with icons

```json
{
        "type": "vector",
        "visibility": true,
        "id": "styled-vector-layer",
        "name": "styled-vector-layer",
        "hideLoading": true,
        "features": [
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [2,0]
            },
            "properties": {},
            "style": [
              {
                "iconAnchor": [0.5,0.5],
                "anchorXUnits": "fraction",
                "anchorYUnits": "fraction",
                "opacity": 1,
                "size": 30,
                "symbolUrl": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30'%3E%3Crect  x='5' y='5' width='20' height='20' style='fill:rgb(255,0,0);stroke-width:5;stroke:rgb(0,0,0)' /%3E%3C/svg%3E",
                "shape": "triangle",
                "id": "c65cadc0-9b46-11ea-a138-dd5f1faf9a0d",
                "highlight": false,
                "weight": 4
              }
            ]
          },{
            "type": "Feature",
            "geometry": {
              "type": "Polygon",
              "coordinates": [[[0, 0],[1, 0],[1, 1],[0,1],[ 0,0]]]
            },
            "properties": {},
            "style": [
              {
                "color": "#d0021b",
                "opacity": 1,
                "weight": 3,
                "fillColor": "#4a90e2",
                "fillOpacity": 0.5,
                "highlight": false,
                "dashArray": ["6","6"]
              }
            ]
          },{
            "type": "Feature",
            "geometry": {
              "coordinates": [[0, 2],[ 0,3]],
              "type": "LineString"
            },
            "properties": {},
            "style": [
              {
                "color": "#ffcc33",
                "opacity": 1,
                "weight": 3,
                "editing": {
                  "fill": 1
                },
                "highlight": false
              },
              {
                "iconGlyph": "comment",
                "iconShape": "square",
                "iconColor": "blue",
                "highlight": false,
                "iconAnchor": [ 0.5,0.5],
                "type": "Point",
                "title": "StartPoint Style",
                "geometry": "startPoint",
                "filtering": true
              },
              {
                "iconGlyph": "shopping-cart",
                "iconShape": "circle",
                "iconColor": "red",
                "highlight": false,
                "iconAnchor": [ 0.5,0.5 ],
                "type": "Point",
                "title": "EndPoint Style",
                "geometry": "endPoint",
                "filtering": true
              }
            ]
          }
        ]
      }
```

*Result:*

<img src="../img/vector-style-annotations.jpg" class="ms-docimage"  style="max-width:600px;"/>
