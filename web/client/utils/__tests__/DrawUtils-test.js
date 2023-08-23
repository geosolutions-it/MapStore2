/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { generateEditingStyle } from '../DrawUtils';

describe('Test the DrawUtils', () => {
    it('generateEditingStyle with custom style', () => {
        const lineDrawingCustom = {
            color: '#FF0000',
            opacity: 1.0,
            width: 3
        };
        const drawStyle = generateEditingStyle({
            lineDrawing: lineDrawingCustom
        });
        expect(drawStyle).toEqual({
            ...generateEditingStyle(),
            lineDrawing: lineDrawingCustom
        });
    });
});
