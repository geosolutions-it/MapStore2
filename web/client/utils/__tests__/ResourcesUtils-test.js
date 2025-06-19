/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    getResourceInfo,
    getResourceStatus,
    replaceResourcePaths
} from '../ResourcesUtils';
import expect from 'expect';

describe('ResourcesUtils', () => {
    describe('getResourceInfo', () => {
        it('should return resource info when info exists', () => {
            const resource = {
                '@extras': {
                    info: {
                        title: 'Test Title',
                        icon: 'test-icon',
                        thumbnailUrl: 'test-thumbnail-url',
                        viewerPath: 'test-viewer-path',
                        viewerUrl: 'test-viewer-url'
                    }
                }
            };
            const result = getResourceInfo(resource);
            expect(result).toEqual({
                title: 'Test Title',
                icon: 'test-icon',
                thumbnailUrl: 'test-thumbnail-url',
                viewerPath: 'test-viewer-path',
                viewerUrl: 'test-viewer-url'
            });
        });

        it('should return an empty object when info does not exist', () => {
            const resource = {};
            const result = getResourceInfo(resource);
            expect(result).toEqual({});
        });
    });

    describe('getResourceStatus', () => {
        it('should return resource status when status exists', () => {
            const resource = {
                '@extras': {
                    status: {
                        items: [
                            {
                                type: 'test-type',
                                tooltipId: 'test-tooltip-id',
                                glyph: 'test-glyph',
                                tooltipParams: { param1: 'value1' }
                            }
                        ]
                    }
                }
            };
            const result = getResourceStatus(resource);
            expect(result).toEqual({
                items: [
                    {
                        type: 'test-type',
                        tooltipId: 'test-tooltip-id',
                        glyph: 'test-glyph',
                        tooltipParams: { param1: 'value1' }
                    }
                ]
            });
        });

        it('should return an empty object when status does not exist', () => {
            const resource = {};
            const result = getResourceStatus(resource);
            expect(result).toEqual({});
        });

        it('should return an empty object when resource is undefined', () => {
            const result = getResourceStatus();
            expect(result).toEqual({});
        });
    });

    describe('replaceResourcePaths', () => {
        it('should return the same value if it is neither an array nor an object', () => {
            const result = replaceResourcePaths('test', {}, []);
            expect(result).toEqual('test');
        });

        it('should recursively replace paths in an array', () => {
            const resource = { key1: 'value1', key2: 'value2' };
            const value = [{ path: 'key1' }, { path: 'key2' }];
            const result = replaceResourcePaths(value, resource, []);
            expect(result).toEqual([ { value: 'value1', path: 'key1' }, { value: 'value2', path: 'key2' } ]);
        });

        it('should replace paths in an object and merge facet data', () => {
            const resource = { key1: 'value1' };
            const facets = [{ id: 'facet1', name: 'Facet Name' }];
            const value = { facet: 'facet1', path: 'key1', other: 'data' };
            const result = replaceResourcePaths(value, resource, facets);
            expect(result).toEqual({ id: 'facet1', name: 'Facet Name', value: 'value1', facet: 'facet1', path: 'key1', other: 'data' });
        });

        it('should handle nested objects and arrays', () => {
            const resource = { key1: 'value1', key2: 'value2' };
            const facets = [{ id: 'facet1', name: 'Facet Name' }];
            const value = {
                facet: 'facet1',
                path: 'key1',
                nested: [{ path: 'key2' }, 'staticValue']
            };
            const result = replaceResourcePaths(value, resource, facets);
            expect(result).toEqual({ id: 'facet1', name: 'Facet Name', value: 'value1',
                facet: 'facet1', path: 'key1', nested: [ { value: 'value2', path: 'key2' }, 'staticValue' ] } );
        });

        it('should return an empty object if no matching facet is found', () => {
            const resource = { key1: 'value1' };
            const facets = [{ id: 'facet2', name: 'Facet Name' }];
            const value = { facet: 'facet1', path: 'key1' };
            const result = replaceResourcePaths(value, resource, facets);
            expect(result).toEqual({ value: 'value1', facet: 'facet1', path: 'key1' });
        });
    });
});
