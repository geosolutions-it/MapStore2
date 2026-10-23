/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import { DxfParser } from 'dxf-parser';
import logger from '../../libs/DxfLogger';

// Exercises the real parser through the same Webpack replacement as the app.
describe('DXF privacy regression', () => {
    it('parses DXF without persisting a diagnostic level or cookie', () => {
        const before = window.localStorage.getItem('loglevel');
        const cookieBefore = document.cookie;
        logger.setLevel('error');
        const result = new DxfParser().parseSync('0\nSECTION\n2\nENTITIES\n0\nPOINT\n10\n1\n20\n2\n30\n0\n0\nENDSEC\n0\nEOF\n');
        expect(result.entities[0].type).toBe('POINT');
        expect(window.localStorage.getItem('loglevel')).toBe(before);
        expect(document.cookie).toBe(cookieBefore);
    });
});
