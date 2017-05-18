/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

var expect = require('expect');
var {
    SET_SEARCH_CONFIG_PROP,
    RESET_SEARCH_CONFIG,
    UPDATE_SERVICE,
    setSearchConfigProp,
    restServiceConfig,
    updateService
} = require('../searchconfig');

describe('Test correctness of the searchconfig actions', () => {


    it('resetServiceConfig', () => {
        const testPage = 1;
        var retval = restServiceConfig(testPage);

        expect(retval).toExist();
        expect(retval.type).toBe(RESET_SEARCH_CONFIG);
        expect(retval.page).toBe(testPage);
    });

    it('setSearchConfigProp', () => {
        const testProperty = 'prop';
        const testValue = 'val';
        var retval = setSearchConfigProp(testProperty, testValue);

        expect(retval).toExist();
        expect(retval.type).toBe(SET_SEARCH_CONFIG_PROP);
        expect(retval.property).toBe(testProperty);
        expect(retval.value).toBe(testValue);
    });

    it('updateService', () => {
        const testService = "service";
        const testIdx = 1;
        var retval = updateService(testService, testIdx);
        expect(retval).toExist();
        expect(retval.type).toBe(UPDATE_SERVICE);
        expect(retval.service).toBe(testService);
        expect(retval.idx).toBe(testIdx);
    });
});
