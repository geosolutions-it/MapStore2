/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');
var layers = require('../layers');
const { changeLayerParams, addLayer, addGroup, moveNode, ADD_GROUP } = require('../../actions/layers');


describe('Test the layers reducer', () => {

    it('confirms that the default state is an object with "flat" as a property', () => {
        let state = layers(undefined, {type: 'UNKNOWN'});
        expect(state.flat.length).toBe(0);
    });

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
        let state = layers( {flat: [{id: 'sample'}]}, testAction);
        expect(state.flat[0].expanded).toBe(true);
    });

    it('toggleNode group', () => {
        let testAction = {
            type: 'TOGGLE_NODE',
            node: 'sample',
            nodeType: 'groups',
            status: true
        };
        let state = layers( {groups: [{id: 'sample'}]}, testAction);
        expect(state.groups[0].expanded).toBe(true);
    });

    it('toggleNode group nested', () => {
        let testAction = {
            type: 'TOGGLE_NODE',
            node: 'sample',
            nodeType: 'groups',
            status: true
        };
        let state = layers( {groups: [{name: 'group', nodes: [{id: "sample"}]}]}, testAction);
        expect(state.groups[0].nodes[0].expanded).toBe(true);
    });

    it('sortNode layers', () => {
        const order = [1, 0];
        let testAction = {
            type: 'SORT_NODE',
            node: 'group',
            order: order
        };
        let state = layers( {groups: [{name: 'group', id: 'group', nodes: [ "sample1", "sample2"]}]}, testAction);
        expect(state.groups[0].nodes[0]).toEqual('sample2');
        expect(state.groups[0].nodes[1]).toEqual('sample1');
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
            node: 'sample1',
            nodeType: 'groups'
        };
        let initialState = {
            groups: [{name: 'sample1', id: 'sample1'}, {name: 'sample2', id: 'sample2'}],
            flat: [{id: 'layer1', group: 'sample1'}, {id: 'layer2', group: 'sample2'}]
        };
        let state = layers(initialState, testAction);
        expect(state.groups.length).toBe(1);
        expect(state.flat.length).toBe(1);
    });

    it('removeNode layer', () => {
        let testAction = {
            type: 'REMOVE_NODE',
            node: 'layer1',
            nodeType: 'layers'
        };
        let initialState = {
            groups: [
                {name: 'sample1', nodes: ['layer1'], id: 'sample1'},
                {name: 'sample2', nodes: ['layer2'], id: 'sample2'}
            ],
            flat: [
                {id: 'layer1', group: 'sample1'},
                {id: 'layer2', group: 'sample2'}
            ]
        };
        let state = layers(initialState, testAction);
        expect(state.groups.length).toBe(2);
        expect(state.flat.length).toBe(1);
    });
    it('removeNode layer with remove empty groups flag', () => {
        let testAction = {
            type: 'REMOVE_NODE',
            node: 'layer1',
            nodeType: 'layers',
            removeEmpty: true
        };
        let initialState = {
            groups: [
                { name: 'sample1', nodes: ['layer1'], id: 'sample1' },
                { name: 'sample2', nodes: ['layer2'], id: 'sample2' }
            ],
            flat: [
                { id: 'layer1', group: 'sample1' },
                { id: 'layer2', group: 'sample2' }
            ]
        };
        let state = layers(initialState, testAction);
        expect(state.groups.length).toBe(1);
        expect(state.flat.length).toBe(1);
    });
    it('removeNode norGroupOrLayer', () => {
        let testAction = {
            type: 'REMOVE_NODE',
            node: 'layer1',
            nodeType: 'norGroupOrLayer'
        };
        let initialState = {
            groups: [
                {name: 'sample1', nodes: ['layer1'], id: 'sample1'},
                {name: 'sample2', nodes: ['layer2'], id: 'sample2'}
            ],
            flat: [
                {id: 'layer1', group: 'sample1'},
                {id: 'layer2', group: 'sample2'}
            ]
        };
        let state = layers(initialState, testAction);
        expect(state.groups.length).toBe(2);
        expect(state.flat.length).toBe(2);
    });

    it('removeNode nested', () => {
        let testAction = {
            type: 'REMOVE_NODE',
            node: 'sample1.nested',
            nodeType: 'groups'
        };
        let initialState = {
            groups: [{name: 'sample1', id: 'sample1', nodes: [{name: 'nested', id: 'sample1.nested'}]}, {name: 'sample2', id: 'sample2'}],
            flat: [{id: 'layer1', group: 'sample1'}, {id: 'layer2', group: 'sample2'}, {id: 'layer3', group: 'sample1.nested'}]
        };
        let state = layers(initialState, testAction);
        expect(state.groups.length).toBe(2);
        expect(state.groups[0].nodes.length).toBe(0);
        expect(state.flat.length).toBe(2);
    });

    it('updateNode changing Opacity', () => {
        let testAction = {
            type: 'UPDATE_NODE',
            node: 'sample',
            nodeType: 'layers',
            options: {opacity: 0.5}
        };
        let state = layers({flat: [{id: 'sample'}, {id: 'other'}]}, testAction);
        expect(state.flat[0].opacity).toBe(0.5);
        expect(state.flat[1].opacity).toNotExist();
    });

    it('updateNode changing Format', () => {
        let testAction = {
            type: 'UPDATE_NODE',
            node: 'sample',
            nodeType: 'layers',
            options: {format: "image/vnd.jpeg-png"}
        };
        let state = layers({flat: [{id: 'sample'}, {id: 'other'}]}, testAction);
        expect(state.flat[0].format).toBe("image/vnd.jpeg-png");
        expect(state.flat[1].format).toNotExist();
    });


    it('updateNode subgroups changing tooltipOptions', () => {
        let testAction = {
            "type": "UPDATE_NODE",
            "node": "1.3",
            "nodeType": "groups",
            "options": {
                "description": "denlayers/40935555",
                "tooltipOptions": "both"
            }
        };
        const groups = [
            {
                "id": "1",
                "title": "1",
                "name": "1",
                "nodes": [
                    {
                        "id": "1.3",
                        "title": "3",
                        "name": "3",
                        "nodes": [
                            {
                                "id": "1.3.4",
                                "title": "4",
                                "name": "4",
                                "nodes": [
                                    "topp:states__6"
                                ],
                                "expanded": true
                            }
                        ],
                        "expanded": true,
                        "description": "denlayers/4093",
                        "tooltipOptions": "title",
                        "tooltipPlacement": "right"
                    }
                ],
                "expanded": true
            }
        ];
        let state = layers({groups}, testAction);
        expect(state.groups[0].nodes[0].tooltipOptions).toBe("both");
        expect(state.groups[0].nodes[0].tooltipPlacement).toBe("right");
        expect(state.groups[0].nodes[0].description).toBe("denlayers/40935555");
        expect(state.groups[0].nodes[0].id).toBe("1.3");
    });

    it('test layer visibility change for background', () => {
        const oldState = {flat: [{
            "type": "osm",
            "title": "Open Street Map",
            "name": "mapnik",
            "id": "mapnik",
            "group": "background",
            "visibility": true
        }, {
            "type": "wms",
            "url": "http://213.215.135.196/reflector/open/service",
            "visibility": false,
            "title": "e-Geos Ortofoto RealVista 1.0",
            "name": "rv1",
            "id": "rv1",
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
                "id": "rv1",
                "group": "background",
                "format": "image/png"
            },
            layer: "rv1"
        });

        expect(state.flat[0].visibility).toBe(false);
        expect(state.flat[1].visibility).toBe(true);
    });
    it('changeLayerParams', () => {
        const state = {
            flat: [{
                "type": "osm",
                "title": "Open Street Map",
                "name": "mapnik",
                "id": "mapnik",
                "group": "background",
                "visibility": true
            }, {
                "type": "wms",
                "url": "/reflector/open/service",
                "visibility": false,
                "title": "e-Geos Ortofoto RealVista 1.0",
                "name": "rv1",
                "id": "rv1",
                "group": "background",
                "format": "image/png"
            }, {
                "type": "wms",
                "url": "/reflector/open/service",
                "visibility": false,
                "title": "e-Geos Ortofoto RealVista 1.0",
                "name": "rv2",
                "id": "rv2",
                "group": "background",
                "format": "image/png"
            }]
        };
        const state1 = layers(state, changeLayerParams("rv1", {elevation: 200}));
        expect(state1.flat[1].params).toExist();
        expect(state1.flat[1].params.elevation).toBe(200);
        expect(state1.flat[2].params).toNotExist();
        const state2 = layers(state, changeLayerParams(["rv1", "rv2"], { elevation: 200 }));
        expect(state2.flat[1].params.elevation).toBe(200);
        expect(state2.flat[2].params.elevation).toBe(200);

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

        var originalLoadingLayers = {flat: [{id: "layer1", name: "layer1"}, {id: "layer2", name: "layer2"}]};
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
            layerId: "layer2",
            error: true
        };

        var originalLoadingLayers = {flat: [{id: "layer1", name: "layer1", loading: true}, {id: "layer2", name: "layer2", loading: true}]};
        var state = layers(originalLoadingLayers, action1);

        expect(state.flat.filter((layer) => layer.name === 'layer1')[0].loading).toBe(false);
        expect(state.flat.filter((layer) => layer.name === 'layer2')[0].loading).toBe(true);
        expect(state.flat.filter((layer) => layer.loading).length).toBe(1);

        state = layers(state, action2);
        expect(state.flat.filter((layer) => layer.name === 'layer1')[0].loading).toBe(false);
        expect(state.flat.filter((layer) => layer.name === 'layer2')[0].loading).toBe(false);
        expect(state.flat.filter((layer) => layer.loading).length).toBe(0);
        expect(state.flat.filter((layer) => layer.loadingError === 'Error').length).toBe(1);
    });

    it('a layer load ends with error, loadingError flag is updated', () => {
        const action1 = {
            type: 'LAYER_ERROR',
            layerId: "layer1"
        };

        const action2 = {
            type: 'LAYER_ERROR',
            layerId: "layer2"
        };

        var originalLoadingLayers = {flat: [{id: "layer1", name: "layer1", loading: true}, {id: "layer2", name: "layer2", loading: true}]};
        var state = layers(originalLoadingLayers, action1);

        expect(state.flat.filter((layer) => layer.name === 'layer1')[0].loading).toBe(true);
        expect(state.flat.filter((layer) => layer.name === 'layer2')[0].loading).toBe(true);
        expect(state.flat.filter((layer) => layer.loadingError === 'Error').length).toBe(1);

        state = layers(state, action2);
        expect(state.flat.filter((layer) => layer.name === 'layer1')[0].loading).toBe(true);
        expect(state.flat.filter((layer) => layer.name === 'layer2')[0].loading).toBe(true);
        expect(state.flat.filter((layer) => layer.loadingError).length).toBe(2);
    });

    it('a layer load ends with error, loadingError flag is updated, with tile count error', () => {
        const action1 = {
            type: 'LAYER_ERROR',
            layerId: "layer1",
            tilesCount: 25,
            tilesErrorCount: 25
        };

        const action2 = {
            type: 'LAYER_ERROR',
            layerId: "layer2",
            tilesCount: 25,
            tilesErrorCount: 2
        };

        var originalLoadingLayers = {flat: [{id: "layer1", name: "layer1", loading: true}, {id: "layer2", name: "layer2", loading: true}]};
        var state = layers(originalLoadingLayers, action1);

        expect(state.flat.filter((layer) => layer.name === 'layer1')[0].loading).toBe(true);
        expect(state.flat.filter((layer) => layer.name === 'layer2')[0].loading).toBe(true);
        expect(state.flat.filter((layer) => layer.loadingError === 'Error').length).toBe(1);

        state = layers(state, action2);
        expect(state.flat.filter((layer) => layer.name === 'layer1')[0].loading).toBe(true);
        expect(state.flat.filter((layer) => layer.name === 'layer2')[0].loading).toBe(true);
        expect(state.flat.filter((layer) => layer.loadingError === 'Error').length).toBe(1);
        expect(state.flat.filter((layer) => layer.loadingError === 'Warning').length).toBe(1);
    });

    it('change group properties', () => {
        let testAction = {
            type: "CHANGE_GROUP_PROPERTIES",
            newProperties: {p: "property"},
            group: "group"
        };

        let state = layers({
            flat: [{group: "group"}]
        }, testAction);
        expect(state).toExist();
        expect(state.flat).toExist();
        expect(state.flat[0].group).toExist();
        expect(state.flat[0].p).toExist();
        expect(state.flat[0].p).toEqual("property");
    });

    it('refreshLayers', () => {
        let testAction = {
            type: "REFRESH_LAYERS",
            layers: [{url: 'fake', layer: 'fake'}]
        };

        let state = layers({
            flat: []
        }, testAction);
        expect(state).toExist();
        expect(state.refreshing).toExist();
        expect(state.refreshing.length).toBe(1);
        expect(state.refreshing[0].layer).toBe('fake');
    });

    it('layers refreshed', () => {
        let testAction = {
            type: "LAYERS_REFRESHED",
            layers: [{url: 'url1', layer: 'layer1'}]
        };

        let state = layers({
            flat: [{url: 'url1', id: 'layer1'}, {url: 'url2', id: 'layer2'}],
            refreshing: [{url: 'url1', id: 'layer1'}, {url: 'url2', id: 'layer2'}]
        }, testAction);
        expect(state).toExist();
        expect(state.refreshing).toExist();
        expect(state.refreshing.length).toBe(1);
        expect(state.refreshing[0].id).toBe('layer2');
    });

    it('layers refresh error', () => {
        let testAction = {
            type: "LAYERS_REFRESH_ERROR",
            layers: [{url: 'url1', layer: 'layer1', fullLayer: {title: 'title'}}]
        };

        let state = layers({
            flat: [{url: 'url1', id: 'layer1'}, {url: 'url2', id: 'layer2'}],
            refreshing: [{url: 'url1', id: 'layer1'}, {url: 'url2', id: 'layer2'}]
        }, testAction);
        expect(state).toExist();
        expect(state.refreshing).toExist();
        expect(state.refreshing.length).toBe(1);
        expect(state.refreshing[0].id).toBe('layer2');
        expect(state.refreshError).toExist();
    });

    it('change group properties with default group', () => {
        // action targeting the Default group
        let action = {
            type: "CHANGE_GROUP_PROPERTIES",
            newProperties: {visibility: true},
            group: "Default"
        };
        // second layer don't have a group so it belongs to the Default group
        let state = layers({
            flat: [{name: "layer1", group: "meteo"}, {name: "layer2"}]
        }, action);
        // the state should exists
        expect(state).toExist();
        expect(state.flat).toExist();
        // no changes in layer1
        expect(state.flat[0].group).toExist();
        expect(state.flat[0].group).toBe("meteo");
        expect(state.flat[0].visibility).toNotExist();
        // visibility property has been added to layer2
        expect(state.flat[1].group).toNotExist();
        expect(state.flat[1].visibility).toExist();
        expect(state.flat[1].visibility).toBe(true);
    });

    it('add new layer', () => {
        let testAction1 = {
            type: "ADD_LAYER",
            layer: {group: "test", id: "test_id1"},
            foreground: false
        };

        let state = layers({}, testAction1);
        expect(state).toExist();
        expect(state.flat).toExist();
        expect(state.flat[0].group).toExist();
        expect(state.flat[0].id).toExist();
        expect(state.flat[0].id).toBe("test_id1");
        expect(state.groups).toExist();
        expect(state.groups[0].name).toBe("test");
        expect(state.groups[0].nodes[0]).toBe("test_id1");

        let testAction2 = {
            type: "ADD_LAYER",
            layer: {group: "test", id: "test_id2"},
            foreground: false
        };

        state = layers(state, testAction2);
        expect(state).toExist();
        expect(state.flat).toExist();
        expect(state.flat[0].group).toExist();
        expect(state.flat[0].id).toExist();
        expect(state.flat[0].id).toBe("test_id2");
        expect(state.groups).toExist();
        expect(state.groups[0].name).toBe("test");
        expect(state.groups[0].nodes[1]).toBe("test_id2");

        let testAction3 = {
            type: "ADD_LAYER",
            layer: {group: "test", id: "test_id3"},
            foreground: true
        };

        state = layers(state, testAction3);
        expect(state).toExist();
        expect(state.flat).toExist();
        expect(state.flat[2].group).toExist();
        expect(state.flat[2].id).toExist();
        expect(state.flat[2].id).toBe("test_id3");
        expect(state.groups).toExist();
        expect(state.groups[0].name).toBe("test");
        expect(state.groups[0].nodes[0]).toBe("test_id3");
        expect(state.groups[0].nodes[1]).toBe("test_id1");
    });

    it('add new layer and verify old state', () => {
        const testAction = addLayer({ group: "test", id: "test_id1" });

        const state = layers(
            {
                flat: [
                    {
                        id: "layer"
                    }
                ],
                settings: {
                    options: {
                        opacity: 0.8
                    }
                },
                selected: [
                    "layer"
                ]
            },
            testAction
        );

        expect(state.settings).toExist();
        expect(state.selected).toExist();

    });

    it('remove layer', () => {
        let addAction = {
            type: "ADD_LAYER",
            layer: {group: "group1", id: "test_id1"}
        };
        let state = layers({}, addAction);

        addAction = {
            type: "ADD_LAYER",
            layer: {group: "group1", id: "test_id2"}
        };
        state = layers(state, addAction);
        addAction = {
            type: "ADD_LAYER",
            layer: {group: "group2", id: "test_id3"}
        };
        state = layers(state, addAction);

        let removeAction = {
            type: "REMOVE_LAYER",
            layerId: "test_id1"
        };
        state = layers(state, removeAction);

        /* bogous on purpose */
        removeAction = {
            type: "REMOVE_LAYER",
            layerId: "test_id4"
        };
        state = layers(state, removeAction);

        expect(state).toExist();
        expect(state.flat).toExist();
        expect(state.flat).toExclude({group: "group1", id: "test_id1"});
        expect(state.flat).toInclude({group: "group1", id: "test_id2"});
        expect(state.flat).toInclude({group: "group2", id: "test_id3"});
        expect(state.groups).toExist();
        expect(state.groups[1].nodes).toExclude('test_id1');
        expect(state.groups[1].nodes).toInclude('test_id2');
        expect(state.groups[1].name).toBe('group1');
        expect(state.groups[0].nodes).toInclude('test_id3');
        expect(state.groups[0].name).toBe('group2');
    });

    it('show settings', () => {
        const action = {
            type: "SHOW_SETTINGS",
            node: "node1",
            nodeType: "layers",
            options: {opacity: 0.5, size: 500}
        };
        const state = layers({}, action);
        expect(state).toExist();
        expect(state.settings).toExist();
        expect(state.settings.expanded).toBe(true);
        expect(state.settings.node).toBe("node1");
        expect(state.settings.nodeType).toBe("layers");
        expect(state.settings.options).toEqual({opacity: 0.5, size: 500});
    });

    it('hide settings', () => {
        const action = {
            type: "HIDE_SETTINGS"
        };
        const state = layers({}, action);
        expect(state).toExist();
        expect(state.settings).toExist();
        expect(state.settings.expanded).toBe(false);
        expect(state.settings.node).toNotExist();
        expect(state.settings.nodeType).toNotExist();
        expect(state.settings.options).toEqual({});
    });

    it('update settings', () => {
        const action = {
            type: "UPDATE_SETTINGS",
            options: {opacity: 0.8, size: 400}
        };
        const state = layers({}, action);
        expect(state).toExist();
        expect(state.settings).toExist();
        expect(state.settings.options).toEqual({opacity: 0.8, size: 400});
    });

    it('update existing settings', () => {
        const action = {
            type: "UPDATE_SETTINGS",
            options: {size: 450}
        };
        const state = layers({settings: {options: {opacity: 0.8, size: 400}}}, action);
        expect(state).toExist();
        expect(state.settings).toExist();
        expect(state.settings.options).toEqual({opacity: 0.8, size: 450});
    });

    it('clear layers', () => {
        const action = {
            type: "LAYERS:CLEAR_LAYERS"
        };
        const state = layers({flat: [{id: "layer"}], groups: [{id: "group"}]}, action);
        expect(state).toExist();
        expect(state.flat).toExist();
        expect(state.flat).toEqual([]);
        expect(state.groups).toExist();
        expect(state.groups).toEqual([]);
    });

    it('filter layers', () => {
        const action = {
            type: "LAYERS:FILTER_LAYERS",
            text: 'text'
        };

        const state = layers({}, action);
        expect(state).toExist();
        expect(state.filter).toExist();
        expect(state.filter).toEqual('text');
    });

    it('filter layers with no text', () => {
        const action = {
            type: "LAYERS:FILTER_LAYERS"
        };

        const state = layers({}, action);
        expect(state).toExist();
        expect(state.filter).toEqual('');
    });

    it('select layer nodes', () => {
        const action = {
            type: "LAYERS:SELECT_NODE",
            id: 'layer',
            nodeType: 'layer',
            ctrlKey: false
        };

        const state = layers({flat: [{id: "layer"}], groups: [{id: "group"}]}, action);
        expect(state).toExist();
        expect(state.selected).toExist();
        expect(state.selected).toEqual(['layer']);
    });

    it('select group nodes', () => {
        const action = {
            type: "LAYERS:SELECT_NODE",
            id: 'group',
            nodeType: 'group',
            ctrlKey: false
        };

        const state = layers({flat: [{id: "layer"}], groups: [{id: "group", nodes: ["layer"]}]}, action);
        expect(state).toExist();
        expect(state.selected).toExist();
        expect(state.selected).toEqual(['layer', 'group']);
    });

    it('select nested groups nodes', () => {
        const action = {
            type: "LAYERS:SELECT_NODE",
            id: 'group',
            nodeType: 'group',
            ctrlKey: false
        };

        const state = layers({flat: [{id: "layer"}, {id: "layer2"}, {id: "layer3"}], groups: [{id: "group", nodes: ["layer", {id: 'group001', nodes: ["layer2"]}]}]}, action);
        expect(state).toExist();
        expect(state.selected).toExist();
        expect(state.selected).toEqual(['layer', 'layer2', 'group001', 'group' ]);
    });

    it('select multiple layer nodes', () => {
        const action = {
            type: "LAYERS:SELECT_NODE",
            id: 'layer',
            nodeType: 'layer',
            ctrlKey: true
        };

        const state = layers({flat: [{id: "layer"}, {id: "layer2"}], groups: [{id: "group"}], selected: ['layer2']}, action);
        expect(state).toExist();
        expect(state.selected).toExist();
        expect(state.selected).toEqual(['layer2', 'layer']);
    });

    it('select multiple groups nodes', () => {
        const action = {
            type: "LAYERS:SELECT_NODE",
            id: 'group',
            nodeType: 'group',
            ctrlKey: true
        };

        const state = layers({flat: [{id: "layer"}, {id: "layer2"}, {id: "layer3"}], groups: [{id: "group", nodes: ["layer", {id: 'group001', nodes: ["layer2"]}]}], selected: ['layer2', 'group2']}, action);
        expect(state).toExist();
        expect(state.selected).toExist();
        expect(state.selected).toEqual(['layer2', 'group2', 'layer', 'layer2', 'group001', 'group']);
    });

    it('select node with no id', () => {
        const action = {
            type: "LAYERS:SELECT_NODE"
        };

        const state = layers({flat: [{id: "layer"}, {id: "layer2"}, {id: "layer3"}], groups: [{id: "group", nodes: ["layer", {id: 'group001', nodes: ["layer2"]}]}], selected: ['layer2', 'group2']}, action);
        expect(state).toExist();
        expect(state.selected).toExist();
        expect(state.selected).toEqual([]);
    });

    it('show layer metadata', () => {
        const action = {
            type: "LAYERS:SHOW_LAYER_METADATA",
            metadataRecord: {"identifier": 1},
            maskLoading: true
        };

        const state = layers({}, action);
        expect(state).toExist();
        expect(state.layerMetadata).toExist();
        expect(state.layerMetadata.expanded).toEqual(true);
    });

    it('hide layer metadata', () => {
        const action = {
            type: "LAYERS:HIDE_LAYER_METADATA"
        };

        const state = layers({}, action);
        expect(state).toExist();
        expect(state.layerMetadata).toExist();
        expect(state.layerMetadata.expanded).toEqual(false);
    });

    it('add root group', () => {
        const action = {
            type: ADD_GROUP,
            group: 'newgroup'
        };

        const state = layers({groups: [{id: 'group1'}]}, action);
        expect(state).toExist();
        expect(state.groups.length).toBe(2);
        expect(state.groups[1].title).toBe('newgroup');
    });

    it('add nested group', () => {
        const action = {
            type: ADD_GROUP,
            group: 'newgroup',
            parent: 'group1.group2'
        };

        const state = layers({ groups: [{ id: 'group1', nodes: [{ id: 'group1.group2', nodes: [{ id: 'group1.group2.group3', nodes: []}]}] }] }, action);
        expect(state).toExist();
        expect(state.groups.length).toBe(1);
        expect(state.groups[0].nodes.length).toBe(1);
        expect(state.groups[0].nodes[0].nodes.length).toBe(2);
        const newgroup = state.groups[0].nodes[0].nodes[1];
        expect(newgroup.id).toBe('group1.group2.' + newgroup.name);
        expect(newgroup.title).toBe('newgroup');
        expect(newgroup.nodes.length).toBe(0);
    });

    it('check uniqueness of new group ids', () => {
        const actions = [addGroup('newgroup', 'group1.group2'), addGroup('newgroup', 'group1.group2')];
        const state = actions.reduce(layers,
            {
                groups: [{
                    id: 'group1', nodes: [{
                        id: 'group1.group2', nodes: [{
                            id: 'group1.group2.group3', nodes: []
                        }]
                    }]
                }]
            }
        );
        expect(state).toExist();
        expect(state.groups.length).toBe(1);
        expect(state.groups[0].nodes.length).toBe(1);
        expect(state.groups[0].nodes[0].nodes.length).toBe(3);
        const newgroup1 = state.groups[0].nodes[0].nodes[1];
        const newgroup2 = state.groups[0].nodes[0].nodes[2];
        expect(newgroup1.title).toBe('newgroup');
        expect(newgroup1.name).toExist();
        expect(newgroup1.name.length).toBe(36);
        expect(newgroup1.id).toExist();
        expect(newgroup1.id.length).toBe(6 + 6 + 36 + 2);
        expect(newgroup2.title).toBe('newgroup');
        expect(newgroup2.name).toExist();
        expect(newgroup2.name.length).toBe(36);
        expect(newgroup2.id).toExist();
        expect(newgroup2.id.length).toBe(6 + 6 + 36 + 2);
        expect(newgroup1.name).toNotBe(newgroup2.name);
        expect(newgroup1.id).toNotBe(newgroup2.id);
    });

    it('use controlled options on add group', () => {
        const options = {
            id: 'uniq_id',
            title: 'Group Title',
            name: 'uniq_id'
        };
        const state = layers(
            {
                groups: [{
                    id: 'group1',
                    nodes: []
                }]
            },
            addGroup(options.title, 'group1', options)
        );
        expect(state).toExist();
        expect(state.groups.length).toBe(1);
        expect(state.groups[0].nodes.length).toBe(1);
        const newNode = state.groups[0].nodes[0];
        expect(newNode.id).toBe(options.id);
        expect(newNode.title).toBe(options.title);
        expect(newNode.name).toBe(options.name);
    });

    it('move groups when two are with the same title', () => {
        const action = moveNode('groupid1.groupid2', 'Default', 0);
        const state = layers({
            flat: [],
            groups: [{
                id: 'Default',
                name: 'Default',
                title: 'Default',
                nodes: []
            }, {
                id: 'groupid1',
                name: 'groupid1',
                title: 'Test Group',
                nodes: [{
                    id: 'groupid1.groupid2',
                    name: 'groupid2',
                    title: 'Group',
                    nodes: []
                }]
            }, {
                id: 'groupid3',
                name: 'groupid3',
                title: 'Group',
                nodes: []
            }]
        }, action);
        expect(state).toExist();
        expect(state.groups).toEqual([
            {
                id: 'Default',
                name: 'Default',
                title: 'Default',
                nodes: [{
                    id: 'Default.groupid2',
                    name: 'groupid2',
                    title: 'Group',
                    nodes: []
                }]
            },
            {
                id: 'groupid1',
                name: 'groupid1',
                title: 'Test Group',
                nodes: []
            },
            {
                id: 'groupid3',
                name: 'groupid3',
                title: 'Group',
                nodes: []
            }
        ]);
    });
});
