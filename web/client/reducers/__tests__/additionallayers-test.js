
/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {
    updateAdditionalLayer,
    updateOptionsByOwner,
    removeAdditionalLayer,
    removeAllAdditionalLayers,
    mergeOptionsByOwner,
    mergeOptionsById
} from '../../actions/additionallayers';

import additionallayers from '../additionallayers';

describe('Test additional layers reducer', () => {

    it('add an additional layer', () => {
        const id = 'layer_001';
        const owner = 'owner';
        const actionType = 'override';
        const options = {
            style: 'generic'
        };
        const state = additionallayers([], updateAdditionalLayer(id, owner, actionType, options));
        expect(state).toEqual([
            {
                id,
                owner,
                actionType,
                options
            }
        ]);
    });
    it('merge an additional layer', () => {
        const id = 'layer_001';
        const owner = 'owner';
        const actionType = 'override';
        const options = {
            style: 'generic'
        };
        const newOptions = {
            features: []
        };
        const state = additionallayers([
            {
                id,
                owner,
                actionType,
                options
            }
        ], mergeOptionsByOwner(owner, newOptions));
        expect(state).toEqual([
            {
                id,
                owner,
                actionType,
                options: {
                    ...options,
                    ...newOptions
                }
            }
        ]);
    });

    it('update options of additional layers by owner', () => {
        const owner = 'owner';
        const initialState = [
            {
                id: 'layer_001',
                owner,
                actionType: 'override',
                options: {
                    style: 'generic'
                }
            },
            {
                id: 'layer_002',
                owner,
                actionType: 'override',
                options: {}
            }
        ];

        const options = [
            {},
            {
                style: 'point'
            }
        ];

        const state = additionallayers(initialState, updateOptionsByOwner(owner, options));
        expect(state).toEqual([
            {
                id: 'layer_001',
                owner,
                actionType: 'override',
                options: {...options[0]}
            },
            {
                id: 'layer_002',
                owner,
                actionType: 'override',
                options: {...options[1]}
            }
        ]);
    });

    it('remove additional layers by owner', () => {
        const owner = 'owner';
        const initialState = [
            {
                id: 'layer_001',
                owner,
                actionType: 'override',
                options: {
                    style: 'generic'
                }
            },
            {
                id: 'layer_002',
                owner,
                actionType: 'override',
                options: {}
            }
        ];

        const state = additionallayers(initialState, removeAdditionalLayer({owner}));
        expect(state).toEqual([]);
    });

    it('remove additional layers by id', () => {

        const owner = 'owner';

        const initialState = [
            {
                id: 'layer_001',
                owner,
                actionType: 'override',
                options: {
                    style: 'generic'
                }
            },
            {
                id: 'layer_002',
                owner,
                actionType: 'override',
                options: {}
            }
        ];

        const state = additionallayers(initialState, removeAdditionalLayer({id: 'layer_001'}));
        expect(state).toEqual([{...initialState[1]}]);
    });
    it('remove all additional layers', () => {
        const owner = 'owner';
        const initialState = [
            {
                id: 'layer_001',
                owner,
                actionType: 'override',
                options: {
                    style: 'generic'
                }
            }, {
                id: 'layer_002',
                owner,
                actionType: 'override',
                options: {}
            }
        ];
        const state = additionallayers(initialState, removeAllAdditionalLayers());
        expect(state).toEqual([]);
    });
    it('merge options by id', () => {
        const id = 'layer_001';
        const initialState = [
            {
                id: 'layer_001',
                owner: 'owner',
                actionType: 'override',
                options: {
                    style: 'generic'
                }
            }, {
                id: 'layer_002',
                owner: 'owner',
                actionType: 'override',
                options: {}
            }
        ];
        const state = additionallayers(initialState, mergeOptionsById(id, {opacity: 0.5}));
        expect(state).toEqual([{
            ...initialState[0],
            options: {...initialState[0].options, opacity: 0.5}},
        initialState[1]
        ]);
    });
});
