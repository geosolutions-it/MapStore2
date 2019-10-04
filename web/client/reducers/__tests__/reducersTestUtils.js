/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

// mock functions to create state
const applyAction = (action, reducers, previousState) => Object.keys(reducers).reduce(
    (state, k) => ({
        ...state,
        [k]: reducers[k](previousState[k], action)
    }),
    {}
);
/**
 * Create a mocker for a particular reducer shape provider. It' useful to create a
 * state as the final result of an action sequence.
 * NOTE: if you dont provide any initialState, there will be implicitly triggered
 * an action of type "_!_DUMMY_ACTION_!_" to initialize the state with the defaults
 * for all the reducers.
 * ```javascript
 * import controls from '../reducers/controls';
 * import reducer2 from '../reducers/reducer2';
 * const mockedState = createStateMocker({ controls, reducer2})(action1, action2);
 * // mockState = {
 * //   controls: {...} // <-- output of controls reducer after action1 and action2
 * //   reducer2: {...} // <-- output of reducer2 reducer after action1 and action2
 * }
 *```
 * @param {object} reducers map of reducers
 * @param {object} initialState initial state
 * @returns {function} a function that gets actions as parameters (spreaded) and returns the state for the passed reducers
 */
export const createStateMocker = (reducers, initialState = createStateMocker(reducers, {})({type: "_!_DUMMY_ACTION_!_"})) => (...actions) =>
    actions.reduce((state, action) => applyAction(action, reducers, state), initialState);
