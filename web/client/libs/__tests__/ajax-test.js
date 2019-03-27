/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const axios = require('../ajax');
const SecurityUtils = require('../../utils/SecurityUtils');
const assign = require('object-assign');
const urlUtil = require('url');
const MockAdapter = require("axios-mock-adapter");
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

const userB = assign({}, userA, {
    name: "adminB",
    attribute: [{
        name: "UUID",
        value: "263c6917-543f-43e3-8e1a-6a0d29952f72"
    }, {
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
    }
];

describe('Tests ajax library', () => {
    afterEach(() => {
        if (mockAxios) {
            mockAxios.restore();
            mockAxios = null;
        }
        expect.restoreSpies();
    });

    it('uses proxy for requests not on the same origin', (done) => {
        axios.get('http://fakeexternaldomain.mapstore2').then(() => {
            done();
        }).catch(ex => {
            expect(ex.config).toExist();
            expect(ex.config.url).toExist();
            expect(ex.config.url).toContain('proxy/?url=');
            done();
        });
    });

    it('does not use proxy for requests on the same origin', (done) => {
        axios.get('base/web/client/test-resources/testConfig.json').then((response) => {
            expect(response.config).toExist();
            expect(response.config.url).toExist();
            expect(response.config.url).toBe('base/web/client/test-resources/testConfig.json');
            done();
        }).catch(ex => {
            done(ex);
        });
    });

    it('uses a custom proxy for requests on the same origin with varius query params', (done) => {
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
            .catch((ex) => {
                const decodedUrl = urlUtil.parse(decodeURIComponent(ex.config.url), true);
                expect(decodedUrl.query).toNotContainKeys(['param3', 'param4', 'param11']);
                done();
            });
    });

    it('uses a custom proxy for requests on the same origin with string query param', (done) => {
        axios.get('http://fakeexternaldomain.mapstore2', {
            proxyUrl: '/proxy/?url=',
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
        axios.get('http://www.google.com', {
            timeout: 1,
            proxyUrl: {
                url: '/proxy/?url=',
                useCORS: ['http://www.google.com']
            }
        }).then(() => {
            done();
        }).catch((ex) => {
            expect(ex.code).toBe("ECONNABORTED");
            done();
        });
    });

    it('does use proxy for requests on not CORS enabled urls', (done) => {
        axios.get('http://notcors.mapstore2', {
            proxyUrl: {
                url: '/proxy/?url=',
                useCORS: ['http://cors.mapstore2']
            }
        }).then(() => {
            done();
        }).catch((ex) => {
            expect(ex.config).toExist();
            expect(ex.config.url).toExist();
            expect(ex.config.url).toContain('proxy/?url=');
            done();
        });
    });

    it('test add authkey authentication to axios config with no login', (done) => {
        // mocking the authentication rules
        expect.spyOn(SecurityUtils, 'isAuthenticationActivated').andReturn(true);
        expect.spyOn(SecurityUtils, 'getAuthenticationRules').andReturn(authenticationRules);
        // authkey authentication with no user
        expect.spyOn(SecurityUtils, 'getSecurityInfo').andReturn(null);
        axios.get('http://www.some-site.com/geoserver?parameter1=value1&parameter2=value2').then(() => {
            done();
        }).catch((exception) => {
            expect(exception.config).toExist();
            expect(exception.config.url).toExist();
            expect(exception.config.url.indexOf('authkey')).toBeLessThan(0);
            done();
        });
    });

    it('test add authkey authentication to axios config with login but no uuid', (done) => {
        // mocking the authentication rules
        expect.spyOn(SecurityUtils, 'isAuthenticationActivated').andReturn(true);
        expect.spyOn(SecurityUtils, 'getAuthenticationRules').andReturn(authenticationRules);
        // authkey authentication with user but no uuid
        expect.spyOn(SecurityUtils, 'getSecurityInfo').andReturn(securityInfoA);
        axios.get('http://www.some-site.com/geoserver?parameter1=value1&parameter2=value2').then(() => {
            done();
        }).catch((exception) => {
            expect(exception.config).toExist();
            expect(exception.config.url).toExist();
            expect(exception.config.url.indexOf('authkey')).toBeLessThan(0);
            done();
        });
    });

    it('test add authkey authentication to axios config with login and uuid', (done) => {
        // mocking the authentication rules
        expect.spyOn(SecurityUtils, 'isAuthenticationActivated').andReturn(true);
        expect.spyOn(SecurityUtils, 'getAuthenticationRules').andReturn(authenticationRules);
        // authkey authentication with user
        expect.spyOn(SecurityUtils, 'getSecurityInfo').andReturn(securityInfoB);
        axios.get('http://www.some-site.com/geoserver?parameter1=value1&parameter2=value2&authkey=TEST_AUTHKEY').then(() => {
            done();
        }).catch((exception) => {
            expect(exception.config).toExist();
            expect(exception.config.url).toExist();
            expect(exception.config.url.indexOf('authkey')).toBeGreaterThan(-1);
            expect(exception.config.url.indexOf("TEST_AUTHKEY")).toBeLessThan(0);
            done();
        });
    });

    it('test add authkey authentication to axios config with login and uuid but authentication deactivated', (done) => {
        // mocking the authentication rules
        expect.spyOn(SecurityUtils, 'isAuthenticationActivated').andReturn(false);
        expect.spyOn(SecurityUtils, 'getAuthenticationRules').andReturn(authenticationRules);
        // authkey authentication with user
        expect.spyOn(SecurityUtils, 'getSecurityInfo').andReturn(securityInfoB);
        axios.get('http://www.some-site.com/geoserver?parameter1=value1&parameter2=value2').then(() => {
            done();
        }).catch((exception) => {
            expect(exception.config).toExist();
            expect(exception.config.url).toExist();
            expect(exception.config.url.indexOf('authkey')).toBeLessThan(0);
            done();
        });
    });

    it('test add basic authentication to axios config', (done) => {
        // mocking the authentication rules
        expect.spyOn(SecurityUtils, 'isAuthenticationActivated').andReturn(true);
        expect.spyOn(SecurityUtils, 'getAuthenticationRules').andReturn(authenticationRules);
        // basic authentication header available
        expect.spyOn(SecurityUtils, 'getSecurityInfo').andReturn(securityInfoB);
        axios.get('http://www.some-site.com/index?parameter1=value1&parameter2=value2').then(() => {
            done();
        }).catch((exception) => {
            expect(exception.config).toExist();
            expect(exception.config.headers).toExist();
            expect(exception.config.headers.Authorization).toBe('Basic 263c6917-543f-43e3-8e1a-6a0d29952f72');
            done();
        });
    });

    it('add custom authkey authentication to axios config with login and uuid', (done) => {
        // mocking the authentication rules and user info
        expect.spyOn(SecurityUtils, 'isAuthenticationActivated').andReturn(true);
        expect.spyOn(SecurityUtils, 'getAuthenticationRules').andReturn(authenticationRules);
        expect.spyOn(SecurityUtils, 'getSecurityInfo').andReturn(securityInfoB);
        const theExpectedString = 'mario%3D' + securityInfoB.token;
        axios.get('http://non-existent.mapstore2/youhavetouseacustomone?parameter1=value1&par2=v2').then(() => {
            done("Axios actually reached the fake url");
        }).catch((exception) => {
            expect(exception.config).toExist().toIncludeKey('url');
            expect(exception.config.url.indexOf('authkey')).toBeLessThan(0);
            expect(exception.config.url.indexOf(theExpectedString)).toBeGreaterThan(-1);
            done();
        });
    });


    it('does not add autkeys if the configuration is wrong', (done) => {
        // mocking the authentication rules and user info
        expect.spyOn(SecurityUtils, 'isAuthenticationActivated').andReturn(true);
        expect.spyOn(SecurityUtils, 'getAuthenticationRules').andReturn(authenticationRules);
        expect.spyOn(SecurityUtils, 'getSecurityInfo').andReturn(securityInfoA);
        axios.get('http://non-existent.mapstore2/thisismissingtheparam?parameter1=value1&par2=v2').then(() => {
            done("Axios actually reached the fake url");
        }).catch((exception) => {
            expect(exception.config).toExist().toIncludeKey('url');
            expect(exception.config.url.indexOf('authkey')).toBe(-1);
            done();
        });
    });

    it('adds Bearer header', (done) => {
        // mocking the authentication rules and user info
        expect.spyOn(SecurityUtils, 'isAuthenticationActivated').andReturn(true);
        expect.spyOn(SecurityUtils, 'getAuthenticationRules').andReturn(authenticationRules);
        expect.spyOn(SecurityUtils, 'getSecurityInfo').andReturn(securityInfoB);
        axios.get('http://non-existent.mapstore2/imtokenized?parameter1=value1&par2=v2').then(() => {
            done("Axios actually reached the fake url");
        }).catch((exception) => {
            expect(exception.config).toExist().toIncludeKey('headers');
            expect(exception.config.headers.Authorization).toBe('Bearer 263c6917-543f-43e3-8e1a-6a0d29952f72');
            done();
        });
    });

    it('adds Bearer header also when using baseURL', (done) => {
        // mocking the authentication rules and user info
        expect.spyOn(SecurityUtils, 'isAuthenticationActivated').andReturn(true);
        expect.spyOn(SecurityUtils, 'getAuthenticationRules').andReturn(authenticationRules);
        expect.spyOn(SecurityUtils, 'getSecurityInfo').andReturn(securityInfoB);
        axios.get('tokenservice?param=token', { baseURL: 'http://sitetocheck', timeout: 1}).then(() => {
            done("Axios actually reached the fake url");
        }).catch((exception) => {
            expect(exception.config).toExist().toIncludeKey('headers');
            expect(exception.config.headers.Authorization).toBe('Bearer 263c6917-543f-43e3-8e1a-6a0d29952f72');
            done();
        });
    });

    it('does not add Bearer headers if the configuration is wrong', (done) => {
        // mocking the authentication rules and user info
        expect.spyOn(SecurityUtils, 'isAuthenticationActivated').andReturn(true);
        expect.spyOn(SecurityUtils, 'getAuthenticationRules').andReturn(authenticationRules);
        expect.spyOn(SecurityUtils, 'getSecurityInfo').andReturn(securityInfoA);
        axios.get('http://non-existent.mapstore2/imtokenized?parameter1=value1&par2=v2').then(() => {
            done("Axios actually reached the fake url");
        }).catch((exception) => {
            expect(exception.config).toExist().toIncludeKey('headers');
            expect(exception.config.headers.Authorization).toNotExist();
            done();
        });
    });

    it('does not add BasicAuth headers if the configuration is wrong', (done) => {
        // mocking the authentication rules and user info
        expect.spyOn(SecurityUtils, 'isAuthenticationActivated').andReturn(true);
        expect.spyOn(SecurityUtils, 'getAuthenticationRules').andReturn(authenticationRules);
        expect.spyOn(SecurityUtils, 'getSecurityInfo').andReturn(securityInfoA);
        axios.get('http://www.some-site.com/index?parameter1=value1&parameter2=value2').then(() => {
            done("Axios actually reached the fake url");
        }).catch((exception) => {
            expect(exception.config).toExist().toIncludeKey('headers');
            expect(exception.config.headers.Authorization).toNotExist();
            done();
        });
    });

    it('does not add authentication if the method is not supported', (done) => {
        // mocking the authentication rules and user info
        expect.spyOn(SecurityUtils, 'isAuthenticationActivated').andReturn(true);
        expect.spyOn(SecurityUtils, 'getAuthenticationRules').andReturn(authenticationRules);
        expect.spyOn(SecurityUtils, 'getSecurityInfo').andReturn(securityInfoA);
        const url = 'https://not-supported.mapstore2:4433/?parameter1=value1&parameter2=value2';
        axios.get(url).then(() => {
            done("Axios actually reached the fake url");
        }).catch((exception) => {
            expect(exception.config).toExist().toIncludeKey('headers');
            expect(exception.config.headers.Authorization).toNotExist();
            expect(exception.config).toExist().toIncludeKey('url');
            const parsed = urlUtil.parse(exception.config.url, true);
            expect(parsed.query.url).toEqual(url);
            done();
        });
    });

    it('the interceptor can handle empty uri', (done) => {
        // mocking the authentication rules and user info
        expect.spyOn(SecurityUtils, 'isAuthenticationActivated').andReturn(true);
        expect.spyOn(SecurityUtils, 'getAuthenticationRules').andReturn(authenticationRules);
        expect.spyOn(SecurityUtils, 'getSecurityInfo').andReturn(securityInfoA);
        axios.get().then(() => {
            done("Axios actually reached the fake url");
        }).catch(() => {
            done();
        });
    });

    it('does set withCredentials on the request', (done)=> {
        expect.spyOn(SecurityUtils, 'isAuthenticationActivated').andReturn(true);
        expect.spyOn(SecurityUtils, 'getAuthenticationRules').andReturn(authenticationRules);

        axios.get('http://www.useBrowserCredentials.com/useBrowserCredentials?parameter1=value1&parameter2=value2').then(() => {
            done();
        }).catch( (exception) => {
            expect(exception.config).toExist();
            expect(exception.config.withCredentials).toExist();
            expect(exception.config.withCredentials).toBeTruthy();
            done();
        });
    });

    it('does not set withCredentials on the request', (done)=> {
        expect.spyOn(SecurityUtils, 'isAuthenticationActivated').andReturn(true);
        expect.spyOn(SecurityUtils, 'getAuthenticationRules').andReturn(authenticationRules);
        axios.get('http://www.skipBrowserCredentials.com/geoserver?parameter1=value1&parameter2=value2').then(() => {
            done();
        }).catch( (exception) => {
            expect(exception.config).toExist();
            expect(exception.config.withCredentials).toNotExist();
            done();
        });
    });

    it('does test for CORS if autoDetectCORS is true', (done) => {
        mockAxios = new MockAdapter(axios);
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

    it('revert to proxy if autoDetectCORS is true but CORS is not enabled on server', (done) => {
        mockAxios = new MockAdapter(axios);
        axios.get('http://testcors/', {
            timeout: 1,
            proxyUrl: {
                url: '/proxy/?url=',
                useCORS: [],
                autoDetectCORS: true
            }
        }).catch((response) => {
            expect(response.config).toExist();
            expect(response.config.url).toExist();
            expect(response.config.url).toContain('proxy/?url=');
            done();
        });
    });
});
