/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { searchTextSelector, isFeaturedMapsEnabled } from '../featuredmaps';

describe('featuredMaps selectors', () => {
    it('test searchTextSelector', () => {

        const state = {
            featuredmaps: {
                searchText: 'text'
            }
        };

        expect(searchTextSelector(state)).toBe('text');

        expect(searchTextSelector()).toBe('');
    });

    it('test isFeaturedMapsEnabled', () => {
        const state = {
            featuredmaps: {
                enabled: true
            }
        };
        expect(isFeaturedMapsEnabled(state)).toBeTruthy();
    });
});

