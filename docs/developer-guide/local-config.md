# Application configuration
The application will load by default it will load the `localConfig.json`

You can load a custom configuration by passing the `localConfig` argument in query string:

```
localhost:8081/?localConfig=myConfig#/viewer/openlayers/0
```


The **localConfig** file contains the main information about URLs to load and plugins to load in the various modes.

This is the main structure:
```
{
  // URL of geoStore
  "geoStoreUrl": "rest/geostore/",
  // printURL the url of the print service, if any
  "printUrl": "/geoserver-test/pdf/info.json",
  // a string or an object for the proxy URL.
  "proxyUrl": {
    // if it is an object, the url entry holds the url to the proxy
    "url": "/MapStore2/proxy/?url=",
    // useCORS array contains a list of services that support CORS and so do not need a proxy
    "useCORS": ["http://nominatim.openstreetmap.org", "https://nominatim.openstreetmap.org"]
  },
  // JSON file where uploaded extensions are configured
  "extensionsRegistry": "extensions.json",
  // URL of the folder from where extensions bundles and other assets are loaded
  "extensionsFolder": "",
  // API keys for bing and mapquest services
  "bingApiKey",
  // force dates to be in this specified format. use moment js format pattern
  "forceDateFormat": "YYYY-MM-DD",
  // force time to be in this specified format. use moment js format pattern
  "forceTimeFormat": "hh:mm A",
  "mapquestApiKey",
  // list of actions types that are available to be launched dynamically from query param (#3817)
  "initialActionsWhiteList": ["ZOOM_TO_EXTENT", "ADD_LAYER", ...],
  // path to the translation files directory (if different from default)
  "translationsPath",
  // if true, every ajax and mapping request will be authenticated with the configurations if match a rule (default: true)
  "useAuthenticationRules": true
  // the authentication rules to match
  "authenticationRules": [
  { // every rule has a `urlPattern` regex to match
    "urlPattern": ".*geostore.*",
    // and a authentication `method` to use (basic, authkey, browserWithCredentials)
    "method": "basic"
  }, {
    "urlPattern": "\\/geoserver.*",
    "method": "authkey"
  }],
  // flag for postponing mapstore 2 load time after theme
  "loadAfterTheme": false,
  // flag for abandon map edit confirm popup, by default is enabled
  "unsavedMapChangesDialog": false,
  // optional state initializer (it will override the one defined in appConfig.js)
  "initialState": {
      // default initial state for every mode (will override initialState imposed by plugins reducers)
      "defaultState": {
          ...
          // if you want to customize the supported locales put here the languages you want and follow instruction linked below
          "locales": {
            "supportedLocales": {
              "it": {
                "code": "it-IT",
                "description": "Italiano"
              },
              "en": {
                "code": "en-US",
                "description": "English"
              }
          }
        }
      },
      // mobile override (defined properties will override default in mobile mode)
      "mobile": {
          ...
      }
  },
  "plugins": {
      // plugins to load for the mobile mode
      "mobile": [...]
      // plugins to load for the desktop mode
      "desktop": [...]
      // plugins to load for the embedded mode
      "embedded": [...]
      // plugins to load for the myMode mode
      "myMode": [...]
  }
}
```

If you are building your own app, you can choose to create your custom modes or force one of them by passing the `mode` parameter in the query string.

For adding a new locale or configuring currently supported locales, go check [this](internationalization.md) out.

For configuring plugins, see the [Configuring Plugins Section](plugins-documentation.md) and the [plugin reference page](plugins-architecture.md)

## Explanation of some config properties
- **loadAfterTheme** is a flag that allows to load mapstore.js after the theme which can be versioned or not(default.css). default is false
- **initialState** is an object that will initialize the state with some default values and this WILL OVERRIDE the initialState imposed by plugins & reducers.
- **projectionDefs** is an array of objects that contain definitions for Coordinate Reference Systems

### initialState configuration
It can contain:
1. a defaultState valid for every mode
1. a piece of state for each mode (mobile, desktop, embedded)

Inside defaultState you can set default catalog services adding the following key
```
"catalog": {
  "default": {
    "newService": {
      "url": "",
      "type": "wms",
      "title": "",
      "isNew": true,
      "autoload": false
    },
    "selectedService": "Demo CSW Service",
    "services": {
      "Demo CSW Service": {
        "url": "https://demo.geo-solutions.it/geoserver/csw",
        "type": "csw",
        "title": "A title for Demo CSW Service",
        "autoload": true
      },
      "Demo WMS Service": {
        "url": "https://demo.geo-solutions.it/geoserver/wms",
        "type": "wms",
        "title": "A title for Demo WMS Service",
        "autoload": false
      },
      "Demo WMTS Service": {
        "url": "https://demo.geo-solutions.it/geoserver/gwc/service/wmts",
        "type": "wmts",
        "title": "A title for Demo WMTS Service",
        "autoload": false
      }
    }
  }
}
```

Set `selectedService` value to one of the ID of the services object ("Demo CSW Service" for example).
<br>This will become the default service opened and used in the catalog panel.
<br>For each service set the key of the service as the ID.
```
"ID_CATALOG_SERVICE": {
  "url": "the url pointing to the catalog web service",
  "type": "the type of webservice used. (this need to be consistent with the web service pointed by the url)",
  "title": "the label used for recognizing the catalog service",
  "autoload": "if true, when selected or when catalog panel is opened it will trigger an automatic search of the layers. if false, search must be manually performed."
}
```
<br>Be careful to use unique IDs
<br>Future implementations will try to detect the type from the url.
<br>newService is used internally as the starting object for an empty service.

<br>
<h4> Measure Tool configuration </h4>
Inside defaultState you can set lengthFormula, showLabel, uom:
- you can customize the formula used for length calculation from "haversine" or "vincenty" (default haversine)
- show or not the measurement label on the map after drawing a measurement (default true)
- set the default uom used for measure tool (default m and sqm)
<br>For the label you can choose whatever value you want.
<br>For the unit you can choose between:
 - unit length values : ft, m, km, mi, nm standing for feets, meters, kilometers, miles, nautical miles
 - unit area values : sqft, sqm, sqkm, sqmi, sqnm standing for square feets, square meters, square kilometers, square miles, square nautical miles
- Customize the style for the start/endPoint for the measure features. You can set *startEndPoint* to:
  - false if you want to disable it
  - true (defaults will be used)
  - object for customizing styles by placing *startPointOptions* and/or *endPointOptions*<br>
 - You can either change the radius or set the fillColor or decide to apply this customization to the first and second-last point for polygons<br>
For lineString endPointOptions refers to the last point of the polyline

Example:<br>
```
"measurement": {
  "lengthFormula": "vincenty",
  "showLabel": true,
  "uom": {
    "length": {"unit": "m", "label": "m"},
    "area": {"unit": "sqm", "label": "m²"}
  },
  "startEndPoint": {
    "startPointOptions": {
        "radius": 3,
        "fillColor": "green",
        "applyToPolygon": false
    },
    "endPointOptions": {
        "radius": 3,
        "fillColor": "red",
        "applyToPolygon": false
    }
  }
}
```

### projectionDefs configuration
Custom CRS can be configured here, at root level of localConfig.json file. For example:
```
"projectionDefs": [{
  "code": "EPSG:3003",
  "def": "+proj=tmerc +lat_0=0 +lon_0=9 +k=0.9996 +x_0=1500000 +y_0=0 +ellps=intl+towgs84=-104.1,-49.1,-9.9,0.971,-2.917,0.714,-11.68 +units=m +no_defs",
  "extent": [1241482.0019, 973563.1609, 1830078.9331, 5215189.0853],
  "worldExtent": [6.6500, 8.8000, 12.0000, 47.0500]
}]
```
Explanation of these properties:

- **code** - a code string that will identify the added projection
- **def** - projection definition in PROJ.4 format
- **extent** - projected bounds of the projection
- **worldExtent** - bounds of the projection in WGS84

These parameters for a projection of interest can be found on [epsg.io](https://epsg.io)

### CRS Selector configuration
CRS Selector is a plugin, that is configured in the plugins section. It should look like this:
```
"plugins": {
  ...
  "desktop": [
    ...}, {
      "name": "CRSSelector",
      "cfg": {
        "additionalCRS": {
          "EPSG:3003": {
            label: "Monte Mario"
          }
        },
        "filterAllowedCRS": [
          "EPSG:4326",
          "EPSG:3857"
        ],
        "allowedRoles": [
          "ADMIN"
        ]
      }
    }, {
  ]
}
```
Configuration parameters are to be placed in the "cfg" object. These parameters are:

- **additionalCRS** - object, that contains additional Coordinate Reference Systems. This configuration parameter lets you specify which projections, defined in **projectionDefs**, should be displayed in the CRS Selector, alongside default projections.
Every additional CRS is a property of **additionalCRS** object. The name of that property is a code of a corresponding projection definition in **projectionDefs**. The value of that property is an object
with the following properties:
    - **label** - a string, that will be displayed in the CRS Selector as a name of the projection
- **filterAllowedCRS** - which default projections are to be available in the selector. Default projections are:
    - EPSG:3857
    - EPSG:4326
- **allowedRoles** - CRS Selector will be accessible only to these roles. By default, CRS Selector will be available for any logged in user.

## Web Map Context

MapStore provides support for OGC Web Map Context(WMC) files. They can be imported either using
Import plugin functionality, or from within a context using Map Templates plugin. MapStore maps can
also be exported in WMC format through Export plugin. By default, Export plugin only allows exporting
to MapStore JSON map configuration format. In order to enable support for WMC, Export plugin
configuration in localConfig should be modified to include WMC as one of the enabled formats.
For example:

```javascript
{
    "name": "MapExport",
    "enabledFormats": ["mapstore2", "wmc"]
}
```

In this case Export plugin will work for both MapStore JSON and WMC formats. Upon clicking "Export Map" button
in BurgerMenu, the user will be presented with a panel where he could choose the desired format. If you want
to only support WMC, just leave "wmc" as the only format in "enabledFormats" config prop.

The important thing to remember when exporting MapStore maps to WMC format is that it only supports WMS layers,
meaning any non-WMS layers(such as tiled OSM backgrounds for example) will not be preserved in the resulting WMC file.
The exact way in which the conversion happens is described in further detail throughout this document.

### WMC File Structure

WMC context file generated by MapStore is an XML file with the following structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ViewContext xmlns="http://www.opengis.net/context" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.1.0" xsi:schemaLocation="http://www.opengis.net/context http://schemas.opengis.net/context/1.1.0/context.xsd">
    <General>
        <Title>MapStore Context</Title>
        <Abstract>This is a map exported from MapStore2.</Abstract>
        <BoundingBox minx="-20037508.34" miny="-20037508.34" maxx="20037508.34" maxy="20037508.34" SRS="EPSG:900913"/>
        <Extension>
            <!--general extensions go here-->
        </Extension>
    </General>
    <LayerList>
        <Layer queryable="0" hidden="0">
        <Name>topp:states</Name>
        <Title>USA Population</Title>
        <Server service="OGC:WMS" version="1.3.0">
            <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://demo.geo-solutions.it/geoserver/wms"/>
        </Server>
        <DimensionList>
            <Dimension name="elevation" units="EPSG:5030" unitSymbol="m" default="0.0" multipleValues="1">0.0,200.0,400.0,600.0</Dimension>
            <Dimension name="time" units="ISO8601" default="current" multipleValues="1">2016-02-23T03:00:00.000Z,2016-02-23T06:00:00.000Z</Dimension>
            <!--...other dimensions-->
        </DimensionList>
        <FormatList>
            <Format current="1">image/png</Format>
            <!--...other formats-->
        </FormatList>
        <StyleList>
            <Style>
                <Name>population</Name>
                <Title>Population in the United States</Title>
                <LegendURL width="81" height="80" format="image/png">
                    <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://demo.geo-solutions.it:443/geoserver/topp/states/ows?service=WMS&amp;request=GetLegendGraphic&amp;format=image%2Fpng&amp;width=20&amp;height=20&amp;layer=states"/>
                </LegendURL>
            </Style>
            <!--...other styles-->
        </StyleList>
        <Extension>
            <!--layer extensions go here-->
        </Extension>
        <!--...other layers-->
    </LayerList>
</ViewContext>
```

More information about each of the elements in the example above can be looked up in [OGC WMC implementation specification](http://portal.opengeospatial.org/files/?artifact_id=8618)

Apart from standard WMC XML elements, MapStore provides support for various extensions. These are placed inside
`Extension` tag, and are not gueranteed to be supported outside MapStore, as they are not a part of OGC
Web Map Context specification. MapStore provides two types of extensions: openlayers and mapstore-specific elements.
WMC can have an `Extension` element inside `General`, and each of the `Layer` elements. Supported extensions in `General` are:

Openlayers:

- `maxExtent` if present, it's attributes are used as map's bounding box, instead of the values specified in `BoundingBox` tag.
The values are assumed to be in a projection, specified in SRS attribute of `BoundingBox`

```xml
<ol:maxExtent xmlns:ol="http://openlayers.org/context" minx="-20037508.34" miny="-20037508.34" maxx="20037508.34" maxy="20037508.34"/>
```

MapStore specific:

- `GroupList` defines a mapstore group list. Contains `Group` elements that describe a particular layer group:

```xml
<ms:GroupList xmlns:ms="http://geo-solutions.it/mapstore/context">
    <ms:Group xmlns:ms="http://geo-solutions.it/mapstore/context" id="Default" title="Default" expanded="true"/>
</ms:GroupList>
```

- `center` defines a center of map view

```xml
<ms:center xmlns:ms="http://geo-solutions.it/mapstore/context" x="1.5" y="2.5" crs="EPSG:3857"/>
```

- `zoom` map zoom level

```xml
<ms:zoom xmlns:ms="http://geo-solutions.it/mapstore/context">7</ms:zoom>
```

Supported extensions for each `Layer` element are:

Openlayers:

- `maxExtent` if present, used for the value of layer's bbox. Values are assumed to be in a projection, specified in SRS attribute of
"BoundingBox"
- `singleTile` specifies layer's "singleTile" property value
- `transparent` is layer transparent or not, true by default
- `isBaseLayer` if true, the layer is put into "backgrounds" group
- `opacity` layer's opacity value

```xml
<ol:maxExtent xmlns:ol="http://openlayers.org/context" minx="-13885038.382960921" miny="2870337.130793682" maxx="-7455049.489182421" maxy="6338174.0557576185"/>
<ol:singleTile xmlns:ol="http://openlayers.org/context">false</ol:singleTile>
<ol:transparent xmlns:ol="http://openlayers.org/context">true</ol:transparent>
<ol:isBaseLayer xmlns:ol="http://openlayers.org/context">false</ol:isBaseLayer>
<ol:opacity xmlns:ol="http://openlayers.org/context">1</ol:opacity>
```

MapStore specific:

- `group` specifies to which group, among listed in "GroupList" element, the layer belongs to
- `search` JSON describing a filter that is applied to the layer
- `DimensionList` contains `Dimension` elements that describe dimensions that cannot be described using standard "Dimension" tag.
Currently supports dimensions of ***multidim-extension*** type:

```xml
<ms:DimensionList xmlns:ms="http://geo-solutions.it/mapstore/context">
    <ms:Dimension xmlns:ms="http://geo-solutions.it/mapstore/context" xmlns:xlink="http://www.w3.org/1999/xlink" name="time" type="multidim-extension" xlink:type="simple" xlink:href="https://cloudsdi.geo-solutions.it/geoserver/gwc/service/wmts"/>
</ms:DimensionList>
```

Note, that during the exporting process, some sort of fallback for dimensions, listed as extensions, is provided inside the standard
`DimensionList` tag whenever possible, to ensure interoperability with other geospatial software. When such a context is
imported back into MapStore, the values of dimensions inside extensions will override the ones specified inside the standard
`DimensionList` tag.

Also note, that the extension elements would be read correctly only if they belong to appropriate XML namespaces:

- `http://openlayers.org/context` for openlayers extensions
- `http://geo-solutions.it/mapstore/context` for mapstore specific extensions

### Usage inside MapTemplates plugin

As stated previously, WMC files can be used as map templates inside contexts. New WMC templates can be uploaded in context creation tool,
after enabling the MapTemplates plugin for a context. When the context is loaded, for every template inside MapTemplates there are
two options available:

- `Replace map with this template` replace the currently loaded map with the one described by the template. Upon loading,
the map will zoom to the extent specified in `maxExtent` extension or in `BoundingBox` tag. If the template has no
visible background layers available, the default empty background will be added and set to be visible automatically.
- `Add this template to map` merges layers and groups inside the template with the current map configuration. If the WMC template does
not contain `GroupList` extension, a new group with the name extracted from `Title` tag of the template
will be created and will contain all the layers of the template. Zoom and projection will remain unchanged.

### Other considerations

Due to the limitations posed by WMC format the conversion process will not preserve the map state in it's entirety. The only supported way
to do this is to export to MapStore JSON format. The WMC export option presumably should be used in cases when the WMS layers inside
a MapStore map need to be used in some way with a different geospatial software suite, or to import such layers from outside
MapStore or if you already have WMC context files that you want to use.
