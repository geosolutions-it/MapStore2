/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import timeline from '../timeline';

import {
    rangeDataLoaded,
    selectLayer,
    initializeSelectLayer,
    timeDataLoading,
    setCollapsed,
    setMapSync,
    initTimeline,
    setSnapRadioButtonEnabled,
    setTimeLayers,
    updateTimeLayersSetting
} from '../../actions/timeline';
import { isCollapsed, isMapSync } from '../../selectors/timeline';
import expect from 'expect';
const initConfig = {showHiddenLayers: true, expandLimit: 20, snapType: 'start', endValuesSupport: true};
describe('Test the timeline reducer', () => {
    it('change the layer histogram and rangedata', () => {
        const initialState = {
            rangeData: {
                layer1: { range: 'old range', histogram: 'old histogram'},
                layer2: { }
            }
        };
        const state = timeline(initialState, rangeDataLoaded('layer1', 'new Range', 'new histogram', 'domain'));
        expect(state).toExist();
        expect(state.rangeData.layer1.range).toBe('new Range');
        expect(state.rangeData.layer1.histogram).toBe('new histogram');
        expect(state.rangeData.layer1.domain).toBe('domain');
    });
    it('select a layer', () => {
        const initialState = {
            rangeData: {
                layer1: { range: 'old range', histogram: 'old histogram'},
                layer2: { }
            }
        };
        const state = timeline(initialState, selectLayer('layer1'));
        expect(state).toExist();
        expect(state.selectedLayer).toBe('layer1');
        expect(state.settings.snapType).toBe('start');
    });
    it('initialize select a layer', () => {
        const initialState = {
            rangeData: {
                layer1: { range: 'old range', histogram: 'old histogram'},
                layer2: { }
            }
        };
        const state = timeline(initialState, initializeSelectLayer('layer1'));
        expect(state).toExist();
        expect(state.selectedLayer).toBe('layer1');
    });
    it('layer is loading', () => {
        const initialState = {
            rangeData: {
                layer1: { range: 'old range', histogram: 'old histogram'},
                layer2: { }
            }
        };
        const state = timeline(initialState, timeDataLoading('layer1', true));
        expect(state).toExist();
        expect(state.loading.layer1).toBe(true);
    });
    it('remove a layer', () => {
        const initialState = {
            rangeData: {
                layer1: { range: 'old range', histogram: 'old histogram'},
                layer2: { }
            }
        };
        const action = {
            type: 'REMOVE_NODE',
            node: 'layer1'
        };
        const state = timeline(initialState, action);
        expect(state).toExist();
        expect(state.rangeData.layer1).toNotExist();

    });
    it('remove a layer that is not selected', () => {
        const initialState = {
            selectedLayer: 'layer2',
            rangeData: {
                layer1: { range: 'old range', histogram: 'old histogram'},
                layer2: { }
            }
        };
        const action = {
            type: 'REMOVE_NODE',
            node: 'layer1'
        };
        const state = timeline(initialState, action);
        expect(state).toExist();
        expect(state.rangeData.layer1).toNotExist();
        expect(state.selectedLayer).toBe('layer2');
        expect(state.rangeData.layer2).toExist();
    });
    it('remove a selected layer with no rangeData or loading data', () => {
        const initialState = {
            selectedLayer: 'layer3',
            rangeData: {
                layer1: { range: 'old range', histogram: 'old histogram'},
                layer2: { }
            }
        };
        const action = {
            type: 'REMOVE_NODE',
            node: 'layer3'
        };
        const state = timeline(initialState, action);
        expect(state).toExist();
        expect(state.rangeData.layer1).toExist();
        expect(state.rangeData.layer2).toExist();
        expect(state.selectedLayer).toNotExist();
    });
    it('reset timeline data when switch to a new map', () => {
        const action = {
            type: 'RESET_CONTROLS'
        };
        const initialState = {
            selectedLayer: 'layer3',
            rangeData: {
                layer1: { range: 'old range', histogram: 'old histogram'},
                layer2: { }
            }
        };
        const state = timeline(initialState, action);
        expect(state).toExist();
        expect(state.rangeData).toNotExist();
        expect(state.selectedLayer).toNotExist();
    });
    it('setCollapsed action', () => {
        const action = setCollapsed(true);
        expect(isCollapsed({timeline: timeline(undefined, action)})).toBe(true);
    });
    it('setMapSync', () => {
        expect(isMapSync({timeline: timeline({}, setMapSync(true))})).toBe(true);
        expect(isMapSync({ timeline: timeline({}, setMapSync(false)) })).toBe(false);
    });
    it('initTimeline with defaults', () => {
        const state = timeline(
            {settings: {autoLoad: true, collapsed: false}},
            initTimeline({...initConfig, endValuesSupport: undefined})
        );
        expect(state.settings.autoLoad).toBeTruthy();
        expect(state.settings.collapsed).toBeFalsy();
        expect(state.settings.showHiddenLayers).toBe(true);
        expect(state.settings.expandLimit).toBe(20);
        expect(state.settings.snapType).toBe('start');
    });
    it('initTimeline with endValuesSupport set as undefined', () => {
        const state = timeline({}, initTimeline({...initConfig, endValuesSupport: undefined}));
        expect(state.settings.showHiddenLayers).toBe(true);
        expect(state.settings.expandLimit).toBe(20);
        expect(state.settings.snapType).toBe('start');
        expect(state.settings.endValuesSupport).toBe(undefined);
    });
    it('initTimeline with endValuesSupport set as false', () => {
        const state = timeline({}, initTimeline({...initConfig, endValuesSupport: false}));
        expect(state.settings.showHiddenLayers).toBe(true);
        expect(state.settings.expandLimit).toBe(20);
        expect(state.settings.snapType).toBe('start');
        expect(state.settings.endValuesSupport).toBe(false);
    });
    it('initTimeline with endValuesSupport set as true', () => {
        const state = timeline({}, initTimeline(initConfig));
        expect(state.settings.showHiddenLayers).toBe(true);
        expect(state.settings.expandLimit).toBe(20);
        expect(state.settings.snapType).toBe('start');
        expect(state.settings.endValuesSupport).toBe(true);
    });
    it('initTimeline with snapRadioButtonEnabled set as true', () => {
        const state = timeline({
            settings: {
                snapRadioButtonEnabled: true
            }
        }, initTimeline(initConfig));
        expect(state.settings.showHiddenLayers).toBe(true);
        expect(state.settings.expandLimit).toBe(20);
        expect(state.settings.snapType).toBe('start');
        expect(state.settings.endValuesSupport).toBe(true);
        expect(state.settings.snapRadioButtonEnabled).toBe(true);
    });
    it('initTimeline with snapRadioButtonEnabled set as false', () => {
        const state = timeline({
            settings: {
                snapRadioButtonEnabled: false
            }
        }, initTimeline(initConfig));
        expect(state.settings.showHiddenLayers).toBe(true);
        expect(state.settings.expandLimit).toBe(20);
        expect(state.settings.snapType).toBe('start');
        expect(state.settings.endValuesSupport).toBe(true);
        expect(state.settings.snapRadioButtonEnabled).toBe(false);
    });
    it('setSnapRadioButtonEnabled', () => {
        const state = timeline({
            settings: {
                snapRadioButtonEnabled: false
            }
        }, setSnapRadioButtonEnabled(true));
        expect(state.settings.snapRadioButtonEnabled).toBe(true);
    });
    it('setTimeLayers', () => {
        const layers = [{id: "TEST_LAYER", title: "TEST_LAYER", checked: true}];
        const state = timeline({
            settings: {
                snapRadioButtonEnabled: false
            }
        }, setTimeLayers(layers));
        expect(state.layers).toBeTruthy();
        expect(state.layers).toEqual(layers);
    });
    it('updateTimeLayersSetting', () => {
        const LAYER_ID = "TEST_LAYER";
        const layers = [{ [LAYER_ID]: { hideInTimeline: false}}];
        const state = timeline({
            settings: {
                snapRadioButtonEnabled: false
            },
            layers
        }, updateTimeLayersSetting("TEST_LAYER", false));
        expect(state.layers).toBeTruthy();
        expect(state.layers[0][LAYER_ID]).toBeTruthy();
        expect(state.layers[0][LAYER_ID].hideInTimeline).toBe(true);
    });
});
