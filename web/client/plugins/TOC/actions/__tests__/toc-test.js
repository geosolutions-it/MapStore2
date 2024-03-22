/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';

import {
    updateTOCConfig,
    UPDATE_TOC_CONFIG
} from '../toc';

describe('toc actions', () => {
    it('updateTOCConfig', () => {
        const payload = {};
        const action = updateTOCConfig(payload);
        expect(action.type).toBe(UPDATE_TOC_CONFIG);
        expect(action.payload).toBe(payload);
    });
});
