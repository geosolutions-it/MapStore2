/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const {
    toggle3d,
    updateLast2dMapType,
    TOGGLE_3D,
    UPDATE_LAST_2D_MAPTYPE
} = require('../globeswitcher');

describe('Test correctness of the maptype actions', () => {

    it('toggle3d', () => {
        const retVal = toggle3d(true);
        expect(retVal).toExist();
        expect(retVal.type).toBe(TOGGLE_3D);
        expect(retVal.enable).toBe(true);
    });
    it('updateLast2dMapType', () => {
        const retVal = updateLast2dMapType("leaflet");
        expect(retVal).toExist();
        expect(retVal.type).toBe(UPDATE_LAST_2D_MAPTYPE);
        expect(retVal.mapType).toBe('leaflet');
    });
});
