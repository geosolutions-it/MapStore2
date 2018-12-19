/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');

var dimension = require('../dimension');
const { updateLayerDimensionData, setCurrentTime, setCurrentOffset, moveTime } = require('../../actions/dimension');
const { layerDimensionDataSelectorCreator } = require('../../selectors/dimension');

describe('Test the dimension reducer', () => {
    it('external action', () => {
        const oldState = { something: "something"};
        const state = dimension(oldState, {type: "NO_ACTION"});
        expect(state).toBe(oldState);
    });
    it('dimension updateLayerDimensionData', () => {
        const action = updateLayerDimensionData("TEST_LAYER", "time", {
            name: "time",
            domain: "123--123"
        });
        const state = dimension( undefined, action);
        expect(state).toExist();
        expect(layerDimensionDataSelectorCreator("TEST_LAYER", "time")( {
            dimension: state
        }).name).toBe("time");
    });
    it('removing a layer-related data from dimensin state', () => {
        const action = {
            type: 'REMOVE_NODE',
            node: 'sample1'
        };
        const initialState = {
            currentTime: '00:00:00z',
            data: {
                dimension1: { sample1: {}, sample2: {}},
                dimension2: { sample2: {}}
            }
        };
        const state = dimension(initialState, action);
        expect(state).toExist();
        expect(layerDimensionDataSelectorCreator('sample1', 'dimension1')( {
            dimension: state
        })).toNotExist();
        expect(layerDimensionDataSelectorCreator('sample2', 'dimension1')( {
            dimension: state
        })).toExist();
    });
    it('removing a layer when there is no data in dimension state', () => {
        const action = {
            type: 'REMOVE_NODE',
            node: 'sample'
        };
        const initialState = {
            currentTime: '00:00:00z'
        };
        const state = dimension(initialState, action);
        expect(state).toExist();
    });
    it('reset dimension data when switch to a new map', () => {
        const action = {
            type: 'RESET_CONTROLS'
        };
        const initialState = {
            currentTime: '00:00:00z'
        };
        const state = dimension(initialState, action);
        expect(state).toExist();
        expect(state.currentTime).toNotExist();
    });
    it('setCurrentTime', () => {
        const NEXT_TIME = '2016-09-03T00:00:00.000Z';
        const action = setCurrentTime(NEXT_TIME);
        const state = dimension( undefined, action);
        expect(state).toExist();
        expect(state.currentTime).toBe(NEXT_TIME);
    });
    it('setCurrentOffset', () => {
        const NEXT_TIME = '2016-09-03T00:00:00.000Z';
        const action = setCurrentOffset(NEXT_TIME);
        const state = dimension(undefined, action);
        expect(state).toExist();
        expect(state.offsetTime).toBe(NEXT_TIME);
    });
    it('moveTime', () => {
        const d = {
            currentTime: '2016-09-01T00:00:00.000Z'
        };
        const NEXT_TIME = '2016-09-03T00:00:00.000Z';
        const action = moveTime(NEXT_TIME);
        const state = dimension(d, action);
        expect(state).toExist();
        expect(state.currentTime).toBe(NEXT_TIME);
        expect(state.offsetTime).toNotExist();
    });
    it('moveTime with offset', () => {
        const d = {
            currentTime: '2016-09-01T00:00:00.000Z',
            offsetTime: '2016-09-02T00:00:00.000Z'
        };
        const NEXT_TIME = '2016-09-03T00:00:00.000Z';
        const action = moveTime(NEXT_TIME);
        const state = dimension(d, action);
        expect(state).toExist();
        expect(state.currentTime).toBe(NEXT_TIME);
        // also offset time should shift of old offsetTime - currentTime from NEXT_TIME
        expect(state.offsetTime).toBe('2016-09-04T00:00:00.000Z');
    });

});
