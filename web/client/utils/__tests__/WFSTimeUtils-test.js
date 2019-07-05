/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {addTimeParameter} from '../WFSTimeUtils';

import featuregrid from '../../reducers/featuregrid';
import layers from '../../reducers/layers';

import { setLayer, setTimeSync } from '../../actions/featuregrid';
import dimension from '../../reducers/dimension';
import { addLayer, changeLayerParams } from '../../actions/layers';
import { updateLayerDimensionData } from '../../actions/dimension';


// mock functions to create state (TODO: externalize in some test utils)
const applyAction = (action, reducers, previousState) => Object.keys(reducers).reduce(
    (state, k) => ({
        ...state,
        [k]: reducers[k](previousState[k], action)
    }),
    {}
);
const mockState = (reducers, initialState = {}) => (...actions) =>
    actions.reduce((state, action) => applyAction(action, reducers, state), initialState);


// TEST DATA
const LAYER_ID = "LAYER";
const T1 = "2019-07-02T13:19:23";
const TEST_URL_OPTIONS = {
    url: "test-url",
    options: {
        some: "option"
    }
};

const BASE_STATE = mockState({ featuregrid, dimension, layers })(
    addLayer({id: LAYER_ID, type: "wms"}),
    updateLayerDimensionData(LAYER_ID, "time", {type: "something"}),
    setLayer(LAYER_ID),
);
const TIME_STATE = mockState({ featuregrid, dimension, layers}, BASE_STATE)(
    changeLayerParams(LAYER_ID, {
        time: T1
    })
);
const TIME_ENABLED_STATE = mockState({ featuregrid, dimension, layers }, TIME_STATE)(
    setTimeSync(true)
);

describe('WFSTimeUtils', () => {
    describe('addTimeParameter', () => {
        it('do nothing with no time set', () => {
            expect(addTimeParameter(TEST_URL_OPTIONS.url, TEST_URL_OPTIONS.options, BASE_STATE)).toEqual(TEST_URL_OPTIONS);
        });
        it('do nothing with time set but sync disabled', () => {
            expect(addTimeParameter(TEST_URL_OPTIONS.url, TEST_URL_OPTIONS.options, TIME_STATE)).toEqual(TEST_URL_OPTIONS);
        });
        it('change URL with time set and sync active', () => {
            expect(addTimeParameter(TEST_URL_OPTIONS.url, TEST_URL_OPTIONS.options, TIME_ENABLED_STATE)).toEqual({
                ...TEST_URL_OPTIONS,
                url: `${TEST_URL_OPTIONS.url}?time=${encodeURIComponent(T1)}`
            });
        });
    });

});
