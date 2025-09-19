/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { getResourceInfoByType, getResourceWithDataInfoByType, getPendingChanges } from '../../selectors/save';

const mockState = {
    map: {
        info: {
            id: 1,
            name: 'Test Map',
            description: 'Test Description',
            context: 123
        }
    },
    context: {
        currentContext: {
            id: 123,
            name: 'Test Context'
        }
    },
    layers: {
        flat: [
            { id: 'layer1', type: 'wms', name: 'Layer 1' }
        ]
    },
    layerGroups: {
        groups: [
            { id: 'group1', title: 'Group 1' }
        ]
    },
    backgrounds: {
        backgrounds: [
            { id: 'bg1', type: 'osm' }
        ]
    },
    search: {
        textSearchConfig: {}
    },
    bookmark: {
        bookmarkSearchConfig: {}
    },
    custom: {},
    mapConfigRawData: {
        version: 2,
        map: { center: { x: 0, y: 0 }, zoom: 10 }
    },
    save: {
        pendingChanges: {
            name: 'Updated Map',
            description: 'Updated Description'
        }
    }
};

const mockProps = {
    resourceType: 'MAP'
};

describe('ResourcesCatalog save selectors', () => {
    describe('getResourceInfoByType', () => {
        it('should return resource info without data for MAP type', () => {
            const result = getResourceInfoByType(mockState, mockProps);
            expect(result).toEqual({
                initialResource: {
                    id: 1,
                    name: "Test Map",
                    description: "Test Description",
                    attributes: {
                        context: 123
                    }
                },
                resource: {
                    id: 1,
                    name: "Test Map",
                    description: "Test Description",
                    attributes: {
                        context: 123
                    }
                }
            });
        });

        it('should handle different resource types', () => {
            const dashboardProps = { resourceType: 'DASHBOARD' };
            const result = getResourceInfoByType(mockState, dashboardProps);
            expect(result).toEqual({
                initialResource: {
                    canCopy: true,
                    category: {
                        name: "DASHBOARD"
                    }
                },
                resource: {
                    canCopy: true,
                    category: {
                        name: "DASHBOARD"
                    }
                }
            });
        });
    });

    describe('getResourceWithDataInfoByType', () => {
        it('should return resource info with data for MAP type', () => {
            const result = getResourceWithDataInfoByType(mockState, mockProps);
            expect(result.initialResource).toExist();
            expect(result.resource).toExist();
            expect(result.data).toExist();
            expect(result.data.payload).toExist();
            expect(result.data.initialPayload).toExist();
            expect(result.data.resourceType).toBe('MAP');
        });

        it('should return canCopy true for new map', () => {
            const result = getResourceWithDataInfoByType({
                map: { }
            }, { resourceType: 'MAP' });
            expect(result.resource).toEqual({ canCopy: true, category: { name: 'MAP' } });
        });
        it('should return canCopy false for map with id but empty map info (map with no permissions)', () => {
            const result = getResourceWithDataInfoByType({
                map: { mapId: 1 }
            }, { resourceType: 'MAP' });
            expect(result.resource).toEqual({ canCopy: false, category: { name: 'MAP' } });
        });
    });

    describe('getPendingChanges', () => {
        it('should return pending changes from state', () => {
            const result = getPendingChanges(mockState);

            expect(result).toExist();
            expect(result.name).toBe('Updated Map');
            expect(result.description).toBe('Updated Description');
        });

    });
});
