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
    toggleNode,
    sortNode
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
});
