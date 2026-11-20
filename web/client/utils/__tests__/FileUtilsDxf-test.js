/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import { readDxf } from '../FileUtils';

const DXF = '0\nSECTION\n2\nENTITIES\n0\nPOINT\n10\n1\n20\n2\n30\n0\n0\nENDSEC\n0\nEOF\n';
const hasLogLevelCookie = () => document.cookie.split(/;\s*/).some(cookie => cookie.indexOf('loglevel=') === 0);

describe('FileUtils readDxf browser storage', () => {
    it('loading the application does not store the dxf-parser log level', () => {
        expect(window.localStorage.getItem('loglevel')).toBe(null);
        expect(hasLogLevelCookie()).toBe(false);
    });
    it('reads a DXF file and leaves no log level in the browser', (done) => {
        readDxf(new File([DXF], 'point.dxf')).then(dxf => {
            expect(dxf.entities.length).toBe(1);
            expect(dxf.entities[0].type).toBe('POINT');
            expect(dxf.entities[0].position).toEqual({x: 1, y: 2, z: 0});
            expect(window.localStorage.getItem('loglevel')).toBe(null);
            expect(hasLogLevelCookie()).toBe(false);
            done();
        }).catch(done);
    });
});
