/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const timeline = require('../timeline');
const {rangeDataLoaded, selectLayer, timeDataLoading, setCollapsed, setMapSync} = require('../../actions/timeline');
const { isCollapsed, isMapSync } = require('../../selectors/timeline');
const expect = require('expect');

describe('Test the timeline reducer', () => {
    it('change the layer histogram and rangedata', () => {
        const initialState = {
            rangeData: {
                layer1: { range: 'old range', histogram: 'old histogram'},
                layer2: { }
            }
        };
        const state = timeline(initialState, rangeDataLoaded('layer1', 'new Range', 'new histogram', 'domain'));
        expect(state).toBeTruthy();
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
        expect(state).toBeTruthy();
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
        expect(state).toBeTruthy();
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
        expect(state).toBeTruthy();
        expect(state.rangeData.layer1).toBeFalsy();

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
        expect(state).toBeTruthy();
        expect(state.rangeData.layer1).toBeFalsy();
        expect(state.selectedLayer).toBe('layer2');
        expect(state.rangeData.layer2).toBeTruthy();
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
        expect(state).toBeTruthy();
        expect(state.rangeData.layer1).toBeTruthy();
        expect(state.rangeData.layer2).toBeTruthy();
        expect(state.selectedLayer).toBeFalsy();
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
        expect(state).toBeTruthy();
        expect(state.rangeData).toBeFalsy();
        expect(state.selectedLayer).toBeFalsy();
    });
    it('setCollapsed action', () => {
        const action = setCollapsed(true);
        expect(isCollapsed({timeline: timeline(undefined, action)})).toBe(true);
    });
    it('setMapSync', () => {
        expect(isMapSync({timeline: timeline({}, setMapSync(true))})).toBe(true);
        expect(isMapSync({ timeline: timeline({}, setMapSync(false)) })).toBe(false);
    });
});
