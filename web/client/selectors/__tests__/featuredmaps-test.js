/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');

const {
    resourceSelector,
    searchTextSelector
} = require('../featuredmaps');

describe('featuredMaps selectors', () => {
    it('test resourceSelector selector', () => {
        const state = {
            featuredmaps: {
                latestResource: {
                    resourceId: '01'
                }
            }
        };
        expect(resourceSelector(state)).toBe(state.featuredmaps.latestResource);

        expect(resourceSelector()).toEqual({});
    });
    it('test searchTextSelector', () => {

        const state = {
            featuredmaps: {
                searchText: 'text'
            }
        };

        expect(searchTextSelector(state)).toBe('text');

        expect(searchTextSelector()).toBe('');
    });
});

