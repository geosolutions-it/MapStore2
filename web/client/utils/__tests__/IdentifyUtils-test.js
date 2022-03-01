/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { getFormatForResponse } from '../IdentifyUtils';
import { INFO_FORMATS } from '../FeatureInfoUtils';

describe('IdentifyUtils', () => {
    it('getFormatForResponse WMS response', () => {
        expect(getFormatForResponse({ queryParams: { info_format: INFO_FORMATS.HTML } })).toBe(INFO_FORMATS.HTML);
    });
    it('getFormatForResponse WFS response', () => {
        expect(getFormatForResponse({ queryParams: { outputFormat: INFO_FORMATS.JSON } })).toBe(INFO_FORMATS.JSON);
    });
});
