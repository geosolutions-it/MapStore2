/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const {boundsToOLExtent, fromLeafletFeatureToQueryform} = require('../DrawSupportUtils');
const L = require('leaflet');

describe('LocaleUtils', () => {
    it('test fromLeafletFeatureToQueryform', () => {
        const latlngs = [[37, -109.05], [41, -109.03], [41, -102.05], [37, -102.04]];
        const features = [{
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [latlngs]
            }
        }];
        const testBounds = [37, -109.05, 41, -102.04];
        const layer = L.geoJson(features, {});
        expect(layer).toExist();
        const feature = fromLeafletFeatureToQueryform(layer);
        expect(feature).toExist();
        expect(feature.type).toBe("Polygon");
        expect(feature.coordinates.length).toBe(1);
        expect(feature.coordinates[0].length).toBe(5);
        expect(feature.extent.length).toBe(4);
        feature.extent.forEach((e, i) => {
            expect(e).toBe(testBounds[i]);
        });
        const bounds = L.latLngBounds([[testBounds[0], testBounds[1]], [testBounds[2], testBounds[3]]]);
        const center = bounds.getCenter();
        expect(center.lat).toBe(39);
        expect(center.lng).toBe(-105.545);
    });

    it('test boundsToOLExtent', () => {
        const bounds = L.latLngBounds([[1, 2], [3, 4]]);
        const convertedBounds = boundsToOLExtent(bounds);
        expect(convertedBounds.length).toBe(4);
    });
});
