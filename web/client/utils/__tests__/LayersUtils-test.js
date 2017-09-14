/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const LayersUtils = require('../LayersUtils');

describe('LayersUtils', () => {
    it('splits layers and groups one group', () => {
        const state = LayersUtils.splitMapAndLayers({
            layers: [{
                name: "layer1",
                group: "group1"
            }, {
                name: "layer2",
                group: "group1"
            }]
        });
        expect(state.layers).toExist();
        expect(state.layers.flat).toExist();
        expect(state.layers.flat.length).toBe(2);
        expect(state.layers.groups.length).toBe(1);
    });

    it('splits layers and groups more groups', () => {
        const state = LayersUtils.splitMapAndLayers({
            layers: [{
                name: "layer1",
                group: "group1"
            }, {
                name: "layer2",
                group: "group2"
            }]
        });
        expect(state.layers).toExist();
        expect(state.layers.flat).toExist();
        expect(state.layers.flat.length).toBe(2);
        expect(state.layers.groups.length).toBe(2);
    });

    it('splits layers and groups groups additional data (expanded and title)', () => {
        const groups = [{id: 'custom.nested001', expanded: true}, {id: 'custom.nested001.nested002', expanded: false}, {id: 'Default', expanded: false}, {id: 'custom', expanded: true, title: {'default': 'Default', 'en-US': 'new'}}];
        const layers = [{id: 'layer001', group: 'Default'}, {id: 'layer002', group: 'Default'}, {id: 'layer003', group: 'custom.nested001'}, {id: 'layer004', group: 'custom.nested001.nested002'}];

        const state = LayersUtils.splitMapAndLayers({groups, layers});

        expect(state.layers.groups).toEqual([
            {expanded: true, id: 'custom', name: 'custom', title: {'default': 'Default', 'en-US': 'new'},
                nodes: [
                    {expanded: true, id: 'custom.nested001', name: 'nested001', title: 'nested001',
                        nodes: [
                            {expanded: false, id: 'custom.nested001.nested002', name: 'nested002', title: 'nested002',
                                nodes: ['layer004']},
                            'layer003'
                        ]}
                ]
            },
            {expanded: false, id: 'Default', name: 'Default', nodes: ['layer002', 'layer001'], title: 'Default'}
        ]);
    });


    it('deep change in nested group', () => {

        const nestedGroups = [
            {id: 'default', nodes: ['layer001', 'layer002']},
            {id: 'custom', nodes: [{id: 'custom.nested001', nodes: ['layer003', {id: 'custom.nested001.nested002', nodes: ['layer004'], value: 'now'}]}]}
        ];
        const newGroups = LayersUtils.deepChange(nestedGroups, 'custom.nested001.nested002', 'value', 'changed');

        expect(newGroups).toExist();
        expect(newGroups).toEqual([
            {id: 'default', nodes: ['layer001', 'layer002']},
            {id: 'custom', nodes: [{id: 'custom.nested001', nodes: ['layer003', {id: 'custom.nested001.nested002', nodes: ['layer004'], value: 'changed'}]}]}
        ]);

        const newGroupsWrongId = LayersUtils.deepChange(nestedGroups, 'nested005', 'value', 'changed');
        expect(newGroupsWrongId).toExist();
        expect(newGroupsWrongId).toEqual([
            {id: 'default', nodes: ['layer001', 'layer002']},
            {id: 'custom', nodes: [{id: 'custom.nested001', nodes: ['layer003', {id: 'custom.nested001.nested002', nodes: ['layer004'], value: 'now'}]}]}
        ]);
    });

    it('get groups node id in nested group', () => {

        const nestedGroups = [
            {id: 'default', nodes: ['layer001', 'layer002']},
            {id: 'custom', nodes: [{id: 'custom.nested001', nodes: ['layer003', {id: 'custom.nested001.nested002', nodes: ['layer004'], value: 'now'}]}]}
        ];
        const newGroups = LayersUtils.getGroupNodes({nodes: nestedGroups});

        expect(newGroups).toExist();
        expect(newGroups).toEqual(['layer001', 'layer002', 'default', 'layer003', 'layer004', 'custom.nested001.nested002', 'custom.nested001', 'custom']);

    });

    it('get node', () => {

        const nestedGroups = [
            {id: 'default', nodes: ['layer001', 'layer002']},
            {id: 'custom', nodes: [{id: 'custom.nested001', nodes: ['layer003', {id: 'custom.nested001.nested002', nodes: ['layer004'], value: 'now'}]}]}
        ];
        const newGroups = LayersUtils.getNode(nestedGroups, 'custom.nested001.nested002');

        expect(newGroups).toExist();
        expect(newGroups).toEqual({id: 'custom.nested001.nested002', nodes: ['layer004'], value: 'now'});

        const newGroupsNull = LayersUtils.getNode(nestedGroups, 'nested010');
        expect(newGroupsNull).toNotExist();
    });
});
