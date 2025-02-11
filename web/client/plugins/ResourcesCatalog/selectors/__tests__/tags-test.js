/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    showTagsPanelSelector
} from '../tags';
import expect from 'expect';

describe('tags selectors', () => {
    it('showTagsPanelSelector', () => {
        expect(showTagsPanelSelector()).toBe(false);
        expect(showTagsPanelSelector({ tags: { show: true } })).toBe(true);
    });
});
