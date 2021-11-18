/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import axios from '../../libs/ajax';
import MockAdapter from 'axios-mock-adapter';
import { parse } from 'url';
import { head } from 'lodash';
import { UPDATE_GEOMETRY, CHANGE_SPATIAL_ATTRIBUTE } from '../../actions/queryform';
import { changeMapView } from '../../actions/map';
import { testEpic, addTimeoutEpic, TEST_TIMEOUT } from './epicTestUtils';
import { QUERY_RESULT, FEATURE_LOADING, query, updateQuery, featureTypeSelected, FEATURE_TYPE_LOADED } from '../../actions/wfsquery';
import { viewportSelectedEpic, wfsQueryEpic, featureTypeSelectedEpic } from '../wfsquery';
import { LAYER_LOAD } from '../../actions/layers';


describe('wfsquery Epics', () => {
    let mockAxios;
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });
    afterEach(() => {
        mockAxios.restore();
    });

    it('viewport selected epic', (done) => {
        testEpic(viewportSelectedEpic, 1, changeMapView({x: 0, y: 0, crs: 'EPSG:4326'}, 10, {bounds: {
            minx: -170,
            miny: -50,
            maxx: 170,
            maxy: 50
        }, crs: 'EPSG:4326'}), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case UPDATE_GEOMETRY:
                    expect(action.geometry).toEqual({
                        center: [0, 0],
                        coordinates: [[[-170, -50], [-170, 50], [170, 50], [170, -50], [-170, -50]]],
                        extent: [-170, -50, 170, 50],
                        projection: 'EPSG:4326',
                        radius: 0,
                        type: 'Polygon' });
                    break;
                default:
                    expect(false).toBe(true);
                }
            });
            done();
        }, {queryform: { spatialField: {method: 'Viewport'}}});
    });
    it('wfsQueryEpic', (done) => {
        const expectedResult = require('../../test-resources/wfs/museam.json');
        mockAxios.onPost().reply(() => {return [200, expectedResult];});
        testEpic(wfsQueryEpic, 2, query("base/web/client/test-resources/wfs/museam.json", {pagination: {} }), actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                case QUERY_RESULT:
                    expect(action.result).toEqual(expectedResult);
                    break;
                case FEATURE_LOADING:
                    break;
                default:
                    expect(false).toBe(true);
                }
            });
            done();
        });
    });
    it('wfsQueryEpic passing query options and default sort', (done) => {
        const expectedResult = require('../../test-resources/wfs/museam.json');
        mockAxios.onPost().reply(config => {
            expect(config.data).toContain('<ogc:PropertyName>NAME</ogc:PropertyName>');
            expect(config.data).toContain('<wfs:SortOrder>A</wfs:SortOrder>');
            return [200, expectedResult];
        });
        testEpic(wfsQueryEpic, 2, query("base/web/client/test-resources/wfs/museam.json", { pagination: {} }, {viewParams: "a:b"}), actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                case QUERY_RESULT:
                    expect(action.result).toEqual(expectedResult);
                    expect(action.queryOptions.viewParams).toEqual("a:b");
                    break;
                case FEATURE_LOADING:
                    break;
                default:
                    expect(false).toBe(true);
                }
            });
            done();
        }, {
            query: { typeName: 'layer1', featureTypes: {layer1: {attributes: [{attribute: 'NAME'}]}}}
        });
    });
    it('wfsQueryEpic passing filter object with valid sort options', (done) => {
        const expectedResult = require('../../test-resources/wfs/museam.json');
        mockAxios.onPost().reply(config => {
            expect(config.data).toContain('<ogc:PropertyName>NAME</ogc:PropertyName>');
            expect(config.data).toContain('<wfs:SortOrder>DESC</wfs:SortOrder>');
            return [200, expectedResult];
        });
        testEpic(wfsQueryEpic, 2, query("base/web/client/test-resources/wfs/museam.json", { pagination: {maxFeatures: 20, startIndex: 0}, sortOptions: {sortBy: "NAME", sortOrder: "DESC"} }, {}), actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                case QUERY_RESULT:
                    expect(action.result).toEqual(expectedResult);
                    expect(action.filterObj.pagination).toEqual({maxFeatures: 20, startIndex: 0});
                    expect(action.filterObj.sortOptions).toEqual({sortBy: "NAME", sortOrder: "DESC"});
                    break;
                case FEATURE_LOADING:
                    break;
                default:
                    expect(false).toBe(true);
                }
            });
            done();
        });
    });
    // required to load a featuretype when the layer to use is not the layer selected in TOC
    it('wfsQueryEpic passing filter object with no selected layers', (done) => {
        const expectedResult = require('../../test-resources/wfs/museam.json');
        mockAxios.onPost().reply(config => {
            expect(config.data).toContain('<ogc:PropertyName>NAME</ogc:PropertyName>');
            expect(config.data).toContain('<wfs:SortOrder>DESC</wfs:SortOrder>');
            return [200, expectedResult];
        });
        testEpic(wfsQueryEpic, 2, query("base/web/client/test-resources/wfs/museam.json", { pagination: {maxFeatures: 20, startIndex: 0}, sortOptions: {sortBy: "NAME", sortOrder: "DESC"}, featureTypeName: "layerId"}, {}), actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                case QUERY_RESULT:
                    expect(action.result).toEqual(expectedResult);
                    expect(action.filterObj.pagination).toEqual({maxFeatures: 20, startIndex: 0});
                    expect(action.filterObj.sortOptions).toEqual({sortBy: "NAME", sortOrder: "DESC"});
                    break;
                case FEATURE_LOADING:
                    break;
                default:
                    expect(false).toBe(true);
                }
            });
            done();
        });
    });
    it('wfsQueryEpic passing filter merged', (done) => {
        const expectedResult = require('../../test-resources/wfs/museam.json');
        mockAxios.onPost().reply(config => {
            expect(config.data).toContain('<ogc:PropertyName>NAME</ogc:PropertyName>');
            expect(config.data).toContain('<wfs:SortOrder>DESC</wfs:SortOrder>');
            return [200, expectedResult];
        });
        testEpic(wfsQueryEpic, 2, query("base/web/client/test-resources/wfs/museam.json", { pagination: {maxFeatures: 20, startIndex: 0}, sortOptions: {sortBy: "NAME", sortOrder: "DESC"}, featureTypeName: "layerId"}, {}), actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                case QUERY_RESULT:
                    expect(action.result).toEqual(expectedResult);
                    expect(action.filterObj.pagination).toEqual({maxFeatures: 20, startIndex: 0});
                    expect(action.filterObj.sortOptions).toEqual({sortBy: "NAME", sortOrder: "DESC"});
                    break;
                case FEATURE_LOADING:
                    break;
                default:
                    expect(false).toBe(true);
                }
            });
            done();
        }, {
            layers: {
                flat: [{id: 'TEST_LAYER', filter: {}}]
            },
            featuregrid: {
                timeSync: true,
                pagination: {
                    size: 10
                },
                open: true,
                selectedLayer: "TEST_LAYER",
                changes: []
            }
        });
    });
    it('wfsQueryEpic passing mixes params.cql_filter and layerFilter from layer', (done) => {
        let filterObj = {
            filterFields: [{
                groupId: 1,
                attribute: "attribute1",
                exception: null,
                operator: "=",
                rowId: "1",
                type: "list",
                value: "value1"
            }],
            groupFields: [{
                id: 1,
                index: 0,
                logic: "OR"
            }]
        };
        const expectedResult = require('../../test-resources/wfs/museam.json');
        mockAxios.onPost().reply(config => {
            expect(config.data).toContain('<ogc:PropertyName>NAME</ogc:PropertyName>');
            expect(config.data).toContain('<wfs:SortOrder>DESC</wfs:SortOrder>');
            expect(config.data).toContain("<ogc:Filter>"
            + "<ogc:And>"
                + "<ogc:PropertyIsEqualTo><ogc:PropertyName>attribute2</ogc:PropertyName><ogc:Literal>value2</ogc:Literal></ogc:PropertyIsEqualTo>"
                + "<ogc:Or><ogc:PropertyIsEqualTo><ogc:PropertyName>attribute1</ogc:PropertyName><ogc:Literal>value1</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Or>"
            + "</ogc:And></ogc:Filter>");
            return [200, expectedResult];
        });
        testEpic(wfsQueryEpic, 2, query("base/web/client/test-resources/wfs/museam.json", { pagination: {maxFeatures: 20, startIndex: 0}, sortOptions: {sortBy: "NAME", sortOrder: "DESC"}, featureTypeName: "layerId"}, {}), actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                case QUERY_RESULT:
                    expect(action.result).toEqual(expectedResult);
                    expect(action.filterObj.pagination).toEqual({maxFeatures: 20, startIndex: 0});
                    expect(action.filterObj.sortOptions).toEqual({sortBy: "NAME", sortOrder: "DESC"});
                    break;
                case FEATURE_LOADING:
                    break;
                default:
                    expect(false).toBe(true);
                }
            });
            done();
        }, {
            layers: {
                flat: [{id: 'TEST_LAYER', layerFilter: filterObj, params: {cql_filter: "attribute2 = 'value2'"}}]
            },
            featuregrid: {
                timeSync: true,
                pagination: {
                    size: 10
                },
                open: true,
                selectedLayer: "TEST_LAYER",
                changes: []
            }
        });
    });
    describe('wfsQueryEpic timedimension', () => {
        const BASE_URL = "/WFS";
        const DATE = "20180101T00:00:00";
        const BASE_TIME_TEST_STATE = {
            layers: {
                flat: [{
                    id: "TEST_LAYER",
                    title: "Test Layer",
                    name: 'editing:polygons',
                    params: {
                        viewParams: "a:b",
                        time: DATE
                    }
                }]
            },
            featuregrid: {
                timeSync: true,
                pagination: {
                    size: 10
                },
                open: true,
                selectedLayer: "TEST_LAYER",
                changes: []
            },
            dimension: {
                data: {
                    time: {
                        'TEST_LAYER': {
                            source: { // describes the source of dimension
                                type: 'multidim-extension',
                                url: 'http://domain.com:80/geoserver/wms'
                            },
                            name: 'time',
                            domain: '2016-09-01T00:00:00.000Z--2017-04-11T00:00:00.000Z'
                        }
                    }
                }
            }
        };
        const TIME_DISABLED_TEST_STATE = {
            ...BASE_TIME_TEST_STATE,
            featuregrid: {
                ...BASE_TIME_TEST_STATE.featuregrid,
                timeSync: false
            }
        };
        it('wfsQueryEpic manages time dimension, when enabled and present', (done) => {
            const expectedResult = require('../../test-resources/wfs/museam.json');
            mockAxios.onPost().reply(config => {
                const { pathname, query: queryString } = parse(config.url);
                expect(pathname).toBe(`${BASE_URL}`);
                const params = queryString.split('&');
                const paramPairs = params.map(p => p.split('='));
                expect(head(paramPairs.filter(([k, v]) => k === 'time' && v === encodeURIComponent(DATE)))).toNotExist();
                return [200, expectedResult];
            });
            testEpic(wfsQueryEpic, 2, query(BASE_URL, { pagination: {} }, { viewParams: "a:b" }), actions => {
                expect(actions.length).toBe(2);
                actions.map((action) => {
                    switch (action.type) {
                    case QUERY_RESULT:
                        expect(action.result).toEqual(expectedResult);
                        expect(action.queryOptions.viewParams).toEqual("a:b");
                        break;
                    case FEATURE_LOADING:
                        break;
                    default:
                        expect(false).toBe(true);
                    }
                });
                done();
            }, TIME_DISABLED_TEST_STATE);
        });
        it('wfsQueryEpic do not add time dimension, when timeSync disabled', (done) => {
            const expectedResult = require('../../test-resources/wfs/museam.json');
            mockAxios.onPost().reply(config => {
                const { pathname, query: queryString } = parse(config.url);
                expect(pathname).toBe(`${BASE_URL}`);
                const params = queryString.split('&');
                const paramPairs = params.map(p => p.split('='));
                expect(head(paramPairs.filter(([k, v]) => k === 'time' && v === encodeURIComponent(DATE)))).toExist();
                return [200, expectedResult];
            });
            testEpic(wfsQueryEpic, 2, query(BASE_URL, { pagination: {} }, { viewParams: "a:b" }), actions => {
                expect(actions.length).toBe(2);
                actions.map((action) => {
                    switch (action.type) {
                    case QUERY_RESULT:
                        expect(action.result).toEqual(expectedResult);
                        expect(action.queryOptions.viewParams).toEqual("a:b");
                        break;
                    case FEATURE_LOADING:
                        break;
                    default:
                        expect(false).toBe(true);
                    }
                });
                done();
            }, BASE_TIME_TEST_STATE);
        });
    });

    // this avoids race condition of state changes when update query is performed
    it('wfsQueryEpic stop on update query', (done) => {
        testEpic(addTimeoutEpic(wfsQueryEpic, 50), 2, [
            query("base/web/client/test-resources/wfs/museam.json", {pagination: {} }),
            updateQuery()
        ], actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                case TEST_TIMEOUT:
                    break;
                case FEATURE_LOADING:
                    break;
                default:
                    expect(false).toBe(true);
                }
            });
            done();
        });
    });

    describe('featureTypeSelectedEpic', () => {
        const expectedResult = require('../../test-resources/vector/feature-collection-vector.json');
        const flatLayers = [{
            id: 'layer1',
            name: 'layer1 name',
            title: 'layer1 title',
            description: 'layer1 description',
            type: 'vector',
            features: expectedResult
        }];
        const wmsLayer = [{
            id: 'layer2',
            name: 'poi',
            title: 'layer2 title',
            description: 'layer2 description',
            type: 'wms'
        }];
        it('vector layer', (done) => {
            const mockState = {
                query: {
                    data: {},
                    featureTypes: [],
                    typeName: 'layer1',
                    url: '/dummy'},
                featuregrid: {
                    timeSync: true,
                    pagination: {
                        size: 10
                    },
                    open: true,
                    selectedLayer: "layer1",
                    changes: [],
                    mode: 'VIEW'
                },
                layers: {
                    flat: flatLayers,
                    layerMetadata: {
                        expanded: false,
                        maskLoading: false
                    },
                    settings: {
                        expanded: false,
                        node: null,
                        nodeType: null,
                        options: {}
                    }
                }
            };
            mockAxios.onPost().reply(() => {return [200, expectedResult];});
            testEpic(addTimeoutEpic(wfsQueryEpic, 500), 4, [
                query("base/web/client/test-resources/vector/feature-collection-vector.json", {pagination: {} }),
                featureTypeSelected('/dummy', 'layer1')
            ], actions => {
                expect(actions.length).toBe(4);
                actions.map((action) => {
                    switch (action.type) {
                    case QUERY_RESULT:
                        expect(action.result.features).toEqual(expectedResult);
                        expect(action.result.totalFeatures).toEqual(expectedResult.length);
                        expect(action.result.numberMatched).toEqual(expectedResult.length);
                        expect(action.result.numberReturned).toEqual(expectedResult.length);
                        break;
                    case FEATURE_LOADING:
                        break;
                    case LAYER_LOAD:
                        break;
                    default:
                        expect(false).toBe(true);
                    }
                });
                done();
            },
            mockState
            );
        });

        it('featureTypeSelectedEpic', (done) => {
            const mockState = {
                query: {
                    data: {},
                    featureTypes: [],
                    typeName: 'layer1',
                    url: '/dummy'},
                featuregrid: {
                    timeSync: true,
                    pagination: {
                        size: 10
                    },
                    open: true,
                    selectedLayer: "layer1",
                    changes: [],
                    mode: 'VIEW'
                },
                layers: {
                    flat: wmsLayer,
                    layerMetadata: {
                        expanded: false,
                        maskLoading: false
                    },
                    settings: {
                        expanded: false,
                        node: null,
                        nodeType: null,
                        options: {}
                    }
                }
            };
            const wfsResults = require('../../test-resources/wfs/describe-pois.json');
            mockAxios.onGet().reply(() => [200, wfsResults]);
            testEpic(featureTypeSelectedEpic, 2,
                featureTypeSelected('/dummy', 'poi'), ([changeSpatialAttribute, featureTypeLoaded]) => {
                    try {
                        expect(featureTypeLoaded.type).toBe(FEATURE_TYPE_LOADED);
                        expect(changeSpatialAttribute.type).toBe(CHANGE_SPATIAL_ATTRIBUTE);
                        expect(featureTypeLoaded.featureType.attributes).toEqual([{
                            label: "NAME",
                            attribute: "NAME",
                            type: "string",
                            valueId: "id",
                            valueLabel: "name",
                            values: []
                        },
                        {
                            label: "THUMBNAIL",
                            attribute: "THUMBNAIL",
                            type: "string",
                            valueId: "id",
                            valueLabel: "name",
                            values: []
                        },
                        {
                            label: "MAINPAGE", attribute: "MAINPAGE", type: "string", valueId: "id", valueLabel: "name", values: []
                        }]);

                    } catch (error) {
                        done(error);
                    }
                    done();
                }, mockState);
        });
    });
});
