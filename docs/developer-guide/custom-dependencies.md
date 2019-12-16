# Custom Dependencies
Mapstore has some custom dependencies in order to fix bugs yet not integrated in the official libraries

Here is a list of customizations:

| library | version | issue | reason | github |
|---|---|---|---|---|
| wkt-parser | 1.2.1 | #2175 | Did not recognize switched axis projections. For this reason we customized it with "@geosolutions@wkt-parser 1.2.2" | https://github.com/geosolutions-it/wkt-parser/tree/release |
| proj4 | 2.4.5-alpha | #2175 | is fake to force dependency of wkt-parser, for this reason we customized it with "@geosolutions@proj4 2.4.6" | https://github.com/geosolutions-it/proj4js/tree/release_2.4.6 |
| react-joyride | 1.10.1 |  | is a re-publish on npm of a fix made [here](https://github.com/ddeath/react-joyride/tree/fixed-positioning-and-overlay) , we therefore are using "@geosolutions@react-joyride 1.10.2" | https://github.com/geosolutions-it/react-joyride/tree/release |
| mocha | 6.2.0-uncaught | #3693 | We customized this in order to make some test to run. Especially we removed uncaught exceptions handler, so that tests are not blocked because of that. we published "@geosolutions/mocha 6.2.1-3" | https://github.com/geosolutions-it/mocha/tree/release_v6.2.1 |
| jsdoc | 3.4.3 | #1978 | ES6 syntax not parsed by Docma, so we published "@geosolutions/jsdoc 3.4.4" with other related dependencies also on our npm, like acorn-jsx, espree and tv4 | https://github.com/geosolutions-it/jsdoc/tree/release |
| acorn-jsx | 4.0.1 | #1978 | Added support for instance properties (e.g. state), we published "@geosolutions/acorn-jsx 4.0.2" | https://github.com/geosolutions-it/acorn-jsx/tree/release |


[Here](https://github.com/geosolutions-it/MapStore2/issues/4569) you can find more information about customization

