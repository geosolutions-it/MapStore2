/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');
var layers = require('../layers');

describe('Test the layers reducer', () => {

    it('returns original state on unrecognized action', () => {
        let state = layers(1, {type: 'UNKNOWN'});
        expect(state).toBe(1);
    });

    it('toggleNode', () => {
        let testAction = {
            type: 'TOGGLE_NODE',
            node: 'sample',
            nodeType: 'groups',
            status: true
        };
        let state = layers( {groups: {}}, testAction);
        expect(state.groups.sample).toExist();
        expect(state.groups.sample.expanded).toBe(true);
    });

    it('sortNode', () => {
        const order = [0, 1, 2];
        let testAction = {
            type: 'SORT_NODE',
            node: 'sample',
            order: order
        };
        let state = layers( {groups: {}}, testAction);
        expect(state.groups.sample).toExist();
        expect(state.groups.sample.order).toBe(order);
    });

});
