/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { getChromaScaleByName } from '../ClassificationUtils';

describe('ClassificationUtils', () => {
    it('getChromaScaleByName', () => {
        expect(getChromaScaleByName('red')).toEqual(['#000', '#f00']);
        expect(getChromaScaleByName('viridis')).toBe('viridis');
    });
});
