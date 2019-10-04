/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import { createStateMocker } from './reducersTestUtils';

describe('reducerTestUtils', () => {
    describe('createStateMocker', () => {
        const ACTION_TYPE_1 = "MOCK_SAMPLE_ACTION_1";
        const ACTION_TYPE_2 = "MOCK_SAMPLE_ACTION_2";
        const STATE_OF_INITIAL_STATE = { "some": "initial state" }; // sample state for the initialState reducer (sorry for the repetition ;)
        const actionCreator1 = () => ({ type: ACTION_TYPE_1 });
        const actionCreator2 = (value) => ({ type: ACTION_TYPE_2, value});
        const reducers = {
            initialState: (state = STATE_OF_INITIAL_STATE) => state, // the state is always initialState.
            lastAction: (state, action) => action, // the state is always last action passed
            simpleReducer: (state, action = {}) => action.type === ACTION_TYPE_2 ? action.value : state
        };
        it('without initial value', () => {
            const mocker = createStateMocker(reducers);
            expect(mocker(actionCreator1())).toEqual({
                initialState: STATE_OF_INITIAL_STATE,
                lastAction: actionCreator1(),
                simpleReducer: undefined
            });
            expect(mocker(actionCreator2("TEST"))).toEqual({
                initialState: STATE_OF_INITIAL_STATE,
                lastAction: actionCreator2("TEST"),
                simpleReducer: "TEST"
            });
            expect(mocker(actionCreator1(), actionCreator2("TEST"))).toEqual({
                initialState: STATE_OF_INITIAL_STATE,
                lastAction: actionCreator2("TEST"),
                simpleReducer: "TEST"
            });
        });
        it('with initial state', () => {
            const INITIAL_STATE = { "initialState": "initialized"};
            const mocker = createStateMocker(reducers, INITIAL_STATE);
            expect(mocker(actionCreator1())).toEqual({
                initialState: INITIAL_STATE.initialState,
                lastAction: actionCreator1(),
                simpleReducer: undefined
            });
            expect(mocker(actionCreator2("TEST"))).toEqual({
                initialState: INITIAL_STATE.initialState,
                lastAction: actionCreator2("TEST"),
                simpleReducer: "TEST"
            });
            expect(mocker(actionCreator1(), actionCreator2("TEST"))).toEqual({
                initialState: INITIAL_STATE.initialState,
                lastAction: actionCreator2("TEST"),
                simpleReducer: "TEST"
            });
        });
    });
});
