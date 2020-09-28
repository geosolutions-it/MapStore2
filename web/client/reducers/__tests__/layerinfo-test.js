/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import { createStateMocker } from './reducersTestUtils';

import layerinfo from '../layerinfo';
import {
    layersSelector,
    syncStatusSelector,
    errorSelector
} from '../../selectors/layerinfo';
import {
    setLayers,
    selectLayers,
    updateLayer,
    resetSyncStatus,
    updateSyncStatus,
    setError
} from '../../actions/layerinfo';

const testLayers = [{
    id: 'layer1',
    name: 'layer1 name',
    title: 'layer1 title',
    description: 'layer1 description',
    type: 'wms',
    layerObj: {
        name: 'layer1 name',
        title: 'layer1 title',
        description: 'layer1 description',
        id: 'layer1',
        type: 'wms',
        catalogURL: '/layer1catalog'
    },
    selected: false,
    syncStatus: 'none'
}, {
    id: 'layer2',
    name: 'layer2 name',
    title: 'layer2 title',
    description: 'layer2 description',
    type: 'wmts',
    layerObj: {
        id: 'layer2',
        name: 'layer2 name',
        title: 'layer2 title',
        description: 'layer2 description',
        type: 'wmts',
        url: '/layer2url'
    },
    selected: false,
    syncStatus: 'none'
}, {
    id: 'layer3',
    name: 'layer3 name',
    title: 'layer3 title',
    description: 'layer3 description',
    type: 'wms',
    layerObj: {
        id: 'layer3',
        name: 'layer3 name',
        title: 'layer3 title',
        description: 'layer3 description',
        type: 'wms'
    },
    selected: false,
    syncStatus: 'success'
}];

describe('contextcreator reducer', () => {
    const stateMocker = createStateMocker({layerinfo});
    it('setLayers', () => {
        const state = stateMocker(setLayers(testLayers));
        expect(layersSelector(state)).toEqual(testLayers);
    });
    it('selectLayers', () => {
        const state = stateMocker(setLayers(testLayers), selectLayers(['layer2', 'layer3']));
        const newLayers = layersSelector(state);

        expect(newLayers[0].id).toBe('layer1');
        expect(newLayers[0].selected).toBe(false);
        expect(newLayers[1].id).toBe('layer2');
        expect(newLayers[1].selected).toBe(true);
        expect(newLayers[2].id).toBe('layer3');
        expect(newLayers[2].selected).toBe(true);
    });
    it('updateLayer', () => {
        const state = stateMocker(setLayers(testLayers), updateLayer({id: 'layer3', description: 'layer3 description modified'}));
        const newLayers = layersSelector(state);

        expect(newLayers[0]).toEqual(testLayers[0]);
        expect(newLayers[1]).toEqual(testLayers[1]);
        expect(newLayers[2]).toEqual({...testLayers[2], description: 'layer3 description modified'});
    });
    it('resetSyncStatus', () => {
        const state = stateMocker(resetSyncStatus(4));
        const syncStatus = syncStatusSelector(state);

        expect(syncStatus).toExist();
        expect(syncStatus.updatedCount).toBe('0');
        expect(syncStatus.totalCount).toBe('4');
    });
    it('updateSyncStatus', () => {
        const state = stateMocker(resetSyncStatus(4), updateSyncStatus());
        const syncStatus = syncStatusSelector(state);

        expect(syncStatus).toExist();
        expect(syncStatus.updatedCount).toBe('1');
        expect(syncStatus.totalCount).toBe('4');
    });
    it('setError', () => {
        const state = stateMocker(setError('error'));

        expect(errorSelector(state)).toBe('error');
    });
});
