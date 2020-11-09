/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import undoable, {ActionTypes} from 'redux-undo';
import { isEqual } from 'lodash';

import assign from 'object-assign';

const mapConfigHistoryUtil = (reducer) => {
    return (state, action) => {
        let newState = reducer(state, action);
        let unredoState;
        // If undo modified the state we change mapStateSource
        if (action.type === ActionTypes.UNDO && state.past.length > 0) {
            let mapC = assign({}, newState.present, {mapStateSource: "undoredo", style: state.present.style, resize: state.present.resize});
            unredoState = assign({}, newState, {present: mapC});
        } else if (action.type === ActionTypes.REDO && state.future.length > 0) {
            let mapC = assign({}, newState.present, {mapStateSource: "undoredo", style: state.present.style, resize: state.present.resize});
            unredoState = assign({}, newState, {present: mapC});
        }
        return unredoState || {past: newState.past, present: newState.present, future: newState.future};
    };
};


export const createHistory = (mapState) => {
    if (mapState && mapState.map && mapState.map.center) {
        return assign({}, mapState, {
            map: {
                past: [],
                present: mapState.map,
                future: []
            }
        });
    }
    return mapState;
};

export const mapConfigHistory = (reducer) => mapConfigHistoryUtil(undoable(reducer, {
    filter: (action, currentState, previousState) => {
        let bool = false;
        if (previousState && previousState.mapStateSource && previousState.mapStateSource === 'map'
                && previousState.center && previousState.zoom !== undefined) {
            // Check geometry part
            bool = !(isEqual(currentState.center, previousState.center) && currentState.zoom === previousState.zoom);
        }
        return bool;
    }
}));
