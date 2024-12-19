/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    getPendingChanges
} from '../save';
import expect from 'expect';

describe('save selectors', () => {
    it('getPendingChanges', () => {
        expect(getPendingChanges()).toEqual(null);
        expect(getPendingChanges({ resources: { initialSelectedResource: { id: '01', category: { name: 'MAP' } }, selectedResource: { id: '01', category: { name: 'MAP' }, title: 'Title' } } })).toEqual({
            initialResource: { id: '01', category: { name: 'MAP' } },
            resource: { id: '01', category: { name: 'MAP' }, title: 'Title' },
            saveResource: { id: '01', permission: undefined, category: 'MAP', metadata: { id: '01', title: 'Title', attributes: {} } },
            changes: { title: 'Title' }
        });
        const mapResourcePendingChanges = getPendingChanges({}, { resourceType: 'MAP' });
        expect(mapResourcePendingChanges.initialResource).toEqual({ canCopy: true, category: { name: 'MAP' } });
        expect(mapResourcePendingChanges.resource).toEqual({ canCopy: true, category: { name: 'MAP' } });
        expect(mapResourcePendingChanges.saveResource.data).toBeTruthy();
        expect(mapResourcePendingChanges.changes).toEqual({});

        const dashboardResourcePendingChanges = getPendingChanges({}, { resourceType: 'DASHBOARD' });
        expect(dashboardResourcePendingChanges.initialResource).toEqual({ canCopy: true, category: { name: 'DASHBOARD' } });
        expect(dashboardResourcePendingChanges.resource).toEqual({ canCopy: true, category: { name: 'DASHBOARD' } });
        expect(dashboardResourcePendingChanges.saveResource.data).toBeTruthy();
        expect(dashboardResourcePendingChanges.changes).toEqual({});

        const geoStoryResourcePendingChanges = getPendingChanges({}, { resourceType: 'GEOSTORY' });
        expect(geoStoryResourcePendingChanges.initialResource).toEqual({ canCopy: true, category: { name: 'GEOSTORY' } });
        expect(geoStoryResourcePendingChanges.resource).toEqual({ canCopy: true, category: { name: 'GEOSTORY' } });
        expect(geoStoryResourcePendingChanges.saveResource.data).toBeFalsy();
        expect(geoStoryResourcePendingChanges.changes).toEqual({});
    });
});
