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
    CHANGE_LAYER_PROPERTIES,
    LAYER_LOADING,
    LAYER_LOAD,
    LAYER_ERROR,
    ADD_LAYER,
    REMOVE_LAYER,
    SHOW_SETTINGS,
    HIDE_SETTINGS,
    UPDATE_SETTINGS,
    REFRESH_LAYERS,
    UPDATE_LAYERS_DIMENSION,
    LAYERS_REFRESHED,
    LAYERS_REFRESH_ERROR,
    BROWSE_DATA,
    CLEAR_LAYERS,
    SELECT_NODE,
    FILTER_LAYERS,
    SHOW_LAYER_METADATA,
    HIDE_LAYER_METADATA,
    UPDATE_SETTINGS_PARAMS,
    ADD_GROUP,
    changeLayerProperties,
    toggleNode,
    sortNode,
    removeNode,
    updateNode,
    layerLoading,
    layerLoad,
    layerError,
    addLayer,
    removeLayer,
    showSettings,
    hideSettings,
    updateSettings,
    refreshLayers,
    updateLayerDimension,
    layersRefreshed,
    layersRefreshError,
    browseData,
    clearLayers,
    selectNode,
    filterLayers,
    showLayerMetadata,
    hideLayerMetadata,
    updateSettingsParams,
    addGroup
} = require('../layers');
var {getLayerCapabilities} = require('../layerCapabilities');

describe('Test correctness of the layers actions', () => {
    it('test layer properties change action', (done) => {
        let e = changeLayerProperties('layer', {visibility: true});

        try {
            expect(e).toExist();
            expect(e.type).toBe(CHANGE_LAYER_PROPERTIES);
            expect(e.newProperties).toExist();
            expect(e.newProperties.visibility).toBe(true);
            expect(e.layer).toBe('layer');
            done();
        } catch (ex) {
            done(ex);
        }

    });

    it('sortNode', () => {
        const order = [0, 2, 1];

        var retval = sortNode('group', order);

        expect(retval).toExist();
        expect(retval.type).toBe(SORT_NODE);
        expect(retval.node).toBe('group');
        expect(retval.order).toBe(order);
    });

    it('refreshLayers', () => {
        var retval = refreshLayers(['layer'], {
            opt: 'val'
        });

        expect(retval).toExist();
        expect(retval.type).toBe(REFRESH_LAYERS);
        expect(retval.layers.length).toBe(1);
        expect(retval.options.opt).toBe('val');
    });

    it('layersRefreshed', () => {
        var retval = layersRefreshed(['layer']);

        expect(retval).toExist();
        expect(retval.type).toBe(LAYERS_REFRESHED);
        expect(retval.layers.length).toBe(1);
    });

    it('layersRefreshError', () => {
        var retval = layersRefreshError(['layer'], 'err');

        expect(retval).toExist();
        expect(retval.type).toBe(LAYERS_REFRESH_ERROR);
        expect(retval.layers.length).toBe(1);
        expect(retval.error).toBe('err');
    });

    it('updateLayerDimension', () => {
        const retval = updateLayerDimension( "time", "2016-02-24T03:00:00.000Z", null, "A");
        expect(retval).toExist();
        expect(retval.type).toBe(UPDATE_LAYERS_DIMENSION);
        expect(retval.layers).toBe("A");
        expect(retval.dimension).toBe("time");
        expect(retval.value).toBe("2016-02-24T03:00:00.000Z");
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
        expect(retval.removeEmpty).toBe(false);
    });

    it('removeNode with removeEmpty', () => {
        var retval = removeNode('sampleNode', 'sampleType', true);

        expect(retval).toExist();
        expect(retval.type).toBe(REMOVE_NODE);
        expect(retval.node).toBe('sampleNode');
        expect(retval.nodeType).toBe('sampleType');
        expect(retval.removeEmpty).toBe(true);
    });

    it('updateNode', () => {
        var retval = updateNode('sampleNode', 'sampleType', 'sampleOptions');

        expect(retval).toExist();
        expect(retval.type).toBe(UPDATE_NODE);
        expect(retval.node).toBe('sampleNode');
        expect(retval.nodeType).toBe('sampleType');
        expect(retval.options).toBe('sampleOptions');
    });

    it('a layer is loading', () => {
        const testVal = 'layer1';
        const retval = layerLoading(testVal);

        expect(retval).toExist();
        expect(retval.type).toBe(LAYER_LOADING);
        expect(retval.layerId).toBe(testVal);
    });

    it('a layer is load', () => {
        const testVal = 'layer1';
        const retval = layerLoad(testVal);

        expect(retval).toExist();
        expect(retval.type).toBe(LAYER_LOAD);
        expect(retval.layerId).toBe(testVal);
    });

    it('a layer is load with error', () => {
        const testVal = 'layer1';
        const error = 'error';
        const retval = layerLoad(testVal, error);

        expect(retval).toExist();
        expect(retval.type).toBe(LAYER_LOAD);
        expect(retval.layerId).toBe(testVal);
        expect(retval.error).toBe(error);
    });

    it('a layer is not loaded with errors', () => {
        const testVal = 'layer1';
        const retval = layerError(testVal);

        expect(retval).toExist();
        expect(retval.type).toBe(LAYER_ERROR);
        expect(retval.layerId).toBe(testVal);
    });

    it('add layer', () => {
        const testVal = 'layer1';
        const retval1 = addLayer(testVal);

        expect(retval1).toExist();
        expect(retval1.type).toBe(ADD_LAYER);
        expect(retval1.layer).toBe(testVal);
        expect(retval1.foreground).toBe(true);

        const retval2 = addLayer(testVal, true);

        expect(retval2).toExist();
        expect(retval2.type).toBe(ADD_LAYER);
        expect(retval2.layer).toBe(testVal);
        expect(retval2.foreground).toBe(true);
    });

    it('remove layer', () => {
        const testVal = 'layerid1';
        const retval = removeLayer(testVal);

        expect(retval).toExist();
        expect(retval.type).toBe(REMOVE_LAYER);
        expect(retval.layerId).toBe(testVal);
    });

    it('show settings', () => {
        const action = showSettings("node1", "layers", {opacity: 0.5});
        expect(action).toExist();
        expect(action.type).toBe(SHOW_SETTINGS);
        expect(action.node).toBe("node1");
        expect(action.nodeType).toBe("layers");
        expect(action.options).toEqual({opacity: 0.5});
    });

    it('hide settings', () => {
        const action = hideSettings();
        expect(action).toExist();
        expect(action.type).toBe(HIDE_SETTINGS);
    });

    it('update settings', () => {
        const action = updateSettings({opacity: 0.5, size: 500});
        expect(action).toExist();
        expect(action.type).toBe(UPDATE_SETTINGS);
        expect(action.options).toEqual({opacity: 0.5, size: 500});
    });
    it('get layer capabilities', (done) => {
        const layer = {
            id: "TEST_ID",
            name: 'testworkspace:testlayer',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'shapefile',
            url: 'base/web/client/test-resources/geoserver/wms'
        };
        const actionCall = getLayerCapabilities(layer);
        expect(actionCall).toExist();
        actionCall((action)=> {
            expect(action).toExist();
            expect(action.options).toExist();
            expect(action.type === UPDATE_NODE);
            if (action.options.capabilities) {
                done();
            }
        });
    });
    it('browseData', () => {
        const layer = {id: "TEST", name: "test", url: "test"};
        const action = browseData(layer);
        expect(action.type).toBe(BROWSE_DATA);
        expect(action.layer).toBe(layer);
    });

    it('clear layers', () => {
        const action = clearLayers();
        expect(action.type).toBe(CLEAR_LAYERS);
    });

    it('select node', () => {
        const action = selectNode('id', 'nodeType', 'ctrlKey');
        expect(action.type).toBe(SELECT_NODE);
        expect(action.id).toBe('id');
        expect(action.nodeType).toBe('nodeType');
        expect(action.ctrlKey).toBe('ctrlKey');
    });

    it('filter layers', () => {
        const action = filterLayers('text');
        expect(action.type).toBe(FILTER_LAYERS);
        expect(action.text).toBe('text');
    });

    it('show layer metadata', () => {
        const action = showLayerMetadata({'identifier': '1'}, true);
        expect(action.type).toBe(SHOW_LAYER_METADATA);
        expect(action.metadataRecord).toEqual({'identifier': '1'});
        expect(action.maskLoading).toBe(true);
    });

    it('hide layer metadata', () => {
        const action = hideLayerMetadata();
        expect(action.type).toBe(HIDE_LAYER_METADATA);
    });

    it('update settings params', () => {
        const newParams = { style: 'new_style' };
        const update = true;
        const action = updateSettingsParams(newParams, update);
        expect(action.type).toBe(UPDATE_SETTINGS_PARAMS);
        expect(action.newParams).toBe(newParams);
        expect(action.update).toBe(update);
    });

    it('add root group', () => {
        const action = addGroup('newgroup');
        expect(action.type).toBe(ADD_GROUP);
        expect(action.group).toBe('newgroup');
        expect(action.parent).toNotExist();
    });

    it('add nested group', () => {
        const action = addGroup('newgroup', 'group1.group2');
        expect(action.type).toBe(ADD_GROUP);
        expect(action.group).toBe('newgroup');
        expect(action.parent).toBe('group1.group2');
    });

    it('add group with options', () => {
        const options = {
            id: 'uuid',
            title: 'My title',
            expanded: true
        };
        const action = addGroup(options.id, undefined, options);
        expect(action.type).toBe(ADD_GROUP);
        expect(action.group).toBe(options.id);
        expect(action.parent).toBeFalsy();
        expect(action.options).toEqual(options);
    });
});
