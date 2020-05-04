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
                "url": "https://demo.geo-solutions.it/geoserver/wms"
            },
            "demo2": {
                "url": "https://demo.geo-solutions.it/geoserver/wms?params"
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
            }, {
                "source": "demo2",
                "visibility": true,
                "opacity": 0.5,
                "title": "Weather data 2",
                "name": "nurc:Arc_Sample2",
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
        ConfigUtils.setConfigProp("configurationFolder", "");
        ConfigUtils.setLocalConfigurationFile("localConfig.json");
        setTimeout(done);
    });
    it('convert from legacy and check projection conversion', () => {
        var config = ConfigUtils.convertFromLegacy(lconfig);
        // check zoom
        expect(config.map.zoom).toBe(5);
        // check lat-lng in 4326
        expect(config.map.center.x).toBeA('number');
        expect(config.map.center.y).toBeA('number');
        expect(config.map.center.x).toBeLessThan(90);
        expect(config.map.center.x).toBeGreaterThan(-90);
        expect(config.map.center.y).toBeLessThan(180);
        expect(config.map.center.y).toBeGreaterThan(-180);
        expect(config.map.center.crs).toBe("EPSG:4326");
    });

    it('convert from legacy and check url normalization', () => {
        var config = ConfigUtils.convertFromLegacy(lconfig);
        const layers = config.layers.filter((layer) => layer.name === "nurc:Arc_Sample2");
        expect(layers.length).toBe(1);
        expect(layers[0].url).toBe("https://demo.geo-solutions.it/geoserver/wms");
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

    it('getCenter', () => {
        var center = ConfigUtils.getCenter([13, 43]);
        expect(center).toExist();
        expect(center.y).toBe(43);
        expect(center.x).toBe(13);
        expect(center.crs).toBe('EPSG:4326');

        center = ConfigUtils.getCenter([13, 43], 'EPSG:4326');
        expect(center).toExist();
        expect(center.y).toBe(43);
        expect(center.x).toBe(13);
        expect(center.crs).toBe('EPSG:4326');

        center = ConfigUtils.getCenter({y: 43, x: 13, crs: 'EPSG:4326'});
        expect(center).toExist();
        expect(center.y).toBe(43);
        expect(center.x).toBe(13);
        expect(center.crs).toBe('EPSG:4326');

        center = ConfigUtils.getCenter({y: 4786738, x: 1459732, crs: 'EPSG:900913'});
        expect(center).toExist();
        expect(center.y).toExist();
        expect(center.x).toExist();
        expect(center.crs).toBe('EPSG:4326');
        expect(Math.round(center.x)).toBe(13);
        expect(Math.round(center.y)).toBe(39);

        center = ConfigUtils.getCenter([1459732, 4786738], 'EPSG:900913');
        expect(center).toExist();
        expect(center.y).toExist();
        expect(center.x).toExist();
        expect(center.crs).toBe('EPSG:4326');
        expect(Math.round(center.x)).toBe(13);
        expect(Math.round(center.y)).toBe(39);
    });

    it('getConfigurationOptions uses configurationFolder as prefix of configuration files', () => {
        ConfigUtils.setConfigProp("configurationFolder", "myfolder/");
        const retval = ConfigUtils.getConfigurationOptions({});
        expect(retval).toExist();
        expect(retval.configUrl).toExist();
        expect(retval.configUrl).toBe('myfolder/config.json');
    });

    it('getConfigurationOptions', () => {
        var retval = ConfigUtils.getConfigurationOptions({});
        expect(retval).toExist();
        expect(retval.configUrl).toExist();
        expect(retval.configUrl).toBe('config.json');

        retval = ConfigUtils.getConfigurationOptions({}, 'name', 'extension');
        expect(retval).toExist();
        expect(retval.configUrl).toExist();
        expect(retval.configUrl).toBe('name.extension');

        retval = ConfigUtils.getConfigurationOptions({}, 'name');
        expect(retval).toExist();
        expect(retval.configUrl).toExist();
        expect(retval.configUrl).toBe('name.json');

        retval = ConfigUtils.getConfigurationOptions({}, undefined, 'extension');
        expect(retval).toExist();
        expect(retval.configUrl).toExist();
        expect(retval.configUrl).toBe('config.extension');

        retval = ConfigUtils.getConfigurationOptions({
            mapId: 42
        });
        expect(retval).toExist();
        expect(retval.configUrl).toExist();
        expect(retval.configUrl).toBe('/rest/geostore/data/42');

        retval = ConfigUtils.getConfigurationOptions({
            mapId: 42
        }, undefined, undefined, 'gbase/');
        expect(retval).toExist();
        expect(retval.configUrl).toExist();
        expect(retval.configUrl).toBe('gbase/data/42');
    });

    it('getUserConfiguration', () => {
        const testval = ConfigUtils.getConfigurationOptions({});
        const retval = ConfigUtils.getUserConfiguration();
        expect(retval).toExist();
        expect(retval.configUrl).toBe(testval.configUrl);
        expect(retval.legacy).toBe(testval.legacy);
    });
    it('getParsedUrl with valid url ending with wfs', () => {
        const url = "http://somepath/wfs";
        const testval = "http://somepath/wps?service=WPS";
        const retval = ConfigUtils.getParsedUrl(url, {});
        expect(retval).toExist();
        expect(retval).toBe(testval);
    });
    it('getParsedUrl with valid url ending with asd return null', () => {
        const url = "http://somepath/asd";
        const retval = ConfigUtils.getParsedUrl(url, {});
        expect(retval).toBe(null);
    });
    it('getParsedUrl with not valid url', () => {
        const url = null;
        const retval = ConfigUtils.getParsedUrl(url, {});
        expect(retval).toBe(null);
    });

    it('loadConfiguration', (done) => {
        var retval = ConfigUtils.loadConfiguration();
        expect(retval).toExist();
        done();
    });

    it("loadConfiguration returns a copied config", done => {
        var retval = ConfigUtils.loadConfiguration();
        expect(retval).toExist();
        retval.newProperty = 'newValue';
        expect(ConfigUtils.getDefaults().newProperty).toNotExist();
        done();
    });

    it("loadConfiguration returns a copied config as a promise", done => {
        ConfigUtils.setLocalConfigurationFile("");
        ConfigUtils.loadConfiguration().then((retval) => {
            expect(retval).toExist();
            retval.newProperty = "newValue";
            expect(ConfigUtils.getDefaults().newProperty).toNotExist();
            done();
        });
    });

    it("getDefaults returns a copied config", done => {
        var retval = ConfigUtils.getDefaults();
        expect(retval).toExist();
        retval.newProperty = "newValue";
        expect(ConfigUtils.getDefaults().newProperty).toNotExist();
        done();
    });

    it('placeholders', () => {
        const layer = ConfigUtils.setUrlPlaceholders({url: '{proxyUrl}'});
        expect(layer.url).toBe(ConfigUtils.getConfigProp('proxyUrl'));
    });

    it('multiple placeholders', () => {
        const layer = ConfigUtils.setUrlPlaceholders({url: '{proxyUrl}{proxyUrl}'});
        expect(layer.url).toBe(ConfigUtils.getConfigProp('proxyUrl') + ConfigUtils.getConfigProp('proxyUrl'));
    });

    it('placeholders in array', () => {
        const layer = ConfigUtils.setUrlPlaceholders({url: ['{proxyUrl}', '{proxyUrl}']});
        expect(layer.url.length).toBe(2);
        expect(layer.url[0]).toBe(ConfigUtils.getConfigProp('proxyUrl'));
        expect(layer.url[1]).toBe(ConfigUtils.getConfigProp('proxyUrl'));
    });

    it('proxied url', () => {
        expect(ConfigUtils.getProxiedUrl('http://remote.url')).toBe(ConfigUtils.getConfigProp('proxyUrl') + encodeURIComponent('http://remote.url'));
        expect(ConfigUtils.getProxiedUrl('http://remote.cors', {
            proxyUrl: {
                url: 'myproxy',
                useCORS: ['http://remote.cors']
            }
        })).toBe('http://remote.cors');
    });

    it('config prop', () => {
        ConfigUtils.setConfigProp('testProperty', 'testValue');
        expect(ConfigUtils.getConfigProp('testProperty')).toBe('testValue');
    });

    it('remove config prop', () => {
        ConfigUtils.setConfigProp('testProperty', 'testValue');
        expect(ConfigUtils.getConfigProp('testProperty')).toBe('testValue');
        ConfigUtils.removeConfigProp('testProperty');
        expect(ConfigUtils.getConfigProp('testProperty')).toNotExist();
    });

    it('testing cleanDuplicatedQuestionMarks', () => {
        const urlDoubleQuestionMark = "http.../wms?authkey=...?service=...&otherparam";
        const match = "http.../wms?authkey=...&service=...&otherparam";
        const noQuestionMark = "http.../wmsauthkey=...&service=...&otherparam";
        // with 2 ? it returns the cleanDuplicatedQuestionMarks
        let normalizedUrl = ConfigUtils.cleanDuplicatedQuestionMarks(urlDoubleQuestionMark);
        expect(normalizedUrl).toBe(match);
        // with 1 ? it returns the url passed as argument
        let normalizedUrl2 = ConfigUtils.cleanDuplicatedQuestionMarks(match);
        expect(normalizedUrl2).toBe(match);
        // with 0 ? it returns the url passed as argument
        let normalizedUrl3 = ConfigUtils.cleanDuplicatedQuestionMarks(noQuestionMark);
        expect(normalizedUrl3).toBe(noQuestionMark);
    });
    it('getUrlWithoutParameters from a normalized url with single ?', () => {
        const match = "http://somesite.com/geoserver/wms?authkey=someautkeyvalue&service=WMS&otherparam=OTHERVALUE";
        let shrinkedUrl = ConfigUtils.getUrlWithoutParameters(match, ["authkey"]);
        expect(shrinkedUrl).toBe("http://somesite.com/geoserver/wms?service=WMS&otherparam=OTHERVALUE");
    });
    it('getUrlWithoutParameters from a normalized url with double ??', () => {
        const match = "http://somesite.com/geoserver/wms??authkey=someautkeyvalue&service=WMS&otherparam=OTHERVALUE";
        let shrinkedUrl = ConfigUtils.getUrlWithoutParameters(match, ["authkey"]);
        expect(shrinkedUrl).toBe("http://somesite.com/geoserver/wms?service=WMS&otherparam=OTHERVALUE");
    });
    it('getUrlWithoutParameters from a normalized url without passing params ', () => {
        const match = "http://somesite.com/geoserver/wms?authkey=someautkeyvalue&service=WMS&otherparam=OTHERVALUE";
        let shrinkedUrl = ConfigUtils.getUrlWithoutParameters(match, []);
        expect(shrinkedUrl).toBe(match);
    });
    it('getUrlWithoutParameters from a normalized url, removing all the params ', () => {
        const match = "http://somesite.com/geoserver/wms?authkey=someautkeyvalue&service=WMS&otherparam=OTHERVALUE";
        let shrinkedUrl = ConfigUtils.getUrlWithoutParameters(match, ["authkey", "service", "otherparam"]);
        expect(shrinkedUrl).toBe("http://somesite.com/geoserver/wms");
    });
    it('filterUrlParams with normalized url', () => {
        const match = "http://somesite.com/geoserver/wms?authkey=someautkeyvalue&service=WMS&otherparam=OTHERVALUE";
        let shrinkedUrl = ConfigUtils.filterUrlParams(match, ["authkey", "service", "otherparam"]);
        expect(shrinkedUrl).toBe("http://somesite.com/geoserver/wms");
    });
    it('filterUrlParams with non normalized url', () => {
        const match = "http://somesite.com/geoserver/wms?authkey=someautkeyvalue?service=WMS&otherparam=OTHERVALUE";
        let shrinkedUrl = ConfigUtils.filterUrlParams(match, ["authkey", "service", "otherparam"]);
        expect(shrinkedUrl).toBe("http://somesite.com/geoserver/wms");
    });
    it('filterUrlParams with empty string as url', () => {
        const match = "";
        let shrinkedUrl = ConfigUtils.filterUrlParams(match, ["authkey", "service", "otherparam"]);
        expect(shrinkedUrl).toBe(null);
    });
    it('replacePlaceholders', () => {
        ConfigUtils.setConfigProp("TEST_PLACEHOLDER", "MY_URL_PARAM");
        expect(ConfigUtils.replacePlaceholders("{TEST_PLACEHOLDER}")).toBe("MY_URL_PARAM");
        // do not replace parameters that do not exist (some URL templates should not be replaced)
        expect(ConfigUtils.replacePlaceholders("{OTHER_PLACEHOLDER}")).toBe("{OTHER_PLACEHOLDER}");
    });

});
