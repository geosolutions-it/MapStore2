/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var {CHANGE_MAP_VIEW, changeMapView} = require('../map');

describe('Test correctness of the map actions', () => {

    it('changeMapVeiw', () => {
        const testCenter = 0;
        const testZoom = 9;
        var retval = changeMapView(testCenter, testZoom);

        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_MAP_VIEW);
        expect(retval.center).toBe(testCenter);
        expect(retval.zoom).toBe(testZoom);
    });
});
