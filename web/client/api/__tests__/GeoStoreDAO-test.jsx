/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const API = require('../GeoStoreDAO');
const axios = require("../../libs/ajax");
const MockAdapter = require("axios-mock-adapter");

let mockAxios;

const SAMPLE_RULES = {
    "SecurityRuleList": {
        "SecurityRule": [
            {
                "canRead": true,
                "canWrite": true,
                "user": {
                    "id": 3,
                    "name": "admin"
                }
            },
            {
                "canRead": true,
                "canWrite": true,
                "group": {
                    "groupName": "geosolutions",
                    "id": 524
                }
            },
            {
                "canRead": true,
                "canWrite": false,
                "group": {
                    "groupName": "testers",
                    "id": 3956
                }
            }
        ]
    }
};
const SAMPLE_XML_RULES = "<SecurityRuleList>"
    + "<SecurityRule>"
        + "<canRead>true</canRead>"
        + "<canWrite>true</canWrite>"
        + "<user>"
            + "<id>3</id>"
            + "<name>admin</name>"
        + "</user>"
    + "</SecurityRule>"
    + "<SecurityRule>"
        + "<canRead>true</canRead>"
        + "<canWrite>true</canWrite>"
        + "<group>"
            + "<id>524</id>"
            + "<groupName>geosolutions</groupName>"
        + "</group>"
    + "</SecurityRule>"
    + "<SecurityRule>"
        + "<canRead>true</canRead>"
        + "<canWrite>false</canWrite>"
        + "<group>"
            + "<id>3956</id>"
            + "<groupName>testers</groupName>"
        + "</group>"
    + "</SecurityRule>"
+ "</SecurityRuleList>";

describe('Test correctness of the GeoStore APIs', () => {

    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
    });

    it('check the utility functions', () => {
        const result = API.addBaseUrl(null);
        expect(result).toIncludeKey("baseURL");
        expect(result.baseURL).toNotBe(null);

        const result2 = API.addBaseUrl({otherOption: 3});
        expect(result2)
            .toIncludeKey("baseURL")
            .toIncludeKey('otherOption');
        expect(result2.baseURL).toNotBe(null);

        const baseURL = "/test/geostore/rest";
        const withCustomBaseUrl = API.addBaseUrl({otherOption: 3, baseURL});
        expect(withCustomBaseUrl.baseURL).toBe(baseURL);
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
    it('test security rules utils (writeSecurityRules)', () => {
        const payload = API.writeSecurityRules(SAMPLE_RULES.SecurityRuleList);
        expect(payload).toBe(SAMPLE_XML_RULES);
    });
    it('test generate meatadata', () => {
        const payload = API.generateMetadata("Special & chars", "&<>'\"");
        expect(payload).toBe('<description><![CDATA[&<>\'"]]></description><metadata></metadata><name><![CDATA[Special & chars]]></name>');
    });

    it('test login without credentials', (done) => {
        mockAxios.onPost().reply(200, {
            "access_token": "token"
        });
        mockAxios.onGet().reply(200);
        API.login().then(() => {
            expect(mockAxios.history.post[0].auth).toNotExist();
            done();
        });
    });

    it("test login with credentials", done => {
        mockAxios.onPost().reply(200, { access_token: "token" });
        mockAxios.onGet().reply(200);
        API.login("user", "password").then(() => {
            expect(mockAxios.history.post[0].auth).toExist();
            expect(mockAxios.history.post[0].auth.username).toBe('user');
            expect(mockAxios.history.post[0].auth.password).toBe("password");
            done();
        });
    });
    it("test generateMetadata default", () => {
        const metadata = API.generateMetadata();
        const name = "";
        const description = "";
        expect(metadata).toEqual(`<description><![CDATA[${description}]]></description><metadata></metadata><name><![CDATA[${name}]]></name>`);
    });
    it("test generateMetadata with name and desc", () => {
        const name = "Map 1";
        const description = "this map shows high traffic zones";
        const metadata = API.generateMetadata(name, description);
        expect(metadata).toEqual(`<description><![CDATA[${description}]]></description><metadata></metadata><name><![CDATA[${name}]]></name>`);
    });
    it("test createAttributeList default", () => {
        expect(API.createAttributeList()).toEqual("");
    });
    it("test createAttributeList no attributes", () => {
        expect(API.createAttributeList({attributes: {}})).toEqual("");
    });
    it("test createAttributeList with attributes", () => {
        const name = "name";
        const description = "description";
        let metadata = {
            name,
            description,
            attributes: {
                nina: "nina",
                eating: "eating",
                plastic: "plastic"
            }
        };
        metadata = API.createAttributeList(metadata);
        expect(metadata).toEqual(
            "<Attributes>" +
                "<attribute><name>nina</name><value>nina</value><type>STRING</type></attribute>" +
                "<attribute><name>eating</name><value>eating</value><type>STRING</type></attribute>" +
                "<attribute><name>plastic</name><value>plastic</value><type>STRING</type></attribute>" +
            "</Attributes>"
        );
    });
    it("test getAvailableGroups for ADMIN multiple groups", () => {
        const sampleResponse = {
            "UserGroupList": {
                "UserGroup": [
                    {
                        "groupName": "everyone",
                        "id": 1,
                        "restUsers": {
                            "User": [
                                {
                                    "groupsNames": "everyone",
                                    "id": 3,
                                    "name": "user",
                                    "role": "USER"
                                },
                                {
                                    "groupsNames": "everyone",
                                    "id": 2,
                                    "name": "admin",
                                    "role": "ADMIN"
                                },
                                {
                                    "groupsNames": "everyone",
                                    "id": 1,
                                    "name": "guest",
                                    "role": "GUEST"
                                }
                            ]
                        }
                    },
                    {
                        "description": "test",
                        "groupName": "test",
                        "id": 5,
                        "restUsers": ""
                    }
                ]
            }
        };

        mockAxios.onGet().reply(200, sampleResponse);
        API.getAvailableGroups({role: "ADMIN"}).then((data) => {
            expect(data).toExist();
            expect(data.length).toBe(2);
            const everyoneGroup = data.find(g => g.id === 1);
            expect(everyoneGroup).toEqual({id: 1, groupName: "everyone"});
            const testGroup = data.find(g => g.id === 5);
            expect(testGroup).toEqual({id: 5, groupName: "test"});
        });
    });
    it("test getAvailableGroups for ADMIN single group", () => {
        const sampleResponse = {
            "UserGroupList": {
                "UserGroup": {
                    "groupName": "everyone",
                    "id": 1,
                    "restUsers": {
                        "User": [
                            {
                                "groupsNames": "everyone",
                                "id": 3,
                                "name": "user",
                                "role": "USER"
                            },
                            {
                                "groupsNames": "everyone",
                                "id": 2,
                                "name": "admin",
                                "role": "ADMIN"
                            },
                            {
                                "groupsNames": "everyone",
                                "id": 1,
                                "name": "guest",
                                "role": "GUEST"
                            }
                        ]
                    }
                }
            }
        };

        mockAxios.onGet().reply(200, sampleResponse);
        API.getAvailableGroups({role: "ADMIN"}).then((data) => {
            expect(data).toExist();
            expect(data.length).toBe(1);
            expect(data[0]).toEqual({id: 1, groupName: "everyone"});
        });
    });
    it('test getResourceIdByName', () => {
        const sampleResponse = {
            Resource: {
                id: 1,
                name: 'name'
            }
        };

        mockAxios.onGet().reply(200, sampleResponse);
        API.getResourceIdByName('CONTEXT', 'name').then(data => {
            expect(data).toBe(1);
        });
    });
});
