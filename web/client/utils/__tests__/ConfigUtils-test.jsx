var expect = require('expect');
var ConfigUtils = require('../ConfigUtils');

describe('ConfigUtils', () => {
    afterEach((done) => {
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('convert from legacy and check projection conversion', () => {
        var lconfig = {
            "map": {
                "projection": "EPSG:900913",
                "units": "m",
                "center": [1250000.000000, 5370000.000000],
                "zoom": 5,
                "maxExtent": [
                    -20037508.34, -20037508.34,
                    20037508.34, 20037508.34
                ]
            }
        };

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
});
