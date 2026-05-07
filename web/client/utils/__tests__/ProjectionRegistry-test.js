/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { register, getByCode, getAll, registerAll, onRegister, isRegistered, unRegister, unRegisterAll } from '../ProjectionRegistry';

const crs3003proj4 = {
    "code": "EPSG:3003",
    "def": "+proj=tmerc +lat_0=0 +lon_0=9 +k=0.9996 +x_0=1500000 +y_0=0 +ellps=intl+towgs84=-104.1,-49.1,-9.9,0.971,-2.917,0.714,-11.68 +units=m +no_defs",
    "extent": [1241482.0019, 973563.1609, 1830078.9331, 5215189.0853],
    "worldExtent": [6.6500, 8.8000, 12.0000, 47.0500]
};
const crs2000wkt = {
    "code": "EPSG:2000",
    "def": "PROJCS[\"Anguilla 1957 / British West Indies Grid\", \n  GEOGCS[\"Anguilla 1957\", \n    DATUM[\"Anguilla 1957\", \n      SPHEROID[\"Clarke 1880 (RGS)\", 6378249.145, 293.465, AUTHORITY[\"EPSG\",\"7012\"]], \n      AUTHORITY[\"EPSG\",\"6600\"]], \n    PRIMEM[\"Greenwich\", 0.0, AUTHORITY[\"EPSG\",\"8901\"]], \n    UNIT[\"degree\", 0.017453292519943295], \n    AXIS[\"Geodetic longitude\", EAST], \n    AXIS[\"Geodetic latitude\", NORTH], \n    AUTHORITY[\"EPSG\",\"4600\"]], \n  PROJECTION[\"Transverse_Mercator\", AUTHORITY[\"EPSG\",\"9807\"]], \n  PARAMETER[\"central_meridian\", -62.0], \n  PARAMETER[\"latitude_of_origin\", 0.0], \n  PARAMETER[\"scale_factor\", 0.9995], \n  PARAMETER[\"false_easting\", 400000.0], \n  PARAMETER[\"false_northing\", 0.0], \n  UNIT[\"m\", 1.0], \n  AXIS[\"Easting\", EAST], \n  AXIS[\"Northing\", NORTH], \n  AUTHORITY[\"EPSG\",\"2000\"]]",
    "extent": [270929.956129349, 2002224.11122865, 302793.271930239, 2026749.06945627],
    "worldExtent": [-63.22, 18.11, -62.92, 18.33]
};

describe('ProjectionRegistry', () => {
    afterEach(() => {
        // Reset the registry between tests so registrations don't leak into
        // unrelated test files (e.g. ProjectionUtils, projUtils, MapUtils)
        // that read from getProjections() / getAll() and assume a clean slate.
        unRegisterAll();
    });
    it('should register new projection defined in proj4 format', () => {
        register(crs3003proj4);
        const projection = getByCode(crs3003proj4.code);
        expect(projection).toExist();
        expect(projection.code).toBe(crs3003proj4.code);
        expect(projection.def).toBe(crs3003proj4.def);
        expect(projection.extent).toEqual(crs3003proj4.extent);
        expect(projection.worldExtent).toEqual(crs3003proj4.worldExtent);
    });
    it('should register new projection defined in WKT format', () => {
        register(crs2000wkt);
        const projection = getByCode(crs2000wkt.code);
        expect(projection).toExist();
        expect(projection.code).toBe(crs2000wkt.code);
        expect(projection.def).toBe(crs2000wkt.def);
        expect(projection.extent).toEqual(crs2000wkt.extent);
        expect(projection.worldExtent).toEqual(crs2000wkt.worldExtent);
    });
    it('should check isRegistered', () => {
        unRegisterAll();
        register(crs2000wkt);
        expect(isRegistered(crs2000wkt.code)).toBe(true);
        expect(isRegistered(crs3003proj4.code)).toBe(false);
    });
    it('should return true for proj4 native codes even when not in the custom registry', () => {
        unRegisterAll();
        expect(isRegistered('EPSG:4326')).toBe(true);
        expect(isRegistered('EPSG:3857')).toBe(true);
        expect(isRegistered('EPSG:900913')).toBe(true);
        expect(isRegistered('CRS:84')).toBe(true);
    });
    it('should return false for a code that was registered and then unregistered', () => {
        register(crs3003proj4);
        expect(isRegistered(crs3003proj4.code)).toBe(true);
        unRegister(crs3003proj4.code);
        expect(isRegistered(crs3003proj4.code)).toBe(false);
    });
    it('should return false for all custom codes after unRegisterAll', () => {
        register(crs3003proj4);
        register(crs2000wkt);
        unRegisterAll();
        expect(isRegistered(crs3003proj4.code)).toBe(false);
        expect(isRegistered(crs2000wkt.code)).toBe(false);
        // native codes must survive unRegisterAll
        expect(isRegistered('EPSG:4326')).toBe(true);
    });
    it('registerall should register multiple projections', () => {
        registerAll([crs3003proj4, crs2000wkt]).then(() => {
            const projections = getAll();
            expect(projections).toExist();
            expect(projections.length).toBe(2);
            expect(projections[0].code).toBe(crs3003proj4.code);
            expect(projections[1].code).toBe(crs2000wkt.code);
        });

    });
    it('should check onRegister callback', () => {
        onRegister(({ code, extent, worldExtent, supported }) => {
            if (code === crs3003proj4.code) {
                expect(extent).toEqual(crs3003proj4.extent);
                expect(worldExtent).toEqual(crs3003proj4.worldExtent);
                expect(supported).toBe(true);
            }
        });
        register(crs3003proj4);
    });
});
