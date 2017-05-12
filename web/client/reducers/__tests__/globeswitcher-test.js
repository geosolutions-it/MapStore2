/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const globeswitcher = require('../globeswitcher');
const {changeMapType} = require('../../actions/maptype');
const {updateLast2dMapType} = require('../../actions/globeswitcher');

describe('Test the globeswitcher reducer', () => {
    it('check to store last 2d map type', () => {
        const state = globeswitcher(undefined, changeMapType("leaflet"));
        expect(state.last2dMapType).toBe('leaflet');
        const state2 = globeswitcher(state, changeMapType("cesium"));
        expect(state2.last2dMapType).toBe('leaflet');
        const state3 = globeswitcher(state2, updateLast2dMapType("openlayers"));
        expect(state3.last2dMapType).toBe('openlayers');
        const state4 = globeswitcher(state3, {type: "UNKNOWN"});
        expect(state4.last2dMapType).toBe('openlayers');
    });
});
