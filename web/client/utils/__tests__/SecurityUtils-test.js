/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from "expect";

import SecurityUtils from "../SecurityUtils";
import ConfigUtils from "../ConfigUtils";
import {setStore} from "../StateUtils";

function setSecurityInfo(info) {
    setStore({
        getState: () => ({
            security: info
        })
    });
}

const userA = {
    User: {
        enabled: true,
        groups: "",
        id: 6,
        name: "adminA",
        role: "ADMIN"
    }
};

const securityInfoA = {
    user: userA
};

const userB = Object.assign({}, userA, {
    name: "adminB",
    attribute: {
        name: "UUID",
        value: "263c6917-543f-43e3-8e1a-6a0d29952f72"
    }
});

const securityInfoB = {
    user: userB,
    token: "263c6917-543f-43e3-8e1a-6a0d29952f72"
};

const userC = Object.assign({}, userA, {
    name: "adminC",
    attribute: [{
        name: "UUID",
        value: "263c6917-543f-43e3-8e1a-6a0d29952f72"
    }, {
        name: "description",
        value: "admin user"
    }
    ]});

const securityInfoC = {
    user: userC,
    token: "263c6917-543f-43e3-8e1a-6a0d29952f72"
};

const securityInfoToken = {
    user: userC,
    token: "goodtoken"
};

const authenticationRules = [
    {
        "urlPattern": ".*geoserver.*",
        "method": "authkey"
    },
    {
        "urlPattern": ".*not-supported.*",
        "method": "not-supported"
    },
    {
        "urlPattern": ".*some-site.*",
        "method": "basic"
    }
];

const tokenAuthenticationRules = [
    {
        "urlPattern": ".*a test url.*",
        "method": "authkey"
    }
];

const headerAuthenticationRules = [
    {
        "urlPattern": ".*header-site.*",
        "method": "header",
        "headers": {
            "X-Auth-Token": "goodtoken"
        }
    }
];

describe('Test security utils methods', () => {
    afterEach(() => {
        expect.restoreSpies();
        setStore({});
        ConfigUtils.setConfigProp("authenticationRules", null);
        ConfigUtils.setConfigProp("useAuthenticationRules", false);
    });

    it('test getting user attributes', () => {
        // test a null user
        let attributes = SecurityUtils.getUserAttributes();
        expect(attributes).toBeAn("array");
        expect(attributes.length).toBe(0);
        // test user with no attributes
        setSecurityInfo(securityInfoA);
        attributes = SecurityUtils.getUserAttributes();
        expect(attributes).toBeAn("array");
        expect(attributes.length).toBe(0);
        // test user with a single attribute
        setSecurityInfo(securityInfoB);
        attributes = SecurityUtils.getUserAttributes();
        expect(attributes).toBeAn("array");
        expect(attributes.length).toBe(1);
        expect(attributes).toInclude({
            name: "UUID",
            value: "263c6917-543f-43e3-8e1a-6a0d29952f72"
        });
        // test user with multiple attributes
        setSecurityInfo(securityInfoC);
        attributes = SecurityUtils.getUserAttributes();
        expect(attributes).toBeAn("array");
        expect(attributes.length).toBe(2);
        expect(attributes).toInclude({
            name: "UUID",
            value: "263c6917-543f-43e3-8e1a-6a0d29952f72"
        });
        expect(attributes).toInclude({
            name: "description",
            value: "admin user"
        });
    });

    it('test find user attribute', () => {
        // test a null user
        let attribute = SecurityUtils.findUserAttribute("uuid");
        expect(attribute).toNotExist();
        // test user with no attributes
        setSecurityInfo(securityInfoA);
        attribute = SecurityUtils.findUserAttribute("uuid");
        expect(attribute).toNotExist();
        // test user with a single attribute
        setSecurityInfo(securityInfoB);
        attribute = SecurityUtils.findUserAttribute("uuid");
        expect(attribute).toEqual({
            name: "UUID",
            value: "263c6917-543f-43e3-8e1a-6a0d29952f72"
        });
        // test user with multiple attributes
        setSecurityInfo(securityInfoC);
        attribute = SecurityUtils.findUserAttribute("uuid");
        expect(attribute).toEqual({
            name: "UUID",
            value: "263c6917-543f-43e3-8e1a-6a0d29952f72"
        });
    });

    it('test find user attribute value', () => {
        // test a null user
        let attributeValue = SecurityUtils.findUserAttributeValue("uuid");
        expect(attributeValue).toNotExist();
        // test user with no attributes
        setSecurityInfo(securityInfoA);
        attributeValue = SecurityUtils.findUserAttributeValue("uuid");
        expect(attributeValue).toNotExist();
        // test user with a single attribute
        setSecurityInfo(securityInfoB);
        attributeValue = SecurityUtils.findUserAttributeValue("uuid");
        expect(attributeValue).toBe("263c6917-543f-43e3-8e1a-6a0d29952f72");
        // test user with multiple attributes
        setSecurityInfo(securityInfoC);
        attributeValue = SecurityUtils.findUserAttributeValue("uuid");
        expect(attributeValue).toBe("263c6917-543f-43e3-8e1a-6a0d29952f72");
    });

    it('test get authentication method for an url', () => {
        // mocking the authentication rules
        ConfigUtils.setConfigProp('authenticationRules', authenticationRules);
        expect(SecurityUtils.getAuthenticationRules().length).toBe(3);
        // basic authentication should be found
        let authenticationMethod = SecurityUtils.getAuthenticationMethod('http://www.some-site.com/index?parameter1=value1&parameter2=value2');
        expect(authenticationMethod).toBe('basic');
        // authkey authentication should be found
        authenticationMethod = SecurityUtils.getAuthenticationMethod('http://www.some-site.com/geoserver?parameter1=value1&parameter2=value2');
        expect(authenticationMethod).toBe('authkey');
        // not-supported authentication should be found
        authenticationMethod = SecurityUtils.getAuthenticationMethod('http://www.not-supported.com/?parameter1=value1&parameter2=value2');
        expect(authenticationMethod).toBe('not-supported');
        // no authentication method found
        authenticationMethod = SecurityUtils.getAuthenticationMethod('http://www.no-authentication.com/?parameter1=value1&parameter2=value2');
        expect(authenticationMethod).toNotExist();
    });

    it('test add authkey authentication to url', () => {
        // mocking the authentication rules
        ConfigUtils.setConfigProp("useAuthenticationRules", true);
        ConfigUtils.setConfigProp('authenticationRules', authenticationRules);
        expect(SecurityUtils.getAuthenticationRules().length).toBe(3);
        // authkey authentication with no user
        let urlWithAuthentication = SecurityUtils.addAuthenticationToUrl('http://www.some-site.com/geoserver?parameter1=value1&parameter2=value2');
        expect(urlWithAuthentication).toBe('http://www.some-site.com/geoserver?parameter1=value1&parameter2=value2');
        // authkey authentication with user not providing a uuid
        setSecurityInfo(securityInfoA);
        urlWithAuthentication = SecurityUtils.addAuthenticationToUrl('http://www.some-site.com/geoserver?parameter1=value1&parameter2=value2');
        expect(urlWithAuthentication).toBe('http://www.some-site.com/geoserver?parameter1=value1&parameter2=value2');
        // authkey authentication with a user providing a uuid
        setSecurityInfo(securityInfoC);
        urlWithAuthentication = SecurityUtils.addAuthenticationToUrl('http://www.some-site.com/geoserver?parameter1=value1&parameter2=value2');
        expect(urlWithAuthentication).toBe('http://www.some-site.com/geoserver?parameter1=value1&parameter2=value2&authkey=263c6917-543f-43e3-8e1a-6a0d29952f72');
        // basic authentication with a user providing a uuid
        setSecurityInfo(securityInfoC);
        urlWithAuthentication = SecurityUtils.addAuthenticationToUrl('http://www.some-site.com/index?parameter1=value1&parameter2=value2');
        expect(urlWithAuthentication).toBe('http://www.some-site.com/index?parameter1=value1&parameter2=value2');
        // authkey authentication with a user providing a uuid but authentication deactivated
        ConfigUtils.setConfigProp("useAuthenticationRules", false);
        setSecurityInfo(securityInfoC);
        urlWithAuthentication = SecurityUtils.addAuthenticationToUrl('http://www.some-site.com/geoserver?parameter1=value1&parameter2=value2');
        expect(urlWithAuthentication).toBe('http://www.some-site.com/geoserver?parameter1=value1&parameter2=value2');
    });
    it('test addAuthenticationParameter for authkey', () => {
        setSecurityInfo(securityInfoToken);
        ConfigUtils.setConfigProp("useAuthenticationRules", true);
        ConfigUtils.setConfigProp('authenticationRules', tokenAuthenticationRules);
        expect(SecurityUtils.addAuthenticationParameter("a test url", null)).toEqual({'authkey': 'goodtoken'});
    });
    it('test getAuthenticationHeaders for header rule', () => {
        setSecurityInfo(securityInfoToken);
        ConfigUtils.setConfigProp("useAuthenticationRules", true);
        ConfigUtils.setConfigProp('authenticationRules', headerAuthenticationRules);
        expect(SecurityUtils.getAuthenticationHeaders("http://header-site.com/something", null)).toEqual({'X-Auth-Token': 'goodtoken'});
    });
    it('test getAuthenticationHeaders using basic auth', () => {
        setSecurityInfo(securityInfoToken);
        ConfigUtils.setConfigProp("useAuthenticationRules", true);
        ConfigUtils.setConfigProp('authenticationRules', headerAuthenticationRules);
        expect(SecurityUtils.getAuthenticationHeaders("http://header-site.com/something", null, {sourceId: "id2"})).toEqual({Authorization: "Basic dW5kZWZpbmVkOnVuZGVmaW5lZA=="});
    });
    it('cleanAuthParamsFromURL', () => {
        // mocking the authentication rules
        expect(SecurityUtils.cleanAuthParamsFromURL('http://www.some-site.com/geoserver?parameter1=value1&parameter2=value2&authkey=SOME_AUTH_KEY').indexOf('authkey')).toBe(-1);
    });
    it('clearNilValuesForParams', () => {
        const emptyParams = {};
        const nullUndefinedParams = {
            "NULL": null,
            "UNDEF": undefined
        };
        const validAndInvalidParams = {
            ...nullUndefinedParams,
            "param1": "some val"
        };
        let cleanParams = SecurityUtils.clearNilValuesForParams(emptyParams);
        expect(cleanParams).toEqual(emptyParams);

        cleanParams = SecurityUtils.clearNilValuesForParams(nullUndefinedParams);
        expect(cleanParams).toEqual(emptyParams);

        cleanParams = SecurityUtils.clearNilValuesForParams(validAndInvalidParams);
        expect(cleanParams).toEqual({"param1": "some val"});
    });
    it('setCredentials & getCredentials ', () => {
        const creds = {data: "value"};
        SecurityUtils.setCredentials("id", creds);
        expect(SecurityUtils.getCredentials("id")).toEqual(creds);
    });
    it('getAuthorizationBasic ', () => {
        const creds = {username: "u", password: "p"};
        SecurityUtils.setCredentials("id", creds);
        let headers = SecurityUtils.getAuthorizationBasic("id");
        expect(headers).toEqual({Authorization: "Basic dTpw"});

        headers = SecurityUtils.getAuthorizationBasic();
        expect(headers).toEqual({});
    });
});
