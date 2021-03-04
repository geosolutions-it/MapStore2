/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import { toggle3d, TOGGLE_3D } from '../globeswitcher';

describe('Test correctness of the maptype actions', () => {

    it('toggle3d', () => {
        const retVal = toggle3d(true);
        expect(retVal).toExist();
        expect(retVal.type).toBe(TOGGLE_3D);
        expect(retVal.enable).toBe(true);
    });
});
