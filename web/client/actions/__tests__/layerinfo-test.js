/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {
    syncLayers, SYNC_LAYERS,
    selectLayers, SELECT_LAYERS,
    setLayers, SET_LAYERS,
    updateLayer, UPDATE_LAYER,
    resetSyncStatus, RESET_SYNC_STATUS,
    updateSyncStatus, UPDATE_SYNC_STATUS,
    setError, SET_ERROR
} from '../layerinfo';

describe('layerinfo actions', () => {
    it('syncLayers', () => {
        const result = syncLayers([{id: 'layer1'}, {id: 'layer2'}]);

        expect(result).toExist();
        expect(result.type).toBe(SYNC_LAYERS);
        expect(result.layers).toExist();
        expect(result.layers.length).toBe(2);
        expect(result.layers[0]).toEqual({id: 'layer1'});
        expect(result.layers[1]).toEqual({id: 'layer2'});
    });
    it('selectLayers', () => {
        const result = selectLayers(['layer1', 'layer2']);

        expect(result).toExist();
        expect(result.type).toBe(SELECT_LAYERS);
        expect(result.layers).toExist();
        expect(result.layers.length).toBe(2);
        expect(result.layers[0]).toBe('layer1');
        expect(result.layers[1]).toBe('layer2');
    });
    it('setLayers', () => {
        const result = setLayers([{id: 'layer1'}, {id: 'layer2'}]);

        expect(result).toExist();
        expect(result.type).toBe(SET_LAYERS);
        expect(result.layers).toExist();
        expect(result.layers.length).toBe(2);
        expect(result.layers[0]).toEqual({id: 'layer1'});
        expect(result.layers[1]).toEqual({id: 'layer2'});
    });
    it('updateLayer', () => {
        const result = updateLayer({id: 'layer1'});

        expect(result).toExist();
        expect(result.type).toBe(UPDATE_LAYER);
        expect(result.layer).toEqual({id: 'layer1'});
    });
    it('resetSyncStatus', () => {
        const result = resetSyncStatus(4);

        expect(result).toExist();
        expect(result.type).toBe(RESET_SYNC_STATUS);
        expect(result.totalCount).toBe(4);
    });
    it('updateSyncStatus', () => {
        const result = updateSyncStatus();

        expect(result).toExist();
        expect(result.type).toBe(UPDATE_SYNC_STATUS);
    });
    it('setError', () => {
        const result = setError('error');

        expect(result).toExist();
        expect(result.type).toBe(SET_ERROR);
        expect(result.error).toBe('error');
    });
});
