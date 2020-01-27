# Custom Dependencies

Mapstore has some custom dependencies in order to fix bugs not integrated in the official libraries yet.
All these customized libraries are available on npm registry.

Here is a list of customizations:

| library | version | issue | reason | github |
|---|---|---|---|---|
| wkt-parser | 1.2.1 | #2175 | Fixes axis order recognition. For this reason we customized it with "@geosolutions@wkt-parser 1.2.2" | https://github.com/geosolutions-it/wkt-parser/tree/release |
| proj4 | 2.4.5-alpha | #2175 | Fixes axis order recognition. For this reason we customized it with "@geosolutions@proj4 2.4.6" and its wkt-parser dependency with "@geosolutions@wkt-parser 1.2.2". Note that shpjs will use this customized version of proj4 and wkt-parser | https://github.com/geosolutions-it/proj4js/tree/release_2.4.6 |
| react-joyride | 1.10.1 |  | is a re-publish on npm of a fix made [here](https://github.com/ddeath/react-joyride/tree/fixed-positioning-and-overlay) , we therefore are using "@geosolutions@react-joyride 1.10.2" | https://github.com/geosolutions-it/react-joyride/tree/release |
| mocha | 6.2.0-uncaught | #3693 | Customized in order to make some test run. More in detail, we removed uncaught exceptions handler because it was making some test failing (waiting for a better solution). Published "@geosolutions/mocha 6.2.1-3". mocha is being moved from node_modules/@geosolutions/mocha to node_modules/mocha in order to make the test be runnable | https://github.com/geosolutions-it/mocha/tree/release_v6.2.1 |
| jsdoc | 3.4.3 | #1978 | ES6 syntax not parsed by Docma, so we published "@geosolutions/jsdoc 3.4.4" with other related dependencies also on our npm, like acorn-jsx, espree and tv4 | https://github.com/geosolutions-it/jsdoc/tree/release |
| acorn-jsx | 4.0.1 | #1978 | Added support for instance properties (e.g. state), we published "@geosolutions/acorn-jsx 4.0.2" | https://github.com/geosolutions-it/acorn-jsx/tree/release |

## Aliases

Only proj4 and react-joyride are using aliases in order to maintain original webpack requires like:

- const proj4 = require("proj4");
- const joyride = require('react-joyride').default;

see [this](https://github.com/geosolutions-it/MapStore2/blob/master/build/buildConfig.js#L82) for current status of aliases

## More info

[Here](https://github.com/geosolutions-it/MapStore2/issues/4569) you can find more information about customization
