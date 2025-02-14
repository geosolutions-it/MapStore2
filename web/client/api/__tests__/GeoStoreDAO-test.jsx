/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import API from '../GeoStoreDAO';
import axios from '../../libs/ajax';
import MockAdapter from 'axios-mock-adapter';

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
        const payload = API.generateMetadata("Special & chars", "&<>'\"", false);
        expect(payload).toBe('<description><![CDATA[&<>\'"]]></description><metadata></metadata><name><![CDATA[Special & chars]]></name><advertised>false</advertised>');
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

    it("test login with UTF-8 credentials", done => {
        mockAxios.onPost().reply(200, { access_token: "token" });
        mockAxios.onGet().reply(200);
        API.login("アキラ", "金田").then(() => {
            expect(mockAxios.history.post[0].auth).toExist();
            expect(mockAxios.history.post[0].auth.username).toBe('ã¢ã­ã©'); // encoded utf-8 for `btoa` conversion
            // mock-axios do not return effective request. Can not test this https://github.com/1pm/axios/blob/ef94711090b17b75143ee97cab8c6bc1fcaddb05/lib/adapters/xhr.js#L26
            // expect(mockAxios.history.post[0].auth.password).toBe("金田"); // <-- this should be encoded too.
            done();
        });
    });

    it("test refresh session", (done) => {
        mockAxios.onPost().reply(200, { sessionToken: {access_token: "token"} });
        API.refreshToken("access", "refresh", {}).then(response => {
            expect(response.access_token).toBe("token");
            done();
        });
    });
    it("test generateMetadata default", () => {
        const metadata = API.generateMetadata();
        const name = "";
        const description = "";
        const advertised = true;
        expect(metadata).toEqual(`<description><![CDATA[${description}]]></description><metadata></metadata><name><![CDATA[${name}]]></name><advertised>${advertised}</advertised>`);
    });
    it("test generateMetadata with name, desc and advertised", () => {
        const name = "Map 1";
        const description = "this map shows high traffic zones";
        const advertised = false;
        const metadata = API.generateMetadata(name, description, advertised);
        expect(metadata).toEqual(`<description><![CDATA[${description}]]></description><metadata></metadata><name><![CDATA[${name}]]></name><advertised>${advertised}</advertised>`);
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
                "<attribute><name>nina</name><value><![CDATA[nina]]></value><type>STRING</type></attribute>" +
                "<attribute><name>eating</name><value><![CDATA[eating]]></value><type>STRING</type></attribute>" +
                "<attribute><name>plastic</name><value><![CDATA[plastic]]></value><type>STRING</type></attribute>" +
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
                        "restUsers": {}
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
            expect(testGroup).toEqual({id: 5, "description": "test", groupName: "test"});
        });
    });
    it("test getAvailableGroups for ADMIN single group", () => {
        const sampleResponse = {
            "UserGroupList": {
                "UserGroup": {
                    "groupName": "everyone",
                    "id": 1,
                    "restUsers": {}
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
    it('updateGroup with attributes', (done) => {
        const sampleResponse = {
            "UserGroup": {
                "description": "description",
                "enabled": true,
                "groupName": "testGroup1",
                "id": 10,
                "attributes": [
                    {
                        "name": "notes",
                        "value": "test"
                    }
                ]
            }
        };

        mockAxios.onPut().reply((data) => {
            expect(data.baseURL).toEqual("/rest/geostore/");
            expect(data.url).toEqual("usergroups/group/10");
            expect(JSON.parse(data.data)).toEqual(sampleResponse);
            return [200, "10"];
        });
        API.updateGroup({ id: 10, groupName: 'testGroup1', description: "description", enabled: true, attributes: [{name: "notes", value: "test"}]})
            .then(data => {
                expect(data).toEqual("10");
                done();
            })
            .catch(e => {
                done(e);
            });
    });
    it('updateGroup with usergroups', (done) => {
        const group = {
            "status": "modified",
            "description": "test",
            "enabled": true,
            "groupName": "testGroup1",
            "id": 10,
            "attributes": [
                {
                    "name": "notes",
                    "value": "asdasd"
                }
            ],
            "restUsers": {
                "User": {
                    "groupsNames": [
                        "everyone",
                        "testGroup1"
                    ],
                    "id": 13,
                    "name": "user",
                    "role": "ADMIN"
                }
            },
            "users": [
                {
                    "groupsNames": [
                        "everyone",
                        "testGroup1"
                    ],
                    "id": 13,
                    "name": "user",
                    "role": "ADMIN"
                }
            ],
            "newUsers": [
                {
                    "enabled": true,
                    "groups": {
                        "group": {
                            "enabled": true,
                            "groupName": "everyone",
                            "id": 9
                        }
                    },
                    "id": 14,
                    "name": "test",
                    "role": "USER"
                }
            ]
        };
        const checks = {};

        mockAxios.onPut().reply((data) => {
            expect(data.baseURL).toEqual("/rest/geostore/");
            expect(data.url).toEqual("usergroups/group/10");
            checks.put = true;
            return [200, "10"];
        });
        mockAxios.onDelete().reply((data) => {
            expect(data.baseURL).toEqual("/rest/geostore/");
            expect(data.url).toEqual("/usergroups/group/13/10/");
            checks.delete = true;
            return [204, ""];
        });
        mockAxios.onPost().reply((data) => {
            expect(data.baseURL).toEqual("/rest/geostore/");
            expect(data.url).toEqual("/usergroups/group/14/10/");
            checks.post = true;
            return [204, "10"];
        });
        API.updateGroup(group)
            .then(data => {
                expect(data).toEqual("10");
                expect(checks.put).toBe(true);
                expect(checks.delete).toBe(true);
                expect(checks.post).toBe(true);
                done();
            })
            .catch(e => {
                done(e);
            });
    });
    it('putResource with string data', (done) => {
        // check the request contains the correct data and headers
        mockAxios.onPut().reply((data) => {
            expect(data.baseURL).toEqual("/rest/geostore/");
            expect(data.url).toEqual("data/1");
            expect(data.data).toEqual("data");
            expect(data.headers["Content-Type"]).toEqual("text/plain; charset=utf-8");
            return [200, "10"];
        });
        API.putResource(1, "data").then(data => {
            expect(data.data).toEqual("10");
            done();
        }).catch(e => {
            done(e);
        });
    });
    it('putResource with json data', (done) => {
        // check the request contains the correct data and headers
        mockAxios.onPut().reply((data) => {
            try {
                expect(data.baseURL).toEqual("/rest/geostore/");
                expect(data.url).toEqual("data/1");
                expect(data.data).toEqual('{"some":"thing"}');
                expect(data.headers["Content-Type"]).toEqual("application/json; charset=utf-8");
            } catch (e) {
                done(e);
            }
            return [200, "10"];
        });
        API.putResource(1, {"some": "thing"}).then(data => {
            expect(data.data).toEqual("10");
            done();
        }).catch(e => {
            done(e);
        });
    });
    it('getTags', (done) => {
        mockAxios.onGet().reply((data) => {
            try {
                expect(data.baseURL).toBe('/rest/geostore/');
                expect(data.url).toBe('/resources/tag');
                expect(data.params).toEqual({ nameLike: '%Search%' });
            } catch (e) {
                done(e);
            }
            done();
            return [200];
        });
        API.getTags('%Search%');
    });
    it('updateTag', (done) => {
        mockAxios.onPut().reply((data) => {
            try {
                expect(data.baseURL).toBe('/rest/geostore/');
                expect(data.url).toBe('/resources/tag/1');
                expect(data.data).toBe('<Tag><name><![CDATA[Name]]></name><description><![CDATA[Description]]></description><color>#ff0000</color></Tag>');
            } catch (e) {
                done(e);
            }
            done();
            return [200];
        });
        API.updateTag({ id: '1', name: 'Name', description: 'Description', color: '#ff0000' });
    });
    it('updateTag (create)', (done) => {
        mockAxios.onPost().reply((data) => {
            try {
                expect(data.baseURL).toBe('/rest/geostore/');
                expect(data.url).toBe('/resources/tag');
                expect(data.data).toBe('<Tag><name><![CDATA[Name]]></name><description><![CDATA[Description]]></description><color>#ff0000</color></Tag>');
            } catch (e) {
                done(e);
            }
            done();
            return [200];
        });
        API.updateTag({ name: 'Name', description: 'Description', color: '#ff0000' });
    });
    it('deleteTag', (done) => {
        mockAxios.onDelete().reply((data) => {
            try {
                expect(data.baseURL).toBe('/rest/geostore/');
                expect(data.url).toBe('/resources/tag/1');
            } catch (e) {
                done(e);
            }
            done();
            return [200];
        });
        API.deleteTag('1');
    });
    it('linkTagToResource', (done) => {
        mockAxios.onPost().reply((data) => {
            try {
                expect(data.baseURL).toBe('/rest/geostore/');
                expect(data.url).toBe('/resources/tag/1/resource/2');
            } catch (e) {
                done(e);
            }
            done();
            return [200];
        });
        API.linkTagToResource('1', '2');
    });
    it('unlinkTagFromResource', (done) => {
        mockAxios.onDelete().reply((data) => {
            try {
                expect(data.baseURL).toBe('/rest/geostore/');
                expect(data.url).toBe('/resources/tag/1/resource/2');
            } catch (e) {
                done(e);
            }
            done();
            return [200];
        });
        API.unlinkTagFromResource('1', '2');
    });

    it('addFavoriteResource', (done) => {
        mockAxios.onPost().reply((data) => {
            try {
                expect(data.url).toEqual('/users/user/10/favorite/15');
                done();
            } catch (e) {
                done(e);
            }
            return [200];
        });
        API.addFavoriteResource("10", "15");
    });
    it('removeFavoriteResource', (done) => {
        mockAxios.onDelete().reply((data) => {
            try {
                expect(data.url).toEqual('/users/user/10/favorite/15');
                done();
            } catch (e) {
                done(e);
            }
            return [200];
        });
        API.removeFavoriteResource("10", "15");
    });
});
