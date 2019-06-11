/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');
var crsSelect = require('../crsselector');

describe('Test the mousePosition reducer', () => {

    it('change the filtered input projection', () => {
        let testAction = {
            type: 'CHANGE_CRS_INPUT_VALUE',
            value: 'EPSG:4326'
        };

        let state = crsSelect({}, testAction);
        expect(state).toExist();
        expect(state.value).toBe('EPSG:4326');
    });

});
