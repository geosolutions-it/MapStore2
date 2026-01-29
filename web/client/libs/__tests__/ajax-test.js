/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import axios from '../ajax';
import urlUtil from 'url';

import ConfigUtils from "../../utils/ConfigUtils";
import {setStore} from "../../utils/StateUtils";

function setSecurityInfo(info) {
    setStore({
        getState: () => ({
            security: info
        })
    });
}

import MockAdapter from "axios-mock-adapter";
let mockAxios;

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
    attribute: [{
        name: "description",
        value: "admin user"
    }
    ]});

const securityInfoB = {
    user: userB,
    token: "263c6917-543f-43e3-8e1a-6a0d29952f72",
    authHeader: 'Basic 263c6917-543f-43e3-8e1a-6a0d29952f72'
};

const authenticationRules = [
    {
        "urlPattern": ".*geoserver.*",
        "method": "authkey"
    },
    {
        "urlPattern": ".*youhavetouseacustomone.*",
        "authkeyParamName": "mario",
        "method": "authkey"
    },
    {
        "urlPattern": ".*thisismissingtheparam.*",
        "method": {
            "method": "authkey-param"
        }
    },
    {
        "urlPattern": ".*not-supported.*",
        "method": "not-supported"
    },
    {
        "urlPattern": ".*some-site.*",
        "method": "basic"
    },
    {
        "urlPattern": ".*imtokenized.*",
        "method": "bearer"
    },
    {
        "urlPattern": ".*useBrowserCredentials.*",
        "method": "browserWithCredentials"
    },
    {
        "urlPattern": ".*sitetocheck.*",
        "method": "bearer"
    },
    {
        method: "header",
        urlPattern: ".*header-site.com",
        headers: {"X-Test-Token": "test"}
    }
];

describe('Tests ajax library', () => {
    let originalOProxyURL;
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
        originalOProxyURL = ConfigUtils.getConfigProp("proxyUrl");
    });
    afterEach(() => {
        if (mockAxios) {
            mockAxios.restore();
            mockAxios = null;
        }
        expect.restoreSpies();
        setStore({});
        ConfigUtils.setConfigProp("authenticationRules", null);
        ConfigUtils.setConfigProp("useAuthenticationRules", false);
        ConfigUtils.setConfigProp("proxyUrl", originalOProxyURL);
    });

    it('uses proxy for requests not on the same origin', (done) => {
        mockAxios.onGet().reply((config) => {
            expect(config).toExist();
            expect(config.url).toExist();
            expect(config.url).toContain('proxy/?url=');
            return [ 200, { }];
        });
        axios.get('http://fakeexternaldomain.mapstore2', {
            proxyUrl: {
                url: '/proxy/?url=',
                useCORS: [],
                autoDetectCORS: false
            }}).then(() => {
            done();
        }).catch((e) => {

            done(e);
        }).finally(() => {
        });
    });

    it('does not use proxy for requests on the same origin', (done) => {
        mockAxios.onGet().reply(200, {});
        axios.get('base/web/client/test-resources/testConfig.json', {
            proxyUrl: {
                url: '/proxy/?url=',
                useCORS: [],
                autoDetectCORS: false
            }}).then((response) => {
            expect(response.config).toExist();
            expect(response.config.url).toExist();
            expect(response.config.url).toBe('base/web/client/test-resources/testConfig.json');
            done();
        }).catch(ex => {
            done(ex);
        });
    });

    it('uses a custom proxy for requests on the same origin with varius query params', (done) => {
        mockAxios.onGet().reply(200, {}, {
            "allow-control-allow-origin": "*"
        });
        axios.get('http://fakeexternaldomain.mapstore2', {
            proxyUrl: '/proxy/?url=',
            params: {
                param1: 'param1',
                param2: '',
                param3: undefined,
                param4: null,
                param5: [],
                param6: [1, 2, "3", ''],
                param7: {},
                param8: {
                    a: 'a'
                },
                param9: new Date()
            }})
            .then(() => {
                done();
            })
            .catch((ex) => {
                expect(ex.config).toExist();
                expect(ex.config.url).toExist();
                expect(ex.config.url).toContain('proxy/?url=');
                done();
            });
    });

    it('ignore undefined and null query params with custom proxy', (done) => {
        mockAxios.onGet().reply((config) => {
            const decodedUrl = urlUtil.parse(decodeURIComponent(config.url), true);
            expect(decodedUrl.query).toNotContainKeys(['param3', 'param4', 'param11']);
            return [200, {}];
        });
        axios.get('http://fakeexternaldomain.mapstore2', {
            proxyUrl: '/proxy/?url=',
            params: {
                param1: 'param1',
                param2: '',
                param3: undefined,
                param4: null,
                param5: [],
                param6: [1, 2, "3", ''],
                param7: {},
                param8: {
                    a: 'a'
                },
                param9: new Date(),
                param10: false,
                param11: NaN,
                param12: 0
            }})
            .then(() => {
                done();
            })
            .catch((e) => {

                done(e);
            });
    });

    it('uses a custom proxy for requests on the different origin origin with string query param', (done) => {
        mockAxios.onGet().reply(200, {});
        axios.get('http://fakeexternaldomain.mapstore2', {
            proxyUrl: {
                url: '/proxy/?url=',
                useCORS: [],
                autoDetectCORS: false
            },
            params: "params"
        })
            .then(() => {

                done();
            })
            .catch((ex) => {
                expect(ex.config).toExist();
                expect(ex.config.url).toExist();
                expect(ex.config.url).toContain('proxy/?url=');
                done();
            });
    });

    it('does not use proxy for requests to CORS enabled urls', (done) => {
        mockAxios.onGet().reply((config) => {
            expect(config).toExist();
            expect(config.url).toExist();
            expect(config.url).toBe('http://www.fakedomain.com');
            return [ 200, { }];
        });
        axios.get('http://www.fakedomain.com', {
            timeout: 1,
            proxyUrl: {
                url: '/proxy/?url=',
                useCORS: ['http://www.fakedomain.com'],
                autoDetectCORS: false
            }
        }).then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });

    it('Use proxy for requests on not CORS enabled urls', (done) => {
        mockAxios.onGet().reply((config) => {
            expect(config).toExist();
            expect(config.url).toExist();
            expect(config.url).toContain('proxy/?url=');
            return [ 200, { }];
        });
        axios.get('http://notcors.mapstore2', {
            proxyUrl: {
                url: '/proxy/?url=',
                useCORS: ['http://cors.mapstore2'],
                autoDetectCORS: false
            }
        }).then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('Do not use proxy on first request when autoDetectCORS is not false', (done) => {
        mockAxios.onGet().reply((config) => {
            expect(config).toExist();
            expect(config.url).toExist();
            expect(config.url).toBe('http://cors.mapstore2');
            return [ 200, { }];
        });
        axios.get('http://cors.mapstore2', {
            proxyUrl: {
                url: '/proxy/?url='
            }
        }).then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });

    it('test add authkey authentication to axios config with no login', (done) => {
        mockAxios.onGet().reply(config => {
            expect(config).toExist();
            expect(config.url).toExist();
            expect(config.url.indexOf('authkey')).toBeLessThan(0);
            return [200, {}];

        });
        axios.get('http://www.some-site.com/geoserver?parameter1=value1&parameter2=value2').then(() => {
            done();
        }).catch((e) => {
            done(e);
        });
    });

    it('test add authkey authentication to axios config with login but authentication deactivated', (done) => {
        mockAxios.onGet().reply(config => {
            expect(config).toExist();
            expect(config.url).toExist();
            expect(config.url.indexOf('authkey')).toBeLessThan(0);
            return [200, {}];

        });
        axios.get('http://www.some-site.com/geoserver?parameter1=value1&parameter2=value2').then(() => {
            done();
        }).catch((e) => {

            done(e);
        });
    });

    it('test add basic authentication to axios config', (done) => {
        // mocking the authentication rules
        ConfigUtils.setConfigProp("useAuthenticationRules", true);
        ConfigUtils.setConfigProp("authenticationRules", authenticationRules);
        // basic authentication header available
        setSecurityInfo(securityInfoB);
        mockAxios.onGet().reply(config => {
            expect(config).toExist();
            expect(config.headers).toExist();
            expect(config.headers.Authorization).toBe('Basic 263c6917-543f-43e3-8e1a-6a0d29952f72');
            return [200, {}];

        });
        axios.get('http://www.some-site.com/index?parameter1=value1&parameter2=value2').then(() => {
            done();
        }).catch(e => {

            done(e);
        });
    });

    it('add custom authkey authentication to axios config with login', (done) => {
        // mocking the authentication rules and user info
        ConfigUtils.setConfigProp("useAuthenticationRules", true);
        ConfigUtils.setConfigProp("authenticationRules", authenticationRules);
        mockAxios.onGet().reply(config => {
            expect(config).toExist().toIncludeKey('url');
            expect(config.url.indexOf('authkey')).toBeLessThan(0);
            expect(config.params.authkey).toNotExist();
            expect(config.params.mario).toEqual(securityInfoB.token);
            return [200, {}];

        });
        // basic authentication header available
        setSecurityInfo(securityInfoB);
        axios.get('http://non-existent.mapstore2/youhavetouseacustomone?parameter1=value1&par2=v2').then(() => {
            done();
        }).catch((e) => {
            done(e);
        });
    });


    it('does not add authkey if the configuration is wrong', (done) => {
        mockAxios.onGet().reply(config => {
            expect(config).toExist().toIncludeKey('url');
            expect(config.url.authkey).toNotExist();
            return [200, {}];

        });
        axios.get('http://non-existent.mapstore2/thisismissingtheparam?parameter1=value1&par2=v2').then(() => {
            done();
        }).catch((e) => {
            done(e);
        });
    });
    it('adds generic headers', (done) => {
        ConfigUtils.setConfigProp("useAuthenticationRules", true);
        ConfigUtils.setConfigProp("authenticationRules", authenticationRules);
        mockAxios.onGet().reply(config => {
            expect(config).toExist().toIncludeKey('headers');
            expect(config.headers["X-Test-Token"]).toBe('test');
            return [200, {}];
        });
        axios.get('header-site.com').then(() => {
            done();
        }).catch(e => {
            done(e);
        });
    });

    it('adds Bearer header', (done) => {
        // mocking the authentication rules and user info
        ConfigUtils.setConfigProp("useAuthenticationRules", true);
        ConfigUtils.setConfigProp("authenticationRules", authenticationRules);
        // basic authentication header available
        mockAxios.onGet().reply(config => {
            expect(config).toExist().toIncludeKey('headers');
            expect(config.headers.Authorization).toBe('Bearer 263c6917-543f-43e3-8e1a-6a0d29952f72');
            return [200, {}];
        });
        setSecurityInfo(securityInfoB);
        axios.get('http://non-existent.mapstore2/imtokenized?parameter1=value1&par2=v2').then(() => {
            done();
        }).catch((e) => {

            done(e);
        });
    });

    it('adds Bearer header also when using baseURL', (done) => {
        // mocking the authentication rules and user info
        ConfigUtils.setConfigProp("useAuthenticationRules", true);
        ConfigUtils.setConfigProp("authenticationRules", authenticationRules);
        mockAxios.onGet().reply(config => {
            expect(config).toExist().toIncludeKey('headers');
            expect(config.headers.Authorization).toBe('Bearer 263c6917-543f-43e3-8e1a-6a0d29952f72');
            return [200, {}];
        });
        // basic authentication header available
        setSecurityInfo(securityInfoB);
        axios.get('tokenservice?param=token', { baseURL: 'http://sitetocheck', timeout: 1}).then(() => {
            done();
        }).catch((e) => {

            done(e);
        });
    });

    it('does not add Bearer headers if the configuration is wrong', (done) => {
        // mocking the authentication rules and user info
        ConfigUtils.setConfigProp("useAuthenticationRules", true);
        ConfigUtils.setConfigProp("authenticationRules", authenticationRules);
        setSecurityInfo(securityInfoA);
        mockAxios.onGet().reply(config => {
            expect(config).toExist().toIncludeKey('headers');
            expect(config.headers.Authorization).toNotExist();
            return [200, {}];
        });
        axios.get('http://non-existent.mapstore2/imtokenized?parameter1=value1&par2=v2').then(() => {
            done();
        }).catch((e) => {
            done(e);
        });
    });

    it('does not add BasicAuth headers if the configuration is wrong', (done) => {
        // mocking the authentication rules and user info
        ConfigUtils.setConfigProp("useAuthenticationRules", true);
        ConfigUtils.setConfigProp("authenticationRules", authenticationRules);
        setSecurityInfo(securityInfoA);
        mockAxios.onGet().reply(config => {
            expect(config).toExist().toIncludeKey('headers');
            expect(config.headers.Authorization).toNotExist();
            return [200, {}];
        });
        axios.get('http://www.some-site.com/index?parameter1=value1&parameter2=value2').then(() => {
            done();
        }).catch((e) => {

            done(e);
        });
    });

    it('does not add authentication if the method is not supported', (done) => {
        const url = 'https://not-supported.mapstore2:4433/?parameter1=value1&parameter2=value2';
        mockAxios.onGet().reply(config => {
            expect(config).toExist().toIncludeKey('headers');
            expect(config.headers.Authorization).toNotExist();
            expect(config).toExist().toIncludeKey('url');
            expect(url).toEqual(url);
            return [200, {}];
        });
        axios.get(url).then(() => {
            done();
        }).catch((e) => {

            done(e);
        });
    });

    it('the interceptor can handle empty uri', (done) => {
        // mocking the authentication rules and user info
        mockAxios.onGet().reply(config => {
            expect(config).toExist();

            return [200, {}];
        });
        axios.get().then(() => {
            done();
        }).catch((e) => {
            done(e);
        });
    });

    it('does set withCredentials on the request', (done)=> {
        ConfigUtils.setConfigProp("useAuthenticationRules", true);
        ConfigUtils.setConfigProp("authenticationRules", authenticationRules);
        mockAxios.onGet().reply(config => {
            expect(config).toExist();
            expect(config.withCredentials).toExist();
            expect(config.withCredentials).toBeTruthy();
            return [200, {}];

        });
        axios.get('http://www.useBrowserCredentials.com/useBrowserCredentials?parameter1=value1&parameter2=value2').then(() => {
            done();
        }).catch( (e) => {

            done(e);
        });
    });

    it('does not set withCredentials on the request', (done)=> {
        mockAxios.onGet().reply(config => {
            expect(config).toExist();
            expect(config.withCredentials).toNotExist();
            return [200, {}];
        });
        axios.get('http://www.skipBrowserCredentials.com/geoserver?parameter1=value1&parameter2=value2').then(() => {
            done();
        }).catch( (e) => {

            done(e);
        });
    });

    it('does test for CORS if autoDetectCORS is true', (done) => {
        mockAxios.onGet().reply(200, {}, {
            "allow-control-allow-origin": "*"
        });
        axios
            .get("http://testcors/", {
                proxyUrl: {
                    url: "/proxy/?url=",
                    useCORS: [],
                    autoDetectCORS: true
                }
            })
            .then(response => {
                expect(response.config).toExist();
                expect(response.config.url).toExist();
                expect(response.config.url).toNotContain("proxy/?url=");
                done();
            });
    });


});
