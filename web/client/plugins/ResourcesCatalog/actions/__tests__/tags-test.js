/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    SHOW_TAGS_PANEL,
    showTagsPanel
} from '../tags';
import expect from 'expect';

describe('resources actions', () => {
    it('updateResources', () => {
        expect(showTagsPanel(true)).toEqual({
            type: SHOW_TAGS_PANEL,
            show: true
        });
    });
});
