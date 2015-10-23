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

    it('toggleNode layer', () => {
        let testAction = {
            type: 'TOGGLE_NODE',
            node: 'sample',
            nodeType: 'layers',
            status: true
        };
        let state = layers( {flat: [{name: 'sample'}]}, testAction);
        expect(state.flat[0].expanded).toBe(true);
    });

    it('toggleNode group', () => {
        let testAction = {
            type: 'TOGGLE_NODE',
            node: 'sample',
            nodeType: 'groups',
            status: true
        };
        let state = layers( {groups: [{name: 'sample'}]}, testAction);
        expect(state.groups[0].expanded).toBe(true);
    });

    it('toggleNode group nested', () => {
        let testAction = {
            type: 'TOGGLE_NODE',
            node: 'sample',
            nodeType: 'groups',
            status: true
        };
        let state = layers( {groups: [{name: 'group', nodes: [{name: "sample"}]}]}, testAction);
        expect(state.groups[0].nodes[0].expanded).toBe(true);
    });

    it('sortNode layers', () => {
        const order = [1, 0];
        let testAction = {
            type: 'SORT_NODE',
            node: 'group',
            order: order
        };
        let state = layers( {groups: [{name: 'group', nodes: [{name: "sample1"}, {name: "sample2"}]}]}, testAction);
        expect(state.groups[0].nodes[0].name).toEqual('sample2');
        expect(state.groups[0].nodes[1].name).toEqual('sample1');
    });

    it('sortNode groups', () => {
        const order = [1, 0];
        let testAction = {
            type: 'SORT_NODE',
            node: 'root',
            order: order
        };
        let state = layers( {groups: [{name: 'group1'}, {name: "group2"}]}, testAction);
        expect(state.groups[0].name).toEqual('group2');
        expect(state.groups[1].name).toEqual('group1');
    });

    it('removeNode', () => {
        let testAction = {
            type: 'REMOVE_NODE',
            node: 'sampleNode',
            nodeType: 'sampleType'
        };
        let state = layers({}, testAction);
        expect(state.sampleType).toExist();
        expect(state.sampleType.sampleNode).toExist();
    });

    it('updateNode', () => {
        let testAction = {
            type: 'UPDATE_NODE',
            node: 'sampleNode',
            nodeType: 'sampleType',
            options: 'sampleOptions'
        };
        let state = layers({}, testAction);
        expect(state.sampleType).toExist();
        expect(state.sampleType.sampleNode).toExist();
        expect(state.sampleType.sampleNode.updates).toExist();
    });

    it('test layer visibility change for background', () => {
        const oldState = {flat: [{
            "type": "osm",
            "title": "Open Street Map",
            "name": "mapnik",
            "group": "background",
            "visibility": true
        }, {
            "type": "wms",
            "url": "http://213.215.135.196/reflector/open/service",
            "visibility": false,
            "title": "e-Geos Ortofoto RealVista 1.0",
            "name": "rv1",
            "group": "background",
            "format": "image/png"
        }]};
        var state = layers(oldState, {
            type: 'CHANGE_LAYER_PROPERTIES',
            newProperties: {
                "type": "wms",
                "url": "http://213.215.135.196/reflector/open/service",
                "visibility": true,
                "title": "e-Geos Ortofoto RealVista 1.0",
                "name": "rv1",
                "group": "background",
                "format": "image/png"
            },
            layer: "rv1"
        });

        expect(state.flat[0].visibility).toBe(false);
        expect(state.flat[1].visibility).toBe(true);
    });

    it('a layer is loading, loading flag is updated', () => {
        const action1 = {
            type: 'LAYER_LOADING',
            layerId: "layer1"
        };
        const action2 = {
            type: 'LAYER_LOADING',
            layerId: "layer2"
        };

        var originalLoadingLayers = {flat: [{name: "layer1"}, {name: "layer2"}]};
        var state = layers(originalLoadingLayers, action1);

        expect(state.flat.filter((layer) => layer.name === 'layer1')[0].loading).toBe(true);
        expect(state.flat.filter((layer) => layer.loading).length).toBe(1);

        state = layers(state, action2);
        expect(state.flat.filter((layer) => layer.name === 'layer1')[0].loading).toBe(true);
        expect(state.flat.filter((layer) => layer.name === 'layer2')[0].loading).toBe(true);
        expect(state.flat.filter((layer) => layer.loading).length).toBe(2);
    });

    it('a layer load, loading flag is updated', () => {
        const action1 = {
            type: 'LAYER_LOAD',
            layerId: "layer1"
        };

        const action2 = {
            type: 'LAYER_LOAD',
            layerId: "layer2"
        };

        var originalLoadingLayers = {flat: [{name: "layer1", loading: true}, {name: "layer2", loading: true}]};
        var state = layers(originalLoadingLayers, action1);

        expect(state.flat.filter((layer) => layer.name === 'layer1')[0].loading).toBe(false);
        expect(state.flat.filter((layer) => layer.name === 'layer2')[0].loading).toBe(true);
        expect(state.flat.filter((layer) => layer.loading).length).toBe(1);

        state = layers(state, action2);
        expect(state.flat.filter((layer) => layer.name === 'layer1')[0].loading).toBe(false);
        expect(state.flat.filter((layer) => layer.name === 'layer2')[0].loading).toBe(false);
        expect(state.flat.filter((layer) => layer.loading).length).toBe(0);
    });

    it('change group properties', () => {
        let testAction = {
            type: "CHANGE_GROUP_PROPERTIES",
            newProperties: {p: "property"},
            group: "group"
        };

        let retval = layers({
            layers: [{group: "group"}]
        }, testAction);
        expect(retval).toExist();
        expect(retval.layers).toExist();
        expect(retval.layers[0].group).toExist();
        expect(retval.layers[0].p).toExist();
        expect(retval.layers[0].p).toEqual("property");
    });

});
