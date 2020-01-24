/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const { optionsToVendorParams} = require('../VendorParamsUtils');
describe('VendorParamUtils ', () => {

    it('optionsToVendorParams', () => {
        expect(optionsToVendorParams()).toNotExist();
        expect(optionsToVendorParams({
            params: {
                CQL_FILTER: "INCLUDE"
            }
        }).CQL_FILTER).toBe("INCLUDE");
    });
    it('optionsToVendorParams', () => {
        expect(optionsToVendorParams({
            params: {
                CQL_FILTER: "INCLUDE"
            }
        }, "INCLUDE").CQL_FILTER).toBe('(INCLUDE) AND (INCLUDE)');
    });
    it('optionsToVendorParams do not add other params to the request (#3142)', () => {
        const params = optionsToVendorParams({ params: {viewParams: "a:1"}});
        expect(Object.keys(params).length).toBe(1);
    });
    it('optionsToVendorParams do not add other params to the request (#3142)', () => {
        const params = optionsToVendorParams({ params: {viewParams: "a:1"}});
        expect(Object.keys(params).length).toBe(1);
    });

});
