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
  // the athentication rules to match
  "authenticationRules": [
  { // every rule has a `urlPattern` regex to match
    "urlPattern": ".*geostore.*",
    // and a authentication `method` to use (basic, authkey)
    "method": "basic"
  }, {
    "urlPattern": "\\/geoserver.*",
    "method": "authkey"
  },
  // optional state initializer (it will override the one defined in appConfig.js)
  "initialState": {
      // default initial state for every mode (will override initialState imposed by plugins reducers)
      "defaultState": {
          ...
      },
      // mobile override (defined properties will overide default in mobile mode)
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

For configuring plugins, see the [Configuring Plugins Section](plugins-documentation) and the [plugin reference page](./api/plugins)
