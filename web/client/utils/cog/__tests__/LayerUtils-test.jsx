/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { getProjectionFromGeoKeys, isCOGCrsNotIdentified, isGlobalCOG } from '../LayerUtils';
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
    it('test isGlobalCOG', () => {
        expect(isGlobalCOG({ crs: 'EPSG:4326', extent: [-180, -90, 180, 90], width: 3600 })).toBe(true);
        expect(isGlobalCOG({ crs: 'EPSG:4326', extent: [-179.95, -89.95, 179.95, 89.95], width: 3600 })).toBe(true);
        expect(isGlobalCOG({ crs: 'EPSG:4326', extent: [-179, -90, 179, 90], width: 3600 })).toBe(false);
        expect(isGlobalCOG({ crs: 'EPSG:3857', extent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34], width: 4096 })).toBe(true);
        expect(isGlobalCOG({ crs: 'EPSG:4326', extent: [6, 36, 19, 47], width: 1300 })).toBe(false);
        expect(isGlobalCOG({ crs: 'EPSG:99999', extent: [-180, -90, 180, 90], width: 3600 })).toBe(false);
        expect(isGlobalCOG(undefined)).toBe(false);
    });
});
