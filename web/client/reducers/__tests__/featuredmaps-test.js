/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const {setFeaturedMapsEnabled} = require('../../actions/maps');
const {isFeaturedMapsEnabled} = require('../../selectors/featuredmaps');
const featuredmaps = require('../featuredmaps');

describe('Test the featuredmaps reducer', () => {
    it('featuredmaps enabled', () => {
        const fm = featuredmaps({}, setFeaturedMapsEnabled(true) );
        expect(isFeaturedMapsEnabled({
            featuredmaps: fm
        })).toBe(true);
    });
});
