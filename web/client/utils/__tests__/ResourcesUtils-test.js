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
    replaceResourcePaths,
    isMenuItemSupportedSupported,
    getSupportedResourceTypes
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
    describe('getSupportedResourceTypes', () => {
        it('should return the same array if availableResourceTypes is an array', () => {
            const result = getSupportedResourceTypes(['MAPS', 'DASHBOARDS'], {});
            expect(result).toEqual(['MAPS', 'DASHBOARDS']);
        });
        it('should return resource types based on user role', () => {
            const availableResourceTypes = {
                ADMIN: ['MAPS', 'DASHBOARDS', 'CONTEXTS'],
                USER: ['MAPS', 'GEOSTORIES'],
                anonymous: ['MAPS', 'DASHBOARDS']
            };
            const user = { role: 'ADMIN' };
            const result = getSupportedResourceTypes(availableResourceTypes, user);
            expect(result).toEqual(['MAPS', 'DASHBOARDS', 'CONTEXTS']);
        });
        it('should return anonymous resource types if user role is not found', () => {
            const availableResourceTypes = {
                ADMIN: ['MAPS', 'DASHBOARDS'],
                USER: ['MAPS', 'GEOSTORIES'],
                anonymous: ['MAPS', 'DASHBOARDS']
            };
            const user = { role: 'anonymous' };
            const result = getSupportedResourceTypes(availableResourceTypes, user);
            expect(result).toEqual(['MAPS', 'DASHBOARDS']);
        });
        it('should return an empty array if no resource types are available', () => {
            const result = getSupportedResourceTypes({}, {});
            expect(result).toEqual([]);
        });
    });
    describe('isMenuItemSupportedSupported', () => {
        it('should return false if item is disabled', () => {
            const item = { disableIf: true };
            const result = isMenuItemSupportedSupported(item, {}, {});
            expect(result).toBe(false);
        });
        it('should return true if resourceType is undefined', () => {
            const item = { resourceType: undefined };
            const result = isMenuItemSupportedSupported(item, {}, {});
            expect(result).toBe(true);
        });
        it('should return true if resourceType is supported', () => {
            const item = { resourceType: 'MAPS' };
            const availableResourceTypes = {
                ADMIN: ['MAPS', 'DASHBAORDS', 'CONTEXTS'],
                USER: ['MAPS', 'DASHBOARDS'],
                anonymous: ['MAPS']
            };
            const user = { role: 'ADMIN' };
            const result = isMenuItemSupportedSupported(item, availableResourceTypes, user);
            expect(result).toBe(true);
        });
        it('should return false if resourceType is not supported', () => {
            const item = { resourceType: ['MAPS', 'DASHBOARDS', 'CONTEXTS']};
            const availableResourceTypes = {
                ADMIN: ['MAPS', 'DASHBAORDS'],
                USER: ['MAPS', 'DASHBOARDS'],
                anonymous: ['MAPS']
            };
            const user = { role: 'ADMIN' };
            const result = isMenuItemSupportedSupported(item, availableResourceTypes, user);
            expect(result).toBe(false);
        });
    });
});
