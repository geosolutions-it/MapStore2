/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import axios from 'axios';
import { omit, zip } from 'lodash';

import { toMapConfig, toWMC } from '../WMC';

describe('WMC tests', () => {
    it('toMapConfig with a valid sample context', () =>
        axios.get('base/web/client/test-resources/wmc/context.wmc').then(response => toMapConfig(response.data)).then(config => {
            expect(config).toExist();
            expect(config.version).toBe(2);
            expect(config.catalogServices).toExist();
            expect(config.catalogServices.selectedService).toBe('testservice');
            expect(config.catalogServices.services).toEqual({
                "Demo CSW Service": {
                    autoload: true,
                    title: "Demo CSW Service",
                    type: "csw",
                    url: "https://testserver/csw",
                    oldService: "old_service"
                },
                "testservices": {
                    autoload: false,
                    type: "csw",
                    url: "https://testserver/testservice/csw",
                    title: "testservice",
                    showAdvancedSettings: true,
                    showTemplate: true,
                    metadataTemplate: "<p>${description}</p>",
                    format: "image/jpeg",
                    jsObject: {
                        parameter1: "value<>",
                        parameter2: 1,
                        parameter3: {
                            parameter4: 2
                        },
                        parameter6: null
                    }
                }
            });
            expect(config.map).toExist();
            expect(config.map.maxExtent).toEqual([-1, 1, -1, 1]);
            expect(config.map.projection).toBe('EPSG:3857');
            expect(config.map.backgrounds).toEqual([]);
            expect(config.map.center).toEqual({x: 1.5, y: 2.5, crs: "EPSG:3857"});
            expect(config.map.zoom).toBe(7);
            expect(config.map.groups).toExist();
            expect(config.map.groups.length).toBe(4);
            expect(config.map.groups[0].id).toBe('Default');
            expect(config.map.groups[0].title).toBe('Default');
            expect(config.map.groups[0].expanded).toBe(true);
            expect(config.map.groups[1].id).toBe('groupid1');
            expect(config.map.groups[1].title).toBe('Group1');
            expect(config.map.groups[1].expanded).toBe(true);
            expect(config.map.groups[2].id).toBe('groupid1.groupid2');
            expect(config.map.groups[2].title).toBe('Group2');
            expect(config.map.groups[2].expanded).toBe(false);
            expect(config.map.groups[3].id).toBe('groupid3');
            expect(config.map.groups[3].title).toBe('Group3');
            expect(config.map.groups[3].expanded).toBe(true);
            expect(config.map.layers).toExist();
            expect(config.map.layers.length).toBe(3);
            expect(config.map.layers[0].id).toExist();
            expect(config.map.layers[0].id.length).toBe(36);
            expect(omit(config.map.layers[0], 'id')).toEqual({
                name: 'background_layer',
                title: 'Background Layer',
                visibility: true,
                dimensions: [],
                type: 'wms',
                url: 'http://server.com/ws/service.wms?',
                format: 'image/png',
                singleTile: false,
                queryable: false,
                params: {},
                group: 'background'
            });
            expect(config.map.layers[1].id).toExist();
            expect(config.map.layers[1].id.length).toBe(36);
            expect(omit(config.map.layers[1], 'id')).toEqual({
                name: 'test_layer1',
                title: 'Test Layer 1',
                visibility: true,
                dimensions: [{
                    name: 'time',
                    source: {
                        type: 'multidim-extension',
                        url: 'https://server.com/service/wmts'
                    }
                }, {
                    name: 'elevation',
                    units: 'EPSG:5030',
                    unitSymbol: 'm',
                    'default': '0.0',
                    values: ['0.0', '200.0', '400.0']
                }],
                search: {
                    type: 'wfs',
                    url: 'https://server.com/wfs'
                },
                type: 'wms',
                url: 'https://server.com/service/wms',
                format: 'image/jpeg',
                singleTile: true,
                queryable: true,
                opacity: 0.5,
                group: 'groupid1',
                params: {},
                bbox: {
                    bounds: {
                        minx: -2,
                        miny: -2,
                        maxx: 2,
                        maxy: 2
                    },
                    crs: 'EPSG:3857'
                }
            });
            expect(config.map.layers[2].id).toExist();
            expect(config.map.layers[2].id.length).toBe(36);
            expect(omit(config.map.layers[2], 'id')).toEqual({
                name: 'test_layer2',
                title: 'Test Layer 2',
                visibility: false,
                dimensions: [],
                type: 'wms',
                url: 'http://server.com/ws/service.wms?',
                format: 'image/png',
                style: 'DEFAULT',
                singleTile: false,
                queryable: false,
                params: {},
                bbox: {
                    bounds: {
                        minx: -2,
                        miny: 6,
                        maxx: -1,
                        maxy: 6
                    },
                    crs: 'EPSG:3857'
                }
            });
        })
    );
    it('toMapConfig with generateLayersGroup=true', () =>
        axios.get('base/web/client/test-resources/wmc/context-no-groups.wmc').then(response => toMapConfig(response.data, true)).then(config => {
            expect(config).toExist();
            expect(config.version).toBe(2);
            expect(config.catalogServices).toNotExist();
            expect(config.map).toExist();
            expect(config.map.maxExtent).toEqual([-1, 1, -1, 1]);
            expect(config.map.projection).toBe('EPSG:3857');
            expect(config.map.backgrounds).toEqual([]);
            expect(config.map.center).toNotExist();
            expect(config.map.zoom).toNotExist();
            expect(config.map.groups).toExist();
            expect(config.map.groups.length).toBe(1);
            expect(config.map.groups[0].id).toExist();
            expect(config.map.groups[0].id.length).toBe(36);
            expect(config.map.groups[0].title).toBe('Sample Context');
            expect(config.map.layers).toExist();
            expect(config.map.layers.length).toBe(3);
            expect(config.map.layers[0].id).toExist();
            expect(config.map.layers[0].id.length).toBe(36);
            expect(omit(config.map.layers[0], 'id')).toEqual({
                name: 'background_layer',
                title: 'Background Layer',
                visibility: true,
                dimensions: [],
                type: 'wms',
                url: 'http://server.com/ws/service.wms?',
                format: 'image/png',
                singleTile: false,
                queryable: false,
                params: {},
                group: 'background'
            });
            expect(config.map.layers[1].id).toExist();
            expect(config.map.layers[1].id.length).toBe(36);
            expect(omit(config.map.layers[1], 'id')).toEqual({
                name: 'test_layer1',
                title: 'Test Layer 1',
                visibility: true,
                dimensions: [],
                type: 'wms',
                url: 'https://server.com/service/wms',
                format: 'image/jpeg',
                singleTile: true,
                queryable: true,
                params: {},
                bbox: {
                    bounds: {
                        minx: -2,
                        miny: -2,
                        maxx: 2,
                        maxy: 2
                    },
                    crs: 'EPSG:3857'
                },
                group: config.map.groups[0].id
            });
            expect(config.map.layers[2].id).toExist();
            expect(config.map.layers[2].id.length).toBe(36);
            expect(omit(config.map.layers[2], 'id')).toEqual({
                name: 'test_layer2',
                title: 'Test Layer 2',
                visibility: false,
                dimensions: [],
                type: 'wms',
                url: 'http://server.com/ws/service.wms?',
                format: 'image/png',
                style: 'DEFAULT',
                singleTile: false,
                queryable: false,
                params: {},
                bbox: {
                    bounds: {
                        minx: -2,
                        miny: 6,
                        maxx: -1,
                        maxy: 6
                    },
                    crs: 'EPSG:3857'
                },
                group: config.map.groups[0].id
            });
        })
    );
    it('toMapConfig with a context without backgrounds', () =>
        axios.get('base/web/client/test-resources/wmc/context-no-backgrounds.wmc').then(response => toMapConfig(response.data)).then(config => {
            expect(config).toExist();
            expect(config.version).toBe(2);
            expect(config.catalogServices).toNotExist();
            expect(config.map).toExist();
            expect(config.map.maxExtent).toEqual([-1, 1, -1, 1]);
            expect(config.map.projection).toBe('EPSG:3857');
            expect(config.map.backgrounds).toEqual([]);
            expect(config.map.center).toNotExist();
            expect(config.map.zoom).toNotExist();
            expect(config.map.groups).toExist();
            expect(config.map.groups.length).toBe(1);
            expect(config.map.groups[0].id).toBe('Default');
            expect(config.map.groups[0].expanded).toBe(true);
            expect(config.map.layers).toExist();
            expect(config.map.layers.length).toBe(4);
            expect(config.map.layers[0].type).toBe('empty');
            expect(config.map.layers[0].group).toBe('background');
            expect(config.map.layers[0].visibility).toBe(true);
            expect(config.map.layers[1].id).toExist();
            expect(config.map.layers[1].id.length).toBe(36);
            expect(omit(config.map.layers[1], 'id')).toEqual({
                name: 'test_layer1',
                title: 'Test Layer 1',
                visibility: true,
                dimensions: [],
                type: 'wms',
                url: 'https://server.com/service/wms',
                format: 'image/jpeg',
                singleTile: true,
                queryable: true,
                params: {},
                bbox: {
                    bounds: {
                        minx: -2,
                        miny: -2,
                        maxx: 2,
                        maxy: 2
                    },
                    crs: 'EPSG:3857'
                }
            });
            expect(config.map.layers[2].id).toExist();
            expect(config.map.layers[2].id.length).toBe(36);
            expect(omit(config.map.layers[2], 'id')).toEqual({
                name: 'test_layer2',
                title: 'Test Layer 2',
                visibility: false,
                dimensions: [],
                type: 'wms',
                url: 'http://server.com/ws/service.wms?',
                format: 'image/png',
                style: 'DEFAULT',
                singleTile: false,
                queryable: false,
                params: {},
                bbox: {
                    bounds: {
                        minx: -2,
                        miny: 6,
                        maxx: -1,
                        maxy: 6
                    },
                    crs: 'EPSG:3857'
                }
            });
            expect(config.map.layers[3].id).toExist();
            expect(config.map.layers[3].id.length).toBe(36);
            expect(omit(config.map.layers[3], 'id')).toEqual({
                name: 'test_layer3',
                title: 'Test Layer 3',
                visibility: true,
                dimensions: [],
                type: 'wms',
                url: 'http://server.com/ws/service.wms?',
                format: 'image/png',
                singleTile: false,
                queryable: false,
                params: {},
                bbox: {
                    bounds: {
                        minx: -2,
                        miny: -2,
                        maxx: 2,
                        maxy: 2
                    },
                    crs: 'EPSG:3857'
                }
            });
        })
    );
    it('toMapConfig with a bad WMC xlmns', (done) => {
        axios.get('base/web/client/test-resources/wmc/context-bad-header.wmc').then(response => toMapConfig(response.data)
            .catch(() => done())).then(() => {
            done(new Error('Expected toMapConfig to throw an error!'));
        });
    });
    it('toWMC', () =>
        Promise.all([
            axios.get('base/web/client/test-resources/wmc/config.json'),
            axios.get('base/web/client/test-resources/wmc/exported-context.wmc')
        ]).then(([{data: config}, {data: context}]) => {
            const exportedLines = toWMC(config, {}).split('\n').map(r => r.trim()).filter(e => e);
            const contextLines = context.split('\n').map(r => r.trim()).filter(e => e);

            zip(exportedLines, contextLines).forEach(([exportedLine, contextLine], i) =>
                expect({text: exportedLine, line: i + 1}).toEqual({text: contextLine, line: i + 1}));
        })
    );
});
