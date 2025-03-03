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
    computePendingChanges,
    parseResourceProperties
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
        })).toEqual({ items: [{ type: 'icon', tooltipId: 'resourcesCatalog.unadvertised', glyph: 'eye-slash' }] });
        expect(getResourceStatus({
            '@extras': {
                context: {
                    name: 'Context'
                }
            }
        })).toEqual({ items: [{ type: 'icon', glyph: 'cogs', tooltipId: 'resourcesCatalog.mapUsesContext', tooltipParams: { contextName: 'Context' } }] });
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
    it('computePendingChanges with thumbnail', () => {
        let computedChanges = computePendingChanges(
            { id: 1, name: 'Title', attributes: { thumbnail: '/thumb' }, category: { name: 'MAP' } },
            { id: 1, name: 'Title', attributes: { thumbnail: '' }, category: { name: 'MAP' } });
        expect(computedChanges.initialResource).toEqual({ id: 1, name: 'Title', attributes: { thumbnail: '/thumb' }, category: { name: 'MAP' } });
        expect(computedChanges.resource).toEqual({ id: 1, name: 'Title', attributes: { thumbnail: '' }, category: { name: 'MAP' } });
        expect(computedChanges.changes.linkedResources.thumbnail.value).toBe('/thumb');
        expect(computedChanges.changes.linkedResources.thumbnail.data).toBe('NODATA');

        computedChanges = computePendingChanges(
            { id: 1, name: 'Title', attributes: {}, category: { name: 'MAP' } },
            { id: 1, name: 'Title', attributes: { thumbnail: '/thumb' }, category: { name: 'MAP' } });
        expect(computedChanges.initialResource).toEqual({ id: 1, name: 'Title', attributes: { }, category: { name: 'MAP' } });
        expect(computedChanges.resource).toEqual({ id: 1, name: 'Title', attributes: { thumbnail: '/thumb' }, category: { name: 'MAP' } });
        expect(computedChanges.changes.linkedResources.thumbnail.value).toBe('NODATA');
        expect(computedChanges.changes.linkedResources.thumbnail.data).toBe('/thumb');
        const tailsParts = computedChanges.changes.linkedResources.thumbnail.tail.split('&');
        expect(tailsParts[0]).toBe('/raw?decode=datauri');
        expect(tailsParts[1].includes('v=')).toBe(true);
    });
    it('computePendingChanges with tags', () => {
        const computed = computePendingChanges(
            { id: 1, name: 'Title', category: { name: 'MAP' }, tags: [{ id: '01' }, { id: '02' }] },
            { id: 1, name: 'Title', category: { name: 'MAP' }, tags: [{ id: '02' }, { id: '03' }] }
        );
        expect(computed.saveResource.tags).toEqual(computed.changes.tags);
        expect(computed.saveResource.tags).toEqual([
            { tag: { id: '01' }, action: 'unlink' },
            { tag: { id: '03' }, action: 'link' }
        ]);
    });

    it('computePendingChanges with empty attributes in initial resource', () => {
        const computed = computePendingChanges(
            { },
            { attributes: { featured: true } }
        );
        expect(computed.changes).toEqual({ attributes: { featured: true } });
    });

    it('should parse the detailsSettings of resource', () => {
        let resource = parseResourceProperties({ attributes: { detailsSettings: "{\"showAsModal\":false,\"showAtStartup\":false}" } });
        expect(resource?.attributes?.detailsSettings).toEqual({ showAsModal: false, showAtStartup: false });
        resource = parseResourceProperties(resource);
        expect(resource?.attributes?.detailsSettings).toEqual({ showAsModal: false, showAtStartup: false });
    });
});
