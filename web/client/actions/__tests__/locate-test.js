/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var {CHANGE_LOCATE_STATE, LOCATE_ERROR, changeLocateState, onLocateError} = require('../locate');

describe('Test correctness of the locate actions', () => {

    it('change locate state', () => {
        const testVal = "val";
        const retval = changeLocateState(testVal);
        expect(retval.type).toBe(CHANGE_LOCATE_STATE);
        expect(retval.state).toExist();
        expect(retval.state).toBe(testVal);
    });
    it('change locate error', () => {
        const testVal = "val";
        const retval = onLocateError(testVal);
        expect(retval.type).toBe(LOCATE_ERROR);
        expect(retval.error).toExist();
        expect(retval.error).toBe(testVal);
    });
});
