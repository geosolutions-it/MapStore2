/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import * as ACTIONS from '../../actions/mapPopups';

import reducer from '../mapPopups';

const initialState = {popups: []};
describe('mapPopups reducer', () => {
    it('ADD POPUP ', () => {
        const state = reducer(initialState, ACTIONS.addPopup("id", {}, true));
        expect(state.popups).toExist();
        expect(state.popups.length).toBe(1);
        expect(state.popups[0].id).toBe("id");
    });
    it('REMOVE POPUP ', () => {
        let state = reducer(initialState, ACTIONS.addPopup("id", {}, true));
        expect(state.popups).toExist();
        expect(state.popups.length).toBe(1);
        expect(state.popups[0].id).toBe("id");
        state = reducer(state, ACTIONS.removePopup("id"));
        expect(state.popups).toExist();
        expect(state.popups.length).toBe(0);
    });
    it('REMOVE POPUP ', () => {
        let state = reducer(initialState, ACTIONS.addPopup("id", {}, false));
        state = reducer(state, ACTIONS.addPopup("id-2", {}, false));
        expect(state.popups).toExist();
        expect(state.popups.length).toBe(2);
        state = reducer(state, ACTIONS.cleanPopups());
        expect(state.popups).toExist();
        expect(state.popups.length).toBe(0);
    });

});
