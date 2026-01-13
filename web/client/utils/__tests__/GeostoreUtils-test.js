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
    hasInaccessibleContext,
    computeResourceDiff,
    composeMapConfiguration,
    compareMapDataChanges,
    compareDashboardDataChanges,
    computeSaveResource
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

        // Test resource with dependency missing, resource has context, but context is not accessible
        expect(getGeostoreResourceStatus({
            attributes: { context: 20 }
        }, null)).toEqual({
            items: [],
            cardClassNames: ['ms-resource-issue-dependency-missing'],
            cardTooltipId: 'resourcesCatalog.resourceIssues.dependencyMissing'
        });

        // Test context map with context permission (should not have card-level properties)
        const status = getGeostoreResourceStatus({
            attributes: { context: 20 }
        }, { name: 'context-name' });
        expect(status.cardClassNames).toBe(undefined);
        expect(status.cardTooltipId).toBe(undefined);

    });

    it('computePendingChanges with details', () => {
        let computedChanges = computePendingChanges(
            { id: 1, name: 'Title', attributes: { details: '/details'  }, category: { name: 'MAP' } },
            { id: 1, name: 'Title', attributes: { [DETAILS_DATA_KEY]: '' }, category: { name: 'MAP' } });
        expect(computedChanges).toEqual({ linkedResources: { details: { category: 'DETAILS', value: '/details', data: 'NODATA' } } });

        computedChanges = computePendingChanges(
            { id: 1, name: 'Title', attributes: {  }, category: { name: 'MAP' } },
            { id: 1, name: 'Title1', attributes: { [DETAILS_DATA_KEY]: '/details' }, category: { name: 'MAP' } });

        expect(computedChanges).toEqual({name: "Title1", linkedResources: { details: { category: 'DETAILS', value: 'NODATA', data: '/details' } } });
    });
    it('computePendingChanges with thumbnail', () => {
        let computedChanges = computePendingChanges(
            { id: 1, name: 'Title', attributes: { thumbnail: '/thumb' }, category: { name: 'MAP' } },
            { id: 1, name: 'Title', attributes: { [THUMBNAIL_DATA_KEY]: '' }, category: { name: 'MAP' } });
        expect(computedChanges.linkedResources.thumbnail.value).toBe('/thumb');
        expect(computedChanges.linkedResources.thumbnail.data).toBe('NODATA');

        computedChanges = computePendingChanges(
            { id: 1, name: 'Title', attributes: {}, category: { name: 'MAP' } },
            { id: 1, name: 'Title', attributes: { [THUMBNAIL_DATA_KEY]: '/thumb' }, category: { name: 'MAP' } });
        expect(computedChanges.linkedResources.thumbnail.value).toBe('NODATA');
        expect(computedChanges.linkedResources.thumbnail.data).toBe('/thumb');
        const tailsParts = computedChanges.linkedResources.thumbnail.tail.split('&');
        expect(tailsParts[0]).toBe('/raw?decode=datauri');
        expect(tailsParts[1].includes('v=')).toBe(true);
    });

    it('computePendingChanges with tags', () => {
        const initialResource = { id: 1, name: 'Title', category: { name: 'MAP' }, tags: [{ id: '01' }, { id: '02' }] };
        const resource = { id: 1, name: 'Title', category: { name: 'MAP' }, tags: [{ id: '02' }, { id: '03' }] };
        const changes = computePendingChanges(initialResource, resource);
        const saveResource = computeSaveResource(initialResource, resource);

        expect(saveResource.tags).toEqual(changes.tags);
        expect(saveResource.tags).toEqual([
            { tag: { id: '01' }, action: 'unlink' },
            { tag: { id: '03' }, action: 'link' }
        ]);
    });

    it('Save resource with tags', () => {
        const computed = computeSaveResource(
            { id: 1, name: 'Title', category: { name: 'MAP' }, tags: [{ id: '01' }, { id: '02' }] },
            { id: 1, name: 'Title', category: { name: 'MAP' }, tags: [{ id: '02' }, { id: '03' }] }
        );
        expect(computed.tags).toEqual(computed.tags);
        expect(computed.tags).toEqual([
            { tag: { id: '01' }, action: 'unlink' },
            { tag: { id: '03' }, action: 'link' }
        ]);
    });

    it('computePendingChanges with empty attributes in initial resource', () => {
        const computed = computePendingChanges(
            { },
            { attributes: { featured: true } }
        );
        expect(computed).toEqual({ attributes: { featured: true } });
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
    describe('computeResourceDiff', () => {
        it('should compute resource differences correctly', () => {
            const initialResource = {
                id: 1,
                name: 'Initial Map',
                description: 'Initial description',
                attributes: {
                    thumbnail: '/thumb1.jpg',
                    author: 'John Doe'
                },
                tags: [{ id: 1, name: 'test' }]
            };

            const resource = {
                id: 1,
                name: 'Updated Map',
                description: 'Updated description',
                attributes: {
                    thumbnail: '/thumb2.jpg',
                    author: 'Jane Doe',
                    newAttr: 'new value'
                },
                tags: [{ id: 1, name: 'test' }, { id: 2, name: 'updated' }]
            };

            const result = computeResourceDiff(initialResource, resource);

            expect(result.pendingChanges).toExist();
            expect(result.pendingChanges.name).toBe('Updated Map');
            expect(result.pendingChanges.description).toBe('Updated description');
            expect(result.mergedAttributes).toExist();
            expect(result.mergedTags).toExist();
            expect(result.mergedTags.length).toBe(1); // Only new tag
        });
    });

    describe('composeMapConfiguration', () => {
        it('should compose map configuration from raw data', () => {
            const mapData = {
                map: {
                    center: { x: 0, y: 0, crs: 'EPSG:4326' },
                    zoom: 10,
                    projection: 'EPSG:4326'
                },
                layers: [{ id: 'layer1', type: 'wms', name: 'Layer 1' }],
                groups: [{ id: 'group1', title: 'Group 1', nodes: ['layer1'] }],
                backgrounds: [{ id: 'bg1', type: 'osm', title: 'OpenStreetMap' }],
                textSearchConfig: { searchText: 'test' },
                bookmarkSearchConfig: { searchText: 'bookmark' },
                additionalOptions: { custom: 'option' }
            };

            const result = composeMapConfiguration(mapData);
            expect(typeof result).toBe('object');
            expect(result.map).toExist();
            expect(result.map.layers).toExist();
            expect(result.custom).toEqual('option');
            expect(result.map.bookmark_search_config).toEqual({ searchText: 'bookmark' });

        });

    });

    describe('compareMapDataChanges', () => {
        it('should detect map data changes', () => {
            const currentMapData = {
                version: 2,
                map: { center: { x: 0, y: 0, crs: 'EPSG:4326' }, zoom: 10 }
            };
            const initialMapConfig = {
                version: 2,
                map: { center: { x: 0, y: 0, crs: 'EPSG:4326' }, zoom: 12 }
            };

            const result = compareMapDataChanges(currentMapData, initialMapConfig);

            // as zoom value is different
            expect(result).toBe(true);

            // change zoom value
            currentMapData.map.zoom = 12;
            const result2 = compareMapDataChanges(currentMapData, initialMapConfig);
            // no change
            expect(result2).toBe(false);
        });

    });

    describe('compareDashboardDataChanges', () => {
        it('should detect dashboard data changes', () => {
            const currentDashboardData = {
                widgets: [{ id: 'widget1', title: 'Widget 1' }],
                layouts: [{ md: { widget1: { x: 0, y: 1 } } }]
            };
            const initialDashboardData = {
                widgets: [{ id: 'widget2', title: 'Widget 2' }],
                layouts: [{ md: { widget1: { x: 0, y: 1 } } }]
            };

            const result = compareDashboardDataChanges(currentDashboardData, initialDashboardData);

            expect(typeof result).toBe('boolean');
            // as Widget changed, so should be true
            expect(result).toBe(true);
        });

        it('should return false for no changes', () => {
            const currentDashboardData = {
                widgets: [{ id: 'widget1', title: 'Widget 1' }],
                layouts: [{ md: { widget1: { x: 0, y: 0 } } }]
            };
            const initialDashboardData = {
                widgets: [{ id: 'widget1', title: 'Widget 1' }],
                layouts: [{ md: { widget1: { x: 0, y: 0 } } }]
            };

            const result = compareDashboardDataChanges(currentDashboardData, initialDashboardData);

            expect(result).toBe(false);
        });
    });


    it('computePendingChanges and saveResource', () => {
        // No changes scenario
        const initialResource1 = { id: 1, name: 'Title', category: { name: 'MAP' } };
        const resource1 = { id: 1, name: 'Title', category: { name: 'MAP' } };
        expect({
            saveResource: computeSaveResource(initialResource1, resource1),
            changes: computePendingChanges(initialResource1, resource1)
        }).toEqual({
            saveResource: { id: 1, permission: undefined, category: 'MAP', metadata: { id: 1, name: 'Title', attributes: {} } },
            changes: {}
        });

        // Name change scenario
        const initialResource2 = { id: 1, name: 'Title', category: { name: 'MAP' } };
        const resource2 = { id: 1, name: 'New Title', category: { name: 'MAP' } };
        expect({
            saveResource: computeSaveResource(initialResource2, resource2),
            changes: computePendingChanges(initialResource2, resource2)
        }).toEqual({
            saveResource: { id: 1, permission: undefined, category: 'MAP', metadata: { id: 1, name: 'New Title', attributes: {} } },
            changes: {
                name: 'New Title'
            }
        });

        // Data change scenario(pending already true)
        const initialResource3 = { id: 1, name: 'Title', category: { name: 'MAP' } };
        const resource3 = { id: 1, name: 'Title', category: { name: 'MAP' } };
        const resourceData3 = {
            payload: { map: {} },
            pending: true,
            resourceType: "GEOSTORY"
        };
        expect({
            saveResource: computeSaveResource(initialResource3, resource3, resourceData3),
            changes: computePendingChanges(initialResource3, resource3, resourceData3)
        }).toEqual({
            saveResource: { id: 1, permission: undefined, category: 'MAP', metadata: { id: 1, name: 'Title', attributes: {} }, data: { map: {} } },
            changes: { data: true }
        });
    });

    describe('computeSaveResource', () => {
        it('should compute save resource correctly for resourceType MAP', () => {
            const initialResource = {
                id: 1,
                name: 'Initial Map',
                category: { name: 'MAP' },
                permissions: { canEdit: true }
            };
            const resource = {
                id: 1,
                name: 'Updated Map',
                description: 'Updated Description'
            };
            const resourceData = {
                initialPayload: {
                    version: 2,
                    map: {
                        center: {
                            x: 20,
                            y: 20,
                            crs: 'EPSG:4326'
                        },
                        zoom: 12,
                        layers: []
                    }

                },
                payload: {
                    map: { center: { x: 0, y: 0, crs: 'EPSG:4326' }, zoom: 10 },
                    layers: [],
                    groups: [],
                    backgrounds: [],
                    textSearchConfig: {},
                    bookmarkSearchConfig: {},
                    additionalOptions: {}
                },
                resourceType: 'MAP'
            };

            const result = computeSaveResource(initialResource, resource, resourceData);
            expect(result).toEqual({
                id: 1,
                data: {
                    version: 2,
                    map: {
                        center: {
                            x: 0,
                            y: 0,
                            crs: 'EPSG:4326'
                        },
                        maxExtent: undefined,
                        projection: undefined,
                        units: undefined,
                        mapInfoControl: undefined,
                        zoom: 10,
                        mapOptions: {},
                        layers: [],
                        groups: [],
                        backgrounds: [],
                        text_search_config: {},
                        bookmark_search_config: {}
                    }
                },
                permission: {
                    canEdit: true
                },
                category: 'MAP',
                metadata: {
                    id: 1,
                    name: 'Updated Map',
                    description: 'Updated Description',
                    attributes: {}
                }
            });


            // no permission
            delete initialResource.permissions;
            const result2 = computeSaveResource(initialResource, resource, resourceData);
            expect(result2.permission).toEqual(undefined);
        });

        it('should compute save resource coorrectly for resourceType DASHBOARD', () => {
            const initialResource = { id: 1, name: 'Initial GeoStory', category: { name: 'DASHBOARD' } };
            const resource = { id: 1, name: 'Updated GeoStory', category: { name: 'DASHBOARD' } };
            const resourceData = {
                initialPayload: {
                    widgets: [
                    ],
                    layouts: {
                    }
                },
                payload: {
                    widgets: [
                        {
                            id: "1",
                            mapSync: true,
                            widgetType: "chart"
                        }
                    ]
                },
                resourceType: 'DASHBOARD'
            };
            const result = computeSaveResource(initialResource, resource, resourceData);
            expect(result).toEqual({ id: 1, permission: undefined, category: 'DASHBOARD', metadata: { id: 1, name: 'Updated GeoStory', attributes: {} }, data: {
                widgets: [
                    {
                        id: "1",
                        mapSync: true,
                        widgetType: "chart"
                    }
                ]
            } });
        });
        // For "GEOSTORY" covered in above test "computePendingChanges and saveResource"
    });

    it('hasInaccessibleContext', () => {
        // Should return true when resource has context but no access
        expect(hasInaccessibleContext({
            attributes: { context: 20 }
        }, null)).toBe(true);

        // Should return false when resource has context and access exists
        expect(hasInaccessibleContext({
            attributes: { context: 20 }
        }, { name: 'context-name' })).toBe(false);

        // Should return false when resource has no context
        expect(hasInaccessibleContext({
            attributes: {}
        }, null)).toBe(false);
    });


});
