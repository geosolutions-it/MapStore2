/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');
var ConfigUtils = require('../ConfigUtils');
var lconfig = {
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
describe('ConfigUtils', () => {
    afterEach((done) => {
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('convert from legacy and check projection conversion', () => {
        var config = ConfigUtils.convertFromLegacy(lconfig);
        // check zoom
        expect(config.zoom).toBe(5);
        // check lat-lng in 4326
        expect(config.latLng.lat).toBeA('number');
        expect(config.latLng.lng).toBeA('number');
        expect(config.latLng.lat).toBeLessThan(90);
        expect(config.latLng.lat).toBeGreaterThan(-90);
        expect(config.latLng.lng).toBeLessThan(180);
        expect(config.latLng.lng).toBeGreaterThan(-180);
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
});
