/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Undoable = require('redux-undo');
var assign = require('object-assign');

/*var undoable = Undoable.default;
var _isEqual = require('lodash/lang/isEqual');
var mapConfig = require('../reducers/config');
var undoableConfig = undoable(mapConfig, { filter: function filterState(action, currentState, previousState) {
    let bool = false;
    if (previousState && previousState.mapStateSource && previousState.mapStateSource === 'map'
            && previousState.center && previousState.zoom) {
        // Check geometry part
        bool = !(_isEqual(currentState.center, previousState.center) && currentState.zoom === previousState.zoom);
    }
    return bool;
}});*/
var mapConfigHistory = (reducer) => {
    return (state, action) => {
        let newState = reducer(state, action);
        let unredoState;
        // If undo modified the state we change mapStateSource
        if (action.type === Undoable.ActionTypes.UNDO && state.past.length > 0) {
            let mapC = assign({}, newState.present, {mapStateSource: "undoredo"});
            unredoState = assign({}, newState, {present: mapC});
        }else if (action.type === Undoable.ActionTypes.REDO && state.future.length > 0) {
            let mapC = assign({}, newState.present, {mapStateSource: "undoredo"});
            unredoState = assign({}, newState, {present: mapC});
        }
        return unredoState || newState;
    };
};

module.exports = mapConfigHistory;
