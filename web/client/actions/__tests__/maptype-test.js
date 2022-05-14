/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import { MAP_TYPE_CHANGED, changeMapType, updateLast2dMapType, UPDATE_LAST_2D_MAPTYPE } from '../maptype';

describe('Test correctness of the maptype actions', () => {

    it('changeMapType', () => {
        const retVal = changeMapType('maptype');
        expect(retVal).toExist();
        expect(retVal.type).toBe(MAP_TYPE_CHANGED);
        expect(retVal.mapType).toBe('maptype');
    });
    it('updateLast2dMapType', () => {
        const retVal = updateLast2dMapType("leaflet");
        expect(retVal).toExist();
        expect(retVal.type).toBe(UPDATE_LAST_2D_MAPTYPE);
        expect(retVal.mapType).toBe('leaflet');
    });
});
