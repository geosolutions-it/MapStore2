# Application configuration

The application will load by default it will load the `localConfig.json` which is now stored in the configs\ folder

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
    // When autoDetectCORS is not present or false, the application will use the proxy for all the requests except the ones in the useCORS array.
    // if autoDetectCORS=true, the application will try the CORS request first, than will try to use the proxy if the request fails.
    // note: this parameter is actually not supported by Cesium, that will always use the proxy or the CORS request when in useCORS array.
    "autoDetectCORS": false,
    // if it is an object, the url entry holds the url to the proxy
    "url": "/MapStore2/proxy/?url=",
    // useCORS array contains a list of services that support CORS and so do not need a proxy.
    // if autoDetectCORS is true, this array will be ignored (except for Cesium)
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
    // and a authentication `method` to use (basic, authkey, browserWithCredentials, header)
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
  // optionals misc settings
  "miscSettings": {
      // Use POST requests for each WMS length URL highter than this value.
      "maxURLLength": 5000,
      // Custom path to home page
      "homePath": '/home',
      // If true it enables interactive legend for GeoServer WMS, WFS layers
      "experimentalInteractiveLegend": true
  },
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
  // allows to apply map options configuration to all the Map plugins instances defined in the plugins configuration.
  // The mapOptions in the plugin configuration have priority so they will overrides this global config
  "defaultMapOptions": {
    "openlayers": { ... },
    "leaflet": { ... },
    "cesium": { ... }
  },
  // allow to define the default visualization mode of the app and
  // which 2D or 3D map library should be used based on the device
  // the configuration below is the default one
  // note: this configuration does not support expressions
  "mapType": {
    // the default visualization mode of the app, it could be "2D" or "3D"
    "defaultVisualizationMode": "2D",
    // map library to use based on the visualization mode and device
    // structure -> { visualizationModes: { [visualizationMode]: { [deviceType]: mapLibrary } } }
    "visualizationModes": {
      "2D": {
        "desktop": "openlayers",
        "mobile": "leaflet"
      },
      "3D": {
        "desktop": "cesium",
        "mobile": "cesium"
      }
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

For adding a new locale or configuring currently supported locales, go check [this](internationalization.md#internationalization) out.

For configuring plugins, see the [Configuring Plugins Section](plugins-documentation.md#configuring-plugins) and the [plugin reference page](plugins-architecture.md#plugins-architecture)

## Explanation of some config properties

- `loadAfterTheme`: is a flag that allows to load mapstore.js after the theme which can be versioned or not(default.css). default is false
- `initialState`: is an object that will initialize the state with some default values and this WILL OVERRIDE the initialState imposed by plugins & reducers.
- `projectionDefs`: is an array of objects that contain definitions for Coordinate Reference Systems
- `useAuthenticationRules`: if this flag is set to true, the `authenticationRules` will be used to authenticate every ajax and mapping request. If the flag is set to false, the `authenticationRules` will be ignored.
- `authenticationRules`: is an array of objects that contain rules to match for authentication. Each rule has a `urlPattern` regex to match and a `method` to use (`basic`, `authkey`, `header`, `browserWithCredentials`). If the URL of a request matches the `urlPattern` of a rule, the `method` will be used to authenticate the request. The `method` can be:
  - `basic` will use the basic authentication method getting the credentials from the user that logged in (adding the header `Authorization` `Basic <base64(username:password)>` to the request). ***Note**: this method is not implemented for image tile requests (e.g. layers) but only for ajax requests.*
  - `authkey` will use the authkey method getting the credentials from the user that logged in. The token of the current MapStore session will be used as the authkey value, so this works only with the geoserver integration.
  - `bearer` will use the header `Authorization` `Bearer <token>` getting the credentials from the user that logged in. The token of the current MapStore session will be used as the bearer value, so this works only with the geoserver integration.
  - `header` will use the header method getting the credentials from the user that logged in. You can add an `headers` object containing the static headers to this rule to specify witch headers to use. e.g.
  - `browserWithCredentials` will add the `withCredentials` parameter to ajax requests, so the browser will send the cookies and the authentication headers to the server. This method is useful when you have a proxy that needs to authenticate the user. ***Note**: this method is not implemented for image tile requests (e.g. layers) but only for ajax requests.*

  ```json
    {
        "urlPattern": ".*geostore.*",
        "method": "header",
        "headers": {
            "X-Auth-Token": "mytoken"
        }
    }
    ```

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
      "editable": true,
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
          "format": "image/png8"
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
  "readOnly": "if true, makes the service not editable from catalog plugin"
  "titleMsgId": "optional, string used to localize the title of the service, the string must be present in translations",
  "format": "image/png8" // the image format to use by default for layers coming from this catalog (or tiles).
  "layerOptions": { // optional
      "format": "image/png8", // image format needs to be configured also inside layerOptions
      "serverType": "geoserver or no-vendor, depending on this some geoserver vendor extensions will be used for WMS requests.",
      "tileSize": 512 // determine the default tile size for the catalog, valid for WMS and CSW catalogs
  },
  "filter": { // applicable only for CSW service
      "staticFilter": "filter is always applied, even when search text is NOT PRESENT",
      "dynamicFilter": "filter is used when search text is PRESENT and is applied in `AND` with staticFilter. The template is used with ${searchText} placeholder to append search string"
  },
  "fetchMetadata": true, // "if true, the metadata is fetched for the service, applicable only for COG service
  "records": [{ // array of the COG layers of the service, applicable only for COG service
    "sourceMetadata": "metadata of the COG layer",
    "bbox": "bbox formulated for the COG layer",
    "url": "the url pointing to the COG layer data"
  }]
}
```

CSW service
<br> `filter` - For both static and dynamic filter, input only xml element contained within <ogc:Filter> (i.e. Do not enclose the filter value in <ogc:Filter>)<br>
<br>Example:<br>

```javascript
{
    "filter": { // Default filter values
        "staticFilter": "<ogc:Or><ogc:PropertyIsEqualTo><ogc:PropertyName>dc:type</ogc:PropertyName><ogc:Literal>dataset</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsEqualTo><ogc:PropertyName>dc:type</ogc:PropertyName><ogc:Literal>http://purl.org/dc/dcmitype/Dataset</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Or>",
        "dynamicFilter": "<ogc:PropertyIsLike wildCard='%' singleChar='_' escapeChar='\\'><ogc:PropertyName>csw:AnyText</ogc:PropertyName><ogc:Literal>%${searchText}%</ogc:Literal></ogc:PropertyIsLike>"
    }
}
```

COG service
<br> `fetchMetadata` - By default, the metadata is fetched on saving the COG service for each layer (url) configured<br>
<br> `records` -  Records of the COG layer <br>
<br>Example:<br>

```javascript
{
    "fetchMetadata": true,
    "records": [{
        "url": "https://example.tif",
        "sourceMetadata": {
            "crs": "EPSG:32632",
            "extent": [463560, 5758030, 469410, 5767210],
            "height": 900,
            "width": 500,
            "tileWidth": 256,
            "tileHeight": 256,
            "origin": [463560, 5767210, 0],
            "resolution": [10, -10, 0]
        },
        "bbox": {
            "crs": "EPSG:32632"
            "bounds": {minx: 463560, miny: 5758030, maxx: 469410, maxy: 5767210}
        }
    }]
}
```

<br>Be careful to use unique IDs
<br>Future implementations will try to detect the type from the url.
<br>newService is used internally as the starting object for an empty service.

<br>

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

### Search plugin configuration

The search plugin provides several configurations to customize the services behind the search bar in the map:

- Allow to configure more many services to use in parallel, in the `services` array.
- Natively supports nominatim and WFS protcols
- Allows to register **your own** custom services to develop and use in your custom project
- Allows to configure services in cascade, typically when you have a hierarchical data structures ( e.g. search for municipality, then for street name, than for house number, or search state,then region, then specific feature, and so on...)

Following you can find some examples of the various configurations. For more details about the properties, please check to plugin API documentation: [https://mapstore.geosolutionsgroup.com/mapstore/docs/api/plugins#plugins.Search](https://mapstore.geosolutionsgroup.com/mapstore/docs/api/plugins#plugins.Search)

Nominatim configuration:

```javascript
{
   "type": "nominatim",
   "searchTextTemplate": "${properties.display_name}", // text to use as searchText when an item is selected. Gets the result properties.
   "options": {
     "polygon_geojson": 1,
     "limit": 3
}
```

WFS configuration:

```javascript
"plugins": {
  ...
  "desktop": [
    ...}, {
      "name": "Search",
      "cfg": {
        "showCoordinatesSearchOption": false,
        "maxResults": 20,
        "searchOptions": {
          "services": [{
            "type": "wfs",
            "priority": 3,
            "displayName": "${properties.propToDisplay}",
            "subTitle": " (a subtitle for the results coming from this service [ can contain expressions like ${properties.propForSubtitle}])",
            "options": {
              "url": "/geoserver/wfs",
              "typeName": "workspace:layer",
              "queriableAttributes": ["attribute_to_query"],
              "sortBy": "id",
              "srsName": "EPSG:4326",
              "maxFeatures": 20,
              "blacklist": ["... an array of strings to exclude from the final search filter "]
            }
        ]
        }
      }
    }, {
  ]
}
```

WFS configuration with nested services:

```javascript
"plugins": {
  ...
  "desktop": [
    ...}, {
      "name": "Search",
      "cfg": {
        "showCoordinatesSearchOption": false,
        "maxResults": 20,
        "searchOptions": {
          "services": [{
            "type": "wfs",
            "priority": 3,
            "displayName": "${properties.propToDisplay}",
            "subTitle": " (a subtitle for the results coming from this service [ can contain expressions like ${properties.propForSubtitle}])",
            "options": {
              "url": "/geoserver/wfs",
              "typeName": "workspace:layer",
              "queriableAttributes": ["attribute_to_query"],
              "sortBy": "id",
              "srsName": "EPSG:4326",
              "maxFeatures": 20,
              "blacklist": ["... an array of strings to exclude from the final search filter "]
            },

            "nestedPlaceholder": "the placeholder will be displayed in the input text, after you have performed the first search",
            "then": [{
              "type": "wfs",
              "priority": 1,
              "displayName": "${properties.propToDisplay} ${properties.propToDisplay}",
              "subTitle": " (a subtitle for the results coming from this service [ can contain expressions like ${properties.propForSubtitle}])",
              "searchTextTemplate": "${properties.propToDisplay}",
              "options": {
                "staticFilter": " AND SOMEPROP = '${properties.OLDPROP}'", // will be appended to the original filter, it gets the properties of the current selected item (of the parent service)
                "url": "/geoserver/wfs",
                "typeName": "workspace:layer",
                "queriableAttributes": ["attribute_to_query"],
                "srsName": "EPSG:4326",
                  "maxFeatures": 10
                }
            }]
  }

        ]
        }
      }
    }, {
  ]
}
```

Custom services configuration:

```javascript
{
  "type": "custom Service Name",
  "searchTextTemplate": "${properties.propToDisplay}",
  "displayName": "${properties.propToDisplay}",
  "subTitle": " (a subtitle for the results coming from this service [ can contain expressions like ${properties.propForSubtitle}])",
  "options": {
    "pathname": "/path/to/service",
    "idVia": "${properties.code}"
  },
  "priority": 2,
  "geomService" : {
    "type": "wfs",
    "options": {
      "url": "/geoserver/wfs",
      "typeName":  "workspace:layer",
      "srsName": "EPSG:4326",
      "staticFilter": "ID = ${properties.code}"
    }
  }
}
```
