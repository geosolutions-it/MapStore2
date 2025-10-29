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

    it('test get request configuration rule for an url', () => {
        // Set up request configuration rules (converted from old authenticationRules format)
        // Note: unsupported methods are filtered out, so we expect 2 rules (geoserver and some-site)
        const requestConfigRules = SecurityUtils.convertAuthenticationRulesToRequestConfiguration(authenticationRules);
        expect(requestConfigRules.length).toBe(2);

        // Set the rules in config
        ConfigUtils.setConfigProp('requestsConfigurationRules', requestConfigRules);
        setSecurityInfo(securityInfoToken);

        // Test basic authentication rule should be found and converted
        let rule = SecurityUtils.getRequestConfigurationRule('http://www.some-site.com/index?parameter1=value1&parameter2=value2');
        expect(rule).toExist();
        expect(rule.urlPattern).toBe('.*some-site.*');

        // Test authkey authentication rule should be found
        rule = SecurityUtils.getRequestConfigurationRule('http://www.some-site.com/geoserver?parameter1=value1&parameter2=value2');
        expect(rule).toExist();

        // Test that no rule matches
        rule = SecurityUtils.getRequestConfigurationRule('http://www.no-matching.com/?parameter1=value1&parameter2=value2');
        expect(rule).toNotExist();
    });

    it('test add authkey authentication to url', () => {
        // Convert authentication rules to new format and set them
        const requestConfigRules = SecurityUtils.convertAuthenticationRulesToRequestConfiguration(authenticationRules);
        ConfigUtils.setConfigProp("useAuthenticationRules", true);
        ConfigUtils.setConfigProp('requestsConfigurationRules', requestConfigRules);
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
        ConfigUtils.setConfigProp('requestsConfigurationRules', []);
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
        const creds = {username: "testuser", password: "testpass"};
        SecurityUtils.setCredentials("id2", creds);
        setSecurityInfo(securityInfoToken);
        ConfigUtils.setConfigProp("useAuthenticationRules", false);
        // Use a rule that doesn't match, so it falls back to sourceId basic auth
        ConfigUtils.setConfigProp('requestsConfigurationRules', []);

        const result = SecurityUtils.getAuthenticationHeaders("http://other-site.com/something", null, {sourceId: "id2"});
        expect(result).toExist();
        expect(result.Authorization).toExist();
        expect(result.Authorization).toInclude('Basic');
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

    describe('getRequestConfigurationByUrl', () => {
        it('should return empty object when not activated', () => {
            ConfigUtils.setConfigProp('requestsConfigurationRules', null);
            const result = SecurityUtils.getRequestConfigurationByUrl('https://example.com/api');
            expect(result).toEqual({});
        });

        it('should return headers configuration with Bearer token', () => {
            const rules = [
                {
                    urlPattern: '.*api.*',
                    headers: { 'Authorization': 'Bearer ${securityToken}' }
                }
            ];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);
            ConfigUtils.setConfigProp('useAuthenticationRules', true);
            setSecurityInfo(securityInfoToken);

            const result = SecurityUtils.getRequestConfigurationByUrl('https://example.com/api');
            expect(result.headers).toExist();
            expect(result.headers.Authorization).toBe('Bearer goodtoken');
        });

        it('should return params configuration with authkey', () => {
            const rules = [
                {
                    urlPattern: '.*geoserver.*',
                    params: { 'authkey': '${securityToken}' }
                }
            ];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);
            ConfigUtils.setConfigProp('useAuthenticationRules', true);
            setSecurityInfo(securityInfoToken);

            const result = SecurityUtils.getRequestConfigurationByUrl('https://example.com/geoserver/wms');
            expect(result.params).toExist();
            expect(result.params.authkey).toBe('goodtoken');
        });

        it('should use sourceId for basic auth when provided', () => {
            const creds = {username: "testuser", password: "testpass"};
            SecurityUtils.setCredentials("source123", creds);

            const result = SecurityUtils.getRequestConfigurationByUrl('https://example.com/api', null, "source123");
            expect(result.headers).toExist();
            expect(result.headers.Authorization).toExist();
        });
    });

    describe('isRequestConfigurationActivated', () => {
        it('should return false when user has no token', () => {
            setSecurityInfo(securityInfoA); // No token
            const result = SecurityUtils.isRequestConfigurationActivated();
            expect(result).toBe(false);
        });

        it('should return true when user has token and rules exist in state', () => {
            const stateWithRules = {
                user: securityInfoC.user,
                token: 'test-token',
                rules: [
                    {
                        urlPattern: '.*api.*',
                        headers: { 'Authorization': 'Bearer ${securityToken}' }
                    }
                ]
            };
            setSecurityInfo(stateWithRules);
            const result = SecurityUtils.isRequestConfigurationActivated();
            expect(result).toBe(true);
        });

        it('should return true when user has token and rules exist in config', () => {
            setSecurityInfo(securityInfoToken);
            ConfigUtils.setConfigProp('requestsConfigurationRules', [
                {
                    urlPattern: '.*api.*',
                    headers: { 'Authorization': 'Bearer ${securityToken}' }
                }
            ]);
            const result = SecurityUtils.isRequestConfigurationActivated();
            expect(result).toBe(true);
        });

        it('should return true for legacy authenticationRules when enabled', () => {
            setSecurityInfo(securityInfoToken);
            ConfigUtils.setConfigProp('authenticationRules', authenticationRules);
            ConfigUtils.setConfigProp('useAuthenticationRules', true);
            const result = SecurityUtils.isRequestConfigurationActivated();
            expect(result).toBe(true);
        });
    });

    describe('convertAuthenticationRulesToRequestConfiguration', () => {
        it('should convert bearer method', () => {
            const authRules = [
                { urlPattern: '.*api.*', method: 'bearer' }
            ];
            const result = SecurityUtils.convertAuthenticationRulesToRequestConfiguration(authRules);
            expect(result.length).toBe(1);
            expect(result[0].urlPattern).toBe('.*api.*');
            expect(result[0].headers.Authorization).toBe('Bearer ${securityToken}');
        });

        it('should convert authkey method', () => {
            const authRules = [
                { urlPattern: '.*geoserver.*', method: 'authkey', authkeyParamName: 'token' }
            ];
            const result = SecurityUtils.convertAuthenticationRulesToRequestConfiguration(authRules);
            expect(result.length).toBe(1);
            expect(result[0].urlPattern).toBe('.*geoserver.*');
            expect(result[0].params.token).toBe('${securityToken}');
        });

        it('should convert basic method', () => {
            const authRules = [
                { urlPattern: '.*api.*', method: 'basic' }
            ];
            const result = SecurityUtils.convertAuthenticationRulesToRequestConfiguration(authRules);
            expect(result.length).toBe(1);
            expect(result[0].headers.Authorization).toBe('${securityToken}');
        });

        it('should convert header method', () => {
            const authRules = [
                {
                    urlPattern: '.*api.*',
                    method: 'header',
                    headers: { 'X-API-Key': 'test123' }
                }
            ];
            const result = SecurityUtils.convertAuthenticationRulesToRequestConfiguration(authRules);
            expect(result.length).toBe(1);
            expect(result[0].headers['X-API-Key']).toBe('test123');
        });

        it('should convert browserWithCredentials method', () => {
            const authRules = [
                { urlPattern: '.*api.*', method: 'browserWithCredentials' }
            ];
            const result = SecurityUtils.convertAuthenticationRulesToRequestConfiguration(authRules);
            expect(result.length).toBe(1);
            expect(result[0].withCredentials).toBe(true);
        });

        it('should filter out unsupported methods', () => {
            const authRules = [
                { urlPattern: '.*api.*', method: 'bearer' },
                { urlPattern: '.*unsupported.*', method: 'unsupported' }
            ];
            const result = SecurityUtils.convertAuthenticationRulesToRequestConfiguration(authRules);
            expect(result.length).toBe(1);
            expect(result[0].urlPattern).toBe('.*api.*');
        });
    });

    describe('getRequestConfigurationRules', () => {
        it('should return rules from Redux state first', () => {
            const rulesInState = [
                { urlPattern: '.*api.*', headers: { 'Authorization': 'Bearer ${securityToken}' } }
            ];
            setSecurityInfo({ user: securityInfoToken.user, token: 'test', rules: rulesInState });

            const result = SecurityUtils.getRequestConfigurationRules();
            expect(result).toEqual(rulesInState);
        });

        it('should return rules from config when state is empty', () => {
            const rulesInConfig = [
                { urlPattern: '.*api.*', headers: { 'Authorization': 'Bearer ${securityToken}' } }
            ];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rulesInConfig);

            const result = SecurityUtils.getRequestConfigurationRules();
            expect(result).toEqual(rulesInConfig);
        });

        it('should convert legacy authenticationRules when new format missing', () => {
            ConfigUtils.setConfigProp('requestsConfigurationRules', null);
            ConfigUtils.setConfigProp('authenticationRules', authenticationRules);

            const result = SecurityUtils.getRequestConfigurationRules();
            // Unsupported methods are filtered out, so we expect 2 rules
            expect(result.length).toBe(2);
            expect(result[0].urlPattern).toBe('.*geoserver.*');
        });
    });

    describe('getAuthKeyParameter', () => {
        it('should return authkey parameter from rule', () => {
            const rules = [
                {
                    urlPattern: '.*api.*',
                    params: { 'customAuthKey': '${securityToken}' }
                }
            ];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);

            const result = SecurityUtils.getAuthKeyParameter('https://example.com/api');
            expect(result).toBe('customAuthKey');
        });

        it('should return default authkey when no rule found', () => {
            ConfigUtils.setConfigProp('requestsConfigurationRules', null);

            const result = SecurityUtils.getAuthKeyParameter('https://example.com/api');
            expect(result).toBe('authkey');
        });
    });

    describe('addAuthenticationParameter', () => {
        it('should add authentication params to existing parameters object', () => {
            const rules = [
                {
                    urlPattern: '.*geoserver.*',
                    params: { 'authkey': '${securityToken}' }
                }
            ];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);
            ConfigUtils.setConfigProp('useAuthenticationRules', true);
            setSecurityInfo(securityInfoToken);

            const existingParams = { param1: 'value1' };
            const result = SecurityUtils.addAuthenticationParameter('https://geoserver.example.com/wms', existingParams);

            expect(result).toExist();
            expect(result.param1).toBeTruthy();
            expect(result.authkey).toBeTruthy();
            expect(result.authkey).toBe('goodtoken');
        });

        it('should not mutate original parameters object', () => {
            const rules = [
                {
                    urlPattern: '.*geoserver.*',
                    params: { 'authkey': '${securityToken}' }
                }
            ];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);
            ConfigUtils.setConfigProp('useAuthenticationRules', true);
            setSecurityInfo(securityInfoToken);

            const originalParams = { param1: 'value1' };
            const result = SecurityUtils.addAuthenticationParameter('https://geoserver.example.com/wms', originalParams);

            expect(result).toExist();
            expect(originalParams).toEqual({ param1: 'value1' }); // Original unchanged
            expect(result).toNotEqual(originalParams); // New object
        });

        it('should return original params when no auth params available', () => {
            ConfigUtils.setConfigProp('requestsConfigurationRules', null);
            const params = { param1: 'value1' };

            const result = SecurityUtils.addAuthenticationParameter('https://example.com/api', params);
            expect(result).toEqual(params);
        });

        it('should pass sourceId to getRequestConfigurationByUrl', () => {
            const creds = { username: "testuser", password: "testpass" };
            SecurityUtils.setCredentials("testSource", creds);

            const params = { param1: 'value1' };
            const result = SecurityUtils.addAuthenticationParameter('https://example.com/api', params, null, "testSource");

            expect(result).toExist();
            expect(result.param1).toBe('value1');
        });
    });

    describe('addAuthenticationToSLD', () => {
        it('should add authentication to SLD URL', () => {
            const rules = [
                {
                    urlPattern: '.*geoserver.*',
                    params: { 'authkey': '${securityToken}' }
                }
            ];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);
            ConfigUtils.setConfigProp('useAuthenticationRules', true);
            setSecurityInfo(securityInfoToken);

            const layerParams = {
                SLD: 'http://geoserver.example.com/sld?LAYER=layer1'
            };
            const options = { securityToken: 'testtoken' };

            const result = SecurityUtils.addAuthenticationToSLD(layerParams, options);
            expect(result.SLD).toInclude('authkey=testtoken');
        });

        it('should return original layerParams when no SLD', () => {
            const layerParams = { LAYERS: 'layer1' };
            const options = { securityToken: 'testtoken' };

            const result = SecurityUtils.addAuthenticationToSLD(layerParams, options);
            expect(result).toEqual(layerParams);
        });
    });

    describe('getAuthenticationHeaders', () => {
        it('should return headers from request config', () => {
            const rules = [
                {
                    urlPattern: '.*api.*',
                    headers: { 'Authorization': 'Bearer ${securityToken}' }
                }
            ];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);
            ConfigUtils.setConfigProp('useAuthenticationRules', true);
            setSecurityInfo(securityInfoToken);

            const result = SecurityUtils.getAuthenticationHeaders('https://api.example.com', null);
            expect(result).toExist();
            expect(result.Authorization).toBe('Bearer goodtoken');
        });

        it('should return null when no headers available', () => {
            ConfigUtils.setConfigProp('requestsConfigurationRules', null);

            const result = SecurityUtils.getAuthenticationHeaders('https://api.example.com', null);
            expect(result).toBe(null);
        });

        it('should use sourceId for basic auth', () => {
            const creds = { username: "testuser", password: "testpass" };
            SecurityUtils.setCredentials("testSource", creds);

            const result = SecurityUtils.getAuthenticationHeaders('https://api.example.com', null, { sourceId: "testSource" });
            expect(result).toExist();
            expect(result.Authorization).toExist();
        });
    });

    describe('getToken', () => {
        it('should return token from security info', () => {
            setSecurityInfo(securityInfoToken);
            const token = SecurityUtils.getToken();
            expect(token).toBe('goodtoken');
        });

        it('should return null when no token', () => {
            setSecurityInfo(securityInfoA);
            const token = SecurityUtils.getToken();
            expect(token).toBe(undefined);
        });
    });

    describe('getBasicAuthHeader', () => {
        it('should return basic auth header', () => {
            const securityInfoWithAuth = { ...securityInfoToken, authHeader: 'Basic dGVzdDp0ZXN0' };
            setSecurityInfo(securityInfoWithAuth);
            const authHeader = SecurityUtils.getBasicAuthHeader();
            expect(authHeader).toBe('Basic dGVzdDp0ZXN0');
        });
    });

    describe('getRefreshToken', () => {
        it('should return refresh token', () => {
            const securityInfoWithRefresh = { ...securityInfoToken, refresh_token: 'refresh-token-123' };
            setSecurityInfo(securityInfoWithRefresh);
            const refreshToken = SecurityUtils.getRefreshToken();
            expect(refreshToken).toBe('refresh-token-123');
        });
    });

    describe('getUser', () => {
        it('should return user from security info', () => {
            setSecurityInfo(securityInfoToken);
            const user = SecurityUtils.getUser();
            expect(user).toExist();
            expect(user.name).toBe(securityInfoC.user.name);
        });

        it('should return undefined when no user', () => {
            setSecurityInfo({});
            const user = SecurityUtils.getUser();
            expect(user).toBe(undefined);
        });
    });

    describe('getSecurityInfo', () => {
        it('should return security info object', () => {
            setSecurityInfo(securityInfoToken);
            const info = SecurityUtils.getSecurityInfo();
            expect(info).toExist();
            expect(info.user).toExist();
            expect(info.token).toBe('goodtoken');
        });

        it('should return empty object when no security info', () => {
            setSecurityInfo({});
            const info = SecurityUtils.getSecurityInfo();
            expect(info).toEqual({});
        });
    });

    describe('addAuthenticationToUrl', () => {
        it('should add authkey parameter to URL when activated', () => {
            const rules = [
                {
                    urlPattern: '.*geoserver.*',
                    params: { 'authkey': '${securityToken}' }
                }
            ];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);
            ConfigUtils.setConfigProp('useAuthenticationRules', true);
            setSecurityInfo(securityInfoToken);

            const url = 'http://geoserver.example.com/wms?LAYERS=layer1';
            const result = SecurityUtils.addAuthenticationToUrl(url);
            expect(result).toInclude('authkey=goodtoken');
        });

        it('should return original URL when not activated', () => {
            ConfigUtils.setConfigProp('requestsConfigurationRules/E', null);

            const url = 'http://geoserver.example.com/wms?LAYERS=layer1';
            const result = SecurityUtils.addAuthenticationToUrl(url);
            expect(result).toBe(url);
        });

        it('should return original URL when null', () => {
            const result = SecurityUtils.addAuthenticationToUrl(null);
            expect(result).toBe(null);
        });
    });

    describe('cleanAuthParamsFromURL', () => {
        it('should remove authkey parameter from URL', () => {
            const rules = [
                {
                    urlPattern: '.*geoserver.*',
                    params: { 'authkey': '${securityToken}' }
                }
            ];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);

            const url = 'http://geoserver.example.com/wms?LAYERS=layer1&authkey=test123';
            const result = SecurityUtils.cleanAuthParamsFromURL(url);
            expect(result).toNotInclude('authkey');
        });

        it('should handle URLs without auth parameters', () => {
            const url = 'http://example.com/api?param1=value1';
            const result = SecurityUtils.cleanAuthParamsFromURL(url);
            expect(result).toExist();
        });
    });
});
