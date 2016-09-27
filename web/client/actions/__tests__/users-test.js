/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const assign = require('object-assign');
const {
    USERMANAGER_GETUSERS,
    getUsers
} = require('../users');
let GeoStoreDAO = require('../../api/GeoStoreDAO');
let oldAddBaseUri = GeoStoreDAO.addBaseUrl;

describe('Test correctness of the users actions', () => {
    beforeEach(() => {
        GeoStoreDAO.addBaseUrl = (options) => {
            return assign(options, {baseURL: 'base/web/client/test-resources/geostore/'});
        };
    });

    afterEach(() => {
        GeoStoreDAO.addBaseUrl = oldAddBaseUri;
    });
    it('getUsers', (done) => {
        const retFun = getUsers('users.json', {params: {start: 0, limit: 10}});
        expect(retFun).toExist();
        let count = 0;
        retFun((action) => {
            expect(action.type).toBe(USERMANAGER_GETUSERS);
            count++;
            if (count === 2) {
                expect(action.users).toExist();
                expect(action.users[0]).toExist();
                expect(action.users[0].groups).toExist();
                done();
            }

        });

    });
    it('getUsers error', (done) => {
        const retFun = getUsers('MISSING_LINK', {params: {start: 0, limit: 10}});
        expect(retFun).toExist();
        let count = 0;
        retFun((action) => {
            expect(action.type).toBe(USERMANAGER_GETUSERS);
            count++;
            if (count === 2) {
                expect(action.error).toExist();
                done();
            }

        });

    });
});
