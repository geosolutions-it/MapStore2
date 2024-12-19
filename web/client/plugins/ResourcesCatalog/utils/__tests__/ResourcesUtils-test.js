/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    parseNODATA,
    getResourceTypesInfo,
    getResourceStatus,
    getResourceId,
    computePendingChanges
} from '../ResourcesUtils';
import expect from 'expect';

describe('ResourcesUtils', () => {
    it('parseNODATA', () => {
        expect(parseNODATA('NODATA')).toBe('');
        expect(parseNODATA('/resource/1')).toBe('/resource/1');
    });
    it('getResourceTypesInfo', () => {
        expect(getResourceTypesInfo({
            id: '1',
            name: 'Map',
            category: {
                name: 'MAP'
            },
            attributes: {
                thumbnail: '/thumb/2'
            }
        })).toEqual({ title: 'Map', icon: { glyph: '1-map', type: 'glyphicon' }, thumbnailUrl: '/thumb/2', viewerPath: '/viewer/1', viewerUrl: '#/viewer/1' });
        expect(getResourceTypesInfo({
            id: '1',
            name: 'Map',
            category: {
                name: 'MAP'
            },
            attributes: {
                thumbnail: 'NODATA'
            }
        })).toEqual({ title: 'Map', icon: { glyph: '1-map', type: 'glyphicon' }, thumbnailUrl: '', viewerPath: '/viewer/1', viewerUrl: '#/viewer/1' });
        expect(getResourceTypesInfo({
            id: '1',
            name: 'Map',
            category: {
                name: 'MAP'
            },
            attributes: {
                thumbnail: '/thumb/2'
            },
            '@extras': {
                context: {
                    name: 'context'
                }
            }
        })).toEqual({ title: 'Map', icon: { glyph: '1-map', type: 'glyphicon' }, thumbnailUrl: '/thumb/2', viewerPath: '/context/context/1', viewerUrl: '#/context/context/1' });

        expect(getResourceTypesInfo({
            id: '1',
            name: 'Dashboard',
            category: {
                name: 'DASHBOARD'
            },
            attributes: {
                thumbnail: '/thumb/2'
            }
        })).toEqual({ title: 'Dashboard', icon: { glyph: 'dashboard', type: 'glyphicon' }, thumbnailUrl: '/thumb/2', viewerPath: '/dashboard/1', viewerUrl: '#/dashboard/1' });

        expect(getResourceTypesInfo({
            id: '1',
            name: 'GeoStory',
            category: {
                name: 'GEOSTORY'
            },
            attributes: {
                thumbnail: '/thumb/2'
            }
        })).toEqual({ title: 'GeoStory', icon: { glyph: 'geostory', type: 'glyphicon' }, thumbnailUrl: '/thumb/2', viewerPath: '/geostory/1', viewerUrl: '#/geostory/1' });
        expect(getResourceTypesInfo({
            id: '1',
            name: 'custom',
            category: {
                name: 'CONTEXT'
            },
            attributes: {
                thumbnail: '/thumb/2'
            }
        })).toEqual({ title: 'custom', icon: { glyph: 'cogs' }, thumbnailUrl: '/thumb/2', viewerPath: '/context/custom', viewerUrl: '#/context/custom' });
    });
    it('getResourceStatus', () => {
        expect(getResourceStatus()).toEqual({ items: [] });
        expect(getResourceStatus({
            advertised: false
        })).toEqual({ items: [{ type: 'icon', tooltipId: 'resourcesCatalog.unadvertised', variant: 'warning', glyph: 'eye-slash' }] });
        expect(getResourceStatus({
            '@extras': {
                context: {
                    name: 'Context'
                }
            }
        })).toEqual({ items: [{ type: 'icon', glyph: 'cogs', tooltip: 'Context' }] });
    });
    it('getResourceId', () => {
        expect(getResourceId()).toBe(undefined);
        expect(getResourceId({ id: 1 })).toBe(1);
    });
    it('computePendingChanges', () => {
        expect(computePendingChanges({ id: 1, name: 'Title', category: { name: 'MAP' } }, { id: 1, name: 'Title', category: { name: 'MAP' } })).toEqual(
            {
                initialResource: { id: 1, name: 'Title', category: { name: 'MAP' } },
                resource: { id: 1, name: 'Title', category: { name: 'MAP' } },
                saveResource: { id: 1, permission: undefined, category: 'MAP', metadata: { id: 1, name: 'Title', attributes: {} } },
                changes: {}
            }
        );

        expect(computePendingChanges({ id: 1, name: 'Title', category: { name: 'MAP' } }, { id: 1, name: 'New Title', category: { name: 'MAP' } })).toEqual(
            {
                initialResource: { id: 1, name: 'Title', category: { name: 'MAP' } },
                resource: { id: 1, name: 'New Title', category: { name: 'MAP' } },
                saveResource: { id: 1, permission: undefined, category: 'MAP', metadata: { id: 1, name: 'New Title', attributes: {} } },
                changes: {
                    name: 'New Title'
                }
            }
        );

        expect(computePendingChanges(
            { id: 1, name: 'Title', attributes: { thumbnail: '/thumb' }, category: { name: 'MAP' } },
            { id: 1, name: 'Title', attributes: { thumbnail: '' }, category: { name: 'MAP' } })).toEqual(
            {
                initialResource: { id: 1, name: 'Title', attributes: { thumbnail: '/thumb' }, category: { name: 'MAP' } },
                resource: { id: 1, name: 'Title', attributes: { thumbnail: '' }, category: { name: 'MAP' } },
                saveResource: {
                    id: 1,
                    permission: undefined,
                    category: 'MAP',
                    metadata: { id: 1, name: 'Title', attributes: { thumbnail: '/thumb' } },
                    linkedResources: { thumbnail: { tail: '/raw?decode=datauri', category: 'THUMBNAIL', value: '/thumb', data: 'NODATA' } }
                },
                changes: { linkedResources: { thumbnail: { tail: '/raw?decode=datauri', category: 'THUMBNAIL', value: '/thumb', data: 'NODATA' } } } }
        );

        expect(computePendingChanges(
            { id: 1, name: 'Title', attributes: {}, category: { name: 'MAP' } },
            { id: 1, name: 'Title', attributes: { thumbnail: '/thumb' }, category: { name: 'MAP' } })).toEqual(
            {
                initialResource: { id: 1, name: 'Title', attributes: { }, category: { name: 'MAP' } },
                resource: { id: 1, name: 'Title', attributes: { thumbnail: '/thumb' }, category: { name: 'MAP' } },
                saveResource: {
                    id: 1,
                    permission: undefined,
                    category: 'MAP',
                    metadata: { id: 1, name: 'Title', attributes: {} },
                    linkedResources: { thumbnail: { tail: '/raw?decode=datauri', category: 'THUMBNAIL', value: 'NODATA', data: '/thumb' } }
                },
                changes: { linkedResources: { thumbnail: {  tail: '/raw?decode=datauri', category: 'THUMBNAIL', value: 'NODATA', data: '/thumb' } } } }
        );

        expect(computePendingChanges(
            { id: 1, name: 'Title', attributes: {}, category: { name: 'MAP' } },
            { id: 1, name: 'Title', attributes: { details: '/details' }, category: { name: 'MAP' } })).toEqual(
            {
                initialResource: { id: 1, name: 'Title', attributes: { }, category: { name: 'MAP' } },
                resource: { id: 1, name: 'Title', attributes: { details: '/details' }, category: { name: 'MAP' } },
                saveResource: {
                    id: 1,
                    permission: undefined,
                    category: 'MAP',
                    metadata: { id: 1, name: 'Title', attributes: {} },
                    linkedResources: { details: { category: 'DETAILS', value: 'NODATA', data: '/details' } }
                },
                changes: { linkedResources: { details: { category: 'DETAILS', value: 'NODATA', data: '/details' } } } }
        );

        expect(computePendingChanges({ id: 1, name: 'Title', category: { name: 'MAP' } }, { id: 1, name: 'Title', category: { name: 'MAP' } }, { pending: true, payload: { map: {} } })).toEqual(
            {
                initialResource: { id: 1, name: 'Title', category: { name: 'MAP' } },
                resource: { id: 1, name: 'Title', category: { name: 'MAP' } },
                saveResource: { id: 1, permission: undefined, category: 'MAP', metadata: { id: 1, name: 'Title', attributes: {} }, data: { map: {} } },
                changes: { data: true }
            }
        );
    });
});
