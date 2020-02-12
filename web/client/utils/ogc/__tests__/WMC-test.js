/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import axios from 'axios';
import { omit } from 'lodash';

import { toMapConfig } from '../WMC';

describe('WMC tests', () => {
    it('toMapConfig with a valid sample context', () =>
        axios.get('base/web/client/test-resources/wmc/context.wmc').then(response => toMapConfig(response.data)).then(config => {
            expect(config).toExist();
            expect(config.version).toBe(2);
            expect(config.catalogServices).toEqual({});
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
            expect(config.map.layers.length).toBe(3);
            expect(config.map.layers[0].id).toExist();
            expect(config.map.layers[0].id.length).toBe(36);
            expect(omit(config.map.layers[0], 'id')).toEqual({
                name: 'background_layer',
                title: 'Background Layer',
                visibility: true,
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
        axios.get('base/web/client/test-resources/wmc/context.wmc').then(response => toMapConfig(response.data, true)).then(config => {
            expect(config).toExist();
            expect(config.version).toBe(2);
            expect(config.catalogServices).toEqual({});
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
            expect(config.catalogServices).toEqual({});
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
});
