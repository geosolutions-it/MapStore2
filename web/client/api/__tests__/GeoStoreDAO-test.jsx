/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const API = require('../GeoStoreDAO');

describe('Test correctness of the GeoStore APIs', () => {

    it('check the utility functions', () => {
        const result = API.addBaseUrl(null);
        expect(result).toIncludeKey("baseURL");
        expect(result.baseURL).toNotBe(null);
        const result2 = API.addBaseUrl({otherOption: 3});
        expect(result2).toIncludeKey("baseURL")
        .toIncludeKey('otherOption');
        expect(result2.baseURL).toNotBe(null);
    });

    it('test user creation utils', () => {
        const originalUser = {name: "username", newPassword: "PASSWORD"};
        const user = API.utils.initUser(originalUser);
        expect(user.password).toBe(originalUser.newPassword);
        expect(user.attribute).toExist();
        expect(user.attribute.length).toBe(1);
        expect(user.attribute.length).toBe(1);
        expect(user.attribute[0].name).toBe("UUID");
        expect(user.attribute[0].value).toExist();
        const originalUser2 = {name: "username", newPassword: "PASSWORD", attribute: [{name: "email", value: "test@test.test"}]};
        const user2 = API.utils.initUser(originalUser2);
        expect(user2.attribute.length).toBe(2);
    });

    it('test error parser', () => {
        expect(API.errorParser.mapsError({status: 409})).toEqual({
            title: 'map.mapError.errorTitle',
            message: 'map.mapError.error409'
        });
        expect(API.errorParser.mapsError({status: 400})).toEqual({
            title: 'map.mapError.errorTitle',
            message: 'map.mapError.errorDefault'
        });
    });
});
