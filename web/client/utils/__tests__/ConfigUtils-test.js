/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');
var ConfigUtils = require('../ConfigUtils');
var lconfig = {};
var testMap = {
   "defaultSourceType": "gxp_wmssource",
   "map": {
      "center": [
         1361886.8627049,
         5723464.1181097
      ],
      "extent": [
         -2.003750834E7,
         -2.003750834E7,
         2.003750834E7,
         2.003750834E7
      ],
      "zoom": 10,
      "layers": [
         {
            "title": "c1101031_iba",
            "source": "gxp-source-508",
            "visibility": true,
            "name": "cite:c1101031_iba",
            "opacity": 1
         }
      ],
      "projection": "EPSG:900913",
      "units": "m"
   },
   "sources": {
      "gxp-source-508": {
         "projection": "EPSG:900913",
         "url": "http://test.org"
      }

   }
};
function resetLConfig() {
    lconfig = {
        "gsSources": {
            "mapquest": {
                "ptype": "gxp_mapquestsource"
            },
            "osm": {
                "ptype": "gxp_osmsource"
            },
            "google": {
                "ptype": "gxp_googlesource"
            },
            "bing": {
                "ptype": "gxp_bingsource"
            },
            "ol": {
                "ptype": "gxp_olsource"
            },
            "demo": {
                "url": "http://demo.geo-solutions.it/geoserver/wms"
            }
        },
        "map": {
            "projection": "EPSG:900913",
            "units": "m",
            "center": [1250000.000000, 5370000.000000],
            "zoom": 5,
            "maxExtent": [
                -20037508.34, -20037508.34,
                20037508.34, 20037508.34
            ],
            "layers": [{
                    "source": "google",
                    "title": "Google Hybrid",
                    "name": "HYBRID",
                    "group": "background"
                }, {
                    "source": "mapquest",
                    "title": "MapQuest OpenStreetMap",
                    "name": "osm",
                    "group": "background"
                }, {
                    "source": "osm",
                    "title": "Open Street Map",
                    "name": "mapnik",
                    "group": "background",
                    "visibility": true // this should be replaced with false
                }, {
                    "source": "osm",
                    "title": "Open Street Map",
                    "name": "mapnik",
                    "group": "background",
                    "visibility": true
                }, {
                    "source": "demo",
                    "visibility": true,
                    "opacity": 0.5,
                    "title": "Weather data",
                    "name": "nurc:Arc_Sample",
                    "group": "Meteo",
                    "format": "image/png"
                }]
        }
    };
}
describe('ConfigUtils', () => {
    beforeEach( () => {
        resetLConfig();
    });
    afterEach((done) => {
        document.body.innerHTML = '';

        setTimeout(done);
    });
    it('convert from legacy and check projection conversion', () => {
        var config = ConfigUtils.convertFromLegacy(lconfig);
        // check zoom
        expect(config.zoom).toBe(5);
        // check lat-lng in 4326
        expect(config.center.x).toBeA('number');
        expect(config.center.y).toBeA('number');
        expect(config.center.x).toBeLessThan(90);
        expect(config.center.x).toBeGreaterThan(-90);
        expect(config.center.y).toBeLessThan(180);
        expect(config.center.y).toBeGreaterThan(-180);
        expect(config.center.crs).toBe("EPSG:4326");
    });
    it('check sources default values assigned', () => {
        var config = ConfigUtils.convertFromLegacy(lconfig);
        // check sources types
        for (let source in config.sources) {
            if (config.sources.hasOwnProperty(source)) {
                let sourceObj = config.sources[source];
                expect(sourceObj.ptype).toBeA('string');
            }
        }
    });

    it('check background layer assignment', () => {
        var config = ConfigUtils.convertFromLegacy(lconfig);

        // check background layer visibility
        expect(config.layers[0].visibility).toBe(false);
        expect(config.layers[1].visibility).toBe(false);
        expect(config.layers[2].visibility).toBe(false);
        expect(config.layers[3].visibility).toBe(true);
        expect(config.layers[4].visibility).toBe(true);
    });

    it('check merge config', () => {
        var config = ConfigUtils.mergeConfigs(lconfig, testMap);
        // check layers replaced
        expect(config.map.layers.length).toBe(1);
        expect(config.gsSources["gxp-source-508"]).toExist();
    });
});
