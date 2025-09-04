/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    parseNODATA,
    getGeostoreResourceTypesInfo,
    getGeostoreResourceStatus,
    computePendingChanges,
    parseResourceProperties,
    THUMBNAIL_DATA_KEY,
    DETAILS_DATA_KEY,
    parseClonedResourcePayload,
    isContextMapWithoutContextPermission
} from '../GeostoreUtils';
import expect from 'expect';

describe('GeostoreUtils', () => {
    it('parseNODATA', () => {
        expect(parseNODATA('NODATA')).toBe('');
        expect(parseNODATA('/resource/1')).toBe('/resource/1');
    });
    it('getGeostoreResourceTypesInfo', () => {
        expect(getGeostoreResourceTypesInfo({
            id: '1',
            name: 'Map',
            category: {
                name: 'MAP'
            },
            attributes: {
                thumbnail: '/thumb/2'
            }
        })).toEqual({ title: 'Map', icon: { glyph: '1-map' }, thumbnailUrl: '/thumb/2', viewerPath: '/viewer/1', viewerUrl: '#/viewer/1' });
        expect(getGeostoreResourceTypesInfo({
            id: '1',
            name: 'Map',
            category: {
                name: 'MAP'
            },
            attributes: {
                thumbnail: 'NODATA'
            }
        })).toEqual({ title: 'Map', icon: { glyph: '1-map' }, thumbnailUrl: '', viewerPath: '/viewer/1', viewerUrl: '#/viewer/1' });
        expect(getGeostoreResourceTypesInfo({
            id: '1',
            name: 'Map',
            category: {
                name: 'MAP'
            },
            attributes: {
                thumbnail: '/thumb/2'
            },
            '@extras': {}
        }, {
            name: 'context'
        })).toEqual({ title: 'Map', icon: { glyph: '1-map' }, thumbnailUrl: '/thumb/2', viewerPath: '/context/context/1', viewerUrl: '#/context/context/1' });

        expect(getGeostoreResourceTypesInfo({
            id: '1',
            name: 'Dashboard',
            category: {
                name: 'DASHBOARD'
            },
            attributes: {
                thumbnail: '/thumb/2'
            }
        })).toEqual({ title: 'Dashboard', icon: { glyph: 'dashboard' }, thumbnailUrl: '/thumb/2', viewerPath: '/dashboard/1', viewerUrl: '#/dashboard/1' });

        expect(getGeostoreResourceTypesInfo({
            id: '1',
            name: 'GeoStory',
            category: {
                name: 'GEOSTORY'
            },
            attributes: {
                thumbnail: '/thumb/2'
            }
        })).toEqual({ title: 'GeoStory', icon: { glyph: 'geostory' }, thumbnailUrl: '/thumb/2', viewerPath: '/geostory/1', viewerUrl: '#/geostory/1' });
        expect(getGeostoreResourceTypesInfo({
            id: '1',
            name: 'custom',
            category: {
                name: 'CONTEXT'
            },
            attributes: {
                thumbnail: '/thumb/2'
            }
        })).toEqual({ title: 'custom', icon: { glyph: 'context' }, thumbnailUrl: '/thumb/2', viewerPath: '/context/custom', viewerUrl: '#/context/custom' });
    });
    it('getGeostoreResourceStatus', () => {
        expect(getGeostoreResourceStatus()).toEqual({ items: [] });
        expect(getGeostoreResourceStatus({
            advertised: false
        })).toEqual({ items: [{ type: 'icon', tooltipId: 'resourcesCatalog.unadvertised', glyph: 'eye-close' }] });
        expect(getGeostoreResourceStatus({}, {
            name: 'Context'
        })).toEqual({ items: [{ type: 'icon', glyph: 'context', tooltipId: 'resourcesCatalog.mapUsesContext', tooltipParams: { contextName: 'Context' } }] });
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

        expect(computePendingChanges({ id: 1, name: 'Title', category: { name: 'MAP' } }, { id: 1, name: 'Title', category: { name: 'MAP' } }, { pending: true, payload: { map: {} } })).toEqual(
            {
                initialResource: { id: 1, name: 'Title', category: { name: 'MAP' } },
                resource: { id: 1, name: 'Title', category: { name: 'MAP' } },
                saveResource: { id: 1, permission: undefined, category: 'MAP', metadata: { id: 1, name: 'Title', attributes: {} }, data: { map: {} } },
                changes: { data: true }
            }
        );
    });
    it('computePendingChanges with details', () => {
        let computedChanges = computePendingChanges(
            { id: 1, name: 'Title', attributes: { details: '/details'  }, category: { name: 'MAP' } },
            { id: 1, name: 'Title', attributes: { [DETAILS_DATA_KEY]: '' }, category: { name: 'MAP' } });
        expect(computedChanges.initialResource).toEqual({ id: 1, name: 'Title', attributes: { details: '/details' }, category: { name: 'MAP' } });
        expect(computedChanges.resource).toEqual({ id: 1, name: 'Title', attributes: { [DETAILS_DATA_KEY]: '' }, category: { name: 'MAP' } });
        expect(computedChanges.saveResource).toEqual({
            id: 1,
            permission: undefined,
            category: 'MAP',
            metadata: { id: 1, name: 'Title', attributes: { details: '/details' } },
            linkedResources: { details: { category: 'DETAILS', value: '/details', data: 'NODATA' } }
        });
        expect(computedChanges.changes).toEqual({ linkedResources: { details: { category: 'DETAILS', value: '/details', data: 'NODATA' } } });

        computedChanges = computePendingChanges(
            { id: 1, name: 'Title', attributes: {  }, category: { name: 'MAP' } },
            { id: 1, name: 'Title', attributes: { [DETAILS_DATA_KEY]: '/details' }, category: { name: 'MAP' } });
        expect(computedChanges.initialResource).toEqual({ id: 1, name: 'Title', attributes: { }, category: { name: 'MAP' } });
        expect(computedChanges.resource).toEqual({ id: 1, name: 'Title', attributes: { [DETAILS_DATA_KEY]: '/details' }, category: { name: 'MAP' } });
        expect(computedChanges.saveResource).toEqual({
            id: 1,
            permission: undefined,
            category: 'MAP',
            metadata: { id: 1, name: 'Title', attributes: {} },
            linkedResources: { details: { category: 'DETAILS', value: 'NODATA', data: '/details' } }
        });
        expect(computedChanges.changes).toEqual({ linkedResources: { details: { category: 'DETAILS', value: 'NODATA', data: '/details' } } });
    });
    it('computePendingChanges with thumbnail', () => {
        let computedChanges = computePendingChanges(
            { id: 1, name: 'Title', attributes: { thumbnail: '/thumb' }, category: { name: 'MAP' } },
            { id: 1, name: 'Title', attributes: { [THUMBNAIL_DATA_KEY]: '' }, category: { name: 'MAP' } });
        expect(computedChanges.initialResource).toEqual({ id: 1, name: 'Title', attributes: { thumbnail: '/thumb' }, category: { name: 'MAP' } });
        expect(computedChanges.resource).toEqual({ id: 1, name: 'Title', attributes: { [THUMBNAIL_DATA_KEY]: '' }, category: { name: 'MAP' } });
        expect(computedChanges.changes.linkedResources.thumbnail.value).toBe('/thumb');
        expect(computedChanges.changes.linkedResources.thumbnail.data).toBe('NODATA');

        computedChanges = computePendingChanges(
            { id: 1, name: 'Title', attributes: {}, category: { name: 'MAP' } },
            { id: 1, name: 'Title', attributes: { [THUMBNAIL_DATA_KEY]: '/thumb' }, category: { name: 'MAP' } });
        expect(computedChanges.initialResource).toEqual({ id: 1, name: 'Title', attributes: { }, category: { name: 'MAP' } });
        expect(computedChanges.resource).toEqual({ id: 1, name: 'Title', attributes: { [THUMBNAIL_DATA_KEY]: '/thumb' }, category: { name: 'MAP' } });
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
    it('should parse the extras of resource', () => {
        let resource = parseResourceProperties({ id: "1", "@extras": {name: "test"}, category: { name: "MAP" } });
        expect(resource?.["@extras"]).toBeTruthy();
        expect(resource?.["@extras"].name).toEqual("test");
        expect(resource?.["@extras"].info.icon.glyph).toEqual("1-map");
        expect(resource?.["@extras"].info.icon.glyph).toEqual("1-map");
        expect(resource?.["@extras"].info.viewerUrl).toEqual("#/viewer/1");
        resource = parseResourceProperties({ id: "1", "@extras": {name: "test"}, category: { name: "MAP" } }, {name: "context-name"});
        expect(resource?.["@extras"].info.viewerUrl).toEqual("#/context/context-name/1");
    });
    it('parseClonedResourcePayload', () => {
        const resource = {
            id: 1,
            permission: [],
            metadata: {
                name: 'Old title',
                description: 'Description',
                attributes: {
                    featured: true,
                    thumbnail: '/path',
                    details: '/path',
                    owner: 'admin'
                }
            }
        };
        expect(parseClonedResourcePayload(resource, { name: 'New title', resourceType: 'MAP' })).toEqual({
            id: 1,
            permission: undefined,
            category: 'MAP',
            metadata: {
                name: 'New title',
                description: 'Description',
                attributes: {
                    featured: true
                }
            }
        });
    });

    it('isContextMapWithoutContextPermission', () => {
        // Should return true when resource has context but no context
        expect(isContextMapWithoutContextPermission({
            attributes: { context: 20 }
        }, null)).toBe(true);

        // Should return false when resource has context and context permission exists
        expect(isContextMapWithoutContextPermission({
            attributes: { context: 20 }
        }, { name: 'context-name' })).toBe(false);

    });
});
