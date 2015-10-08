/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var {
    TOGGLE_NODE,
    SORT_NODE,
    REMOVE_NODE,
    UPDATE_NODE,
    toggleNode,
    sortNode,
    removeNode,
    updateNode
} = require('../layers');

describe('Test correctness of the layers actions', () => {
    it('sortNode', () => {
        const order = [0, 2, 1];

        var retval = sortNode('group', order);

        expect(retval).toExist();
        expect(retval.type).toBe(SORT_NODE);
        expect(retval.node).toBe('group');
        expect(retval.order).toBe(order);
    });

    it('toggleNode', () => {
        var retval = toggleNode('sample', 'groups', true);

        expect(retval).toExist();
        expect(retval.type).toBe(TOGGLE_NODE);
        expect(retval.node).toBe('sample');
        expect(retval.nodeType).toBe('groups');
        expect(retval.status).toBe(false);
    });

    it('removeNode', () => {
        var retval = removeNode('sampleNode', 'sampleType');

        expect(retval).toExist();
        expect(retval.type).toBe(REMOVE_NODE);
        expect(retval.node).toBe('sampleNode');
        expect(retval.nodeType).toBe('sampleType');
    });

    it('updateNode', () => {
        var retval = updateNode('sampleNode', 'sampleType', 'sampleOptions');

        expect(retval).toExist();
        expect(retval.type).toBe(UPDATE_NODE);
        expect(retval.node).toBe('sampleNode');
        expect(retval.nodeType).toBe('sampleType');
        expect(retval.options).toBe('sampleOptions');
    });
});
