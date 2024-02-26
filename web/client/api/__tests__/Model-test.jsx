/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { getCapabilities } from '../Model';
import expect from 'expect';

describe('Test Model API for ifc models', () => {
    it('should extract capabilities from ifc model', (done) => {
        getCapabilities('base/web/client/test-resources/ifcModels/ifcModel.ifc').then(({ bbox, format, version, properties }) => {
            try {
                expect(format).toBeTruthy();
                expect(format).toBe('ifc');
                expect(version).toBeTruthy();
                expect(version).toBe('IFC4');
                expect(properties).toBeTruthy();
                expect(properties).toEqual({
                    projectedCrs: 'EPSG:5834',
                    projectedCrsNotSupported: true,
                    mapConversion: { northings: 5334600, eastings: 4468005, orthogonalHeight: 515, xAxisOrdinate: 0, xAxisAbscissa: 1, rotation: 0, scale: 1 },
                    size: [ 1000, 1000, 0 ]
                });
                expect(bbox).toBeTruthy();
                expect(bbox.crs).toBe('EPSG:4326');
                expect(Math.round(bbox.bounds.minx)).toBe(0);
                expect(Math.round(bbox.bounds.miny)).toBe(0);
                expect(Math.round(bbox.bounds.maxx)).toBe(0);
                expect(Math.round(bbox.bounds.maxy)).toBe(0);
            } catch (e) {
                done(e);
            }
            done();
        });
    });
});
