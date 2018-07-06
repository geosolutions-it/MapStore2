# Application configuration
The application will load by default it will load the `localConfig.js`

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
  // API keys for bing and mapquest services
  "bingApiKey",
  "mapquestApiKey",
  // path to the translation files directory (if different from default)
  "translationsPath",
  // if true, every ajax and mapping request will be authenticated with the configurations if match a rule
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
  },
  // flag for postponing mapstore 2 load time after theme
  "loadAfterTheme": false,
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
  }
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
],
  ```
If you are building your own app, you can choose to create your custom modes or force one of them by passing the `mode` parameter in the query string.

For adding a new locale or configuring currently supported locales, go check [this](internationalization) out.

For configuring plugins, see the [Configuring Plugins Section](plugins-documentation) and the [plugin reference page](./api/plugins)

## Explanation of some config properties
- **loadAfterTheme** is a flag that allows to load mapstore.js after the theme which can be versioned or not(default.css). default is false
- **initialState** is an object that will initialize the state with some default values and this WILL OVERRIDE the initialState imposed by plugins & reducers.

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
<br>For the label you can chose whatever value you want.
<br>For the unit you can chose between:
 - unit length values : ft, m, km, mi, nm standing for feets, meters, kilometers, miles, nautical miles
 - unit area values : sqft, sqm, sqkm, sqmi, sqnm standing for square feets, square meters, square kilometers, square miles, square nautical miles

example:<br>
```
"measurement": {
  "lengthFormula": "vincenty",
  "showLabel": true,
  "uom": {
    "length": {"unit": "m", "label": "m"},
    "area": {"unit": "sqm", "label": "m²"}
  }
}
```
