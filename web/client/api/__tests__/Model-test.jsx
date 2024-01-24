/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { getCapabilities } from '../Model';
import axios from '../../libs/ajax';
import expect from 'expect';
import MockAdapter from "axios-mock-adapter";
let mockAxios;

describe('Test Model API for ifc models', () => {
    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
    });
    it('should extract capabilities from ifc model', (done) => {
        mockAxios.onGet().reply(200);
        getCapabilities('/ifcModel.ifc').then(({ bbox, format, version, properties, modelData }) => {
            try {
                expect(modelData).toBeTruthy();
                expect(format).toBeTruthy();
                expect(format).toBe('ifc');
                expect(version).toBeTruthy();
                expect(version).toBe('IFC4');
                expect(properties).toBeTruthy();
                expect(properties).toBe({});
                expect(bbox).toBeTruthy();
                expect(bbox.crs).toBe('EPSG:4326');
                expect(Math.floor(bbox.bounds.minx)).toBe(0);
                expect(Math.floor(bbox.bounds.miny)).toBe(0);
                expect(Math.ceil(bbox.bounds.maxx)).toBe(0);
                expect(Math.ceil(bbox.bounds.maxy)).toBe(0);
            } catch (e) {
                done(e);
            }
            done();
        });
    });
});
