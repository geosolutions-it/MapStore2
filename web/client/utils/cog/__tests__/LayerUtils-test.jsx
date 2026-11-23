/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { getProjectionFromGeoKeys, isCOGCrsNotIdentified } from '../LayerUtils';
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
    it('test isCOGCrsNotIdentified', () => {
        // metadata read but crs not identified (user custom GeoKeys = 32767)
        expect(isCOGCrsNotIdentified({sourceMetadata: {crs: null}})).toBe(true);
        expect(isCOGCrsNotIdentified({sourceMetadata: {}})).toBe(true);
        // crs identified
        expect(isCOGCrsNotIdentified({sourceMetadata: {crs: 'EPSG:3004'}})).toBe(false);
        // metadata not fetched
        expect(isCOGCrsNotIdentified({})).toBe(false);
        expect(isCOGCrsNotIdentified(undefined)).toBe(false);
    });
});
