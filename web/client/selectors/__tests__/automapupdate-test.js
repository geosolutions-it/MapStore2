/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {getWMSLayers, refreshingLayers} = require('../automapupdate');
const reducer = require('../../reducers/layers');

const state = {
    layers: {
        flat: [
            {type: 'wms', group: 'background'},
            {type: 'wms', group: 'default'}
        ],
        refreshing: [
            {type: 'wms', group: 'default'}
        ]
    }
};

describe('Test automapupdate selectors', () => {
    it('test getWMSLayers', () => {
        const layers = getWMSLayers(state);
        expect(layers).toExist();

        expect(layers.length).toBe(1);
    });

    it('test refreshingLayers', () => {
        const layers = refreshingLayers(state);
        expect(layers).toExist();

        expect(layers.length).toBe(1);
    });

    it('getWMSLayers works with initial state', () => {
        const emptyState = {
            layers: reducer(undefined, { type: "TEST" })
        };
        expect(getWMSLayers(emptyState).length).toBe(0);
    });
});
