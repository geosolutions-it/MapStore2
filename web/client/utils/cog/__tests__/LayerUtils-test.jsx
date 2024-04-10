/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { getProjectionFromGeoKeys} from '../LayerUtils';
import expect from 'expect';


describe('COG - LayerUtils', () => {
    beforeEach(done => {
        setTimeout(done);
    });

    afterEach(done => {
        setTimeout(done);
    });
    it('test getProjectionFromGeoKeys', () => {
        expect(getProjectionFromGeoKeys({geoKeys: {ProjectedCSTypeGeoKey: 4326}})).toBe('EPSG:4326');
        expect(getProjectionFromGeoKeys({geoKeys: {GeographicTypeGeoKey: 3857}})).toBe('EPSG:3857');
        expect(getProjectionFromGeoKeys({geoKeys: null})).toBe(null);
        expect(getProjectionFromGeoKeys({geoKeys: {ProjectedCSTypeGeoKey: 32767}})).toBe(null);
    });
});
