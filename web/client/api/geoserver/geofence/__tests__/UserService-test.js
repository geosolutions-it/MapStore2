/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const BASE_URL = "TEST";
const UserService = require('../UserService')({
    addBaseUrlGS: (options ) => ({ baseURL: BASE_URL, ...options }),
    getUserService: () => {}
});
// geoserver provides it's default group by default
// service specific. to test path like /security/usergroup/service/geostore/users.json
const ServiceSpecificUserService = require('../UserService')({
    addBaseUrlGS: (options) => ({ baseURL: BASE_URL, ...options }),
    getUserService: () => "geostore"
});
const USERS = require('../../../../test-resources/geoserver/rest/users.json');
const ROLES = require('../../../../test-resources/geoserver/rest/roles.json');
const expect = require('expect');

const axios = require('../../../../libs/ajax');
const MockAdapter = require('axios-mock-adapter');

let mockAxios;


describe('UserService API for GeoFence StandAlone (GeoServer API)', () => {
    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
    });
    it('getUsersCount', (done) => {
        mockAxios.onGet().reply(config => {
            expect(config.url).toBe(`${BASE_URL}/rest/security/usergroup/users.json`);
            expect(config.baseURL).toBe(`${BASE_URL}`);
            return [200, USERS];
        });
        UserService.getUsersCount()
            .then(v => {
                expect(v).toBe(11);
                done();
            })
            .catch(e => done(e));
    });
    it('getUsers', (done) => {
        mockAxios.onGet().reply(config => {
            expect(config.url).toBe(`${BASE_URL}/rest/security/usergroup/users.json`);
            expect(config.baseURL).toBe(`${BASE_URL}`);
            return [200, USERS];
        });
        UserService.getUsers("", 0, 10)
            .then(({users}) => {
                expect(users.length).toBe(10);
                done();
            })
            .catch(e => done(e));
    });
    it('getUsers pagination', (done) => {
        mockAxios.onGet().reply(config => {
            expect(config.url).toBe(`${BASE_URL}/rest/security/usergroup/users.json`);
            expect(config.baseURL).toBe(`${BASE_URL}`);
            return [200, USERS];
        });
        UserService.getUsers("", 1, 10)
            .then(({ users }) => {
                expect(users.length).toBe(1);
                expect(users[0].userName).toBe("test_user11");
                done();
            })
            .catch(e => done(e));
    });
    it('getUsers from service', (done) => {
        mockAxios.onGet().reply(config => {
            expect(config.url).toBe(`${BASE_URL}/rest/security/usergroup/service/geostore/users.json`);
            expect(config.baseURL).toBe(`${BASE_URL}`);
            return [200, USERS];
        });

        ServiceSpecificUserService.getUsers("", 1, 10)
            .then(({ users }) => {
                expect(users.length).toBe(1);
                expect(users[0].userName).toBe("test_user11");
                done();
            })
            .catch(e => done(e));
    });
    it('getUsersCount from service', (done) => {
        mockAxios.onGet().reply(config => {
            expect(config.url).toBe(`${BASE_URL}/rest/security/usergroup/service/geostore/users.json`);
            expect(config.baseURL).toBe(`${BASE_URL}`);
            return [200, USERS];
        });
        ServiceSpecificUserService.getUsersCount()
            .then(v => {
                expect(v).toBe(11);
                done();
            })
            .catch(e => done(e));
    });

    it('getUsersCount with filter', (done) => {
        mockAxios.onGet().reply(config => {
            expect(config.url).toBe(`${BASE_URL}/rest/security/usergroup/users.json`);
            expect(config.baseURL).toBe(`${BASE_URL}`);
            return [200, USERS];
        });
        UserService.getUsersCount("USER1") // test_user1, test_user10, test_user11
            .then(v => {
                expect(v).toBe(3);
                done();
            })
            .catch(e => done(e));
    });
    it('getUsers with filter, case insensitive', (done) => {
        mockAxios.onGet().reply(config => {
            expect(config.url).toBe(`${BASE_URL}/rest/security/usergroup/users.json`); // test_user1, test_user10, test_user11
            expect(config.baseURL).toBe(`${BASE_URL}`);
            return [200, USERS];
        });
        UserService.getUsers("USER1", 0, 10)
            .then(({ users }) => {
                expect(users.length).toBe(3);
                done();
            })
            .catch(e => done(e));
    });
    it('getRolesCount, case insensitive', (done) => {
        mockAxios.onGet().reply(config => {
            expect(config.url).toBe(`${BASE_URL}/rest/security/roles.json`);
            expect(config.baseURL).toBe(`${BASE_URL}`);
            return [200, ROLES];
        });
        UserService.getRolesCount()
            .then(v => {
                expect(v).toBe(14);
                done();
            })
            .catch(e => done(e));
    });
    it('getRoles', (done) => {
        mockAxios.onGet().reply(config => {
            expect(config.url).toBe(`${BASE_URL}/rest/security/roles.json`);
            expect(config.baseURL).toBe(`${BASE_URL}`);
            return [200, ROLES];
        });
        UserService.getRoles("", 0, 10)
            .then(({ roles }) => {
                expect(roles.length).toBe(10);
                done();
            })
            .catch(e => done(e));
    });
    it('getRoles pagination', (done) => {
        mockAxios.onGet().reply(config => {
            expect(config.url).toBe(`${BASE_URL}/rest/security/roles.json`);
            expect(config.baseURL).toBe(`${BASE_URL}`);
            return [200, ROLES];
        });
        UserService.getRoles("", 1, 10)
            .then(({ roles }) => {
                expect(roles.length).toBe(4);
                done();
            })
            .catch(e => done(e));
    });
    it('getRolesCount with filter, case insensitive', (done) => {
        mockAxios.onGet().reply(config => {
            expect(config.url).toBe(`${BASE_URL}/rest/security/roles.json`);
            expect(config.baseURL).toBe(`${BASE_URL}`);
            return [200, ROLES];
        });
        UserService.getRolesCount("GROUP1") // test also case insensitive search
            .then(v => {
                expect(v).toBe(2);
                done();
            })
            .catch(e => done(e));
    });
    it('getRoles with filter, case insensitive', (done) => {
        mockAxios.onGet().reply(config => {
            expect(config.url).toBe(`${BASE_URL}/rest/security/roles.json`);
            expect(config.baseURL).toBe(`${BASE_URL}`);
            return [200, ROLES];
        });
        UserService.getRoles("GROUP1", 0, 10) // test also case insensitive search
            .then(({ roles }) => {
                expect(roles.length).toBe(2);
                done();
            })
            .catch(e => done(e));
    });
});
