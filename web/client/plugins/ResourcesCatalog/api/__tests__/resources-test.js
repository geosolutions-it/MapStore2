/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    requestResources
} from '../resources';
import expect from 'expect';
import axios from '../../../../libs/ajax';
import MockAdapter from 'axios-mock-adapter';
import xml2js from 'xml2js';

describe('resources api', () => {
    let mockAxios;
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });
    afterEach(() => {
        mockAxios.restore();
    });
    it('requestResources with empty query', (done) => {
        mockAxios.onPost().replyOnce((config) => {
            try {
                expect(config.url).toBe('/extjs/search/list');
                expect(config.params).toEqual({ includeAttributes: true, start: 0, limit: 12 });
                let json;
                xml2js.parseString(config.data, { explicitArray: false }, (ignore, result) => {
                    json = result;
                });
                expect(json).toEqual({
                    "AND": {
                        "OR": {
                            "AND": [
                                {
                                    "CATEGORY": { "operator": "EQUAL_TO", "name": "MAP" }
                                },
                                {
                                    "CATEGORY": { "operator": "EQUAL_TO", "name": "DASHBOARD" }
                                },
                                {
                                    "CATEGORY": { "operator": "EQUAL_TO", "name": "GEOSTORY" }
                                },
                                {
                                    "CATEGORY": { "operator": "EQUAL_TO", "name": "CONTEXT" }
                                }
                            ]
                        }
                    }
                });
            } catch (e) {
                done(e);
            }
            return [200, {
                ExtResourceList: {
                    Resource: [],
                    ResourceCount: 0
                }
            }];
        });
        requestResources()
            .then((response) => {
                expect(response).toEqual({
                    total: 0,
                    isNextPageAvailable: false,
                    resources: []
                });
                done();
            })
            .catch(done);
    });
    it('requestResources with query', (done) => {
        mockAxios.onPost().replyOnce((config) => {
            try {
                expect(config.url).toBe('/extjs/search/list');
                expect(config.params).toEqual({ includeAttributes: true, start: 24, limit: 24 });
                let json;
                xml2js.parseString(config.data, { explicitArray: false }, (ignore, result) => {
                    json = result;
                });
                expect(json).toEqual({
                    "AND": {
                        "FIELD": { "field": "NAME", "operator": "ILIKE", "value": "%A%" },
                        "ATTRIBUTE": { "name": "featured", "operator": "EQUAL_TO", "type": "STRING", "value": "true" },
                        "OR": {
                            "AND": {
                                "CATEGORY": { "operator": "EQUAL_TO", "name": "MAP" },
                                "OR": {
                                    "ATTRIBUTE": { "name": "context", "operator": "EQUAL_TO", "type": "STRING", "value": "contextName" }
                                }
                            }
                        }
                    }
                });
            } catch (e) {
                done(e);
            }
            return [200, {
                ExtResourceList: {
                    Resource: [],
                    ResourceCount: 0
                }
            }];
        });
        requestResources({
            params: {
                page: 2,
                pageSize: 24,
                f: ['map', 'featured'],
                q: 'A',
                'filter{ctx}': ['contextName']
            }
        })
            .then((response) => {
                expect(response).toEqual({
                    total: 0,
                    isNextPageAvailable: false,
                    resources: []
                });
                done();
            })
            .catch(done);
    });

    it('requestResources with additional request for context info', (done) => {
        mockAxios.onPost().replyOnce((config) => {
            try {
                expect(config.url).toBe('/extjs/search/list');
                expect(config.params).toEqual({ includeAttributes: true, start: 0, limit: 12 });
            } catch (e) {
                done(e);
            }
            return [200, {
                ExtResourceList: {
                    Resource: [
                        {
                            "advertised": true,
                            "Attributes": {
                                "attribute": [
                                    {
                                        "@type": "STRING",
                                        "name": "context",
                                        "value": 2
                                    }
                                ]
                            },
                            "category": {
                                "id": 5,
                                "name": "MAP"
                            },
                            "id": 1,
                            "name": "Map"
                        }
                    ],
                    ResourceCount: 1
                }
            }];
        });
        mockAxios.onPost().replyOnce((config) => {
            try {
                expect(config.url).toBe('/extjs/search/list');
                expect(config.params).toBe(undefined);
                let json;
                xml2js.parseString(config.data, { explicitArray: false }, (ignore, result) => {
                    json = result;
                });
                expect(json).toEqual({ OR: { FIELD: { field: 'ID', operator: 'EQUAL_TO', value: '2' } } });
            } catch (e) {
                done(e);
            }
            return [200, {
                ExtResourceList: {
                    Resource: {
                        "category": {
                            "id": 3,
                            "name": "CONTEXT"
                        },
                        "id": 2,
                        "name": "contextName"
                    },
                    ResourceCount: 1
                }
            }];
        });
        requestResources()
            .then((response) => {
                expect(response).toEqual({
                    "total": 1,
                    "isNextPageAvailable": false,
                    "resources": [{
                        "advertised": true,
                        "category": { "id": 5, "name": "MAP" },
                        "id": 1,
                        "name": "Map",
                        "attributes": { "context": 2 },
                        "@extras": {
                            "context": {
                                "category": { "id": 3, "name": "CONTEXT" },
                                "id": 2,
                                "name": "contextName",
                                "attributes": {}
                            }
                        }
                    }]
                });
                done();
            })
            .catch(done);
    });
});
