/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';

import {
    consumeTOCInitialization,
    TOC_INITIALIZATION_CONSUMED,
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
    it('consumeTOCInitialization', () => {
        const mapLoadedCount = 2;
        const action = consumeTOCInitialization(mapLoadedCount);
        expect(action.type).toBe(TOC_INITIALIZATION_CONSUMED);
        expect(action.mapLoadedCount).toBe(mapLoadedCount);
    });
});
