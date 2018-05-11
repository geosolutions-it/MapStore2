/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const API = require('../GeoStoreDAO');
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
    it('test security rules utils (writeSecurityRules)', () => {
        const payload = API.writeSecurityRules(SAMPLE_RULES.SecurityRuleList);
        expect(payload).toBe(SAMPLE_XML_RULES);
    });
    it('test generate meatadata', () => {
        const payload = API.generateMetadata("Special & chars", "&<>'\"");
        expect(payload).toBe('<description><![CDATA[&<>\'"]]></description><metadata></metadata><name><![CDATA[Special & chars]]></name>');
    });
});
