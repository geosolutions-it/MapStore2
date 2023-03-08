/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {
    MAP_TYPE_CHANGED,
    changeMapType,
    VISUALIZATION_MODE_CHANGED,
    changeVisualizationMode
} from '../maptype';

describe('Test correctness of the maptype actions', () => {
    it('changeMapType', () => {
        const retVal = changeMapType('maptype');
        expect(retVal).toBeTruthy();
        expect(retVal.type).toBe(MAP_TYPE_CHANGED);
        expect(retVal.mapType).toBe('maptype');
    });
    it('changeVisualizationMode', () => {
        const retVal = changeVisualizationMode('3D');
        expect(retVal).toBeTruthy();
        expect(retVal.type).toBe(VISUALIZATION_MODE_CHANGED);
        expect(retVal.visualizationMode).toBe('3D');
    });
});
