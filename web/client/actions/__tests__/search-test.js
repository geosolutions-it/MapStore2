/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var {
    TEXT_SEARCH_RESULTS_LOADED,
    searchResultLoaded
} = require('../search');

describe('Test correctness of the searc actions', () => {
    it('search results loaded', () => {
        const testVal = {data: ['result1', 'result2']};
        const retval = searchResultLoaded(testVal);
        expect(retval).toExist();
        expect(retval.type).toBe(TEXT_SEARCH_RESULTS_LOADED);
        expect(retval.results).toEqual(testVal.data);
        expect(retval.append).toBe(false);

        const retval2 = searchResultLoaded(testVal, true);
        expect(retval2).toExist();
        expect(retval2.type).toBe(TEXT_SEARCH_RESULTS_LOADED);
        expect(retval2.results).toEqual(testVal.data);
        expect(retval2.append).toBe(true);
    });

});
