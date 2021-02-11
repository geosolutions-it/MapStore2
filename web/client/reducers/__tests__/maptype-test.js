/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import maptype from '../maptype';
import { changeMapType, updateLast2dMapType } from '../../actions/maptype';

describe('Test the maptype reducer', () => {
    it('set a maptype', () => {
        const state = maptype(undefined, changeMapType("leaflet"));
        expect(state.mapType).toBe('leaflet');
    });
    it('check to store last 2d map type', () => {
        const state = maptype(undefined, changeMapType("leaflet"));
        expect(state.last2dMapType).toBe('leaflet');
        const state2 = maptype(state, changeMapType("cesium"));
        expect(state2.last2dMapType).toBe('leaflet');

        const state3 = maptype(state2, updateLast2dMapType("openlayers"));
        expect(state3.last2dMapType).toBe('openlayers');
        const state4 = maptype(state3, { type: "UNKNOWN" });
        expect(state4.last2dMapType).toBe('openlayers');

    });
});
