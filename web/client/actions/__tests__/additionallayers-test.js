/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');

const {
    UPDATE_ADDITIONAL_LAYER, updateAdditionalLayer,
    REMOVE_ADDITIONAL_LAYER, removeAdditionalLayer,
    REMOVE_ALL_ADDITIONAL_LAYERS, removeAllAdditionalLayers,
    UPDATE_OPTIONS_BY_OWNER, updateOptionsByOwner
} = require('../additionallayers');

describe('Test additional layers actions', () => {

    it('Test updateAdditionalLayer action creator', () => {
        const id = 'layer_001';
        const owner = 'owner';
        const actionType = 'override';
        const options = {
            style: 'generic'
        };
        const retval = updateAdditionalLayer(id, owner, actionType, options);
        expect(retval).toExist();
        expect(retval.id).toBe(id);
        expect(retval.owner).toBe(owner);
        expect(retval.actionType).toBe(actionType);
        expect(retval.options).toBe(options);
        expect(retval.type).toBe(UPDATE_ADDITIONAL_LAYER);
    });

    it('Test updateOptionsByOwner action creator', () => {
        const owner = 'owner';
        const options = [{ style: 'point' }];
        const retval = updateOptionsByOwner(owner, options);
        expect(retval).toExist();
        expect(retval.owner).toBe(owner);
        expect(retval.options).toBe(options);
        expect(retval.type).toBe(UPDATE_OPTIONS_BY_OWNER);
    });

    it('Test removeAdditionalLayer action creator', () => {
        const id = 'layer_001';
        const owner = 'owner';
        const retval = removeAdditionalLayer({id, owner});
        expect(retval).toExist();
        expect(retval.id).toBe(id);
        expect(retval.owner).toBe(owner);
        expect(retval.type).toBe(REMOVE_ADDITIONAL_LAYER);
    });
    it('Test removeAllAdditionalLayers action creator', () => {
        const retval = removeAllAdditionalLayers();
        expect(retval).toExist();
        expect(retval.type).toBe(REMOVE_ALL_ADDITIONAL_LAYERS);
    });
});
