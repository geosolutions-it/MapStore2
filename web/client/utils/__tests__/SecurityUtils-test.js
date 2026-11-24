/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from "expect";
import MockAdapter from 'axios-mock-adapter';
import axios from '../../libs/ajax';

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
        let rule = SecurityUtils.getRequestConfigurationRule('/some-site/index?parameter1=value1&parameter2=value2');
        expect(rule).toExist();
        expect(rule.urlPattern).toBe('.*some-site.*');

        // Test authkey authentication rule should be found
        rule = SecurityUtils.getRequestConfigurationRule('/some-site/geoserver?parameter1=value1&parameter2=value2');
        expect(rule).toExist();

        // Test that no rule matches
        rule = SecurityUtils.getRequestConfigurationRule('http://www.no-matching.com/?parameter1=value1&parameter2=value2');
        expect(rule).toNotExist();

        // Test with array URL (single element)
        rule = SecurityUtils.getRequestConfigurationRule(['/some-site/index?parameter1=value1&parameter2=value2']);
        expect(rule).toExist();
        expect(rule.urlPattern).toBe('.*some-site.*');

        // Test with array URL (multiple elements) - the rule applies to all the URLs
        rule = SecurityUtils.getRequestConfigurationRule([
            '/geoserver?parameter1=value1&parameter2=value2',
            '/geoserver/api'
        ]);
        expect(rule).toExist();
        expect(rule.urlPattern).toBe('.*geoserver.*');

        // Test with other URLs that share the same rule
        rule = SecurityUtils.getRequestConfigurationRule([
            '/some-site/index',
            '/some-site/api'
        ]);
        expect(rule).toExist();
        expect(rule.urlPattern).toBe('.*some-site.*');

        rule = SecurityUtils.getRequestConfigurationRule([]);
        expect(rule).toNotExist();

        rule = SecurityUtils.getRequestConfigurationRule(null);
        expect(rule).toNotExist();

        rule = SecurityUtils.getRequestConfigurationRule(undefined);
        expect(rule).toNotExist();
    });

    it('test add authkey authentication to url', () => {
        // Convert authentication rules to new format and set them
        const requestConfigRules = SecurityUtils.convertAuthenticationRulesToRequestConfiguration(authenticationRules);
        ConfigUtils.setConfigProp("useAuthenticationRules", true);
        ConfigUtils.setConfigProp('requestsConfigurationRules', requestConfigRules);
        // authkey authentication with no user
        let urlWithAuthentication = SecurityUtils.addAuthenticationToUrl('/geoserver?parameter1=value1&parameter2=value2');
        expect(urlWithAuthentication).toBe('/geoserver?parameter1=value1&parameter2=value2');
        // authkey authentication with user not providing a uuid
        setSecurityInfo(securityInfoA);
        urlWithAuthentication = SecurityUtils.addAuthenticationToUrl('/geoserver?parameter1=value1&parameter2=value2');
        expect(urlWithAuthentication).toBe('/geoserver?parameter1=value1&parameter2=value2');
        // authkey authentication with a user providing a uuid
        setSecurityInfo(securityInfoC);
        urlWithAuthentication = SecurityUtils.addAuthenticationToUrl('/geoserver?parameter1=value1&parameter2=value2');
        expect(urlWithAuthentication).toBe('/geoserver?parameter1=value1&parameter2=value2&authkey=263c6917-543f-43e3-8e1a-6a0d29952f72');
        // basic authentication with a user providing a uuid
        setSecurityInfo(securityInfoC);
        urlWithAuthentication = SecurityUtils.addAuthenticationToUrl('http://www.some-site.com/index?parameter1=value1&parameter2=value2');
        expect(urlWithAuthentication).toBe('http://www.some-site.com/index?parameter1=value1&parameter2=value2');
        // authkey authentication with a user providing a uuid but authentication deactivated
        ConfigUtils.setConfigProp("useAuthenticationRules", false);
        ConfigUtils.setConfigProp('requestsConfigurationRules', []);
        setSecurityInfo(securityInfoC);
        urlWithAuthentication = SecurityUtils.addAuthenticationToUrl('/geoserver?parameter1=value1&parameter2=value2');
        expect(urlWithAuthentication).toBe('/geoserver?parameter1=value1&parameter2=value2');
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
        expect(SecurityUtils.getAuthenticationHeaders("/header-site/something", null)).toEqual({'X-Auth-Token': 'goodtoken'});
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

            const result = SecurityUtils.getRequestConfigurationByUrl('/api');
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

            const result = SecurityUtils.getRequestConfigurationByUrl('/geoserver/wms');
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
            expect(result[0].headers.Authorization).toBe('Basic ${securityToken}');
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
        afterEach(() => {
            ConfigUtils.removeConfigProp('monitorState');
        });

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

        it('should keep rules without an enabled property', () => {
            const rulesInConfig = [
                { urlPattern: '.*api.*', headers: { 'Authorization': 'Bearer ${securityToken}' } }
            ];
            setSecurityInfo({});
            ConfigUtils.setConfigProp('requestsConfigurationRules', rulesInConfig);

            const result = SecurityUtils.getRequestConfigurationRules();
            expect(result).toEqual(rulesInConfig);
        });

        it('should filter out rules with enabled: false', () => {
            const rulesInConfig = [
                { urlPattern: '.*api.*', enabled: false, headers: { 'Authorization': 'Bearer ${securityToken}' } }
            ];
            setSecurityInfo({});
            ConfigUtils.setConfigProp('requestsConfigurationRules', rulesInConfig);

            const result = SecurityUtils.getRequestConfigurationRules();
            expect(result.length).toBe(0);
        });

        it('should filter out rules whose enabled expression resolves to false', () => {
            const rulesInConfig = [
                { urlPattern: '.*api.*', enabled: "{includes(state('usergroups'), 'editor')}" }
            ];
            setSecurityInfo({ user: { groups: { group: [] } } });
            ConfigUtils.setConfigProp('requestsConfigurationRules', rulesInConfig);

            const result = SecurityUtils.getRequestConfigurationRules();
            expect(result.length).toBe(0);
        });

        it('should keep rules whose enabled expression resolves to true against usergroups state', () => {
            const rulesInConfig = [
                { urlPattern: '.*api.*', enabled: "{includes(state('usergroups'), 'editor')}" }
            ];
            setSecurityInfo({ user: { groups: { group: [{ groupName: 'editor', enabled: true }] } } });
            ConfigUtils.setConfigProp('requestsConfigurationRules', rulesInConfig);

            const result = SecurityUtils.getRequestConfigurationRules();
            expect(result.length).toBe(1);
            expect(result[0].urlPattern).toBe('.*api.*');
        });

        it('should evaluate enabled expressions on rules mixed with rules without enabled', () => {
            const rulesInConfig = [
                { urlPattern: '.*always.*' },
                { urlPattern: '.*editor.*', enabled: "{includes(state('usergroups'), 'editor')}" },
                { urlPattern: '.*admin.*', enabled: "{includes(state('usergroups'), 'admin')}" }
            ];
            setSecurityInfo({ user: { groups: { group: [{ groupName: 'editor', enabled: true }] } } });
            ConfigUtils.setConfigProp('requestsConfigurationRules', rulesInConfig);

            const result = SecurityUtils.getRequestConfigurationRules();
            expect(result.length).toBe(2);
            expect(result.map(rule => rule.urlPattern)).toEqual(['.*always.*', '.*editor.*']);
        });

        it('should evaluate enabled expressions against monitorState entries from configuration', () => {
            const rulesInConfig = [
                { urlPattern: '.*api.*', enabled: "{includes(state('customrole'), 'ADMIN')}" }
            ];
            ConfigUtils.setConfigProp('monitorState', [{ name: 'customrole', path: 'security.user.role' }]);
            setSecurityInfo({ user: { role: 'ADMIN' } });
            ConfigUtils.setConfigProp('requestsConfigurationRules', rulesInConfig);

            const result = SecurityUtils.getRequestConfigurationRules();
            expect(result.length).toBe(1);
            expect(result[0].urlPattern).toBe('.*api.*');
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

            const result = SecurityUtils.getAuthKeyParameter('/api');
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
            const result = SecurityUtils.addAuthenticationParameter('/geoserver/wms', existingParams);

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
            const result = SecurityUtils.addAuthenticationParameter('/geoserver/wms', originalParams);

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
                SLD: '/geoserver/sld?LAYER=layer1'
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

            const result = SecurityUtils.getAuthenticationHeaders('/api', null);
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
        it('should return undefined as authHeader is no longer stored in security state', () => {
            setSecurityInfo(securityInfoToken);
            expect(SecurityUtils.getBasicAuthHeader()).toBe(undefined);
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

            const url = '/geoserver/wms?LAYERS=layer1';
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

    describe('validateServiceCredentials', () => {
        let mockAxios;

        beforeEach(done => {
            mockAxios = new MockAdapter(axios);
            setTimeout(done);
        });

        afterEach(done => {
            mockAxios.restore();
            setTimeout(done);
        });

        it('should return {valid: true} on successful GetCapabilities (200)', (done) => {
            mockAxios.onGet().reply(200);

            SecurityUtils.validateServiceCredentials('http://test/geoserver/wms', {
                username: 'admin',
                password: 'pass'
            }).then(result => {
                try {
                    expect(result).toBeTruthy();
                    expect(result.valid).toBe(true);
                    done();
                } catch (ex) {
                    done(ex);
                }
            });
        });

        it('should return {valid: false, reason: "invalid_credentials"} on 401', (done) => {
            mockAxios.onGet().reply(401);

            SecurityUtils.validateServiceCredentials('http://test/geoserver/wms', {
                username: 'admin',
                password: 'wrong'
            }).then(result => {
                try {
                    expect(result.valid).toBe(false);
                    expect(result.reason).toBe('invalid_credentials');
                    done();
                } catch (ex) {
                    done(ex);
                }
            });
        });

        it('should return {valid: false, reason: "cors_blocked"} on network error', (done) => {
            mockAxios.onGet().networkError();

            SecurityUtils.validateServiceCredentials('http://test/geoserver/wms', {
                username: 'admin',
                password: 'pass'
            }).then(result => {
                try {
                    expect(result.valid).toBe(false);
                    expect(result.reason).toBe('cors_blocked');
                    done();
                } catch (ex) {
                    done(ex);
                }
            });
        });
    });

    describe('request configuration placeholders', () => {
        it('substitutes request configuration placeholders without compiling them', () => {
            window.__ruleEvaluated = undefined;
            const rules = [
                {
                    urlPattern: '.*api.*',
                    headers: { 'Authorization': 'Bearer ${(window.__ruleEvaluated = true)}' }
                }
            ];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);
            ConfigUtils.setConfigProp('useAuthenticationRules', true);
            setSecurityInfo(securityInfoToken);

            const { headers } = SecurityUtils.getRequestConfigurationByUrl('/api');
            expect(window.__ruleEvaluated).toBe(undefined);
            // the placeholder can not be resolved, so it is kept as it is
            expect(headers.Authorization).toBe('Bearer ${(window.__ruleEvaluated = true)}');
        });
        it('should keep the placeholders that can not be resolved', () => {
            const rules = [
                {
                    urlPattern: '.*api.*',
                    headers: { 'Authorization': 'Bearer ${notAvailableProperty}' }
                }
            ];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);
            ConfigUtils.setConfigProp('useAuthenticationRules', true);
            setSecurityInfo(securityInfoToken);

            const { headers } = SecurityUtils.getRequestConfigurationByUrl('/api');
            expect(headers.Authorization).toBe('Bearer ${notAvailableProperty}');
        });
    });
    describe('request configuration rules and request origin', () => {
        const APP_ORIGIN = window.location.origin;
        const OTHER_ORIGIN = 'https://other.example.net';
        afterEach(() => {
            ConfigUtils.setConfigProp('requestsConfigurationRules', null);
        });
        it('applies application service rules to relative and absolute URLs of the application', () => {
            const rules = [
                { urlPattern: '.*rest/geostore.*', headers: { 'Authorization': 'Bearer ${securityToken}' } },
                { urlPattern: '.*rest/config.*', headers: { 'Authorization': 'Bearer ${securityToken}' } }
            ];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);
            expect(SecurityUtils.getRequestConfigurationRule('rest/geostore/resources')).toEqual(rules[0]);
            expect(SecurityUtils.getRequestConfigurationRule(`${APP_ORIGIN}/rest/geostore/resources`)).toEqual(rules[0]);
            expect(SecurityUtils.getRequestConfigurationRule('rest/config/load/localConfig.json')).toEqual(rules[1]);
        });
        it('applies application service rules only to the application origin', () => {
            const rules = [
                { urlPattern: '.*rest/geostore.*', headers: { 'Authorization': 'Bearer ${securityToken}' } }
            ];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);
            expect(SecurityUtils.getRequestConfigurationRule(`${OTHER_ORIGIN}/rest/geostore/wms`)).toBe(undefined);
            expect(SecurityUtils.getRequestConfigurationRule('//other.example.net/rest/geostore/wms')).toBe(undefined);
        });
        it('applies a relative path rule to the absolute URL of the same service', () => {
            const rules = [
                { urlPattern: '^\\/geoserver(_ui)?(\\/|\\?|$)', params: { authkey: '${securityToken}' } }
            ];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);
            expect(SecurityUtils.getRequestConfigurationRule('/geoserver/wms')).toEqual(rules[0]);
            expect(SecurityUtils.getRequestConfigurationRule(`${APP_ORIGIN}/geoserver/wms?SERVICE=WMS`)).toEqual(rules[0]);
            expect(SecurityUtils.getRequestConfigurationRule(`${APP_ORIGIN}/geoserver_ui/ows`)).toEqual(rules[0]);
            expect(SecurityUtils.getRequestConfigurationRule(`${APP_ORIGIN}/geoserver-backup/wms`)).toBe(undefined);
        });
        it('applies a rule combining a relative path and hosts to the application and to the named hosts', () => {
            const rules = [{
                urlPattern: '(^|(https?:)?\\/\\/(platform\\.)?gis\\.(region|province)\\.example\\.org)?\\/geoserver(_ui)?(\\/|\\?|$)',
                headers: { 'Authorization': 'Bearer ${securityToken}' }
            }];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);
            expect(SecurityUtils.getRequestConfigurationRule('/geoserver/wms')).toEqual(rules[0]);
            expect(SecurityUtils.getRequestConfigurationRule(`${APP_ORIGIN}/geoserver/wms`)).toEqual(rules[0]);
            expect(SecurityUtils.getRequestConfigurationRule('https://gis.region.example.org/geoserver/wms')).toEqual(rules[0]);
            expect(SecurityUtils.getRequestConfigurationRule('https://platform.gis.province.example.org/geoserver_ui/ows')).toEqual(rules[0]);
            expect(SecurityUtils.getRequestConfigurationRule(`${OTHER_ORIGIN}/geoserver/wms`)).toBe(undefined);
            expect(SecurityUtils.getRequestConfigurationRule('https://gis.region.example.org.other.example.net/geoserver/wms')).toBe(undefined);
            expect(SecurityUtils.getRequestConfigurationRule(`${OTHER_ORIGIN}/x//gis.region.example.org/geoserver/wms`)).toBe(undefined);
            expect(SecurityUtils.getRequestConfigurationRule(`${OTHER_ORIGIN}/x?u=//gis.region.example.org/geoserver/`)).toBe(undefined);
        });
        it('applies separate path and host rules to the application and to the named hosts', () => {
            const rules = [
                { urlPattern: '^\\/geoserver(_ui)?(\\/|\\?|$)', params: { authkey: '${securityToken}' } },
                {
                    urlPattern: '^(https?:)?\\/\\/(platform\\.)?gis\\.(region|province)\\.example\\.org\\/geoserver(_ui)?(\\/|\\?|$)',
                    params: { authkey: '${securityToken}' }
                }
            ];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);
            expect(SecurityUtils.getRequestConfigurationRule('/geoserver/wms')).toEqual(rules[0]);
            expect(SecurityUtils.getRequestConfigurationRule(`${APP_ORIGIN}/geoserver/wms`)).toEqual(rules[0]);
            expect(SecurityUtils.getRequestConfigurationRule('https://gis.region.example.org/geoserver/wms')).toEqual(rules[1]);
            expect(SecurityUtils.getRequestConfigurationRule('https://platform.gis.province.example.org/geoserver_ui/ows')).toEqual(rules[1]);
            expect(SecurityUtils.getRequestConfigurationRule('https://gis.region.example.org.other.example.net/geoserver/wms')).toBe(undefined);
            expect(SecurityUtils.getRequestConfigurationRule(`${OTHER_ORIGIN}/geoserver/wms`)).toBe(undefined);
        });
        it('applies host rules to their services and not to URLs that contain the host in the path or query', () => {
            const rules = [
                { urlPattern: 'https://geoserver-dev.cloud.example.com/geoserver/.*', headers: { 'Authorization': 'Bearer service-token' } },
                { urlPattern: 'https://storage.example.net/cog/.*', params: { sp: 'r', sig: 'signature' } },
                { urlPattern: 'https://geonode.cloud.example.com/gs.*', params: { 'access_token': 'service-token' } },
                { urlPattern: 'https://api.cloud.example.com/v1/.*', headers: { 'Authorization': 'Bearer service-token', 'x-api-key': 'service-key' } }
            ];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);
            expect(SecurityUtils.getRequestConfigurationRule('https://geoserver-dev.cloud.example.com/geoserver/wms?SERVICE=WMS')).toEqual(rules[0]);
            expect(SecurityUtils.getRequestConfigurationRule('https://storage.example.net/cog/image.tif')).toEqual(rules[1]);
            expect(SecurityUtils.getRequestConfigurationRule('https://geonode.cloud.example.com/gs/wms')).toEqual(rules[2]);
            expect(SecurityUtils.getRequestConfigurationRule('https://api.cloud.example.com/v1/items')).toEqual(rules[3]);
            expect(SecurityUtils.getRequestConfigurationRule(`${OTHER_ORIGIN}/x?u=https://geoserver-dev.cloud.example.com/geoserver/`)).toBe(undefined);
            expect(SecurityUtils.getRequestConfigurationRule(`${OTHER_ORIGIN}/https://geoserver-dev.cloud.example.com/geoserver/wms`)).toBe(undefined);
            expect(SecurityUtils.getRequestConfigurationRule(`${OTHER_ORIGIN}/?https://storage.example.net/cog/`)).toBe(undefined);
        });
        it('applies host rules to requests that reference the same service in their parameters', () => {
            const rules = [
                { urlPattern: 'https://geoserver-dev.cloud.example.com/geoserver/.*', headers: { 'Authorization': 'Bearer service-token' } },
                { urlPattern: '^.*wms-service\\.example\\.com.*', headers: { 'Authorization': 'Basic service-credentials' } }
            ];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);
            expect(SecurityUtils.getRequestConfigurationRule('https://geoserver-dev.cloud.example.com/geoserver/wms?SLD=https://geoserver-dev.cloud.example.com/geoserver/rest/styles/roads.sld')).toEqual(rules[0]);
            expect(SecurityUtils.getRequestConfigurationRule('https://wms-service.example.com/wms?LEGEND_URL=https://wms-service.example.com/legend.png')).toEqual(rules[1]);
        });
        it('applies host rules that also match request parameters', () => {
            const rules = [
                { urlPattern: 'https://ows.example.com/ows\\?.*layers=restricted', params: { key: 'service-key' } }
            ];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);
            expect(SecurityUtils.getRequestConfigurationRule('https://ows.example.com/ows?service=WMS&layers=restricted')).toEqual(rules[0]);
            expect(SecurityUtils.getRequestConfigurationRule('https://ows.example.com/ows?service=WMS&layers=public')).toBe(undefined);
            expect(SecurityUtils.getRequestConfigurationRule(`${OTHER_ORIGIN}/x?u=https://ows.example.com/ows?layers=restricted`)).toBe(undefined);
        });
        it('applies host rules written without the scheme', () => {
            const rules = [
                { urlPattern: 'gs\\.example\\.com/geoserver', params: { authkey: '${securityToken}' } }
            ];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);
            expect(SecurityUtils.getRequestConfigurationRule('https://gs.example.com/geoserver/wms')).toEqual(rules[0]);
            expect(SecurityUtils.getRequestConfigurationRule(`${OTHER_ORIGIN}/x?u=gs.example.com/geoserver`)).toBe(undefined);
            expect(SecurityUtils.getRequestConfigurationRule('https://other.example.net\\@gs.example.com/geoserver/wms')).toBe(undefined);
        });
        it('applies a host pattern without a closing slash also to longer host names', () => {
            const rules = [
                { urlPattern: '^.*wms-service\\.example\\.com.*', headers: { 'Authorization': 'Basic service-credentials' } }
            ];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);
            expect(SecurityUtils.getRequestConfigurationRule('https://wms-service.example.com/wms')).toEqual(rules[0]);
            expect(SecurityUtils.getRequestConfigurationRule(`${OTHER_ORIGIN}/wms-service.example.com`)).toBe(undefined);
            expect(SecurityUtils.getRequestConfigurationRule(`${OTHER_ORIGIN}/?x=wms-service.example.com`)).toBe(undefined);
            expect(SecurityUtils.getRequestConfigurationRule('https://wms-service.example.com.other.example.net/wms')).toEqual(rules[0]);
        });
        it('applies a pattern of one word to the application and not to other hosts with that word in the name', () => {
            const rules = [
                { urlPattern: '.*geoserver.*', params: { authkey: '${securityToken}' } }
            ];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);
            expect(SecurityUtils.getRequestConfigurationRule('/geoserver/wms')).toEqual(rules[0]);
            expect(SecurityUtils.getRequestConfigurationRule(`${APP_ORIGIN}/geoserver/wms`)).toEqual(rules[0]);
            expect(SecurityUtils.getRequestConfigurationRule('https://geoserver.example.net/wms')).toBe(undefined);
            expect(SecurityUtils.getRequestConfigurationRule('https://maps-geoserver.example.net/wms')).toBe(undefined);
            expect(SecurityUtils.getRequestConfigurationRule('//geoserver.example.net/wms')).toBe(undefined);
            expect(SecurityUtils.getRequestConfigurationRule('https://{s}.geoserver.example.net/{z}/{x}/{y}.png')).toBe(undefined);
        });
        it('applies a pattern to another host when it names at least two parts of the host name', () => {
            const rules = [
                { urlPattern: '.*\\.example\\.net/geoserver.*', params: { authkey: '${securityToken}' } },
                { urlPattern: '.*\\.net/mapserver.*', params: { key: 'service-key' } },
                { urlPattern: '.*:8080/ows.*', params: { key: 'service-key' } }
            ];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);
            expect(SecurityUtils.getRequestConfigurationRule('https://tiles.example.net/geoserver/wms')).toEqual(rules[0]);
            expect(SecurityUtils.getRequestConfigurationRule('https://tiles.example.net/mapserver/wms')).toBe(undefined);
            expect(SecurityUtils.getRequestConfigurationRule('https://tiles.example.net:8080/ows')).toBe(undefined);
        });
        it('applies a pattern that names a host of one part or an IP address', () => {
            const rules = [
                { urlPattern: '.*localhost:8080/geoserver.*', params: { authkey: '${securityToken}' } },
                { urlPattern: '10\\.0\\.0\\.5:8080/geoserver', params: { authkey: '${securityToken}' } }
            ];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);
            expect(SecurityUtils.getRequestConfigurationRule('http://localhost:8080/geoserver/wms')).toEqual(rules[0]);
            expect(SecurityUtils.getRequestConfigurationRule('http://10.0.0.5:8080/geoserver/wms')).toEqual(rules[1]);
            expect(SecurityUtils.getRequestConfigurationRule('http://10.0.0.6:8080/geoserver/wms')).toBe(undefined);
        });
        it('applies to a request through the application proxy the rules of the requested service', () => {
            const proxyUrl = ConfigUtils.getConfigProp('proxyUrl');
            ConfigUtils.setConfigProp('proxyUrl', { url: 'proxy/?url=', useCORS: [] });
            const rules = [
                { urlPattern: '.*rest/geostore.*', headers: { 'Authorization': 'Bearer ${securityToken}' } },
                { urlPattern: '^https://gs\\.example\\.com/geoserver/', params: { authkey: '${securityToken}' } }
            ];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);
            const results = [
                'rest/geostore/data/1',
                `proxy/?url=${encodeURIComponent('https://gs.example.com/geoserver/wms?SERVICE=WMS')}`,
                `${APP_ORIGIN}/proxy/?url=https://gs.example.com/geoserver/wms`,
                `proxy?url=${encodeURIComponent('https://gs.example.com/geoserver/wms')}`,
                `proxy/?url=${encodeURIComponent(`${APP_ORIGIN}/rest/geostore/data/1`)}`,
                `proxy/?url=${encodeURIComponent(`${OTHER_ORIGIN}/rest/geostore/data/1`)}`,
                `proxy/?url=${OTHER_ORIGIN}/rest/geostore/data/1`,
                `rest/geostore/../../proxy/?url=${OTHER_ORIGIN}/data`,
                `proxy/?url=${encodeURIComponent(`proxy/?url=${APP_ORIGIN}/rest/geostore/data/1`)}`,
                'proxy/?rest/geostore'
            ].map(url => SecurityUtils.getRequestConfigurationRule(url));
            ConfigUtils.setConfigProp('proxyUrl', proxyUrl);
            expect(results).toEqual([rules[0], rules[1], rules[1], rules[1], rules[0], undefined, undefined, undefined, undefined, undefined]);
        });
        it('applies an anchored host pattern only to the named hosts', () => {
            const rules = [
                { urlPattern: '^https://(wms|ogc)-service\\.example\\.com/', headers: { 'Authorization': 'Basic service-credentials' } }
            ];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);
            expect(SecurityUtils.getRequestConfigurationRule('https://wms-service.example.com/wms')).toEqual(rules[0]);
            expect(SecurityUtils.getRequestConfigurationRule('https://ogc-service.example.com/ows')).toEqual(rules[0]);
            expect(SecurityUtils.getRequestConfigurationRule('https://wms-service.example.com.other.example.net/wms')).toBe(undefined);
        });
        it('applies a rule to a layer with several URLs only when all URLs share it', () => {
            const rules = [
                { urlPattern: '.*geoserver.*', headers: { 'Authorization': 'Bearer ${securityToken}' } },
                { urlPattern: '^https://(a|b)\\.tiles\\.example\\.com/', headers: { 'Authorization': 'Bearer service-token' } }
            ];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);
            expect(SecurityUtils.getRequestConfigurationRule(['/geoserver/wms', `${APP_ORIGIN}/geoserver/wms`])).toEqual(rules[0]);
            expect(SecurityUtils.getRequestConfigurationRule(['https://a.tiles.example.com/wms', 'https://b.tiles.example.com/wms'])).toEqual(rules[1]);
            expect(SecurityUtils.getRequestConfigurationRule(['/geoserver/wms', `${OTHER_ORIGIN}/geoserver/wms`])).toBe(undefined);
            expect(SecurityUtils.getRequestConfigurationRule(['/geoserver/wms', 'https://a.tiles.example.com/wms'])).toBe(undefined);
        });
        it('applies a host rule to URL templates', () => {
            const rules = [
                { urlPattern: '^https://\\{s\\}\\.tiles\\.example\\.com/', params: { key: 'service-key' } }
            ];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);
            expect(SecurityUtils.getRequestConfigurationRule('https://{s}.tiles.example.com/{z}/{x}/{y}.png')).toEqual(rules[0]);
        });
        it('resolves request headers and parameters by request origin', () => {
            setSecurityInfo({ token: 'session-token' });
            ConfigUtils.setConfigProp('requestsConfigurationRules', [
                { urlPattern: '.*geoserver.*', headers: { 'Authorization': 'Bearer ${securityToken}' }, params: { authkey: '${securityToken}' } }
            ]);
            expect(SecurityUtils.getRequestConfigurationByUrl(`${APP_ORIGIN}/geoserver/wms`)).toEqual({
                headers: { 'Authorization': 'Bearer session-token' },
                params: { authkey: 'session-token' }
            });
            expect(SecurityUtils.getRequestConfigurationByUrl(`${OTHER_ORIGIN}/geoserver/wms`)).toEqual({});
            expect(SecurityUtils.getAuthenticationHeaders(['/geoserver/wms', `${OTHER_ORIGIN}/geoserver/wms`])).toBe(null);
            expect(SecurityUtils.addAuthenticationParameter(['/geoserver/wms', `${OTHER_ORIGIN}/geoserver/wms`], { LAYERS: 'roads' })).toEqual({ LAYERS: 'roads' });
            expect(SecurityUtils.addAuthenticationParameter(['/geoserver/wms', `${APP_ORIGIN}/geoserver/wms`], { LAYERS: 'roads' })).toEqual({ LAYERS: 'roads', authkey: 'session-token' });
        });
    });
});
