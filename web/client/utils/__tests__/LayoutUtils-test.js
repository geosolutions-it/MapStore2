/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {
    parseLayoutValue
} from '../LayoutUtils';

describe('LayoutUtils', () => {
    it('parseLayoutValue', () => {
        const percentageValue = parseLayoutValue('20%', 500);
        expect(percentageValue).toBe(100);

        const numberValue = parseLayoutValue(20);
        expect(numberValue).toBe(20);

        const noNumberValue = parseLayoutValue('value');
        expect(noNumberValue).toBe(0);
    });
});
