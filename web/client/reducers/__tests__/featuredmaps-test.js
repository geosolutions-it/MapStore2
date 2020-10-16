/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { setFeaturedMapsEnabled } from '../../actions/maps';
import { isFeaturedMapsEnabled } from '../../selectors/featuredmaps';
import featuredmaps from '../featuredmaps';

describe('Test the featuredmaps reducer', () => {
    it('featuredmaps enabled', () => {
        const fm = featuredmaps({}, setFeaturedMapsEnabled(true) );
        expect(isFeaturedMapsEnabled({
            featuredmaps: fm
        })).toBe(true);
    });
});
