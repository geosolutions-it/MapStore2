/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import maptype from '../maptype';
import { changeMapType } from '../../actions/maptype';

describe('Test the maptype reducer', () => {
    it('set a maptype', () => {
        const state = maptype(undefined, changeMapType("leaflet"));
        expect(state.mapType).toBe('leaflet');
    });
});
