# Application configuration

The application will load by default it will load the `localConfig.json`

You can load a custom configuration by passing the `localConfig` argument in query string:

```text
localhost:8081/?localConfig=myConfig#/viewer/openlayers/0
```

The **localConfig** file contains the main information about URLs to load and plugins to load in the various modes.

This is the main structure:

```javascript
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
  // if defined, WMS layer styles localization will be added
  "localizedLayerStyles": {
      // name of the ENV parameter variable that is needed for localization proposes
      "name": "mapstore_language"
  },
  // flag for abandon map edit confirm popup, by default is enabled
  "unsavedMapChangesDialog": false,
  // optional flag to set default coordinate format (decimal, aeronautical)
  "defaultCoordinateFormat": "aeronautical",
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

#### Catalog Tool configuration

Inside defaultState you can set default catalog services adding the following key

```json
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
        "layerOptions": {
          "tileSize": 512
          },
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

```javascript
"ID_CATALOG_SERVICE": {
  "url": "the url pointing to the catalog web service",
  "type": "the type of webservice used. (this need to be consistent with the web service pointed by the url)",
  "title": "the label used for recognizing the catalog service",
  "autoload": "if true, when selected or when catalog panel is opened it will trigger an automatic search of the layers. if false, search must be manually performed."
  "layerOptions": { // optional
      "tileSize": 512 // determine the default tile size for the catalog, valid for WMS and CSW catalogs
  },
}
```

<br>Be careful to use unique IDs
<br>Future implementations will try to detect the type from the url.
<br>newService is used internally as the starting object for an empty service.

<br>

### Measure Tool configuration

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

```javascript
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

#### Annotations Editor configuration

Annotations editor can be configured by setting it's defaultState. It looks like this:

```javascript
"defaultState": {
 ...
  "annotations": {
    "config": {
    "geometryEditorOptions": {
        "measureOptions": {
          "displayUom": "nm"
        }
      },
      "multiGeometry": true,
      "validationErrors": {},
      "defaultPointType": "symbol"
    },
    "format": "aeronautical",
    "defaultTextAnnotation": "New"
  },
```

- **format** - decimal or aeronautical degree for coordinates
- **defaultTextAnnotation** - default text value for text annotations
- **config.geometryEditorOptions** - properties to be passed to CoordinatesEditor of GeometryEditor. For more information refer to the documentation of CoordinatesEditor component
- **config.multiGeometry** - if set to true allows to add more then one geometry to annotations
- **config.defaultPointType** - default point type of marker geometry type. Can be 'marker' or 'symbol'

### projectionDefs configuration

Custom CRS can be configured here, at root level of localConfig.json file. For example:

```javascript
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

```javascript
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
