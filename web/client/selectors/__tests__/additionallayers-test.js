/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/


const expect = require('expect');
const {
    additionalLayersSelector
} = require('../additionallayers');

const state = {
    additionallayers: [
        {
            id: 'layer_001',
            owner: 'styleeditor',
            actionType: 'override',
            settings: {
                name: 'workspace:layer_001',
                properties: {
                    pop: 500000
                }
            },
            options: {
                style: 'generic'
            }
        },
        {
            id: 'layer_002',
            owner: 'owner',
            actionType: 'override',
            settings: {
                name: 'workspace:layer_002',
                properties: {
                    pop: 500000
                }
            },
            options: {}
        }
    ]
};

describe('Test additionallayers selectors', () => {
    it('test additionalLayersSelector', () => {
        const props = additionalLayersSelector(state);
        expect(props).toEqual([...state.additionallayers]);

    });
});
