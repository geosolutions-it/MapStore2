/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

const SecurityUtils = require('../SecurityUtils');
const assign = require('object-assign');

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

const userB = assign({}, userA, {
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

const userC = assign({}, userA, {
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

describe('Test security utils methods', () => {
    afterEach(() => {
        expect.restoreSpies();
    });

    it('test getting user attributes', () => {
        // test a null user
        expect.spyOn(SecurityUtils, 'getSecurityInfo').mockReturnValue(null);
        let attributes = SecurityUtils.getUserAttributes();
        expect(attributes).toBeInstanceOf(Array);
        expect(attributes.length).toBe(0);
        // test user with no attributes
        expect.spyOn(SecurityUtils, 'getSecurityInfo').mockReturnValue(securityInfoA);
        attributes = SecurityUtils.getUserAttributes();
        expect(attributes).toBeInstanceOf(Array);
        expect(attributes.length).toBe(0);
        // test user with a single attribute
        expect.spyOn(SecurityUtils, 'getSecurityInfo').mockReturnValue(securityInfoB);
        attributes = SecurityUtils.getUserAttributes();
        expect(attributes).toBeInstanceOf(Array);
        expect(attributes.length).toBe(1);
        expect(attributes).toContainEqual({
            name: "UUID",
            value: "263c6917-543f-43e3-8e1a-6a0d29952f72"
        });
        // test user with multiple attributes
        expect.spyOn(SecurityUtils, 'getSecurityInfo').mockReturnValue(securityInfoC);
        attributes = SecurityUtils.getUserAttributes();
        expect(attributes).toBeInstanceOf(Array);
        expect(attributes.length).toBe(2);
        expect(attributes).toContainEqual({
            name: "UUID",
            value: "263c6917-543f-43e3-8e1a-6a0d29952f72"
        });
        expect(attributes).toContainEqual({
            name: "description",
            value: "admin user"
        });
    });

    it('test find user attribute', () => {
        // test a null user
        expect.spyOn(SecurityUtils, 'getSecurityInfo').mockReturnValue(null);
        let attribute = SecurityUtils.findUserAttribute("uuid");
        expect(attribute).toBeFalsy();
        // test user with no attributes
        expect.spyOn(SecurityUtils, 'getSecurityInfo').mockReturnValue(securityInfoA);
        attribute = SecurityUtils.findUserAttribute("uuid");
        expect(attribute).toBeFalsy();
        // test user with a single attribute
        expect.spyOn(SecurityUtils, 'getSecurityInfo').mockReturnValue(securityInfoB);
        attribute = SecurityUtils.findUserAttribute("uuid");
        expect(attribute).toEqual({
            name: "UUID",
            value: "263c6917-543f-43e3-8e1a-6a0d29952f72"
        });
        // test user with multiple attributes
        expect.spyOn(SecurityUtils, 'getSecurityInfo').mockReturnValue(securityInfoC);
        attribute = SecurityUtils.findUserAttribute("uuid");
        expect(attribute).toEqual({
            name: "UUID",
            value: "263c6917-543f-43e3-8e1a-6a0d29952f72"
        });
    });

    it('test find user attribute value', () => {
        // test a null user
        expect.spyOn(SecurityUtils, 'getSecurityInfo').mockReturnValue(null);
        let attributeValue = SecurityUtils.findUserAttributeValue("uuid");
        expect(attributeValue).toBeFalsy();
        // test user with no attributes
        expect.spyOn(SecurityUtils, 'getSecurityInfo').mockReturnValue(securityInfoA);
        attributeValue = SecurityUtils.findUserAttributeValue("uuid");
        expect(attributeValue).toBeFalsy();
        // test user with a single attribute
        expect.spyOn(SecurityUtils, 'getSecurityInfo').mockReturnValue(securityInfoB);
        attributeValue = SecurityUtils.findUserAttributeValue("uuid");
        expect(attributeValue).toBe("263c6917-543f-43e3-8e1a-6a0d29952f72");
        // test user with multiple attributes
        expect.spyOn(SecurityUtils, 'getSecurityInfo').mockReturnValue(securityInfoC);
        attributeValue = SecurityUtils.findUserAttributeValue("uuid");
        expect(attributeValue).toBe("263c6917-543f-43e3-8e1a-6a0d29952f72");
    });

    it('test get authentication method for an url', () => {
        // mocking the authentication rules
        expect.spyOn(SecurityUtils, 'getAuthenticationRules').mockReturnValue(authenticationRules);
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
        expect(authenticationMethod).toBeFalsy();
    });

    it('test add authkey authentication to url', () => {
        // mocking the authentication rules
        expect.spyOn(SecurityUtils, 'isAuthenticationActivated').mockReturnValue(true);
        expect.spyOn(SecurityUtils, 'getAuthenticationRules').mockReturnValue(authenticationRules);
        expect(SecurityUtils.getAuthenticationRules().length).toBe(3);
        // authkey authentication with no user
        expect.spyOn(SecurityUtils, 'getSecurityInfo').mockReturnValue(null);
        let urlWithAuthentication = SecurityUtils.addAuthenticationToUrl('http://www.some-site.com/geoserver?parameter1=value1&parameter2=value2');
        expect(urlWithAuthentication).toBe('http://www.some-site.com/geoserver?parameter1=value1&parameter2=value2');
        // authkey authentication with user not providing a uuid
        expect.spyOn(SecurityUtils, 'getSecurityInfo').mockReturnValue(securityInfoA);
        urlWithAuthentication = SecurityUtils.addAuthenticationToUrl('http://www.some-site.com/geoserver?parameter1=value1&parameter2=value2');
        expect(urlWithAuthentication).toBe('http://www.some-site.com/geoserver?parameter1=value1&parameter2=value2');
        // authkey authentication with a user providing a uuid
        expect.spyOn(SecurityUtils, 'getSecurityInfo').mockReturnValue(securityInfoC);
        urlWithAuthentication = SecurityUtils.addAuthenticationToUrl('http://www.some-site.com/geoserver?parameter1=value1&parameter2=value2');
        expect(urlWithAuthentication).toBe('http://www.some-site.com/geoserver?parameter1=value1&parameter2=value2&authkey=263c6917-543f-43e3-8e1a-6a0d29952f72');
        // basic authentication with a user providing a uuid
        expect.spyOn(SecurityUtils, 'getSecurityInfo').mockReturnValue(securityInfoC);
        urlWithAuthentication = SecurityUtils.addAuthenticationToUrl('http://www.some-site.com/index?parameter1=value1&parameter2=value2');
        expect(urlWithAuthentication).toBe('http://www.some-site.com/index?parameter1=value1&parameter2=value2');
        // authkey authentication with a user providing a uuid but authentication deactivated
        expect.spyOn(SecurityUtils, 'isAuthenticationActivated').mockReturnValue(false);
        expect.spyOn(SecurityUtils, 'getSecurityInfo').mockReturnValue(securityInfoC);
        urlWithAuthentication = SecurityUtils.addAuthenticationToUrl('http://www.some-site.com/geoserver?parameter1=value1&parameter2=value2');
        expect(urlWithAuthentication).toBe('http://www.some-site.com/geoserver?parameter1=value1&parameter2=value2');
    });
    it('test addAuthenticationParameter for authkey', () => {
        expect.spyOn(SecurityUtils, 'getAuthenticationMethod').mockReturnValue("authkey");
        expect.spyOn(SecurityUtils, 'getToken').mockReturnValue("goodtoken");
        expect.spyOn(SecurityUtils, 'isAuthenticationActivated').mockReturnValue(true);
        expect(SecurityUtils.addAuthenticationParameter("a test url", null)).toEqual({'authkey': 'goodtoken'});
    });
    it('cleanAuthParamsFromURL', () => {
        // mocking the authentication rules
        expect.spyOn(SecurityUtils, 'isAuthenticationActivated').mockReturnValue(true);
        expect.spyOn(SecurityUtils, 'getAuthenticationRules').mockReturnValue(authenticationRules);
        expect.spyOn(SecurityUtils, 'getSecurityInfo').mockReturnValue(securityInfoC);
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
});
