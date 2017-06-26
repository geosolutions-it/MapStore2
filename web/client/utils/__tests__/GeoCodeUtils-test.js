/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');
var GeoCodeUtils = require('../GeoCodeUtils');


describe('GeoCodeUtils', () => {
    beforeEach( () => {

    });
    afterEach((done) => {
        document.body.innerHTML = '';

        setTimeout(done);
    });
    it('test nominatimToGeoJson', () => {
        let testNominatim = [{
            "place_id": "45650715",
            "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http:\/\/www.openstreetmap.org\/copyright",
            "osm_type": "node",
            "osm_id": "3235562176",
            "boundingbox": [
                "33.8230805",
                "33.8231805",
                "-84.3109113",
                "-84.3108113"
            ],
            "lat": "33.8231305",
            "lon": "-84.3108613",
            "display_name": "Test, DeKalb County, Georgia, United States of America",
            "class": "waterway",
            "type": "yes",
            "importance": 0.425,
            "geojson": {
                "type": "Point",
                "coordinates": [-84.3108613, 33.8231305]
            }
        }];
        let layer = GeoCodeUtils.nominatimToLayer("test", testNominatim);
        expect(layer).toExist();
        expect(layer.name).toBe("test");
        expect(layer.features).toExist();
        expect(layer.features.length).toBe(1);
        expect(layer.features[0].properties.display_name).toBe(testNominatim[0].display_name);
    });

});
