/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');
var locate = require('../locate');

describe('Test the locate reducer', () => {

    it('enables/disable locate', () => {
        let state = locate({}, {type: 'CHANGE_LOCATE_STATE', enabled: true});
        expect(state).toExist();
        expect(state.enabled).toBe(true);

        state = locate({}, {type: 'CHANGE_LOCATE_STATE', enabled: false});
        expect(state).toExist();
        expect(state.enabled).toBe(false);
    });

});
